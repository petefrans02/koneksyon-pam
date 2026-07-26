"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";

interface PageStatus { id: string; name: string; connected: boolean }
interface Settings {
  facebook_enabled: boolean;
  youtube_enabled: boolean;
  auto_post_contests: boolean;
  auto_post_testimonies: boolean;
  auto_post_studies: boolean;
  auto_post_announcements: boolean;
}
interface Log { created_at: string; platform: string; page_name: string; status: string }
interface IntegrationData {
  facebook: { pages: PageStatus[]; connected: boolean };
  youtube: { connected: boolean; live: boolean; live_title: string };
  settings: Settings;
  recent_logs: Log[];
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-stone-100 last:border-0">
      <div>
        <p className="font-semibold text-sm text-[#0f2044]">{label}</p>
        {desc && <p className="text-xs text-stone-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${checked ? "bg-blue-600" : "bg-stone-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [data, setData] = useState<IntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState<"facebook" | "youtube" | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: d }) => {
      if (!isAdmin(d.user)) { router.replace("/admin"); return; }
      fetch("/api/admin/integrations").then(r => r.json()).then(d => {
        setData(d);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, [router]);

  async function saveSettings() {
    if (!data) return;
    setSaving(true);
    await fetch("/api/admin/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_settings", settings: data.settings }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function testConnection(platform: "facebook" | "youtube") {
    setTesting(platform);
    setTestResult(null);
    const res = await fetch("/api/admin/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: `test_${platform}` }),
    });
    const d = await res.json();
    if (platform === "facebook" && d.results) {
      const lines = d.results.map((r: { name?: string; fan_count?: number; ok: boolean; error?: string }) =>
        r.ok ? `✅ ${r.name} (${r.fan_count ?? 0} abonnés)` : `❌ ${r.error}`
      );
      setTestResult(lines.join("\n"));
    } else if (platform === "youtube") {
      setTestResult(d.ok
        ? `✅ ${d.videos?.length ?? 0} vidéo(s) trouvée(s)`
        : `❌ ${d.error}`);
    } else {
      setTestResult(`❌ ${d.error}`);
    }
    setTesting(null);
  }

  function updateSetting(key: keyof Settings, val: boolean) {
    setData(prev => prev ? { ...prev, settings: { ...prev.settings, [key]: val } } : prev);
  }

  if (loading) return <div className="p-10 text-stone-400 text-sm">Chargement...</div>;
  if (!data)   return <div className="p-10 text-red-500 text-sm">Erreur de chargement.</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[#0f2044] px-5 py-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/admin?tab=overview" className="text-white/50 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-white font-black text-xl">Intégrations</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6">

        {/* ── FACEBOOK STATUS ── */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">f</div>
              <div>
                <p className="font-black text-[#0f2044] text-sm">Facebook</p>
                <p className={`text-xs font-medium ${data.facebook.connected ? "text-green-600" : "text-red-500"}`}>
                  {data.facebook.connected ? "● Connecté" : "● Non connecté"}
                </p>
              </div>
            </div>
            <button onClick={() => testConnection("facebook")} disabled={testing === "facebook"}
              className="text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-50 disabled:opacity-50 transition-colors">
              {testing === "facebook" ? "Test..." : "Tester"}
            </button>
          </div>

          <div className="divide-y divide-stone-50">
            {data.facebook.pages.map(p => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.connected ? "bg-green-400" : "bg-red-400"}`} />
                <p className="text-sm font-medium text-stone-800">{p.name}</p>
                <span className="text-xs text-stone-400 ml-auto">{p.id}</span>
              </div>
            ))}
          </div>

          {testResult && testing === null && (
            <pre className="px-5 py-3 text-xs bg-stone-50 border-t border-stone-100 whitespace-pre-wrap text-stone-600">{testResult}</pre>
          )}
        </div>

        {/* ── YOUTUBE STATUS ── */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm">▶</div>
              <div>
                <p className="font-black text-[#0f2044] text-sm">YouTube</p>
                <p className={`text-xs font-medium ${data.youtube.connected ? "text-green-600" : "text-amber-500"}`}>
                  {data.youtube.connected ? "● Connecté" : "● Clé API non configurée"}
                </p>
              </div>
            </div>
            <button onClick={() => testConnection("youtube")} disabled={testing === "youtube" || !data.youtube.connected}
              className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 disabled:opacity-50 transition-colors">
              {testing === "youtube" ? "Test..." : "Tester"}
            </button>
          </div>

          <div className="px-5 py-3 flex items-center gap-3">
            {data.youtube.live ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <p className="text-sm font-bold text-red-600">EN DIRECT — {data.youtube.live_title}</p>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0" />
                <p className="text-sm text-stone-500">Aucun direct en cours</p>
              </>
            )}
          </div>

          {testResult && testing === null && data.youtube.connected && (
            <pre className="px-5 py-3 text-xs bg-stone-50 border-t border-stone-100 whitespace-pre-wrap text-stone-600">{testResult}</pre>
          )}

          {!data.youtube.connected && (
            <div className="px-5 py-3 border-t border-stone-100 bg-amber-50">
              <p className="text-xs text-amber-700 font-medium">
                Pour activer YouTube : ajoute <code className="bg-amber-100 px-1 rounded">YOUTUBE_API_KEY</code> et <code className="bg-amber-100 px-1 rounded">YOUTUBE_CHANNEL_ID</code> dans les variables d&apos;environnement Vercel.
              </p>
            </div>
          )}
        </div>

        {/* ── AUTO-POST SETTINGS ── */}
        <div className="bg-white rounded-2xl border border-stone-100 px-5">
          <h2 className="font-black text-[#0f2044] text-sm pt-4 pb-2">Publication automatique sur Facebook</h2>
          <Toggle label="Activer Facebook" desc="Publier automatiquement sur les 3 pages"
            checked={data.settings.facebook_enabled} onChange={v => updateSetting("facebook_enabled", v)} />
          <Toggle label="Nouveaux concours" desc="Publier quand un concours est activé"
            checked={data.settings.auto_post_contests} onChange={v => updateSetting("auto_post_contests", v)} />
          <Toggle label="Nouveaux témoignages" desc="Publier les témoignages approuvés"
            checked={data.settings.auto_post_testimonies} onChange={v => updateSetting("auto_post_testimonies", v)} />
          <Toggle label="Nouvelles études bibliques" desc="Publier les nouvelles études"
            checked={data.settings.auto_post_studies} onChange={v => updateSetting("auto_post_studies", v)} />
          <Toggle label="Annonces importantes" desc="Publier les annonces"
            checked={data.settings.auto_post_announcements} onChange={v => updateSetting("auto_post_announcements", v)} />
        </div>

        <button onClick={saveSettings} disabled={saving}
          className="bg-[#0f2044] hover:bg-[#1d4ed8] text-white font-black text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-50 self-start">
          {saved ? <span className="inline-flex items-center gap-1.5"><Icon name="succes" size={16} /> Sauvegardé</span> : saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
        </button>

        {/* ── RECENT LOGS ── */}
        {data.recent_logs.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <p className="font-black text-[#0f2044] text-sm px-5 pt-4 pb-2">Dernières publications</p>
            <div className="divide-y divide-stone-50">
              {data.recent_logs.map((log, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <span className={log.status === "sent" ? "text-green-500" : "text-red-400"}>
                    <Icon name={log.status === "sent" ? "succes" : "fermer"} size={16} />
                  </span>
                  <span className="font-medium text-stone-700">{log.page_name}</span>
                  <span className="text-stone-400 text-xs ml-auto">
                    {new Date(log.created_at).toLocaleDateString("fr")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LINK TO CAMPAIGNS ── */}
        <Link href="/admin/campaigns"
          className="flex items-center justify-between bg-white rounded-2xl border border-stone-100 px-5 py-4 hover:border-blue-200 transition-colors">
          <div>
            <p className="font-black text-[#0f2044] text-sm"><span className="inline-flex items-center gap-1.5"><Icon name="notifications" size={16} /> Campagnes email</span></p>
            <p className="text-xs text-stone-400 mt-0.5">Voir les statistiques d&apos;envoi de notifications</p>
          </div>
          <span className="text-stone-300">→</span>
        </Link>
      </div>
    </div>
  );
}
