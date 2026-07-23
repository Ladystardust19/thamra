import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "პროგრამები და ფასები | Thamra",
  description:
    "THAMRA-ს პროგრამები და ფასები — Foundation (149 ₾), Signature (399 ₾) და Hair Longevity (749 ₾). ყველა ფასი ლარში.",
};

const FD = "var(--font-cormorant), var(--font-ge-serif), Georgia, serif";
const FB = "var(--font-jost), var(--font-ge-sans), sans-serif";

type Program = {
  name: string;
  duration: string;
  price: string;
  equivalent?: string;
  features: string[];
  featured?: boolean;
};

const PROGRAMS: Program[] = [
  {
    name: "Thamra Foundation",
    duration: "ერთთვიანი პროგრამა",
    price: "149 ₾",
    features: [
      "ერთი თვისთვის განკუთვნილი Thamra",
      "პერსონალური შეფასების კითხვარი",
      "თმისა და საერთო მდგომარეობის საწყისი შეფასება",
      "ინდივიდუალური 30-დღიანი რეკომენდაციები",
    ],
  },
  {
    name: "Thamra Signature",
    duration: "90-დღიანი პროგრამა",
    price: "399 ₾",
    equivalent: "საორიენტაციო ეკვივალენტი: ≈133 ₾ თვეში / ≈4.43 ₾ დღეში",
    features: [
      "სამი თვისთვის განკუთვნილი Thamra",
      "პასუხების საფუძველზე შექმნილი პერსონალური შეფასება",
      "90-დღიანი ზრუნვის გზამკვლევი",
      "პროგრესის შეფასება სამი თვის შემდეგ",
    ],
    featured: true,
  },
  {
    name: "Thamra Hair Longevity",
    duration: "ექვსთვიანი სრული პროგრამა",
    price: "749 ₾",
    equivalent: "საორიენტაციო ეკვივალენტი: ≈125 ₾ თვეში / ≈4.16 ₾ დღეში",
    features: [
      "ექვსი თვისთვის განკუთვნილი Thamra",
      "სიღრმისეული პერსონალური შეფასება",
      "180-დღიანი ინდივიდუალური გზამკვლევი",
    ],
  },
];

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9A96E"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginTop: 4, flexShrink: 0 }}
      aria-hidden
    >
      <path d="M4 12.5l5 5 11-12" />
    </svg>
  );
}

export default function ProgramsPage() {
  return (
    <main style={{ backgroundColor: "#F2EBE3", minHeight: "100vh", padding: "112px 24px 96px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
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
            marginBottom: 40,
          }}
        >
          ← Thamra
        </Link>

        <header style={{ maxWidth: 640, marginBottom: 56 }}>
          <span
            style={{
              fontFamily: FB,
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C9A96E",
            }}
          >
            პროგრამები
          </span>
          <h1
            style={{
              fontFamily: FD,
              fontSize: "clamp(2rem, 4vw, 2.9rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#8B2F3A",
              lineHeight: 1.18,
              margin: "16px 0 0",
            }}
          >
            აირჩიე შენი პროგრამა
          </h1>
          <p
            style={{
              fontFamily: FB,
              fontSize: 18,
              fontWeight: 300,
              lineHeight: 1.8,
              color: "#4A3F3C",
              margin: "18px 0 0",
            }}
          >
            ყველა ფასი მითითებულია ქართულ ლარში (GEL) და წარმოადგენს სრულ გადასახდელ ღირებულებას.
          </p>
        </header>

        <div className="programs-grid">
          {PROGRAMS.map((p) => (
            <article
              key={p.name}
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FDFBF8",
                border: p.featured ? "1.5px solid #C9A96E" : "1px solid rgba(201,169,110,0.35)",
                borderRadius: 10,
                padding: "32px 28px",
              }}
            >
              {p.featured && (
                <span
                  style={{
                    alignSelf: "flex-start",
                    fontFamily: FB,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#F7F1E9",
                    backgroundColor: "#8B2F3A",
                    borderRadius: 999,
                    padding: "5px 12px",
                    marginBottom: 16,
                  }}
                >
                  პოპულარული
                </span>
              )}

              <span
                style={{
                  fontFamily: FB,
                  fontSize: 13,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#6B5F5A",
                }}
              >
                {p.duration}
              </span>

              <h2
                style={{
                  fontFamily: FD,
                  fontSize: "1.75rem",
                  fontWeight: 400,
                  color: "#3D3335",
                  margin: "10px 0 20px",
                }}
              >
                {p.name}
              </h2>

              {/* Full payable price — the clearest figure on the card */}
              <div
                style={{
                  fontFamily: FD,
                  fontSize: "clamp(2.6rem, 5vw, 3.2rem)",
                  fontWeight: 400,
                  color: "#8B2F3A",
                  lineHeight: 1,
                }}
              >
                {p.price}
              </div>
              <span
                style={{
                  fontFamily: FB,
                  fontSize: 13,
                  fontWeight: 300,
                  color: "#6B5F5A",
                  marginTop: 8,
                }}
              >
                სრული ღირებულება (GEL)
              </span>

              {p.equivalent && (
                <span
                  style={{
                    fontFamily: FB,
                    fontSize: 13,
                    fontWeight: 300,
                    color: "#6B5F5A",
                    marginTop: 4,
                  }}
                >
                  {p.equivalent}
                </span>
              )}

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "24px 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {p.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontFamily: FB,
                      fontSize: 16,
                      fontWeight: 300,
                      lineHeight: 1.6,
                      color: "#3D3335",
                    }}
                  >
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div style={{ flex: 1 }} />

              <Link
                href="/quiz"
                className="key-reasons-cta"
                style={{ marginTop: 28, textAlign: "center" }}
              >
                გაიარე ტესტი →
              </Link>
            </article>
          ))}
        </div>

        {/* Required disclosures near the programs */}
        <div style={{ maxWidth: 760, marginTop: 44, display: "flex", flexDirection: "column", gap: 14 }}>
          <p
            style={{
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.7,
              color: "#4A3F3C",
              margin: 0,
            }}
          >
            პერსონალური შეფასება, რეკომენდაციები, გზამკვლევები და პროგრესის მხარდაჭერა შესაბამის
            პროგრამაში დამატებითი საფასურის გარეშეა ჩართული.
          </p>
          <p
            style={{
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.7,
              color: "#4A3F3C",
              margin: 0,
            }}
          >
            თვიური და დღიური თანხები მხოლოდ სრული ღირებულების საორიენტაციო გაანგარიშებაა და არ
            წარმოადგენს გამოწერას, ყოველთვიურ გადასახადს ან განვადებას.
          </p>
        </div>
      </div>

      <style>{`
        .programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .programs-grid { grid-template-columns: 1fr; gap: 20px; max-width: 480px; }
        }
      `}</style>
    </main>
  );
}
