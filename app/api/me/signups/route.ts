import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

/**
 * GET /api/me/signups
 *
 * Returns the logged-in user's event signups along with the
 * associated event details. Ordered by event date descending
 * so the most recent events appear first.
 *
 * Requires authentication - returns 401 if not logged in.
 */
export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id ?? "";

  const signups = await db.eventSignup.findMany({
    where: { userId },
    include: {
      event: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(signups);
}
