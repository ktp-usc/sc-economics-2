"use client";

import { useState } from "react";
import {
    Clock,
    CalendarCheck,
    ChevronRight,
    Award,
    MapPin,
    CheckCircle2,
    Circle,
    Download,
    User,
    Bell,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const volunteer = {
    name: "",
    email: "",
    joinedDate: "",
    avatar: "",
    district: "",
    status: "",
};

const stats = [
    { label: "Total Hours", value: "0", icon: Clock, color: "#003366", sub: "hrs logged" },
    { label: "Events Completed", value: "0", icon: CalendarCheck, color: "#1d4ed8", sub: "events" },
];

const badges: { name: string; icon: string; earned: boolean; date: string | null }[] = [];

type FilterType = "all" | "completed" | "upcoming";

type VolEvent = {
    id: number;
    name: string;
    date: string;
    location: string;
    hours: number;
    type: string;
    status: string;
    district: string;
};

const events: VolEvent[] = [];

const typeColors: Record<string, { bg: string; text: string }> = {
    "Student Contest": { bg: "#eff6ff", text: "#1d4ed8" },
    "Teacher PD":      { bg: "#f0fdf4", text: "#15803d" },
    "Workshop":        { bg: "#fff7ed", text: "#c2410c" },
    "Educator Event":  { bg: "#fdf4ff", text: "#7e22ce" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    sub: string;
}

function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex items-start gap-4">
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: color + "15" }}
            >
                <Icon size={22} style={{ color }} />
            </div>
            <div>
                <div className="text-3xl font-extrabold text-[#1e3a5f]">{value}</div>
                <div className="text-sm font-semibold text-gray-700 mt-0.5">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </div>
        </div>
    );
}

interface BadgeCardProps {
    name: string;
    icon: string;
    earned: boolean;
    date: string | null;
}

