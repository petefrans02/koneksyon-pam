"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import Icon from "@/app/components/Icon";

interface ErrorLog {
  id: string;
  created_at: string;
  message: string;
  digest: string | null;
  stack: string | null;
  page: string | null;
  ua: string | null;
  severity: string;
}

export default function AdminErrorLogsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) { router.replace("/admin"); return; }
      setAuthed(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/error-logs")
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setLoading(false); });
  }, [authed]);

  async function clearOld() {
    setClearing(true);
    await fetch("/api/admin/error-logs", { method: "DELETE" });
    setLogs(prev => prev.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)));
    setClearing(false);
  }

  const fmt = (d: string) => new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" });
  const parseUA = (ua: string | null) => {
    if (!ua) return "—";
    if (/iPhone|iPad/.test(ua)) return "📱 iOS";
    if (/Android/.test(ua)) return "📱 Android";
    if (/Mac/.test(ua)) return "💻 Mac";
    if (/Windows/.test(ua)) return "💻 Windows";
    return "🖥️ Desktop";
  };

  if (!authed || loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-red-950 text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-white/50 hover:text-white text-sm">← Admin</Link>
            <h1 className="text-xl font-black mt-2"><span className="inline-flex items-center gap-1.5"><Icon name="bouclier" size={20} /> Journal des erreurs</span></h1>
            <p className="text-white/40 text-sm">{logs.length} entrée{logs.length !== 1 ? "s" : ""} — 100 dernières</p>
          </div>
          <button onClick={clearOld} disabled={clearing}
            className="bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-colors">
            {clearing ? "Nettoyage..." : "Supprimer > 7 jours"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <p className="text-4xl mb-4"><Icon name="succes" size={40} /></p>
            <p className="font-bold text-stone-700">Aucune erreur enregistrée</p>
            <p className="text-stone-400 text-sm mt-1">La plateforme fonctionne normalement.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <button className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">{fmt(log.created_at)}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{parseUA(log.ua)}</span>
                      {log.page && <span className="text-[10px] text-blue-500 font-mono">{log.page}</span>}
                    </div>
                    <p className="font-semibold text-stone-800 text-sm truncate">{log.message || "Erreur inconnue"}</p>
                    {log.digest && <p className="text-[10px] text-stone-300 font-mono mt-0.5">ref: {log.digest}</p>}
                  </div>
                  <span className="text-stone-300 text-xs mt-1">{expanded === log.id ? "▲" : "▼"}</span>
                </button>

                {expanded === log.id && (
                  <div className="border-t border-stone-100 bg-slate-50 px-6 py-4">
                    {log.stack && (
                      <div className="mb-3">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">Stack trace</p>
                        <pre className="text-xs text-red-800 bg-red-50 border border-red-100 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                    {log.ua && (
                      <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">User Agent</p>
                        <p className="text-xs text-stone-500 font-mono break-all">{log.ua}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
