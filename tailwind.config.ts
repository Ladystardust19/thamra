import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F2EBE3", // page background
        surface: "#EDE5DC", // cards / elevated
        paper: "#FDFBF8", // white cards
        oxblood: "#8B2F3A", // primary (from packaging)
        "oxblood-dark": "#722530", // hover
        burgundy: "#37121A", // deep formula-section background
        "burgundy-soft": "#4C1D27", // selector default / elevated on burgundy
        gold: "#C9A96E", // decorative fills / hairlines ONLY (fails text contrast)
        "gold-ink": "#6E5626", // darkened gold for text + interactive (~5.6:1 on cream, passes AA)
        champagne: "#C9A96E", // alias of gold, used by ResultsTimeline
        ink: "#3D3335", // body text (warm dark brown)
        read: "#4A3F3C", // readable body/paragraph text (warm, dark)
        muted: "#6B5F5A", // secondary/caption text (floor — never lighter)
        "cream-soft": "#F7F1E9", // text/elements on oxblood
      },
      borderColor: {
        hairline: "rgba(61, 51, 53, 0.12)", // warm hairline on light
      },
      fontFamily: {
        // Latin → Cormorant; Georgian falls through to Noto Serif Georgian.
        // "LariSerif" (unicode-range U+20BE only) supplies a size-matched ₾.
        display: [
          "LariSerif",
          "var(--font-cormorant)",
          "var(--font-ge-serif)",
          "Georgia",
          "serif",
        ],
        // Latin → Jost; Georgian falls through to Noto Sans Georgian
        body: [
          "var(--font-jost)",
          "var(--font-ge-sans)",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
