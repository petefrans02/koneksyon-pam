"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { gl } from "@/lib/lang-helper";
import Icon from "@/app/components/Icon";
import { CourseContent, Module, Lesson } from "@/lib/courses/types";
import { Course } from "@/lib/academy-data";
import { supabase } from "@/lib/supabase";
import { useStickyState } from "@/lib/useStickyState";

interface DynRow {
  id: string;
  module_title: Record<string, string>;
  title: Record<string, string>;
  content: Record<string, string>;
  key_points?: Record<string, string[]>;
  exercise?: Record<string, string>;
  verse?: string;
  video_id?: string;
}

export default function CourseViewer({ course, content }: { course: Course; content: CourseContent }) {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as "fr" | "ht" | "en" | "es";

  // Leçons dynamiques (ajoutées à chaud pour rester à jour) — fusionnées aux statiques.
  const [dynLessons, setDynLessons] = useState<Lesson[]>([]);
  useEffect(() => {
    let alive = true;
    fetch(`/api/courses/${course.slug}/lessons`)
      .then((r) => r.json())
      .then((d: { lessons?: DynRow[] }) => {
        if (!alive || !d.lessons?.length) return;
        setDynLessons(d.lessons.map((row) => ({
          slug: `dyn-${row.id}`,
          title: row.title,
          videoId: row.video_id || "",
          content: row.content,
          keyPoints: row.key_points,
          exercise: row.exercise,
          verse: row.verse,
        })));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [course.slug]);

  // Modules affichés = statiques + un module « Mises à jour » si des leçons dynamiques existent.
  const modules: Module[] = useMemo(() => {
    if (!dynLessons.length) return content.modules;
    return [
      ...content.modules,
      { title: { fr: "Mises à jour", ht: "Mizajou", en: "Updates", es: "Actualizaciones" }, lessons: dynLessons },
    ];
  }, [content.modules, dynLessons]);

  // Liste plate des leçons (pour navigation) + repère du module.
  const flat = useMemo(() => {
    const arr: { mi: number; li: number }[] = [];
    modules.forEach((m, mi) => m.lessons.forEach((_, li) => arr.push({ mi, li })));
    return arr;
  }, [modules]);

  // Leçon en cours — mémorisée par cours pour reprendre au même endroit après un refresh.
  const [cur, setCur] = useStickyState(`kp:course:${course.slug}:lesson`, 0);
  const pos = flat[Math.min(cur, flat.length - 1)];
  const lesson = modules[pos.mi].lessons[pos.li];
  const total = flat.length;

  // ── Progression sauvegardée + certificat ──
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState<string>("");
  const [showCert, setShowCert] = useState(false);
  const storeKey = `kp-course-progress-${course.slug}`;

  useEffect(() => {
    try { const s = localStorage.getItem(storeKey); if (s) setCompleted(new Set(JSON.parse(s))); } catch {}
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user as { user_metadata?: { full_name?: string }; email?: string } | null;
      setUserName(u?.user_metadata?.full_name || u?.email?.split("@")[0] || "");
    }).catch(() => {});
  }, [storeKey]);

  const markComplete = (slug: string) => setCompleted((prev) => {
    if (prev.has(slug)) return prev;
    const next = new Set(prev); next.add(slug);
    try { localStorage.setItem(storeKey, JSON.stringify([...next])); } catch {}
    return next;
  });
  const doneCount = flat.filter((f) => completed.has(modules[f.mi].lessons[f.li].slug)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const courseDone = total > 0 && doneCount >= total;

  const T = {
    lessons: { fr: "leçons", ht: "leson", en: "lessons", es: "lecciones" },
    videoSoon: { fr: "Vidéo à venir", ht: "Videyo ap vini", en: "Video coming soon", es: "Video próximamente" },
    keyPoints: { fr: "À retenir", ht: "Pou sonje", en: "Key points", es: "Para recordar" },
    exercise: { fr: "Exercice pratique", ht: "Egzèsis pratik", en: "Practical exercise", es: "Ejercicio práctico" },
    prev: { fr: "Précédent", ht: "Avan", en: "Previous", es: "Anterior" },
    next: { fr: "Suivant", ht: "Swivan", en: "Next", es: "Siguiente" },
    back: { fr: "← Toutes les formations", ht: "← Tout fòmasyon yo", en: "← All courses", es: "← Todas las formaciones" },
    lesson: { fr: "Leçon", ht: "Leson", en: "Lesson", es: "Lección" },
    progress: { fr: "Progression", ht: "Pwogresyon", en: "Progress", es: "Progreso" },
    finish: { fr: "Terminer le cours", ht: "Fini kou a", en: "Finish course", es: "Terminar el curso" },
    congrats: { fr: "Félicitations, cours terminé !", ht: "Felisitasyon, kou fini !", en: "Congratulations, course complete!", es: "¡Felicidades, curso completado!" },
    certReady: { fr: "Votre certificat de réussite est prêt.", ht: "Sètifika reyisit ou pare.", en: "Your certificate of completion is ready.", es: "Tu certificado de finalización está listo." },
    getCert: { fr: "Voir mon certificat", ht: "Wè sètifika mwen", en: "View my certificate", es: "Ver mi certificado" },
    certTitle: { fr: "Certificat de Réussite", ht: "Sètifika Reyisit", en: "Certificate of Completion", es: "Certificado de Finalización" },
    certGiven: { fr: "Décerné à", ht: "Bay", en: "Awarded to", es: "Otorgado a" },
    certFor: { fr: "pour avoir complété la formation", ht: "pou konplete fòmasyon an", en: "for completing the course", es: "por completar el curso" },
    student: { fr: "Étudiant", ht: "Etidyan", en: "Student", es: "Estudiante" },
    print: { fr: "Imprimer / PDF", ht: "Enprime / PDF", en: "Print / PDF", es: "Imprimir / PDF" },
    close: { fr: "Fermer", ht: "Fèmen", en: "Close", es: "Cerrar" },
  };
  const tr = (o: Record<string, string>) => o[l] ?? o.fr;

  const keyPoints: string[] | null = lesson.keyPoints
    ? (lesson.keyPoints[l] ?? lesson.keyPoints.fr ?? lesson.keyPoints.en ?? [])
    : null;

  return (
    <main style={{ background: "#faf8f4", minHeight: "100vh", color: "#1c1c2e" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#06122a,#0d2048)", color: "#fff", padding: "48px 20px 36px" }}>
        <div className="max-w-6xl mx-auto">
          <Link href="/academie" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: 18 }}>
            {tr(T.back)}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${course.color}22`, border: `1px solid ${course.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: course.color, flexShrink: 0 }}>
              <Icon name={course.icon as never} size={26} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: "clamp(1.5rem,3.5vw,2.2rem)", lineHeight: 1.1 }}>{gl(course.title, lang)}</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>{total} {tr(T.lessons)} · {gl(course.level, lang)}</p>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, marginTop: 16, maxWidth: 640 }}>{gl(content.intro, lang)}</p>
          {/* Barre de progression */}
          <div style={{ marginTop: 20, maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6, fontWeight: 700 }}>
              <span>{tr(T.progress)}</span>
              <span>{doneCount}/{total} · {pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#c8960f,#f0c840)", borderRadius: 999, transition: "width .4s ease" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 24 }}>
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr", alignItems: "start" }} className="course-grid">
          {/* Sommaire */}
          <aside style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: 18, padding: 16, alignSelf: "start" }}>
            {modules.map((m, mi) => (
              <div key={mi} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>{gl(m.title, lang)}</p>
                {m.lessons.map((ls, li) => {
                  const idx = flat.findIndex((f) => f.mi === mi && f.li === li);
                  const active = idx === cur;
                  return (
                    <button key={li} onClick={() => setCur(idx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                        padding: "9px 10px", marginBottom: 3, borderRadius: 10, border: "none", cursor: "pointer",
                        background: active ? "rgba(0,170,200,0.08)" : "transparent",
                        color: active ? "#0d1d3d" : "#4a6080", fontWeight: active ? 700 : 500, fontSize: 13,
                      }}>
                      <span style={{ display: "inline-flex", color: completed.has(ls.slug) ? "#16a34a" : active ? course.color : "#c8c4be", flexShrink: 0 }}>
                        <Icon name={completed.has(ls.slug) ? "succes" : "lecon"} size={15} />
                      </span>
                      {gl(ls.title, lang)}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Leçon courante */}
          <article style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: 18, padding: "24px 26px" }}>
            {/* Emplacement vidéo (vide pour l'instant) */}
            <div style={{
              aspectRatio: "16 / 9", borderRadius: 14, marginBottom: 22,
              background: "linear-gradient(135deg,#0d1d3d,#1a3568)", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "rgba(255,255,255,0.5)",
            }}>
              <Icon name="video" size={40} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>{tr(T.videoSoon)}</span>
            </div>

            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: course.color, marginBottom: 6 }}>
              {tr(T.lesson)} {cur + 1} / {total}
            </p>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 800, fontSize: "1.5rem", color: "#0d1d3d", marginBottom: 16, lineHeight: 1.2 }}>
              {gl(lesson.title, lang)}
            </h2>

            <div style={{ color: "#2d3748", fontSize: "0.98rem", lineHeight: 1.8 }}>
              {gl(lesson.content, lang).split("\n\n").map((p, i) => (
                <p key={i} style={{ marginBottom: 14 }}>{p}</p>
              ))}
            </div>

            {lesson.verse && (
              <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,170,200,0.07)", border: "1px solid rgba(0,170,200,0.2)", borderRadius: 999, padding: "6px 14px", fontSize: "0.82rem", fontWeight: 700, color: "#00758c" }}>
                <Icon name="bible" size={15} /> {lesson.verse}
              </div>
            )}

            {lesson.exercise && (
              <div style={{ marginTop: 18, background: "#eef6ff", border: "1px solid #b8d8f0", borderLeft: "4px solid #1d4ed8", borderRadius: 14, padding: "18px 20px" }}>
                <p style={{ fontWeight: 800, color: "#1a3568", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="exercice" size={16} color="#1d4ed8" /> {tr(T.exercise)}
                </p>
                <p style={{ color: "#2d3748", fontSize: "0.9rem", lineHeight: 1.65 }}>{gl(lesson.exercise, lang)}</p>
              </div>
            )}

            {keyPoints && keyPoints.length > 0 && (
              <div style={{ marginTop: 22, background: "#fffbf0", border: "1px solid #e8c86c", borderLeft: "4px solid #c8960f", borderRadius: 14, padding: "18px 20px" }}>
                <p style={{ fontWeight: 800, color: "#1a3568", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="idee" size={16} color="#c8960f" /> {tr(T.keyPoints)}
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {keyPoints.map((kp, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: "0.88rem", color: "#4a6080", lineHeight: 1.5 }}>
                      <span style={{ color: "#16a34a", flexShrink: 0, display: "inline-flex", marginTop: 2 }}><Icon name="valider" size={15} /></span>
                      {kp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 26 }}>
              <button onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 999, fontWeight: 700, fontSize: 13, background: "#f0ede8", color: cur === 0 ? "#c8c4be" : "#1a3568", border: "none", cursor: cur === 0 ? "not-allowed" : "pointer" }}>
                <Icon name="fleche_gauche" size={16} /> {tr(T.prev)}
              </button>
              {cur < total - 1 ? (
                <button onClick={() => { markComplete(lesson.slug); setCur((c) => Math.min(total - 1, c + 1)); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 999, fontWeight: 800, fontSize: 13, background: "linear-gradient(135deg,#c8960f,#f0c840)", color: "#0d1d3d", border: "none", cursor: "pointer" }}>
                  {tr(T.next)} <Icon name="fleche_droite" size={16} />
                </button>
              ) : (
                <button onClick={() => markComplete(lesson.slug)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 999, fontWeight: 800, fontSize: 13, background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", border: "none", cursor: "pointer" }}>
                  <Icon name="valider" size={16} /> {tr(T.finish)}
                </button>
              )}
            </div>

            {/* Bannière certificat (cours 100% terminé) */}
            {courseDone && (
              <div className="no-print" style={{ marginTop: 24, background: "linear-gradient(135deg,#fffbf0,#fff7e0)", border: "1px solid #e8c86c", borderRadius: 16, padding: "22px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", marginBottom: 8, color: "#c8960f" }}><Icon name="certificat" size={38} /></div>
                <p style={{ fontWeight: 900, color: "#1a3568", fontSize: 16, marginBottom: 4 }}>{tr(T.congrats)}</p>
                <p style={{ color: "#4a6080", fontSize: 13, marginBottom: 16 }}>{tr(T.certReady)}</p>
                <button onClick={() => setShowCert(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 999, fontWeight: 800, fontSize: 14, background: "linear-gradient(135deg,#c8960f,#f0c840)", color: "#0d1d3d", border: "none", cursor: "pointer" }}>
                  <Icon name="certificat" size={18} /> {tr(T.getCert)}
                </button>
              </div>
            )}
          </article>
        </div>
      </div>

      {/* ── Certificat ── */}
      {showCert && (
        <div onClick={() => setShowCert(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(6,12,26,0.72)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 720 }}>
            <div className="cert-print" style={{ background: "#fffdf7", border: "3px solid #c8960f", borderRadius: 16, padding: "48px 40px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "inline-flex", color: "#c8960f", marginBottom: 12 }}><Icon name="certificat" size={54} /></div>
              <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.3em", color: "#c8960f", textTransform: "uppercase", marginBottom: 10 }}>KONEKSYON PAM</p>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 900, color: "#1a3568", marginBottom: 22 }}>{tr(T.certTitle)}</h2>
              <p style={{ color: "#4a6080", fontSize: 14 }}>{tr(T.certGiven)}</p>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, fontWeight: 800, color: "#0d1d3d", margin: "6px 0 20px" }}>{userName || tr(T.student)}</p>
              <p style={{ color: "#4a6080", fontSize: 14 }}>{tr(T.certFor)}</p>
              <p style={{ fontWeight: 800, fontSize: 18, color: "#c8960f", margin: "4px 0 24px" }}>{gl(course.title, lang)}</p>
              <div style={{ height: 1, background: "#e8c86c", margin: "0 auto 16px", maxWidth: 200 }} />
              <p style={{ color: "#9ca3af", fontSize: 12 }}>{new Date().toLocaleDateString(l === "en" ? "en-US" : l === "es" ? "es-ES" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button onClick={() => window.print()} style={{ padding: "11px 24px", borderRadius: 999, fontWeight: 800, fontSize: 13, background: "#fff", color: "#1a3568", border: "none", cursor: "pointer" }}>{tr(T.print)}</button>
              <button onClick={() => setShowCert(false)} style={{ padding: "11px 24px", borderRadius: 999, fontWeight: 700, fontSize: 13, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", cursor: "pointer" }}>{tr(T.close)}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .course-grid { grid-template-columns: 280px minmax(0,1fr) !important; }
        }
        @media print {
          body * { visibility: hidden !important; }
          .cert-print, .cert-print * { visibility: visible !important; }
          .cert-print { position: fixed; inset: 0; margin: auto; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </main>
  );
}
