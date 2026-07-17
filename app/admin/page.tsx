"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Preset, presetRange } from "@/lib/adminData";
import DateFilter from "@/components/admin/DateFilter";
import QuizTab from "@/components/admin/QuizTab";
import ResultTab from "@/components/admin/ResultTab";
import LeadsTab from "@/components/admin/LeadsTab";

const ADMIN_EMAIL = "nino.jakeli270@gmail.com";

type Tab = "quiz" | "result" | "leads";

const TABS: { key: Tab; label: string }[] = [
  { key: "quiz", label: "ქვიზი" },
  { key: "result", label: "შედეგის გვერდი" },
  { key: "leads", label: "ლიდები" },
];

export default function AdminPage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [denied, setDenied] = useState(false);

  const [tab, setTab] = useState<Tab>("quiz");
  const [preset, setPreset] = useState<Preset>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Recomputed only when the filter changes (freezes "now" until then).
  const range = useMemo(
    () => presetRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/cabinet/login?next=/admin");
        return;
      }
      if (data.user.email !== ADMIN_EMAIL) {
        setDenied(true);
        setBooting(false);
        return;
      }
      setBooting(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (booting) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-oxblood/30 border-t-oxblood rounded-full animate-spin" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-body text-[15px] text-muted">წვდომა აკრძალულია.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-24 pb-20 px-6 sm:px-12">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-[36px] italic text-oxblood">Admin</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gold/25 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-body text-[14px] uppercase tracking-[0.1em] px-4 py-2.5 border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? "border-oxblood text-oxblood"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Date filter — analytics tabs only */}
        {tab !== "leads" && (
          <div className="mb-8">
            <DateFilter
              preset={preset}
              customFrom={customFrom}
              customTo={customTo}
              onChange={(n) => {
                setPreset(n.preset);
                setCustomFrom(n.customFrom);
                setCustomTo(n.customTo);
              }}
            />
          </div>
        )}

        {tab === "quiz" && <QuizTab range={range} />}
        {tab === "result" && <ResultTab range={range} />}
        {tab === "leads" && <LeadsTab />}
      </div>
    </main>
  );
}
