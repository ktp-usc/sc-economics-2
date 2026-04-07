import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
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

    try {
        const application = await db.application.create({
            data: {
                firstName:         (firstName as string).trim(),
                lastName:          (lastName as string).trim(),
                email:             (email as string).trim(),
                phone:             (phone as string).trim(),
                street:            (street as string).trim(),
                city:              (city as string).trim(),
                state:             (state as string).trim(),
                zip:               (zip as string).trim(),
                availableDays:     availability as string[],
                skills:            (skills as string).trim(),
                experience:        typeof experience === "string" && experience.trim() ? experience.trim() : null,
                motivation:        (motivation as string).trim(),
                backgroundCheck:   true,
                dataConsent:       true,
            },
        });

        return NextResponse.json({ data: application }, { status: 201 });
    } catch (err) {
        console.error("Failed to save application:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
