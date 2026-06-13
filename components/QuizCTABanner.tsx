import Link from "next/link";

export default function QuizCTABanner() {
  return (
    <section
      aria-label="Quiz CTA"
      style={{
        backgroundColor: "#EDE5DC",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-jost), var(--font-ge-sans), sans-serif",
          fontSize: 17,
          fontWeight: 300,
          color: "#6B5F5A",
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
          backgroundColor: "#6B3739",
          color: "#C9A96E",
          padding: "16px 40px",
          borderRadius: 4,
          fontFamily: "var(--font-jost), var(--font-ge-sans), sans-serif",
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        გაიგე რა სჭირდება შენს თმას →
      </Link>
    </section>
  );
}
