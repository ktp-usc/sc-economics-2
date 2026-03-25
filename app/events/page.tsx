"use client";

import { useEffect, useState, useMemo } from "react";
import { MapPin, Calendar, Users, X, CheckCircle } from "lucide-react";
import { useEventsStore } from "@/lib/stores/events";
import {
    VolunteerEvent, EventType, AgeGroup, Expertise, City, formatDate,
} from "@/lib/types";

// ── Badge colour maps ──────────────────────────────────────────────────────

const TYPE_COLORS: Record<EventType, string> = {
    Teaching: "bg-blue-100 text-blue-800",
    Workshop:  "bg-purple-100 text-purple-800",
    Event:     "bg-green-100 text-green-800",
};
const AGE_COLORS: Record<AgeGroup, string> = {
    "K–5":  "bg-yellow-100 text-yellow-800",
    "6–8":  "bg-orange-100 text-orange-800",
    "9–12": "bg-red-100 text-red-800",
};
const EXPERTISE_COLORS: Record<Expertise, string> = {
    Finance:    "bg-emerald-100 text-emerald-800",
    Teaching:   "bg-sky-100 text-sky-800",
    Technology: "bg-indigo-100 text-indigo-800",
    Business:   "bg-amber-100 text-amber-800",
    Outreach:   "bg-rose-100 text-rose-800",
};

// ── Filter types ───────────────────────────────────────────────────────────

interface Filters {
    city: City | "All";
    type: EventType | "All";
    ageGroup: AgeGroup | "All";
    expertise: Expertise | "All";
}
const INITIAL_FILTERS: Filters = { city: "All", type: "All", ageGroup: "All", expertise: "All" };

const CITIES:     (City | "All")[]      = ["All", "Columbia", "Greenville", "Charleston", "Spartanburg", "Rock Hill", "Aiken", "Myrtle Beach"];
const TYPES:      (EventType | "All")[] = ["All", "Teaching", "Workshop", "Event"];
const AGE_GROUPS: (AgeGroup | "All")[]  = ["All", "K–5", "6–8", "9–12"];
const EXPERTISES: (Expertise | "All")[] = ["All", "Finance", "Teaching", "Technology", "Business", "Outreach"];

const selectCls =
    "px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer transition";

// ── Page ───────────────────────────────────────────────────────────────────

