# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

**Next.js App Router** with TypeScript strict mode. All routes live under `app/`, server components by default with `"use client"` opt-in.

### Key directories

- `app/` — pages and root layout
- `components/` — shared UI components; `components/ui/` is shadcn/ui primitives (do not hand-edit)
- `context/` — React contexts; `navigation.tsx` exports `NavigationProvider` and `useNavigate`
- `client/api/` — fetch utilities (`fetchJson`, `postJSON`)
- `client/queries/` — React Query key factories
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Layout hierarchy

```
RootLayout (app/layout.tsx)
└── NavigationProvider (context/navigation.tsx)  ← must wrap Header + PageTransition
    ├── Header (components/header.tsx)
    └── PageTransition (components/PageTransition.tsx)  ← fade animation
        └── {children}
```

`NavigationProvider` owns the `navigate(href)` function. `PageTransition` registers a fade-out callback into it on mount. Clicking a nav link triggers: fade-out → `router.push` → pathname change → fade-in. Any new nav elements must use `useNavigate` from `@/context/navigation` (not `Link`) to get the transition effect.

### Routing

| Route | Purpose |
|-------|---------|
| `/` | Volunteer application form |
| `/login` | Login / Register page |
| `/portal` | Volunteer portal (nav link exists, page not yet built) |
| `/admin` | Admin panel (nav link exists, page not yet built) |

### State & data fetching

- **React Query** (TanStack) — server state; query keys defined in `client/queries/keys.ts`
- **Zustand** — client state (installed, not yet implemented)
- Local `useState` used in current pages

### Styling

- Tailwind CSS v4 via `@tailwindcss/postcss` — no `tailwind.config.ts` needed
- shadcn/ui configured with "new-york" style, neutral base, CSS variables, Lucide icons (`components.json`)
- Brand colors: `#003366` (dark blue) → `#1d4ed8` (bright blue) gradient used in Header

## PR requirements

Per `.github/PULL_REQUEST_TEMPLATE.md` and `CODEOWNERS`:
- Branch name must include the ticket ID (e.g. `SCEV-14-...`)
- `npm run build` must pass with minimal warnings before merging
- All PRs require 2 approvals from `@ktp-usc/KTP-Tech` or `@sebastianboscan`
