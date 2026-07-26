"use client";

// MODE DIFFUSION TV — page plein écran, sans menu ni bouton, qui se met à jour toute seule.
// Conçue pour être capturée par OBS et diffusée en direct (Facebook Live, YouTube…).
// Optimisée 1920×1080.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChampionSparkles } from "@/lib/championship-premium";
import { subsetForSeed, waveKeyOf, flattenForBroadcast, type SubRound } from "@/lib/champ-subset";
import { clockState } from "@/lib/champ-sync";
import { AnimatedNumber, LiveParticles, FloatingReactions, ConfettiBurst, StadiumBackground, PresenterAvatar, AdBreak, FitToScreen, ChampionPlaque, BROADCAST_CSS } from "@/lib/broadcast-fx";
import { playChime } from "@/lib/sound";
import {
  startBroadcastMusic, startQuestionMusic, startPodiumMusic, startLobbyMusic,
  stopMusic, playCountdownRiser, playChampionshipIntro, playRoundResults,
  resumeAudio, preloadMatchAudio,
} from "@/lib/championship-audio";

const GOLD = "#e6b83c";
const short = (n: string) => n.replace(/^Équipe\s+/i, "");

const VERSES = [
  { t: "Ta parole est une lampe à mes pieds, une lumière sur mon sentier.", r: "Psaume 119:105" },
  { t: "Je puis tout par celui qui me fortifie.", r: "Philippiens 4:13" },
  { t: "Cherchez premièrement le royaume de Dieu et sa justice.", r: "Matthieu 6:33" },
  { t: "L'Éternel est mon berger, je ne manquerai de rien.", r: "Psaume 23:1" },
];

interface Team { id: string; name: string; color: string; logo_seed: string; group_label: string; points: number; won: number; drawn: number; lost: number; score_for: number; score_against: number; final_rank: number | null; eliminated?: boolean }
interface Match { id: string; stage: string; team_a: string; team_b: string; score_a: number | null; score_b: number | null; winner: string | null; status: string; started_at: string | null; round_number: number | null; human_done: number | null; human_total: number | null }
interface Detail { season: { id: string; name: string; status: string }; groups: Record<string, Team[]>; matches: Match[] }

