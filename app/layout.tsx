import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Link from "next/link";
import Image from "next/image";
export const metadata: Metadata = {
    title: "Volunteer Application | SC Economics",
    description: "KTP SP26"
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}