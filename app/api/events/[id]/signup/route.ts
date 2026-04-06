import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Verify the user is authenticated via Neon Auth session
    const { data: session } = await auth.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the event id from the URL but bail early if someone passes garbage
    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
        return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    // Parse the request body, req.json() throws on malformed JSON
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { why, fromTime, toTime, certificate, expertise } = body as Record<string, unknown>;

    // Collect all missing fields at once so the client gets a useful error
    const missing: string[] = [];
    if (!why || typeof why !== "string" || !why.trim()) missing.push("why");
    if (!fromTime || typeof fromTime !== "string" || !fromTime.trim()) missing.push("fromTime");
    if (!toTime || typeof toTime !== "string" || !toTime.trim()) missing.push("toTime");
    if (certificate === undefined || certificate === null) missing.push("certificate");

    if (missing.length > 0) {
        return NextResponse.json({ error: "Missing required fields", fields: missing }, { status: 400 });
    }

    try {
        // Make sure the event actually exists before trying to sign up
        const event = await db.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Expertise is optional, so store null instead of an empty string
        const signup = await db.eventSignup.create({
            data: {
                eventId,
                why: (why as string).trim(),
                fromTime: (fromTime as string).trim(),
                toTime: (toTime as string).trim(),
                certificate: certificate === true || certificate === "yes",
                expertise: typeof expertise === "string" && expertise.trim() ? expertise.trim() : null,
            },
        });

        return NextResponse.json({ data: signup }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
