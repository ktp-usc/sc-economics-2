"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useContext, useEffect, useRef } from "react";
import { FADE_MS, FadeRefContext } from "@/context/navigation";

export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);
    const fadeRef = useContext(FadeRefContext);
    const isFirstRender = useRef(true);

    // Register the fade-out function so NavigationProvider can call it on navigation
    useEffect(() => {
        fadeRef.current = () => {
            const el = ref.current;
            if (!el) return;
            el.style.transition = `opacity ${FADE_MS}ms ease`;
            el.style.opacity = "0";
        };
        return () => { fadeRef.current = null; };
    }, [fadeRef]);

    // Fade in once the new route's content is ready
    useEffect(() => {
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
