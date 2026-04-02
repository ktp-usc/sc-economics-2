"use client";

import { usePathname } from "next/navigation";
import { useNavigate } from "@/context/navigation";
import { useAuthStore } from "@/lib/stores/auth";

const publicNavItems = [
    { label: "Home",             href: "/" },
    { label: "Apply",            href: "/volunteer" },
    { label: "Events",           href: "/events" },
    { label: "Volunteer Portal", href: "/portal" },
];

export default function Header(): React.JSX.Element {
    const pathname = usePathname();
    const navigate = useNavigate();
    const { role, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate("/login");
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

                {/* Nav links */}
                <nav className="flex gap-1 items-center">
                    {publicNavItems.map(({ label, href }) => {
                        const resolvedLabel = (href === "/portal" && role === "admin") ? "Admin Dashboard" : label;
                        const resolvedHref  = (href === "/portal" && role === "admin") ? "/admin" : href;
                        return (
                            <button
                                key={href}
                                onClick={() => { if (pathname !== resolvedHref) navigate(resolvedHref); }}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: pathname === resolvedHref ? "#1d4ed8" : "transparent",
                                }}
                            >
                                {resolvedLabel}
                            </button>
                        );
                    })}

                    {role === null ? (
                        <button
                            onClick={() => { if (pathname !== "/login") navigate("/login"); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: pathname === "/login" ? "#1d4ed8" : "transparent",
                            }}
                        >
                            Login
                        </button>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                        >
                            Logout
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
