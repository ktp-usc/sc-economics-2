/**
 * Route-protection proxy (Next.js 16 — replaces middleware.ts)
 *
 * Two-layer protection:
 *
 *  1. Authentication — auth.middleware() validates the Neon Auth session
 *     cookie on every matched request and redirects unauthenticated users
 *     to /login.  It also refreshes expired tokens automatically.
 *
 *  2. Role authorisation — for staff-only routes (/admin, /manager) we
 *     call /api/me to retrieve the role from the database.  Authenticated
 *     volunteers are redirected to /portal instead of being blocked with a
 *     hard 401, which keeps the UX smooth.
 *
 * Public routes (/, /login, /api/auth/*, static assets) are excluded via
 * the `matcher` so they bypass this entirely.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

/**
 * Routes where a staff role (admin or manager) is required.
 * Authenticated volunteers on these paths are redirected to /portal.
 */
const STAFF_ONLY_ROUTES = ["/admin", "/manager"];

const authMiddleware = auth.middleware({ loginUrl: "/login" });

function matchesRoute(routes: string[], pathname: string): boolean {
    return routes.some(
        (r) => pathname === r || pathname.startsWith(r + "/"),
    );
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
    // Step 1 — run base auth check.
    // Returns NextResponse.next() for authenticated requests, or a redirect
    // to /login for unauthenticated ones (also handles token refresh / OAuth).
    const authResponse = await authMiddleware(request);

    // If auth middleware issued a redirect (e.g. to /login), honour it.
    if (authResponse.headers.has("location")) {
        return authResponse;
    }

    // Step 2 — role & application gates.
    const { pathname } = request.nextUrl;
    const needsRoleCheck =
        matchesRoute(STAFF_ONLY_ROUTES, pathname) ||
        matchesRoute(["/volunteer"], pathname);

    if (needsRoleCheck) {
        try {
            const meRes = await fetch(new URL("/api/me", request.url), {
                headers: { cookie: request.headers.get("cookie") ?? "" },
            });

            if (!meRes.ok) {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            const me = (await meRes.json()) as {
                role: string;
                hasApplication: boolean;
                applicationStatus: string | null;
            };

            // Block the apply page only if the user has a pending or approved application.
            // Denied users are allowed to reapply.
            if (
                matchesRoute(["/volunteer"], pathname) &&
                me.hasApplication &&
                me.applicationStatus !== "denied"
            ) {
                return NextResponse.redirect(new URL("/portal", request.url));
            }

            if (
                matchesRoute(STAFF_ONLY_ROUTES, pathname) &&
                me.role === "volunteer"
            ) {
                // Volunteers don't have staff access; send them to their portal.
                return NextResponse.redirect(new URL("/portal", request.url));
            }
        } catch {
            // If the role lookup fails on a staff-only route, deny access
            // rather than risking a volunteer reaching /admin or /manager.
            if (matchesRoute(STAFF_ONLY_ROUTES, pathname)) {
                return NextResponse.redirect(new URL("/portal", request.url));
            }
        }
    }

    return authResponse;
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/manager/:path*",
        "/portal/:path*",
        "/events/:path*",
        "/volunteer/:path*",
    ],
};
