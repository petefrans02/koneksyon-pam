"use client";

// PARCOURS D'ANGLAIS BIBLIQUE — la carte des leçons, façon Duolingo.
// Chemin serpentin, leçons verrouillées jusqu'à la réussite de la précédente,
// XP et série en tête, colombe mascotte qui encourage.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { PATHS, CEFR, ALL_LESSONS, unitsOf, lessonsOfPath, type Path } from "@/lib/english-course";
import { loadLocal, syncDown, type Progress } from "@/lib/english-progress";
import TutorBubble from "./TutorBubble";
import CertificateCard from "./CertificateCard";

const CSS = `
/* LARGEUR ADAPTATIVE
   Telephone : pleine largeur. Tablette : confortable.
   Ordinateur : on exploite l'ecran au lieu de laisser les cotes vides. */
:root { --kp-w: 100%; }
@media (min-width: 700px)  { :root { --kp-w: 680px; } }
@media (min-width: 1024px) { :root { --kp-w: 960px; } }
@media (min-width: 1400px) { :root { --kp-w: 1240px; } }

/* Sur grand ecran, les unites se placent en deux colonnes : on voit tout le
   parcours d'un coup d'oeil au lieu de derouler sans fin. */
@media (min-width: 1024px) {
  .kp-units { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; align-items: start; }
}
/* Cibles tactiles confortables sur telephone. */
@media (max-width: 480px) {
  .kp-academy button, .kp-academy a { min-height: 44px; }
}

@keyframes ang-pop { 0% { transform: scale(.7); opacity: 0 } 60% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes ang-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
@keyframes ang-ring { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,.55) } 100% { box-shadow: 0 0 0 18px rgba(74,222,128,0) } }
@keyframes ang-shine { 0% { transform: translateX(-120%) } 100% { transform: translateX(240%) } }
@keyframes ang-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
`;

