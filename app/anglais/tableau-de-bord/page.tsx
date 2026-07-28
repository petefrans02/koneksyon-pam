"use client";

// TABLEAU DE BORD DE L'ÉLÈVE — tout son parcours en un écran.
// Niveau atteint, points, série, leçons faites par parcours, certificats obtenus.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { PATHS, CEFR, lessonsOfPath, TOTAL_LESSONS, type Path } from "@/lib/english-course";
import { loadLocal, syncDown, type Progress } from "@/lib/english-progress";

interface Cert { code: string; program: string; issued_at: string; paid?: boolean }

export default function DashboardPage() {
  const { lang } = useLang();
  const l: "fr" | "ht" = lang === "ht" ? "ht" : "fr";
  const [prog, setProg] = useState<Progress>({ xp: 0, streak: 0, lastDay: "", done: [] });
  const [certs, setCerts] = useState<Cert[]>([]);

  useEffect(() => {
    setProg(loadLocal());
    syncDown().then(setProg).catch(() => {});
    fetch("/api/certificates").then((r) => r.json()).then((d) => setCerts(d.certificates ?? [])).catch(() => {});
  }, []);

  const t = {
    fr: { title: "Mon tableau de bord", sub: "Ta progression en anglais", xp: "Points gagnés", streak: "Jours de suite",
          lessons: "Leçons terminées", certs: "Certificats", level: "Niveau atteint", none: "Aucun certificat pour l'instant",
          exam: "Examen réussi", continue: "Continuer à apprendre", verify: "Vérifier", official: "Officiel", preview: "Aperçu" },
    ht: { title: "Tablo bòdmi", sub: "Pwogrè ou an anglè", xp: "Pwen ou genyen", streak: "Jou youn dèyè lòt",
          lessons: "Leson fini", certs: "Sètifika", level: "Nivo ou rive", none: "Poko gen sètifika",
          exam: "Egzamen pase", continue: "Kontinye aprann", verify: "Verifye", official: "Ofisyèl", preview: "Apèsi" },
  }[l];

  const done = new Set(prog.done);
  const lessonsDone = prog.done.filter((s) => !s.startsWith("exam:")).length;

  // Le niveau atteint : le plus élevé dont toutes les unités sont terminées.
  const reached = [...CEFR].reverse().find((c) =>
    PATHS.some((p) => {
      const ls = lessonsOfPath(p.key).filter((x) => x.unit.cefr === c.key);
      return ls.length > 0 && ls.every((x) => done.has(x.slug));
    })
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04080f,#061020 60%,#04080f)", color: "#fff", padding: "26px clamp(16px,4vw,40px) 70px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, margin: 0 }}>{t.title}</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{t.sub}</p>

        {/* Les chiffres clés */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, margin: "22px 0" }}>
          <Tile icon="⚡" value={String(prog.xp)} label={t.xp} color="#fbbf24" />
          <Tile icon="🔥" value={String(prog.streak)} label={t.streak} color="#f87171" />
          <Tile icon="✅" value={`${lessonsDone}/${TOTAL_LESSONS}`} label={t.lessons} color="#4ade80" />
          <Tile icon="🎓" value={String(certs.length)} label={t.certs} color="#e6b83c" />
        </div>

        {reached && (
          <div style={{ background: `${reached.color}1f`, border: `1px solid ${reached.color}66`, borderRadius: 16, padding: "14px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26 }}>{reached.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.level}</div>
              <div style={{ fontWeight: 900, fontSize: 17, color: reached.color }}>{reached.title[l]}</div>
            </div>
          </div>
        )}

        {/* Progression par parcours */}
        <div style={{ display: "grid", gap: 12, marginBottom: 26 }}>
          {PATHS.map((p) => {
            const ls = lessonsOfPath(p.key as Path);
            const n = ls.filter((x) => done.has(x.slug)).length;
            const pct = ls.length ? Math.round((n / ls.length) * 100) : 0;
            const examOk = done.has(`exam:${p.key}`);
            return (
              <div key={p.key} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <b style={{ fontSize: 15 }}>{p.title[l]}</b>
                  {examOk && <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", background: "rgba(74,222,128,0.14)", borderRadius: 999, padding: "3px 10px" }}>🎓 {t.exam}</span>}
                  <span style={{ marginLeft: "auto", fontWeight: 900, color: p.color }}>{n}/{ls.length}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: 999, transition: "width .8s cubic-bezier(0.22,1,0.36,1)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificats */}
        <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>🎓 {t.certs}</h2>
        {certs.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{t.none}</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {certs.map((c) => (
              <div key={c.code} style={{ background: "rgba(230,184,60,0.08)", border: "1px solid rgba(230,184,60,0.3)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 22 }}>🎓</span>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 800 }}>{c.program}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{c.code}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: c.paid ? "#4ade80" : "#fbbf24" }}>
                  {c.paid ? `✅ ${t.official}` : t.preview}
                </span>
                <Link href={`/verifier/${c.code}`} style={{ fontSize: 12, color: "#60a5fa" }}>{t.verify}</Link>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Link href="/anglais" style={{ display: "inline-block", background: "linear-gradient(135deg,#4ade80,#16a34a)", color: "#04140a", borderRadius: 14, padding: "14px 28px", fontWeight: 900, textDecoration: "none" }}>
            {t.continue}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontWeight: 900, fontSize: 26, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}
