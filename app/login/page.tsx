"use client";

import { useActionState, useEffect, useState } from "react";
import { useNavigate } from "@/context/navigation";
import { authClient } from "@/lib/auth/client";
import { signInWithEmail, signUpWithEmail } from "./actions";

// ── Icon components ───────────────────────────────────────────────────────

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);


const EyeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

function Divider() {
    return (
        <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(false);

    /**
     * Initiates Google OAuth via the Neon Auth client SDK.
     * The SDK redirects the browser to Google's consent screen;
     * after the user approves, Google redirects back to /api/auth/callback/google
     * which the catch-all route handler processes, sets the session cookie,
     * and finally redirects to callbackURL ("/").
     */
    const handleGoogleSignIn = async () => {
        setOauthLoading(true);
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
        });
    };

    // Redirect away if already logged in
    const { data: session } = authClient.useSession();
    useEffect(() => {
        if (session?.user) navigate("/");
    }, [session, navigate]);

    /**
     * useActionState ties a server action to form state.
     * `state` holds the latest { error } returned by the action;
     * `isPending` is true while the server action is in-flight.
     */
    const [signInState, signInAction, signInPending] = useActionState(signInWithEmail, null);
    const [signUpState, signUpAction, signUpPending] = useActionState(signUpWithEmail, null);

    // Pick the right action & state based on mode
    const formAction = mode === "login" ? signInAction : signUpAction;
    const error = mode === "login" ? signInState?.error : signUpState?.error;
    const isPending = mode === "login" ? signInPending : signUpPending;

    const inputCls =
        "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ background: "#f1f5f9" }}
        >
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Top banner */}
                    <div
                        className="px-8 py-7 text-white"
                        style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/SC-Econ-logo.png" alt="SC Economics" className="h-10 w-auto" />
                        </div>
                        <h1 className="text-2xl font-bold">
                            {mode === "login" ? "Welcome back" : "Create an account"}
                        </h1>
                        <p className="text-blue-200 text-sm mt-1">
                            {mode === "login"
                                ? "Sign in to your SC Economics volunteer account"
                                : "Join the SC Economics volunteer community"}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-7">

                        {/* Mode toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                            {(["login", "register"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all"
                                    style={{
                                        background: mode === m ? "#ffffff" : "transparent",
                                        color: mode === m ? "#111827" : "#6b7280",
                                        boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                    }}
                                >
                                    {m === "login" ? "Sign In" : "Register"}
                                </button>
                            ))}
                        </div>

                        {/* Google OAuth */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={oauthLoading}
                            className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
                        >
                            <GoogleIcon />
                            {oauthLoading ? "Redirecting..." : "Continue with Google"}
                        </button>

                        <Divider />

                        {/* Error banner */}
                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/*
                          HTML <form> with the `action` prop wired to a Server Action.
                          useActionState handles the pending state and returned errors.
                        */}
                        <form action={formAction}>

                            <div className="flex flex-col gap-4">

                                {/* Name field — only shown on register */}
                                {mode === "register" && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            className={inputCls}
                                            name="name"
                                            type="text"
                                            placeholder="Jane Doe"
                                            autoComplete="name"
                                        />
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                        Email Address *
                                    </label>
                                    <input
                                        className={inputCls}
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@email.com"
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            className={inputCls + " pr-10"}
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={mode === "register" ? 8 : undefined}
                                            placeholder="••••••••"
                                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    {mode === "register" && (
                                        <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full mt-6 py-2.5 rounded-lg text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: "#003366" }}
                            >
                                {isPending
                                    ? (mode === "login" ? "Signing in..." : "Creating account...")
                                    : (mode === "login" ? "Sign In" : "Create Account")}
                            </button>
                        </form>

                        {/* Switch mode */}
                        <p className="text-center text-xs text-gray-500 mt-5">
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === "login" ? "register" : "login")}
                                className="font-semibold text-[#003366] hover:underline"
                            >
                                {mode === "login" ? "Register here" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
