"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@/context/navigation";
import {
  Clock,
  CalendarCheck,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Circle,
  Info,
  XCircle,
  Award,
} from "lucide-react";

// -- Types for API responses --------------------------------------------------

interface Me {
  email: string;
  name: string | null;
  role: string;
  applicationStatus: "pending" | "approved" | "denied" | null;
}

interface SignupEvent {
  id: number;
  title: string;
  date: string;
  venue: string;
  city: string;
}

interface Signup {
  id: number;
  eventId: number;
  createdAt: string;
  event: SignupEvent;
}

interface HoursLog {
  id: number;
  hours: number;
  note: string | null;
  loggedAt: string;
  event: {
    id: number;
    title: string;
    date: string;
    venue: string;
    city: string;
  };
}

interface HoursResponse {
  hours: HoursLog[];
  totalHours: number;
}

// -- Helpers ------------------------------------------------------------------

/** Format an ISO date string to a readable format like "Sep 14, 2024" */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Build initials from a name or email for the avatar */
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email[0]?.toUpperCase() ?? "?";
}

// -- Sub-components -----------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub: string;
}) {
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

function SignupRow({ signup, hoursForEvent }: { signup: Signup; hoursForEvent: number | null }) {
  const eventDate = new Date(signup.event.date);
  const isUpcoming = eventDate > new Date();

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
          <span className="font-bold text-[#1e3a5f] text-sm">{signup.event.title}</span>
          {isUpcoming && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Upcoming
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <CalendarCheck size={11} /> {formatDate(signup.event.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {signup.event.venue}, {signup.event.city}
          </span>
        </div>
      </div>

      <div className="text-center shrink-0">
        {hoursForEvent !== null ? (
          <>
            <div className="text-base font-extrabold text-[#003366]">{hoursForEvent}h</div>
            <div className="text-[10px] text-gray-400">logged</div>
          </>
        ) : isUpcoming ? (
          <div className="text-xs text-blue-500 font-medium">Scheduled</div>
        ) : (
          <div className="text-xs text-gray-400">Pending</div>
        )}
      </div>
    </div>
  );
}

// -- Badges -------------------------------------------------------------------

interface BadgeDef {
  label: string;
  emoji: string;
  tooltip: string;
  color: string; // tailwind bg class for the earned state
}

const EVENT_BADGES: (BadgeDef & { threshold: number })[] = [
  { threshold: 1,   label: "First Step",       emoji: "👣", tooltip: "Participate in 1 event",    color: "bg-blue-100 text-blue-700 border-blue-200" },
  { threshold: 5,   label: "Helping Hand",      emoji: "🤝", tooltip: "Participate in 5 events",   color: "bg-green-100 text-green-700 border-green-200" },
  { threshold: 10,  label: "Dedicated",          emoji: "⭐", tooltip: "Participate in 10 events",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { threshold: 25,  label: "Community Pillar",   emoji: "🏛️", tooltip: "Participate in 25 events",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  { threshold: 50,  label: "Champion",           emoji: "🏆", tooltip: "Participate in 50 events",  color: "bg-amber-100 text-amber-700 border-amber-200" },
  { threshold: 100, label: "Legend",             emoji: "👑", tooltip: "Participate in 100 events", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

const HOURS_BADGES: (BadgeDef & { threshold: number })[] = [
  { threshold: 5,    label: "Getting Started",  emoji: "🌱", tooltip: "Log 5 volunteer hours",    color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { threshold: 25,   label: "Committed",         emoji: "💪", tooltip: "Log 25 volunteer hours",   color: "bg-sky-100 text-sky-700 border-sky-200" },
  { threshold: 50,   label: "Tireless",           emoji: "🔥", tooltip: "Log 50 volunteer hours",   color: "bg-orange-100 text-orange-700 border-orange-200" },
  { threshold: 100,  label: "Centurion",          emoji: "💯", tooltip: "Log 100 volunteer hours",  color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { threshold: 250,  label: "Trailblazer",        emoji: "🚀", tooltip: "Log 250 volunteer hours",  color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
  { threshold: 500,  label: "Hall of Fame",       emoji: "🌟", tooltip: "Log 500 volunteer hours",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
];

function Badge({ badge, earned }: { badge: BadgeDef; earned: boolean }) {
  return (
    <div className="relative group">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition select-none ${
          earned ? badge.color : "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
        }`}
      >
        <span className="text-base">{badge.emoji}</span>
        {badge.label}
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
        {badge.tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

// -- Page ---------------------------------------------------------------------

export default function VolunteerPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "events">("overview");

  const [me, setMe] = useState<Me | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [hoursData, setHoursData] = useState<HoursResponse>({ hours: [], totalHours: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all volunteer data on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/me/signups").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/me/hours").then((r) => (r.ok ? r.json() : { hours: [], totalHours: 0 })),
    ])
      .then(([meData, signupsData, hoursRes]) => {
        if (!meData) {
          navigate("/login");
          return;
        }
        setMe(meData);
        setSignups(signupsData);
        setHoursData(hoursRes);
      })
      .catch(() => navigate("/login"))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  // Build a lookup of eventId -> total hours for that event
  const hoursByEvent = new Map<number, number>();
  for (const log of hoursData.hours) {
    const prev = hoursByEvent.get(log.event.id) ?? 0;
    hoursByEvent.set(log.event.id, prev + log.hours);
  }

  const now = new Date();
  const upcomingSignups = signups.filter((s) => new Date(s.event.date) > now);
  const pastSignups = signups.filter((s) => new Date(s.event.date) <= now);

  // Events with confirmed participation (staff logged hours for them)
  const confirmedEventCount = hoursByEvent.size;

  // Filter state for the events tab
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const filteredSignups =
    filter === "all" ? signups : filter === "upcoming" ? upcomingSignups : pastSignups;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#003366", borderTopColor: "transparent" }}
          />
          <p className="text-gray-500 text-sm font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!me) return null;

  const initials = getInitials(me.name, me.email);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="text-white py-10 px-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #001f4d 0%, #003366 55%, #1d4ed8 100%)",
        }}
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
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">
                {me.name || me.email}
              </h1>
              <p className="text-blue-200 text-sm">{me.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex">
          {(["overview", "events"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
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
        {/* Application status banner */}
        {me.applicationStatus === "pending" && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-amber-800 text-sm font-medium shadow-sm">
            <Info className="w-5 h-5 text-amber-500 shrink-0" />
            <p>Your volunteer application is under review. We&apos;ll notify you once it&apos;s been processed. In the meantime, feel free to browse upcoming events.</p>
          </div>
        )}
        {me.applicationStatus === "denied" && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-800 text-sm font-medium shadow-sm">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p>Your volunteer application was not approved. You may submit a new application if your circumstances have changed.</p>
          </div>
        )}
        {me.applicationStatus === null && (
          <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-blue-800 text-sm font-medium shadow-sm">
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
            <p>Welcome! To get started, <a href="/volunteer" className="underline font-bold hover:text-blue-900">submit a volunteer application</a> so you can sign up for events.</p>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            {/* Stats */}
            <div>
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">Your Impact</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <StatCard
                  label="Total Hours"
                  value={hoursData.totalHours > 0 ? hoursData.totalHours.toFixed(1) : "0"}
                  icon={Clock}
                  color="#003366"
                  sub="hrs logged"
                />
                <StatCard
                  label="Events Signed Up"
                  value={String(signups.length)}
                  icon={CalendarCheck}
                  color="#1d4ed8"
                  sub="events"
                />
              </div>
            </div>

            {/* Badges */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-[#1e3a5f]" />
                <h2 className="text-lg font-bold text-[#1e3a5f]">Badges</h2>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Event Milestones</h3>
                <div className="flex flex-wrap gap-2 mb-5">
                  {EVENT_BADGES.map((b) => (
                    <Badge key={b.label} badge={b} earned={confirmedEventCount >= b.threshold} />
                  ))}
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Hours Milestones</h3>
                <div className="flex flex-wrap gap-2">
                  {HOURS_BADGES.map((b) => (
                    <Badge key={b.label} badge={b} earned={hoursData.totalHours >= b.threshold} />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent events */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1e3a5f]">Recent Events</h2>
                {signups.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("events")}
                    className="text-sm font-semibold text-[#1d4ed8] flex items-center gap-1 hover:underline"
                  >
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {signups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-gray-500 font-medium mb-1">No events yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Browse available events and sign up to start volunteering.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/events")}
                    className="inline-flex items-center gap-2 bg-[#003366] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition"
                  >
                    Find an Event
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {signups.slice(0, 3).map((s) => (
                    <SignupRow
                      key={s.id}
                      signup={s}
                      hoursForEvent={hoursByEvent.get(s.eventId) ?? null}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming commitments */}
            {upcomingSignups.length > 0 && (
              <div
                className="rounded-2xl p-6 text-white relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)",
                }}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 w-40 opacity-10"
                  style={{
                    background: "radial-gradient(circle at right, #60a5fa, transparent)",
                  }}
                />
                <h3 className="font-bold text-lg mb-1">Upcoming Commitments</h3>
                <p className="text-blue-200 text-sm mb-4">
                  You have {upcomingSignups.length} upcoming event
                  {upcomingSignups.length !== 1 ? "s" : ""} registered.
                </p>
                <div className="flex flex-col gap-2">
                  {upcomingSignups.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-3"
                    >
                      <div>
                        <div className="font-semibold text-sm">{s.event.title}</div>
                        <div className="text-blue-200 text-xs mt-0.5">
                          {formatDate(s.event.date)} - {s.event.venue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA to find events if they have none upcoming */}
            {upcomingSignups.length === 0 && signups.length > 0 && (
              <div
                className="rounded-2xl p-6 text-white text-center"
                style={{
                  background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)",
                }}
              >
                <h3 className="font-bold text-lg mb-1">Find Your Next Event</h3>
                <p className="text-blue-200 text-sm mb-4">
                  You don&apos;t have any upcoming events. Browse available
                  opportunities and sign up!
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/events")}
                  className="bg-white text-[#003366] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition"
                >
                  Browse Events
                </button>
              </div>
            )}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold text-[#1e3a5f]">All Events</h2>
              <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
                {(["all", "upcoming", "past"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={{
                      background: filter === f ? "#003366" : "transparent",
                      color: filter === f ? "#fff" : "#6b7280",
                    }}
                  >
                    {f === "all"
                      ? `All (${signups.length})`
                      : f === "upcoming"
                        ? `Upcoming (${upcomingSignups.length})`
                        : `Past (${pastSignups.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 text-center border border-blue-50 shadow-sm">
                <div className="text-xl font-extrabold text-[#003366]">
                  {hoursData.totalHours > 0 ? `${hoursData.totalHours.toFixed(1)}h` : "0h"}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Total Hours Logged</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-blue-50 shadow-sm">
                <div className="text-xl font-extrabold text-[#003366]">
                  {pastSignups.length}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Events Completed</div>
              </div>
            </div>

            {/* Event list */}
            <div className="flex flex-col gap-3">
              {filteredSignups.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  {signups.length === 0 ? (
                    <div>
                      <div className="text-4xl mb-3">📅</div>
                      <p className="text-gray-500 font-medium mb-1">No events yet</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Sign up for your first event to get started.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/events")}
                        className="inline-flex items-center gap-2 bg-[#003366] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition"
                      >
                        Find an Event
                      </button>
                    </div>
                  ) : (
                    `No ${filter} events found.`
                  )}
                </div>
              ) : (
                filteredSignups.map((s) => (
                  <SignupRow
                    key={s.id}
                    signup={s}
                    hoursForEvent={hoursByEvent.get(s.eventId) ?? null}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
