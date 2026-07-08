"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  age: number | null;
  hair_condition: string | null;
}

interface Receipt {
  id: string;
  file_url: string;
  file_name: string;
  status: string;
  uploaded_at: string;
}

interface Analysis {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

const ACCEPTED_RECEIPT = ".jpg,.jpeg,.png,.pdf";
const ACCEPTED_ANALYSIS = ".jpg,.jpeg,.png,.pdf,.docx";
const MAX_SIZE = 10 * 1024 * 1024;

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const labelClass = "font-body text-[12px] uppercase tracking-[0.12em] text-muted";
const inputClass =
  "bg-paper border border-gold/30 px-4 py-3 font-body text-[15px] text-ink outline-none focus:border-oxblood/50 transition-colors";
const btnClass =
  "bg-oxblood text-cream-soft font-body text-[13px] uppercase tracking-[0.15em] px-6 py-3 transition-colors hover:bg-oxblood-dark disabled:opacity-40";
const sectionHeadingClass =
  "font-display text-[28px] italic text-oxblood mb-6 pb-3 border-b border-gold/30";

export default function CabinetPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [age, setAge] = useState("");
  const [hairCondition, setHairCondition] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptMsg, setReceiptMsg] = useState("");
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState("სისხლის ანალიზი");
  const [analysisUploading, setAnalysisUploading] = useState(false);
  const [analysisMsg, setAnalysisMsg] = useState("");
  const analysisInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/cabinet/login");
        return;
      }
      setUser(data.user);
      loadAll(data.user.id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAll(userId: string) {
    const [profileRes, receiptsRes, analysesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("receipts")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("analyses")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false }),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setAge(profileRes.data.age?.toString() ?? "");
      setHairCondition(profileRes.data.hair_condition ?? "");
    }
    if (receiptsRes.data) setReceipts(receiptsRes.data);
    if (analysesRes.data) setAnalyses(analysesRes.data);
    setBooting(false);
  }

  async function saveProfile() {
    if (!user) return;
    setProfileSaving(true);
    setProfileMsg("");
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
      phone: profile?.phone ?? user.user_metadata?.phone ?? null,
      age: age ? parseInt(age) : null,
      hair_condition: hairCondition || null,
    });
    setProfileSaving(false);
    if (error) {
      setProfileMsg("შეცდომა შენახვისას.");
    } else {
      setProfileMsg("შენახულია ✓");
      setTimeout(() => setProfileMsg(""), 3000);
    }
  }

  function validateFile(file: File, setMsg: (m: string) => void) {
    if (file.size > MAX_SIZE) {
      setMsg("ფაილი 10MB-ზე მეტია.");
      return false;
    }
    return true;
  }

  function onReceiptFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setReceiptMsg("");
    if (file && !validateFile(file, setReceiptMsg)) {
      setReceiptFile(null);
      e.target.value = "";
    } else {
      setReceiptFile(file);
    }
  }

  function onAnalysisFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAnalysisMsg("");
    if (file && !validateFile(file, setAnalysisMsg)) {
      setAnalysisFile(null);
      e.target.value = "";
    } else {
      setAnalysisFile(file);
    }
  }

  async function uploadReceipt() {
    if (!receiptFile || !user) return;
    setReceiptUploading(true);
    setReceiptMsg("");
    const path = `${user.id}/${Date.now()}-${receiptFile.name}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, receiptFile);
    if (upErr) {
      setReceiptMsg("ატვირთვა ვერ მოხდა.");
      setReceiptUploading(false);
      return;
    }
    const { error: dbErr, data } = await supabase
      .from("receipts")
      .insert({ user_id: user.id, file_url: path, file_name: receiptFile.name, status: "pending" })
      .select()
      .single();
    if (dbErr) {
      setReceiptMsg("ჩანაწერის შენახვა ვერ მოხდა.");
    } else {
      setReceipts((prev) => [data, ...prev]);
      setReceiptFile(null);
      if (receiptInputRef.current) receiptInputRef.current.value = "";
      setReceiptMsg("ატვირთულია ✓");
      setTimeout(() => setReceiptMsg(""), 3000);
    }
    setReceiptUploading(false);
  }

  async function deleteReceipt(r: Receipt) {
    await supabase.storage.from("receipts").remove([r.file_url]);
    await supabase.from("receipts").delete().eq("id", r.id);
    setReceipts((prev) => prev.filter((x) => x.id !== r.id));
  }

  async function uploadAnalysis() {
    if (!analysisFile || !user) return;
    setAnalysisUploading(true);
    setAnalysisMsg("");
    const path = `${user.id}/${Date.now()}-${analysisFile.name}`;
    const { error: upErr } = await supabase.storage
      .from("analyses")
      .upload(path, analysisFile);
    if (upErr) {
      setAnalysisMsg("ატვირთვა ვერ მოხდა.");
      setAnalysisUploading(false);
      return;
    }
    const { error: dbErr, data } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        file_url: path,
        file_name: analysisFile.name,
        file_type: analysisType,
      })
      .select()
      .single();
    if (dbErr) {
      setAnalysisMsg("ჩანაწერის შენახვა ვერ მოხდა.");
    } else {
      setAnalyses((prev) => [data, ...prev]);
      setAnalysisFile(null);
      if (analysisInputRef.current) analysisInputRef.current.value = "";
      setAnalysisMsg("ატვირთულია ✓");
      setTimeout(() => setAnalysisMsg(""), 3000);
    }
    setAnalysisUploading(false);
  }

  async function deleteAnalysis(a: Analysis) {
    await supabase.storage.from("analyses").remove([a.file_url]);
    await supabase.from("analyses").delete().eq("id", a.id);
    setAnalyses((prev) => prev.filter((x) => x.id !== a.id));
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/cabinet/login");
  }

  if (booting) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-oxblood/30 border-t-oxblood rounded-full animate-spin" />
      </div>
    );
  }

  const rawName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "";
  const displayName = rawName.split(" ")[0] || "მომხმარებელო";

  return (
    <main className="min-h-screen bg-cream pt-24 pb-20 px-6 sm:px-12">
      <div className="max-w-[860px] mx-auto">

        {/* Top bar */}
        <div className="flex items-start justify-between mb-14">
          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="font-body text-[12px] uppercase tracking-[0.12em] text-muted hover:text-oxblood transition-colors"
            >
              ← მთავარზე გადასვლა
            </a>
            <h1 className="font-display text-[32px] italic text-oxblood leading-tight">
              გამარჯობა, {displayName}
            </h1>
          </div>
          <button
            onClick={logout}
            className="font-body text-[12px] uppercase tracking-[0.12em] text-muted hover:text-oxblood transition-colors mt-2"
          >
            გასვლა
          </button>
        </div>

        {/* ── Section 1: ჩემი მონაცემები ── */}
        <section className="mb-16">
          <h2 className={sectionHeadingClass}>ჩემი მონაცემები</h2>
          <div className="flex flex-col gap-5 max-w-[480px]">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ასაკი</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={18}
                max={99}
                className={`${inputClass} w-28`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>თმის მდგომარეობა</label>
              <textarea
                value={hairCondition}
                onChange={(e) => setHairCondition(e.target.value)}
                rows={4}
                placeholder="აღწერეთ თმის მდგომარეობა..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className={btnClass}
              >
                {profileSaving ? "..." : "შენახვა"}
              </button>
              {profileMsg && (
                <span
                  className={`font-body text-[13px] ${
                    profileMsg.includes("შეცდომა") ? "text-red-700" : "text-emerald-700"
                  }`}
                >
                  {profileMsg}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Section 2: ქვითრის ატვირთვა ── */}
        <section className="mb-16">
          <h2 className={sectionHeadingClass}>ქვითრის ატვირთვა</h2>
          <div className="flex flex-col gap-4 max-w-[480px]">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ფაილი (jpg, png, pdf — max 10MB)</label>
              <input
                ref={receiptInputRef}
                type="file"
                accept={ACCEPTED_RECEIPT}
                onChange={onReceiptFileChange}
                className="font-body text-[14px] text-ink
                  file:mr-4 file:bg-oxblood file:text-cream-soft file:border-0
                  file:px-4 file:py-2 file:font-body file:text-[12px]
                  file:uppercase file:tracking-[0.12em] file:cursor-pointer
                  file:hover:bg-oxblood-dark file:transition-colors"
              />
              {receiptFile && (
                <p className="font-body text-[13px] text-muted">
                  {receiptFile.name} — {fmtSize(receiptFile.size)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={uploadReceipt}
                disabled={receiptUploading || !receiptFile}
                className={btnClass}
              >
                {receiptUploading ? "..." : "ატვირთვა →"}
              </button>
              {receiptMsg && (
                <span
                  className={`font-body text-[13px] ${
                    receiptMsg.includes("✓") ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {receiptMsg}
                </span>
              )}
            </div>
          </div>

          {receipts.length > 0 && (
            <div className="mt-8 max-w-[680px]">
              <p className={`${labelClass} mb-3`}>ატვირთული ქვითრები</p>
              <div className="flex flex-col gap-2">
                {receipts.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between bg-paper border border-gold/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-body text-[14px] text-ink">{r.file_name}</p>
                      <p className="font-body text-[12px] text-muted">{fmt(r.uploaded_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`font-body text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 border ${
                          r.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {r.status === "verified" ? "დადასტურებული" : "მოლოდინში"}
                      </span>
                      <button
                        onClick={() => deleteReceipt(r)}
                        aria-label="წაშლა"
                        className="text-muted hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Section 3: ანალიზების ატვირთვა ── */}
        <section className="mb-16">
          <h2 className={sectionHeadingClass}>ანალიზების ატვირთვა</h2>
          <div className="flex flex-col gap-4 max-w-[480px]">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ანალიზის სახეობა</label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option>სისხლის ანალიზი</option>
                <option>ჰორმონალური ანალიზი</option>
                <option>სხვა</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ფაილი (jpg, png, pdf, docx — max 10MB)</label>
              <input
                ref={analysisInputRef}
                type="file"
                accept={ACCEPTED_ANALYSIS}
                onChange={onAnalysisFileChange}
                className="font-body text-[14px] text-ink
                  file:mr-4 file:bg-oxblood file:text-cream-soft file:border-0
                  file:px-4 file:py-2 file:font-body file:text-[12px]
                  file:uppercase file:tracking-[0.12em] file:cursor-pointer
                  file:hover:bg-oxblood-dark file:transition-colors"
              />
              {analysisFile && (
                <p className="font-body text-[13px] text-muted">
                  {analysisFile.name} — {fmtSize(analysisFile.size)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={uploadAnalysis}
                disabled={analysisUploading || !analysisFile}
                className={btnClass}
              >
                {analysisUploading ? "..." : "ატვირთვა →"}
              </button>
              {analysisMsg && (
                <span
                  className={`font-body text-[13px] ${
                    analysisMsg.includes("✓") ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {analysisMsg}
                </span>
              )}
            </div>
            <button
              onClick={() => analysisInputRef.current?.click()}
              className="self-start font-body text-[13px] text-oxblood hover:text-oxblood-dark transition-colors underline underline-offset-2"
            >
              ფაილის დამატება +
            </button>
          </div>

          {analyses.length > 0 && (
            <div className="mt-8 max-w-[680px]">
              <p className={`${labelClass} mb-3`}>ატვირთული ანალიზები</p>
              <div className="flex flex-col gap-2">
                {analyses.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between bg-paper border border-gold/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-body text-[14px] text-ink">{a.file_name}</p>
                      <p className="font-body text-[12px] text-muted">
                        {a.file_type} · {fmt(a.uploaded_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteAnalysis(a)}
                      aria-label="წაშლა"
                      className="text-muted hover:text-red-600 transition-colors ml-4 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
