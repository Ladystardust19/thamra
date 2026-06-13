export default function ThamraDivider() {
  return (
    <div style={{ backgroundColor: "#F2EBE3", padding: "64px 0", textAlign: "center" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 24px",
      }}>
        <div style={{ flex: 1, height: 1, background: "rgba(201,169,110,0.35)" }} />
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <rect x="1" y="1" width="8" height="8" transform="rotate(45 5 5)" fill="#C9A96E" fillOpacity="0.55" />
        </svg>
        <span style={{
          fontFamily: "var(--font-cormorant), var(--font-ge-serif), Georgia, serif",
          fontSize: 13,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(139,47,58,0.5)",
        }}>
          THAMRA
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <rect x="1" y="1" width="8" height="8" transform="rotate(45 5 5)" fill="#C9A96E" fillOpacity="0.55" />
        </svg>
        <div style={{ flex: 1, height: 1, background: "rgba(201,169,110,0.35)" }} />
      </div>
    </div>
  );
}
