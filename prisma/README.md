# Prisma Database Scripts

## Seed

Populates the database with sample data for local development.

```bash
npx prisma db seed
# or
npm run db:seed
```

## Unseed

Removes all seed data without re-populating. Real user data is not affected.

```bash
npm run db:unseed
```

### What gets created

| Table | Records | Details |
|-------|---------|---------|
| User | 3 | 1 admin, 2 volunteers |
| Event | 6 | 3 past, 3 upcoming (all cities, types, and age groups) |
| EventSignup | 3 | Volunteers signed up for past events |
| VolunteerHours | 3 | Hours logged for past events (3h, 4h, 8h) |
| Application | 3 | 1 approved, 1 pending, 1 denied |

### Idempotency

Running the seed multiple times is safe. Each run deletes previous seed data and recreates it in randomized order. Only records matching the identifiers in `seed-identifiers.ts` are affected. Real user data is never touched.

### Neon Auth accounts

The seed script only creates Prisma User records (for role assignment). Neon Auth accounts must be created separately since they require the Next.js runtime. Start the dev server, then run:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scecon.dev","password":"Password123!","name":"Admin User"}'
```

Repeat for each seed user (`volunteer1@scecon.dev`, `volunteer2@scecon.dev`).


## Shared database safety

Both scripts identify seed records by specific emails, event titles, and placeholder auth UUIDs defined in `seed-identifiers.ts`. They will never delete or overwrite data created by other developers or real users.

## Manual user management

These commands use the dev server's auth endpoint and Prisma Studio (or raw SQL). Make sure `npm run dev` is running first.

### Create a user

1. Create the Neon Auth account:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"YourPassword123!","name":"User Name"}'
```

2. Create the matching Prisma User record (for role assignment):

```bash
npx prisma studio
```

In Prisma Studio, open the `User` table, click **Insert Row**, fill in the email (must match the auth account), and set the role (`admin` or `volunteer`).

Alternatively, use raw SQL:

```sql
INSERT INTO "User" (email, role) VALUES ('user@example.com', 'admin');
```

### Edit a user's role

In Prisma Studio, open the `User` table, find the user, and change the `role` field.

Or via SQL:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'user@example.com';
```

### Delete a user

1. Delete the Prisma User record first (in Prisma Studio or via SQL):

```sql
DELETE FROM "User" WHERE email = 'user@example.com';
```

2. Delete the Neon Auth account. These live in the `neon_auth` schema:

```sql
DELETE FROM neon_auth."session" WHERE "userId" = (
  SELECT id FROM neon_auth."user" WHERE email = 'user@example.com'
);
DELETE FROM neon_auth."account" WHERE "userId" = (
  SELECT id FROM neon_auth."user" WHERE email = 'user@example.com'
);
DELETE FROM neon_auth."user" WHERE email = 'user@example.com';
```

> **Note:** If the user has event signups or volunteer hours, you must delete those records first or the deletion will fail due to foreign key constraints.

## Files

| File | Purpose |
|------|---------|
| `seed.ts` | Deletes previous seed data, then creates fresh sample records |
| `unseed.ts` | Deletes seed data only |
| `seed-identifiers.ts` | Shared constants (emails, titles, UUIDs) used to target seed records |
| `schema.prisma` | Database schema definition |
