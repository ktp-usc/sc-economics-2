export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedStaff } from "@/lib/auth";
import { ApplicationStatus } from "@prisma/client";

const VALID_STATUSES = new Set<ApplicationStatus>([
    "pending",
    "approved",
    "denied",
]);

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // ── 1. Auth check (admin or manager) ───────────────────────────────────
    const staff = await getAuthenticatedStaff();
    if (!staff) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse & validate body ─────────────────────────────────────────────
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Request body must be valid JSON" },
            { status: 400 }
        );
    }

    if (
        typeof body !== "object" ||
        body === null ||
        !("status" in body)
    ) {
        return NextResponse.json(
            { error: "Missing required field: status" },
            { status: 400 }
        );
    }

    const { status } = body as Record<string, unknown>;

    if (typeof status !== "string" || !VALID_STATUSES.has(status as ApplicationStatus)) {
        return NextResponse.json(
            {
                error: `Invalid status. Must be one of: ${[...VALID_STATUSES].join(", ")}`,
            },
            { status: 400 }
        );
    }

    // ── 3. Resolve dynamic route param ───────────────────────────────────────
    const { id } = await params;

    // ── 4. Persist to database ───────────────────────────────────────────────
    try {
        const application = await prisma.application.update({
            where: { id: Number(id) },
            data: { status: status as ApplicationStatus },
        });

        return NextResponse.json({ data: application }, { status: 200 });
    } catch (err: unknown) {
        if (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            (err as { code: string }).code === "P2025"
        ) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        console.error("[PATCH /api/applications/[id]]", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}