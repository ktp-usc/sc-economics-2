import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EXPERTISE_THEME, type Expertise } from "@/lib/types";
import { getAuthenticatedStaff } from "@/lib/auth";

// ── Auth guard ──────────────────────────────────────────────────────────────
function unauthorized(msg = "Unauthorized. Staff session required.") {
    return NextResponse.json({ error: msg }, { status: 401 });
}

// Returns true when the caller is an admin or manager
async function isStaffSession(): Promise<boolean> {
    const staff = await getAuthenticatedStaff();
    return staff !== null;
}

// ── P2025 helper (record not found) ────────────────────────────────────────
function isPrismaNotFound(err: unknown): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2025"
    );
}

// ── Allowed enum values — Prisma keys (not @map display values) ────────────
const EVENT_TYPES  = ["Teaching", "Workshop", "Event"] as const;
const AGE_GROUPS   = ["K_5", "G6_8", "G9_12"]         as const;
const EXPERTISES   = ["Finance", "Teaching", "Technology", "Business", "Outreach"] as const;
const CITIES       = ["Columbia", "Greenville", "Charleston", "Spartanburg", "Rock_Hill", "Aiken", "Myrtle_Beach"] as const;

function withTheme(event: { expertise: Expertise; [key: string]: unknown }) {
    return { ...event, ...EXPERTISE_THEME[event.expertise] };
}

// ── PATCH /api/events/[id] ──────────────────────────────────────────────────
/**
 * Staff (admin or manager) - partially updates an event.
 * Accepts any subset of the writable fields.
 * Re-derives gradient + emoji on the response when expertise changes.
 * gradient + emoji are NOT stored in the DB.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isStaffSession()) return unauthorized();

    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
        return NextResponse.json({ error: "id must be an integer." }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { title, description, venue, city, type, ageGroup, expertise, date, spotsTotal } = body;

        // ── Validate only the fields that were actually sent ───────────────
        if (type      !== undefined && !EVENT_TYPES.includes(type)) {
            return NextResponse.json({ error: `type must be one of: ${EVENT_TYPES.join(", ")}.` }, { status: 400 });
        }
        if (ageGroup  !== undefined && !AGE_GROUPS.includes(ageGroup)) {
            return NextResponse.json({ error: `ageGroup must be one of: ${AGE_GROUPS.join(", ")}.` }, { status: 400 });
        }
        if (expertise !== undefined && !EXPERTISES.includes(expertise)) {
            return NextResponse.json({ error: `expertise must be one of: ${EXPERTISES.join(", ")}.` }, { status: 400 });
        }
        if (city      !== undefined && !CITIES.includes(city)) {
            return NextResponse.json({ error: `city must be one of: ${CITIES.join(", ")}.` }, { status: 400 });
        }
        if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json({ error: "date must be in YYYY-MM-DD format." }, { status: 400 });
        }
        if (spotsTotal !== undefined && (!Number.isInteger(spotsTotal) || spotsTotal < 1)) {
            return NextResponse.json({ error: "spotsTotal must be a positive integer." }, { status: 400 });
        }

        const event = await db.event.update({
            where: { id: numericId },
            data: {
                ...(title       !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(venue       !== undefined && { venue }),
                ...(city        !== undefined && { city }),
                ...(type        !== undefined && { type }),
                ...(ageGroup    !== undefined && { ageGroup }),
                ...(expertise   !== undefined && { expertise }),
                ...(date        !== undefined && { date: new Date(date) }),
                ...(spotsTotal  !== undefined && { spotsTotal }),
                // gradient + emoji are NOT in the DB — derived on the way out
            },
        });

        return NextResponse.json(withTheme(event), { status: 200 });
    } catch (err) {
        if (isPrismaNotFound(err)) {
            return NextResponse.json({ error: `Event with id ${id} not found.` }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
    }
}

// ── DELETE /api/events/[id] ─────────────────────────────────────────────────
/**
 * Staff (admin or manager) - permanently deletes an event.
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isStaffSession()) return unauthorized();

    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
        return NextResponse.json({ error: "id must be an integer." }, { status: 400 });
    }

    try {
        await db.event.delete({ where: { id: numericId } });
        return NextResponse.json({ message: `Event ${id} deleted successfully.` }, { status: 200 });
    } catch (err) {
        if (isPrismaNotFound(err)) {
            return NextResponse.json({ error: `Event with id ${id} not found.` }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
    }
}