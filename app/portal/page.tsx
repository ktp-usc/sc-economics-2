"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useEventsStore } from "@/lib/stores/events";
import { formatDate } from "@/lib/types";

export default function PortalPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const { role, email } = useAuthStore();
    const { events, signedUpIds, signUp } = useEventsStore();

    useEffect(() => {
        setMounted(true);
        if (role === null) router.replace("/login");
        if (role === "admin") router.replace("/admin");
    }, [role, router]);

    if (!mounted || role !== "volunteer") return null;

    const myEvents = events.filter((e) => signedUpIds.includes(e.id));
    const availableEvents = events.filter((e) => !signedUpIds.includes(e.id));

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50">

            {/* Banner */}
            <div
                className="text-white py-10 px-4"
                style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
            >
                <div className="max-w-4xl mx-auto flex items-center gap-6">
                    <img src="/SC-Econ-logo.png" alt="SC Economics" className="h-14 w-auto shrink-0" />
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Volunteer Portal</h1>
                        <p className="text-blue-200">
                            Welcome back, {email}. Browse upcoming events and manage your sign-ups.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

                {/* My Sign-ups */}
                <div>
                    <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">
                        My Sign-ups
                        {myEvents.length > 0 && (
                            <span className="ml-2 text-sm font-semibold text-gray-400">({myEvents.length})</span>
                        )}
                    </h2>

                    {myEvents.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm px-8 py-10 text-center text-gray-400">
                            <CalendarDays className="w-9 h-9 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-500">No sign-ups yet</p>
                            <p className="text-sm mt-1">Browse available events below to get started.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {myEvents.map((event) => (
                                <EventRow key={event.id} event={event} badge="Signed up" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Available Events */}
                <div>
                    <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">
                        Available Events
                        {availableEvents.length > 0 && (
                            <span className="ml-2 text-sm font-semibold text-gray-400">({availableEvents.length})</span>
                        )}
                    </h2>

                    {availableEvents.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm px-8 py-10 text-center text-gray-400">
                            <CalendarDays className="w-9 h-9 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-500">No events available right now</p>
                            <p className="text-sm mt-1">Check back soon for new opportunities.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {availableEvents.map((event) => (
                                <EventRow
                                    key={event.id}
                                    event={event}
                                    action={
                                        event.spotsFilled < event.spotsTotal
                                            ? { label: "Sign Up", onClick: () => signUp(event.id) }
                                            : undefined
                                    }
                                    fullLabel={event.spotsFilled >= event.spotsTotal ? "Full" : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface EventRowProps {
    event: ReturnType<typeof useEventsStore.getState>["events"][number];
    badge?: string;
    action?: { label: string; onClick: () => void };
    fullLabel?: string;
}

function EventRow({ event, badge, action, fullLabel }: EventRowProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex items-stretch">
            <div className={`bg-gradient-to-b ${event.gradient} w-2 shrink-0`} />
            <div className="flex items-center justify-center px-4 text-3xl select-none bg-gray-50 border-r border-gray-100">
                {event.emoji}
            </div>
            <div className="flex-1 px-5 py-4 min-w-0">
                <p className="font-bold text-[#1e3a5f] text-sm truncate">{event.title}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.venue}, {event.city}
                    </span>
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.spotsFilled} / {event.spotsTotal} signed up
                    </span>
                </div>
            </div>
            <div className="flex items-center px-4 shrink-0">
                {badge && (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                        {badge}
                    </span>
                )}
                {fullLabel && (
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {fullLabel}
                    </span>
                )}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="text-xs font-bold text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition"
                        style={{ backgroundColor: "#003366" }}
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
}
