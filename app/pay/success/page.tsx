import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "გადახდა წარმატებულია",
  robots: { index: false, follow: false },
};

export default function PaySuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 24,
        fontFamily: "var(--font-jost), sans-serif",
        color: "#4A3F3C",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 44 }}>✓</div>
      <h1 style={{ fontSize: 24, color: "#8B2F3A", margin: 0 }}>
        გადახდა წარმატებით დასრულდა
      </h1>
      <p style={{ maxWidth: 380, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
        მადლობა! შენი გადახდა მიღებულია.
      </p>
      <Link href="/" style={{ color: "#8B2F3A", fontSize: 14 }}>
        ← მთავარ გვერდზე
      </Link>
    </main>
  );
}