export default function AnglaisPage() {
  const { lang } = useLang();
  const l: "fr" | "ht" = lang === "ht" ? "ht" : "fr";
  const [prog, setProg] = useState<Progress>({ xp: 0, streak: 0, lastDay: "", done: [] });
  const [ready, setReady] = useState(false);
  // Deux parcours : anglais général et anglais chrétien. Chacun a sa
  // progression propre, l'élève peut suivre les deux en parallèle.
  const [path, setPath] = useState<Path>("general");

  useEffect(() => {
    setProg(loadLocal());
    setReady(true);
    syncDown().then(setProg).catch(() => {});
  }, []);

  const done = new Set(prog.done);
  // Une leçon est ouverte si c'est la première, si elle est faite, ou si la
  // précédente est terminée. On avance pas à pas, comme dans un jeu.
  const isOpen = (slug: string) => {
    const i = ALL_LESSONS.findIndex((x) => x.slug === slug);
    if (i <= 0) return true;
    return done.has(slug) || done.has(ALL_LESSONS[i - 1].slug);
  };
  const pathLessons = lessonsOfPath(path);
  const nextLesson = pathLessons.find((x) => !done.has(x.slug));

  const t = {
    fr: { title: "Anglais Biblique", sub: "Apprends l'anglais avec la Parole de Dieu", xp: "points", streak: "jours de suite", done: "leçons terminées", start: "Commencer", cont: "Continuer", locked: "Termine la leçon précédente", encourage: "Chaque jour, un pas de plus 🕊️", allDone: "Tu as terminé tout le parcours. Gloire à Dieu ! 👑" },
    ht: { title: "Anglè Biblik", sub: "Aprann anglè ak Pawòl Bondye", xp: "pwen", streak: "jou youn dèyè lòt", done: "leson fini", start: "Kòmanse", cont: "Kontinye", locked: "Fini leson anvan an", encourage: "Chak jou, yon pa an plis 🕊️", allDone: "Ou fini tout pakou a. Glwa pou Bondye ! 👑" },
  }[l];

  const pathDone = pathLessons.filter((x) => done.has(x.slug)).length;
  const pct = pathLessons.length ? Math.round((pathDone / pathLessons.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04080f,#061020 60%,#04080f)", color: "#fff" }}>
      <style>{CSS}</style>

      {/* En-tête : XP, série, progression */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(4,8,15,0.86)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: "var(--kp-w)", margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 30, animation: "ang-float 3s ease-in-out infinite" }}>🕊️</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: "clamp(17px,2.4vw,24px)", lineHeight: 1.1 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{t.sub}</div>
          </div>
          <Link href="/anglais/tableau-de-bord" title={l === "ht" ? "Tablo bòdmi" : "Mon tableau de bord"}
            style={{ textDecoration: "none", fontSize: 20, padding: "6px 10px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>📊</Link>
          <div style={{ display: "flex", gap: 10 }}>
            <Stat icon="⚡" value={prog.xp} label={t.xp} color="#fbbf24" />
            <Stat icon="🔥" value={prog.streak} label={t.streak} color="#f87171" />
            <Stat icon="✅" value={done.size} label={t.done} color="#4ade80" />
          </div>
        </div>
        <div style={{ maxWidth: "var(--kp-w)", margin: "10px auto 0", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#4ade80,#22c55e)", borderRadius: 999, transition: "width .8s cubic-bezier(0.22,1,0.36,1)" }} />
        </div>
      </div>

      <div className="kp-academy" style={{ maxWidth: "var(--kp-w)", margin: "0 auto", padding: "22px clamp(16px,4vw,40px) 80px" }}>
        {/* Choix du parcours */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {PATHS.map((pa) => {
            const on = pa.key === path;
            const n = lessonsOfPath(pa.key);
            return (
              <button key={pa.key} onClick={() => setPath(pa.key)}
                style={{
                  textAlign: "left", cursor: "pointer", borderRadius: 16, padding: "12px 14px",
                  background: on ? `linear-gradient(135deg,${pa.color}33,rgba(255,255,255,0.03))` : "rgba(255,255,255,0.04)",
                  border: `2px solid ${on ? pa.color : "rgba(255,255,255,0.1)"}`,
                  color: "#fff", transition: "all .25s",
                }}>
                <div style={{ fontSize: 22 }}>{pa.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>{pa.title[l]}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.4, marginTop: 2 }}>{pa.desc[l]}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: pa.color, marginTop: 5 }}>
                  {n.filter((x) => done.has(x.slug)).length}/{n.length} leçons
                </div>
              </button>
            );
          })}
        </div>

        {/* Bouton d'action principal */}
        {ready && nextLesson && (
          <Link href={`/anglais/${nextLesson.slug}`} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: `linear-gradient(135deg,${nextLesson.unit.color},#0b1a33)`, borderRadius: 20, padding: "16px 20px", marginBottom: 26, position: "relative", overflow: "hidden", animation: "ang-in .5s ease both", boxShadow: `0 14px 40px ${nextLesson.unit.color}44` }}>
              <span style={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)", animation: "ang-shine 3.5s ease-in-out infinite" }} />
              <span style={{ fontSize: 34, position: "relative" }}>{nextLesson.icon}</span>
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.65)" }}>{done.size === 0 ? t.start.toUpperCase() : t.cont.toUpperCase()}</div>
                <div style={{ fontWeight: 900, fontSize: "clamp(15px,2vw,20px)" }}>{nextLesson.title[l]}</div>
              </div>
              <span style={{ position: "relative", fontSize: 22 }}>▶</span>
            </div>
          </Link>
        )}
        {ready && !nextLesson && (
          <div style={{ marginBottom: 26 }}>
            <div style={{ textAlign: "center", padding: 20, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.4)", borderRadius: 18, fontWeight: 800 }}>{t.allDone}</div>
            {/* Parcours terminé : l'examen final, puis le certificat. */}
            <Link href={`/anglais/examen/${path}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg,#e6b83c,#7a5c12)", borderRadius: 16, padding: "14px 18px", margin: "14px 0", color: "#1a1203" }}>
                <span style={{ fontSize: 30 }}>🎓</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{l === "ht" ? "Egzamen final" : "Examen final"}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>
                    {l === "ht" ? "20 kesyon · 80% pou pase · obligatwa pou sètifika a" : "20 questions · 80% pour réussir · obligatoire pour le certificat"}
                  </div>
                </div>
                <span style={{ fontSize: 20 }}>▶</span>
              </div>
            </Link>

            <CertificateCard
              program={PATHS.find((x) => x.key === path)?.title.fr ?? "Anglais"}
              lessons={pathDone}
              xp={prog.xp}
              lang={l}
            />
          </div>
        )}

        {/* Le parcours, niveau par niveau */}
        {CEFR.map((lv) => {
          const units = unitsOf(path, lv.key);
          if (!units.length) return null;
          return (
            <div key={lv.key} style={{ marginBottom: 34 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
                <span style={{ fontSize: 20 }}>{lv.icon}</span>
                <span style={{ fontWeight: 900, letterSpacing: "0.18em", fontSize: 12, color: lv.color, textTransform: "uppercase" }}>{lv.title[l]}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${lv.color}55,transparent)` }} />
              </div>

              <div className="kp-units">
              {units.map((u) => (
                <div key={u.slug} style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${u.color}18`, border: `1px solid ${u.color}44`, borderRadius: 14, padding: "10px 14px", marginBottom: 14 }}>
                    <span style={{ fontSize: 22 }}>{u.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 15 }}>{u.title[l]}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{u.subtitle[l]}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 800, color: u.color }}>
                      {u.lessons.filter((x) => done.has(x.slug)).length}/{u.lessons.length}
                    </span>
                  </div>

                  {/* Chemin serpentin */}
                  <div style={{ display: "grid", gap: 12 }}>
                    {u.lessons.map((les, i) => {
                      const finished = done.has(les.slug);
                      const open = isOpen(les.slug);
                      const isNext = nextLesson?.slug === les.slug;
                      const offset = [0, 46, 92, 46][i % 4];
                      const inner = (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: offset, opacity: open ? 1 : 0.42, animation: "ang-pop .4s ease both" }}>
                          <div style={{
                            width: 62, height: 62, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                            background: finished ? "linear-gradient(160deg,#4ade80,#16a34a)" : open ? `linear-gradient(160deg,${u.color},#0b1a33)` : "rgba(255,255,255,0.06)",
                            border: `3px solid ${finished ? "#86efac" : open ? u.color : "rgba(255,255,255,0.12)"}`,
                            boxShadow: finished ? "0 8px 26px rgba(34,197,94,.35)" : open ? `0 8px 26px ${u.color}44` : "none",
                            animation: isNext ? "ang-ring 1.8s ease-out infinite" : undefined,
                          }}>
                            {finished ? "✅" : open ? les.icon : "🔒"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{les.title[l]}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                              {open ? `${les.exercises.length} exercices` : t.locked}
                            </div>
                          </div>
                        </div>
                      );
                      return open
                        ? <Link key={les.slug} href={`/anglais/${les.slug}`} style={{ textDecoration: "none", color: "inherit" }}>{inner}</Link>
                        : <div key={les.slug}>{inner}</div>;
                    })}
                  </div>
                </div>
              ))}
              </div>
            </div>
          );
        })}

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 30 }}>{t.encourage}</p>
      </div>

      {/* La professeure, disponible partout */}
      <TutorBubble />
    </div>
  );
}

function Stat({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 52 }} title={label}>
      <div style={{ fontSize: 15 }}>{icon}</div>
      <div style={{ fontWeight: 900, color, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
