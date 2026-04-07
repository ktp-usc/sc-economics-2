/**
 * Neon Auth — server-side singleton
 *
 * Creates a single `auth` instance used across:
 *   - API route handler  (app/api/auth/[...path]/route.ts)
 *   - Middleware          (middleware.ts)
 *   - Server Components & Server Actions (via `auth.getSession()`)
 *
 * The instance proxies every auth request to the Neon Auth server
 * and manages signed, HTTP-only session cookies locally.
 */

import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    // Env var name matches the key provided in the Neon Console
    secret: process.env.NEON_AUTH_SECRET_COOKIE!,
  },
});
