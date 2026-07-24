import type { Metadata } from "next";
import PayTestButton from "./PayTestButton";

// Hidden gateway smoke-test page. Not linked anywhere; keep out of search indexes.
export const metadata: Metadata = {
  title: "Payment test",
  robots: { index: false, follow: false },
};

export default function PayTestPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 24,
        fontFamily: "var(--font-jost), sans-serif",
        color: "#4A3F3C",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 22, color: "#8B2F3A", margin: 0 }}>
        BOG gateway test
      </h1>
      <p style={{ maxWidth: 360, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
        Creates a real 1&nbsp;₾ order and redirects to the Bank of Georgia
        payment page. For verifying the integration only.
      </p>
      <PayTestButton />
    </main>
  );
}
