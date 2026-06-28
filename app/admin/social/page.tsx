"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Settings {
  facebook_enabled: boolean;
  youtube_enabled: boolean;
  auto_post_contests: boolean;
  auto_post_prayers: boolean;
  auto_post_testimonies: boolean;
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="font-semibold text-sm text-[#0f2044]">{label}</p>
        <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${checked ? "bg-[#1d4ed8]" : "bg-stone-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function SocialAdminPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [manualMessage, setManualMessage] = useState("");
  const [manualLink, setManualLink] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) { router.replace("/admin"); return; }
      fetch("/api/social/settings").then(r => r.json()).then(d => setSettings(d.settings));
    });
  }, [router]);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/social/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function postManual() {
    if (!manualMessage || !selectedPlatforms.length) return;
    setPosting(true);
    setPostResult(null);
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: manualMessage, link: manualLink || undefined, platforms: selectedPlatforms }),
    });
    const data = await res.json();
    const msgs = Object.entries(data.results || {}).map(([p, r]: [string, unknown]) => {
      const result = r as { success: boolean; error?: string; post_id?: string };
      return `${p}: ${result.success ? `✅ OK (${result.post_id})` : `❌ ${result.error}`}`;
    });
    setPostResult(msgs.join("\n") || "Envoyé");
    setPosting(false);
  }

  if (!settings) return <div className="p-10 text-stone-400">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#0f2044] px-5 py-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-white font-black text-xl">Réseaux sociaux</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6">

        {/* Setup instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="font-black text-amber-800 text-sm mb-2">⚙️ Configuration requise</h2>
          <div className="text-xs text-amber-700 space-y-1">
            <p><strong>Facebook :</strong> Ajoute <code className="bg-amber-100 px-1 rounded">FACEBOOK_PAGE_ID</code> et <code className="bg-amber-100 px-1 rounded">FACEBOOK_PAGE_ACCESS_TOKEN</code> dans Vercel → Environment Variables</p>
            <p><strong>YouTube :</strong> Ajoute <code className="bg-amber-100 px-1 rounded">YOUTUBE_CLIENT_ID</code>, <code className="bg-amber-100 px-1 rounded">YOUTUBE_CLIENT_SECRET</code>, <code className="bg-amber-100 px-1 rounded">YOUTUBE_REFRESH_TOKEN</code>, <code className="bg-amber-100 px-1 rounded">YOUTUBE_CHANNEL_ID</code></p>
            <p className="text-amber-600 mt-2">YouTube Community Posts nécessitent 500+ abonnés et l'onglet Community activé.</p>
          </div>
        </div>

        {/* Platform toggles */}
        <div className="bg-white rounded-2xl border border-stone-100 px-5 divide-y divide-stone-50">
          <h2 className="font-black text-[#0f2044] text-sm pt-4 pb-2">Plateformes</h2>
          <Toggle label="Facebook Page" desc="Publie sur ta page Facebook" checked={settings.facebook_enabled} onChange={v => setSettings(s => s ? { ...s, facebook_enabled: v } : s)} />
          <Toggle label="YouTube Community" desc="Publie dans l'onglet Community" checked={settings.youtube_enabled} onChange={v => setSettings(s => s ? { ...s, youtube_enabled: v } : s)} />
        </div>

        {/* Auto-post toggles */}
        <div className="bg-white rounded-2xl border border-stone-100 px-5 divide-y divide-stone-50">
          <h2 className="font-black text-[#0f2044] text-sm pt-4 pb-2">Publication automatique</h2>
          <Toggle label="Nouveau concours" desc="Publier automatiquement lors de l'activation d'un concours" checked={settings.auto_post_contests} onChange={v => setSettings(s => s ? { ...s, auto_post_contests: v } : s)} />
          <Toggle label="Nouvelle prière" desc="Publier automatiquement les nouvelles demandes de prière" checked={settings.auto_post_prayers} onChange={v => setSettings(s => s ? { ...s, auto_post_prayers: v } : s)} />
          <Toggle label="Nouveau témoignage" desc="Publier automatiquement les témoignages approuvés" checked={settings.auto_post_testimonies} onChange={v => setSettings(s => s ? { ...s, auto_post_testimonies: v } : s)} />
        </div>

        <button onClick={saveSettings} disabled={saving}
          className="bg-[#0f2044] hover:bg-[#1d4ed8] text-white font-black text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-50 self-start">
          {saved ? "✅ Sauvegardé" : saving ? "..." : "Sauvegarder les paramètres"}
        </button>

        {/* Manual post */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h2 className="font-black text-[#0f2044] text-sm mb-4">📤 Publication manuelle</h2>
          <textarea
            value={manualMessage}
            onChange={e => setManualMessage(e.target.value)}
            placeholder="Message à publier..."
            rows={4}
            className="w-full border border-stone-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#1d4ed8]"
          />
          <input
            value={manualLink}
            onChange={e => setManualLink(e.target.value)}
            placeholder="Lien (optionnel) — ex: https://koneksyonpam.com/concours/..."
            className="w-full border border-stone-200 rounded-xl p-3 text-sm mt-3 focus:outline-none focus:border-[#1d4ed8]"
          />
          <div className="flex gap-3 mt-4">
            {["facebook","youtube"].map(p => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selectedPlatforms.includes(p)}
                  onChange={e => setSelectedPlatforms(ps => e.target.checked ? [...ps, p] : ps.filter(x => x !== p))}
                  className="rounded" />
                <span className="text-sm font-medium capitalize">{p}</span>
              </label>
            ))}
          </div>
          <button onClick={postManual} disabled={posting || !manualMessage || !selectedPlatforms.length}
            className="mt-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-sm px-6 py-2.5 rounded-full transition-colors disabled:opacity-50">
            {posting ? "Envoi..." : "Publier"}
          </button>
          {postResult && (
            <pre className="mt-3 text-xs bg-stone-50 rounded-xl p-3 whitespace-pre-wrap text-stone-700">{postResult}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
