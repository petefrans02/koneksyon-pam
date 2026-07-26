"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import RequireAuth from "@/app/components/RequireAuth";
import { useWakeLock } from "@/lib/useWakeLock";
import LiveTest from "@/app/admin/championship-studio/[id]/LiveTest";
import type { ChampionshipQuestion } from "@/lib/championship-types";

interface SoloRound {
  round_number: number;
  round_type: string;
  questions: ChampionshipQuestion[];
  time_limit_sec?: number;
}

export default function SoloPlayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as "fr" | "ht" | "en" | "es";

  const [rounds, setRounds] = useState<SoloRound[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useWakeLock(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetch(`/api/contests/${id}/solo-rounds`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.error) { setError(d.error); return; }
        setRounds((d.rounds ?? []).filter((r: SoloRound) => (r.questions?.length ?? 0) > 0));
      })
      .catch(() => alive && setError("network"));
    return () => { alive = false; };
  }, [id]);

  const back = () => router.push(`/championnats/${id}`);

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#050b18" }}>
        {error ? (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#fff", padding: 24, textAlign: "center" }}>
            <p style={{ fontSize: 42 }}>😕</p>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>
              {l === "fr" ? "Impossible de charger ce concours." : l === "ht" ? "Nou pa ka chaje konkou sa a." : l === "es" ? "No se pudo cargar este concurso." : "Could not load this contest."}
            </p>
            <button onClick={back} style={{ padding: "10px 22px", borderRadius: 999, border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.1)", color: "#fbbf24", fontWeight: 800, cursor: "pointer" }}>
              {l === "fr" ? "Retour" : l === "ht" ? "Tounen" : l === "es" ? "Volver" : "Back"}
            </button>
          </div>
        ) : !rounds ? (
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(245,158,11,0.25)", borderTopColor: "#fbbf24", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontWeight: 700 }}>{l === "fr" ? "Préparation…" : l === "ht" ? "N ap prepare…" : l === "es" ? "Preparando…" : "Preparing…"}</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          </div>
        ) : rounds.length === 0 ? (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#fff", padding: 24, textAlign: "center" }}>
            <p style={{ fontSize: 42 }}>📭</p>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>{l === "fr" ? "Ce concours n'a pas encore de questions." : l === "ht" ? "Konkou sa a poko gen kesyon." : l === "es" ? "Este concurso aún no tiene preguntas." : "This contest has no questions yet."}</p>
            <button onClick={back} style={{ padding: "10px 22px", borderRadius: 999, border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.1)", color: "#fbbf24", fontWeight: 800, cursor: "pointer" }}>
              {l === "fr" ? "Retour" : l === "ht" ? "Tounen" : l === "es" ? "Volver" : "Back"}
            </button>
          </div>
        ) : (
          <LiveTest solo storageKey={id} rounds={rounds} lang={l} onClose={back} />
        )}
      </div>
    </RequireAuth>
  );
}
