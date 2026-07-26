"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import RequireAuth from "@/app/components/RequireAuth";
import { useWakeLock } from "@/lib/useWakeLock";
import SyncPlay from "./SyncPlay";
import WaitingMiniGame from "@/app/components/WaitingMiniGame";
import { teamLabel } from "@/lib/champ-data";
import { playTick, playSad, playChime, armAudio } from "@/lib/sound";
import { startLobbyMusic, stopMusic, resumeAudio, preloadMatchAudio } from "@/lib/championship-audio";

interface Info {
  match: { id: string; stage: string; status: string; score_a: number | null; score_b: number | null; winner: string | null; team_a: string; team_b: string; round_number: number | null };
  teamA: { id: string; name: string; color: string; logo_seed: string } | null;
  teamB: { id: string; name: string; color: string; logo_seed: string } | null;
  contest_id: string | null;
  my_team_id: string | null;
  season_id: string | null;
  is_member: boolean;
  already_played: boolean;
  can_play: boolean;
  waiting: boolean;
  starts_in_sec: number | null;
  my_team_eliminated: boolean;
  live_now?: { a: { name: string; color: string; logo_seed: string } | null; b: { name: string; color: string; logo_seed: string } | null }[];
}

const GOLD = "#e6b83c";

export default function MatchRoomPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as "fr" | "ht" | "en" | "es";
  useWakeLock(true);

  const [info, setInfo] = useState<Info | null>(null);
  const [done, setDone] = useState(false);
  const [localSecs, setLocalSecs] = useState<number | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Débloque l'audio du navigateur dès la 1re interaction (nécessaire pour le son automatique).
  useEffect(() => {
    armAudio();
    // On tente tout de suite : si le joueur arrive d'un match precedent dans le
    // meme onglet, l'audio est deja autorise et la musique demarre sans clic.
    resumeAudio(); preloadMatchAudio(); setAudioReady(true);
    // Le 1er geste debloque aussi la bande-son (les navigateurs refusent
    // l'audio automatique tant que l'utilisateur n'a rien touche).
    const arm = () => { armAudio(); resumeAudio(); preloadMatchAudio(); setAudioReady(true); };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("touchstart", arm);
    return () => { window.removeEventListener("pointerdown", arm); window.removeEventListener("touchstart", arm); };
  }, []);

  // MUSIQUE D'ATTENTE : elle tourne pendant le compte a rebours et entre deux
  // matchs (avant, ces ecrans etaient silencieux). SyncPlay prend le relais
  // des que le match demarre, et coupe en quittant la page.
  const waitingRoom = !!info && !info.can_play;
  useEffect(() => {
    if (!audioReady) return;
    if (waitingRoom) startLobbyMusic();
    else stopMusic(1.2);
  }, [audioReady, waitingRoom]);
  useEffect(() => () => { stopMusic(1); }, []);

  // Compte à rebours local fluide (1 s) + son TIC-TAC automatique pour attirer l'attention.
  useEffect(() => { setLocalSecs(info?.starts_in_sec ?? null); }, [info?.starts_in_sec]);
  useEffect(() => {
    if (localSecs == null) return;
    const iv = setInterval(() => {
      setLocalSecs((s) => {
        if (s == null) return null;
        const n = Math.max(0, s - 1);
        if (n > 0) playTick(n % 2 === 0); // alterne tic (aigu) / tac (grave)
        return n;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [localSecs == null]);

  // Sons d'ambiance : carillon quand le match démarre, note triste à l'élimination.
  const prevCanPlay = useRef(false);
  useEffect(() => {
    if (info?.can_play && !prevCanPlay.current) { playChime(); prevCanPlay.current = true; }
    if (!info?.can_play) prevCanPlay.current = false;
  }, [info?.can_play]);
  const eliminatedOnce = useRef(false);
  useEffect(() => {
    if (info?.my_team_eliminated && !eliminatedOnce.current) { eliminatedOnce.current = true; playSad(); }
  }, [info?.my_team_eliminated]);

  const load = useCallback(() => {
    fetch(`/api/championship/match/${matchId}`).then(r => r.json()).then((d: Info) => setInfo(d)).catch(() => {});
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    load();
    pollRef.current = setInterval(load, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [matchId, load]);

  // Quand le match devient "jouable", charge les questions UNE SEULE FOIS.
  // Dès que le match est terminé → on envoie AUTOMATIQUEMENT le joueur dans la salle de son PROCHAIN match
  // (il y attend le compte à rebours puis joue tout seul, sans cliquer). Sinon retour au championnat.
  // Cherche le prochain match du joueur (sans le déplacer).
  const findNext = useCallback(async (): Promise<string | null> => {
    try {
      let sid = info?.season_id ?? null;
      if (!sid) { const s = await fetch("/api/championship").then(r => r.json()); sid = s.seasons?.[0]?.id ?? null; }
      if (!sid) return null;
      const mm = await fetch(`/api/championship/${sid}/my-matches`).then(r => r.json());
      const list = (mm.matches ?? []) as { match_id: string; played: boolean; status: string }[];
      const next = list.find(m => m.match_id !== matchId && !m.played && m.status === "live")
        || list.find(m => m.match_id !== matchId && !m.played && m.status !== "done");
      return next?.match_id ?? null;
    } catch { return null; }
  }, [info?.season_id, matchId]);

  const goNext = useCallback(async () => {
    const next = await findNext();
    if (next) { router.push(`/championnat/jouer/${next}`); return; }
    // Pas encore de prochain match : on NE SORT PAS le joueur de la salle.
    // Il attend ici, et il y sera emmené tout seul dès que le tour suivant existe.
    setWaitingNext(true);
  }, [findNext, router]);

  useEffect(() => {
    if (info?.match.status !== "done") return;
    if (info.my_team_eliminated) return; // équipe éliminée → on reste sur l'écran « MERCI »
    const to = setTimeout(() => { goNext(); }, 2600);
    return () => clearTimeout(to);
  }, [info?.match.status, info?.my_team_eliminated, goNext]);

  // Salle d'attente entre deux tours : on interroge le championnat jusqu'à ce
  // que le prochain match du joueur apparaisse, puis on l'y emmène.
  useEffect(() => {
    if (!waitingNext) return;
    const iv = setInterval(async () => {
      const next = await findNext();
      if (next) router.push(`/championnat/jouer/${next}`);
    }, 4000);
    return () => clearInterval(iv);
  }, [waitingNext, findNext, router]);

  const back = () => router.push("/championnat");
  const shell = (children: React.ReactNode) => (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 40% at 50% 0%, #14213f 0%, #070c1a 60%, #04070f 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#fff", textAlign: "center", padding: 24 }}>{children}</div>
  );
  const backBtn = <button onClick={back} style={{ padding: "10px 24px", borderRadius: 999, border: `1px solid ${GOLD}55`, background: `${GOLD}14`, color: GOLD, fontWeight: 800, cursor: "pointer" }}>← {l === "fr" ? "Retour au championnat" : "Back"}</button>;

  const Vs = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "6px 0" }}>
      {info?.teamA && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 34, height: 34, borderRadius: 9, background: info.teamA.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{info.teamA.logo_seed}</span><b>{info.teamA.name.replace("Équipe ", "")}</b></div>}
      <span style={{ color: GOLD, fontWeight: 900 }}>VS</span>
      {info?.teamB && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><b>{info.teamB.name.replace("Équipe ", "")}</b><span style={{ width: 34, height: 34, borderRadius: 9, background: info.teamB.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{info.teamB.logo_seed}</span></div>}
    </div>
  );

  // Équipes qui jouent en ce moment dans le championnat (affiché pendant l'attente).
  const LiveNow = () => {
    const list = info?.live_now ?? [];
    if (list.length === 0) return null;
    return (
      <div style={{ width: "100%", maxWidth: 360, margin: "0 auto", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "10px 14px" }}>
        <style>{`@keyframes champpulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
        <p style={{ fontSize: 11, fontWeight: 900, color: "#f87171", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171", animation: "champpulse 1s ease-in-out infinite" }} /> {l === "fr" ? "ÉQUIPES QUI JOUENT MAINTENANT" : "PLAYING NOW"}
        </p>
        <div style={{ display: "grid", gap: 6 }}>
          {list.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
              <span style={{ flex: 1, textAlign: "right", fontWeight: 700 }}>{m.a!.name.replace("Équipe ", "")}</span>
              <span style={{ width: 18, height: 18, borderRadius: 5, background: m.a!.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900 }}>{m.a!.logo_seed}</span>
              <span style={{ color: GOLD, fontWeight: 900, fontSize: 10 }}>vs</span>
              <span style={{ width: 18, height: 18, borderRadius: 5, background: m.b!.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900 }}>{m.b!.logo_seed}</span>
              <span style={{ flex: 1, fontWeight: 700 }}>{m.b!.name.replace("Équipe ", "")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <RequireAuth>
      {waitingNext && !info?.my_team_eliminated ? shell(<>
          <style>{`@keyframes champpulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          <div style={{ fontSize: 52, animation: "champpulse 1.4s ease-in-out infinite" }}>⏳</div>
          <p style={{ fontSize: 20, fontWeight: 900 }}>{l === "fr" ? "Prochain tour en préparation…" : l === "ht" ? "Pwochen tou a ap prepare…" : l === "es" ? "Preparando la próxima ronda…" : "Next round is being prepared…"}</p>
          <Vs />
          <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 360, fontSize: 14, lineHeight: 1.5 }}>{l === "fr" ? "Reste ici, ne quitte pas la salle : tu seras emmené automatiquement dans ton prochain match dès qu'il démarre." : l === "ht" ? "Rete la : w ap ale nan pwochen match ou otomatikman." : l === "es" ? "Quédate aquí: entrarás automáticamente a tu próximo partido." : "Stay here — you'll be taken to your next match automatically."}</p>
          <LiveNow />
          <WaitingMiniGame lang={l} />
          {backBtn}
        </>)
        : done && !info?.my_team_eliminated ? shell(<><p style={{ fontSize: 48 }}>✅</p><p style={{ fontSize: 20, fontWeight: 900 }}>{l === "fr" ? "Match joué ! Ton score compte pour ton équipe." : "Played!"}</p><Vs /><p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{l === "fr" ? "Reste ici — dès que tout le monde a fini, tu passes au prochain match tout seul. 👇" : "Stay here — you'll move to the next match automatically. 👇"}</p><LiveNow /><WaitingMiniGame lang={l} />{backBtn}</>)
        : !info ? shell(<p style={{ color: "rgba(255,255,255,0.5)" }}>{l === "fr" ? "Chargement…" : "Loading…"}</p>)
        : !info.is_member ? shell(<><p style={{ fontSize: 44 }}>🚫</p><p style={{ fontWeight: 800 }}>{l === "fr" ? "Tu ne fais pas partie de ce match." : "Not your match."}</p>{backBtn}</>)
        : info.my_team_eliminated && info.match.status !== "live" ? shell(<>
            <style>{`@keyframes elimIn{0%{opacity:0;transform:scale(.7)}60%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}@keyframes elimPulse{0%,100%{opacity:1}50%{opacity:.55}}`}</style>
            <div style={{ fontSize: "clamp(72px,22vw,130px)", animation: "elimIn .7s cubic-bezier(0.34,1.56,0.64,1) both" }}>💔</div>
            <h1 style={{ fontSize: "clamp(2.4rem,11vw,5rem)", fontWeight: 900, color: "#f87171", lineHeight: 1, margin: 0, letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(248,113,113,0.5)", animation: "elimIn .8s .1s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              {l === "fr" ? "ÉLIMINÉ" : l === "ht" ? "ELIMINE" : l === "es" ? "ELIMINADO" : "ELIMINATED"}
            </h1>
            <p style={{ fontSize: "clamp(1rem,4vw,1.4rem)", fontWeight: 800, color: "#fff", margin: "4px 0" }}>{teamLabel(info.teamA && info.my_team_id === info.teamA.id ? info.teamA.name : info.teamB?.name, l)}</p>
            <div style={{ fontSize: "clamp(1.8rem,8vw,3rem)", fontWeight: 900, color: GOLD, animation: "elimPulse 1.6s ease-in-out infinite", marginTop: 6 }}>
              {l === "fr" ? "🙏 MERCI !" : l === "ht" ? "🙏 MÈSI !" : l === "es" ? "🙏 ¡GRACIAS!" : "🙏 THANK YOU!"}
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 380, fontSize: 15, lineHeight: 1.5 }}>{l === "fr" ? "Merci d'avoir joué pour ton équipe ! Continue de suivre le championnat et encourage les équipes encore en lice. Dieu te bénit ! 🌟" : l === "ht" ? "Mèsi dèske w te jwe pou ekip ou ! Kontinye swiv chanpyona a. 🌟" : l === "es" ? "¡Gracias por jugar! Sigue el campeonato. 🌟" : "Thanks for playing! Keep following the championship. 🌟"}</p>
            {backBtn}
          </>)
        : info.match.status === "done" ? shell(<><p style={{ fontSize: 44 }}>🏁</p><Vs /><p style={{ fontSize: 26, fontWeight: 900 }}>{Math.round(info.match.score_a ?? 0)} - {Math.round(info.match.score_b ?? 0)}</p><p style={{ color: GOLD, fontWeight: 800 }}>{info.match.winner === info.teamA?.id ? `🏆 ${teamLabel(info.teamA?.name, l)}` : info.match.winner === info.teamB?.id ? `🏆 ${teamLabel(info.teamB?.name, l)}` : (l === "fr" ? "Égalité" : "Draw")}</p><p style={{ color: GOLD, fontSize: 14, fontWeight: 800, animation: "champpulse 1.2s ease-in-out infinite" }}>{info.my_team_eliminated ? (l === "fr" ? "Retour au championnat…" : "Back…") : (l === "fr" ? "➡️ Direction ton prochain match…" : l === "ht" ? "➡️ Pwochen match ou…" : l === "es" ? "➡️ Tu próximo partido…" : "➡️ Heading to your next match…")}</p><style>{`@keyframes champpulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>{backBtn}</>)
        : info.already_played ? shell(<><p style={{ fontSize: 44 }}>👍</p><Vs /><p style={{ fontWeight: 800 }}>{l === "fr" ? "Tu as joué ! Attends la fin du match." : "You played! Waiting."}</p><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{l === "fr" ? "Le résultat s'affichera quand la journée se termine. En attendant 👇" : "Result soon. Meanwhile 👇"}</p><LiveNow /><WaitingMiniGame lang={l} />{backBtn}</>)
        : info.waiting ? shell(<>
            <style>{`@keyframes champpulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes champring{0%{transform:scale(.85);opacity:.6}50%{transform:scale(1.05);opacity:1}100%{transform:scale(.85);opacity:.6}}`}</style>
            <Vs />
            {info.starts_in_sec !== null ? (
              <>
                <div style={{ position: "relative", width: 130, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${GOLD}`, animation: "champring 1.2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 48, fontWeight: 900, color: GOLD, fontVariantNumeric: "tabular-nums" }}>{localSecs ?? info.starts_in_sec}</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 900 }}>{l === "fr" ? "Le match démarre…" : l === "ht" ? "Match la ap kòmanse…" : l === "es" ? "El partido comienza…" : "Match starting…"}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 340 }}>{l === "fr" ? "Prépare-toi ! Le match commence pour tout le monde en même temps." : "Get ready! Starts for everyone at once."}</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, animation: "champpulse 1.2s ease-in-out infinite" }}>⏳</div>
                <p style={{ fontSize: 20, fontWeight: 900 }}>{l === "fr" ? "En attente du départ…" : "Waiting to start…"}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 340 }}>{l === "fr" ? "Le match démarrera pour tout le monde en même temps dès que l'organisateur clique sur « Démarrer »." : "The match starts for everyone when the organizer clicks Start."}</p>
              </>
            )}
            <LiveNow />
            <WaitingMiniGame lang={l} />
            {backBtn}
          </>)
        : info.can_play ? (
          <SyncPlay matchId={String(matchId)} teamA={info.teamA} teamB={info.teamB} soundOn={audioReady} onFinish={() => setDone(true)} />
        )
        : shell(<><p style={{ fontSize: 40 }}>📭</p><p>{l === "fr" ? "Rien à jouer pour le moment." : "Nothing to play."}</p>{backBtn}</>)}
    </RequireAuth>
  );
}
