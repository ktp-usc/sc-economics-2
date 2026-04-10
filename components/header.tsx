"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNavigate } from "@/context/navigation";
import { authClient } from "@/lib/auth/client";
import { LogOut } from "lucide-react";
import Image from "next/image";

type NavItem = {
    label: string;
    href: string;
    activePath: string;
};

const VOLUNTEER_NAV_APPLY: NavItem[] = [
    { label: "Apply",            href: "/volunteer", activePath: "/volunteer" },
    { label: "Events",           href: "/events",    activePath: "/events" },
    { label: "Volunteer Portal", href: "/portal",    activePath: "/portal" },
];

const VOLUNTEER_NAV: NavItem[] = [
    { label: "Events",           href: "/events", activePath: "/events" },
    { label: "Volunteer Portal", href: "/portal", activePath: "/portal" },
];

const STAFF_NAV: NavItem[] = [
    { label: "Dashboard", href: "/admin", activePath: "/admin" },
];

const PUBLIC_NAV: NavItem[] = [
    { label: "Home",  href: "/",      activePath: "/" },
    { label: "Login", href: "/login", activePath: "/login" },
];

export default function Header() {
    const pathname = usePathname();
    const navigate = useNavigate();

    const { data: session } = authClient.useSession();

    const sessionUser = session?.user;

    // Fetch role and applicationStatus from /api/me — also serves as a fallback
    // login check when the client-side session hook doesn't detect the cookie.
    const [extraInfo, setExtraInfo] = useState<{ role: string; applicationStatus: string | null; name: string | null; email: string } | null>(null);

    useEffect(() => {
        fetch("/api/me")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data) setExtraInfo({ role: data.role, applicationStatus: data.applicationStatus ?? null, name: data.name, email: data.email });
                else setExtraInfo(null);
            })
            .catch(() => setExtraInfo(null));
    }, [sessionUser, pathname]);

    const isLoggedIn = !!sessionUser || !!extraInfo;
    const displayName = sessionUser?.name || sessionUser?.email || extraInfo?.name || extraInfo?.email;

    const role = extraInfo?.role ?? null;
    const isStaff = role === "admin" || role === "manager";
    const isApproved = extraInfo?.applicationStatus === "approved";
    const volunteerNav = isApproved ? VOLUNTEER_NAV : VOLUNTEER_NAV_APPLY;
    const navItems = isLoggedIn
        ? isStaff
            ? STAFF_NAV
            : volunteerNav
        : PUBLIC_NAV;

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/login";
    };

    // FIX — render auth section always, just show login button while pending
    const authSection = isLoggedIn ? (
        <div className="flex items-center gap-2">
            <span className="text-sm text-blue-200 hidden md:inline">
                {displayName}
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
    ) : null;

    return (
        <header
            className="text-white shadow-lg sticky top-0 z-50 w-full overflow-hidden"
            style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
        >
            <div className="w-full mx-auto px-4 flex items-center justify-between h-[70px] min-w-0">
                {/* Logo */}
                <button onClick={() => { if (pathname !== "/") navigate("/"); }} className="flex items-center gap-3 shrink-0">
                    <Image src="/SC-Econ-logo.png" alt="SC Economics" height={48} width={120} className="h-12 w-auto" />
                </button>

                {/* Nav links + auth controls */}
                <nav className="flex items-center gap-1 overflow-x-auto min-w-0 scrollbar-none">
                    {navItems.map(({ label, href, activePath }) => (
                        <button
                            key={label}
                            onClick={() => { if (pathname !== href) navigate(href); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                            style={{
                                backgroundColor: pathname === activePath ? "#1d4ed8" : "transparent",
                            }}
                        >
                            {label}
                        </button>
                    ))}

                    {authSection && (
                        <div className="ml-3 pl-3 border-l border-white/30 flex items-center min-w-[80px] shrink-0">
                            {authSection}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
