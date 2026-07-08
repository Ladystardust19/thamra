"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

const ADMIN_EMAIL = "mindori.world@gmail.com";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  age: number | null;
}

interface Receipt {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  status: string;
  uploaded_at: string;
}

interface Analysis {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

interface Photo {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const labelClass = "font-body text-[12px] uppercase tracking-[0.12em] text-muted";
const headingClass = "font-display text-[28px] italic text-oxblood mb-6 pb-3 border-b border-gold/30";
const thClass = "font-body text-[11px] uppercase tracking-[0.12em] text-muted text-left py-2 pr-6";
const tdClass = "font-body text-[14px] text-ink py-3 pr-6 border-t border-gold/10 align-top";

export default function AdminPage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [denied, setDenied] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/cabinet/login");
        return;
      }
      if (data.user.email !== ADMIN_EMAIL) {
        setDenied(true);
        setBooting(false);
        return;
      }
      const [pRes, rRes, aRes, phRes] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("receipts").select("*").order("uploaded_at", { ascending: false }),
        supabase.from("analyses").select("*").order("uploaded_at", { ascending: false }),
        supabase.from("photos").select("*").order("uploaded_at", { ascending: false }),
      ]);
      if (pRes.data) setProfiles(pRes.data);
      if (rRes.data) setReceipts(rRes.data);
      if (aRes.data) setAnalyses(aRes.data);
      if (phRes.data) setPhotos(phRes.data);
      setBooting(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function profileName(userId: string) {
    const p = profiles.find((x) => x.id === userId);
    return p?.full_name || "—";
  }

  async function openFile(bucket: string, path: string) {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function setReceiptStatus(id: string, status: string) {
    await supabase.from("receipts").update({ status }).eq("id", id);
    setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function deleteReceipt(r: Receipt) {
    await supabase.storage.from("receipts").remove([r.file_url]);
    await supabase.from("receipts").delete().eq("id", r.id);
    setReceipts((prev) => prev.filter((x) => x.id !== r.id));
  }

  async function deleteAnalysis(a: Analysis) {
    await supabase.storage.from("analyses").remove([a.file_url]);
    await supabase.from("analyses").delete().eq("id", a.id);
    setAnalyses((prev) => prev.filter((x) => x.id !== a.id));
  }

  async function deletePhoto(p: Photo) {
    await supabase.storage.from("photos").remove([p.file_url]);
    await supabase.from("photos").delete().eq("id", p.id);
    setPhotos((prev) => prev.filter((x) => x.id !== p.id));
  }

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

        <div className="flex items-center justify-between mb-14">
          <h1 className="font-display text-[36px] italic text-oxblood">Admin</h1>
          <div className="flex gap-8">
            <span className={labelClass}>ქვითრები — {receipts.length}</span>
            <span className={labelClass}>ანალიზები — {analyses.length}</span>
            <span className={labelClass}>სურათები — {photos.length}</span>
          </div>
        </div>

        {/* ── Receipts ── */}
        <section className="mb-16">
          <h2 className={headingClass}>ქვითრები</h2>
          {receipts.length === 0 ? (
            <p className="font-body text-[14px] text-muted">არაფერი ატვირთული.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>მომხმარებელი</th>
                  <th className={thClass}>ფაილი</th>
                  <th className={thClass}>თარიღი</th>
                  <th className={thClass}>სტატუსი</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id}>
                    <td className={tdClass}>{profileName(r.user_id)}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => openFile("receipts", r.file_url)}
                        className="text-oxblood hover:underline text-left"
                      >
                        {r.file_name}
                      </button>
                    </td>
                    <td className={`${tdClass} text-muted`}>{fmt(r.uploaded_at)}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() =>
                          setReceiptStatus(r.id, r.status === "verified" ? "pending" : "verified")
                        }
                        className={`font-body text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 border transition-colors ${
                          r.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {r.status === "verified" ? "დადასტურებული" : "მოლოდინში"}
                      </button>
                    </td>
                    <td className={tdClass}>
                      <button
                        onClick={() => deleteReceipt(r)}
                        className="text-muted hover:text-red-600 transition-colors"
                        aria-label="წაშლა"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Analyses ── */}
        <section className="mb-16">
          <h2 className={headingClass}>ანალიზები</h2>
          {analyses.length === 0 ? (
            <p className="font-body text-[14px] text-muted">არაფერი ატვირთული.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>მომხმარებელი</th>
                  <th className={thClass}>ფაილი</th>
                  <th className={thClass}>სახეობა</th>
                  <th className={thClass}>თარიღი</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => (
                  <tr key={a.id}>
                    <td className={tdClass}>{profileName(a.user_id)}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => openFile("analyses", a.file_url)}
                        className="text-oxblood hover:underline text-left"
                      >
                        {a.file_name}
                      </button>
                    </td>
                    <td className={`${tdClass} text-muted`}>{a.file_type}</td>
                    <td className={`${tdClass} text-muted`}>{fmt(a.uploaded_at)}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => deleteAnalysis(a)}
                        className="text-muted hover:text-red-600 transition-colors"
                        aria-label="წაშლა"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Photos ── */}
        <section className="mb-16">
          <h2 className={headingClass}>სურათები</h2>
          {photos.length === 0 ? (
            <p className="font-body text-[14px] text-muted">არაფერი ატვირთული.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>მომხმარებელი</th>
                  <th className={thClass}>ფაილი</th>
                  <th className={thClass}>თარიღი</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {photos.map((p) => (
                  <tr key={p.id}>
                    <td className={tdClass}>{profileName(p.user_id)}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => openFile("photos", p.file_url)}
                        className="text-oxblood hover:underline text-left"
                      >
                        {p.file_name}
                      </button>
                    </td>
                    <td className={`${tdClass} text-muted`}>{fmt(p.uploaded_at)}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => deletePhoto(p)}
                        className="text-muted hover:text-red-600 transition-colors"
                        aria-label="წაშლა"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

      </div>
    </main>
  );
}
