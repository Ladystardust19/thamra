"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Tab = "login" | "register";

export default function CabinetLoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/cabinet";
  const [tab, setTab] = useState<Tab>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setMessage("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "შეცდომა. სცადეთ თავიდან.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { full_name: regName, phone: regPhone },
        },
      });
      if (error) throw error;

      if (data.session) {
        await supabase.from("profiles").upsert({
          id: data.user!.id,
          full_name: regName,
          phone: regPhone,
        });
        router.push(next);
      } else {
        setMessage("შეამოწმეთ ელფოსტა — გამოგზავნილია დადასტურების ბმული.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "შეცდომა. სცადეთ თავიდან.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "bg-paper border border-gold/30 px-4 py-3 font-body text-[15px] text-ink outline-none focus:border-oxblood/50 transition-colors w-full";
  const labelClass =
    "font-body text-[12px] uppercase tracking-[0.12em] text-muted";

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4 pt-20 pb-12">
      <div className="w-full max-w-[450px]">
        <a href="/" className="block text-center font-display text-[42px] italic text-oxblood mb-3 tracking-wider hover:opacity-80 transition-opacity">
          THAMRA
        </a>
        <a href="/" className="block text-center font-body text-[12px] uppercase tracking-[0.12em] text-muted hover:text-oxblood transition-colors mb-8">
          &larr; მთავარზე გადასვლა
        </a>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-gold/30">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 pb-3 font-body text-[12px] uppercase tracking-[0.15em] transition-colors ${
                tab === t
                  ? "text-oxblood border-b-2 border-oxblood -mb-px"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t === "login" ? "შესვლა" : "რეგისტრაცია"}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-5 font-body text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-2.5">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-5 font-body text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5">
            {message}
          </p>
        )}

        {tab === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ელფოსტა</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>პაროლი</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-oxblood text-cream-soft font-body text-[13px] uppercase tracking-[0.15em] py-3.5 transition-colors hover:bg-oxblood-dark disabled:opacity-50"
            >
              {loading ? "..." : "შესვლა →"}
            </button>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>სახელი და გვარი</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ელფოსტა</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>ტელეფონი</label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                autoComplete="tel"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>პაროლი (მინ. 6 სიმბოლო)</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-oxblood text-cream-soft font-body text-[13px] uppercase tracking-[0.15em] py-3.5 transition-colors hover:bg-oxblood-dark disabled:opacity-50"
            >
              {loading ? "..." : "რეგისტრაცია →"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
