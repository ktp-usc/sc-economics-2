import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { auth } from "@/lib/auth/server";

/**
 * GET /api/admins
 * Admin only — lists all admin accounts.
 */
export async function GET() {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admins = await db.user.findMany({
        where: { role: "admin" },
        select: { id: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(admins, { status: 200 });
}

/**
 * POST /api/admins
 * Admin only — creates a new admin account.
 * Body: { email, password }
 */
export async function POST(req: NextRequest) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== "string" || !email.trim()) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing admin
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Register the account in Neon Auth
    const { error: authError } = await auth.signUp.email({
        email: normalizedEmail,
        password,
        name: normalizedEmail,
    });

    if (authError) {
        return NextResponse.json(
            { error: authError.message ?? "Failed to create Neon Auth account." },
            { status: 400 }
        );
    }

    // Create Prisma User record with admin role
    const newUser = await db.user.create({
        data: { email: normalizedEmail, role: "admin" },
        select: { id: true, email: true, createdAt: true },
    });

    return NextResponse.json(newUser, { status: 201 });
}
