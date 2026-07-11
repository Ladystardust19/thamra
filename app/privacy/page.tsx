import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "კონფიდენციალურობის პოლიტიკა | Thamra",
};

export default function PrivacyPage() {
  return (
    <main style={{ backgroundColor: "#FAF6F1", minHeight: "100vh", padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <Link
          href="/"
          style={{
            fontFamily: "inherit",
            fontSize: 13,
            color: "#C9A96E",
            textDecoration: "none",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            display: "inline-block",
            marginBottom: 48,
          }}
        >
          ← Thamra
        </Link>

        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#8B2F3A",
            lineHeight: 1.2,
            marginBottom: 40,
          }}
        >
          კონფიდენციალურობის პოლიტიკა
        </h1>

        <div style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.85, color: "#3D3335" }}>

          <p style={{ marginBottom: 24 }}>
            Thamra პატივს სცემს თქვენი პერსონალური მონაცემების კონფიდენციალურობას.
          </p>

          <p style={{ marginBottom: 24 }}>
            ჩვენს ვებგვერდზე, Facebook Instant Form-ის ან სხვა საკომუნიკაციო არხების მეშვეობით მოწოდებული ინფორმაცია — მათ შორის სახელი, ტელეფონის ნომერი და თქვენ მიერ გაზიარებული სხვა მონაცემები — გამოიყენება მხოლოდ თქვენი მოთხოვნის დამუშავების, კონსულტაციასთან დაკავშირების და Thamra-ს გუნდის მიერ თქვენთან კომუნიკაციის მიზნით.
          </p>

          <p style={{ marginBottom: 40 }}>
            თქვენი პერსონალური მონაცემები არ გადაეცემა მესამე პირებს თქვენი წინასწარი თანხმობის გარეშე, გარდა კანონით გათვალისწინებული შემთხვევებისა.
          </p>

          <p style={{ marginBottom: 8, fontWeight: 400 }}>კითხვების შემთხვევაში დაგვიკავშირდით:</p>

          <p style={{ marginBottom: 4 }}>Thamra</p>
          <p style={{ marginBottom: 4 }}>მისამართი: თბილისი, ვაჟა-ფშაველას 41</p>
          <p>ტელეფონი: 598 51 11 12</p>

        </div>
      </div>
    </main>
  );
}
