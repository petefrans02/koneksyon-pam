"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import Icon from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const L = {
  fr: {
    back: "← Retour",
    loading: "Chargement…",
    title: "Jouer avec mes amis",
    subtitle: (name: string) => `Créez une session privée du championnat "${name}"`,
    howMany: "Combien de joueurs attendez-vous ?",
    hint: "Le match démarre automatiquement quand ce nombre est atteint.",
    including: "Vous compris",
    create: "Créer ma session →",
    creating: "Création…",
    notFound: "Championnat introuvable",
    loginRequired: "Connexion requise pour créer une session.",
    noRounds: "Ce championnat n'a pas encore de manches disponibles.",
    error: "Erreur",
  },
  ht: {
    back: "← Retounen",
    loading: "Ap chaje…",
    title: "Jwe ak zanmi mwen yo",
    subtitle: (name: string) => `Kreye yon sesyon prive pou chanpyona "${name}"`,
    howMany: "Konbyen jwè w ap tann ?",
    hint: "Match lan kòmanse otomatikman lè nomb sa a atenn.",
    including: "Ou enkli",
    create: "Kreye sesyon mwen →",
    creating: "Kreyasyon…",
    notFound: "Chanpyona pa jwenn",
    loginRequired: "Koneksyon obligatwa pou kreye yon sesyon.",
    noRounds: "Chanpyona sa a pa gen epwèv disponib.",
    error: "Erè",
  },
  en: {
    back: "← Back",
    loading: "Loading…",
    title: "Play with my friends",
    subtitle: (name: string) => `Create a private session of "${name}"`,
    howMany: "How many players are you expecting?",
    hint: "The match starts automatically when this number is reached.",
    including: "Including you",
    create: "Create my session →",
    creating: "Creating…",
    notFound: "Championship not found",
    loginRequired: "Login required to create a session.",
    noRounds: "This championship has no rounds available yet.",
    error: "Error",
  },
  es: {
    back: "← Volver",
    loading: "Cargando…",
    title: "Jugar con mis amigos",
    subtitle: (name: string) => `Crea una sesión privada de "${name}"`,
    howMany: "¿Cuántos jugadores esperas?",
    hint: "El partido comienza automáticamente cuando se alcanza este número.",
    including: "Incluido tú",
    create: "Crear mi sesión →",
    creating: "Creando…",
    notFound: "Campeonato no encontrado",
    loginRequired: "Se requiere inicio de sesión para crear una sesión.",
    noRounds: "Este campeonato aún no tiene rondas disponibles.",
    error: "Error",
  },
};

const PLAYER_PRESETS = [2, 3, 4, 5, 8, 10, 15, 20];

export default function CreateSessionPage() {
  const params = useParams<{ contest_id: string }>();
  const contest_id = params.contest_id;
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const lb = L[l];

  const [contestName, setContestName] = useState("");
  const [loadingContest, setLoadingContest] = useState(true);
  const [contestError, setContestError] = useState<string | null>(null);
  const [targetCount, setTargetCount] = useState(4);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/contests/${contest_id}`)
      .then(r => r.json())
      .then(d => {
        if (d.contest?.title) {
          setContestName(d.contest.title);
        } else {
          setContestError(lb.notFound);
        }
      })
      .catch(() => setContestError(lb.notFound))
      .finally(() => setLoadingContest(false));
  }, [contest_id, lb.notFound]);

  async function handleCreate() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch(`/api/private/session/${contest_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_count: targetCount }),
      });
      const text = await res.text();
      let d: Record<string, unknown>;
      try { d = JSON.parse(text); }
      catch { setError(`Erreur serveur (${res.status})`); return; }

      if (d.ok) {
        router.push(`/private/${d.id}`);
      } else {
        setError((d.error as string) || "Erreur inconnue");
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setCreating(false);
    }
  }

  if (loadingContest) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030918" }}>
      <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  if (contestError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: "#030918" }}>
      <p className="text-white/40 text-sm">{contestError}</p>
      <Link href="/championnats" className="text-amber-400 text-xs font-bold hover:text-amber-300">{lb.back}</Link>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(197,168,79,0.12) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-sm mx-auto px-5 py-12">
        <Link href={`/championnats/${contest_id}`} className="inline-flex items-center gap-1 text-white/30 text-xs font-bold hover:text-white transition-colors mb-8">
          {lb.back}
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-4 flex justify-center"><Icon name="groupe" size={40} color="#c5a84f" /></div>
          <h1 className="text-white font-black text-2xl mb-2">{lb.title}</h1>
          <p className="text-white/40 text-sm">{lb.subtitle(contestName)}</p>
        </div>

        {/* Player count */}
        <div className="mb-8">
          <label className="block text-white/50 text-xs font-black uppercase tracking-wider mb-3">
            {lb.howMany}
          </label>

          {/* Preset buttons */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PLAYER_PRESETS.map(n => (
              <button key={n} type="button"
                onClick={() => setTargetCount(n)}
                className="py-3 rounded-xl font-black text-base transition-all"
                style={{
                  background: targetCount === n ? "rgba(197,168,79,0.15)" : "rgba(255,255,255,0.04)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: targetCount === n ? "rgba(197,168,79,0.5)" : "rgba(255,255,255,0.08)",
                  color: targetCount === n ? "#c5a84f" : "rgba(255,255,255,0.40)",
                }}>
                {n}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-3">
            <button onClick={() => setTargetCount(Math.max(2, targetCount - 1))}
              className="w-10 h-10 rounded-xl border border-white/10 text-white/40 hover:text-white font-black text-lg transition-colors">
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-amber-400 font-black text-4xl">{targetCount}</span>
              <p className="text-white/20 text-[10px] mt-0.5">{lb.including}</p>
            </div>
            <button onClick={() => setTargetCount(Math.min(100, targetCount + 1))}
              className="w-10 h-10 rounded-xl border border-white/10 text-white/40 hover:text-white font-black text-lg transition-colors">
              +
            </button>
          </div>

          <p className="text-white/25 text-xs text-center mt-3">{lb.hint}</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{lb.error} : {error}</p>
          </div>
        )}

        <button onClick={handleCreate} disabled={creating}
          className="w-full py-4 rounded-2xl font-black text-base transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #c5a84f, #d4b85c)", color: "#030918", boxShadow: "0 4px 24px rgba(197,168,79,0.30)" }}>
          {creating ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
              {lb.creating}
            </span>
          ) : lb.create}
        </button>
      </div>
    </div>
  );
}
