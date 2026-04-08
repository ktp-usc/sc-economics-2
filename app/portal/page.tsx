"use client";

import { useEffect } from "react";
import { useNavigate } from "@/context/navigation";

/**
 * /portal — smart redirect gate.
 *
 * Calls /api/me to get the current user's role, then redirects to the
 * appropriate sub-portal. Unauthenticated users are sent to /login.
 */
export default function PortalGatePage() {
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/me")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data) { navigate("/login"); return; }
                const destinations: Record<string, string> = {
                    admin:     "/admin",
                    volunteer: "/portal/volunteer",
                };
                navigate(destinations[data.role] ?? "/login");
            })
            .catch(() => navigate("/login"));
    }, [navigate]);

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
