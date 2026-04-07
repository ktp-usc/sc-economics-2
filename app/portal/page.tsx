"use client";

import { useEffect } from "react";
import { useNavigate } from "@/context/navigation";

/**
 * /portal — smart redirect gate.
 *
 * Reads the current user's role and immediately redirects to:
 *   volunteer → /portal/volunteer
 *   admin     → /admin
 *   manager   → /manager
 *   (none)    → /login
 *
 * Replace the role logic below with your real Neon Auth session once wired up.
 */
export default function PortalGatePage() {
    const navigate = useNavigate();

    useEffect(() => {
        // TODO: swap with real session role from Neon Auth
        // e.g. const role = session?.user?.role
        const role =
            (typeof window !== "undefined"
                ? localStorage.getItem("__dev_role")
                : null) ?? "volunteer";

        const destinations: Record<string, string> = {
            volunteer: "/portal/volunteer",
            admin:     "/admin",
            manager:   "/manager",
        };

        navigate(destinations[role] ?? "/login");
    }, [navigate]);

    // Brief loading state while the redirect fires
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div
                    className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
                    style={{ borderColor: "#003366", borderTopColor: "transparent" }}
                />
                <p className="text-gray-500 text-sm font-medium">Loading your portal…</p>
            </div>
        </div>
    );
}
