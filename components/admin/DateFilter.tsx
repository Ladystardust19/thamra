"use client";

import { Preset, PRESET_LABELS } from "@/lib/adminData";

const PRESETS: Preset[] = ["today", "week", "month", "year", "all", "custom"];

export default function DateFilter({
  preset,
  customFrom,
  customTo,
  onChange,
}: {
  preset: Preset;
  customFrom: string;
  customTo: string;
  onChange: (next: { preset: Preset; customFrom: string; customTo: string }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p}
          onClick={() => onChange({ preset: p, customFrom, customTo })}
          className={`font-body text-[12px] uppercase tracking-[0.1em] px-3 py-1.5 border transition-colors ${
            preset === p
              ? "bg-oxblood text-cream border-oxblood"
              : "bg-transparent text-muted border-gold/30 hover:border-oxblood/50 hover:text-ink"
          }`}
        >
          {PRESET_LABELS[p]}
        </button>
      ))}

      {preset === "custom" && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onChange({ preset: "custom", customFrom: e.target.value, customTo })}
            className="font-body text-[13px] text-ink border border-gold/30 px-2 py-1 bg-cream"
          />
          <span className="text-muted text-[13px]">—</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onChange({ preset: "custom", customFrom, customTo: e.target.value })}
            className="font-body text-[13px] text-ink border border-gold/30 px-2 py-1 bg-cream"
          />
        </div>
      )}
    </div>
  );
}
