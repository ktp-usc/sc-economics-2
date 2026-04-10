import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

/**
 * DELETE /api/admins/[id]
 * Admin only — revokes staff privileges by setting the user's role back to
 * "volunteer". The Prisma User record and Neon Auth account are preserved.
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

    // Prevent revoking your own access
    if (numericId === admin.id) {
        return NextResponse.json({ error: "You cannot revoke your own staff access." }, { status: 400 });
    }

    try {
        await db.user.update({
            where: { id: numericId },
            data: { role: "volunteer" },
        });
        return NextResponse.json({ message: "Staff access revoked." }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
}
