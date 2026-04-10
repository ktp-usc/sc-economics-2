/**
 * prisma/seed.ts
 *
 * Populates the database with realistic sample data for local development.
 * Run via: npx prisma db seed
 *
 * SAFE FOR SHARED DATABASES: This script only touches records that match
 * the identifiers in seed-identifiers.ts (specific emails, titles, and
 * placeholder UUIDs). It will never delete or overwrite real user data.
 *
 * Neon Auth accounts are also created automatically (requires
 * NEON_AUTH_BASE_URL in .env). All seed accounts share the password
 * defined in seed-identifiers.ts (default: Password123!).
 */

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import {
    SEED_USER_EMAILS,
    SEED_EVENT_TITLES,
    SEED_APPLICATION_EMAILS,
    SEED_AUTH_IDS,
    SEED_PASSWORD,
    SEED_ACCOUNTS,
} from "./seed-identifiers";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

/** Fisher-Yates shuffle: randomizes array order in place */
function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function seed() {
    // -- Delete previous seed data only (FK children first, then parents) --
    console.log("Deleting previous seed data...");

    // Find existing seed events so we can remove signups/hours referencing them
    const existingSeedEvents = await db.event.findMany({
        where: { title: { in: SEED_EVENT_TITLES } },
        select: { id: true },
    });
    const seedEventIds = existingSeedEvents.map((e) => e.id);
    const seedAuthIdValues = Object.values(SEED_AUTH_IDS);

    // Remove seed signups and hours (matched by placeholder user IDs or seed event IDs)
    await db.volunteerHours.deleteMany({
        where: {
            OR: [
                { userId: { in: seedAuthIdValues } },
                ...(seedEventIds.length > 0
                    ? [{ eventId: { in: seedEventIds } }]
                    : []),
            ],
        },
    });
    await db.eventSignup.deleteMany({
        where: {
            OR: [
                { userId: { in: seedAuthIdValues } },
                ...(seedEventIds.length > 0
                    ? [{ eventId: { in: seedEventIds } }]
                    : []),
            ],
        },
    });

    // Remove seed events, applications, and users
    await db.event.deleteMany({
        where: { title: { in: SEED_EVENT_TITLES } },
    });
    await db.application.deleteMany({
        where: { email: { in: SEED_APPLICATION_EMAILS } },
    });
    await db.user.deleteMany({
        where: { email: { in: SEED_USER_EMAILS } },
    });
    console.log("  Deleted previous seed data.");

    // -- Users (Prisma records + Neon Auth accounts) --
    console.log("Seeding users...");
    const admin = await db.user.create({
        data: { email: "admin@scecon.dev", role: "admin" },
    });
    const mgr = await db.user.create({
        data: { email: "manager@scecon.dev", role: "manager" },
    });
    const vol1 = await db.user.create({
        data: { email: "volunteer1@scecon.dev", role: "volunteer" },
    });
    const vol2 = await db.user.create({
        data: { email: "volunteer2@scecon.dev", role: "volunteer" },
    });
    console.log(
        `  Created 4 users: ${admin.email}, ${mgr.email}, ${vol1.email}, ${vol2.email}`
    );

    // Create Neon Auth accounts so seed users can sign in.
    const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
    if (authBaseUrl) {
        console.log("Creating Neon Auth accounts...");
        for (const { email, name } of SEED_ACCOUNTS) {
            try {
                const res = await fetch(`${authBaseUrl}/sign-up/email`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Origin": "http://localhost:3000",
                    },
                    body: JSON.stringify({ email, password: SEED_PASSWORD, name }),
                });
                if (res.ok) {
                    console.log(`  ✓ ${email}`);
                } else {
                    const text = await res.text();
                    // 422 / "user already exists" is fine — account was created in a prior run
                    if (res.status === 422 || text.includes("already")) {
                        console.log(`  ✓ ${email} (already exists)`);
                    } else {
                        console.warn(`  ✗ ${email}: ${res.status} ${text}`);
                    }
                }
            } catch (err) {
                console.warn(`  ✗ ${email}: ${err instanceof Error ? err.message : err}`);
            }
        }
        console.log(`  Password for all seed accounts: ${SEED_PASSWORD}`);
    } else {
        console.warn("  NEON_AUTH_BASE_URL not set — skipping auth account creation.");
        console.warn("  Create accounts manually (see README).");
    }

    // -- Events (mix of past and upcoming across all enum values) --
    console.log("Seeding events...");
    const eventsData = [
        {
            title: "Financial Literacy Workshop",
            description:
                "Interactive workshop teaching K-5 students about saving, spending, and basic budgeting through hands-on activities.",
            venue: "Columbia Public Library",
            city: "Columbia" as const,
            type: "Workshop" as const,
            ageGroup: "K_5" as const,
            expertise: "Finance" as const,
            date: new Date("2026-02-15"),
            spotsTotal: 20,
            spotsFilled: 2,
        },
        {
            title: "Classroom Economics 101",
            description:
                "Teaching session covering supply and demand concepts for middle school students using real-world SC examples.",
            venue: "Greenville County Schools",
            city: "Greenville" as const,
            type: "Teaching" as const,
            ageGroup: "G6_8" as const,
            expertise: "Teaching" as const,
            date: new Date("2026-03-01"),
            spotsTotal: 15,
            spotsFilled: 1,
        },
        {
            title: "Personal Finance Bootcamp",
            description:
                "Full-day bootcamp for high schoolers on budgeting, credit, and career-readiness financial skills.",
            venue: "Aiken Technical College",
            city: "Aiken" as const,
            type: "Workshop" as const,
            ageGroup: "G9_12" as const,
            expertise: "Finance" as const,
            date: new Date("2026-03-20"),
            spotsTotal: 25,
            spotsFilled: 1,
        },
        {
            title: "Youth Entrepreneurship Fair",
            description:
                "Students showcase business plans and compete for prizes. Volunteers serve as judges and mentors.",
            venue: "Charleston Convention Center",
            city: "Charleston" as const,
            type: "Event" as const,
            ageGroup: "G6_8" as const,
            expertise: "Business" as const,
            date: new Date("2026-05-10"),
            spotsTotal: 30,
            spotsFilled: 0,
        },
        {
            title: "STEM and Economics Day",
            description:
                "Combining technology and economics education for high school students through coding challenges with economic simulations.",
            venue: "Spartanburg Community College",
            city: "Spartanburg" as const,
            type: "Teaching" as const,
            ageGroup: "G9_12" as const,
            expertise: "Technology" as const,
            date: new Date("2026-06-15"),
            spotsTotal: 20,
            spotsFilled: 0,
        },
        {
            title: "Community Outreach Program",
            description:
                "Bringing economic education to underserved communities in the Myrtle Beach area through fun, interactive activities for young learners.",
            venue: "Myrtle Beach Community Center",
            city: "Myrtle_Beach" as const,
            type: "Event" as const,
            ageGroup: "K_5" as const,
            expertise: "Outreach" as const,
            date: new Date("2026-07-20"),
            spotsTotal: 40,
            spotsFilled: 0,
        },
    ];

    // Shuffle insertion order so IDs vary across seed runs
    shuffle(eventsData);
    const eventsByTitle: Record<string, { id: number }> = {};
    for (const data of eventsData) {
        const event = await db.event.create({ data });
        eventsByTitle[event.title] = event;
    }
    console.log(`  Created ${eventsData.length} events`);

    // -- Event Signups (volunteers signed up for past events) --
    // Uses placeholder Neon Auth UUIDs since real auth accounts are created separately.
    // References events by title so insertion order doesn't matter.
    console.log("Seeding event signups...");
    const signupsData = shuffle([
        {
            eventId: eventsByTitle["Financial Literacy Workshop"].id,
            userId: SEED_AUTH_IDS.volunteer1,
            why: "I want to help kids learn about managing money from a young age.",
            fromTime: "09:00",
            toTime: "12:00",
            certificate: true,
            expertise: "Finance",
        },
        {
            eventId: eventsByTitle["Classroom Economics 101"].id,
            userId: SEED_AUTH_IDS.volunteer1,
            why: "I have experience tutoring middle schoolers and want to apply it here.",
            fromTime: "10:00",
            toTime: "14:00",
            certificate: false,
            expertise: "Teaching",
        },
        {
            eventId: eventsByTitle["Personal Finance Bootcamp"].id,
            userId: SEED_AUTH_IDS.volunteer2,
            why: "Personal finance changed my life and I want to pass that knowledge on.",
            fromTime: "08:00",
            toTime: "16:00",
            certificate: true,
            expertise: "Finance",
        },
    ]);
    const signups = await db.eventSignup.createMany({ data: signupsData });
    console.log(`  Created ${signups.count} event signups`);

    // -- Volunteer Hours (logged for completed past events) --
    console.log("Seeding volunteer hours...");
    const hoursData = shuffle([
        {
            userId: SEED_AUTH_IDS.volunteer1,
            userEmail: "volunteer1@scecon.dev",
            eventId: eventsByTitle["Financial Literacy Workshop"].id,
            hours: 3,
            note: "Helped run the budgeting activity station",
        },
        {
            userId: SEED_AUTH_IDS.volunteer1,
            userEmail: "volunteer1@scecon.dev",
            eventId: eventsByTitle["Classroom Economics 101"].id,
            hours: 4,
            note: "Led the supply and demand lesson",
        },
        {
            userId: SEED_AUTH_IDS.volunteer2,
            userEmail: "volunteer2@scecon.dev",
            eventId: eventsByTitle["Personal Finance Bootcamp"].id,
            hours: 8,
            note: "Full day bootcamp instructor",
        },
    ]);
    const hours = await db.volunteerHours.createMany({ data: hoursData });
    console.log(`  Created ${hours.count} volunteer hours entries`);

    // -- Applications (mix of statuses for testing the review workflow) --
    console.log("Seeding applications...");
    const applicationsData = [
        {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            phone: "803-555-0101",
            street: "123 Main St",
            city: "Columbia",
            state: "South Carolina",
            zip: "29201",
            availableDays: ["Monday", "Wednesday", "Friday"],
            skills: "Teaching, public speaking, curriculum development",
            experience:
                "5 years tutoring K-12 students in math and economics",
            motivation:
                "I believe financial literacy is essential for every child and want to help SC Economics reach more students.",
            backgroundCheck: true,
            dataConsent: true,
            status: "approved" as const,
        },
        {
            firstName: "Mike",
            lastName: "Johnson",
            email: "mike.j@example.com",
            phone: "864-555-0202",
            street: "456 Oak Ave",
            city: "Greenville",
            state: "South Carolina",
            zip: "29601",
            availableDays: ["Saturday"],
            skills: "Business management, mentoring",
            experience: null,
            motivation:
                "I recently retired and want to give back to the community by sharing my business experience with young people.",
            backgroundCheck: true,
            dataConsent: true,
            status: "pending" as const,
        },
        {
            firstName: "Sarah",
            lastName: "Lee",
            email: "sarah.lee@example.com",
            phone: "843-555-0303",
            street: "789 Pine Rd",
            city: "Charleston",
            state: "South Carolina",
            zip: "29401",
            availableDays: ["Tuesday", "Thursday"],
            skills: "Technology, web development",
            experience: "3 years as a software developer",
            motivation:
                "Want to help with the technology side of economic education.",
            backgroundCheck: false,
            dataConsent: true,
            status: "denied" as const,
        },
    ];

    shuffle(applicationsData);
    for (const data of applicationsData) {
        await db.application.create({ data });
    }
    console.log(`  Created ${applicationsData.length} applications`);

    // -- Summary --
    console.log("\nSeed complete!");
}

seed()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
