import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/*
 * Shared chrome for the public legal / information pages (Contact, Terms,
 * Delivery & Returns, Privacy). Keeps typography, spacing and the cream
 * canvas identical across all of them so they read as one THAMRA family.
 * All pages are static server components — public, no login required.
 */

const FD = "var(--font-cormorant), var(--font-ge-serif), Georgia, serif";
const FB = "var(--font-jost), var(--font-ge-sans), sans-serif";

export default function PolicyShell({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main style={{ backgroundColor: "#FAF6F1", minHeight: "100vh", padding: "112px 24px 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
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

        <h1
          style={{
            fontFamily: FD,
            fontSize: "clamp(1.9rem, 4vw, 2.7rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#8B2F3A",
            lineHeight: 1.18,
            margin: 0,
          }}
        >
          {title}
        </h1>

        {intro && (
          <div
            style={{
              fontFamily: FB,
              fontSize: 18,
              fontWeight: 300,
              lineHeight: 1.85,
              color: "#4A3F3C",
              marginTop: 24,
            }}
          >
            {intro}
          </div>
        )}

        <div style={{ marginTop: 44 }}>{children}</div>

        {updated && (
          <p
            style={{
              fontFamily: FB,
              fontSize: 13,
              fontWeight: 300,
              color: "#6B5F5A",
              marginTop: 56,
              paddingTop: 24,
              borderTop: "1px solid rgba(61,51,53,0.1)",
            }}
          >
            {updated}
          </p>
        )}
      </div>
    </main>
  );
}

/* ── Reusable prose primitives ─────────────────────────────────────────────── */

export function PolicySection({
  title,
  children,
  style,
}: {
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section style={{ marginBottom: 40, ...style }}>
      {title && (
        <h2
          style={{
            fontFamily: FD,
            fontSize: "clamp(1.25rem, 2.4vw, 1.6rem)",
            fontWeight: 400,
            color: "#8B2F3A",
            lineHeight: 1.3,
            margin: "0 0 16px",
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function P({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        fontFamily: FB,
        fontSize: 17,
        fontWeight: 300,
        lineHeight: 1.85,
        color: "#3D3335",
        margin: "0 0 16px",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul
      style={{
        fontFamily: FB,
        fontSize: 17,
        fontWeight: 300,
        lineHeight: 1.8,
        color: "#3D3335",
        margin: "0 0 16px",
        paddingLeft: 22,
        listStyleType: "disc",
      }}
    >
      {items.map((it, i) => (
        <li key={i} style={{ marginBottom: 10 }}>
          {it}
        </li>
      ))}
    </ul>
  );
}

/* Contact block used on several pages. Phone → tel:, email → mailto:. */
export function ContactBlock({ heading }: { heading?: string }) {
  const line: CSSProperties = {
    fontFamily: FB,
    fontSize: 17,
    fontWeight: 300,
    lineHeight: 1.9,
    color: "#3D3335",
    margin: 0,
  };
  const linkStyle: CSSProperties = { color: "#8B2F3A", textDecoration: "none" };
  return (
    <div
      style={{
        backgroundColor: "#FDFBF8",
        border: "1px solid rgba(201,169,110,0.35)",
        borderRadius: 8,
        padding: "24px 28px",
      }}
    >
      {heading && (
        <p style={{ ...line, fontWeight: 400, color: "#8B2F3A", marginBottom: 6 }}>{heading}</p>
      )}
      <p style={{ ...line, fontWeight: 400 }}>THAMRA</p>
      <p style={line}>
        ტელეფონი:{" "}
        <a href="tel:+995598511112" style={linkStyle}>
          +995 598 51 11 12
        </a>
      </p>
      <p style={line}>
        ელ. ფოსტა:{" "}
        <a href="mailto:infothamra@gmail.com" style={linkStyle}>
          infothamra@gmail.com
        </a>
      </p>
      <p style={line}>მისამართი: თბილისი, ვაჟა-ფშაველას გამზირი 41</p>
    </div>
  );
}
