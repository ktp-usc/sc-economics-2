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

  // Neon Auth user ID is stored as a string in VolunteerHours.userId
  const userId = (session.user as { id?: string }).id ?? "";

  const hours = await db.volunteerHours.findMany({
    where: { userId },
    include: {
      event: { select: { id: true, title: true, date: true, venue: true, city: true } },
    },
    orderBy: { loggedAt: "desc" },
  });

  // Also return a computed total so the client doesn't have to sum it
  const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);

  return NextResponse.json({ hours, totalHours });
}
