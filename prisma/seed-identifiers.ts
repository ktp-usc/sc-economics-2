/**
 * prisma/seed-identifiers.ts
 *
 * Shared constants used by both seed.ts and unseed.ts to identify
 * seed-specific records. This ensures the scripts only create, update,
 * or delete known seed data without touching real user data in the
 * shared production database.
 */

// Emails for seed User records (Prisma public schema)
export const SEED_USER_EMAILS = [
    "admin@scecon.dev",
    "manager@scecon.dev",
    "volunteer1@scecon.dev",
    "volunteer2@scecon.dev",
];

// Titles used to identify seed Event records
export const SEED_EVENT_TITLES = [
    "Financial Literacy Workshop",
    "Classroom Economics 101",
    "Personal Finance Bootcamp",
    "Youth Entrepreneurship Fair",
    "STEM and Economics Day",
    "Community Outreach Program",
];

// Emails for seed Application records
export const SEED_APPLICATION_EMAILS = [
    "jane.smith@example.com",
    "mike.j@example.com",
    "sarah.lee@example.com",
];

// Placeholder Neon Auth user IDs for seed volunteers.
// Real users have actual UUIDs from the auth provider, so these
// placeholder values let us target seed signups and hours specifically.
export const SEED_AUTH_IDS = {
    volunteer1: "00000000-0000-4000-a000-000000000001",
    volunteer2: "00000000-0000-4000-a000-000000000002",
    manager:    "00000000-0000-4000-a000-000000000003",
};

// Default password for all seed Neon Auth accounts
export const SEED_PASSWORD = "Password123!";

// Seed accounts: email → display name (used to create Neon Auth accounts)
export const SEED_ACCOUNTS = [
    { email: "admin@scecon.dev",      name: "Admin User"    },
    { email: "manager@scecon.dev",    name: "Manager User"  },
    { email: "volunteer1@scecon.dev", name: "Volunteer One" },
    { email: "volunteer2@scecon.dev", name: "Volunteer Two" },
];
