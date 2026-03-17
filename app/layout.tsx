import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Header from "@/components/header";

export const metadata: Metadata = {
    title: "SC Economics Volunteer",
    description: "SC Economics Volunteer Management System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body>
        <Header />
        {children}
        </body>
        </html>
    );
}