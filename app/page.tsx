"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/context/navigation";
import { authClient } from "@/lib/auth/client";
import { ArrowRight, Heart, CheckCircle2 } from "lucide-react";

const heroStats = [
    { value: "65",    label: "of 72 SC Public School Districts Served" },
    { value: "1,030", label: "Unique SC Teachers Served by Our Programs" },
    { value: "143",   label: "Events for SC Educators Across the State" },
    { value: "313",   label: "Professional Learning Hours Delivered" },
];

const impactStats = [
    {
        stat: "11,348",
        label: "Students Reached Through Student Contests",
        detail: "Total students reached via the Stock Market Game, Finance Challenge, Economics Challenge, and other student contests in 2024–25.",
        accent: "#003366",
    },
    {
        stat: "5,104",
        label: "SC Teachers in Programs or Contests",
        detail: "Number of SC teachers who participated in at least one SC Economics program or contest in 2024–25.",
        accent: "#1d4ed8",
    },
    {
        stat: "93.8%",
        label: "Of Every Dollar Goes to Programs",
        detail: "Program expenses as a percentage of total spending in 2024–25. General & administrative costs: 4.1%. Fundraising: 2.1%.",
        accent: "#003366",
    },
];

export default function VolunteerPage() {
    const navigate = useNavigate();

    // Check session + role to decide where CTA navigates
    const { data: session } = authClient.useSession();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/me")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data) setRole(data.role); })
            .catch(() => {});
    }, [session]);

    const isLoggedIn = !!session?.user || !!role;
    const isStaff = role === "admin" || role === "manager";

    const handleCTA = () => {
        if (!isLoggedIn) return navigate("/login");
        navigate(isStaff ? "/admin" : "/volunteer");
    };

    return (
        <div className="min-h-screen bg-white">

            {/* ── HERO ── */}
            <section
                className="relative overflow-hidden text-white"
                style={{ background: "linear-gradient(135deg, #001f4d 0%, #003366 50%, #1d4ed8 100%)" }}
            >
                <div className="absolute -top-24 -right-24 w-120 h-120 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />
                <div className="absolute bottom-0 -left-16 w-[320px] h-80 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #93c5fd, transparent)" }} />

                <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                            <Heart size={14} className="text-blue-300" />
                            Serving 65 of 72 SC School Districts
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
                            Teach a Child About Money.{" "}
                            <span className="text-blue-300">Change Their Life.</span>
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-xl">
                            SC Economics gives South Carolina&apos;s K-12 students the economic and financial
                            literacy skills to thrive, and it&apos;s powered by volunteers like you.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {/* FIX #5 — navigate to /login if unauthenticated, /volunteer if authenticated */}
                            <button
                                onClick={handleCTA}
                                className="inline-flex items-center gap-2 bg-white text-[#003366] font-bold px-7 py-3.5 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                Apply to Volunteer <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {heroStats.map(({ value, label }) => (
                            <div key={label} className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 text-center">
                                <div className="text-4xl font-extrabold text-white mb-1">{value}</div>
                                <div className="text-blue-200 text-sm font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── IMPACT ── */}
            <section className="py-20 bg-[#f5f9ff]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-4">
                        <h2 className="text-3xl font-extrabold text-[#1e3a5f] mb-3">Why Your Time Matters</h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Here&apos;s what SC Economics accomplished in the 2024–25 school year made
                            possible by the support of volunteers and donors across South Carolina.
                        </p>
                    </div>
                    <p className="text-center text-xs text-gray-400 mb-10 italic">
                        All figures from the SC Economics 2024–2025 Annual Report
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {impactStats.map(({ stat, label, detail, accent }) => (
                            <div key={stat} className="bg-white rounded-2xl p-8 shadow-sm border border-blue-50 text-center">
                                <div className="text-5xl font-extrabold mb-2" style={{ color: accent }}>{stat}</div>
                                <div className="font-bold text-[#1e3a5f] text-sm mb-2">{label}</div>
                                <p className="text-gray-400 text-xs leading-relaxed">{detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 bg-linear-to-r from-[#003366] to-[#1d4ed8] rounded-2xl p-8 text-white text-center">
                        <p className="text-xl font-semibold leading-relaxed max-w-3xl mx-auto">
                            In 2024–25, SC Economics served{" "}
                            <strong className="text-blue-200">1,030 unique teachers</strong>, ran{" "}
                            <strong className="text-blue-200">143 educator events</strong>, and reached{" "}
                            <strong className="text-blue-200">11,348 students</strong> through student
                            contests across 65 of South Carolina&apos;s 72 public school districts.
                        </p>
                        <p className="text-blue-300 text-sm mt-4 font-medium">
                            — SC Economics 2024–2025 Annual Report
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section
                className="py-24 text-white text-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #001f4d 0%, #003366 60%, #1d4ed8 100%)" }}
            >
                <div
                    className="absolute top-0 left-0 right-0 bottom-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #60a5fa 0%, transparent 60%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 60%)" }}
                />
                <div className="relative max-w-3xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                        <CheckCircle2 size={14} className="text-green-300" />
                        Make an Impact in South Carolina
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-blue-200 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                        11,348 South Carolina students were reached through our programs last year.
                        Help us reach even more in 2025–26.
                    </p>
                    {/* FIX #5 — same smart routing here */}
                    <button
                        onClick={handleCTA}
                        className="inline-flex items-center gap-3 bg-white text-[#003366] font-extrabold px-10 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-colors shadow-2xl"
                    >
                        Start Your Application <ArrowRight size={22} />
                    </button>
                </div>
            </section>
        </div>
    );
}