function BadgeCard({ name, icon, earned, date }: BadgeCardProps) {
    return (
        <div
            className={`rounded-xl p-4 text-center border transition-all ${
                earned
                    ? "bg-white border-blue-100 shadow-sm"
                    : "bg-gray-50 border-gray-100 opacity-50 grayscale"
            }`}
        >
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-xs font-bold text-[#1e3a5f]">{name}</div>
            {earned && date ? (
                <div className="text-[10px] text-gray-400 mt-1">{date}</div>
            ) : (
                <div className="text-[10px] text-gray-400 mt-1">Locked</div>
            )}
        </div>
    );
}

function EventRow({ event }: { event: VolEvent }) {
    const tc = typeColors[event.type] ?? { bg: "#f1f5f9", text: "#475569" };
    const isUpcoming = event.status === "upcoming";

    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border transition-all hover:shadow-sm ${
                isUpcoming ? "bg-blue-50/50 border-blue-100" : "bg-white border-gray-100"
            }`}
        >
            <div className="shrink-0">
                {isUpcoming ? (
                    <Circle size={18} className="text-blue-400" />
                ) : (
                    <CheckCircle2 size={18} className="text-green-500" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-[#1e3a5f] text-sm">{event.name}</span>
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: tc.bg, color: tc.text }}
                    >
                        {event.type}
                    </span>
                    {isUpcoming && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Upcoming
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <CalendarCheck size={11} /> {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin size={11} /> {event.location}
                    </span>
                    <span>{event.district}</span>
                </div>
            </div>

            <div className="text-center shrink-0">
                <div className="text-base font-extrabold text-[#003366]">{event.hours}h</div>
                <div className="text-[10px] text-gray-400">hours</div>
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VolunteerPortalPage() {
    const [filter, setFilter] = useState<FilterType>("all");
    const [activeTab, setActiveTab] = useState<"overview" | "events" | "badges">("overview");

    const filtered = events.filter((e) => (filter === "all" ? true : e.status === filter));

    const completedEvents = events.filter((e) => e.status === "completed");
    const upcomingEvents = events.filter((e) => e.status === "upcoming");
    const completedCount = completedEvents.length;
    const upcomingCount = upcomingEvents.length;
    const totalHours = completedEvents.reduce((s, e) => s + e.hours, 0);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Banner */}
            <div
                className="text-white py-10 px-4 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #001f4d 0%, #003366 55%, #1d4ed8 100%)" }}
            >
                <div
                    className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }}
                />
                <div
                    className="absolute bottom-0 left-8 w-48 h-32 rounded-full opacity-[0.07]"
                    style={{ background: "radial-gradient(circle, #93c5fd, transparent)" }}
                />

                <div className="relative max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold shrink-0"
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                border: "2px solid rgba(255,255,255,0.25)",
                            }}
                        >
                            {volunteer.avatar}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-extrabold">{volunteer.name}</h1>
                                <span className="text-xs bg-green-500/20 text-green-300 border border-green-400/30 rounded-full px-2.5 py-0.5 font-semibold">
                                    {volunteer.status}
                                </span>
                            </div>
                            <p className="text-blue-200 text-sm">{volunteer.email}</p>
                            <p className="text-blue-300 text-xs mt-1">
                                {volunteer.district} · Volunteer since {volunteer.joinedDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition">
                            <Bell size={15} /> Notifications
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition">
                            <User size={15} /> Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 flex">
                    {(["overview", "events", "badges"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="px-6 py-4 text-sm font-semibold capitalize border-b-2 transition-all"
                            style={{
                                borderBottomColor: activeTab === tab ? "#003366" : "transparent",
                                color: activeTab === tab ? "#003366" : "#6b7280",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                    <div className="flex flex-col gap-8">

                        <div>
                            <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">Your Impact</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {stats.map((s) => (
                                    <StatCard key={s.label} {...s} />
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-[#1e3a5f]">Progress to Next Badge</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">50 Hours — 🌟</p>
                                </div>
                                <span className="text-2xl font-extrabold text-[#003366]">{totalHours} / 50h</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-3 rounded-full"
                                    style={{
                                        width: `${Math.min((totalHours / 50) * 100, 100)}%`,
                                        background: "linear-gradient(90deg, #003366, #1d4ed8)",
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Just {Math.max(0, 50 - totalHours).toFixed(1)} more hours to unlock the 50 Hours badge!
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-[#1e3a5f]">Recent Events</h2>
                                <button
                                    onClick={() => setActiveTab("events")}
                                    className="text-sm font-semibold text-[#1d4ed8] flex items-center gap-1 hover:underline"
                                >
                                    View all <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {completedEvents
                                    .slice(-3)
                                    .reverse()
                                    .map((e) => (
                                        <EventRow key={e.id} event={e} />
                                    ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-[#1e3a5f]">Badges Earned</h2>
                                <button
                                    onClick={() => setActiveTab("badges")}
                                    className="text-sm font-semibold text-[#1d4ed8] flex items-center gap-1 hover:underline"
                                >
                                    View all <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {badges.map((b) => (
                                    <BadgeCard key={b.name} {...b} />
                                ))}
                            </div>
                        </div>

                        <div
                            className="rounded-2xl p-6 text-white relative overflow-hidden"
                            style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
                        >
                            <div
                                className="absolute right-0 top-0 bottom-0 w-40 opacity-10"
                                style={{ background: "radial-gradient(circle at right, #60a5fa, transparent)" }}
                            />
                            <h3 className="font-bold text-lg mb-1">Upcoming Commitments</h3>
                            <p className="text-blue-200 text-sm mb-4">
                                You have {upcomingCount} upcoming events registered.
                            </p>
                            <div className="flex flex-col gap-2">
                                {upcomingEvents.map((e) => (
                                    <div
                                        key={e.id}
                                        className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-3"
                                    >
                                        <div>
                                            <div className="font-semibold text-sm">{e.name}</div>
                                            <div className="text-blue-200 text-xs mt-0.5">
                                                {e.date} · {e.location}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{e.hours}h</div>
                                            <div className="text-blue-300 text-xs">scheduled</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* EVENTS */}
                {activeTab === "events" && (
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <h2 className="text-lg font-bold text-[#1e3a5f]">All Events</h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
                                    {(["all", "completed", "upcoming"] as FilterType[]).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                                            style={{
                                                background: filter === f ? "#003366" : "transparent",
                                                color: filter === f ? "#fff" : "#6b7280",
                                            }}
                                        >
                                            {f === "all"
                                                ? `All (${events.length})`
                                                : f === "completed"
                                                ? `Completed (${completedCount})`
                                                : `Upcoming (${upcomingCount})`}
                                        </button>
                                    ))}
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                                    <Download size={13} /> Export
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { label: "Total Hours Logged", value: `${totalHours}h` },
                                { label: "Events Completed", value: String(completedCount) },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="bg-white rounded-xl p-4 text-center border border-blue-50 shadow-sm"
                                >
                                    <div className="text-xl font-extrabold text-[#003366]">{value}</div>
                                    <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            {filtered.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    No events found.
                                </div>
                            ) : (
                                filtered.map((e) => <EventRow key={e.id} event={e} />)
                            )}
                        </div>
                    </div>
                )}

                {/* BADGES */}
                {activeTab === "badges" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-[#1e3a5f]">Your Badges</h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {badges.filter((b) => b.earned).length} of {badges.length} earned
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-2 shadow-sm">
                                <Award size={16} className="text-[#1d4ed8]" />
                                <span className="text-sm font-bold text-[#1e3a5f]">Volunteer</span>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Earned
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            {badges
                                .filter((b) => b.earned)
                                .map((b) => (
                                    <div
                                        key={b.name}
                                        className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm text-center"
                                    >
                                        <div className="text-4xl mb-3">{b.icon}</div>
                                        <div className="font-bold text-[#1e3a5f] text-sm">{b.name}</div>
                                        <div className="text-xs text-gray-400 mt-1">Earned {b.date}</div>
                                    </div>
                                ))}
                        </div>

                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Locked
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {badges
                                .filter((b) => !b.earned)
                                .map((b) => (
                                    <div
                                        key={b.name}
                                        className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center opacity-50"
                                    >
                                        <div className="text-4xl mb-3 grayscale">{b.icon}</div>
                                        <div className="font-bold text-gray-500 text-sm">{b.name}</div>
                                        <div className="text-xs text-gray-400 mt-1">Locked</div>
                                    </div>
                                ))}
                        </div>

                        <div
                            className="mt-8 rounded-2xl p-6 text-white text-center"
                            style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
                        >
                            <div className="text-3xl mb-2">🌟</div>
                            <h3 className="font-bold text-lg mb-1">50 Hours — Almost There!</h3>
                            <p className="text-blue-200 text-sm max-w-sm mx-auto">
                                You&apos;re only{" "}
                                <strong className="text-white">{Math.max(0, 50 - totalHours).toFixed(1)} hours away</strong> from unlocking
                                the 50 Hours badge. Sign up for your next event to reach it!
                            </p>
                            <button className="mt-4 bg-white text-[#003366] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition">
                                Find an Event
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}