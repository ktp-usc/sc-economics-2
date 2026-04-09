import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Role hierarchy for access control.
 * Higher index = more privileges. Used by hasMinimumRole() to compare
 * two roles without scattering string checks across every route.
 */
const ROLE_HIERARCHY: readonly string[] = ["volunteer", "manager", "admin"];

/**
 * Returns true when `userRole` is at or above `minimumRole` in the
 * hierarchy. For example, hasMinimumRole("admin", "manager") is true
 * because admin outranks manager.
 */
export function hasMinimumRole(userRole: string, minimumRole: string): boolean {
    return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole);
}

/**
 * Shared helper that resolves the current Neon Auth session to a Prisma
 * User record. Returns null when:
 *   - there is no active session
 *   - the session has no email
 *   - the email doesn't match a Prisma User row
 *   - the user's role is below `minimumRole`
 *
 * Centralizes the session-to-user lookup so API routes don't duplicate it.
 */
async function getAuthenticatedUserWithRole(
    minimumRole: string
): Promise<User | null> {
    const { data: session } = await auth.getSession();
    if (!session?.user) return null;

    const email = (session.user as { email?: string }).email;
    if (!email) return null;

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !hasMinimumRole(user.role, minimumRole)) return null;

    return user;
}

/**
 * Returns the Prisma User record if the current session belongs to an
 * admin, otherwise null. Use this for admin-only operations like
 * managing admin accounts.
 */
export async function getAuthenticatedAdmin(): Promise<User | null> {
    return getAuthenticatedUserWithRole("admin");
}

/**
 * Returns the Prisma User record if the current session belongs to an
 * admin or manager, otherwise null. Use this for day-to-day operations
 * like managing events, reviewing applications, and logging hours.
 */
export async function getAuthenticatedStaff(): Promise<User | null> {
    return getAuthenticatedUserWithRole("manager");
}
