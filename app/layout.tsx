import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Header from "@/components/header";
import PageTransition from "@/components/PageTransition";
import { NavigationProvider } from "@/context/navigation";

export const metadata: Metadata = {
    title: "SC Economics Volunteer",
    description: "SC Economics Volunteer Management System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body>
        <NavigationProvider>
            <Header />
            <PageTransition>
                {children}
            </PageTransition>
        </NavigationProvider>
        </body>
        </html>
    );
}