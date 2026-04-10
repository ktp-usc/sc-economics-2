/**
 * Server Actions for authentication
 *
 * These run server-side so the Neon Auth base URL and cookie secret
 * never leave the server. The client form calls them via useActionState
 * which gives us pending/error states for free.
 */

"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

/**
 * Sign in with email + password.
 * Returns an error object on failure; redirects to / on success.
 */
export async function signInWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please fill in all fields." };
  }

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    return { error: error.message ?? "Invalid email or password." };
  }

  redirect("/portal");
}

/**
 * Register a new account with name, email, and password.
 * Returns an error object on failure; redirects to / on success.
 */
export async function signUpWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please fill in all fields." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { error } = await auth.signUp.email({ email, password, name: name || email });

  if (error) {
    return { error: error.message ?? "Could not create account." };
  }

  redirect("/portal");
}
