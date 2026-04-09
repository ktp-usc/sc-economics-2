"use client";

import { usePathname } from "next/navigation";
import { useNavigate } from "@/context/navigation";
import { authClient } from "@/lib/auth/client";
import { LogOut } from "lucide-react";

/**
 * Public nav items — always visible regardless of auth state.
 * Protected pages (Apply, Events, Portal, Admin) are still linked
 * but the middleware will redirect to /login if the user isn't
 * authenticated, so we don't need to hide them here.
 */
const navItems = [
    { label: "Home",             href: "/" },
    { label: "Apply",            href: "/volunteer" },
    { label: "Events",           href: "/events" },
    { label: "Volunteer Portal", href: "/portal" },
    { label: "Admin",            href: "/admin" },
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

    // Admins and managers both get the Admin nav link since they share
    // access to event management, applications, and volunteer hours.
    const isStaff = role === "admin" || role === "manager";
    const navItems = isLoggedIn
        ? isStaff
            ? [...VOLUNTEER_NAV, ADMIN_EXTRA]
            : VOLUNTEER_NAV
        : PUBLIC_NAV;

    /**
     * Signs the user out via the Neon Auth client, then navigates
     * to the home page. The fetchOptions callback lets us run
     * navigation logic after the sign-out response completes.
     */
    const handleSignOut = async () => {
        await authClient.signOut();
        navigate("/");
    };

    return (
        <header
            className="text-white shadow-lg sticky top-0 z-50 w-full overflow-hidden"
            style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
        >
            <div className="w-full mx-auto px-4 flex items-center justify-between h-[70px] min-w-0">
                {/* Logo */}
                <button onClick={() => navigate("/")} className="flex items-center gap-3 shrink-0">
                    <img
                        src="/SC-Econ-logo.png"
                        alt="SC Economics"
                        className="h-12 w-auto"
                    />
                </button>

                {/* Nav links + auth controls */}
                <nav className="flex items-center gap-1 overflow-x-auto min-w-0 scrollbar-none">
                    {navItems.map(({ label, href }) => (
                        <button
                            key={href}
                            onClick={() => { if (pathname !== href) navigate(href); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                            style={{
                                backgroundColor: pathname === href ? "#1d4ed8" : "transparent",
                            }}
                        >
                            {label}
                        </button>
                    ))}

                    {/* Auth section — always reserve space so nav items don't shift
                        when the Login button appears after the /api/me fetch */}
                    <div className="ml-3 pl-3 border-l border-white/30 flex items-center min-w-[80px] shrink-0">
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
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: pathname === "/login" ? "#1d4ed8" : "transparent",
                                }}
                            >
                                Login
                            </button>
                        )
                    )}
                </nav>
            </div>
        </header>
    );
}