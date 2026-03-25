"use client";

import { usePathname } from "next/navigation";
import { useNavigate } from "@/context/navigation";

const navItems = [
    { label: "Apply",            href: "/"        },
    { label: "Events",           href: "/events"  },
    { label: "Volunteer Portal", href: "/portal"  },
    { label: "Admin",            href: "/admin"   },
    { label: "Login",            href: "/login"   },
];

export default function Header(): React.JSX.Element {
    const pathname = usePathname();
    const navigate = useNavigate();

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
                <nav className="flex gap-1">
                    {navItems.map(({ label, href }) => (
                        <button
                            key={href}
                            onClick={() => navigate(href)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: pathname === href ? "#1d4ed8" : "transparent",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
}