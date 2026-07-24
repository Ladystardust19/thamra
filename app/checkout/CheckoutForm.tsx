"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";

const FD = "var(--font-cormorant), var(--font-ge-serif), Georgia, serif";
const FB = "var(--font-jost), var(--font-ge-sans), sans-serif";

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

export default function CheckoutForm({
  products,
  initialPlanId,
}: {
  products: Product[];
  initialPlanId: string;
}) {
  const [planId, setPlanId] = useState(initialPlanId);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const product = products.find((p) => p.id === planId) ?? products[0];

  const canSubmit =
    name.trim() && phone.trim() && city.trim() && address.trim() && terms && !loading;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          customer: { name, phone, email, city, address },
        }),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setError(
        "გადახდის დაწყება ვერ მოხერხდა. გთხოვ სცადე თავიდან ან დაგვიკავშირდი."
      );
      console.error("checkout error:", data);
    } catch (err) {
      setError("კავშირის შეცდომა. გთხოვ სცადე თავიდან.");
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <main style={{ background: "#F2EBE3", minHeight: "100vh", padding: "112px 24px 96px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Link
          href="/programs"
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
          ← პროგრამები
        </Link>

        <h1
          style={{
            fontFamily: FD,
            fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#8B2F3A",
            margin: "0 0 32px",
          }}
        >
          შენი შეკვეთა
        </h1>

        <div className="checkout-grid">
          {/* Order summary */}
          <aside
            style={{
              background: "#FDFBF8",
              border: "1px solid rgba(201,169,110,0.35)",
              borderRadius: 10,
              padding: "26px 24px",
              alignSelf: "start",
            }}
          >
            <label style={labelStyle}>აირჩიე პროგრამა</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", marginBottom: 20 }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price} ₾
                </option>
              ))}
            </select>

            <div style={{ fontFamily: FB, fontSize: 13, color: "#6B5F5A" }}>
              {product.duration}
            </div>
            <div
              style={{
                fontFamily: FD,
                fontSize: "2.6rem",
                fontWeight: 400,
                color: "#8B2F3A",
                lineHeight: 1.1,
                margin: "6px 0 2px",
              }}
            >
              {product.price} ₾
            </div>
            <div style={{ fontFamily: FB, fontSize: 12, color: "#6B5F5A" }}>
              სრული ღირებულება (GEL)
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "20px 0 0",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {product.features.map((f) => (
                <li
                  key={f}
                  style={{
                    fontFamily: FB,
                    fontSize: 14,
                    fontWeight: 300,
                    lineHeight: 1.55,
                    color: "#3D3335",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#C9A96E" }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Delivery + pay */}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
            </div>
            <div>
              <label style={labelStyle}>ელ. ფოსტა (არასავალდებულო)</label>
              <input
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
              />
            </div>
            <div>
              <label style={labelStyle}>ქალაქი *</label>
              <input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>მისამართი *</label>
              <input
                style={inputStyle}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ქუჩა, ბინა, სადარბაზო..."
              />
            </div>

            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                fontFamily: FB,
                fontSize: 13,
                fontWeight: 300,
                color: "#4A3F3C",
                lineHeight: 1.5,
                cursor: "pointer",
                marginTop: 4,
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
                <Link href="/terms" style={{ color: "#8B2F3A" }}>
                  წესებსა და პირობებს
                </Link>{" "}
                და{" "}
                <Link href="/privacy" style={{ color: "#8B2F3A" }}>
                  კონფიდენციალურობის პოლიტიკას
                </Link>
                .
              </span>
            </label>

            {error && (
              <p style={{ fontFamily: FB, fontSize: 14, color: "#b00020", margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                background: "#8B2F3A",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "16px 24px",
                fontFamily: FB,
                fontSize: 16,
                letterSpacing: "0.02em",
                cursor: canSubmit ? "pointer" : "default",
                opacity: canSubmit ? 1 : 0.5,
                marginTop: 6,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "..." : `გადაიხადე ${product.price} ₾`}
            </button>

            <p
              style={{
                fontFamily: FB,
                fontSize: 12,
                fontWeight: 300,
                color: "#6B5F5A",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              გადახდა მუშავდება საქართველოს ბანკის დაცული გვერდზე. ბარათის მონაცემები
              Thamra-ს არ ეხება.
            </p>
          </form>
        </div>
      </div>

      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 760px) {
          .checkout-grid { grid-template-columns: 1fr; gap: 28px; }
        }
      `}</style>
    </main>
  );
}
