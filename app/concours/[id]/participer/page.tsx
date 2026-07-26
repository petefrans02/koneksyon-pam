"use client";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Lang = "fr" | "ht" | "en" | "es";

interface UserProfile { name: string; avatar_url: string | null; country: string | null; }
interface Participant { name: string; avatar_url: string | null; }
interface Contest {
  id: string; title: string; title_ht?: string; title_en?: string; title_es?: string;
  status: "upcoming" | "active" | "completed"; theme?: string;
  scheduled_start_at?: string;
}

// Messages qui tournent en boucle — jamais bloqués
const MESSAGES = {
  fr: [
    "Préparation de votre session...",
    "Synchronisation avec les participants...",
    "Connexion au serveur...",
    "Vérification de votre profil...",
    "Chargement des épreuves...",
    "Tout est prêt. En attente du lancement...",
    "Le championnat débutera très bientôt...",
    "Restez connecté, c'est imminent...",
  ],
  ht: [
    "Preparasyon sesyon ou...",
    "Senkronizasyon ak patisipan yo...",
    "Koneksyon ak sèvè a...",
    "Verifikasyon pwofil ou...",
    "Chajman pwèv yo...",
    "Tout pare. Ap tann lanse...",
    "Chanpyona a ap kòmanse byento...",
    "Rete konekte, sa pral kòmanse...",
  ],
  en: [
    "Preparing your session...",
    "Syncing with participants...",
    "Connecting to server...",
    "Verifying your profile...",
    "Loading challenges...",
    "All set. Waiting for launch...",
    "The championship starts soon...",
    "Stay connected, it's imminent...",
  ],
  es: [
    "Preparando tu sesión...",
    "Sincronizando con los participantes...",
    "Conectando al servidor...",
    "Verificando tu perfil...",
    "Cargando los desafíos...",
    "Todo listo. Esperando el lanzamiento...",
    "El campeonato comenzará muy pronto...",
    "Mantente conectado, es inminente...",
  ],
};

function tl(o: { fr: string; ht: string; en: string; es?: string }, l: Lang) {
  return l === "ht" ? o.ht : l === "en" ? o.en : l === "es" ? (o.es ?? o.en) : o.fr;
}

