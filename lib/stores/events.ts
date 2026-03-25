import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VolunteerEvent, Expertise, EXPERTISE_THEME } from "@/lib/types";

interface EventsStore {
    events: VolunteerEvent[];
    signedUpIds: number[];
    addEvent: (draft: Omit<VolunteerEvent, "id" | "spotsFilled" | "gradient" | "emoji">) => void;
    removeEvent: (id: number) => void;
    signUp: (id: number) => void;
}

export const useEventsStore = create<EventsStore>()(
    persist(
        (set) => ({
            events: [],
            signedUpIds: [],

            addEvent: (draft) => {
                const theme = EXPERTISE_THEME[draft.expertise as Expertise];
                set((state) => ({
                    events: [
                        ...state.events,
                        { ...draft, id: Date.now(), spotsFilled: 0, ...theme },
                    ],
                }));
            },

            removeEvent: (id) =>
                set((state) => ({
                    events: state.events.filter((e) => e.id !== id),
                    signedUpIds: state.signedUpIds.filter((sid) => sid !== id),
                })),

            signUp: (id) =>
                set((state) => ({
                    events: state.events.map((e) =>
                        e.id === id ? { ...e, spotsFilled: e.spotsFilled + 1 } : e
                    ),
                    signedUpIds: [...state.signedUpIds, id],
                })),
        }),
        { name: "sc-econ-events" }
    )
);
