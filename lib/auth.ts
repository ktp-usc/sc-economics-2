import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export async function getAuthenticatedAdmin(): Promise<User | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return null;

    const user = await prisma.user.findUnique({
        where: { sessionToken: token },
    });

    if (!user || user.role !== "admin") return null;

    return user;
}