"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getAttribution, getSessionId, track } from "@/lib/analytics";

const FD = "LariSerif, var(--font-cormorant), var(--font-ge-serif), Georgia, serif";
const FB = "var(--font-jost), var(--font-ge-sans), sans-serif";

const PRICE = 150;

const labelStyle: React.CSSProperties = {
  fontFamily: FB,
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#6B5F5A",
  marginBottom: 6,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: FB,
  fontSize: 15,
  color: "#3D3335",
  background: "#FDFBF8",
  border: "1px solid rgba(201,169,110,0.4)",
  borderRadius: 6,
  padding: "12px 14px",
  outline: "none",
};

export default function ConsultationRequestClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const rawPhone = phone.replace(/\s+/g, "");
  const phoneOk = rawPhone.length === 9 && rawPhone.startsWith("5");
  const canSubmit = !!name.trim() && phoneOk && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    // Only the real production domain persists leads (localhost + *.vercel.app
    // previews skip the write) — same gate the quiz uses.
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isProd = host === "thamra.ge" || host.endsWith(".thamra.ge");

    if (isProd) {
      // Reuse the quiz_leads pipeline: the insert fires the same Supabase
      // webhook → Telegram alert, tagged so it reads as a consultation request.
      const { error: insErr } = await supabase.from("quiz_leads").insert({
        name: name.trim(),
        phone: `+995${rawPhone}`,
        email: null,
        answers: {
          source: "consultation_request",
          note: `${PRICE}₾ ინდივიდუალური კონსულტაცია — ზარით შეთანხმება`,
        },
        triage_status: "qualified",
        submitted_at: new Date().toISOString(),
        attribution: getAttribution(),
        session_id: getSessionId(),
      });

      if (insErr) {
        console.error("Consultation request insert error:", insErr.message);
        setSubmitting(false);
        setError("დაფიქსირდა შეცდომა. გთხოვ, სცადე ხელახლა.");
        return;
      }

      track({ event_type: "consultation_request", screen: "consultation_request", attribution: getAttribution() });
    }

    setSubmitting(false);
    setDone(true);
  }

  return (
    <main style={{ background: "#F2EBE3", minHeight: "100vh", padding: "112px 24px 96px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontFamily: FB,
            fontSize: 13,
            color: "#C9A96E",
            textDecoration: "none",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            display: "inline-block",
            marginBottom: 36,
          }}
        >
          ← Thamra
        </Link>

        <h1
          style={{
            fontFamily: FD,
            fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#8B2F3A",
            margin: "0 0 12px",
          }}
        >
          ინდივიდუალური კონსულტაცია
        </h1>

        {done ? (
          <div
            style={{
              background: "#FDFBF8",
              border: "1px solid rgba(201,169,110,0.4)",
              borderRadius: 10,
              padding: "28px 24px",
            }}
          >
            <p style={{ fontFamily: FD, fontSize: "1.5rem", color: "#8B2F3A", margin: "0 0 10px" }}>
              მადლობა!
            </p>
            <p style={{ fontFamily: FB, fontSize: 16, color: "#4A3F3C", margin: 0, lineHeight: 1.7 }}>
              შენი მოთხოვნა მიღებულია. მალე დაგიკავშირდებით ტელეფონით და ერთად შევათანხმებთ
              კონსულტაციის დროს.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: FB, fontSize: 16, color: "#4A3F3C", margin: "0 0 8px", lineHeight: 1.7 }}>
              ინდივიდუალური კონსულტაცია თამრას თმის ექსპერტთან — {PRICE} ₾.
            </p>
            <p style={{ fontFamily: FB, fontSize: 15, color: "#6B5F5A", margin: "0 0 32px", lineHeight: 1.7 }}>
              დატოვე სახელი და ტელეფონის ნომერი. დაგიკავშირდებით და ერთად შევათანხმებთ დროს.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <label style={labelStyle}>სახელი და გვარი *</label>
                <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>ტელეფონი *</label>
                <input
                  style={inputStyle}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="5xx xx xx xx"
                />
                {phone.trim() && !phoneOk && (
                  <p style={{ fontFamily: FB, fontSize: 13, color: "#b00020", margin: "6px 0 0" }}>
                    შეიყვანე სწორი მობილურის ნომერი
                  </p>
                )}
              </div>

              {error && (
                <p style={{ fontFamily: FB, fontSize: 14, color: "#b00020", margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  background: "#8B2F3A", color: "#fff", border: "none", borderRadius: 8,
                  padding: "16px 24px", fontFamily: FB, fontSize: 16, letterSpacing: "0.02em",
                  cursor: canSubmit ? "pointer" : "default", opacity: canSubmit ? 1 : 0.5,
                  transition: "opacity 0.15s",
                }}
              >
                {submitting ? "..." : "დაგიკავშირდით"}
              </button>

              <p style={{ fontFamily: FB, fontSize: 12, fontWeight: 300, color: "#6B5F5A", margin: 0, lineHeight: 1.6 }}>
                ღილაკზე დაჭერით ეთანხმები, რომ დაგიკავშირდეთ მითითებულ ნომერზე. იხილე{" "}
                <Link href="/privacy" style={{ color: "#8B2F3A" }}>კონფიდენციალურობის პოლიტიკა</Link>.
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
