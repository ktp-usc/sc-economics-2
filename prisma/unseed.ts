/**
 * prisma/unseed.ts
 *
 * Removes only seed-specific data from the database, leaving real user
 * data intact. Uses the identifiers in seed-identifiers.ts to target
 * seed records by email, title, and placeholder auth UUIDs.
 *
 * Run via: npm run db:unseed
 * To re-populate after cleaning: npx prisma db seed
 */

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import {
    SEED_USER_EMAILS,
    SEED_EVENT_TITLES,
    SEED_APPLICATION_EMAILS,
    SEED_AUTH_IDS,
} from "./seed-identifiers";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function unseed() {
    console.log("Removing seed data only...");

    const seedAuthIdValues = Object.values(SEED_AUTH_IDS);

    // Find seed events so we can also remove any signups/hours referencing them
    const seedEvents = await db.event.findMany({
        where: { title: { in: SEED_EVENT_TITLES } },
        select: { id: true },
    });
    const seedEventIds = seedEvents.map((e) => e.id);

    // Delete signups and hours that belong to seed users OR reference seed events.
    // FK children must be removed before their parent events can be deleted.
    const hours = await db.volunteerHours.deleteMany({
        where: {
            OR: [
                { userId: { in: seedAuthIdValues } },
                ...(seedEventIds.length > 0
                    ? [{ eventId: { in: seedEventIds } }]
                    : []),
            ],
        },
    });
    const signups = await db.eventSignup.deleteMany({
        where: {
            OR: [
                { userId: { in: seedAuthIdValues } },
                ...(seedEventIds.length > 0
                    ? [{ eventId: { in: seedEventIds } }]
                    : []),
            ],
        },
    });

    // Delete seed events, applications, and users by their known identifiers
    const events = await db.event.deleteMany({
        where: { title: { in: SEED_EVENT_TITLES } },
    });
    const apps = await db.application.deleteMany({
        where: { email: { in: SEED_APPLICATION_EMAILS } },
    });
    const users = await db.user.deleteMany({
        where: { email: { in: SEED_USER_EMAILS } },
    });

    console.log(
        `  Deleted: ${hours.count} hours, ${signups.count} signups, ` +
            `${events.count} events, ${apps.count} applications, ${users.count} users`
    );
    console.log("\nUnseed complete! Only seed data was removed.");
}

unseed()
    .catch((e) => {
        console.error("Unseed failed:", e);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