function FlagEmoji({ country }: { country: string | null }) {
  if (!country) return null;
  try {
    const code = country.toUpperCase().slice(0, 2);
    const flag = String.fromCodePoint(...[...code].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
    return <span>{flag}</span>;
  } catch { return null; }
}

export default function ParticiperPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Cycling message — tourne en boucle infinie, jamais bloqué
  const [msgIdx, setMsgIdx] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const msgs = MESSAGES[l];

  // Animated dots
  const [dotPhase, setDotPhase] = useState(0);

  // Init
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/auth?redirect=/concours/${id}/participer`); return; }

      const [profileRes, contestRes] = await Promise.all([
        supabase.from("profiles").select("name, avatar_url, country").eq("id", user.id).single(),
        fetch(`/api/contests/${id}`).then(r => r.json()),
      ]);

      if (profileRes.data) setProfile(profileRes.data);

      const c: Contest | null = contestRes.contest;
      if (!c) { router.replace("/concours"); return; }
      setContest(c);
      setLoading(false);

      if (c.status === "active") { launchPlay(); return; }
      if (c.status === "completed") { router.replace(`/concours/${id}/results`); return; }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Cycle messages indefinitely — aucune barre de progression
  useEffect(() => {
    const t = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIdx(prev => (prev + 1) % msgs.length);
        setMsgVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(t);
  }, [msgs.length]);

  // Animated dots cycling
  useEffect(() => {
    const t = setInterval(() => setDotPhase(p => (p + 1) % 3), 500);
    return () => clearInterval(t);
  }, []);

  // Poll participant count + photos every 8-10s
  useEffect(() => {
    if (loading) return;

    const fetchStats = () =>
      fetch(`/api/contests/${id}/live-stats`)
        .then(r => r.json())
        .then(d => setParticipantCount(d.registered ?? null))
        .catch(() => {});

    const fetchParticipants = async () => {
      try {
        // contest_participants has user_name and user_avatar directly (no join needed)
        const { data } = await supabase
          .from("contest_participants")
          .select("user_name, user_avatar")
          .eq("contest_id", id)
          .limit(30);
        if (data) {
          setParticipants(data.map(d => ({
            name: d.user_name ?? "Joueur",
            avatar_url: d.user_avatar ?? null,
          })));
        }
      } catch { /* ignore */ }
    };

    fetchStats();
    fetchParticipants();
    const t1 = setInterval(fetchStats, 8000);
    const t2 = setInterval(fetchParticipants, 10000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [loading, id]);

  // ── Supabase Realtime + Polling fallback ─────────────────────────────────
  // Double mécanisme : Realtime pour l'instantané, polling toutes les 3s en secours
  const launchRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    // Realtime (instantané quand la table est dans la publication)
    const channel = supabase
      .channel(`waiting-room-${id}-${Date.now()}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "contests", filter: `id=eq.${id}` },
        (payload: { new: Contest }) => {
          const updated = payload.new;
          if (updated.status === "active" && !launchRef.current) launchPlay();
          if (updated.status === "completed") router.replace(`/concours/${id}/results`);
        }
      )
      .subscribe();

    // Polling de secours — détecte le lancement même si Realtime échoue
    const poll = setInterval(async () => {
      try {
        const d = await fetch(`/api/contests/${id}`).then(r => r.json());
        const status = d.contest?.status;
        if (status === "active" && !launchRef.current) launchPlay();
        if (status === "completed" && !launchRef.current) router.replace(`/concours/${id}/results`);
      } catch { /* ignore */ }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id]);

  function launchPlay() {
    if (launchRef.current) return;
    launchRef.current = true;
    setLaunching(true);
    setTimeout(() => router.replace(`/concours/${id}/play`), 900);
  }

  const CSS = `
    @keyframes kp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes kp-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes kp-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes kp-orbit { from{transform:rotate(0deg) translateX(36px)} to{transform:rotate(360deg) translateX(36px)} }
    @keyframes kp-orbit2 { from{transform:rotate(120deg) translateX(48px)} to{transform:rotate(480deg) translateX(48px)} }
    @keyframes kp-orbit3 { from{transform:rotate(240deg) translateX(28px)} to{transform:rotate(600deg) translateX(28px)} }
    @keyframes kp-pulse-ring { 0%,100%{transform:scale(1);opacity:.25} 50%{transform:scale(1.1);opacity:.5} }
    @keyframes kp-breathe { 0%,100%{opacity:.3;transform:scale(.95)} 50%{opacity:.9;transform:scale(1)} }
    @keyframes kp-bg-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes kp-msg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes kp-msg-out { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-6px)} }
    @keyframes kp-avatar-glow { 0%,100%{box-shadow:0 0 0 0 rgba(197,168,79,0)} 50%{box-shadow:0 0 0 6px rgba(197,168,79,0.18)} }
  `;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <div className="w-7 h-7 rounded-full border-2 border-[#c5a84f] border-t-transparent"
          style={{ animation: "kp-spin .8s linear infinite" }} />
      </div>
    );
  }
  if (!contest) return null;

  const contestTitle = l === "ht" ? (contest.title_ht ?? contest.title)
    : l === "en" ? (contest.title_en ?? contest.title)
    : l === "es" ? (contest.title_es ?? contest.title_en ?? contest.title)
    : contest.title;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #030d1f 0%, #020717 60%, #040a1a 100%)" }}>
      <style>{CSS}</style>

      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(197,168,79,0.12) 0%, rgba(29,78,216,0.06) 40%, transparent 70%)",
          animation: "kp-bg-shift 8s ease infinite",
          backgroundSize: "200% 200%",
        }} />

      {/* Full-screen launch overlay */}
      {launching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(160deg, #030d1f 0%, #020717 100%)" }}>
          <div className="text-6xl mb-5" style={{ animation: "kp-spin 1.2s linear infinite",
            filter: "drop-shadow(0 0 20px rgba(197,168,79,0.8))" }}>✝</div>
          <p className="text-[#c5a84f] font-black text-sm uppercase tracking-[0.3em] animate-pulse">
            {tl({ fr: "Lancement du championnat...", ht: "Lanseman chanpyona a...", en: "Launching championship...", es: "Iniciando el campeonato..." }, l)}
          </p>
        </div>
      )}

      {/* ── Scrolling participants strip ─────────────────────────────────── */}
      {participants.length > 0 && (
        <div className="fixed top-0 inset-x-0 z-20 py-3 overflow-hidden"
          style={{ background: "linear-gradient(180deg, rgba(2,7,23,0.95) 0%, transparent 100%)" }}>
          <div className="flex gap-3 w-max"
            style={{ animation: `kp-scroll ${Math.max(15, participants.length * 3)}s linear infinite` }}>
            {/* Duplicate for seamless loop */}
            {[...participants, ...participants].map((p, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#c5a84f]/30"
                    style={{ boxShadow: "0 0 8px rgba(197,168,79,0.2)" }} />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#c5a84f]/20 bg-[#c5a84f]/10 flex items-center justify-center text-[10px] font-black text-[#c5a84f]">
                    {p.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <span className="text-white/40 text-[10px] font-semibold max-w-[70px] truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6" style={{ paddingTop: participants.length > 0 ? "3rem" : 0 }}>

        {/* ── Animated logo / pulse ─────────────────────────────────────── */}
        <div className="relative flex items-center justify-center mb-2"
          style={{ animation: "kp-fade-in .5s ease both", width: 120, height: 120 }}>
          {/* Outer rings */}
          <div className="absolute inset-0 rounded-full border border-[#c5a84f]/10"
            style={{ animation: "kp-pulse-ring 3s ease-in-out infinite" }} />
          <div className="absolute rounded-full border border-[#c5a84f]/15"
            style={{ inset: 8, animation: "kp-pulse-ring 3s .8s ease-in-out infinite" }} />

          {/* Orbiting dots */}
          <div className="absolute w-2 h-2 rounded-full bg-[#c5a84f]"
            style={{ animation: "kp-orbit 4s linear infinite", opacity: .7, top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
            style={{ animation: "kp-orbit2 6s linear infinite", opacity: .5, top: "50%", left: "50%", marginTop: -3, marginLeft: -3 }} />
          <div className="absolute w-1 h-1 rounded-full bg-[#c5a84f]/60"
            style={{ animation: "kp-orbit3 5s linear infinite", opacity: .4, top: "50%", left: "50%", marginTop: -2, marginLeft: -2 }} />

          {/* Center cross */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(197,168,79,0.08)", border: "1px solid rgba(197,168,79,0.25)",
              boxShadow: "0 0 28px rgba(197,168,79,0.18)" }}>
            <span className="text-3xl" style={{ filter: "drop-shadow(0 0 10px rgba(197,168,79,0.7))",
              animation: "kp-breathe 2.5s ease-in-out infinite" }}>✝</span>
          </div>
        </div>

        {/* ── Player card ───────────────────────────────────────────────── */}
        <div className="w-full rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 flex items-center gap-4"
          style={{ animation: "kp-fade-in .5s .1s ease both" }}>
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover"
                style={{ animation: "kp-avatar-glow 3s ease-in-out infinite" }} />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#c5a84f]/12 border border-[#c5a84f]/25 flex items-center justify-center text-xl font-black text-[#c5a84f]"
                style={{ animation: "kp-avatar-glow 3s ease-in-out infinite" }}>
                {profile?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#020717]">
              <div className="w-2 h-2 rounded-full bg-green-300 m-px animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-base truncate">{profile?.name ?? "Joueur"}</p>
            {profile?.country && (
              <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                <FlagEmoji country={profile.country} /> {profile.country}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px] font-black uppercase tracking-wider">
                {tl({ fr: "Inscription confirmée", ht: "Enskri konfime", en: "Registration confirmed", es: "Inscripción confirmada" }, l)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Contest card ──────────────────────────────────────────────── */}
        <div className="w-full rounded-2xl border border-[#c5a84f]/20 bg-[#c5a84f]/[0.05] px-5 py-4"
          style={{ animation: "kp-fade-in .5s .2s ease both" }}>
          <p className="text-[#c5a84f] text-[9px] font-black uppercase tracking-[0.35em] mb-1.5">
            {tl({ fr: "Championnat Biblique", ht: "Chanpyona Biblik", en: "Biblical Championship", es: "Campeonato Bíblico" }, l)}
          </p>
          <h2 className="text-white font-black text-lg leading-snug">{contestTitle}</h2>
          {contest.theme && <p className="text-white/35 text-xs mt-1">{contest.theme}</p>}
          {contest.scheduled_start_at && (
            <p className="text-white/20 text-[10px] mt-2">
              {new Date(contest.scheduled_start_at).toLocaleString(l === "ht" ? "fr" : l, { dateStyle: "short", timeStyle: "short" })}
            </p>
          )}
        </div>

        {/* ── Live waiting indicator ────────────────────────────────────── */}
        <div className="w-full flex flex-col items-center gap-5"
          style={{ animation: "kp-fade-in .5s .3s ease both" }}>

          {/* Participant count */}
          {participantCount !== null && (
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-full px-4 py-2">
              <div className="flex gap-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full"
                    style={{ background: i < Math.min(participantCount, 5) ? "#4ade80" : "rgba(255,255,255,0.1)" }} />
                ))}
              </div>
              <span className="text-white/50 text-xs font-bold">
                {participantCount} {tl({ fr: "participant" + (participantCount > 1 ? "s" : "") + " connecté" + (participantCount > 1 ? "s" : ""), ht: "patisipan konekte", en: "connected participant" + (participantCount > 1 ? "s" : "") }, l)}
              </span>
            </div>
          )}

          {/* Rotating status message — cycles forever, NEVER bloque */}
          <div className="text-center min-h-[40px] flex flex-col items-center justify-center">
            <p className="text-white/65 text-sm font-medium"
              style={{
                animation: msgVisible ? "kp-msg-in .35s ease both" : "kp-msg-out .35s ease both",
                transition: "opacity .35s",
              }}>
              {msgs[msgIdx]}
            </p>
          </div>

          {/* 3 pulsing dots — signe visuel que c'est vivant */}
          <div className="flex items-center gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background: dotPhase === i ? "#c5a84f" : "rgba(255,255,255,0.15)",
                  transform: dotPhase === i ? "scale(1.4)" : "scale(1)",
                  boxShadow: dotPhase === i ? "0 0 8px rgba(197,168,79,0.6)" : "none",
                }} />
            ))}
          </div>

          {/* Static info text */}
          <p className="text-white/20 text-[11px] text-center leading-relaxed max-w-[260px]">
            {tl({
              fr: "Le championnat démarrera automatiquement.\nAucun clic nécessaire.",
              ht: "Chanpyona a ap kòmanse otomatikman.\nPa bezwen klike.",
              en: "The championship will start automatically.\nNo click needed.",
              es: "El campeonato comenzará automáticamente.\nNo se necesita clic.",
            }, l)}
          </p>
        </div>

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <Link href={`/concours/${id}`}
          className="text-white/15 text-xs font-bold hover:text-white/40 transition-colors mt-2"
          style={{ animation: "kp-fade-in .5s .5s ease both" }}>
          ← {tl({ fr: "Revenir au concours", ht: "Tounen nan konkou a", en: "Back to contest", es: "Volver al concurso" }, l)}
        </Link>
      </div>
    </div>
  );
}
