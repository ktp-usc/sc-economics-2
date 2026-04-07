"use client";

import { useState } from "react";
import {
    CheckCircle, XCircle, Users, Calendar, ClipboardList,
    ChevronDown, ChevronUp, Search, X, UserCheck, AlertCircle,
    Mail, Phone, MapPin, Star, Clock, Plus, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = "pending" | "approved" | "denied";
type Tab = "applications" | "volunteers" | "events" | "hours";

interface Application {
    id: number; firstName: string; lastName: string; email: string;
    phone: string; city: string; state: string; days: string[];
    skills: string; experience: string; motivation: string;
    status: AppStatus; appliedDate: string;
}

interface Volunteer {
    id: number; name: string; email: string; phone: string;
    city: string; skills: string; assignedEvents: number[];
}

interface Event {
    id: number; title: string; date: string; location: string;
    description: string; volunteersNeeded: number; assignedVolunteers: number[];
}

interface HoursLog {
    id: number; volunteerId: number; volunteerName: string;
    volunteerEmail: string; eventId: number; eventTitle: string;
    hours: number; note: string; loggedAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_APPLICATIONS: Application[] = [
    { id: 1, firstName: "Emily", lastName: "Carter", email: "emily.carter@email.com", phone: "(803) 555-0192", city: "Columbia", state: "South Carolina", days: ["Tuesday", "Thursday", "Saturday"], skills: "Teaching, Curriculum Design, Public Speaking", experience: "5 years as a high school economics teacher", motivation: "Passionate about financial literacy for youth.", status: "pending", appliedDate: "2025-03-10" },
    { id: 2, firstName: "Marcus", lastName: "Johnson", email: "marcusj@email.com", phone: "(864) 555-0347", city: "Greenville", state: "South Carolina", days: ["Monday", "Wednesday", "Friday"], skills: "Finance, Banking, Mentoring", experience: "15 years in commercial banking", motivation: "Want to give back to the community.", status: "pending", appliedDate: "2025-03-11" },
    { id: 3, firstName: "Priya", lastName: "Nair", email: "priya.n@email.com", phone: "(843) 555-0584", city: "Charleston", state: "South Carolina", days: ["Saturday", "Sunday"], skills: "Marketing, Event Planning, Social Media", experience: "Organized 3 non-profit fundraisers", motivation: "Economic education changed my life.", status: "approved", appliedDate: "2025-03-08" },
    { id: 4, firstName: "Derek", lastName: "Washington", email: "derek.w@email.com", phone: "(803) 555-0761", city: "Columbia", state: "South Carolina", days: ["Tuesday", "Thursday"], skills: "Technology, Data Analysis, Python", experience: "Software engineer with 8 years experience", motivation: "Combining tech skills with financial education.", status: "denied", appliedDate: "2025-03-05" },
    { id: 5, firstName: "Sophia", lastName: "Lee", email: "sophia.lee@email.com", phone: "(864) 555-0123", city: "Spartanburg", state: "South Carolina", days: ["Monday", "Wednesday", "Saturday"], skills: "Accounting, Tax Preparation, Financial Advising", experience: "CPA with 10 years in public accounting", motivation: "Want to teach students about budgeting.", status: "pending", appliedDate: "2025-03-12" },
];

const INITIAL_VOLUNTEERS: Volunteer[] = [
    { id: 3, name: "Priya Nair", email: "priya.n@email.com", phone: "(843) 555-0584", city: "Charleston", skills: "Marketing, Event Planning, Social Media", assignedEvents: [1] },
    { id: 10, name: "James Porter", email: "jporter@email.com", phone: "(803) 555-0910", city: "Columbia", skills: "Teaching, Finance, Leadership", assignedEvents: [1, 2] },
    { id: 11, name: "Aaliyah Brooks", email: "abrooks@email.com", phone: "(864) 555-0222", city: "Greenville", skills: "Public Speaking, Curriculum Design", assignedEvents: [] },
    { id: 12, name: "Carlos Mendez", email: "cmendez@email.com", phone: "(843) 555-0413", city: "Charleston", skills: "Technology, Event Planning", assignedEvents: [2] },
];

const INITIAL_EVENTS: Event[] = [
    { id: 1, title: "Financial Literacy Day – Richland One", date: "2025-04-05", location: "Columbia, SC", description: "Full-day financial literacy workshop for 9th graders.", volunteersNeeded: 6, assignedVolunteers: [3, 10] },
    { id: 2, title: "Stock Market Simulation – USC Upstate", date: "2025-04-19", location: "Spartanburg, SC", description: "Interactive stock market simulation for high school students.", volunteersNeeded: 4, assignedVolunteers: [10, 12] },
    { id: 3, title: "Personal Finance Summit", date: "2025-05-03", location: "Charleston, SC", description: "Annual summit bringing together educators and students.", volunteersNeeded: 8, assignedVolunteers: [] },
];

const INITIAL_HOURS: HoursLog[] = [
    { id: 1, volunteerId: 3, volunteerName: "Priya Nair", volunteerEmail: "priya.n@email.com", eventId: 1, eventTitle: "Financial Literacy Day – Richland One", hours: 6, note: "Led morning session", loggedAt: "2025-04-05" },
    { id: 2, volunteerId: 10, volunteerName: "James Porter", volunteerEmail: "jporter@email.com", eventId: 1, eventTitle: "Financial Literacy Day – Richland One", hours: 6, note: "Facilitated all three schools", loggedAt: "2025-04-05" },
    { id: 3, volunteerId: 10, volunteerName: "James Porter", volunteerEmail: "jporter@email.com", eventId: 2, eventTitle: "Stock Market Simulation – USC Upstate", hours: 4, note: "", loggedAt: "2025-04-19" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<AppStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    denied: "bg-red-100 text-red-800 border-red-300",
};
const statusIcons: Record<AppStatus, React.ReactNode> = {
    pending: <AlertCircle className="w-3.5 h-3.5" />,
    approved: <CheckCircle className="w-3.5 h-3.5" />,
    denied: <XCircle className="w-3.5 h-3.5" />,
};

// ─── Add Hours Modal ──────────────────────────────────────────────────────────

function AddHoursModal({
    volunteers, events, onAdd, onClose,
}: {
    volunteers: Volunteer[];
    events: Event[];
    onAdd: (log: Omit<HoursLog, "id">) => void;
    onClose: () => void;
}) {
    const [volunteerId, setVolunteerId] = useState<number | "">("");
    const [eventId, setEventId] = useState<number | "">("");
    const [hours, setHours] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        setError("");
        if (!volunteerId || !eventId || !hours) {
            setError("Volunteer, event, and hours are all required.");
            return;
        }
        const h = parseFloat(hours);
        if (isNaN(h) || h <= 0) {
            setError("Hours must be a positive number.");
            return;
        }
        const vol = volunteers.find((v) => v.id === volunteerId)!;
        const ev = events.find((e) => e.id === eventId)!;
        onAdd({
            volunteerId: vol.id,
            volunteerName: vol.name,
            volunteerEmail: vol.email,
            eventId: ev.id,
            eventTitle: ev.title,
            hours: h,
            note,
            loggedAt: new Date().toISOString().slice(0, 10),
        });
        onClose();
    };

    const selectCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";
    const inputCls  = selectCls;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-[#1e3a5f] text-base">Log Volunteer Hours</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Add hours for a completed event</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-4">
                    {error && (
                        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Volunteer <span className="text-red-500">*</span></label>
                        <select className={selectCls} value={volunteerId} onChange={(e) => setVolunteerId(Number(e.target.value))}>
                            <option value="">Select a volunteer…</option>
                            {volunteers.map((v) => (
                                <option key={v.id} value={v.id}>{v.name} — {v.email}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event <span className="text-red-500">*</span></label>
                        <select className={selectCls} value={eventId} onChange={(e) => setEventId(Number(e.target.value))}>
                            <option value="">Select an event…</option>
                            {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hours <span className="text-red-500">*</span></label>
                        <input className={inputCls} type="number" min="0.5" step="0.5" placeholder="e.g. 3.5" value={hours} onChange={(e) => setHours(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input className={inputCls} type="text" placeholder="e.g. Led morning session" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-lg text-white text-sm font-bold transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                    >
                        Log Hours
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const [activeTab, setActiveTab]     = useState<Tab>("applications");
    const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
    const [volunteers, setVolunteers]   = useState(INITIAL_VOLUNTEERS);
    const [events, setEvents]           = useState(INITIAL_EVENTS);
    const [hoursLogs, setHoursLogs]     = useState(INITIAL_HOURS);

    const [expandedApp, setExpandedApp]   = useState<number | null>(null);
    const [appSearch, setAppSearch]       = useState("");
    const [appFilter, setAppFilter]       = useState<AppStatus | "all">("all");

    const [volunteerSearch, setVolunteerSearch] = useState("");
    const [assignModal, setAssignModal]         = useState<{ volunteerId: number } | null>(null);

    const [eventSearch, setEventSearch]         = useState("");
    const [expandedEvent, setExpandedEvent]     = useState<number | null>(null);
    const [eventAssignModal, setEventAssignModal] = useState<{ eventId: number } | null>(null);

    const [hoursSearch, setHoursSearch]       = useState("");
    const [hoursVolFilter, setHoursVolFilter] = useState<number | "all">("all");
    const [showAddHours, setShowAddHours]     = useState(false);
    const [confirmDeleteHours, setConfirmDeleteHours] = useState<number | null>(null);

    // ── Application actions ──────────────────────────────────────────────────

    const handleAppDecision = (id: number, decision: AppStatus) => {
        setApplications((prev) => prev.map((a) => {
            if (a.id !== id) return a;
            if (decision === "approved") {
                const app = prev.find((x) => x.id === id)!;
                if (!volunteers.some((v) => v.id === id)) {
                    setVolunteers((vv) => [...vv, { id: app.id, name: `${app.firstName} ${app.lastName}`, email: app.email, phone: app.phone, city: app.city, skills: app.skills, assignedEvents: [] }]);
                }
            }
            return { ...a, status: decision };
        }));
    };

    // ── Assignment ───────────────────────────────────────────────────────────

    const toggleVolunteerEvent = (volunteerId: number, eventId: number) => {
        setVolunteers((prev) => prev.map((v) => {
            if (v.id !== volunteerId) return v;
            const has = v.assignedEvents.includes(eventId);
            return { ...v, assignedEvents: has ? v.assignedEvents.filter((e) => e !== eventId) : [...v.assignedEvents, eventId] };
        }));
        setEvents((prev) => prev.map((ev) => {
            if (ev.id !== eventId) return ev;
            const has = ev.assignedVolunteers.includes(volunteerId);
            return { ...ev, assignedVolunteers: has ? ev.assignedVolunteers.filter((v) => v !== volunteerId) : [...ev.assignedVolunteers, volunteerId] };
        }));
    };

    // ── Hours actions ────────────────────────────────────────────────────────

    const handleAddHours = (log: Omit<HoursLog, "id">) => {
        setHoursLogs((prev) => [{ ...log, id: Date.now() }, ...prev]);
        // TODO: POST /api/volunteers/hours
    };

    const handleDeleteHours = (id: number) => {
        setHoursLogs((prev) => prev.filter((h) => h.id !== id));
        setConfirmDeleteHours(null);
        // TODO: DELETE /api/volunteers/hours?id=...
    };

    // ── Derived ──────────────────────────────────────────────────────────────

    const filteredApps = applications.filter((a) => {
        const matchSearch = `${a.firstName} ${a.lastName} ${a.email} ${a.city}`.toLowerCase().includes(appSearch.toLowerCase());
        const matchFilter = appFilter === "all" || a.status === appFilter;
        return matchSearch && matchFilter;
    });

    const filteredVolunteers = volunteers.filter((v) =>
        `${v.name} ${v.email} ${v.city} ${v.skills}`.toLowerCase().includes(volunteerSearch.toLowerCase())
    );

    const filteredEvents = events.filter((ev) =>
        `${ev.title} ${ev.location} ${ev.description}`.toLowerCase().includes(eventSearch.toLowerCase())
    );

    const filteredHours = hoursLogs.filter((h) => {
        const matchSearch = `${h.volunteerName} ${h.volunteerEmail} ${h.eventTitle}`.toLowerCase().includes(hoursSearch.toLowerCase());
        const matchVol = hoursVolFilter === "all" || h.volunteerId === hoursVolFilter;
        return matchSearch && matchVol;
    });

    // Per-volunteer totals for the summary row
    const hoursByVolunteer = hoursLogs.reduce<Record<number, { name: string; total: number }>>((acc, h) => {
        if (!acc[h.volunteerId]) acc[h.volunteerId] = { name: h.volunteerName, total: 0 };
        acc[h.volunteerId].total += h.hours;
        return acc;
    }, {});

    const pendingCount = applications.filter((a) => a.status === "pending").length;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50">

            {/* Header */}
            <div className="text-white py-8 px-4" style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}>
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
                    <p className="text-blue-200">Manage applications, volunteers, events, and hours</p>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-6xl mx-auto px-4 -mt-4">
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: "Pending Applications", value: pendingCount, icon: <ClipboardList className="w-5 h-5" />, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
                        { label: "Active Volunteers",    value: volunteers.length, icon: <Users className="w-5 h-5" />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
                        { label: "Upcoming Events",      value: events.length, icon: <Calendar className="w-5 h-5" />, color: "text-green-700", bg: "bg-green-50 border-green-200" },
                        { label: "Total Hours Logged",   value: hoursLogs.reduce((s, h) => s + h.hours, 0) + "h", icon: <Clock className="w-5 h-5" />, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
                    ].map((s) => (
                        <div key={s.label} className={`bg-white rounded-xl border ${s.bg} shadow-sm px-5 py-4 flex items-center gap-4`}>
                            <div className={s.color}>{s.icon}</div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 mt-6">
                <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
                    {([
                        { key: "applications", label: "Applications", icon: <ClipboardList className="w-4 h-4" /> },
                        { key: "volunteers",   label: "Volunteers",   icon: <Users className="w-4 h-4" /> },
                        { key: "events",       label: "Events",       icon: <Calendar className="w-4 h-4" /> },
                        { key: "hours",        label: "Hours",        icon: <Clock className="w-4 h-4" /> },
                    ] as { key: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === t.key ? "bg-[#003366] text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                            {t.icon}{t.label}
                            {t.key === "applications" && pendingCount > 0 && (
                                <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">{pendingCount}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">

                {/* ── APPLICATIONS ── */}
                {activeTab === "applications" && (
                    <div>
                        <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="Search by name, email, or city…" value={appSearch} onChange={(e) => setAppSearch(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                {(["all", "pending", "approved", "denied"] as const).map((f) => (
                                    <button key={f} onClick={() => setAppFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition capitalize ${appFilter === f ? "bg-[#003366] text-white border-[#003366]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{f}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {filteredApps.length === 0 && <div className="text-center py-16 text-gray-400">No applications found.</div>}
                            {filteredApps.map((app) => (
                                <div key={app.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">{app.firstName[0]}{app.lastName[0]}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-900">{app.firstName} {app.lastName}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusColors[app.status]}`}>{statusIcons[app.status]}{app.status}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-500 flex-wrap">
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.city}, {app.state}</span>
                                                <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {app.status === "pending" && (
                                                <>
                                                    <button onClick={() => handleAppDecision(app.id, "approved")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                                                    <button onClick={() => handleAppDecision(app.id, "denied")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"><XCircle className="w-3.5 h-3.5" /> Deny</button>
                                                </>
                                            )}
                                            {app.status !== "pending" && (
                                                <button onClick={() => handleAppDecision(app.id, "pending")} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition">Reset</button>
                                            )}
                                            <button onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                                                {expandedApp === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedApp === app.id && (
                                        <div className="border-t border-gray-100 px-6 py-5 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p><p className="flex items-center gap-1.5 text-gray-700"><Phone className="w-3.5 h-3.5 text-gray-400" />{app.phone}</p></div>
                                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Availability</p><div className="flex flex-wrap gap-1">{app.days.map((d) => <span key={d} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{d}</span>)}</div></div>
                                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Skills</p><p className="text-gray-700">{app.skills}</p></div>
                                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</p><p className="text-gray-700">{app.experience || <span className="italic text-gray-400">None provided</span>}</p></div>
                                            <div className="sm:col-span-2"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivation</p><p className="text-gray-700">{app.motivation}</p></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── VOLUNTEERS ── */}
                {activeTab === "volunteers" && (
                    <div>
                        <div className="relative mb-5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input className="w-full sm:w-80 pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="Search volunteers…" value={volunteerSearch} onChange={(e) => setVolunteerSearch(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVolunteers.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">No volunteers found.</div>}
                            {filteredVolunteers.map((vol) => {
                                const totalHours = hoursLogs.filter((h) => h.volunteerId === vol.id).reduce((s, h) => s + h.hours, 0);
                                const assignedEventNames = events.filter((ev) => vol.assignedEvents.includes(ev.id)).map((ev) => ev.title);
                                return (
                                    <div key={vol.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">{vol.name.split(" ").map((n) => n[0]).join("")}</div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 truncate">{vol.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{vol.email}</p>
                                            </div>
                                            {/* Hours badge */}
                                            <div className="shrink-0 text-right">
                                                <div className="text-lg font-extrabold text-[#003366]">{totalHours}h</div>
                                                <div className="text-[10px] text-gray-400">logged</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{vol.phone}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{vol.city}</span>
                                            <span className="flex items-center gap-1.5"><Star className="w-3 h-3" />{vol.skills}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assigned Events</p>
                                            {assignedEventNames.length > 0
                                                ? <div className="flex flex-col gap-1">{assignedEventNames.map((name) => <span key={name} className="text-xs bg-green-100 text-green-700 rounded-full px-2.5 py-1 font-medium truncate">{name}</span>)}</div>
                                                : <p className="text-xs text-gray-400 italic">No events assigned</p>}
                                        </div>
                                        <div className="mt-auto flex gap-2">
                                            <button onClick={() => setAssignModal({ volunteerId: vol.id })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#003366] text-[#003366] text-xs font-semibold hover:bg-blue-50 transition">
                                                <UserCheck className="w-3.5 h-3.5" /> Assign Events
                                            </button>
                                            <button
                                                onClick={() => { setActiveTab("hours"); setHoursVolFilter(vol.id); }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-purple-300 text-purple-700 text-xs font-semibold hover:bg-purple-50 transition"
                                            >
                                                <Clock className="w-3.5 h-3.5" /> View Hours
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── EVENTS ── */}
                {activeTab === "events" && (
                    <div>
                        <div className="relative mb-5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input className="w-full sm:w-80 pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="Search events…" value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-4">
                            {filteredEvents.length === 0 && <div className="text-center py-16 text-gray-400">No events found.</div>}
                            {filteredEvents.map((ev) => {
                                const assignedVols = volunteers.filter((v) => ev.assignedVolunteers.includes(v.id));
                                const filled = ev.assignedVolunteers.length;
                                const pct = Math.min((filled / ev.volunteersNeeded) * 100, 100);
                                const isExpanded = expandedEvent === ev.id;
                                return (
                                    <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h3 className="font-bold text-[#1e3a5f] text-base truncate">{ev.title}</h3>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${filled >= ev.volunteersNeeded ? "bg-green-100 text-green-700 border-green-300" : "bg-yellow-100 text-yellow-700 border-yellow-300"}`}>{filled}/{ev.volunteersNeeded} volunteers</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ev.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ev.description}</p>
                                                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button onClick={() => setEventAssignModal({ eventId: ev.id })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition" style={{ backgroundColor: "#003366" }}>
                                                        <UserCheck className="w-3.5 h-3.5" /> Assign
                                                    </button>
                                                    <button onClick={() => setExpandedEvent(isExpanded ? null : ev.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Assigned Volunteers</p>
                                                {assignedVols.length === 0
                                                    ? <p className="text-sm text-gray-400 italic">No volunteers assigned yet.</p>
                                                    : <div className="flex flex-col gap-2">{assignedVols.map((v) => (
                                                        <div key={v.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{v.name.split(" ").map((n) => n[0]).join("")}</div>
                                                                <div><p className="text-sm font-medium text-gray-800">{v.name}</p><p className="text-xs text-gray-500">{v.email}</p></div>
                                                            </div>
                                                            <button onClick={() => toggleVolunteerEvent(v.id, ev.id)} className="text-xs text-red-500 hover:text-red-700 font-medium transition">Remove</button>
                                                        </div>
                                                    ))}</div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── HOURS ── */}
                {activeTab === "hours" && (
                    <div>
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <div className="flex gap-3 flex-1 flex-wrap">
                                <div className="relative flex-1 min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="Search by volunteer or event…" value={hoursSearch} onChange={(e) => setHoursSearch(e.target.value)} />
                                </div>
                                <select
                                    className="px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    value={hoursVolFilter}
                                    onChange={(e) => setHoursVolFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                                >
                                    <option value="all">All Volunteers</option>
                                    {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={() => setShowAddHours(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold transition hover:opacity-90 shrink-0"
                                style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                            >
                                <Plus className="w-4 h-4" /> Log Hours
                            </button>
                        </div>

                        {/* Volunteer totals summary */}
                        {hoursVolFilter === "all" && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                {Object.entries(hoursByVolunteer).map(([id, { name, total }]) => (
                                    <button
                                        key={id}
                                        onClick={() => setHoursVolFilter(Number(id))}
                                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-left hover:border-blue-300 hover:shadow transition"
                                    >
                                        <div className="text-xl font-extrabold text-[#003366]">{total}h</div>
                                        <div className="text-xs text-gray-600 font-medium mt-0.5 truncate">{name}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Logs table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {filteredHours.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 text-sm">No hours logged yet.</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left">Volunteer</th>
                                            <th className="px-5 py-3 text-left">Event</th>
                                            <th className="px-5 py-3 text-left">Hours</th>
                                            <th className="px-5 py-3 text-left">Note</th>
                                            <th className="px-5 py-3 text-left">Date</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredHours.map((h) => (
                                            <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="font-medium text-gray-900">{h.volunteerName}</div>
                                                    <div className="text-xs text-gray-400">{h.volunteerEmail}</div>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-700 max-w-[200px] truncate">{h.eventTitle}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className="font-bold text-[#003366]">{h.hours}h</span>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-500 italic text-xs">{h.note || "—"}</td>
                                                <td className="px-5 py-3.5 text-gray-500 text-xs">{h.loggedAt}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    {confirmDeleteHours === h.id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-xs text-gray-500">Delete?</span>
                                                            <button onClick={() => handleDeleteHours(h.id)} className="text-xs text-red-600 font-bold hover:text-red-800 transition">Yes</button>
                                                            <button onClick={() => setConfirmDeleteHours(null)} className="text-xs text-gray-500 hover:text-gray-700 transition">No</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setConfirmDeleteHours(h.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── VOLUNTEER ASSIGN MODAL ── */}
            {assignModal && (() => {
                const vol = volunteers.find((v) => v.id === assignModal.volunteerId);
                if (!vol) return null;
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div><h3 className="font-bold text-[#1e3a5f] text-base">Assign Events</h3><p className="text-xs text-gray-500">{vol.name}</p></div>
                                <button onClick={() => setAssignModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
                                {events.map((ev) => {
                                    const assigned = vol.assignedEvents.includes(ev.id);
                                    return (
                                        <label key={ev.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                                            <input type="checkbox" checked={assigned} onChange={() => toggleVolunteerEvent(vol.id, ev.id)} className="w-4 h-4 accent-[#003366]" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                                                <p className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString()} · {ev.location}</p>
                                            </div>
                                            {assigned && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Assigned</span>}
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                                <button onClick={() => setAssignModal(null)} className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: "#003366" }}>Done</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── EVENT ASSIGN MODAL ── */}
            {eventAssignModal && (() => {
                const ev = events.find((e) => e.id === eventAssignModal.eventId);
                if (!ev) return null;
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div><h3 className="font-bold text-[#1e3a5f] text-base">Assign Volunteers</h3><p className="text-xs text-gray-500 truncate max-w-xs">{ev.title}</p></div>
                                <button onClick={() => setEventAssignModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
                                {volunteers.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">No volunteers in the database yet.</p>}
                                {volunteers.map((vol) => {
                                    const assigned = ev.assignedVolunteers.includes(vol.id);
                                    return (
                                        <label key={vol.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                                            <input type="checkbox" checked={assigned} onChange={() => toggleVolunteerEvent(vol.id, ev.id)} className="w-4 h-4 accent-[#003366]" />
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">{vol.name.split(" ").map((n) => n[0]).join("")}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800">{vol.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{vol.skills}</p>
                                            </div>
                                            {assigned && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Assigned</span>}
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-xs text-gray-500">{ev.assignedVolunteers.length}/{ev.volunteersNeeded} spots filled</p>
                                <button onClick={() => setEventAssignModal(null)} className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: "#003366" }}>Done</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── ADD HOURS MODAL ── */}
            {showAddHours && (
                <AddHoursModal
                    volunteers={volunteers}
                    events={events}
                    onAdd={handleAddHours}
                    onClose={() => setShowAddHours(false)}
                />
            )}
        </div>
    );
}