import Link from "next/link";

export default function QuizCTABanner() {
  return (
    <section
      aria-label="Quiz CTA"
      style={{
        backgroundColor: "#8B2F3A",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-cormorant), var(--font-ge-serif), Georgia, serif",
          fontSize: "clamp(1.9rem, 5.5vw, 2.7rem)",
          fontWeight: 300,
          color: "#C9A96E",
          lineHeight: 1.22,
          maxWidth: 520,
          margin: "0 auto 18px",
        }}
      >
        გაიგეთ, რა სჭირდება თქვენს თმას.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-jost), var(--font-ge-sans), sans-serif",
          fontSize: 17,
          fontWeight: 300,
          color: "rgba(247, 241, 233, 0.78)",
          lineHeight: 1.8,
          maxWidth: 420,
          margin: "0 auto 36px",
        }}
      >
        უპასუხეთ რამდენიმე კითხვას და გაიგეთ, როგორ იზრუნოთ თმის სიჯანსაღეზე მენოპაუზის პერიოდში.
      </p>
      <Link
        href="/quiz"
        style={{
          display: "inline-block",
          backgroundColor: "#C9A96E",
          color: "#3D3335",
          padding: "16px 40px",
          borderRadius: 4,
          fontFamily: "var(--font-jost), var(--font-ge-sans), sans-serif",
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        გაიარე 2-წუთიანი ტესტი
      </Link>
    </section>
  );
}
