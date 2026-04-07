/**
 * Route-protection proxy (Neon Auth)
 *
 * Next.js 16 uses "proxy.ts" instead of the older "middleware.ts".
 *
 * How it works:
 *   1. The Neon Auth middleware validates the session cookie on every
 *      matched request and refreshes expired tokens automatically.
 *   2. If a user hits a protected route without a valid session they
 *      are redirected to /login.
 *   3. Public routes (/, /login, /api/auth/*, static assets) are
 *      excluded via the `matcher` so they bypass this entirely.
 */

import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

/**
 * matcher — controls which paths the middleware runs on.
 *
 * We protect everything EXCEPT:
 *   - Next.js internals (_next/static, _next/image)
 *   - The favicon
 *   - The home page (/)
 *   - The login page (/login)
 *   - The auth API routes (/api/auth/*)
 *   - Public images (e.g. /SC-Econ-logo.png)
 */
export const config = {
  matcher: [
    "/volunteer/:path*",
    "/events/:path*",
    "/portal/:path*",
    "/admin/:path*",
  ],
};
