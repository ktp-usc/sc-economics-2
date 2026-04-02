"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";


const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const AppleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
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


function SocialButton({
                          icon,
                          label,
                          onClick,
                      }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
            {icon}
            {label}
        </button>
    );
}


// Temporary admin credential until backend auth is wired up
const ADMIN_EMAIL = "admin@sceconomics.org";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const inputCls =
        "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

    const handleSubmit = () => {
        setError("");
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        // TODO: connect to backend auth endpoint
        const role = email.trim().toLowerCase() === ADMIN_EMAIL ? "admin" : "volunteer";
        login(email.trim().toLowerCase(), role);
        router.push(role === "admin" ? "/admin" : "/portal");
    };

    const handleSocial = (provider: string) => {
        // TODO: connect to backend OAuth endpoint e.g. /api/auth/[provider]
        console.log(`Sign in with ${provider}`);
    };

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
                                    onClick={() => { setMode(m); setError(""); }}
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

                        {/* Social buttons */}
                        <div className="flex flex-col gap-3">
                            <SocialButton
                                icon={<GoogleIcon />}
                                label="Continue with Google"
                                onClick={() => handleSocial("google")}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <SocialButton
                                    icon={<FacebookIcon />}
                                    label="Facebook"
                                    onClick={() => handleSocial("facebook")}
                                />
                                <SocialButton
                                    icon={<AppleIcon />}
                                    label="Apple"
                                    onClick={() => handleSocial("apple")}
                                />
                            </div>
                        </div>

                        <Divider />

                        {/* Error */}
                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email & Password */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Email Address *
                                </label>
                                <input
                                    className={inputCls}
                                    type="email"
                                    placeholder="you@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Password *
                                    </label>
                                    {mode === "login" && (
                                        <button
                                            onClick={() => {/* TODO: forgot password flow */}}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        className={inputCls + " pr-10"}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            className="w-full mt-6 py-2.5 rounded-lg text-white font-bold text-sm transition hover:opacity-90"
                            style={{ backgroundColor: "#003366" }}
                        >
                            {mode === "login" ? "Sign In →" : "Create Account →"}
                        </button>

                        {/* Switch mode */}
                        <p className="text-center text-xs text-gray-500 mt-5">
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
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