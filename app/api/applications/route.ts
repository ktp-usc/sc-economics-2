import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/auth";
import { auth } from "@/lib/auth/server";

/**
 * GET /api/applications
 * Staff (admin or manager) - returns all applications, optionally filtered by ?status=
 */
export async function GET(req: NextRequest) {
    const staff = await getAuthenticatedStaff();
    if (!staff) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const applications = await db.application.findMany({
        where: status ? { status: status as never } : undefined,
        orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(applications, { status: 200 });
}

export async function POST(req: NextRequest) {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

    const {
        firstName, lastName, email, phone,
        street, city, state, zip,
        availability, skills, experience, motivation,
        backgroundConsent, dataConsent,
    } = body as Record<string, unknown>;

    // Required field validation
    const missing: string[] = [];
    if (!firstName || typeof firstName !== "string" || !firstName.trim()) missing.push("firstName");
    if (!lastName  || typeof lastName  !== "string" || !lastName.trim())  missing.push("lastName");
    if (!email     || typeof email     !== "string" || !email.trim())     missing.push("email");
    if (!phone     || typeof phone     !== "string" || !phone.trim())     missing.push("phone");
    if (!street    || typeof street    !== "string" || !street.trim())    missing.push("street");
    if (!city      || typeof city      !== "string" || !city.trim())      missing.push("city");
    if (!state     || typeof state     !== "string" || !state.trim())     missing.push("state");
    if (!zip       || typeof zip       !== "string" || !zip.trim())       missing.push("zip");
    if (!skills    || typeof skills    !== "string" || !skills.trim())    missing.push("skills");
    if (!motivation || typeof motivation !== "string" || !motivation.trim()) missing.push("motivation");
    if (!Array.isArray(availability) || availability.length === 0)        missing.push("availability");

    if (missing.length > 0) {
        return NextResponse.json(
            { error: "Missing required fields", fields: missing },
            { status: 400 }
        );
    }

    // Format validation
    const emailStr = (email as string).trim();
    const phoneStr = (phone as string).trim();
    const zipStr   = (zip as string).trim();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
    const ZIP_RE   = /^\d{5}(-\d{4})?$/;
    const formatErrors: string[] = [];
    if (!EMAIL_RE.test(emailStr)) formatErrors.push("Invalid email address");
    if (!PHONE_RE.test(phoneStr)) formatErrors.push("Invalid phone number");
    if (!ZIP_RE.test(zipStr))     formatErrors.push("Invalid ZIP code");
    if (formatErrors.length > 0) {
        return NextResponse.json({ error: formatErrors.join(". ") }, { status: 400 });
    }

    // Consent fields are required server-side
    if (backgroundConsent !== true) {
        return NextResponse.json(
            { error: "Background check consent is required" },
            { status: 400 }
        );
    }
    if (dataConsent !== true) {
        return NextResponse.json(
            { error: "Data consent is required" },
            { status: 400 }
        );
    }

    // Validate availability values are strings
    if (!(availability as unknown[]).every((d) => typeof d === "string")) {
        return NextResponse.json({ error: "Invalid availability format" }, { status: 400 });
    }

    // Check for an existing application by this email
    const existing = await db.application.findFirst({
        where: { email: emailStr },
        select: { id: true, status: true },
        orderBy: { appliedAt: "desc" },
    });

    if (existing) {
        if (existing.status === "approved") {
            return NextResponse.json({ error: "Your application has already been approved." }, { status: 409 });
        }
        if (existing.status === "pending") {
            return NextResponse.json({ error: "You already have a pending application under review." }, { status: 409 });
        }
    }

    const applicationData = {
        firstName:       (firstName as string).trim(),
        lastName:        (lastName as string).trim(),
        email:           emailStr,
        phone:           phoneStr,
        street:          (street as string).trim(),
        city:            (city as string).trim(),
        state:           (state as string).trim(),
        zip:             zipStr,
        availableDays:   availability as string[],
        skills:          (skills as string).trim(),
        experience:      typeof experience === "string" && experience.trim() ? experience.trim() : null,
        motivation:      (motivation as string).trim(),
        backgroundCheck: true,
        dataConsent:     true,
        status:          "pending" as const,
        appliedAt:       new Date(),
    };

    try {
        // If a denied application exists, update it back to pending with new data.
        // Otherwise create a fresh application.
        const application = existing
            ? await db.application.update({ where: { id: existing.id }, data: applicationData })
            : await db.application.create({ data: applicationData });

        return NextResponse.json({ data: application }, { status: 201 });
    } catch (err) {
        console.error("Failed to save application:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
