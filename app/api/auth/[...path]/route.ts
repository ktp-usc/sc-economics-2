/**
 * Neon Auth catch-all API route
 *
 * Proxies every request under /api/auth/* to the Neon Auth server.
 * This handles sign-in, sign-up, sign-out, session refresh, OAuth
 * callbacks, and any other auth operations the SDK needs.
 */

import { auth } from "@/lib/auth/server";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