export default function EventsPage() {
    // Prevent SSR/localStorage hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const events      = useEventsStore((s) => s.events);
    const signedUpIds = useEventsStore((s) => s.signedUpIds);
    const signUp      = useEventsStore((s) => s.signUp);

    const [filters, setFilters]         = useState<Filters>(INITIAL_FILTERS);
    const [signUpEvent, setSignUpEvent] = useState<VolunteerEvent | null>(null);
    const [justConfirmed, setJustConfirmed] = useState(false);

    const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
        setFilters((prev) => ({ ...prev, [k]: v }));

    const isFiltered = Object.values(filters).some((v) => v !== "All");

    const filtered = useMemo(() => {
        if (!mounted) return [];
        return events.filter((e) =>
            (filters.city      === "All" || e.city      === filters.city) &&
            (filters.type      === "All" || e.type      === filters.type) &&
            (filters.ageGroup  === "All" || e.ageGroup  === filters.ageGroup) &&
            (filters.expertise === "All" || e.expertise === filters.expertise)
        );
    }, [mounted, events, filters]);

    const openCount = mounted ? events.filter((e) => e.spotsFilled < e.spotsTotal).length : 0;
    const spotsLeft = mounted
        ? events.reduce((sum, e) => sum + Math.max(0, e.spotsTotal - e.spotsFilled), 0)
        : 0;

    function handleConfirm(event: VolunteerEvent) {
        signUp(event.id);
        setSignUpEvent(null);
        setJustConfirmed(true);
        setTimeout(() => setJustConfirmed(false), 4000);
    }

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50">

            {/* ── Banner ────────────────────────────────────────────────── */}
            <div
                className="text-white py-10 px-4"
                style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
            >
                <div className="max-w-6xl mx-auto flex items-center gap-6">
                    <img src="/SC-Econ-logo.png" alt="SC Economics" className="h-14 w-auto shrink-0" />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-1">Volunteer Events</h1>
                        <p className="text-blue-200">
                            Browse open events and sign up to make a difference in South Carolina classrooms.
                        </p>
                    </div>
                    <div className="hidden md:flex gap-6 text-center shrink-0">
                        <div>
                            <div className="text-2xl font-bold">{mounted ? events.length : "—"}</div>
                            <div className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">Total Events</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <div className="text-2xl font-bold">{mounted ? openCount : "—"}</div>
                            <div className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">Open</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <div className="text-2xl font-bold">{mounted ? spotsLeft : "—"}</div>
                            <div className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">Spots Left</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* ── No events at all ──────────────────────────────────── */}
                {mounted && events.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <div className="text-5xl mb-4">📅</div>
                        <p className="text-lg font-semibold text-gray-500 mb-2">No events scheduled yet</p>
                        <p className="text-sm text-gray-400">Check back soon — new volunteer opportunities are added regularly.</p>
                    </div>
                ) : (
                    <>
                        {/* ── Filter bar ────────────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm p-5 mb-8 flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Location
                                </label>
                                <select
                                    className={selectCls}
                                    value={filters.city}
                                    onChange={(e) => set("city", e.target.value as Filters["city"])}
                                >
                                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Type
                                </label>
                                <select
                                    className={selectCls}
                                    value={filters.type}
                                    onChange={(e) => set("type", e.target.value as Filters["type"])}
                                >
                                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Age Group
                                </label>
                                <select
                                    className={selectCls}
                                    value={filters.ageGroup}
                                    onChange={(e) => set("ageGroup", e.target.value as Filters["ageGroup"])}
                                >
                                    {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Expertise Needed
                                </label>
                                <select
                                    className={selectCls}
                                    value={filters.expertise}
                                    onChange={(e) => set("expertise", e.target.value as Filters["expertise"])}
                                >
                                    {EXPERTISES.map((ex) => <option key={ex}>{ex}</option>)}
                                </select>
                            </div>
                            {isFiltered && (
                                <button
                                    onClick={() => setFilters(INITIAL_FILTERS)}
                                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition"
                                >
                                    Clear filters
                                </button>
                            )}
                            <p className="ml-auto text-sm text-gray-400 self-center">
                                Showing {filtered.length} of {events.length} events
                            </p>
                        </div>

                        {/* ── Success toast ─────────────────────────────── */}
                        {justConfirmed && (
                            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-800 text-sm font-medium shadow-sm">
                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                You&apos;re signed up! We&apos;ll send event details to your email soon.
                            </div>
                        )}

                        {/* ── Event grid ────────────────────────────────── */}
                        {filtered.length === 0 ? (
                            <div className="text-center py-24 text-gray-400">
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="text-lg font-medium text-gray-500 mb-3">No events match your filters</p>
                                <button
                                    onClick={() => setFilters(INITIAL_FILTERS)}
                                    className="text-blue-600 underline text-sm hover:text-blue-800 transition"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((event) => {
                                    const isFull     = event.spotsFilled >= event.spotsTotal;
                                    const isSignedUp = signedUpIds.includes(event.id);
                                    const remaining  = event.spotsTotal - event.spotsFilled;

                                    return (
                                        <div
                                            key={event.id}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                                        >
                                            {/* Photo area */}
                                            <div className={`bg-gradient-to-br ${event.gradient} h-40 flex items-center justify-center relative shrink-0`}>
                                                <span className="text-6xl select-none">{event.emoji}</span>
                                                <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
                                                    isSignedUp
                                                        ? "bg-white/90 text-green-700"
                                                        : isFull
                                                        ? "bg-black/30 text-white"
                                                        : "bg-white/20 text-white"
                                                }`}>
                                                    {isSignedUp
                                                        ? "✓ Signed Up"
                                                        : isFull
                                                        ? "Full"
                                                        : `${remaining} spot${remaining !== 1 ? "s" : ""} left`}
                                                </div>
                                            </div>

                                            <div className="p-5 flex flex-col flex-1">
                                                {/* Badges */}
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[event.type]}`}>
                                                        {event.type}
                                                    </span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${AGE_COLORS[event.ageGroup]}`}>
                                                        Grades {event.ageGroup}
                                                    </span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${EXPERTISE_COLORS[event.expertise]}`}>
                                                        {event.expertise}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-[#1e3a5f] mb-3 leading-snug">
                                                    {event.title}
                                                </h3>

                                                <div className="flex flex-col gap-1.5 mb-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                        {event.venue}, {event.city}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                        {formatDate(event.date)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5 shrink-0" />
                                                        {event.spotsFilled} / {event.spotsTotal} volunteers
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">
                                                    {event.description}
                                                </p>

                                                <button
                                                    onClick={() => !isFull && !isSignedUp && setSignUpEvent(event)}
                                                    disabled={isFull || isSignedUp}
                                                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition ${
                                                        isSignedUp
                                                            ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                                                            : isFull
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "text-white hover:opacity-90"
                                                    }`}
                                                    style={!isFull && !isSignedUp ? { backgroundColor: "#003366" } : undefined}
                                                >
                                                    {isSignedUp ? "✓ Signed Up" : isFull ? "Event Full" : "Sign Up"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Sign-up modal ──────────────────────────────────────────── */}
            {signUpEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && setSignUpEvent(null)}
                >
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className={`bg-gradient-to-br ${signUpEvent.gradient} h-28 flex items-center justify-center relative`}>
                            <span className="text-6xl select-none">{signUpEvent.emoji}</span>
                            <button
                                onClick={() => setSignUpEvent(null)}
                                className="absolute top-3 right-3 text-white/70 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-7">
                            <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">{signUpEvent.title}</h2>
                            <div className="flex gap-1.5 mb-5">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[signUpEvent.type]}`}>
                                    {signUpEvent.type}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${AGE_COLORS[signUpEvent.ageGroup]}`}>
                                    Grades {signUpEvent.ageGroup}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 text-sm text-gray-600 mb-5">
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                    {signUpEvent.venue}, {signUpEvent.city}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                    {formatDate(signUpEvent.date)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400 shrink-0" />
                                    {signUpEvent.spotsTotal - signUpEvent.spotsFilled} spot
                                    {signUpEvent.spotsTotal - signUpEvent.spotsFilled !== 1 ? "s" : ""} remaining
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed mb-7">{signUpEvent.description}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSignUpEvent(null)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConfirm(signUpEvent)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition"
                                    style={{ backgroundColor: "#003366" }}
                                >
                                    Confirm Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
