import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "volunteer" | null;

interface AuthStore {
    role: Role;
    email: string | null;
    login: (email: string, role: Role) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            role: null,
            email: null,
            login: (email, role) => set({ email, role }),
            logout: () => set({ email: null, role: null }),
        }),
        { name: "sc-econ-auth" }
    )
);
