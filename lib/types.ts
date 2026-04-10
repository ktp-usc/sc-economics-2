export type EventType = "Teaching" | "Workshop" | "Event";
export type AgeGroup  = "K–5" | "6–8" | "9–12";
export type Expertise = "Finance" | "Teaching" | "Technology" | "Business" | "Outreach";
export type City      =
    | "Columbia" | "Greenville" | "Charleston"
    | "Spartanburg" | "Rock Hill" | "Aiken" | "Myrtle Beach";

export interface VolunteerEvent {
    id: number;
    title: string;
    description: string;
    venue: string;
    city: City;
    type: EventType;
    ageGroup: AgeGroup;
    expertise: Expertise;
    date: string; // ISO format: YYYY-MM-DD
    spotsTotal: number;
    spotsFilled: number;
    gradient: string;
    emoji: string;
    imageUrl?: string | null;
}

// Auto-assigned visual theme per expertise
export const EXPERTISE_THEME: Record<Expertise, { gradient: string; emoji: string }> = {
    Finance:    { gradient: "from-blue-600 to-blue-800",    emoji: "💰" },
    Teaching:   { gradient: "from-orange-500 to-red-600",   emoji: "🏫" },
    Technology: { gradient: "from-cyan-500 to-blue-600",    emoji: "💻" },
    Business:   { gradient: "from-amber-500 to-yellow-600", emoji: "🚀" },
    Outreach:   { gradient: "from-lime-500 to-green-600",   emoji: "🌱" },
};

export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}
