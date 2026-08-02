"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { peekSessionId } from "@/lib/analytics";
import { getProduct } from "@/lib/products";
import { slotDayLabel, slotTimeLabel, type Slot } from "@/lib/consultation";

const FD = "var(--font-cormorant), var(--font-ge-serif), Georgia, serif";
const FB = "var(--font-jost), var(--font-ge-sans), sans-serif";

const CONSULT = getProduct("consultation");
const PRICE = CONSULT?.price ?? 150;

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

export default function ConsultationClient() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState("");

  const [selected, setSelected] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadSlots() {
    setLoadingSlots(true);
    setSlotsError("");
    try {
      const res = await fetch("/api/consultation/slots", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.slots)) {
        setSlots(data.slots);
      } else {
        setSlotsError("დროების ჩატვირთვა ვერ მოხერხდა. სცადე განახლება.");
      }
    } catch {
      setSlotsError("კავშირის შეცდომა. სცადე განახლება.");
    }
    setLoadingSlots(false);
  }

  useEffect(() => {
    loadSlots();
  }, []);

  // Group available slots by day, preserving chronological order.
  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = slotDayLabel(s.start);
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    return Array.from(map.entries());
  }, [slots]);

  const rawPhone = phone.replace(/\s+/g, "");
  const phoneOk = rawPhone.length === 9 && rawPhone.startsWith("5");
  const canSubmit = !!selected && !!name.trim() && phoneOk && terms && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "consultation",
          sessionId: peekSessionId(),
          slot: selected,
          customer: { name: name.trim(), phone: `+995${rawPhone}` },
        }),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (res.status === 409) {
        // Someone booked this slot first — refresh and ask them to repick.
        setError("ეს დრო ახლახან დაიკავეს. აირჩიე სხვა თავისუფალი დრო.");
        setSelected("");
        await loadSlots();
      } else {
        setError("გადახდის დაწყება ვერ მოხერხდა. გთხოვ სცადე თავიდან.");
        console.error("consultation checkout error:", data);
      }
    } catch (err) {
      setError("კავშირის შეცდომა. გთხოვ სცადე თავიდან.");
      console.error(err);
    }
    setSubmitting(false);
  }

  return (
    <main style={{ background: "#F2EBE3", minHeight: "100vh", padding: "112px 24px 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/quiz"
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
          ← უკან
        </Link>

        <h1
          style={{
            fontFamily: FD,
            fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#8B2F3A",
            margin: "0 0 8px",
          }}
        >
          ინდივიდუალური კონსულტაცია
        </h1>
        <p style={{ fontFamily: FB, fontSize: 15, color: "#4A3F3C", margin: "0 0 32px", lineHeight: 1.6 }}>
          აირჩიე შენთვის სასურველი თავისუფალი დრო, შეავსე მონაცემები და დაადასტურე
          ჯავშანი ონლაინ გადახდით — {PRICE} ₾.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Slot picker */}
          <div>
            <label style={labelStyle}>აირჩიე კონსულტაციის დრო *</label>

            {loadingSlots && (
              <p style={{ fontFamily: FB, fontSize: 14, color: "#6B5F5A" }}>იტვირთება…</p>
            )}

            {!loadingSlots && slotsError && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p style={{ fontFamily: FB, fontSize: 14, color: "#b00020", margin: 0 }}>{slotsError}</p>
                <button
                  type="button"
                  onClick={loadSlots}
                  style={{
                    fontFamily: FB, fontSize: 13, color: "#8B2F3A",
                    background: "none", border: "1px solid rgba(201,169,110,0.5)",
                    borderRadius: 6, padding: "6px 12px", cursor: "pointer",
                  }}
                >
                  განახლება
                </button>
              </div>
            )}

            {!loadingSlots && !slotsError && slots.length === 0 && (
              <p style={{ fontFamily: FB, fontSize: 14, color: "#6B5F5A" }}>
                ამ ეტაპზე თავისუფალი დრო არ არის. სცადე მოგვიანებით.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {days.map(([dayLabel, daySlots]) => (
                <div key={dayLabel}>
                  <p style={{ fontFamily: FB, fontSize: 13, fontWeight: 500, color: "#3D3335", margin: "0 0 8px" }}>
                    {dayLabel}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {daySlots.map((s) => {
                      const active = selected === s.start;
                      return (
                        <button
                          type="button"
                          key={s.start}
                          onClick={() => setSelected(s.start)}
                          style={{
                            fontFamily: FB,
                            fontSize: 14,
                            padding: "9px 14px",
                            borderRadius: 6,
                            cursor: "pointer",
                            border: active ? "1px solid #8B2F3A" : "1px solid rgba(201,169,110,0.4)",
                            background: active ? "#8B2F3A" : "#FDFBF8",
                            color: active ? "#fff" : "#3D3335",
                            transition: "all 0.12s",
                          }}
                        >
                          {slotTimeLabel(s.start)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
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

          <label
            style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              fontFamily: FB, fontSize: 13, fontWeight: 300, color: "#4A3F3C",
              lineHeight: 1.5, cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              ვეთანხმები{" "}
              <Link href="/terms" style={{ color: "#8B2F3A" }}>წესებსა და პირობებს</Link>{" "}
              და{" "}
              <Link href="/privacy" style={{ color: "#8B2F3A" }}>კონფიდენციალურობის პოლიტიკას</Link>.
            </span>
          </label>

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
            {submitting ? "..." : `დაადასტურე და გადაიხადე ${PRICE} ₾`}
          </button>

          <p style={{ fontFamily: FB, fontSize: 12, fontWeight: 300, color: "#6B5F5A", margin: 0, lineHeight: 1.5 }}>
            გადახდა მუშავდება საქართველოს ბანკის დაცულ გვერდზე. ბარათის მონაცემები
            Thamra-ს არ ეხება. ჯავშნის დადასტურებას მიიღებ ტელეფონით ან WhatsApp-ით.
          </p>
        </form>
      </div>
    </main>
  );
}
