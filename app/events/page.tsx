"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { MapPin, Calendar, Users, X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import {
    VolunteerEvent, EventType, AgeGroup, Expertise, City, EXPERTISE_THEME, formatDate,
} from "@/lib/types";

// ── API → display value maps ───────────────────────────────────────────────

const AGE_GROUP_MAP: Record<string, AgeGroup> = {
    K_5:   "K–5",
    G6_8:  "6–8",
    G9_12: "9–12",
};

const CITY_MAP: Record<string, City> = {
    Rock_Hill:    "Rock Hill",
    Myrtle_Beach: "Myrtle Beach",
};

function normalizeEvent(raw: Record<string, unknown>): VolunteerEvent {
    const expertise = raw.expertise as Expertise;
    const ageGroup  = (AGE_GROUP_MAP[raw.ageGroup as string] ?? raw.ageGroup) as AgeGroup;
    const city      = (CITY_MAP[raw.city as string]      ?? raw.city)      as City;
    // Prisma serialises DateTime as ISO-8601; strip to YYYY-MM-DD for formatDate()
    const date = (raw.date as string).slice(0, 10);

    return {
        id:          raw.id          as number,
        title:       raw.title       as string,
        description: raw.description as string,
        venue:       raw.venue       as string,
        spotsTotal:  raw.spotsTotal  as number,
        spotsFilled: raw.spotsFilled as number,
        type:        raw.type        as EventType,
        expertise,
        ageGroup,
        city,
        date,
        imageUrl:    (raw.imageUrl as string | null) ?? undefined,
        ...EXPERTISE_THEME[expertise],
    };
}

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

const PAGE_SIZE = 9;

function isExpired(dateStr: string) {
    const today = new Date().toISOString().split("T")[0];
    return dateStr < today;
}

