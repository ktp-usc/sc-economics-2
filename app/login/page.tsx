"use client";

import { useActionState, useEffect, useState } from "react";
import { useNavigate } from "@/context/navigation";
import { authClient } from "@/lib/auth/client";
import { signInWithEmail, signUpWithEmail } from "./actions";

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

export default function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);

    // Controlled input state so field values persist when a server action
    // returns an error (React resets uncontrolled forms after action completion)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Redirect away if already logged in
    const { data: session } = authClient.useSession();
    useEffect(() => {
        if (session?.user) navigate("/portal");
    }, [session, navigate]);

    const [signInState, signInAction, signInPending] = useActionState(signInWithEmail, null);
    const [signUpState, signUpAction, signUpPending] = useActionState(signUpWithEmail, null);

    const formAction = mode === "login" ? signInAction : signUpAction;
    const error      = mode === "login" ? signInState?.error : signUpState?.error;
    const isPending  = mode === "login" ? signInPending : signUpPending;

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

                        {/* Mode toggle - type="button" prevents accidental form submission */}
                        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                            {(["login", "register"] as const).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMode(m)}
                                    className="flex-1 py-2 rounded-md text-sm font-semibold transition-all"
                                    style={{
                                        background:  mode === m ? "#ffffff" : "transparent",
                                        color:       mode === m ? "#111827" : "#6b7280",
                                        boxShadow:   mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                    }}
                                >
                                    {m === "login" ? "Sign In" : "Register"}
                                </button>
                            ))}
                        </div>

                        {/* Google OAuth */}
                        <button
                            type="button"
                            onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/portal" })}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.39 29.5 1.5 24 1.5 14.82 1.5 6.98 6.97 3.24 14.82l7.08 5.5C12.13 14.11 17.57 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.42-4.75H24v9h12.68c-.55 2.97-2.18 5.48-4.63 7.17l7.18 5.57C43.44 37.12 46.5 31 46.5 24z"/>
                                <path fill="#FBBC05" d="M10.32 28.68A14.5 14.5 0 0 1 9.5 24c0-1.63.28-3.21.82-4.68l-7.08-5.5A22.47 22.47 0 0 0 1.5 24c0 3.61.87 7.02 2.42 10.02l6.4-5.34z"/>
                                <path fill="#34A853" d="M24 46.5c5.5 0 10.12-1.82 13.5-4.95l-7.18-5.57c-1.88 1.26-4.28 2.02-6.32 2.02-6.43 0-11.87-4.61-13.68-10.82l-6.4 5.34C6.98 41.03 14.82 46.5 24 46.5z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <Divider />

                        {/* Error banner */}
                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form action={formAction}>
                            <div className="flex flex-col gap-4">

                                {/* Name — register only */}
                                {mode === "register" && (
                                    <div>
                                        <label htmlFor="auth-name" className="block text-sm font-semibold text-gray-900 mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            id="auth-name"
                                            className={inputCls}
                                            name="name"
                                            type="text"
                                            placeholder="Jane Doe"
                                            autoComplete="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label htmlFor="auth-email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                                        Email Address *
                                    </label>
                                    <input
                                        id="auth-email"
                                        className={inputCls}
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@email.com"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="auth-password" className="block text-sm font-semibold text-gray-900 mb-1.5">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="auth-password"
                                            className={inputCls + " pr-10"}
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={mode === "register" ? 8 : undefined}
                                            placeholder="••••••••"
                                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                type="button"
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