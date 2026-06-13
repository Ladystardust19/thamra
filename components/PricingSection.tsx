"use client";
import { useState } from "react";

type PlanId = "one-time" | "monthly" | "three-month";

const FD = "var(--font-cormorant), var(--font-ge-serif), Georgia, serif";
const FB = "var(--font-jost), var(--font-ge-sans), sans-serif";

export default function PricingSection() {
  const [selected, setSelected] = useState<PlanId>("monthly");

  const border = (id: PlanId) =>
    selected === id ? "2px solid #8B2F3A" : "1px solid rgba(0,0,0,0.08)";

  const select = (id: PlanId) => () => setSelected(id);

  return (
    <section id="shop" className="scroll-mt-24 bg-surface overflow-hidden">
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "100px 24px" }}>

        {/* Headline */}
        <h2
          style={{
            fontFamily: FD,
            fontSize: "clamp(2.4rem, 4vw, 3.25rem)",
            fontWeight: 300,
            color: "#8B2F3A",
            textAlign: "center",
            marginBottom: 56,
            lineHeight: 1.15,
          }}
        >
          აირჩიე შენი <em style={{ color: "#C9A96E" }}>THAMRA</em>
        </h2>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">

          {/* ── One-time ── */}
          <div className="order-3 lg:order-1 flex flex-col">
            {/* spacer for badge alignment */}
            <div style={{ height: 34 }} aria-hidden />
            <div
              onClick={select("one-time")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected("one-time")}
              style={{
                backgroundColor: "#FDFBF8",
                border: border("one-time"),
                borderRadius: 4,
                padding: 36,
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <p style={{ fontFamily: FB, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B5F5A", marginBottom: 12 }}>
                ერთჯერადი
              </p>
              <p style={{ fontFamily: FD, fontSize: 20, fontWeight: 300, color: "#3D3335", marginBottom: 20 }}>
                1 თვის კურსი
              </p>
              <p style={{ fontFamily: FD, fontSize: 40, fontWeight: 300, color: "#3D3335", lineHeight: 1 }}>
                89₾
              </p>
            </div>
          </div>

          {/* ── Monthly — recommended ── */}
          <div className="order-1 lg:order-2 flex flex-col">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{
                backgroundColor: "#6B3739",
                color: "#C9A96E",
                fontFamily: FB,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: 100,
                display: "inline-block",
              }}>
                რეკომენდებული
              </span>
            </div>
            <div
              onClick={select("monthly")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected("monthly")}
              style={{
                backgroundColor: "#FDFBF8",
                border: border("monthly"),
                borderRadius: 4,
                padding: 40,
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <p style={{ fontFamily: FB, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B5F5A", marginBottom: 12 }}>
                ყოველთვიური გამოწერა
              </p>
              <p style={{ fontFamily: FD, fontSize: 20, fontWeight: 300, color: "#3D3335", marginBottom: 16 }}>
                ყოველ თვე ავტომატურად
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                <span style={{ fontFamily: FD, fontSize: 48, fontWeight: 300, color: "#8B2F3A", lineHeight: 1 }}>
                  69₾
                </span>
                <span style={{ fontFamily: FB, fontSize: 16, color: "#6B5F5A" }}>
                  / თვეში
                </span>
              </div>
              <p style={{ fontFamily: FB, fontSize: 14, color: "#C9A96E", marginBottom: 6 }}>
                დაზოგე 20₾ ყოველ თვე
              </p>
              <p style={{ fontFamily: FB, fontSize: 13, color: "#8A7E79" }}>
                დღეში დაახლოებით 2.30₾
              </p>
            </div>
          </div>

          {/* ── 3-month — best value ── */}
          <div className="order-2 lg:order-3 flex flex-col">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{
                backgroundColor: "#C9A96E",
                color: "#fff",
                fontFamily: FB,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: 100,
                display: "inline-block",
              }}>
                საუკეთესო ფასი
              </span>
            </div>
            <div
              onClick={select("three-month")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected("three-month")}
              style={{
                backgroundColor: "#FDFBF8",
                border: border("three-month"),
                borderRadius: 4,
                padding: 36,
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <p style={{ fontFamily: FB, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B5F5A", marginBottom: 12 }}>
                3 თვის გამოწერა
              </p>
              <p style={{ fontFamily: FD, fontSize: 20, fontWeight: 300, color: "#3D3335", marginBottom: 20 }}>
                3 თვის კურსი
              </p>
              <p style={{ fontFamily: FD, fontSize: 40, fontWeight: 300, color: "#3D3335", lineHeight: 1, marginBottom: 10 }}>
                159₾
              </p>
              <p style={{ fontFamily: FB, fontSize: 16, color: "#C9A96E", marginBottom: 4 }}>
                53₾ / თვეში
              </p>
              <p style={{ fontFamily: FB, fontSize: 14, color: "#C9A96E" }}>
                დაზოგე 108₾
              </p>
            </div>
          </div>

        </div>

        {/* CTA button */}
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
          <button
            className="transition-colors duration-200 hover:bg-oxblood-dark"
            style={{
              width: "100%",
              maxWidth: 500,
              backgroundColor: "#6B3739",
              color: "#C9A96E",
              fontFamily: FB,
              fontSize: 16,
              fontWeight: 400,
              padding: "16px 40px",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            შეიძინე <em style={{ color: "#C9A96E" }}>THAMRA</em> →
          </button>
        </div>


      </div>
    </section>
  );
}
