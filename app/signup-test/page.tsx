"use client";
import { useState } from "react";

interface VolunteerEvent {
    id: number;
    type: string;
    title: string;
    description: string;
    date: string;
    time: string;
    startTime: string;
    endTime: string;
    location: string;
    filled: number;
    total: number;
    spotsLeft: number;
    expertiseNeeded: string;
    typeColor: string;
}

interface FormState {
    why: string;
    fromTime: string;
    toTime: string;
    certificate: string;
    expertise: string;
}

// ─── DUMMY EVENT — swap this out when integrating ───────────────────────────
const DUMMY_EVENT: VolunteerEvent = {
    id: 1,
    type: "Workshop",
    title: "Financial Literacy Workshop",
    description: "Interactive workshop teaching high school students about budgeting, saving, and investing.",
    date: "2026-03-15",
    time: "10:00 AM - 2:00 PM",
    startTime: "10:00",
    endTime: "14:00",
    location: "Columbia High School, Columbia, SC",
    filled: 3,
    total: 5,
    spotsLeft: 2,
    expertiseNeeded: "Finance, Education, or Teaching experience preferred",
    typeColor: "#1a3557",
};
// ────────────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function genTimeOptions(startStr: string, endStr: string): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const [sh] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);
    for (let h = sh; h <= eh; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (h === eh && m > em) break;
            const label = `${h % 12 === 0 ? 12 : h % 12}:${m === 0 ? "00" : m} ${h < 12 ? "AM" : "PM"}`;
            options.push({ value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, label });
        }
    }
    return options;
}

