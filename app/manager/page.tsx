"use client";

import { useState, useEffect } from "react";
import { Shield, UserCog, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useNavigate } from "@/context/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
interface StaffAccount {
    id: number;
    email: string;
    role: "admin" | "manager";
    createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(email: string) {
    return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

const roleBadge: Record<string, string> = {
    admin:   "bg-purple-100 text-purple-700 border-purple-300",
    manager: "bg-blue-100 text-blue-700 border-blue-300",
};

// ── Sub-components ─────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium animate-in slide-in-from-bottom-4"
            style={{ background: type === "success" ? "#16a34a" : "#dc2626" }}
        >
            {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ManagerPage() {
    const navigate = useNavigate();
    const [isReady,  setIsReady]  = useState(false);
    const [staff,    setStaff]    = useState<StaffAccount[]>([]);
    const [email,    setEmail]    = useState("");
    const [role,     setRole]     = useState<"admin" | "manager">("manager");
    const [confirmRevoke, setConfirmRevoke] = useState<number | null>(null);
    const [toast,     setToast]     = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myEmail, setMyEmail] = useState<string | null>(null);

    // ── Auth check + load ──────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            const meRes = await fetch("/api/me");
            if (!meRes.ok) { navigate("/login"); return; }
            const me = await meRes.json();
            if (me.role !== "admin") { navigate("/login"); return; }
            setMyEmail(me.email);

            const res = await fetch("/api/admins");
            if (res.ok) setStaff(await res.json());
            setIsReady(true);
        }
        init().catch(() => navigate("/login"));
    }, [navigate]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAssign = async () => {
        setFormError("");
        if (!email.trim()) { setFormError("Email is required."); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFormError("Enter a valid email address."); return; }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
            });
            const data = await res.json();
            if (!res.ok) {
                setFormError(data.error ?? "Failed to assign role.");
                return;
            }
            // Update local list: replace if already present, otherwise add
            setStaff((prev) => {
                const filtered = prev.filter((s) => s.id !== data.id);
                return [data, ...filtered];
            });
            setEmail("");
            showToast(`${data.email} is now a ${data.role}.`, "success");
        } catch {
            setFormError("Failed to assign role.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.error ?? "Failed to revoke access.", "error");
                return;
            }
            setStaff((prev) => prev.filter((s) => s.id !== id));
            setConfirmRevoke(null);
            showToast("Staff access revoked.", "success");
        } catch {
            showToast("Failed to revoke access.", "error");
        }
    };

    const inputCls =
        "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

    const adminCount   = staff.filter((s) => s.role === "admin").length;
    const managerCount = staff.filter((s) => s.role === "manager").length;

    if (!isReady) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
                        style={{ borderColor: "#003366", borderTopColor: "transparent" }}
                    />
                    <p className="text-gray-500 text-sm font-medium">Loading…</p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-extrabold tracking-tight">Manage Staff</h1>
                    </div>
                    <p className="text-blue-200 text-sm">
                        Assign or revoke admin and manager roles for existing accounts.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

                {/* ── Summary cards ── */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex items-center gap-5">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                        >
                            <Shield size={26} className="text-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-extrabold text-[#1e3a5f]">{adminCount}</div>
                            <div className="text-sm text-gray-500 font-medium">Admins</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex items-center gap-5">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                        >
                            <UserCog size={26} className="text-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-extrabold text-[#1e3a5f]">{managerCount}</div>
                            <div className="text-sm text-gray-500 font-medium">Managers</div>
                        </div>
                    </div>
                </div>

                {/* ── Assign role form ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2">
                        <Shield size={18} className="text-[#1d4ed8]" />
                        <h2 className="text-base font-bold text-[#1e3a5f]">Assign Staff Role</h2>
                    </div>
                    <div className="px-8 py-6">
                        <div className="grid md:grid-cols-[1fr_180px] gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Account Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className={inputCls}
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className={inputCls + " appearance-none pr-8 cursor-pointer"}
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as "admin" | "manager")}
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                            onClick={handleAssign}
                            disabled={isSubmitting}
                            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #003366, #1d4ed8)" }}
                        >
                            {isSubmitting ? "Assigning…" : "Assign Role"}
                        </button>
                    </div>
                </div>

                {/* ── Staff list ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2">
                        <Shield size={18} className="text-[#1d4ed8]" />
                        <h2 className="text-base font-bold text-[#1e3a5f]">Current Staff Accounts</h2>
                    </div>

                    {staff.length === 0 ? (
                        <div className="px-8 py-16 text-center text-gray-400 text-sm">
                            No staff accounts found. Assign a role above.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50">
                            {staff.map((member) => (
                                <li key={member.id} className="px-8 py-5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                                            style={{ background: member.role === "admin"
                                                ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                                                : "linear-gradient(135deg, #003366, #1d4ed8)"
                                            }}
                                        >
                                            {initials(member.email)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{member.email}</span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${roleBadge[member.role]}`}>
                                                    {member.role}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                Added {formatDate(member.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {member.email === myEmail ? (
                                        <span className="text-xs text-gray-400 italic flex-shrink-0">You</span>
                                    ) : confirmRevoke === member.id ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-gray-500 font-medium">Revoke access?</span>
                                            <button
                                                onClick={() => handleRevoke(member.id)}
                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setConfirmRevoke(null)}
                                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmRevoke(member.id)}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors flex-shrink-0"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

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
