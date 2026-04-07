"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useContext, useEffect, useRef } from "react";
import { FADE_MS, FadeRefContext } from "@/context/navigation";

export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);
    const fadeRef = useContext(FadeRefContext);
    const isFirstRender = useRef(true);
    const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Register the fade-out function so NavigationProvider can call it on navigation
    useEffect(() => {
        fadeRef.current = () => {
            const el = ref.current;
            if (!el) return;
            el.style.transition = `opacity ${FADE_MS}ms ease`;
            el.style.opacity = "0";

            // Fallback: if pathname never changes (e.g. middleware redirects back
            // to the same page), fade the content back in so the screen isn't blank.
            if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
            fallbackTimer.current = setTimeout(() => {
                if (el && el.style.opacity === "0") {
                    el.style.transition = `opacity ${FADE_MS}ms ease`;
                    el.style.opacity = "1";
                }
            }, FADE_MS + 500);
        };
        return () => {
            fadeRef.current = null;
            if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        };
    }, [fadeRef]);

    // Fade in once the new route's content is ready
    useEffect(() => {
        // Clear the fallback, the pathname changed so normal fade-in takes over
        if (fallbackTimer.current) {
            clearTimeout(fallbackTimer.current);
            fallbackTimer.current = null;
        }

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const el = ref.current;
        if (!el) return;
        el.style.transition = "none";
        el.style.opacity = "0";
        void el.offsetHeight;
        el.style.transition = `opacity ${FADE_MS}ms ease`;
        el.style.opacity = "1";
    }, [pathname]);

    return (
        <div ref={ref}>
            {children}
        </div>
    );
}
