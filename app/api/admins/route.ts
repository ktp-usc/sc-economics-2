import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

/**
 * GET /api/admins
 * Admin only — lists all staff accounts (admin + manager).
 */
export async function GET() {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const staff = await db.user.findMany({
        where: { role: { in: ["admin", "manager"] } },
        select: { id: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff, { status: 200 });
}

/**
 * POST /api/admins
 * Admin only — assigns a role (admin or manager) to an existing account by email.
 * Body: { email, role }
 *
 * If the email has a Prisma User record, its role is updated.
 * If not, a new User record is created with the given role (the Neon Auth
 * account must already exist — this endpoint does not create auth accounts).
 */
export async function POST(req: NextRequest) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const { email, role } = body as Record<string, unknown>;

    if (typeof email !== "string" || !email.trim()) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (role !== "admin" && role !== "manager") {
        return NextResponse.json({ error: "Role must be \"admin\" or \"manager\"." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent changing your own role
    if (normalizedEmail === admin.email) {
        return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });

    let user;
    if (existing) {
        if (existing.role === role) {
            return NextResponse.json(
                { error: `This account is already a ${role}.` },
                { status: 409 },
            );
        }
        user = await db.user.update({
            where: { email: normalizedEmail },
            data: { role },
            select: { id: true, email: true, role: true, createdAt: true },
        });
    } else {
        // Create a new User record with the specified role.
        // The person must already have a Neon Auth account (created via sign-up).
        user = await db.user.create({
            data: { email: normalizedEmail, role },
            select: { id: true, email: true, role: true, createdAt: true },
        });
    }

    return NextResponse.json(user, { status: 200 });
}
