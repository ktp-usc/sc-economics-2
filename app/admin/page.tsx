"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    CheckCircle, XCircle, Users, Calendar, ClipboardList,
    ChevronDown, ChevronUp, Search, X, AlertCircle,
    Mail, Phone, MapPin, Star, Clock, Plus, Trash2,
} from "lucide-react";
import { useNavigate } from "@/context/navigation";

// ─── Types (matching DB schema) ───────────────────────────────────────────────

type AppStatus = "pending" | "approved" | "denied";
type Tab = "applications" | "volunteers" | "events" | "hours";

interface Application {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    availableDays: string[];
    skills: string;
    experience: string | null;
    motivation: string;
    status: AppStatus;
    appliedAt: string;
}

interface AdminEvent {
    id: number;
    title: string;
    description: string;
    venue: string;
    city: string;
    type: string;
    ageGroup: string;
    expertise: string;
    date: string;
    spotsTotal: number;
    spotsFilled: number;
}

interface HoursLog {
    id: number;
    userEmail: string;
    eventId: number;
    event: { id: number; title: string; date: string };
    hours: number;
    note: string | null;
    loggedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<AppStatus, string> = {
    pending:  "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    denied:   "bg-red-100 text-red-800 border-red-300",
};

const statusIcons: Record<AppStatus, React.ReactNode> = {
    pending:  <AlertCircle className="w-3.5 h-3.5" />,
    approved: <CheckCircle className="w-3.5 h-3.5" />,
    denied:   <XCircle className="w-3.5 h-3.5" />,
};

const CITY_OPTIONS = [
    { value: "Columbia",     label: "Columbia" },
    { value: "Greenville",   label: "Greenville" },
    { value: "Charleston",   label: "Charleston" },
    { value: "Spartanburg",  label: "Spartanburg" },
    { value: "Rock_Hill",    label: "Rock Hill" },
    { value: "Aiken",        label: "Aiken" },
    { value: "Myrtle_Beach", label: "Myrtle Beach" },
];

const TYPE_OPTIONS = [
    { value: "Teaching", label: "Teaching" },
    { value: "Workshop", label: "Workshop" },
    { value: "Event",    label: "Event" },
];

const AGE_OPTIONS = [
    { value: "K_5",   label: "K–5" },
    { value: "G6_8",  label: "6–8" },
    { value: "G9_12", label: "9–12" },
];

const EXPERTISE_OPTIONS = [
    { value: "Finance",    label: "Finance" },
    { value: "Teaching",   label: "Teaching" },
    { value: "Technology", label: "Technology" },
    { value: "Business",   label: "Business" },
    { value: "Outreach",   label: "Outreach" },
];

// Convert Prisma enum key → display string (Rock_Hill → Rock Hill)
function displayEnum(val: string) {
    const AGE_MAP: Record<string, string> = { K_5: "K–5", G6_8: "6–8", G9_12: "9–12" };
    return AGE_MAP[val] ?? val.replace(/_/g, " ");
}

// ─── CREATE EVENT MODAL ───────────────────────────────────────────────────────

function CreateEventModal({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (event: AdminEvent) => void;
}) {
    const [title,       setTitle]       = useState("");
    const [description, setDescription] = useState("");
    const [venue,       setVenue]       = useState("");
    const [city,        setCity]        = useState("");
    const [type,        setType]        = useState("");
    const [ageGroup,    setAgeGroup]    = useState("");
    const [expertise,   setExpertise]   = useState("");
    const [date,        setDate]        = useState("");
    const [spotsTotal,  setSpotsTotal]  = useState("");
    const [error,       setError]       = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fieldCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

    const handleSubmit = async () => {
        setError("");
        if (!title.trim() || !description.trim() || !venue.trim() || !city || !type || !ageGroup || !expertise || !date || !spotsTotal) {
            setError("All fields are required.");
            return;
        }
        if (venue.trim().length < 3) {
            setError("Venue must be at least 3 characters.");
            return;
        }
        const today = new Date().toISOString().split("T")[0];
        if (date < today) {
            setError("Event date cannot be in the past.");
            return;
        }
        const spots = parseInt(spotsTotal, 10);
        if (isNaN(spots) || spots < 1) {
            setError("Total spots must be a positive number.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(), description: description.trim(),
                    venue: venue.trim(), city, type, ageGroup, expertise,
                    date, spotsTotal: spots,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Failed to create event.");
                return;
            }
            onCreate(await res.json());
            onClose();
        } catch {
            setError("Failed to create event.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-[#1e3a5f] text-base">Create New Event</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Add a new event to the platform</p>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                        <input className={fieldCls} type="text" placeholder="e.g. Financial Literacy Day – Richland One" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                        <textarea className={fieldCls + " resize-none"} rows={3} placeholder="Describe the event…" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Venue <span className="text-red-500">*</span></label>
                            <input className={fieldCls} type="text" placeholder="e.g. Richland One School District" value={venue} onChange={(e) => setVenue(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                            <select className={fieldCls} value={city} onChange={(e) => setCity(e.target.value)}>
                                <option value="">Select city…</option>
                                {CITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type <span className="text-red-500">*</span></label>
                            <select className={fieldCls} value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="">Select…</option>
                                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age Group <span className="text-red-500">*</span></label>
                            <select className={fieldCls} value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
                                <option value="">Select…</option>
                                {AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expertise <span className="text-red-500">*</span></label>
                            <select className={fieldCls} value={expertise} onChange={(e) => setExpertise(e.target.value)}>
                                <option value="">Select…</option>
                                {EXPERTISE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                            <input className={fieldCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Spots <span className="text-red-500">*</span></label>
                            <input className={fieldCls} type="number" min="1" placeholder="e.g. 10" value={spotsTotal} onChange={(e) => setSpotsTotal(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-lg text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                    >
                        {isSubmitting ? "Creating…" : "Create Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── ADD HOURS MODAL ──────────────────────────────────────────────────────────

function AddHoursModal({
    volunteers,
    events,
    onAdd,
    onClose,
}: {
    volunteers: { id: number; name: string; email: string }[];
    events: AdminEvent[];
    onAdd: (log: HoursLog) => void;
    onClose: () => void;
}) {
    const [volunteerEmail, setVolunteerEmail] = useState("");
    const [eventId,        setEventId]        = useState<number | "">("");
    const [hours,          setHours]          = useState("");
    const [note,           setNote]           = useState("");
    const [error,          setError]          = useState("");
    const [isSubmitting,   setIsSubmitting]   = useState(false);

    const selectCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

    const handleSubmit = async () => {
        setError("");
        if (!volunteerEmail || eventId === "" || !hours) {
            setError("Volunteer, event, and hours are all required.");
            return;
        }
        const h = parseFloat(hours);
        if (isNaN(h) || h <= 0) {
            setError("Hours must be a positive number.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/volunteers/hours", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId:    volunteerEmail,
                    userEmail: volunteerEmail,
                    eventId:   Number(eventId),
                    hours:     h,
                    note:      note.trim() || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Failed to log hours.");
                return;
            }
            onAdd(await res.json());
            onClose();
        } catch {
            setError("Failed to log hours.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <select className={selectCls} value={volunteerEmail} onChange={(e) => setVolunteerEmail(e.target.value)}>
                            <option value="">Select a volunteer…</option>
                            {volunteers.map((v) => (
                                <option key={v.email} value={v.email}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event <span className="text-red-500">*</span></label>
                        <select className={selectCls} value={eventId} onChange={(e) => setEventId(e.target.value === "" ? "" : Number(e.target.value))}>
                            <option value="">Select an event…</option>
                            {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                    {ev.title} ({new Date(ev.date).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hours <span className="text-red-500">*</span></label>
                        <input className={selectCls} type="number" min="0.5" step="0.5" placeholder="e.g. 3.5" value={hours} onChange={(e) => setHours(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input className={selectCls} type="text" placeholder="e.g. Led morning session" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-lg text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                    >
                        {isSubmitting ? "Logging…" : "Log Hours"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const navigate = useNavigate();

    const [isReady,      setIsReady]      = useState(false);
    const [activeTab,    setActiveTab]    = useState<Tab>("applications");
    const [applications, setApplications] = useState<Application[]>([]);
    const [events,       setEvents]       = useState<AdminEvent[]>([]);
    const [hoursLogs,    setHoursLogs]    = useState<HoursLog[]>([]);

    // Application tab UI state
    const [expandedApp,  setExpandedApp]  = useState<number | null>(null);
    const [appSearch,    setAppSearch]    = useState("");
    const [appFilter,    setAppFilter]    = useState<AppStatus | "all">("all");

    // Volunteers tab UI state
    const [volunteerSearch, setVolunteerSearch] = useState("");

    // Events tab UI state
    const [eventSearch,       setEventSearch]       = useState("");
    const [expandedEvent,     setExpandedEvent]     = useState<number | null>(null);
    const [showCreateEvent,   setShowCreateEvent]   = useState(false);
    const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<number | null>(null);

    // Hours tab UI state
    const [hoursSearch,       setHoursSearch]       = useState("");
    const [hoursEmailFilter,  setHoursEmailFilter]  = useState<string | "all">("all");
    const [showAddHours,      setShowAddHours]       = useState(false);
    const [confirmDeleteHours, setConfirmDeleteHours] = useState<number | null>(null);

    // ── Auth check + initial data load ────────────────────────────────────────
    useEffect(() => {
        async function init() {
            const meRes = await fetch("/api/me");
            if (!meRes.ok) { navigate("/login"); return; }
            const me = await meRes.json();
            if (me.role !== "admin") { navigate("/login"); return; }

            const [appsRes, eventsRes, hoursRes] = await Promise.all([
                fetch("/api/applications"),
                fetch("/api/events"),
                fetch("/api/volunteers/hours"),
            ]);

            const [apps, evts, hours] = await Promise.all([
                appsRes.ok   ? appsRes.json()   : [],
                eventsRes.ok ? eventsRes.json()  : [],
                hoursRes.ok  ? hoursRes.json()   : [],
            ]);

            setApplications(apps);
            // Upcoming events first (by date asc), expired events at the bottom
            const today = new Date().toISOString().split("T")[0];
            const sorted = [...evts].sort((a: AdminEvent, b: AdminEvent) => {
                const aExp = a.date.slice(0, 10) < today;
                const bExp = b.date.slice(0, 10) < today;
                if (aExp !== bExp) return aExp ? 1 : -1;
                return a.date.localeCompare(b.date);
            });
            setEvents(sorted);
            setHoursLogs(hours);
            setIsReady(true);
        }
        init().catch(() => navigate("/login"));
    }, [navigate]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const volunteers = useMemo(
        () => applications
            .filter((a) => a.status === "approved")
            .map((a) => ({
                id:     a.id,
                name:   `${a.firstName} ${a.lastName}`,
                email:  a.email,
                phone:  a.phone,
                city:   a.city,
                skills: a.skills,
            })),
        [applications]
    );

    const emailToName = useMemo(() => {
        const map: Record<string, string> = {};
        volunteers.forEach((v) => { map[v.email] = v.name; });
        return map;
    }, [volunteers]);

    // ── Application actions ───────────────────────────────────────────────────

    const handleAppDecision = useCallback(async (id: number, decision: AppStatus) => {
        const res = await fetch(`/api/applications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: decision }),
        });
        if (res.ok) {
            setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: decision } : a));
        }
    }, []);

    // ── Event actions ─────────────────────────────────────────────────────────

    const handleCreateEvent = useCallback((event: AdminEvent) => {
        setEvents((prev) => {
            const next = [...prev, event];
            const today = new Date().toISOString().split("T")[0];
            return next.sort((a, b) => {
                const aExp = a.date.slice(0, 10) < today;
                const bExp = b.date.slice(0, 10) < today;
                if (aExp !== bExp) return aExp ? 1 : -1;
                return a.date.localeCompare(b.date);
            });
        });
    }, []);

    const handleDeleteEvent = useCallback(async (id: number) => {
        const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
        if (res.ok) {
            setEvents((prev) => prev.filter((e) => e.id !== id));
            setConfirmDeleteEvent(null);
        }
    }, []);

    // ── Hours actions ─────────────────────────────────────────────────────────

    const handleAddHours = useCallback((log: HoursLog) => {
        setHoursLogs((prev) => [log, ...prev]);
    }, []);

    const handleDeleteHours = useCallback(async (id: number) => {
        const res = await fetch(`/api/volunteers/hours?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            setHoursLogs((prev) => prev.filter((h) => h.id !== id));
            setConfirmDeleteHours(null);
        }
    }, []);

    // ── Filtered data ─────────────────────────────────────────────────────────

    const filteredApps = applications.filter((a) => {
        const matchSearch = `${a.firstName} ${a.lastName} ${a.email} ${a.city}`
            .toLowerCase().includes(appSearch.toLowerCase());
        const matchFilter = appFilter === "all" || a.status === appFilter;
        return matchSearch && matchFilter;
    });

    const filteredVolunteers = volunteers.filter((v) =>
        `${v.name} ${v.email} ${v.city} ${v.skills}`.toLowerCase().includes(volunteerSearch.toLowerCase())
    );

    const filteredEvents = events.filter((ev) =>
        `${ev.title} ${ev.venue} ${ev.city} ${ev.description}`.toLowerCase().includes(eventSearch.toLowerCase())
    );

    const filteredHours = hoursLogs.filter((h) => {
        const name = emailToName[h.userEmail] ?? h.userEmail;
        const matchSearch = `${name} ${h.userEmail} ${h.event?.title ?? ""}`
            .toLowerCase().includes(hoursSearch.toLowerCase());
        const matchVol = hoursEmailFilter === "all" || h.userEmail === hoursEmailFilter;
        return matchSearch && matchVol;
    });

    const hoursByEmail = hoursLogs.reduce<Record<string, { name: string; total: number }>>((acc, h) => {
        const key  = h.userEmail;
        const name = emailToName[key] ?? h.userEmail;
        if (!acc[key]) acc[key] = { name, total: 0 };
        acc[key].total += h.hours;
        return acc;
    }, {});

    const pendingCount = applications.filter((a) => a.status === "pending").length;

    // ── Loading ───────────────────────────────────────────────────────────────

    if (!isReady) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
                        style={{ borderColor: "#003366", borderTopColor: "transparent" }}
                    />
                    <p className="text-gray-500 text-sm font-medium">Loading admin dashboard…</p>
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50">

            {/* Header banner */}
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
                        { label: "Total Hours Logged",   value: `${hoursLogs.reduce((s, h) => s + h.hours, 0)}h`, icon: <Clock className="w-5 h-5" />, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
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

            {/* Tab content */}
            <div className="max-w-6xl mx-auto px-4 py-6">

                {/* ── APPLICATIONS ── */}
                {activeTab === "applications" && (
                    <div>
                        <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    placeholder="Search by name, email, or city…"
                                    value={appSearch}
                                    onChange={(e) => setAppSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                {(["all", "pending", "approved", "denied"] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setAppFilter(f)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition capitalize ${appFilter === f ? "bg-[#003366] text-white border-[#003366]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {filteredApps.length === 0 && <div className="text-center py-16 text-gray-400">No applications found.</div>}
                            {filteredApps.map((app) => (
                                <div key={app.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                                            {app.firstName[0]}{app.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-900">{app.firstName} {app.lastName}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusColors[app.status]}`}>
                                                    {statusIcons[app.status]}{app.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-500 flex-wrap">
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.city}, {app.state}</span>
                                                <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {app.status === "pending" && (
                                                <>
                                                    <button onClick={() => handleAppDecision(app.id, "approved")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                    </button>
                                                    <button onClick={() => handleAppDecision(app.id, "denied")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition">
                                                        <XCircle className="w-3.5 h-3.5" /> Deny
                                                    </button>
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
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                                                <p className="flex items-center gap-1.5 text-gray-700"><Phone className="w-3.5 h-3.5 text-gray-400" />{app.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Availability</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {app.availableDays.map((d) => (
                                                        <span key={d} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{d}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Skills</p>
                                                <p className="text-gray-700">{app.skills}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</p>
                                                <p className="text-gray-700">{app.experience ?? <span className="italic text-gray-400">None provided</span>}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivation</p>
                                                <p className="text-gray-700">{app.motivation}</p>
                                            </div>
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
                            <input
                                className="w-full sm:w-80 pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder="Search volunteers…"
                                value={volunteerSearch}
                                onChange={(e) => setVolunteerSearch(e.target.value)}
                            />
                        </div>
                        {filteredVolunteers.length === 0 && (
                            <div className="text-center py-16 text-gray-400">
                                {volunteers.length === 0
                                    ? "No approved volunteers yet. Approve applications to see volunteers here."
                                    : "No volunteers match your search."}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVolunteers.map((vol) => {
                                const totalHours = hoursLogs
                                    .filter((h) => h.userEmail === vol.email)
                                    .reduce((s, h) => s + h.hours, 0);
                                return (
                                    <div key={vol.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                                                {vol.name.split(" ").map((n) => n[0]).join("")}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 truncate">{vol.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{vol.email}</p>
                                            </div>
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
                                        <button
                                            onClick={() => { setActiveTab("hours"); setHoursEmailFilter(vol.email); }}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-purple-300 text-purple-700 text-xs font-semibold hover:bg-purple-50 transition"
                                        >
                                            <Clock className="w-3.5 h-3.5" /> View Hours
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── EVENTS ── */}
                {activeTab === "events" && (
                    <div>
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    placeholder="Search events…"
                                    value={eventSearch}
                                    onChange={(e) => setEventSearch(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowCreateEvent(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold transition hover:opacity-90 shrink-0"
                                style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                            >
                                <Plus className="w-4 h-4" /> Create Event
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {filteredEvents.length === 0 && (
                                <div className="text-center py-16 text-gray-400">
                                    {events.length === 0
                                        ? "No events yet. Click \"Create Event\" to add one."
                                        : "No events match your search."}
                                </div>
                            )}
                            {filteredEvents.map((ev) => {
                                const pct = ev.spotsTotal > 0 ? Math.min((ev.spotsFilled / ev.spotsTotal) * 100, 100) : 0;
                                const isExpanded = expandedEvent === ev.id;
                                return (
                                    <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h3 className="font-bold text-[#1e3a5f] text-base truncate">{ev.title}</h3>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ev.spotsFilled >= ev.spotsTotal ? "bg-green-100 text-green-700 border-green-300" : "bg-yellow-100 text-yellow-700 border-yellow-300"}`}>
                                                            {ev.spotsFilled}/{ev.spotsTotal} filled
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(ev.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {ev.venue}, {displayEnum(ev.city)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ev.description}</p>
                                                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-green-500" : "bg-blue-500"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={() => setExpandedEvent(isExpanded ? null : ev.id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                    {confirmDeleteEvent === ev.id ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-gray-500">Delete?</span>
                                                            <button onClick={() => handleDeleteEvent(ev.id)} className="text-xs text-red-600 font-bold hover:text-red-800 transition">Yes</button>
                                                            <button onClick={() => setConfirmDeleteEvent(null)} className="text-xs text-gray-500 hover:text-gray-700 transition">No</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmDeleteEvent(ev.id)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</p>
                                                        <p className="text-gray-700">{ev.type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Age Group</p>
                                                        <p className="text-gray-700">{displayEnum(ev.ageGroup)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expertise</p>
                                                        <p className="text-gray-700">{ev.expertise}</p>
                                                    </div>
                                                </div>
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <div className="flex gap-3 flex-1 flex-wrap">
                                <div className="relative flex-1 min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                        placeholder="Search by volunteer or event…"
                                        value={hoursSearch}
                                        onChange={(e) => setHoursSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    value={hoursEmailFilter}
                                    onChange={(e) => setHoursEmailFilter(e.target.value)}
                                >
                                    <option value="all">All Volunteers</option>
                                    {volunteers.map((v) => (
                                        <option key={v.email} value={v.email}>{v.name}</option>
                                    ))}
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

                        {/* Per-volunteer totals */}
                        {hoursEmailFilter === "all" && Object.keys(hoursByEmail).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                {Object.entries(hoursByEmail).map(([email, { name, total }]) => (
                                    <button
                                        key={email}
                                        onClick={() => setHoursEmailFilter(email)}
                                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-left hover:border-blue-300 hover:shadow transition"
                                    >
                                        <div className="text-xl font-extrabold text-[#003366]">{total}h</div>
                                        <div className="text-xs text-gray-600 font-medium mt-0.5 truncate">{name}</div>
                                    </button>
                                ))}
                            </div>
                        )}

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
                                        {filteredHours.map((h) => {
                                            const name = emailToName[h.userEmail] ?? h.userEmail;
                                            return (
                                                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="font-medium text-gray-900">{name}</div>
                                                        <div className="text-xs text-gray-400">{h.userEmail}</div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-700 max-w-[200px] truncate">
                                                        {h.event?.title ?? `Event #${h.eventId}`}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="font-bold text-[#003366]">{h.hours}h</span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-500 italic text-xs">{h.note ?? "—"}</td>
                                                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                                                        {new Date(h.loggedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {confirmDeleteHours === h.id ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-xs text-gray-500">Delete?</span>
                                                                <button onClick={() => handleDeleteHours(h.id)} className="text-xs text-red-600 font-bold hover:text-red-800 transition">Yes</button>
                                                                <button onClick={() => setConfirmDeleteHours(null)} className="text-xs text-gray-500 hover:text-gray-700 transition">No</button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmDeleteHours(h.id)}
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateEvent && (
                <CreateEventModal
                    onClose={() => setShowCreateEvent(false)}
                    onCreate={handleCreateEvent}
                />
            )}
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
