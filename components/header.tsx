"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "Apply",                 href: "/"        },
    { label: "Volunteer Portal",      href: "/portal"  },
    { label: "Admin",                 href: "/admin"   },
];

export default function Header(): Element {
    const pathname = usePathname();

    return (
        <header
            className="text-white shadow-lg sticky top-0 z-50"
            style={{ backgroundColor: "#003366" }}
        >
            <div className="mx-auto px-6 flex items-center justify-between h-[70px]">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/SC-Econ-logo.png"
                        alt="SC Economics"
                        className="h-12 w-auto"
                    />
                </Link>

                {/* Nav links */}
                <nav className="flex gap-1">
                    {navItems.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: pathname === href ? "#1d4ed8" : "transparent",
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}