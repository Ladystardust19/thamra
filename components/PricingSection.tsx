import Link from "next/link";
import Image from "next/image";

const FD = "var(--font-cormorant), var(--font-ge-serif), Georgia, serif";
const FB = "var(--font-jost), var(--font-ge-sans), sans-serif";

const BENEFITS = [
  "შენი პერსონალური თმის ჯანმრთელობის პროფილი",
  "ექსკლუზიური ფასი — მხოლოდ სიაში მყოფებისთვის",
  "პრიორიტეტული წვდომა გაშვებისთანავე",
];

export default function PricingSection() {
  return (
    <section id="shop" className="scroll-mt-24 bg-surface overflow-hidden">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "stretch",
          }}
          className="ps-grid"
        >

          {/* ── Left — waitlist ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <span style={{
              fontFamily: FB,
              fontSize: 14,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C9A96E",
            }}>
              COMING SOON
            </span>

            <h2 style={{
              fontFamily: FD,
              fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
              fontWeight: 300,
              color: "#8B2F3A",
              lineHeight: 1.2,
              margin: 0,
            }}>
              მიიღე THAMRA პირველმა
            </h2>

            <p style={{
              fontFamily: FB,
              fontSize: 18,
              color: "#4A3F3C",
              lineHeight: 1.7,
              margin: 0,
            }}>
              გაიარე 2 წუთიანი ტესტი — გაიგე რატომ ცვივა შენი თმა და როგორ დაგეხმარება THAMRA.
            </p>

            <Link
              href="/quiz"
              className="key-reasons-cta"
            >
              გაიგე რა სჭირდება შენს თმას →
            </Link>

            <p style={{ fontFamily: FB, fontSize: 13, color: "#8A7E79", margin: 0 }}>
              500+ ქალმა უკვე გაიარა ტესტი
            </p>


          </div>

          {/* ── Right — image ── */}
          <div style={{ borderRadius: 4, overflow: "hidden", position: "relative", minHeight: 400 }}>
            <Image
              src="/sheni-akhali-tavi.webp"
              alt="THAMRA"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ps-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
