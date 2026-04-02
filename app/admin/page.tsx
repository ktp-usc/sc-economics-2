"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, PlusCircle, CalendarDays, MapPin, Users } from "lucide-react";
import { useEventsStore } from "@/lib/stores/events";
import { useAuthStore } from "@/lib/stores/auth";
import {
    EventType, AgeGroup, Expertise, City,
    EXPERTISE_THEME, formatDate,
} from "@/lib/types";

// ── Shared style constants ─────────────────────────────────────────────────

const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";
const labelCls = "block text-sm font-semibold text-gray-900 mb-1.5";
const sectionHeadCls =
    "text-lg font-bold mb-3 pb-2.5 border-b border-blue-200 text-[#1e3a5f]";

// ── Form state ─────────────────────────────────────────────────────────────

interface EventDraft {
    title: string;
    description: string;
    venue: string;
    city: City;
    type: EventType;
    ageGroup: AgeGroup;
    expertise: Expertise;
    date: string;
    spotsTotal: string;
}

const EMPTY_DRAFT: EventDraft = {
    title: "",
    description: "",
    venue: "",
    city: "Columbia",
    type: "Event",
    ageGroup: "6–8",
    expertise: "Finance",
    date: "",
    spotsTotal: "",
};

const CITIES:     City[]      = ["Columbia", "Greenville", "Charleston", "Spartanburg", "Rock Hill", "Aiken", "Myrtle Beach"];
const TYPES:      EventType[] = ["Teaching", "Workshop", "Event"];
const AGE_GROUPS: AgeGroup[]  = ["K–5", "6–8", "9–12"];
const EXPERTISES: Expertise[] = ["Finance", "Teaching", "Technology", "Business", "Outreach"];

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const role = useAuthStore((s) => s.role);

    const events      = useEventsStore((s) => s.events);
    const addEvent    = useEventsStore((s) => s.addEvent);
    const removeEvent = useEventsStore((s) => s.removeEvent);

    const [draft, setDraft]           = useState<EventDraft>(EMPTY_DRAFT);
    const [errors, setErrors]         = useState<Partial<Record<keyof EventDraft, string>>>({});
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [justAdded, setJustAdded]   = useState(false);

    useEffect(() => {
        setMounted(true);
        if (role !== "admin") router.replace("/login");
    }, [role, router]);

    if (!mounted || role !== "admin") return null;

    const set = <K extends keyof EventDraft>(k: K, v: EventDraft[K]) =>
        setDraft((prev) => ({ ...prev, [k]: v }));

    function validate(): boolean {
        const e: Partial<Record<keyof EventDraft, string>> = {};
        if (!draft.title.trim())       e.title       = "Title is required";
        if (!draft.description.trim()) e.description = "Description is required";
        if (!draft.venue.trim())       e.venue       = "Venue is required";
        if (!draft.date)               e.date        = "Date is required";
        if (!draft.spotsTotal || Number(draft.spotsTotal) < 1)
            e.spotsTotal = "Enter a valid number of spots (min 1)";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit() {
        if (!validate()) return;
        addEvent({
            title:       draft.title.trim(),
            description: draft.description.trim(),
            venue:       draft.venue.trim(),
            city:        draft.city,
            type:        draft.type,
            ageGroup:    draft.ageGroup,
            expertise:   draft.expertise,
            date:        draft.date,
            spotsTotal:  Number(draft.spotsTotal),
        });
        setDraft(EMPTY_DRAFT);
        setErrors({});
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 4000);
    }

    // Auto-preview theme based on expertise
    const preview = EXPERTISE_THEME[draft.expertise];

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50">

            {/* ── Banner ────────────────────────────────────────────────── */}
            <div
                className="text-white py-10 px-4"
                style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
            >
                <div className="max-w-4xl mx-auto flex items-center gap-6">
                    <img src="/SC-Econ-logo.png" alt="SC Economics" className="h-14 w-auto shrink-0" />
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
                        <p className="text-blue-200">
                            Manage volunteer events — add new opportunities or remove existing ones.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

                {/* ── Add Event Form ────────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm p-10">
                    <h2 className={sectionHeadCls}>Add New Event</h2>

                    {/* Card preview */}
                    <div className="mb-8 rounded-xl overflow-hidden border border-gray-100 shadow-sm max-w-xs">
                        <div className={`bg-gradient-to-br ${preview.gradient} h-24 flex items-center justify-center`}>
                            <span className="text-5xl select-none">{preview.emoji}</span>
                        </div>
                        <div className="p-3 text-xs text-gray-400 text-center bg-gray-50">
                            Card appearance — auto-set by expertise
                        </div>
                    </div>

                    {/* Success notice */}
                    {justAdded && (
                        <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
                            Event added successfully and is now live on the Events page.
                        </div>
                    )}

                    {/* Event Details */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Event Details</h3>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className={labelCls}>Event Title *</label>
                                <input
                                    className={inputCls}
                                    placeholder="e.g., Financial Literacy Workshop"
                                    value={draft.title}
                                    onChange={(e) => set("title", e.target.value)}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Description *</label>
                                <textarea
                                    className={inputCls + " min-h-[88px] resize-y"}
                                    placeholder="Brief summary of what volunteers will be doing..."
                                    value={draft.description}
                                    onChange={(e) => set("description", e.target.value)}
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Location & Date */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Location & Date</h3>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Venue / School *</label>
                                <input
                                    className={inputCls}
                                    placeholder="e.g., Richland One Elementary"
                                    value={draft.venue}
                                    onChange={(e) => set("venue", e.target.value)}
                                />
                                {errors.venue && <p className="mt-1 text-xs text-red-500">{errors.venue}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>City *</label>
                                <select
                                    className={inputCls + " cursor-pointer"}
                                    value={draft.city}
                                    onChange={(e) => set("city", e.target.value as City)}
                                >
                                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Date *</label>
                                <input
                                    className={inputCls + " cursor-pointer"}
                                    type="date"
                                    value={draft.date}
                                    onChange={(e) => set("date", e.target.value)}
                                />
                                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Volunteer Spots Available *</label>
                                <input
                                    className={inputCls}
                                    type="number"
                                    min={1}
                                    max={200}
                                    placeholder="e.g., 10"
                                    value={draft.spotsTotal}
                                    onChange={(e) => set("spotsTotal", e.target.value)}
                                />
                                {errors.spotsTotal && <p className="mt-1 text-xs text-red-500">{errors.spotsTotal}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="mb-10">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Classification</h3>
                        <div className="grid grid-cols-3 gap-5">
                            <div>
                                <label className={labelCls}>Event Type *</label>
                                <select
                                    className={inputCls + " cursor-pointer"}
                                    value={draft.type}
                                    onChange={(e) => set("type", e.target.value as EventType)}
                                >
                                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Grade / Age Group *</label>
                                <select
                                    className={inputCls + " cursor-pointer"}
                                    value={draft.ageGroup}
                                    onChange={(e) => set("ageGroup", e.target.value as AgeGroup)}
                                >
                                    {AGE_GROUPS.map((a) => <option key={a}>Grades {a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Expertise Needed *</label>
                                <select
                                    className={inputCls + " cursor-pointer"}
                                    value={draft.expertise}
                                    onChange={(e) => set("expertise", e.target.value as Expertise)}
                                >
                                    {EXPERTISES.map((ex) => <option key={ex}>{ex}</option>)}
                                </select>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-400">
                            The card&apos;s color and icon are automatically set based on the expertise selected.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setDraft(EMPTY_DRAFT); setErrors({}); }}
                            className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 hover:opacity-90 transition"
                            style={{ backgroundColor: "#003366" }}
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add Event
                        </button>
                    </div>
                </div>

                {/* ── Existing Events ───────────────────────────────────── */}
                <div>
                    <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">
                        Current Events
                        {mounted && events.length > 0 && (
                            <span className="ml-2 text-sm font-semibold text-gray-400">({events.length})</span>
                        )}
                    </h2>

                    {!mounted || events.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm px-8 py-14 text-center text-gray-400">
                            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-500">No events yet</p>
                            <p className="text-sm mt-1">Events you add above will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden flex items-stretch"
                                >
                                    {/* Colour strip */}
                                    <div className={`bg-gradient-to-b ${event.gradient} w-2 shrink-0`} />

                                    {/* Emoji */}
                                    <div className="flex items-center justify-center px-4 text-3xl select-none bg-gray-50 border-r border-gray-100">
                                        {event.emoji}
                                    </div>

                                    {/* Info */}
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

                                    {/* Delete */}
                                    <div className="flex items-center px-4 gap-2 shrink-0">
                                        {confirmDelete === event.id ? (
                                            <>
                                                <button
                                                    onClick={() => setConfirmDelete(null)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 underline transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => { removeEvent(event.id); setConfirmDelete(null); }}
                                                    className="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 transition"
                                                >
                                                    Confirm Delete
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDelete(event.id)}
                                                className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50"
                                                title="Delete event"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
