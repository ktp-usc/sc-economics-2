import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

/**
 * GET /api/me
 * Returns the current session user's email, name, and role.
 * Role is looked up in the Prisma User table by email.
 * Users not in Prisma default to "volunteer".
 */
export async function GET() {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = session.user as { email?: string; name?: string };
    const email = user.email ?? "";

    const [prismaUser, application] = await Promise.all([
        db.user.findUnique({ where: { email } }),
        db.application.findFirst({ where: { email }, select: { id: true } }),
    ]);
    const role = prismaUser?.role ?? "volunteer";

    return NextResponse.json({
        email,
        name: user.name ?? null,
        role,
        hasApplication: !!application,
    });
}
