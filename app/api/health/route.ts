import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * GET /api/health
 *
 * Public health-check endpoint — no authentication required.
 * Pings the database with a lightweight query (`SELECT 1`) and returns
 * connectivity status, a timestamp, and round-trip latency in milliseconds.
 *
 * Used by uptime monitors, deployment pipelines, and manual debugging.
 *
 * Returns:
 *   200 — { status: "ok",    db: "connected",    timestamp, latency_ms }
 *   503 — { status: "error", db: "disconnected",  timestamp }
 */
export async function GET() {
  // Capture the start time so we can measure DB round-trip latency
  const start = Date.now();

  try {
    // Minimal query that confirms the DB connection is alive
    // without touching any application tables
    await db.$queryRaw(Prisma.sql`SELECT 1`);

    return NextResponse.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
      latency_ms: Date.now() - start,
    });
  } catch {
    // If the query fails for any reason (network, credentials, DB down),
    // return 503 so monitors can alert on it
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
