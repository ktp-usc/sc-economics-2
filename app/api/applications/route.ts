import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export async function GET() {
    const session = await auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await db.application.findMany({
        orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({ applications }, { status: 200 });
}