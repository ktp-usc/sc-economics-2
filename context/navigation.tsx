"use client";

import { useRouter } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useRef } from "react";

export const FADE_MS = 300;

// Internal: lets PageTransition register its fade-out callback with NavigationProvider
export const FadeRefContext = createContext<{ current: (() => void) | null }>({ current: null });

const NavigationContext = createContext<(href: string) => void>(() => {});
export const useNavigate = () => useContext(NavigationContext);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const fadeRef = useRef<(() => void) | null>(null);

    const navigate = useCallback((href: string) => {
        fadeRef.current?.();
        setTimeout(() => router.push(href), FADE_MS);
    }, [router]);

    return (
        <FadeRefContext.Provider value={fadeRef}>
            <NavigationContext.Provider value={navigate}>
                {children}
            </NavigationContext.Provider>
        </FadeRefContext.Provider>
    );
}
