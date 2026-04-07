import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Returns the Prisma User record if the current Neon Auth session belongs
 * to an admin, otherwise returns null.
 *
 * Works in Server Components, API Routes, and Server Actions.
 */
export async function getAuthenticatedAdmin(): Promise<User | null> {
    const { data: session } = await auth.getSession();
    if (!session?.user) return null;

    const email = (session.user as { email?: string }).email;
    if (!email) return null;

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.role !== "admin") return null;

    return user;
}