// ─── THE POPUP — this is the component your teammate will import ─────────────
export function SignUpModal({
                                event,
                                onClose,
                            }: {
    event: VolunteerEvent;
    onClose: () => void;
}) {
    const [form, setForm] = useState<FormState>({
        why: "",
        fromTime: event.startTime,
        toTime: event.endTime,
        certificate: "",
        expertise: "",
    });
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const timeOptions = genTimeOptions(event.startTime, event.endTime);

    function validate(): Record<string, string> {
        const e: Record<string, string> = {};
        if (!form.why.trim()) e.why = "Please share why you want to volunteer.";
        if (!form.fromTime) e.fromTime = "Select a start time.";
        if (!form.toTime) e.toTime = "Select an end time.";
        if (form.fromTime && form.toTime && form.fromTime >= form.toTime)
            e.toTime = "End time must be after start time.";
        if (!form.certificate) e.certificate = "Please select an option.";
        return e;
    }

    function handleSubmit(): void {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        // TODO: replace with real API call
        // await fetch("/api/signup", { method: "POST", body: JSON.stringify({ eventId: event.id, ...form }) });
        console.log("Signup submitted:", { eventId: event.id, ...form });
        setSubmitted(true);
    }

    return (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                {!submitted ? (
                    <>
                        <div className="modal-top">
                            <button className="modal-close" onClick={onClose}>✕</button>
                            <div className="modal-badge">{event.type}</div>
                            <div className="modal-title">{event.title}</div>
                            <div className="modal-info">
                                <div className="modal-info-row">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    {formatDate(event.date)} · {event.time}
                                </div>
                                <div className="modal-info-row">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {event.location}
                                </div>
                                <div className="modal-info-row">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                    {event.spotsLeft} spot{event.spotsLeft !== 1 ? "s" : ""} remaining
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Why do you want to volunteer here?</label>
                                <p className="form-sublabel">Brief is great — a sentence or two is perfect.</p>
                                <textarea
                                    className={`form-textarea${errors.why ? " error" : ""}`}
                                    placeholder="e.g. I'm passionate about financial education and want to help students learn..."
                                    maxLength={300}
                                    value={form.why}
                                    onChange={(e) => setForm({ ...form, why: e.target.value })}
                                />
                                {errors.why && <span className="error-msg">{errors.why}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Your availability</label>
                                <p className="form-sublabel">Select the hours you&apos;ll be attending within the event window.</p>
                                <div className="time-row">
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: "0.775rem", color: "#64748b" }}>From</label>
                                        <select
                                            className={`form-select${errors.fromTime ? " error" : ""}`}
                                            value={form.fromTime}
                                            onChange={(e) => setForm({ ...form, fromTime: e.target.value })}
                                        >
                                            {timeOptions.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        {errors.fromTime && <span className="error-msg">{errors.fromTime}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: "0.775rem", color: "#64748b" }}>To</label>
                                        <select
                                            className={`form-select${errors.toTime ? " error" : ""}`}
                                            value={form.toTime}
                                            onChange={(e) => setForm({ ...form, toTime: e.target.value })}
                                        >
                                            {timeOptions.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        {errors.toTime && <span className="error-msg">{errors.toTime}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="expertise-note">
                                <strong>Expertise note: </strong>{event.expertiseNeeded}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Do you have relevant background for this event?</label>
                                <textarea
                                    className="form-textarea"
                                    style={{ minHeight: "60px" }}
                                    placeholder="Optional — share any relevant skills or experience"
                                    maxLength={200}
                                    value={form.expertise}
                                    onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                                />
                            </div>

                            <hr className="divider" />

                            <div className="form-group">
                                <label className="form-label">Do you need a volunteer certificate afterwards?</label>
                                <div className={`radio-group${errors.certificate ? " error" : ""}`}>
                                    {[
                                        { value: "yes", label: "Yes, please send me a certificate" },
                                        { value: "no", label: "No, I don't need one" },
                                    ].map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`radio-label${form.certificate === opt.value ? " selected" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="certificate"
                                                value={opt.value}
                                                checked={form.certificate === opt.value}
                                                onChange={(e) => setForm({ ...form, certificate: e.target.value })}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                                {errors.certificate && <span className="error-msg">{errors.certificate}</span>}
                            </div>

                            <button className="submit-btn" onClick={handleSubmit}>
                                Confirm Sign Up →
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="success-screen">
                        <div className="success-icon">✅</div>
                        <div className="success-title">You&apos;re signed up!</div>
                        <p className="success-sub">
                            Thanks for volunteering at <strong>{event.title}</strong>. You&apos;ll receive a confirmation shortly. See you there!
                        </p>
                        <button className="success-close" onClick={onClose}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
}
// ────────────────────────────────────────────────────────────────────────────

// ─── TEST PAGE — delete this file once integrated, keep only SignUpModal ─────
export default function SignUpModalTestPage() {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Sora:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; font-family: 'DM Sans', sans-serif; }

        /* ── Test page wrapper ── */
        .test-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px 24px;
        }
        .test-label {
          font-family: 'Sora', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .test-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3557;
        }
        .test-sub {
          font-size: 0.875rem;
          color: #64748b;
          max-width: 380px;
          text-align: center;
          line-height: 1.6;
        }
        .open-btn {
          margin-top: 8px;
          background: #1a3557;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          
          transition: background 0.18s, transform 0.12s;
        }
        .open-btn:hover { background: #0f2540; transform: translateY(-1px); }

        .event-preview {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 14px;
          padding: 18px 24px;
          max-width: 380px;
          width: 100%;
          font-size: 0.82rem;
          color: #475569;
          line-height: 1.7;
        }
        .event-preview strong { color: #1a3557; font-size: 0.9rem; display: block; margin-bottom: 6px; }

        /* ── Modal styles ── */
        .overlay {
          position: fixed; inset: 0;
          background: rgba(10, 20, 40, 0.55);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 80px rgba(10,20,40,0.22);
          animation: slideUp 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        .modal-top {
          background: linear-gradient(135deg, #1a3557 0%, #0d2240 100%);
          padding: 28px 28px 24px;
          border-radius: 20px 20px 0 0;
          position: relative;
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px;
          background: rgba(255,255,255,0.15);
          border: none; border-radius: 50%;
          width: 32px; height: 32px;
          color: white; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.25); }
        .modal-badge {
          display: inline-block;
          background: rgba(255,255,255,0.18);
          color: white;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
          margin-bottom: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .modal-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 14px;
        }
        .modal-info { display: flex; flex-direction: column; gap: 5px; }
        .modal-info-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: rgba(255,255,255,0.78); }

        .modal-body { padding: 26px 28px 28px; display: flex; flex-direction: column; gap: 20px; }

        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 0.825rem; font-weight: 600; color: #1a3557; letter-spacing: 0.01em; }
        .form-sublabel { font-size: 0.775rem; color: #94a3b8; margin-top: -3px; }
        .form-textarea {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #1e293b;
          resize: vertical;
          min-height: 80px;
          transition: border-color 0.15s;
          outline: none;
        }
        .form-textarea:focus { border-color: #1a3557; }
        .form-textarea.error { border-color: #ef4444; }

        .time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-select {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #1e293b;
          background: white;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
        .form-select:focus { border-color: #1a3557; }
        .form-select.error { border-color: #ef4444; }

        .radio-group { display: flex; flex-direction: column; gap: 9px; }
        .radio-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 0.875rem; color: #334155; 
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          transition: border-color 0.15s, background 0.15s;
        }
        .radio-label:hover { border-color: #1a3557; background: #f8fafc; }
        .radio-label input { accent-color: #1a3557; }
        .radio-label.selected { border-color: #1a3557; background: #eef3fa; }
        .radio-group.error .radio-label { border-color: #fca5a5; }

        .error-msg { font-size: 0.75rem; color: #ef4444; margin-top: 2px; }

        .expertise-note {
          background: #f0f4fa;
          border-left: 3px solid #1a3557;
          border-radius: 0 8px 8px 0;
          padding: 10px 14px;
          font-size: 0.8rem;
          color: #475569;
        }
        .expertise-note strong { color: #1a3557; }

        .divider { border: none; border-top: 1px solid #f1f5f9; }

        .submit-btn {
          background: #1a3557;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          transition: background 0.18s, transform 0.12s;
          width: 100%;
          margin-top: 4px;
        }
        .submit-btn:hover { background: #0f2540; transform: translateY(-1px); }

        .success-screen {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 14px; padding: 40px 28px;
        }
        .success-icon {
          width: 64px; height: 64px;
          background: #e8f5e9;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem;
        }
        .success-title { font-family: 'Sora', sans-serif; font-size: 1.3rem; color: #1a3557; font-weight: 700; }
        .success-sub { font-size: 0.875rem; color: #64748b; max-width: 340px; line-height: 1.6; }
        .success-close {
          margin-top: 8px;
          background: #1a3557; color: white;
          border: none; border-radius: 12px;
          padding: 13px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          transition: background 0.18s;
        }
        .success-close:hover { background: #0f2540; }
      `}</style>

            <div className="test-page">
                <span className="test-label">Dev Test Page</span>
                <h1 className="test-title">Sign Up Modal</h1>
                <p className="test-sub">
                    This page is just for testing the popup in isolation. Once approved, your teammate drops{" "}
                    <code>&lt;SignUpModal /&gt;</code> into the events page.
                </p>

                <div className="event-preview">
                    <strong>Dummy Event: {DUMMY_EVENT.title}</strong>
                    📅 {DUMMY_EVENT.date} · {DUMMY_EVENT.time}<br />
                    📍 {DUMMY_EVENT.location}<br />
                    🏷 {DUMMY_EVENT.type} · {DUMMY_EVENT.spotsLeft} spots left
                </div>

                <button className="open-btn" onClick={() => setOpen(true)}>
                    Open Sign Up Modal →
                </button>
            </div>

            {open && <SignUpModal event={DUMMY_EVENT} onClose={() => setOpen(false)} />}
        </>
    );
}
