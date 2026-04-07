"use client";

import { useState } from "react";
import { Shield, Trash2, Plus, Eye, EyeOff, UserCog, AlertCircle, CheckCircle2 } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface AdminAccount {
    id: string;
    email: string;
    createdAt: string;
}

// ── Seed data ──────────────────────────────────────────────────────────────
const seedAdmins: AdminAccount[] = [
    { id: "1", email: "admin@sceconomics.org",   createdAt: "2024-09-01" },
    { id: "2", email: "director@sceconomics.org", createdAt: "2024-11-15" },
    { id: "3", email: "coordinator@sceconomics.org", createdAt: "2025-01-08" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(email: string) {
    return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium animate-in slide-in-from-bottom-4"
            style={{ background: type === "success" ? "#16a34a" : "#dc2626" }}
        >
            {type === "success"
                ? <CheckCircle2 size={16} />
                : <AlertCircle size={16} />}
            {message}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ManagerPage() {
    const [admins, setAdmins] = useState<AdminAccount[]>(seedAdmins);
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw]     = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [formError, setFormError] = useState("");

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAdd = () => {
        setFormError("");
        if (!email.trim()) { setFormError("Email is required."); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFormError("Enter a valid email address."); return; }
        if (!password) { setFormError("Password is required."); return; }
        if (password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
        if (admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
            setFormError("An admin with this email already exists.");
            return;
        }

        const newAdmin: AdminAccount = {
            id: Date.now().toString(),
            email: email.trim().toLowerCase(),
            createdAt: new Date().toISOString().slice(0, 10),
        };
        setAdmins((prev) => [newAdmin, ...prev]);
        setEmail("");
        setPassword("");
        showToast("Admin account created successfully.", "success");
        // TODO: POST /api/admins { email, password }
    };

    const handleDelete = (id: string) => {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
        setConfirmDelete(null);
        showToast("Admin account removed.", "success");
        // TODO: DELETE /api/admins/{id}
    };

    const inputCls =
        "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

    return (
        <div className="min-h-screen bg-[#f0f4f8]">

            {/* ── Page header banner ── */}
            <div
                className="px-8 py-10 text-white"
                style={{ background: "linear-gradient(135deg, #001f4d 0%, #003366 55%, #1d4ed8 100%)" }}
            >
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-1">
                        <UserCog size={28} className="text-blue-300" />
                        <h1 className="text-3xl font-extrabold tracking-tight">Manager</h1>
                    </div>
                    <p className="text-blue-200 text-sm">
                        Add and remove administrator accounts for the SC Economics Volunteer platform.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

                {/* ── Summary card ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex items-center gap-5">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                    >
                        <Shield size={26} className="text-white" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-[#1e3a5f]">{admins.length}</div>
                        <div className="text-sm text-gray-500 font-medium">Active Admin Accounts</div>
                    </div>
                </div>

                {/* ── Add admin form ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2">
                        <Plus size={18} className="text-[#1d4ed8]" />
                        <h2 className="text-base font-bold text-[#1e3a5f]">Add New Admin Account</h2>
                    </div>
                    <div className="px-8 py-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className={inputCls}
                                    type="email"
                                    placeholder="admin@sceconomics.org"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        className={inputCls + " pr-10"}
                                        type={showPw ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPw
                                            ? <EyeOff size={16} />
                                            : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {formError && (
                            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                <AlertCircle size={15} />
                                {formError}
                            </div>
                        )}

                        <button
                            onClick={handleAdd}
                            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-bold transition hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                        >
                            <Plus size={16} />
                            Create Admin Account
                        </button>
                    </div>
                </div>

                {/* ── Admin list ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2">
                        <Shield size={18} className="text-[#1d4ed8]" />
                        <h2 className="text-base font-bold text-[#1e3a5f]">Current Admin Accounts</h2>
                    </div>

                    {admins.length === 0 ? (
                        <div className="px-8 py-16 text-center text-gray-400 text-sm">
                            No admin accounts yet. Add one above.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50">
                            {admins.map((admin) => (
                                <li key={admin.id} className="px-8 py-5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                                        >
                                            {initials(admin.email)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{admin.email}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                Added {formatDate(admin.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete / Confirm */}
                                    {confirmDelete === admin.id ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-gray-500 font-medium">Remove this admin?</span>
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(null)}
                                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(admin.id)}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors flex-shrink-0"
                                        >
                                            <Trash2 size={13} />
                                            Remove
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            {/* ── Toast ── */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
