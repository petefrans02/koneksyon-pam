"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";

function FbTokenRefresh() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleRefresh() {
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res  = await fetch(`/api/admin/fb-exchange?token=${encodeURIComponent(token.trim())}`);
      const data = await res.json();
      if (!data.ok) {
        setResult(`❌ Erreur : ${data.error ?? "inconnue"}`);
      } else {
        const ok    = data.page_tokens.filter((p: {success: boolean}) => p.success).length;
        const total = data.page_tokens.length;
        setResult(`✅ ${ok}/${total} pages connectées pour 60 jours ! Publication automatique activée.`);
        setToken("");
      }
    } catch {
      setResult("❌ Erreur réseau");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-5">
      <h2 className="font-black text-[#0f2044] text-sm mb-1"><span className="inline-flex items-center gap-1.5"><Icon name="lien" size={16} /> Token Facebook (60 jours)</span></h2>
      <p className="text-xs text-stone-400 mb-1">Va sur <strong>developers.facebook.com/tools/explorer</strong> → sélectionne <strong>Koneksyon Pam</strong> → ajoute <code className="bg-stone-100 px-1 rounded">pages_manage_posts</code> → clique <strong>Generate Access Token</strong> → colle ici.</p>
      <p className="text-xs text-stone-400 mb-4">À renouveler tous les 55 jours. Le token est échangé en version longue durée automatiquement.</p>
      <div className="flex gap-2">
        <input
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="EAAOxn..."
          className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#1877F2]"
        />
        <button onClick={handleRefresh} disabled={loading || !token.trim()}
          className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
          {loading ? "..." : "Connecter"}
        </button>
      </div>
      {result && <p className="text-xs mt-3 font-medium" style={{ color: result.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{result}</p>}
    </div>
  );
}

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
      const platform = r as { results?: Array<{page_name: string; success: boolean; error?: string; post_id?: string}>; any_success?: boolean; success?: boolean; error?: string };
      if (platform.results) {
        const ok  = platform.results.filter(x => x.success).length;
        const err = platform.results.find(x => !x.success)?.error;
        return `${p}: ${platform.any_success ? `✅ ${ok}/${platform.results.length} pages publiées` : `❌ ${err ?? "erreur"}`}`;
      }
      return `${p}: ${platform.success ? `✅ OK` : `❌ ${platform.error ?? "erreur"}`}`;
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

        {/* Facebook Token Refresh */}
        <FbTokenRefresh />

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
          {saved ? <span className="inline-flex items-center gap-1.5"><Icon name="succes" size={16} /> Sauvegardé</span> : saving ? "..." : "Sauvegarder les paramètres"}
        </button>

        {/* Manual post */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h2 className="font-black text-[#0f2044] text-sm mb-4"><span className="inline-flex items-center gap-1.5"><Icon name="envoyer" size={16} /> Publication manuelle</span></h2>
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
