"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

const labelCls = "block text-sm font-semibold text-gray-900 mb-1.5";

const sectionHeadCls =
    "text-lg font-bold mb-3 pb-2.5 border-b border-blue-200 text-[#1e3a5f]";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    days: string[];
    skills: string;
    experience: string;
    motivation: string;
    background: boolean;
    dataConsent: boolean;
}

const EMPTY: FormState = {
    firstName: "", lastName: "", email: "", phone: "",
    street: "", city: "", state: "South Carolina", zip: "",
    days: [], skills: "", experience: "", motivation: "", background: false, dataConsent: false
};

export default function ApplyPage() {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [submitted, setSubmitted] = useState(false);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((prev) => ({ ...prev, [k]: v }));

    const toggleDay = (d: string) =>
        set("days", form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d]);

    if (submitted) {
        return (
            <div className="min-h-[calc(100vh-70px)] bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-md">
                    <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[#1e3a5f] mb-3">
                        Application Submitted!
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-6">
                        Thank you for applying to volunteer with SC Economics. Our team will
                        be in touch within 5–7 business days.
                    </p>
                    <button
                        onClick={() => { setSubmitted(false); setForm(EMPTY); }}
                        className="px-6 py-2.5 rounded-lg text-white font-bold text-sm"
                        style={{ backgroundColor: "#003366" }}
                    >
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50">
            {/* Banner */}
            <div
                className="text-white py-10 px-4"
                style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
            >
                <div className="max-w-3xl mx-auto flex items-center gap-6">
                    <img
                        src="/SC-Econ-logo.png"
                        alt="SC Economics"
                        className="h-14 w-auto shrink-0"
                    />
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Volunteer Application</h1>
                        <p className="text-blue-200 text-base">
                            Join us in improving economic and personal finance education for K-12
                            students across South Carolina
                        </p>
                    </div>
                </div>
            </div>

            {/* Form card */}
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="bg-white rounded-xl p-10 shadow-sm">

                    {/* Personal Information */}
                    <h2 className={sectionHeadCls}>Personal Information</h2>
                    <div className="grid grid-cols-2 gap-5 mb-9">
                        {(
                            [
                                ["First Name *",    "firstName", "text"],
                                ["Last Name *",     "lastName",  "text"],
                                ["Email Address *", "email",     "email"],
                                ["Phone Number *",  "phone",     "tel"],
                            ] as [string, keyof FormState, string][]
                        ).map(([lbl, key, type]) => (
                            <div key={key}>
                                <label className={labelCls}>{lbl}</label>
                                <input
                                    className={inputCls}
                                    type={type}
                                    value={form[key] as string}
                                    onChange={(e) => set(key, e.target.value as FormState[typeof key])}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Address */}
                    <h2 className={sectionHeadCls}>Address</h2>
                    <div className="flex flex-col gap-5 mb-9">
                        <div>
                            <label className={labelCls}>Street Address *</label>
                            <input className={inputCls} value={form.street} onChange={(e) => set("street", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-5">
                            <div>
                                <label className={labelCls}>City *</label>
                                <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>State *</label>
                                <div className="relative">
                                    <select
                                        className={inputCls + " appearance-none pr-8 cursor-pointer"}
                                        value={form.state}
                                        onChange={(e) => set("state", e.target.value)}
                                    >
                                        {["South Carolina","North Carolina","Georgia","Virginia","Other"].map((s) => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                    ▾
                  </span>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>ZIP Code *</label>
                                <input className={inputCls} value={form.zip} onChange={(e) => set("zip", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <h2 className={sectionHeadCls}>Availability</h2>
                    <div className="mb-9">
                        <label className={labelCls + " mb-3.5"}>
                            What days are you available? *
                        </label>
                        <div className="grid grid-cols-4 gap-2.5">
                            {DAYS.map((d) => (
                                <label key={d} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={form.days.includes(d)}
                                        onChange={() => toggleDay(d)}
                                        className="w-4 h-4 accent-[#003366]"
                                    />
                                    {d}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Skills & Experience */}
                    <h2 className={sectionHeadCls}>Skills & Experience</h2>
                    <div className="flex flex-col gap-5 mb-9">
                        <div>
                            <label className={labelCls}>Relevant Skills *</label>
                            <textarea
                                className={inputCls + " min-h-[88px] resize-y"}
                                value={form.skills}
                                onChange={(e) => set("skills", e.target.value)}
                                placeholder="e.g., Teaching, Event Planning, Marketing, Finance, Technology..."
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Previous Volunteer Experience</label>
                            <textarea
                                className={inputCls + " min-h-[88px] resize-y"}
                                value={form.experience}
                                onChange={(e) => set("experience", e.target.value)}
                                placeholder="Please describe any previous volunteer or teaching experience..."
                            />
                        </div>
                        <div>
                            <label className={labelCls}>
                                Why do you want to volunteer with SC Economics? *
                            </label>
                            <textarea
                                className={inputCls + " min-h-[88px] resize-y"}
                                value={form.motivation}
                                onChange={(e) => set("motivation", e.target.value)}
                                placeholder="Tell us what motivates you to support economic education..."
                            />
                        </div>
                    </div>

                    {/* Background Check */}
                    <h2 className={sectionHeadCls}>Background Check</h2>
                    <div className="mb-10 flex flex-col gap-3">
                        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.background}
                                onChange={(e) => set("background", e.target.checked)}
                                className="w-4 h-4 accent-[#003366]"
                            />
                            I consent to a background check as required for working with K-12 students *
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.dataConsent}
                                onChange={(e) => set("dataConsent", e.target.checked)}
                                className="w-4 h-4 accent-[#003366]"
                            />
                            I consent to the collection and use of my personal data *
                        </label>
                    </div>


                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setForm(EMPTY)}
                            className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
                        >
                            Clear Form
                        </button>
                        <button
                            onClick={() => setSubmitted(true)}
                            className="px-6 py-2.5 rounded-lg font-bold text-sm text-white transition hover:opacity-90"
                            style={{ backgroundColor: "#003366" }}
                        >
                            Submit Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
