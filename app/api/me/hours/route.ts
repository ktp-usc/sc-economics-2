import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

/**
 * GET /api/me/hours
 *
 * Returns the logged-in user's volunteer hours logs with
 * event details included. Ordered by loggedAt descending.
 *
 * Requires authentication - returns 401 if not logged in.
 */
export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Query by email since that's the reliable identifier stored by admins
  const userEmail = (session.user as { email?: string }).email ?? "";

  const hours = await db.volunteerHours.findMany({
    where: { userEmail },
    include: {
      event: { select: { id: true, title: true, date: true, venue: true, city: true } },
    },
    orderBy: { loggedAt: "desc" },
  });

  // Also return a computed total so the client doesn't have to sum it
  const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);

  return NextResponse.json({ hours, totalHours });
}