export default function DiffusionPage() {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  // Mode léger (?light=1) : coupe les effets lourds (flou d'aurore) pour un encodage OBS 100% fluide.
  const [light, setLight] = useState(false);
  // Réglages du bandeau (sponsors, message perso, versets) — via l'URL ou enregistrés dans l'admin (localStorage).
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [tickerMsg, setTickerMsg] = useState("");
  const [showVerses, setShowVerses] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("light") === "1") setLight(true);
    const ls = (k: string) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
    const sp = p.get("sponsors") || ls("champ-sponsors");
    if (sp) setSponsors(sp.split(",").map(s => s.trim()).filter(Boolean));
    const msg = p.get("msg") || ls("champ-ticker-msg");
    if (msg) setTickerMsg(msg);
    const v = p.get("verses") || ls("champ-ticker-verses");
    if (v === "0") setShowVerses(false);
  }, []);

  // Manches du concours (réservé admin) — on en extrait le sous-ensemble de la JOURNÉE en cours.
  const [rounds, setRounds] = useState<SubRound[]>([]);
  // Decalage horloge locale -> horloge serveur (comme le fait l'ecran joueur).
  const serverOffsetRef = useRef(0);
  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | null = null;
    fetch("/api/championship").then(r => r.json()).then(d => {
      const s = (d.seasons ?? [])[0];
      if (!s) return;
      const refresh = () => fetch(`/api/championship/${s.id}`).then(r => r.json()).then((d) => {
        // Ecart entre l'horloge du televiseur et celle du serveur.
        if (d?.server_now) serverOffsetRef.current = new Date(d.server_now).getTime() - Date.now();
        setDetail(d);
      }).catch(() => {});
      refresh();
      iv = setInterval(refresh, 3000);
      fetch(`/api/admin/championship/${s.id}/quiz`).then(r => r.ok ? r.json() : { rounds: [] }).then(q => setRounds(q.rounds ?? [])).catch(() => {});
    }).catch(() => {});
    return () => { if (iv) clearInterval(iv); };
  }, []);
  useEffect(() => { const iv = setInterval(() => setNowMs(Date.now()), 1000); return () => clearInterval(iv); }, []);

  // Fil d'activité en direct + confettis + son — dérivés des VRAIS changements d'état.
  const [feed, setFeed] = useState<{ id: number; icon: string; text: string }[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [muted, setMuted] = useState(false);
  // Répartition A/B/C/D + MVP en direct (depuis champ_answers).
  const [liveStats, setLiveStats] = useState<{ distribution: number[]; answered: number; mvp: { name: string; correct: number } | null; rosters?: { a: { name: string; answered: boolean; correct: number }[]; b: { name: string; answered: boolean; correct: number }[] }; live_score_a?: number; live_score_b?: number }>({ distribution: [], answered: 0, mvp: null });
  const statsRef = useRef({ seasonId: "", matchId: "", qIndex: 0 });
  useEffect(() => {
    const iv = setInterval(() => {
      const { seasonId, matchId, qIndex } = statsRef.current;
      if (!seasonId || !matchId) { setLiveStats({ distribution: [], answered: 0, mvp: null }); return; }
      fetch(`/api/admin/championship/${seasonId}/live-stats?match=${matchId}&q=${qIndex}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveStats(d); }).catch(() => {});
    }, 2000);
    return () => clearInterval(iv);
  }, []);
  const mutedRef = useRef(muted); mutedRef.current = muted;
  const feedIdRef = useRef(0);
  const prevRef = useRef<{ leader?: string; doneIds: Set<string>; champion?: string; elim: Set<string>; init: boolean }>({ doneIds: new Set(), elim: new Set(), init: false });
  useEffect(() => {
    if (!detail) return;
    const allT = Object.values(detail.groups).flat();
    const nm: Record<string, string> = {}; for (const t of allT) nm[t.id] = t.name.replace(/^Équipe\s+/i, "");
    const sorted = [...allT].sort((a, b) => b.points - a.points || (b.score_for - b.score_against) - (a.score_for - a.score_against));
    const leader = sorted[0];
    const champ = allT.find(t => t.final_rank === 1);
    const prev = prevRef.current;
    const push = (icon: string, text: string) => setFeed(f => [{ id: ++feedIdRef.current, icon, text }, ...f].slice(0, 8));
    const fire = () => { setConfettiKey(k => k + 1); if (!mutedRef.current) playChime(); };

    if (prev.init) {
      if (leader && prev.leader && leader.id !== prev.leader) push("🔥", `${nm[leader.id]} prend la première place !`);
      for (const m of detail.matches) {
        if (m.status === "done" && !prev.doneIds.has(m.id)) {
          const w = m.winner ? nm[m.winner] : null;
          if (w) { push(m.stage === "group" ? "🏁" : "🏆", m.stage === "group" ? `${w} gagne son match !` : `${w} se qualifie !`); if (m.stage !== "group") fire(); }
        }
      }
      for (const t of allT) if (t.eliminated && !prev.elim.has(t.id)) {
        push("❌", `${nm[t.id]} est éliminée.`);
        // …et on la met dans la file d'annonces plein écran (une seule fois).
        if (!elimSeen.current.has(t.id)) {
          elimSeen.current.add(t.id);
          setElimQueue((q) => [...q, { name: short(t.name), color: t.color, seed: t.logo_seed }]);
        }
      }
      if (champ && champ.id !== prev.champion) { push("👑", `${nm[champ.id]} est CHAMPION BIBLIQUE !`); fire(); }
    }
    prevRef.current = {
      leader: leader?.id, champion: champ?.id, init: true,
      doneIds: new Set(detail.matches.filter(m => m.status === "done").map(m => m.id)),
      elim: new Set(allT.filter(t => t.eliminated).map(t => t.id)),
    };
  }, [detail]);

  // ANNONCE D'ÉLIMINATION plein écran : dès qu'une équipe est éliminée, tous les
  // téléspectateurs la voient s'afficher en grand, une équipe après l'autre.
  const [elimQueue, setElimQueue] = useState<{ name: string; color: string; seed: string }[]>([]);
  const elimSeen = useRef<Set<string>>(new Set());
  const elimShown = elimQueue[0] ?? null;
  // Durée d'affichage calée sur le temps restant avant le prochain coup d'envoi :
  // toutes les équipes éliminées ont fini de défiler AVANT que le match suivant
  // ne commence. Jamais moins de 2,5 s, jamais plus de 6,5 s.
  const elimHoldRef = useRef(6500);
  useEffect(() => {
    if (!elimShown) return;
    const t = setTimeout(() => setElimQueue((q) => q.slice(1)), elimHoldRef.current);
    return () => clearTimeout(t);
  }, [elimShown]);

  // FIN DU CHAMPIONNAT : après 15 s de célébration, l'écran retourne à l'accueil.
  const [homeIn, setHomeIn] = useState(15);
  const finishedNow = detail?.season.status === "finished";
  useEffect(() => {
    if (!finishedNow) { setHomeIn(15); return; }
    const iv = setInterval(() => {
      setHomeIn((n) => {
        if (n <= 1) { clearInterval(iv); window.location.href = "/"; return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [finishedNow]);

  // BANDE-SON DE LA DIFFUSION — elle suit ce qui se passe à l'antenne, pour
  // donner envie de rester : groove de plateau à l'attente, boucle de questions
  // pendant le jeu, hymne de couronnement pour le champion.
  const audioArmed = useRef(false);
  useEffect(() => {
    // Les navigateurs bloquent le son tant que rien n'a été touché : on tente,
    // et le bouton 🔊 sert de déblocage explicite si besoin.
    resumeAudio(); preloadMatchAudio(); audioArmed.current = true;
  }, []);
  useEffect(() => () => { stopMusic(1); }, []);

  const LETTERS = ["A", "B", "C", "D", "E", "F"];

  const tmap: Record<string, Team> = {};
  if (detail) for (const ts of Object.values(detail.groups)) for (const t of ts) tmap[t.id] = t;

  const finished = detail?.season.status === "finished";
  const champion = detail ? Object.values(tmap).find(t => t.final_rank === 1) : undefined;
  const live = (detail?.matches ?? []).filter(m => m.status === "live");
  // DIAPORAMA : le match vedette change toutes les 12 s, pour que TOUTES les
  // équipes qui jouent passent à l'antenne (et pas seulement la première).
  const FEAT_MS = 12000;
  const featIdx = live.length ? Math.floor(nowMs / FEAT_MS) % live.length : 0;
  const feat = live[featIdx];
  const onDeck = (detail?.matches ?? []).filter(m => m.status === "scheduled" && m.started_at && new Date(m.started_at).getTime() > nowMs + serverOffsetRef.current);
  const kickoffSecs = onDeck.length ? Math.max(0, Math.ceil((Math.min(...onDeck.map(m => new Date(m.started_at!).getTime())) - (nowMs + serverOffsetRef.current)) / 1000)) : 0;
  const kickoffAtKey = onDeck.length ? String(Math.min(...onDeck.map(m => new Date(m.started_at!).getTime()))) : "";
  // Répartit le temps disponible entre toutes les annonces en attente.
  if (elimQueue.length > 0) {
    const budget = kickoffSecs > 3 ? (kickoffSecs - 2) * 1000 : 6500;
    elimHoldRef.current = Math.max(2500, Math.min(6500, Math.floor(budget / elimQueue.length)));
  }
  const stageLabel = (m: Match) => m.stage === "group" ? `Journée ${m.round_number ?? ""} — Poules` : m.stage === "quarter" ? "Quarts de finale" : m.stage === "semi" ? "Demi-finales" : m.stage === "final" ? "🏆 FINALE" : "Petite finale";

  // Questions « jeu télé » = EXACTEMENT le sous-ensemble de la journée en cours (identique aux joueurs).
  const liveWaveKey = live[0] ? waveKeyOf(live[0].stage, live[0].round_number) : "";
  // Même graine que les joueurs : saison + journée. La diffusion montre donc
  // exactement la question que toutes les équipes ont sous les yeux.
  const quiz = feat && rounds.length && detail
    ? flattenForBroadcast(subsetForSeed(rounds, `${detail.season.id}:${waveKeyOf(feat.stage, feat.round_number)}`))
    : [];
  // SYNCHRONISÉ : même horloge que les joueurs (départ de la journée) → même question au même moment.
  // SYNCHRONISATION AVEC LES JOUEURS : l'horloge doit venir du MÊME match que
  // les questions affichées (le match vedette), sinon l'écran de diffusion
  // montre la question n°X d'un match et le chrono d'un autre.
  const startedAtMs = feat?.started_at ? new Date(feat.started_at).getTime() : 0;
  const sync = clockState(startedAtMs, nowMs + serverOffsetRef.current, quiz.length);
  const qIndex = Math.min(sync.index, Math.max(0, quiz.length - 1));
  const qReveal = sync.phase === "reveal";
  const qSecLeft = sync.secLeft;
  const curQ = sync.over || sync.phase === "pre" ? undefined : quiz[sync.index];

  // VERSET DE LA QUESTION — la question ne stocke qu'une référence (« Luc 2:4-7 ») :
  // on va chercher le texte réel pour l'afficher à l'antenne à la révélation.
  const [verseText, setVerseText] = useState<Record<string, string>>({});
  const verseRef = curQ?.ref ?? "";
  useEffect(() => {
    if (!verseRef || verseText[verseRef] !== undefined) return;
    fetch(`/api/bible/verse?ref=${encodeURIComponent(verseRef)}&lang=fr`)
      .then((r) => r.json())
      .then((d) => setVerseText((m) => ({ ...m, [verseRef]: d.text ?? "" })))
      .catch(() => setVerseText((m) => ({ ...m, [verseRef]: "" })));
  }, [verseRef, verseText]);


  // Scores EN DIRECT du match vedette (vrais joueurs + IA simulées, montent question par question).
  // Le match vedette tourne toutes les 12 s : sans ce controle, on affichait
  // pendant un instant les scores du match PRECEDENT sur le nouveau match —
  // d'ou des points qui montaient puis redescendaient.
  const statsMatch = (liveStats as { match_id?: string }).match_id;
  const statsFresh = !!feat && statsMatch === feat.id;
  const featScoreA = statsFresh ? (liveStats.live_score_a ?? 0) : Math.round(feat?.score_a ?? 0);
  const featScoreB = statsFresh ? (liveStats.live_score_b ?? 0) : Math.round(feat?.score_b ?? 0);
  // 🎯 Probabilité de victoire en direct (évolue avec le score + les questions restantes).
  let probA = 50;
  if (feat) {
    const remaining = Math.max(0, quiz.length - qIndex);
    const swing = Math.max(1, remaining) * 130 + 40; // moins de questions restantes → plus décisif
    probA = Math.min(97, Math.max(3, Math.round((0.5 + 0.5 * Math.tanh((featScoreA - featScoreB) / swing)) * 100)));
  }
  statsRef.current = { seasonId: detail?.season.id ?? "", matchId: feat?.id ?? "", qIndex };

  // Classement en direct + stats pour enrichir la page spectateur.
  const allTeams = Object.values(tmap).sort((a, b) => b.points - a.points || (b.score_for - b.score_against) - (a.score_for - a.score_against) || b.won - a.won);
  const topTeams = allTeams.slice(0, 6);
  const aliveCount = allTeams.filter(t => !t.eliminated).length;
  const doneNow = live.reduce((s, m) => s + (m.human_done ?? 0), 0);
  const totalNow = live.reduce((s, m) => s + (m.human_total ?? 0), 0);
  const doneMatches = (detail?.matches ?? []).filter(m => m.status === "done").length;
  const totalQuestions = rounds.reduce((s, r) => s + (r.questions?.length ?? 0), 0);

  // Commentateur automatique (règles) — change toutes les ~22 s selon l'état réel.
  const cLines: string[] = [];
  if (live[0]) {
    const close = [...live].sort((x, y) => Math.abs((x.score_a ?? 0) - (x.score_b ?? 0)) - Math.abs((y.score_a ?? 0) - (y.score_b ?? 0)))[0];
    const ca = tmap[close.team_a], cb = tmap[close.team_b];
    if (ca && cb) {
      const diff = Math.abs((close.score_a ?? 0) - (close.score_b ?? 0));
      if (diff <= 1) cLines.push(`🎙️ Quel match serré entre ${short(ca.name)} et ${short(cb.name)} !`);
      else { const lead = (close.score_a ?? 0) > (close.score_b ?? 0) ? ca : cb; cLines.push(`🎙️ ${short(lead.name)} prend l'avantage !`); }
    }
  }
  if (topTeams[0]) cLines.push(`🎙️ ${short(topTeams[0].name)} domine le classement avec ${topTeams[0].points} points !`);
  cLines.push("🎙️ Les prochaines questions seront décisives…", "🎙️ Quelle ambiance dans ce Championnat Biblique !", "🎙️ Chaque bonne réponse peut tout changer !", "🎙️ Restez avec nous, ça se joue à rien !");
  const commentary = cLines[Math.floor(nowMs / 22000) % cLines.length];

  // Suspense + présentateur virtuel + pub périodique + info header.
  const inQuestion = live.length > 0 && quiz.length > 0 && !sync.over && sync.phase !== "pre";
  const waitingNext = live.length > 0 && quiz.length > 0 && sync.over; // manche finie, on attend la suite
  const urgent = inQuestion && !qReveal && qSecLeft <= 5;
  let presenterLine = "Bienvenue au Championnat Biblique KONEKSYON PAM ! 🏆";
  if (finished && champion) presenterLine = `🎉 Félicitations à ${short(champion.name)}, champion biblique !`;
  else if (urgent) presenterLine = `⏱ Plus que ${qSecLeft} seconde${qSecLeft > 1 ? "s" : ""} !`;
  else if (inQuestion && qReveal && curQ) presenterLine = `✅ La bonne réponse était ${LETTERS[curQ.correct]} !`;
  else if (feed[0]) presenterLine = feed[0].text;
  else if (live.length > 0) presenterLine = commentary.replace("🎙️ ", "");
  else if (onDeck.length > 0) presenterLine = `La prochaine journée commence dans ${kickoffSecs} secondes…`;
  const adOn = !!detail && Math.floor(nowMs / 1000) % 150 < 3;

  // Choix de la piste selon la scène à l'antenne. `muted` coupe tout.
  const scene = finished ? "podium" : inQuestion ? "question" : onDeck.length > 0 ? "countdown" : live.length > 0 ? "lobby" : "idle";
  useEffect(() => {
    if (muted) { stopMusic(1); return; }
    if (scene === "podium") startPodiumMusic();
    else if (scene === "question") startQuestionMusic(0);
    else if (scene === "lobby") startLobbyMusic();
    else startBroadcastMusic();   // attente / hors match : groove de plateau
  }, [scene, muted]);

  // Bruitages de plateau : montée du compte à rebours, fanfare d'ouverture,
  // jingle de classement — une seule fois par événement.
  const fxDone = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (muted) return;
    if (onDeck.length > 0 && kickoffSecs <= 12 && kickoffSecs > 0 && !fxDone.current[`k${kickoffAtKey}`]) {
      fxDone.current[`k${kickoffAtKey}`] = true;
      playCountdownRiser();
    }
    if (live.length > 0 && !fxDone.current[`i${liveWaveKey}`]) {
      fxDone.current[`i${liveWaveKey}`] = true;
      playChampionshipIntro();
    }
    if (waitingNext && !fxDone.current[`r${liveWaveKey}`]) {
      fxDone.current[`r${liveWaveKey}`] = true;
      playRoundResults();
    }
  }, [muted, kickoffSecs, onDeck.length, live.length, liveWaveKey, waitingNext, kickoffAtKey]);

  // 🧠 Analyse IA du match — change toutes les 30 s.
  const aLines: string[] = [];
  if (live[0]) {
    const a = tmap[live[0].team_a], b = tmap[live[0].team_b];
    if (a && b) {
      const sa = Math.round(live[0].score_a ?? 0), sb = Math.round(live[0].score_b ?? 0);
      const diff = Math.abs(sa - sb), lead = sa >= sb ? a : b, other = sa >= sb ? b : a;
      if (diff === 0) aLines.push(`🧠 Analyse : ${short(a.name)} et ${short(b.name)} sont au coude à coude.`);
      else if (diff <= 2) aLines.push(`🧠 Analyse : ${short(lead.name)} mène, mais ${short(other.name)} reste au contact.`);
      else aLines.push(`🧠 Analyse : ${short(lead.name)} prend le large sur ${short(other.name)}.`);
      aLines.push("🧠 Analyse : cette prochaine question pourrait tout changer.", `🧠 Analyse : la précision fait la différence à ce niveau.`);
    }
  }
  if (aLines.length === 0) aLines.push("🧠 Analyse : le championnat monte en intensité…");
  const analysis = aLines[Math.floor(nowMs / 30000) % aLines.length];
  const headerStage = finished ? "🏆 Cérémonie de clôture" : live[0] ? `📍 ${stageLabel(live[0])}` : onDeck.length > 0 ? "⏳ Prochaine journée" : "En attente";
  const seasonNum = (detail?.season.name.match(/(\d+)/)?.[1]) ?? "1";
  const pill = (border?: string): CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.06)", border: `1px solid ${border ?? GOLD + "44"}`, borderRadius: 999, padding: "8px 16px", fontWeight: 800, fontSize: "clamp(11px,1.1vw,16px)", color: "#fff" });

  const Logo = ({ t, size = 64 }: { t: Team; size?: number }) => (
    <span style={{ width: size, height: size, borderRadius: size * 0.28, background: t.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: size * 0.4, boxShadow: `0 8px 24px ${t.color}66`, flexShrink: 0 }}>{t.logo_seed}</span>
  );

  const stageMatches = (st: string) => (detail?.matches ?? []).filter(m => m.stage === st);

  // Bandeau défilant (message perso + verset + équipes + sponsors) — rendu « télé ».
  const teamNames = detail ? Object.values(detail.groups).flat().map(t => short(t.name)) : [];
  const tickerBits = ["🏆 CHAMPIONNAT BIBLIQUE — EN DIRECT sur KONEKSYON PAM"];
  if (tickerMsg.trim()) tickerBits.push(tickerMsg.trim());
  if (showVerses) tickerBits.push(VERSES.map(v => `📖 « ${v.t} » — ${v.r}`).join("       ✦       "));
  if (teamNames.length) tickerBits.push(`🛡️ Équipes en lice : ${teamNames.join("   •   ")}`);
  if (sponsors.length) tickerBits.push(`🤝 Nos partenaires : ${sponsors.join("   •   ")}`);
  const tickerText = tickerBits.join("       ✦       ") + "       ✦       ";
  const tickerDur = Math.max(35, Math.round(tickerText.length * 0.13));

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "radial-gradient(ellipse 100% 60% at 50% 0%, #16264d 0%, #0a1330 55%, #05070f 100%)", color: "#fff", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes diff-live{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes diff-ring{0%{transform:scale(.9);opacity:.6}50%{transform:scale(1.05);opacity:1}100%{transform:scale(.9);opacity:.6}}
        @keyframes diff-in{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes diff-aurora{0%,100%{transform:translate(-20%,-10%) rotate(0)}50%{transform:translate(15%,8%) rotate(180deg)}}
        @keyframes diff-ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes diff-spin{to{transform:rotate(360deg)}}
        @keyframes diff-dots{0%,20%{opacity:0}50%{opacity:1}100%{opacity:0}}
      ` + BROADCAST_CSS}</style>
      {/* Fond de STADE immersif (dégradé simple en mode léger pour un encodage fluide) */}
      {light
        ? <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, #16264d 0%, #0a1330 55%, #05070f 100%)" }} />
        : <StadiumBackground accent={GOLD} />}
      {!light && <LiveParticles accent={GOLD} />}
      {!light && <FloatingReactions />}
      <ConfettiBurst fireKey={confettiKey} />
      {detail && <PresenterAvatar line={presenterLine} urgent={urgent} />}
      {adOn && <AdBreak />}
      {/* Bouton son (muet / actif) */}
      <button onClick={() => { resumeAudio(); setMuted(m => !m); }} style={{ position: "fixed", top: "clamp(14px,2vw,26px)", left: "clamp(14px,2vw,26px)", zIndex: 20, width: 44, height: 44, borderRadius: "50%", border: `1px solid ${GOLD}44`, background: "rgba(2,7,23,0.6)", color: "#fff", fontSize: 18, cursor: "pointer", backdropFilter: "blur(6px)" }} title={muted ? "Activer le son" : "Couper le son"}>{muted ? "🔇" : "🔊"}</button>

      {/* 🔥 MVP du match (côté droit) */}
      {liveStats.mvp && live.length > 0 && (
        <div style={{ position: "fixed", right: "clamp(10px,1.5vw,26px)", top: "clamp(84px,12vh,150px)", zIndex: 6, width: "clamp(160px,14vw,230px)", background: `linear-gradient(135deg,rgba(230,184,60,0.16),rgba(2,7,23,0.72))`, border: `1px solid ${GOLD}55`, borderRadius: 16, padding: "12px 14px", backdropFilter: "blur(6px)", animation: "diff-in .5s ease both" }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: GOLD, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>🔥 MVP du match</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},#a97d18)`, color: "#1a1203", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>{(liveStats.mvp.name[0] || "?").toUpperCase()}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: "clamp(13px,1.2vw,17px)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{liveStats.mvp.name}</div>
              <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 800 }}>✅ {liveStats.mvp.correct} bonnes réponses</div>
            </div>
          </div>
        </div>
      )}

      {/* Fil d'activité en direct */}
      {feed.length > 0 && (
        <div style={{ position: "fixed", left: "clamp(10px,1.5vw,26px)", bottom: "clamp(66px,8vw,102px)", zIndex: 6, width: "clamp(180px,15vw,250px)", display: "grid", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: GOLD, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", animation: "bfx-glow 1.2s ease-in-out infinite" }} /> Activité en direct</div>
          {feed.slice(0, 5).map(f => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(2,7,23,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 12px", animation: "bfx-feed-in .4s ease both", backdropFilter: "blur(6px)" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{f.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toute la retransmission tient dans l'écran : FitToScreen réduit le
          contenu au besoin, donc plus rien n'est coupé et on ne scrolle jamais. */}
      <div style={{ position: "relative", zIndex: 2, flex: 1, minHeight: 0, paddingBottom: "clamp(46px,5vw,70px)" }}>
      <FitToScreen>
      <div style={{ position: "relative", padding: "clamp(12px,1.6vw,26px) clamp(16px,2.4vw,40px) 0", animation: light ? undefined : "bfx-camera 46s ease-in-out infinite", willChange: "transform" }}>
        {/* GRAND EN-TÊTE DE RETRANSMISSION */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,1.5vw,22px)", flexWrap: "wrap", marginBottom: "clamp(14px,2vw,28px)" }}>
          <span style={{ fontSize: "clamp(34px,4vw,62px)", display: "inline-block", animation: "bfx-trophy3d 6s linear infinite", filter: "drop-shadow(0 4px 14px rgba(230,184,60,0.5))" }}>🏆</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "clamp(21px,3vw,46px)", fontWeight: 900, lineHeight: 1, letterSpacing: "0.01em", background: "linear-gradient(135deg,#fff 30%,#e6b83c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CHAMPIONNAT BIBLIQUE MONDIAL</div>
            <div style={{ fontSize: "clamp(11px,1.2vw,17px)", color: "rgba(255,255,255,0.6)", fontWeight: 800, marginTop: 5, display: "flex", gap: "clamp(8px,1.2vw,18px)", flexWrap: "wrap" }}>
              <span>🏆 SAISON {seasonNum}</span><span>🌍 Mondial</span><span style={{ color: GOLD }}>{headerStage}</span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "clamp(6px,0.8vw,12px)", flexWrap: "wrap" }}>
            {inQuestion && <span style={pill()}>📖 Question <b style={{ color: GOLD }}>{qIndex + 1}</b>/{quiz.length}</span>}
            {inQuestion && <span style={pill(urgent ? "#f87171" : undefined)}>⏱ <b style={{ color: urgent ? "#f87171" : "#fff", fontVariantNumeric: "tabular-nums" }}>{qSecLeft}s</b></span>}
            {totalNow > 0 && <span style={pill()}>👤 <b>{totalNow}</b> <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>joueurs</span></span>}
            {detail && <span style={pill()}>🛡️ <b>{aliveCount}</b> <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>équipes</span></span>}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(220,38,38,0.18)", border: "1px solid rgba(248,113,113,0.55)", borderRadius: 999, padding: "8px 18px" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#f87171", boxShadow: "0 0 14px #f87171", animation: "diff-live 1s ease-in-out infinite" }} />
              <span style={{ fontWeight: 900, letterSpacing: "0.14em", fontSize: "clamp(12px,1.2vw,18px)", color: "#fecaca" }}>LIVE</span>
            </span>
          </div>
        </div>

        {/* COMMENTATEUR + COMPTEURS ANIMÉS */}
        {detail && (
          <div style={{ marginBottom: "clamp(14px,2vw,28px)" }}>
            <div style={{ textAlign: "center", fontSize: "clamp(14px,1.6vw,24px)", fontWeight: 800, color: "#fff", minHeight: "1.4em", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>{commentary}</div>
            {live.length > 0 && <div key={analysis} style={{ textAlign: "center", marginTop: 6, fontSize: "clamp(11px,1.2vw,16px)", fontWeight: 700, color: "#93c5fd", animation: "diff-in .5s ease both" }}>{analysis}</div>}
            {/* Compteurs masqués pendant une question : information statique,
                elle vole la place du contenu qui compte vraiment. */}
            {!inQuestion && <div style={{ display: "flex", gap: "clamp(8px,1.2vw,18px)", flexWrap: "wrap", justifyContent: "center", marginTop: "clamp(10px,1.4vw,18px)" }}>
              {[
                { icon: "🛡️", label: "Équipes", value: allTeams.length, color: GOLD },
                { icon: "🏆", label: "Matchs joués", value: doneMatches, color: "#4ade80" },
                { icon: "📖", label: "Questions", value: totalQuestions, color: "#60a5fa" },
                { icon: "👤", label: "Joueurs en jeu", value: totalNow, color: "#f472b6" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "clamp(8px,1vw,12px) clamp(14px,1.6vw,22px)" }}>
                  <span style={{ fontSize: "clamp(18px,1.8vw,26px)" }}>{s.icon}</span>
                  <div style={{ lineHeight: 1.1 }}>
                    <div style={{ fontSize: "clamp(18px,2.1vw,32px)", fontWeight: 900, color: s.color, fontVariantNumeric: "tabular-nums" }}><AnimatedNumber value={s.value} /></div>
                    <div style={{ fontSize: "clamp(9px,0.9vw,12px)", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        )}

        {/* ZONE PRINCIPALE */}
        {finished && champion ? (
          <div style={{ position: "relative", textAlign: "center", padding: "clamp(16px,3vw,50px) 20px", animation: "diff-in .8s ease both" }}>
            {!light && <ChampionSparkles accent={GOLD} embedded />}
            <div style={{ position: "relative", zIndex: 3 }}>
              {/* PLAQUE D'HONNEUR gravee au nom du champion */}
              <ChampionPlaque
                teamName={short(champion.name)}
                logoSeed={champion.logo_seed}
                color={champion.color}
                season={seasonNum}
                light={light}
              />
              <div style={{ marginTop: 14, fontSize: "clamp(11px,1.2vw,17px)", fontWeight: 800, color: "rgba(255,255,255,0.55)" }}>
                Retour à l&apos;accueil dans {homeIn}s…
              </div>
            </div>
          </div>
        ) : live.length > 0 ? (
          <div>
            <div style={{ fontSize: "clamp(11px,1.2vw,18px)", fontWeight: 900, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", marginBottom: "clamp(12px,1.6vw,22px)", textAlign: "center" }}>{feat && stageLabel(feat)}</div>

            {/* SCOREBOARD GÉANT façon FIFA (match vedette) */}
            {(() => {
              const m = feat; if (!m) return null;
              const a = tmap[m.team_a], b = tmap[m.team_b]; if (!a || !b) return null;
              const sub = (t: Team) => <div style={{ fontSize: "clamp(10px,1vw,15px)", color: "rgba(255,255,255,0.55)", fontWeight: 700, marginTop: 5 }}>{t.points} pts · {t.won}V {t.drawn}N {t.lost}D</div>;
              return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(10px,2vw,40px)", marginBottom: "clamp(18px,2.2vw,30px)" }}>
                  <div style={{ flex: 1, maxWidth: 400, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "clamp(8px,1.4vw,18px)" }}>
                    <div style={{ textAlign: "right", minWidth: 0 }}>
                      <div style={{ fontSize: "clamp(19px,3vw,44px)", fontWeight: 900, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{short(a.name).toUpperCase()}</div>
                      {sub(a)}
                    </div>
                    <Logo t={a} size={84} />
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: "clamp(54px,10.5vw,172px)", fontWeight: 900, color: GOLD, lineHeight: 1, display: "flex", alignItems: "center", gap: "clamp(6px,1.2vw,22px)", textShadow: "0 6px 40px rgba(230,184,60,0.5)" }}>
                      <AnimatedNumber value={featScoreA} /><span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.5em" }}>-</span><AnimatedNumber value={featScoreB} />
                    </div>
                    <div style={{ marginTop: 8, fontSize: "clamp(10px,1vw,14px)", fontWeight: 900, color: "#f87171", letterSpacing: "0.2em" }}>● LIVE</div>
                  </div>
                  <div style={{ flex: 1, maxWidth: 400, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "clamp(8px,1.4vw,18px)" }}>
                    <Logo t={b} size={84} />
                    <div style={{ textAlign: "left", minWidth: 0 }}>
                      <div style={{ fontSize: "clamp(19px,3vw,44px)", fontWeight: 900, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{short(b.name).toUpperCase()}</div>
                      {sub(b)}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 🎯 Probabilité de victoire en direct */}
            {!inQuestion && feat && tmap[feat.team_a] && tmap[feat.team_b] && (() => {
              const a = tmap[feat.team_a], b = tmap[feat.team_b];
              return (
                <div style={{ maxWidth: 720, margin: "0 auto clamp(16px,2vw,26px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "clamp(11px,1.1vw,15px)", fontWeight: 800, marginBottom: 5 }}>
                    <span>🎯 {short(a.name)} <b style={{ color: a.color === "#ffffff" ? GOLD : "#fff" }}>{probA}%</b></span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>Chances de gagner</span>
                    <span><b style={{ color: "#fff" }}>{100 - probA}%</b> {short(b.name)}</span>
                  </div>
                  <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}>
                    <div style={{ width: `${probA}%`, background: a.color, transition: "width .6s cubic-bezier(0.22,1,0.36,1)" }} />
                    <div style={{ width: `${100 - probA}%`, background: b.color, transition: "width .6s cubic-bezier(0.22,1,0.36,1)" }} />
                  </div>
                </div>
              );
            })()}

            {/* TOUS LES MATCHS EN DIRECT — bandeau compact sur UNE seule ligne.
                Version haute (2 rangées + « pts au classement » sur 3 lignes)
                poussait la question hors de l'écran. */}
            {live.length > 0 && (
              <div style={{ maxWidth: 1180, margin: "0 auto clamp(8px,1vw,14px)" }}>
                <div style={{ fontSize: "clamp(8px,0.85vw,11px)", fontWeight: 900, letterSpacing: "0.18em", color: `${GOLD}bb`, textTransform: "uppercase", marginBottom: 5, textAlign: "center" }}>
                  ⚽ {live.length} match{live.length > 1 ? "s" : ""} en direct
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(5px,0.7vw,9px)", justifyContent: "center" }}>
                  {live.map((m, i) => {
                    const a = tmap[m.team_a], b = tmap[m.team_b]; if (!a || !b) return null;
                    const onAir = i === featIdx;
                    const sa = onAir ? featScoreA : Math.round(m.score_a ?? 0);
                    const sb = onAir ? featScoreB : Math.round(m.score_b ?? 0);
                    const chip = (t: Team) => (
                      <span style={{ width: 18, height: 18, borderRadius: 5, background: t.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 8, flexShrink: 0 }}>{t.logo_seed}</span>
                    );
                    return (
                      <div key={m.id} style={{
                        position: "relative", overflow: "hidden",
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: onAir ? `linear-gradient(135deg,${GOLD}26,rgba(255,255,255,0.05))` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${onAir ? GOLD + "aa" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 999, padding: "4px 10px",
                        boxShadow: onAir ? `0 6px 20px ${GOLD}22` : "none",
                        transition: "background .5s ease, border-color .5s ease",
                      }}>
                        {onAir && !light && (
                          <span style={{ position: "absolute", top: 0, bottom: 0, width: "40%", background: `linear-gradient(90deg,transparent,${GOLD}22,transparent)`, animation: "bfx-sweep 3.4s ease-in-out infinite", pointerEvents: "none" }} />
                        )}
                        {chip(a)}
                        <b style={{ fontSize: "clamp(11px,1vw,15px)", color: sa >= sb ? GOLD : "#fff", fontVariantNumeric: "tabular-nums" }}>{sa}</b>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>:</span>
                        <b style={{ fontSize: "clamp(11px,1vw,15px)", color: sb >= sa ? GOLD : "#fff", fontVariantNumeric: "tabular-nums" }}>{sb}</b>
                        {chip(b)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Panneau « jeu télé » : la question défile en grand + révélation de la réponse */}
            {curQ ? (
              <div key={qIndex} style={{ maxWidth: 1120, margin: "0 auto", background: urgent ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.04)", border: `${urgent ? 2 : 1}px solid ${urgent ? "#f8717199" : GOLD + "55"}`, borderRadius: 26, padding: "clamp(20px,3vw,46px)", boxShadow: urgent ? "0 24px 70px rgba(248,113,113,0.25)" : "0 24px 70px rgba(0,0,0,0.45)", animation: `diff-in .5s ease both${urgent ? ", bfx-urgent 1s ease-in-out infinite" : ""}`, transition: "background .3s, border-color .3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "clamp(14px,2vw,26px)" }}>
                  <span style={{ fontSize: "clamp(11px,1.1vw,16px)", fontWeight: 900, letterSpacing: "0.14em", color: GOLD, background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 999, padding: "6px 16px" }}>📖 QUESTION {qIndex + 1}</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, fontSize: "clamp(15px,1.8vw,26px)", fontWeight: 900, color: qReveal ? "#4ade80" : (qSecLeft <= 3 ? "#f87171" : "#fff") }}>
                    {qReveal ? "✅ RÉPONSE" : `⏱ ${qSecLeft}s`}
                  </span>
                </div>
                <h1 style={{ fontSize: "clamp(1.5rem,3.2vw,2.9rem)", fontWeight: 900, lineHeight: 1.25, marginBottom: "clamp(18px,2.4vw,32px)", fontFamily: "'Playfair Display',Georgia,serif" }}>{curQ.prompt}</h1>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "clamp(10px,1.2vw,18px)" }}>
                  {curQ.options.map((opt, i) => {
                    if (!opt || !opt.trim()) return null;
                    const hl = qReveal && i === curQ.correct;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(10px,1.2vw,16px)", padding: "clamp(12px,1.4vw,20px)", borderRadius: 16, background: hl ? "linear-gradient(90deg, rgba(34,197,94,0.38), rgba(34,197,94,0.08))" : "rgba(255,255,255,0.05)", border: hl ? "2px solid #22c55e" : "1px solid rgba(255,255,255,0.1)", transition: "all .35s ease" }}>
                        <span style={{ width: "clamp(34px,3vw,48px)", height: "clamp(34px,3vw,48px)", borderRadius: "50%", background: hl ? "#22c55e" : GOLD, color: "#1a1203", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "clamp(15px,1.6vw,24px)", flexShrink: 0 }}>{LETTERS[i]}</span>
                        <span style={{ fontSize: "clamp(1rem,1.7vw,1.5rem)", fontWeight: 700 }}>{opt}</span>
                        {hl && <span style={{ marginLeft: "auto", fontSize: "clamp(20px,2vw,30px)" }}>✅</span>}
                      </div>
                    );
                  })}
                </div>
                {/* 📊 Répartition des réponses (ralenti) */}
                {qReveal && liveStats.answered > 0 && (
                  <div style={{ marginTop: "clamp(16px,2vw,26px)", display: "grid", gap: 8 }}>
                    <div style={{ fontSize: "clamp(10px,1vw,13px)", fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em", textTransform: "uppercase" }}>📊 {liveStats.answered} réponse{liveStats.answered > 1 ? "s" : ""}</div>
                    {curQ.options.map((opt, i) => {
                      if (!opt?.trim()) return null;
                      const cnt = liveStats.distribution[i] ?? 0;
                      const pct = liveStats.answered ? Math.round((cnt / liveStats.answered) * 100) : 0;
                      const ok = i === curQ.correct;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 26, fontWeight: 900, color: ok ? "#4ade80" : "rgba(255,255,255,0.6)", fontSize: "clamp(12px,1.1vw,16px)" }}>{LETTERS[i]}</span>
                          <div style={{ flex: 1, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: ok ? "linear-gradient(90deg,#22c55e,#4ade80)" : "rgba(255,255,255,0.25)", transition: "width .6s ease", borderRadius: 6 }} />
                          </div>
                          <span style={{ width: 44, textAlign: "right", fontWeight: 800, color: ok ? "#4ade80" : "rgba(255,255,255,0.6)", fontSize: "clamp(11px,1vw,15px)" }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* LE VERSET, en grand, à chaque révélation de réponse */}
                {qReveal && curQ.ref && (
                  <div style={{
                    marginTop: "clamp(12px,1.6vw,22px)",
                    background: `linear-gradient(135deg,${GOLD}1f,rgba(255,255,255,0.03))`,
                    border: `1px solid ${GOLD}55`, borderRadius: 14,
                    padding: "clamp(10px,1.4vw,18px) clamp(14px,1.8vw,24px)",
                    textAlign: "center", animation: "bfx-slide-up .6s ease both",
                  }}>
                    {verseText[curQ.ref] ? (
                      <p style={{ margin: 0, color: "#fff", fontStyle: "italic", fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(14px,1.7vw,26px)", lineHeight: 1.5 }}>
                        « {verseText[curQ.ref]} »
                      </p>
                    ) : null}
                    <p style={{ margin: verseText[curQ.ref] ? "8px 0 0" : 0, color: GOLD, fontWeight: 900, fontSize: "clamp(12px,1.3vw,19px)", letterSpacing: "0.04em" }}>
                      📖 {curQ.ref}
                    </p>
                  </div>
                )}
              </div>
            ) : waitingNext ? (
              <div style={{ textAlign: "center", padding: "clamp(24px,5vw,70px) 20px", animation: "diff-in .5s ease both" }}>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "clamp(100px,13vw,170px)", height: "clamp(100px,13vw,170px)", marginBottom: 22 }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `4px solid ${GOLD}`, borderTopColor: "transparent", animation: "diff-spin 1.1s linear infinite" }} />
                  <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "3px solid rgba(96,165,250,0.5)", borderBottomColor: "transparent", animation: "diff-spin 1.6s linear infinite reverse" }} />
                  <span style={{ fontSize: "clamp(44px,6vw,80px)" }}>🏁</span>
                </div>
                <div style={{ fontSize: "clamp(20px,2.8vw,40px)", fontWeight: 900 }}>MANCHE TERMINÉE</div>
                <div style={{ marginTop: 10, color: "rgba(255,255,255,0.6)", fontSize: "clamp(13px,1.5vw,22px)", fontWeight: 700 }}>
                  On attend les derniers joueurs
                  <span style={{ animation: "diff-dots 1.4s infinite" }}>.</span><span style={{ animation: "diff-dots 1.4s .2s infinite" }}>.</span><span style={{ animation: "diff-dots 1.4s .4s infinite" }}>.</span>
                </div>
                <div style={{ marginTop: 6, color: GOLD, fontSize: "clamp(12px,1.3vw,18px)", fontWeight: 800 }}>🏆 Prochaine journée dans un instant</div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: "clamp(14px,1.6vw,22px)", padding: "clamp(20px,4vw,60px)" }}>Les équipes jouent en direct… 🎮</div>
            )}

            {/* Classement en direct — masqué pendant une question : la question
                est ce que les spectateurs doivent voir en priorité, et ce bloc
                est le plus haut de la page. */}
            {!inQuestion && topTeams.length > 0 && (
              <div style={{ maxWidth: 1120, margin: "clamp(18px,2.4vw,32px) auto 0" }}>
                <div style={{ fontSize: "clamp(10px,1vw,14px)", fontWeight: 900, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>🏆 Classement en direct</div>
                <div style={{ display: "flex", gap: "clamp(8px,1vw,12px)", flexWrap: "wrap", justifyContent: "center" }}>
                  {topTeams.map((t, i) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: i === 0 ? `${GOLD}18` : "rgba(255,255,255,0.04)", border: `1px solid ${i === 0 ? GOLD + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "clamp(7px,0.9vw,11px) clamp(12px,1.3vw,18px)", opacity: t.eliminated ? 0.4 : 1 }}>
                      <span style={{ fontWeight: 900, color: i < 3 ? ["#e6b83c", "#cbd5e1", "#d97706"][i] : "rgba(255,255,255,0.4)", fontSize: "clamp(13px,1.3vw,20px)", width: 20, textAlign: "center" }}>{i + 1}</span>
                      <span style={{ width: 26, height: 26, borderRadius: 7, background: t.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, flexShrink: 0 }}>{t.logo_seed}</span>
                      <span style={{ fontSize: "clamp(13px,1.2vw,18px)", fontWeight: 700, textDecoration: t.eliminated ? "line-through" : "none" }}>{short(t.name)}</span>
                      <span style={{ fontWeight: 900, color: GOLD, fontSize: "clamp(13px,1.2vw,18px)" }}>{t.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : onDeck.length > 0 ? (
          <div style={{ textAlign: "center", padding: "clamp(30px,6vw,90px) 20px", animation: "diff-in .6s ease both" }}>
            <div style={{ fontSize: "clamp(14px,1.6vw,22px)", fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.14em" }}>PROCHAINE JOURNÉE DANS</div>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "clamp(180px,26vw,340px)", height: "clamp(180px,26vw,340px)", margin: "24px auto" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `5px solid ${GOLD}`, animation: "diff-ring 1.2s ease-in-out infinite" }} />
              <span style={{ fontSize: "clamp(80px,15vw,220px)", fontWeight: 900, color: GOLD, fontVariantNumeric: "tabular-nums" }}>{kickoffSecs}</span>
            </div>
            <div style={{ fontSize: "clamp(16px,1.8vw,26px)", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{onDeck[0] && stageLabel(onDeck[0])}</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "clamp(40px,8vw,120px) 20px", color: "rgba(255,255,255,0.5)", fontSize: "clamp(18px,2.4vw,34px)", fontWeight: 700 }}>
            {detail ? "En attente de la prochaine journée…" : "Chargement…"}
          </div>
        )}

        {/* BAS : mini-bracket éliminatoire (si présent) */}
        {/* Tableau final : masqué tant qu'un match est en cours — il occupait le
            bas de l'écran et poussait la question hors du cadre. Il réapparaît
            entre deux journées, quand il y a de la place. */}
        {(["quarter", "semi", "final", "third"].some(st => stageMatches(st).length > 0)) && !finished && live.length === 0 && (
          <div style={{ marginTop: "clamp(20px,3vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {([["quarter", "🎯 Quarts"], ["semi", "⚡ Demies"], ["final", "🏆 Finale"], ["third", "🥉 3e place"]] as [string, string][]).filter(([st]) => stageMatches(st).length > 0).map(([st, label]) => (
              <div key={st} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${st === "final" ? GOLD + "44" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: "clamp(9px,0.9vw,12px)", fontWeight: 900, color: st === "final" ? GOLD : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
                {stageMatches(st).map(m => {
                  const a = tmap[m.team_a], b = tmap[m.team_b]; if (!a || !b) return null;
                  return (
                    <div key={m.id} style={{ marginBottom: 6 }}>
                      {[a, b].map(t => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "clamp(11px,1vw,15px)", opacity: m.winner === t.id ? 1 : 0.5, fontWeight: m.winner === t.id ? 800 : 600 }}>
                          <span style={{ width: 16, height: 16, borderRadius: 4, background: t.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900 }}>{t.logo_seed}</span>
                          <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{short(t.name)}</span>
                          <span style={{ color: m.winner === t.id ? GOLD : "rgba(255,255,255,0.5)", fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{Math.round((t.id === m.team_a ? m.score_a : m.score_b) ?? 0)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      </FitToScreen>
      </div>

      {/* JOUEURS DES DEUX ÉQUIPES — sur les flancs, façon retransmission sportive.
          Hors du flux central : ça libère toute la hauteur pour la question. */}
      {feat && liveStats.rosters && statsFresh && (["a", "b"] as const).map((side) => {
        const team = side === "a" ? tmap[feat.team_a] : tmap[feat.team_b];
        const players = (side === "a" ? liveStats.rosters!.a : liveStats.rosters!.b) ?? [];
        if (!team || players.length === 0) return null;
        return (
          <div key={side} style={{
            position: "fixed", top: "50%", transform: "translateY(-50%)",
            [side === "a" ? "left" : "right"]: "clamp(10px,1.6vw,30px)",
            zIndex: 7, width: "clamp(160px,14vw,250px)",
            background: "linear-gradient(180deg,rgba(2,7,23,0.82),rgba(2,7,23,0.55))",
            border: `1px solid ${team.color}66`, borderRadius: 16, overflow: "hidden",
            backdropFilter: "blur(8px)", boxShadow: `0 16px 50px rgba(0,0,0,0.45)`,
            animation: "bfx-card-in .5s ease both",
          }}>
            {/* Bandeau aux couleurs de l'équipe */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: team.color, padding: "7px 11px" }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(0,0,0,0.25)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10 }}>{team.logo_seed}</span>
              <b style={{ color: "#fff", fontSize: "clamp(11px,1vw,15px)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{short(team.name)}</b>
            </div>
            <div style={{ display: "grid", gap: 3, padding: "7px 8px" }}>
              {players.slice(0, 8).map((p, i) => {
                const state = p.answered ? "#4ade80" : (qReveal ? "#f87171" : "#fbbf24");
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "4px 8px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: state, flexShrink: 0, boxShadow: `0 0 8px ${state}` }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: "clamp(10px,0.9vw,13px)", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                    {p.correct > 0 && <span style={{ color: "#4ade80", fontWeight: 900, fontSize: "clamp(9px,0.85vw,12px)", flexShrink: 0 }}>✔{p.correct}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ANNONCE D'ÉLIMINATION — plein écran, grosses lettres, diaporama */}
      {elimShown && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 40, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "clamp(10px,1.6vw,24px)",
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(120,10,10,0.92), rgba(3,6,15,0.97))",
          backdropFilter: "blur(6px)", animation: "diff-in .45s ease both", pointerEvents: "none",
        }}>
          <div style={{ fontSize: "clamp(60px,12vw,180px)", lineHeight: 1, animation: "bfx-pop .7s cubic-bezier(0.34,1.56,0.64,1) both" }}>❌</div>
          <div style={{ fontSize: "clamp(11px,1.4vw,22px)", fontWeight: 900, letterSpacing: "0.45em", color: "#fca5a5", animation: "bfx-engrave 1s ease .2s both" }}>ÉQUIPE ÉLIMINÉE</div>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,2vw,32px)", animation: "bfx-slide-in .7s cubic-bezier(0.22,1,0.36,1) .25s both" }}>
            <span style={{ width: "clamp(50px,6vw,104px)", height: "clamp(50px,6vw,104px)", borderRadius: 20, background: elimShown.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "clamp(20px,2.4vw,40px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>{elimShown.seed}</span>
            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: "clamp(42px,10vw,150px)", lineHeight: 1, color: "#fff", textShadow: "0 6px 40px rgba(248,113,113,0.7)" }}>{elimShown.name.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: "clamp(13px,1.6vw,26px)", fontWeight: 800, color: "rgba(255,255,255,0.7)", animation: "bfx-slide-up .7s ease .5s both" }}>
            Merci pour ce beau parcours 🙏
          </div>
          {elimQueue.length > 1 && (
            <div style={{ fontSize: "clamp(10px,1.1vw,15px)", fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", marginTop: 6 }}>
              +{elimQueue.length - 1} autre(s) annonce(s)…
            </div>
          )}
        </div>
      )}

      {/* BANDEAU DÉFILANT « TÉLÉ » (verset • équipes • sponsors) */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 6, display: "flex", alignItems: "center", height: "clamp(42px,4.6vw,66px)", background: "linear-gradient(90deg,#0a1330,#16264d)", borderTop: `2px solid ${GOLD}`, overflow: "hidden", boxShadow: "0 -8px 24px rgba(0,0,0,0.4)" }}>
        <div style={{ flexShrink: 0, height: "100%", display: "flex", alignItems: "center", padding: "0 clamp(12px,1.4vw,22px)", background: `linear-gradient(135deg,${GOLD},#a97d18)`, color: "#1a1203", fontWeight: 900, fontSize: "clamp(11px,1.1vw,16px)", letterSpacing: "0.08em" }}>🔴 LIVE</div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ display: "inline-flex", whiteSpace: "nowrap", animation: `diff-ticker ${tickerDur}s linear infinite`, willChange: "transform" }}>
            <span style={{ padding: "0 30px", fontSize: "clamp(13px,1.35vw,21px)", fontWeight: 700, color: "#fff" }}>{tickerText}</span>
            <span style={{ padding: "0 30px", fontSize: "clamp(13px,1.35vw,21px)", fontWeight: 700, color: "#fff" }} aria-hidden>{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
