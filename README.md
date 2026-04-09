# SC Economics Volunteer Management System

A volunteer management portal for [South Carolina Council on Economic Education](https://sceconomics.org/), built by [Kappa Theta Pi](https://github.com/ktp-usc) at USC. Volunteers apply, browse events, sign up, and log hours; staff approve applications, manage events, and track impact.

Built on **Next.js 16** (App Router, Turbopack), **TypeScript**, **Prisma 7**, **Neon Postgres**, and **Neon Auth**.

---

## Quick start

```bash
git clone https://github.com/ktp-usc/sc-economics-volunteers.git
cd sc-economics-volunteers
npm install
cp .env.example .env       # ask a maintainer for the shared DATABASE_URL + auth keys
npm run dev
```

Open <http://localhost:3000>. The dev server uses Turbopack and hot-reloads on save.

### Required environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (pooled) |
| `STACK_PROJECT_ID`, `STACK_PUBLISHABLE_CLIENT_KEY`, `STACK_SECRET_SERVER_KEY` | Neon Auth (Stack) credentials |
| `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Client-side Neon Auth |

Ask `@sebastianboscan` or a `@ktp-usc/KTP-Tech` member for the shared values. **Do not commit `.env`.**

---

## Scripts

```bash
npm run dev        # Dev server with Turbopack on http://localhost:3000
npm run build      # Production build (must pass cleanly before merging — see PR rules)
npm run start      # Run the production build
npm run lint       # ESLint
npm run db:seed    # Insert sample data into the shared Neon DB (see warning below)
npm run db:unseed  # Remove only the records named in prisma/seed-identifiers.ts
```

### ⚠️ Shared database — read this before running seed scripts

`DATABASE_URL` points at a **single Neon database that every developer and every deployed environment shares**. There is no per-developer DB and no staging copy. Anything you write to it is visible to everyone, including the live deployment.

- `npm run db:seed` inserts a known set of fake users, events, applications, signups, and hours into the shared DB. They will appear in the live UI for every user until removed.
- `npm run db:unseed` deletes **only** the records whose emails / titles / placeholder UUIDs are listed in [`prisma/seed-identifiers.ts`](prisma/seed-identifiers.ts). Real user data is left untouched. Run this any time you've finished a local demo, or whenever fake events/applications are showing up on the deployed site.
- The seed reserves these emails — **never create real accounts using them**, or `db:unseed` will delete them: `admin@scecon.dev`, `volunteer1@scecon.dev`, `volunteer2@scecon.dev`, `jane.smith@example.com`, `mike.j@example.com`, `sarah.lee@example.com`.

Full details on the seed scripts (what they create, how Neon Auth accounts are handled separately, and how to manually create/edit/delete users) live in [`prisma/README.md`](prisma/README.md).

---

## Architecture overview

```
app/
├── api/                    # Route handlers — applications, events, me, hours, signups, admins, auth
├── layout.tsx              # Root layout: Header → PageTransition → main → Footer
├── page.tsx                # Marketing landing page
├── login/                  # Sign in / register (Neon Auth)
├── volunteer/              # Application form (auth required)
├── events/                 # Browse + sign up for events
├── portal/                 # Volunteer dashboard
├── admin/                  # Admin panel (applications, volunteers, events, hours)
├── manager/                # Manager dashboard
└── not-found.tsx           # 404
components/                 # Header, Footer, PageTransition, shared UI; ui/ is shadcn (do not hand-edit)
context/navigation.tsx      # NavigationProvider + useNavigate (drives fade transitions)
lib/auth/                   # Neon Auth server + client wrappers
lib/stores/events.ts        # Zustand store for client-side event state
prisma/                     # schema.prisma, seed.ts, unseed.ts, seed-identifiers.ts
proxy.ts                    # Route protection (Next.js 16 replacement for middleware.ts)
```

### Routing & access

| Route | Access |
|---|---|
| `/`, `/login` | Public |
| `/volunteer`, `/events`, `/portal`, `/portal/volunteer` | Authenticated |
| `/admin`, `/manager` | Staff only (`admin` or `manager` role) |

`proxy.ts` enforces this in two layers:

1. **Authentication** — `auth.middleware()` validates the Neon Auth session cookie on every matched request and redirects unauthenticated users to `/login`.
2. **Role authorization** — for `/admin` and `/manager`, the proxy fetches `/api/me` and bounces authenticated volunteers to `/portal` instead of returning a 401, so the UX stays smooth.

### Page transitions

Navigation must go through `useNavigate()` from `@/context/navigation` (not `next/link`). The provider runs a fade-out, calls `router.push`, and fades the new page in once the pathname changes.

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss` (no `tailwind.config.ts`). shadcn/ui is configured with the "new-york" style and neutral base in [`components.json`](components.json). Brand gradient: `#003366` → `#1d4ed8`.

---

## Contributing

1. Branch from `development` using the Linear ticket ID:
   ```
   git checkout development
   git pull
   git checkout -b SCEV-XX-short-description
   ```
2. Make your changes. Run `npm run build` locally — it must compile with minimal warnings before you open the PR.
3. Open the PR against `development`. The PR template (`.github/PULL_REQUEST_TEMPLATE.md`) lists the checklist you need to fill in.
4. PRs require **2 approvals** from `@ktp-usc/KTP-Tech` or `@sebastianboscan` (enforced via `CODEOWNERS`).
5. `development` is merged into `main` in batches; `main` is what's deployed.

### Common gotchas

- **Don't bypass `useNavigate`.** Using `<Link>` or `router.push` directly will skip the fade transition and cause the next page to render mid-fade.
- **Don't seed without telling the team.** The DB is shared. If you absolutely must seed for a demo, run `npm run db:unseed` immediately after.
- **Stale `.next` cache after deleting routes.** If `npm run build` complains about a missing `app/<something>/page.js` that no longer exists, delete `.next/` and rebuild.
- **Header must stay inside `NavigationProvider`.** Anything calling `useNavigate()` outside the provider will throw at runtime.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4, shadcn/ui, Lucide icons |
| Server state | TanStack React Query |
| Client state | Zustand |
| ORM | Prisma 7 + `@prisma/adapter-neon` |
| Database | Neon Postgres (shared) |
| Auth | Neon Auth (`@neondatabase/auth` + `@stackframe/stack`) |
| Hosting | Vercel (auto-deploys from `main`) |

---

## Useful links

- Production: deployed from `main` on Vercel
- Issue tracker: Linear (`SCEV-*` tickets)
- Code owners: see [`CODEOWNERS`](.github/CODEOWNERS)
- AI agent guidance: see [`CLAUDE.md`](CLAUDE.md)
- Database scripts deep-dive: see [`prisma/README.md`](prisma/README.md)
