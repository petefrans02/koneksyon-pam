"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import RequireAuth from "@/app/components/RequireAuth";
import Icon from "@/app/components/Icon";

interface Team { id: string; name: string; total_score: number; member_count: number; captain_name: string | null; }

export default function TeamSelectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as "fr" | "ht" | "en" | "es";

  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(() => {
    fetch(`/api/contests/${id}/teams`).then(r => r.json()).then(d => setTeams(d.teams ?? [])).catch(() => {});
  }, [id]);

  useEffect(() => {
    loadTeams();
    const iv = setInterval(loadTeams, 5000);
    return () => clearInterval(iv);
  }, [loadTeams]);

  const tr = (fr: string, ht: string, en: string, es: string) => l === "fr" ? fr : l === "ht" ? ht : l === "es" ? es : en;

  const post = useCallback(async (teamName: string, mode: "create" | "join") => {
    const n = teamName.trim();
    if (n.length < 2) { setError(tr("Nom trop court", "Non twò kout", "Name too short", "Nombre muy corto")); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/contests/${id}/teams`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, mode }),
      });
      const d = await res.json();
      if (d.ok) { router.push(`/championnats/${id}/lobby`); return; }
      if (d.error === "team_exists") setError(tr("Cette équipe existe déjà — rejoignez-la ci-dessous.", "Ekip sa a egziste deja — rantre ladan anba a.", "This team already exists — join it below.", "Este equipo ya existe — únete abajo."));
      else if (d.error === "team_not_found") setError(tr("Équipe introuvable.", "Ekip la pa jwenn.", "Team not found.", "Equipo no encontrado."));
      else setError(d.error || "Erreur");
    } catch { setError("network"); }
    setBusy(false);
  }, [id, router, l]);

  const medal = ["#f59e0b", "#cbd5e1", "#d97706"];

  return (
    <RequireAuth>
      <div className="min-h-screen" style={{ background: "#060d1a" }}>
        <div className="max-w-lg mx-auto px-5 py-10">
          <button onClick={() => router.push(`/championnats/${id}`)} className="text-white/40 text-sm font-bold mb-6">← {tr("Retour", "Tounen", "Back", "Volver")}</button>

          <div className="text-center mb-8">
            <div className="inline-flex mb-3 text-indigo-300"><Icon name="groupe" size={40} /></div>
            <h1 className="text-white font-black text-2xl mb-2">{tr("Concours par équipes", "Konkou pa ekip", "Team contest", "Concurso por equipos")}</h1>
            <p className="text-white/45 text-sm">{tr("Église, association ou cellule — vos points comptent pour votre équipe.", "Legliz, asosyasyon oswa selil — pwen ou konte pou ekip ou.", "Church, association or cell — your points count for your team.", "Iglesia, asociación o célula — tus puntos cuentan para tu equipo.")}</p>
          </div>

          {error && <p className="text-red-400 text-sm text-center mb-4 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2.5">{error}</p>}

          {/* 1) RESPONSABLE — créer l'équipe */}
          <div className="rounded-2xl border p-4 mb-5" style={{ background: "rgba(99,102,241,0.06)", borderColor: "rgba(99,102,241,0.30)" }}>
            <p className="text-indigo-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Icon name="couronne" size={13} /> {tr("Responsable d'équipe", "Responsab ekip", "Team leader", "Responsable del equipo")}
            </p>
            <p className="text-white/40 text-xs mb-3">{tr("Vous représentez une église/association ? Créez l'équipe — vous en devenez le responsable.", "Ou reprezante yon legliz/asosyasyon ? Kreye ekip la — ou vin responsab li.", "Represent a church/association? Create the team — you become its leader.", "¿Representas una iglesia/asociación? Crea el equipo — te conviertes en su responsable.")}</p>
            <div className="flex gap-2">
              <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
                placeholder={tr("Ex : Église Bethel", "Ex : Legliz Betèl", "e.g. Bethel Church", "Ej : Iglesia Betel")}
                className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} />
              <button onClick={() => post(name, "create")} disabled={busy || name.trim().length < 2}
                className="px-5 py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-40 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff" }}>
                {busy ? "…" : tr("Créer", "Kreye", "Create", "Crear")}
              </button>
            </div>
          </div>

          {/* 2) MEMBRE — rejoindre une équipe existante */}
          <div>
            <p className="text-white/40 text-[11px] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Icon name="groupe" size={13} /> {tr("Rejoindre une équipe", "Rantre nan yon ekip", "Join a team", "Unirse a un equipo")}
              {teams.length > 0 && <span className="text-white/25">· {teams.length}</span>}
            </p>
            {teams.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-6 rounded-2xl border border-white/6" style={{ background: "rgba(255,255,255,0.02)" }}>
                {tr("Aucune équipe encore. Soyez le premier responsable à en créer une !", "Poko gen ekip. Se ou ki premye responsab pou kreye youn !", "No teams yet. Be the first leader to create one!", "Aún no hay equipos. ¡Sé el primer responsable en crear uno!")}
              </p>
            ) : (
              <div className="space-y-2">
                {teams.map((t, i) => (
                  <button key={t.id} onClick={() => post(t.name, "join")} disabled={busy}
                    className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all active:scale-[0.99] text-left hover:border-indigo-400/40"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: i < 3 ? `${medal[i]}40` : "rgba(255,255,255,0.06)" }}>
                    <span className="w-6 text-center shrink-0" style={{ color: i < 3 ? medal[i] : "rgba(255,255,255,0.3)" }}>
                      {i < 3 ? <Icon name="medaille" size={16} color={medal[i]} /> : <span className="font-black text-sm">#{i + 1}</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{t.name}</p>
                      <p className="text-white/35 text-[11px]">
                        {t.member_count} {tr("joueur(s)", "jwè", "player(s)", "jugador(es)")}
                        {t.captain_name ? ` · ${tr("Resp.", "Resp.", "Lead", "Resp.")}: ${t.captain_name}` : ""}
                      </p>
                    </div>
                    <span className="font-black text-sm text-amber-400 tabular-nums shrink-0">{t.total_score.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
