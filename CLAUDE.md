# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run lint       # Run ESLint
npm run db:seed    # Populate the database with sample data (see warning below)
npm run db:unseed  # Remove only seed data, leaving real records intact
```

No test framework is configured yet.

> **⚠️ Shared database — read before seeding.** `DATABASE_URL` points at a Neon database that every developer and every deployment shares. Running `db:seed` inserts rows that will immediately appear in the live UI for everyone. The seed identifiers (`prisma/seed-identifiers.ts`) reserve a fixed set of emails, event titles, and placeholder UUIDs — never create real accounts using `admin@scecon.dev`, `volunteer1@scecon.dev`, or `volunteer2@scecon.dev`, because `db:unseed` will delete them. If the deployed app is showing fake events or applications, that is seed data — run `npm run db:unseed` to clear it.

## Architecture

**Next.js App Router** with TypeScript strict mode. All routes live under `app/`, server components by default with `"use client"` opt-in.

### Key directories

- `app/` — pages, root layout, and API route handlers under `app/api/`
- `components/` — shared UI components; `components/ui/` is shadcn/ui primitives (do not hand-edit)
- `context/` — React contexts; `navigation.tsx` exports `NavigationProvider` and `useNavigate`
- `client/api/` — fetch utilities (`fetchJson`, `postJSON`)
- `client/queries/` — React Query key factories
- `lib/auth/` — Neon Auth server + client setup (`auth.middleware()`, `authClient.useSession()`)
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `prisma/` — schema, seed/unseed scripts, and shared seed identifiers
- `proxy.ts` — Next.js 16 route-protection middleware (replaces `middleware.ts`)

### Layout hierarchy

```
RootLayout (app/layout.tsx)              ← flex column, min-h-screen
└── NavigationProvider (context/navigation.tsx)  ← must wrap Header + PageTransition + Footer
    ├── Header (components/header.tsx)
    ├── PageTransition (components/PageTransition.tsx)  ← fade animation
    │   └── <main>{children}</main>
    └── Footer (components/footer.tsx)
```

`NavigationProvider` owns the `navigate(href)` function. `PageTransition` registers a fade-out callback into it on mount. Clicking a nav link triggers: fade-out → `router.push` → pathname change → fade-in. Any new nav elements must use `useNavigate` from `@/context/navigation` (not `Link`) to get the transition effect.

### Routing

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Marketing landing page with hero stats and CTA | Public |
| `/login` | Login / Register page | Public |
| `/volunteer` | Volunteer application form | Authenticated |
| `/events` | Browse and sign up for events | Authenticated |
| `/portal` | Volunteer portal landing | Authenticated |
| `/portal/volunteer` | Volunteer dashboard (signups + hours) | Authenticated |
| `/admin` | Admin panel (applications, volunteers, events, hours) | Staff (admin or manager) |
| `/manager` | Manager dashboard | Staff (admin or manager) |
| `/not-found` | 404 page | Public |

### Route protection

`proxy.ts` runs on every matched route and applies two layers:

1. **Authentication** — `auth.middleware()` validates the Neon Auth session cookie and refreshes expired tokens. Unauthenticated requests are redirected to `/login`.
2. **Role gate** — for paths in `STAFF_ONLY_ROUTES` (`/admin`, `/manager`) the proxy calls `/api/me` and redirects authenticated volunteers to `/portal` instead of returning a hard 401.

The `matcher` excludes public assets, `/`, `/login`, and `/api/auth/*` so they bypass the proxy entirely.

### State & data fetching

- **React Query** (TanStack) — server state; query keys defined in `client/queries/keys.ts`
- **Zustand** — client state (installed, used in `lib/stores/events.ts`)
- Local `useState` used in current pages
- Pages fetch live data from `/api/*` route handlers, which talk to Postgres via Prisma + the Neon serverless adapter. There is **no hardcoded fixture data** in any page — if you see fake-looking events or applications in the UI, they came from `prisma/seed.ts` and can be removed with `npm run db:unseed`.

### Styling

- Tailwind CSS v4 via `@tailwindcss/postcss` — no `tailwind.config.ts` needed
- shadcn/ui configured with "new-york" style, neutral base, CSS variables, Lucide icons (`components.json`)
- Brand colors: `#003366` (dark blue) → `#1d4ed8` (bright blue) gradient used in Header

## Database

- **Provider:** Neon Postgres (shared across developers and deployments)
- **ORM:** Prisma 7 with `@prisma/adapter-neon` for serverless connection pooling
- **Schema:** `prisma/schema.prisma` — `User`, `Application`, `Event`, `EventSignup`, `VolunteerHours`
- **Auth:** Neon Auth (`@neondatabase/auth` + `@stackframe/stack`) stores accounts/sessions in the `neon_auth` schema; the Prisma `User` table mirrors them by email and holds the `role` field (`admin`, `manager`, `volunteer`)
- **Seed scripts:** see `prisma/README.md` for full details on `seed.ts`, `unseed.ts`, and `seed-identifiers.ts`. Both scripts target only the records named in `seed-identifiers.ts`, so they are safe to run against the shared DB — but the rows they create are **visible to everyone**, including the deployed app.

## PR requirements

Per `.github/PULL_REQUEST_TEMPLATE.md` and `CODEOWNERS`:
- Branch name must include the ticket ID (e.g. `SCEV-14-...`)
- `npm run build` must pass with minimal warnings before merging
- All PRs require 2 approvals from `@ktp-usc/KTP-Tech` or `@sebastianboscan`
