import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
        return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { why } = body as Record<string, unknown>;

    if (!why || typeof why !== "string" || !why.trim()) {
        return NextResponse.json({ error: "Missing required fields", fields: ["why"] }, { status: 400 });
    }

    // Require an approved volunteer application before signing up
    const userEmail = (session.user as { email?: string }).email ?? "";
    const application = await db.application.findFirst({
        where: { email: userEmail, status: "approved" },
        select: { id: true },
    });
    if (!application) {
        return NextResponse.json(
            { error: "Your volunteer application must be approved before you can sign up for events." },
            { status: 403 },
        );
    }

    try {
        const event = await db.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Block signups for past events
        if (event.date < new Date()) {
            return NextResponse.json({ error: "This event has already passed" }, { status: 400 });
        }

        // Block signups for full events
        if (event.spotsFilled >= event.spotsTotal) {
            return NextResponse.json({ error: "This event is full" }, { status: 400 });
        }

        // Prevent duplicate signups
        const existing = await db.eventSignup.findFirst({
            where: { eventId, userId },
        });
        if (existing) {
            return NextResponse.json({ error: "Already signed up for this event" }, { status: 409 });
        }

        const [signup] = await db.$transaction([
            db.eventSignup.create({
                data: {
                    userId: session.user.id,
                    eventId,
                    why: (why as string).trim(),
                    fromTime: "",
                    toTime: "",
                    certificate: false,
                },
            }),
            db.event.update({
                where: { id: eventId },
                data: { spotsFilled: { increment: 1 } },
            }),
        ]);

        return NextResponse.json({ data: signup }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
        return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    try {
        const existing = await db.eventSignup.findFirst({
            where: { eventId, userId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Not signed up for this event" }, { status: 404 });
        }

        await db.$transaction([
            db.eventSignup.delete({ where: { id: existing.id } }),
            db.event.update({
                where: { id: eventId },
                data: { spotsFilled: { decrement: 1 } },
            }),
        ]);

        return NextResponse.json({ message: "Signup withdrawn" }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
