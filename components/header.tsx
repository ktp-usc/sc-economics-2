"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNavigate } from "@/context/navigation";
import { authClient } from "@/lib/auth/client";
import { LogOut } from "lucide-react";

interface Me {
    email: string;
    name: string | null;
    role: string;
}

const VOLUNTEER_NAV = [
    { label: "Home",             href: "/",         activePath: "/" },
    { label: "Apply",            href: "/volunteer", activePath: "/volunteer" },
    { label: "Events",           href: "/events",    activePath: "/events" },
    { label: "Volunteer Portal", href: "/portal",    activePath: "/portal" },
];

const ADMIN_EXTRA = { label: "Admin", href: "/admin", activePath: "/admin" };

// When not logged in, the nav shows the same labels as the logged-in nav so the
// layout doesn't shift. Auth-gated links point directly to /login to avoid a
// server-side redirect bounce (/events → /login) which fires the fade transition
// twice and leaves the page stuck blank.
// activePath is the real destination used only for the active highlight check.
const PUBLIC_NAV = [
    { label: "Home",             href: "/",      activePath: "/" },
    { label: "Apply",            href: "/login", activePath: "/volunteer" },
    { label: "Events",           href: "/login", activePath: "/events" },
    { label: "Volunteer Portal", href: "/login", activePath: "/portal" },
];

export default function Header(): React.JSX.Element {
    const pathname = usePathname();
    const navigate = useNavigate();

    // Re-check session on every pathname change so the header stays in sync
    // immediately after login (server-action redirect) without needing a
    // manual page refresh. Falls back to null when unauthenticated.
    const [me, setMe]           = useState<Me | null>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        setIsPending(true);
        fetch("/api/me")
            .then((r) => (r.ok ? (r.json() as Promise<Me>) : null))
            .then((data) => { setMe(data); setIsPending(false); })
            .catch(() => { setMe(null); setIsPending(false); });
    }, [pathname]);

    const isLoggedIn = !!me;
    const role = me?.role ?? null;

    const navItems = isLoggedIn
        ? role === "admin"
            ? [...VOLUNTEER_NAV, ADMIN_EXTRA]
            : VOLUNTEER_NAV
        : PUBLIC_NAV;

    const handleSignOut = async () => {
        await authClient.signOut();
        navigate("/");
        // pathname change caused by navigate() will re-trigger the useEffect
        // above, which will call /api/me → 401 → me=null → header resets.
    };

    return (
        <header
            className="text-white shadow-lg sticky top-0 z-50"
            style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
        >
            <div className="mx-auto px-6 flex items-center justify-between h-[70px]">
                {/* Logo */}
                <button onClick={() => navigate("/")} className="flex items-center gap-3">
                    <img
                        src="/SC-Econ-logo.png"
                        alt="SC Economics"
                        className="h-12 w-auto"
                    />
                </button>

                {/* Nav links + auth controls */}
                <nav className="flex items-center gap-1">
                    {navItems.map(({ label, href, activePath }) => (
                        <button
                            key={label}
                            // Guard prevents triggering a fade-out when already
                            // on this page (which would leave the page blank).
                            onClick={() => { if (pathname !== href) navigate(href); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: pathname === activePath ? "#1d4ed8" : "transparent",
                            }}
                        >
                            {label}
                        </button>
                    ))}

                    {/* Auth section */}
                    {/* Auth section — always reserve space so nav items don't shift
                        when the Login button appears after the /api/me fetch */}
                    <div className="ml-3 pl-3 border-l border-white/30 flex items-center min-w-[80px]">
                        {!isPending && (
                            isLoggedIn ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-blue-200 hidden md:inline">
                                        {me.name || me.email}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden md:inline">Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { if (pathname !== "/login") navigate("/login"); }}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/15 hover:bg-white/25 transition-colors border border-white/30"
                                >
                                    Login
                                </button>
                            )
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}