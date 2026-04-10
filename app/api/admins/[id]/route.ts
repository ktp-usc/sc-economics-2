import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

/**
 * DELETE /api/admins/[id]
 * Admin only — removes admin privileges (deletes Prisma User record).
 * Managers receive 403. The Neon Auth account remains; the user simply loses admin access.
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
        return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    // Prevent self-deletion
    if (numericId === admin.id) {
        return NextResponse.json({ error: "Cannot remove your own admin account." }, { status: 400 });
    }

    try {
        await db.user.delete({ where: { id: numericId } });
        return NextResponse.json({ message: "Admin account removed." }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }
}