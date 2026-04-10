import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/auth";

function unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Checks that the current session belongs to an admin or manager.
 * Returns an error response if not, or null if authorized.
 */
async function requireStaff() {
    const staff = await getAuthenticatedStaff();
    if (!staff) return unauthorized();
    return null;
}

/**
 * GET /api/volunteers/hours
 * Staff (admin or manager) - returns all hours logs, optionally filtered by ?userId=
 */
export async function GET(req: NextRequest) {
    const err = await requireStaff();
    if (err) return err;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const logs = await db.volunteerHours.findMany({
        where: userId ? { userId } : undefined,
        include: { event: { select: { id: true, title: true, date: true } } },
        orderBy: { loggedAt: "desc" },
    });

    return NextResponse.json(logs, { status: 200 });
}

/**
 * POST /api/volunteers/hours
 * Staff (admin or manager) - log hours for a volunteer completing an event.
 * Body: { userId, userEmail, eventId, hours, note? }
 */
export async function POST(req: NextRequest) {
    const err = await requireStaff();
    if (err) return err;

    try {
        const body = await req.json();
        const { userId, userEmail, eventId, hours, note } = body;

        if (!userId || !userEmail || !eventId || hours === undefined) {
            return NextResponse.json(
                { error: "userId, userEmail, eventId, and hours are required." },
                { status: 400 }
            );
        }
        if (typeof hours !== "number" || hours <= 0) {
            return NextResponse.json({ error: "hours must be a positive number." }, { status: 400 });
        }

        const event = await db.event.findUnique({ where: { id: Number(eventId) } });
        if (!event) {
            return NextResponse.json({ error: "Event not found." }, { status: 404 });
        }

        const log = await db.volunteerHours.create({
            data: {
                userId,
                userEmail,
                eventId: Number(eventId),
                hours,
                note: note ?? null,
            },
            include: { event: { select: { id: true, title: true, date: true } } },
        });

        return NextResponse.json(log, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to log hours." }, { status: 500 });
    }
}

/**
 * DELETE /api/volunteers/hours?id=
 * Staff (admin or manager) - remove a specific hours log entry.
 */
export async function DELETE(req: NextRequest) {
    const err = await requireStaff();
    if (err) return err;

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

    try {
        await db.volunteerHours.delete({ where: { id } });
        return NextResponse.json({ message: "Hours log deleted." }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Log not found or already deleted." }, { status: 404 });
    }
}