/** Renders title + description with line clamping; shows "Read more" only when text is actually truncated. */
function EventCardText({ title, description }: { title: string; description: string }) {
    const [expanded, setExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const titleRef  = useRef<HTMLHeadingElement>(null);
    const descRef   = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const t = titleRef.current;
        const d = descRef.current;
        const titleOverflow = t ? t.scrollHeight > t.clientHeight : false;
        const descOverflow  = d ? d.scrollHeight > d.clientHeight : false;
        setIsClamped(titleOverflow || descOverflow);
    }, [title, description]);

    return (
        <>
            <h3
                ref={titleRef}
                className={`text-base font-bold text-[#1e3a5f] mb-3 leading-snug ${!expanded ? "line-clamp-1" : ""}`}
            >
                {title}
            </h3>
            <p
                ref={descRef}
                className={`text-sm text-gray-600 leading-relaxed flex-1 whitespace-pre-line ${!expanded ? "line-clamp-3" : ""} ${isClamped ? "mb-2" : "mb-5"}`}
            >
                {description}
            </p>
            {isClamped && (
                <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold mb-5 self-start transition"
                >
                    {expanded ? "Show less" : "Read more"}
                </button>
            )}
        </>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function EventsPage() {
    const [events,      setEvents]      = useState<VolunteerEvent[]>([]);
    const [isLoading,   setIsLoading]   = useState(true);
    const [signedUpIds, setSignedUpIds] = useState<number[]>([]);
    const [applicationStatus, setApplicationStatus] = useState<string | null>(null); // "pending" | "approved" | "denied" | null
    const canSignUp = applicationStatus === "approved";

    const [filters, setFilters]         = useState<Filters>(INITIAL_FILTERS);
    const [signUpEvent, setSignUpEvent] = useState<VolunteerEvent | null>(null);
    const [justConfirmed, setJustConfirmed] = useState(false);
    const [signUpError, setSignUpError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmWithdraw, setConfirmWithdraw] = useState<number | null>(null);

    // Sign-up form fields
    const [why, setWhy]             = useState("");

    useEffect(() => {
        Promise.all([
            fetch("/api/events").then((r) => r.ok ? r.json() : []),
            fetch("/api/me/signups").then((r) => r.ok ? r.json() : []),
            fetch("/api/me").then((r) => r.ok ? r.json() : null),
        ])
            .then(([rawEvents, signups, me]: [Record<string, unknown>[], { eventId: number }[], { applicationStatus?: string } | null]) => {
                setEvents(rawEvents.map(normalizeEvent));
                setSignedUpIds(signups.map((s) => s.eventId));
                setApplicationStatus(me?.applicationStatus ?? null);
            })
            .catch(() => setEvents([]))
            .finally(() => setIsLoading(false));
    }, []);

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const set = <K extends keyof Filters>(k: K, v: Filters[K]) => {
        setFilters((prev) => ({ ...prev, [k]: v }));
        setVisibleCount(PAGE_SIZE);
    };

    const isFiltered = Object.values(filters).some((v) => v !== "All");

    const filtered = useMemo(() => {
        const matched = events.filter((e) =>
            (filters.city      === "All" || e.city      === filters.city) &&
            (filters.type      === "All" || e.type      === filters.type) &&
            (filters.ageGroup  === "All" || e.ageGroup  === filters.ageGroup) &&
            (filters.expertise === "All" || e.expertise === filters.expertise)
        );
        // Upcoming events first (sorted by date asc), then expired events at the bottom
        return matched.sort((a, b) => {
            const aExp = isExpired(a.date);
            const bExp = isExpired(b.date);
            if (aExp !== bExp) return aExp ? 1 : -1;
            return a.date.localeCompare(b.date);
        });
    }, [events, filters]);

    const visible = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;

    // Infinite scroll — observe a sentinel element at the bottom of the grid
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadMore = useCallback(() => {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
    }, [filtered.length]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) loadMore(); },
            { rootMargin: "200px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMore]);

    const openCount = events.filter((e) => e.spotsFilled < e.spotsTotal && !isExpired(e.date)).length;
    const spotsLeft = events.reduce((sum, e) => isExpired(e.date) ? sum : sum + Math.max(0, e.spotsTotal - e.spotsFilled), 0);

    function resetSignUpForm() {
        setWhy("");
        setSignUpError(null);
    }

    function openSignUpModal(event: VolunteerEvent) {
        resetSignUpForm();
        setSignUpEvent(event);
    }

    async function handleConfirm(event: VolunteerEvent) {
        if (!why.trim()) {
            setSignUpError("Please fill in all required fields.");
            return;
        }
        setIsSubmitting(true);
        setSignUpError(null);
        try {
            const res = await fetch(`/api/events/${event.id}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ why: why.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                setSignUpError(data.error ?? "Failed to sign up.");
                return;
            }
            setSignedUpIds((prev) => [...prev, event.id]);
            setEvents((prev) => prev.map((e) =>
                e.id === event.id ? { ...e, spotsFilled: e.spotsFilled + 1 } : e
            ));
            setSignUpEvent(null);
            setJustConfirmed(true);
            setTimeout(() => setJustConfirmed(false), 4000);
        } catch {
            setSignUpError("Failed to sign up. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleWithdraw(eventId: number) {
        try {
            const res = await fetch(`/api/events/${eventId}/signup`, { method: "DELETE" });
            if (!res.ok) return;
            setSignedUpIds((prev) => prev.filter((id) => id !== eventId));
            setEvents((prev) => prev.map((e) =>
                e.id === eventId ? { ...e, spotsFilled: Math.max(0, e.spotsFilled - 1) } : e
            ));
        } catch {
            // silently fail
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-70px)] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
                        style={{ borderColor: "#003366", borderTopColor: "transparent" }}
                    />
                    <p className="text-gray-500 text-sm font-medium">Loading events…</p>
                </div>
            </div>
        );
    }

    const fieldCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

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
                            <div className="text-2xl font-bold">{events.length}</div>
                            <div className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">Total Events</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <div className="text-2xl font-bold">{openCount}</div>
                            <div className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">Open</div>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <div className="text-2xl font-bold">{spotsLeft}</div>
                            <div className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">Spots Left</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* ── No events at all ──────────────────────────────────── */}
                {events.length === 0 ? (
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
                                    onClick={() => { setFilters(INITIAL_FILTERS); setVisibleCount(PAGE_SIZE); }}
                                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition"
                                >
                                    Clear filters
                                </button>
                            )}
                            <p className="ml-auto text-sm text-gray-400 self-center">
                                Showing {filtered.length} of {events.length} events
                            </p>
                        </div>

                        {/* ── Application status banner ─────────────────── */}
                        {!canSignUp && (
                            <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-blue-800 text-sm font-medium shadow-sm">
                                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                {applicationStatus === null
                                    ? <>You need to submit a volunteer application before you can sign up for events. <a href="/volunteer" className="underline font-bold hover:text-blue-900">Apply now</a></>
                                    : applicationStatus === "pending"
                                        ? "Your volunteer application is under review. You'll be able to sign up for events once it's approved."
                                        : "Your volunteer application was not approved. Please contact us for more information."}
                            </div>
                        )}

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
                                    onClick={() => { setFilters(INITIAL_FILTERS); setVisibleCount(PAGE_SIZE); }}
                                    className="text-blue-600 underline text-sm hover:text-blue-800 transition"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visible.map((event) => {
                                    const expired    = isExpired(event.date);
                                    const isFull     = event.spotsFilled >= event.spotsTotal;
                                    const isSignedUp = signedUpIds.includes(event.id);
                                    const remaining  = event.spotsTotal - event.spotsFilled;

                                    return (
                                        <div
                                            key={event.id}
                                            className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow ${expired ? "opacity-60" : ""}`}
                                        >
                                            {/* Photo area */}
                                            <div className={`${event.imageUrl ? "" : `bg-gradient-to-br ${event.gradient}`} h-40 flex items-center justify-center relative shrink-0`}>
                                                {event.imageUrl ? (
                                                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-6xl select-none">{event.emoji}</span>
                                                )}
                                                <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
                                                    expired
                                                        ? "bg-black/30 text-white"
                                                        : isSignedUp
                                                            ? "bg-white/90 text-green-700"
                                                            : isFull
                                                                ? "bg-black/30 text-white"
                                                                : "bg-white/20 text-white"
                                                }`}>
                                                    {expired
                                                        ? "Expired"
                                                        : isSignedUp
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

                                                <EventCardText title={event.title} description={event.description} />

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

                                                {expired ? (
                                                    <div className="w-full py-2.5 rounded-lg text-sm font-bold text-center bg-gray-100 text-gray-400">
                                                        Event Passed
                                                    </div>
                                                ) : isSignedUp ? (
                                                    confirmWithdraw === event.id ? (
                                                        <div className="flex gap-2 w-full">
                                                            <button
                                                                onClick={() => { handleWithdraw(event.id); setConfirmWithdraw(null); }}
                                                                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition bg-red-600 text-white hover:bg-red-700"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmWithdraw(null)}
                                                                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition border border-gray-200 text-gray-600 hover:bg-gray-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmWithdraw(event.id)}
                                                            className="w-full py-2.5 rounded-lg text-sm font-bold transition bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                        >
                                                            Withdraw
                                                        </button>
                                                    )
                                                ) : !canSignUp ? (
                                                    <div className="w-full py-2.5 rounded-lg text-sm font-bold text-center bg-gray-100 text-gray-400 cursor-not-allowed">
                                                        {applicationStatus === null ? "Apply to Sign Up" : applicationStatus === "pending" ? "Application Pending" : "Application Denied"}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => !isFull && openSignUpModal(event)}
                                                        disabled={isFull}
                                                        className={`w-full py-2.5 rounded-lg text-sm font-bold transition ${
                                                            isFull
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "text-white hover:opacity-90"
                                                        }`}
                                                        style={!isFull ? { backgroundColor: "#003366" } : undefined}
                                                    >
                                                        {isFull ? "Event Full" : "Sign Up"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Infinite scroll sentinel */}
                            <div ref={sentinelRef} className="h-1" />
                            {hasMore && (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                </div>
                            )}
                            </>
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
                        <div className={`${signUpEvent.imageUrl ? "" : `bg-gradient-to-br ${signUpEvent.gradient}`} h-28 flex items-center justify-center relative`}>
                            {signUpEvent.imageUrl ? (
                                <img src={signUpEvent.imageUrl} alt={signUpEvent.title} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-6xl select-none">{signUpEvent.emoji}</span>
                            )}
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

                            {signUpError && (
                                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {signUpError}
                                </div>
                            )}

                            <div className="flex flex-col gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Why do you want to volunteer? <span className="text-red-500">*</span></label>
                                    <textarea className={fieldCls + " resize-none"} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Tell us why you'd like to help at this event…" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSignUpEvent(null)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConfirm(signUpEvent)}
                                    disabled={isSubmitting}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                                    style={{ backgroundColor: "#003366" }}
                                >
                                    {isSubmitting ? "Signing up…" : "Confirm Sign Up"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
