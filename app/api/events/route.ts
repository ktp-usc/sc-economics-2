import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/auth";

const EVENT_TYPES  = ["Teaching", "Workshop", "Event"] as const;
const AGE_GROUPS   = ["K_5", "G6_8", "G9_12"]         as const;
const EXPERTISES   = ["Finance", "Teaching", "Technology", "Business", "Outreach"] as const;
const CITIES       = ["Columbia", "Greenville", "Charleston", "Spartanburg", "Rock_Hill", "Aiken", "Myrtle_Beach"] as const;

/**
 * GET /api/events
 * Public — returns all events ordered by date ascending.
 */
export async function GET() {
    const events = await db.event.findMany({ orderBy: { date: "asc" } });
    return NextResponse.json(events, { status: 200 });
}

/**
 * POST /api/events
 * Staff (admin or manager) - creates a new event.
 */
export async function POST(req: NextRequest) {
    const staff = await getAuthenticatedStaff();
    if (!staff) {
        return NextResponse.json({ error: "Unauthorized. Staff role required." }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const {
        title, description, venue, city, type, ageGroup, expertise, date, spotsTotal,
    } = body as Record<string, unknown>;

    if (!title || !description || !venue || !city || !type || !ageGroup || !expertise || !date || spotsTotal === undefined) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!EVENT_TYPES.includes(type as never)) {
        return NextResponse.json({ error: `type must be one of: ${EVENT_TYPES.join(", ")}.` }, { status: 400 });
    }
    if (!AGE_GROUPS.includes(ageGroup as never)) {
        return NextResponse.json({ error: `ageGroup must be one of: ${AGE_GROUPS.join(", ")}.` }, { status: 400 });
    }
    if (!EXPERTISES.includes(expertise as never)) {
        return NextResponse.json({ error: `expertise must be one of: ${EXPERTISES.join(", ")}.` }, { status: 400 });
    }
    if (!CITIES.includes(city as never)) {
        return NextResponse.json({ error: `city must be one of: ${CITIES.join(", ")}.` }, { status: 400 });
    }
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "date must be in YYYY-MM-DD format." }, { status: 400 });
    }
    const spots = Number(spotsTotal);
    if (!Number.isInteger(spots) || spots < 1) {
        return NextResponse.json({ error: "spotsTotal must be a positive integer." }, { status: 400 });
    }

    try {
        const event = await db.event.create({
            data: {
                title:       String(title).trim(),
                description: String(description).trim(),
                venue:       String(venue).trim(),
                city:        city as never,
                type:        type as never,
                ageGroup:    ageGroup as never,
                expertise:   expertise as never,
                date:        new Date(date),
                spotsTotal:  spots,
            },
        });
        return NextResponse.json(event, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
    }
}
