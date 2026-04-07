/**
 * Neon Auth — client-side singleton
 *
 * Provides React hooks (useSession, etc.) and action helpers
 * (signIn, signUp, signOut) for use in Client Components.
 *
 * All requests are routed through the local API proxy at
 * /api/auth/[...path] so the Neon Auth base URL stays server-only.
 */

"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
