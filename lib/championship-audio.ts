"use client";

// Championship Audio Engine v3 — bande-son originale (15 pistes).
//
// Deux couches distinctes :
//   • MUSIQUE  → HTMLAudioElement en boucle, avec fondu enchaîné entre phases.
//                (les longues boucles ne sont pas décodées en mémoire)
//   • EFFETS   → AudioBuffer décodé et mis en cache (stingers courts, latence nulle).
//
// La musique est automatiquement atténuée (ducking) quand un stinger joue,
// pour que la voix des effets passe toujours au-dessus du lit musical.

// ─── Preferences (localStorage) ──────────────────────────────────────────────

export interface AudioPrefs {
  fxEnabled: boolean;
  musicEnabled: boolean;
  volume: number; // 0–1
}

const PREFS_KEY = "kp_audio_prefs";
const DEFAULT_PREFS: AudioPrefs = { fxEnabled: true, musicEnabled: true, volume: 0.5 };

export function loadAudioPrefs(): AudioPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_PREFS };
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return { ...DEFAULT_PREFS };
}

export function saveAudioPrefs(prefs: Partial<AudioPrefs>) {
  if (typeof window === "undefined") return;
  const next = { ...loadAudioPrefs(), ...prefs };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  applyPrefs(next);
}

// ─── Catalogue des pistes ────────────────────────────────────────────────────

// Boucles musicales — le volume est normalisé piste par piste (les rendus
// Suno n'ont pas tous le même niveau de sortie).
const MUSIC = {
  lobby:          { src: "/sounds/lobby_loop.mp3",      vol: 0.55 },
  question:       { src: "/sounds/question_loop.mp3",   vol: 0.42 },
  questionFast:   { src: "/sounds/question_fast.mp3",   vol: 0.46 },
  questionFinale: { src: "/sounds/question_finale.mp3", vol: 0.48 },
  podium:         { src: "/sounds/podium.mp3",          vol: 0.70 },
  hallOfFame:     { src: "/sounds/hall_of_fame.mp3",    vol: 0.50 },
  broadcast:      { src: "/sounds/broadcast_idle.mp3",  vol: 0.50 },
} as const;

export type MusicKey = keyof typeof MUSIC;

// Stingers. `max` = durée maximale jouée, en secondes : les rendus sont plus
// longs que les phases du moteur (cf. PHASE_DURATIONS), donc chaque stinger est
// borné et sort en fondu au lieu d'être coupé net par le changement de phase.
const FX = {
  intro:        { src: "/sounds/intro_championnat.mp3", vol: 0.90, max: 7.6 },  // CHAMPIONSHIP_INTRO 8 s
  countdown:    { src: "/sounds/countdown.mp3",         vol: 0.75, max: 9.6 },  // COUNTDOWN 10 s
  roundIntro:   { src: "/sounds/round_intro.mp3",       vol: 0.80, max: 5.4 },  // ROUND_INTRO 6 s (moins les 300 ms de délai)
  correct:      { src: "/sounds/reveal_correct.mp3",    vol: 0.80, max: 2.6 },  // joué à chaque réponse
  wrong:        { src: "/sounds/reveal_wrong.mp3",      vol: 0.65, max: 2.6 },
  roundResults: { src: "/sounds/round_results.mp3",     vol: 0.80, max: 7.6 },  // ROUND_RESULTS 8 s
  transition:   { src: "/sounds/transition.mp3",        vol: 0.60, max: 3.6 },  // BETWEEN_ROUNDS 4 s
  elimination:  { src: "/sounds/elimination.mp3",       vol: 0.70, max: 8.0 },
} as const;

type FxKey = keyof typeof FX;

// Manches au tempo rapide (⚡ L'Éclair, 🔥 Le Défi du Sage) et manches
// solennelles (⚔️ Le Jugement, 👑 La Grande Finale) — cf. ROUND_SPECS.
const FAST_ROUNDS = new Set([6, 8]);
const FINALE_ROUNDS = new Set([13, 14]);

export function questionTrackForRound(roundIndex: number): MusicKey {
  if (FINALE_ROUNDS.has(roundIndex)) return "questionFinale";
  if (FAST_ROUNDS.has(roundIndex)) return "questionFast";
  return "question";
}

// ─── Graphe audio ────────────────────────────────────────────────────────────
//
//   [layers] → musicBus → musicDuck → musicGain ─┐
//                                                ├→ masterGain → destination
//   [stingers] ─────────────────────→ fxGain ────┘
//
// musicGain porte la préférence on/off, musicDuck porte l'atténuation
// temporaire : les deux ne se marchent jamais dessus.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let fxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicDuck: GainNode | null = null;
let musicBus: GainNode | null = null;

interface MusicLayer {
  key: MusicKey;
  el: HTMLAudioElement;
  gain: GainNode;
  node: MediaElementAudioSourceNode;
}

let current: MusicLayer | null = null;
let currentPrefs: AudioPrefs = { ...DEFAULT_PREFS };

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    fxGain = ctx.createGain();
    musicGain = ctx.createGain();
    musicDuck = ctx.createGain();
    musicBus = ctx.createGain();

    masterGain.connect(ctx.destination);
    fxGain.connect(masterGain);
    musicGain.connect(masterGain);
    musicDuck.connect(musicGain);
    musicBus.connect(musicDuck);
    musicDuck.gain.value = 1;

    currentPrefs = loadAudioPrefs();
    applyPrefs(currentPrefs);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function applyPrefs(prefs: AudioPrefs) {
  currentPrefs = prefs;
  if (masterGain) masterGain.gain.value = prefs.volume;
  if (fxGain) fxGain.gain.value = prefs.fxEnabled ? 1 : 0;
  if (musicGain) musicGain.gain.value = prefs.musicEnabled ? 1 : 0;
}

export function resumeAudio() {
  getCtx();
  ctx?.resume();
  // Le navigateur a pu refuser le play() avant le geste utilisateur : on relance.
  if (current?.el.paused) current.el.play().catch(() => { /* ignore */ });
}

export function setMasterVolume(vol: number) {
  saveAudioPrefs({ volume: vol });
}

export function destroyAudio() {
  stopMusic();
  try { ctx?.close(); } catch { /* ignore */ }
  ctx = null;
  masterGain = null;
  fxGain = null;
  musicGain = null;
  musicDuck = null;
  musicBus = null;
  current = null;
}

// ─── Ducking ─────────────────────────────────────────────────────────────────

let duckTimer: ReturnType<typeof setTimeout> | null = null;

// Atténue la musique le temps qu'un stinger passe, puis la ramène.
function duck(depth = 0.35, hold = 0.9, release = 0.8) {
  if (!ctx || !musicDuck || !current) return;
  const g = musicDuck.gain;
  const now = ctx.currentTime;
  try {
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(depth, now + 0.12);
  } catch { /* ignore */ }
  if (duckTimer) clearTimeout(duckTimer);
  duckTimer = setTimeout(() => {
    if (!ctx || !musicDuck) return;
    const t = ctx.currentTime;
    try {
      musicDuck.gain.cancelScheduledValues(t);
      musicDuck.gain.setValueAtTime(musicDuck.gain.value, t);
      musicDuck.gain.linearRampToValueAtTime(1, t + release);
    } catch { /* ignore */ }
  }, hold * 1000);
}

// ─── Effets (buffers) ────────────────────────────────────────────────────────

const bufferCache: Record<string, AudioBuffer> = {};

async function loadBuffer(path: string): Promise<AudioBuffer | null> {
  if (bufferCache[path]) return bufferCache[path];
  try {
    const c = getCtx();
    const res = await fetch(path);
    const arr = await res.arrayBuffer();
    const buf = await c.decodeAudioData(arr);
    bufferCache[path] = buf;
    return buf;
  } catch { return null; }
}

// Joue un stinger, borné à `max` secondes avec fondu de sortie.
// `duckMusic` = profondeur d'atténuation du lit musical pendant qu'il passe.
const FX_TAIL = 0.45; // durée du fondu de sortie du stinger

async function playFx(key: FxKey, duckMusic = 0.4) {
  const { src, vol, max } = FX[key];
  const c = getCtx();
  const buf = await loadBuffer(src);
  if (!buf || !fxGain) return;

  const dur = Math.min(max, buf.duration);
  const node = c.createBufferSource();
  const g = c.createGain();
  node.buffer = buf;
  node.connect(g);
  g.connect(fxGain);

  const t = c.currentTime;
  g.gain.setValueAtTime(vol, t);
  // Fondu de sortie sur la fin, seulement si on tronque la piste.
  if (dur < buf.duration) {
    g.gain.setValueAtTime(vol, t + Math.max(0, dur - FX_TAIL));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
  }

  // La musique revient au niveau juste avant la fin du stinger.
  if (duckMusic > 0) duck(duckMusic, Math.max(0.4, dur - 0.5));

  node.start(t);
  node.stop(t + dur + 0.02);
  node.onended = () => { try { node.disconnect(); g.disconnect(); } catch { /* ignore */ } };
}

// Précharge les stingers du match — évite le blanc au premier déclenchement.
export function preloadMatchAudio() {
  if (typeof window === "undefined") return;
  (Object.keys(FX) as FxKey[]).forEach((k) => { void loadBuffer(FX[k].src); });
}

// ─── Musique (fondu enchaîné) ────────────────────────────────────────────────

// Instant (ms) où la dernière piste en cours d'extinction sera vraiment muette.
// Toute nouvelle piste attend cette échéance : jamais deux musiques ensemble.
let fadingUntilMs = 0;

function fadeOutLayer(layer: MusicLayer, fade: number) {
  fadingUntilMs = Math.max(fadingUntilMs, Date.now() + fade * 1000 + 80);
  const stop = () => {
    try { layer.el.pause(); } catch { /* ignore */ }
    try { layer.node.disconnect(); layer.gain.disconnect(); } catch { /* ignore */ }
    layer.el.src = "";
    allLayers.delete(layer);
  };
  if (fade > 0 && ctx) {
    const now = ctx.currentTime;
    try {
      layer.gain.gain.cancelScheduledValues(now);
      layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
      layer.gain.gain.linearRampToValueAtTime(0.0001, now + fade);
    } catch { /* ignore */ }
    setTimeout(stop, fade * 1000 + 80);
  } else {
    stop();
  }
}

// Toutes les couches jamais créées. Sert de filet de sécurité : avant d'en
// démarrer une nouvelle, on coupe net tout ce qui pourrait encore jouer.
// Sans ça, deux musiques pouvaient se superposer si un fondu de sortie était
// interrompu (changement de page, double appel simultané…).
const allLayers = new Set<MusicLayer>();

function killAllLayers(except?: MusicLayer) {
  for (const l of allLayers) {
    if (l === except) continue;
    try { l.el.pause(); } catch { /* déjà arrêté */ }
    try { l.node.disconnect(); l.gain.disconnect(); } catch { /* déjà détaché */ }
    l.el.src = "";
    allLayers.delete(l);
  }
}

// Démarre réellement une couche musicale (fondu d'entrée depuis le silence).
function startLayer(key: MusicKey, fadeIn: number, loop: boolean) {
  const c = getCtx();
  // UNE SEULE MUSIQUE À LA FOIS : on coupe tout résidu avant de démarrer.
  killAllLayers();
  const { src, vol } = MUSIC[key];
  const el = new Audio(src);
  el.loop = loop;
  el.preload = "auto";
  el.crossOrigin = "anonymous";

  const node = c.createMediaElementSource(el);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + fadeIn);
  node.connect(gain);
  gain.connect(musicBus!);

  // Bloqué tant que l'utilisateur n'a pas interagi — resumeAudio() relancera.
  el.play().catch(() => { /* ignore */ });

  current = { key, el, gain, node };
  allLayers.add(current);

  // Remet le ducking à plat pour la nouvelle piste.
  if (musicDuck) {
    try {
      musicDuck.gain.cancelScheduledValues(c.currentTime);
      musicDuck.gain.setValueAtTime(1, c.currentTime);
    } catch { /* ignore */ }
  }
}

// Piste programmée mais pas encore démarrée (pendant le fondu de sortie).
let pendingKey: MusicKey | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

// Lance une boucle musicale en fondu SÉQUENTIEL : la piste en cours s'éteint
// complètement (fadeOut), un court silence passe (gap), puis la nouvelle entre
// en fondu (fadeIn). Les deux musiques ne se superposent jamais.
// Rejouer la même piste ne la redémarre pas (sauf `restart`).
export function playMusic(
  key: MusicKey,
  opts: { fadeIn?: number; fadeOut?: number; gap?: number; loop?: boolean; restart?: boolean } = {},
) {
  if (typeof window === "undefined") return;
  const { fadeIn = 1.4, fadeOut = 1.2, gap = 0.2, loop = true, restart = false } = opts;
  getCtx();

  // Déjà en cours, ou déjà programmée juste après le fondu de sortie.
  if (!restart && (pendingKey ?? current?.key) === key) return;

  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }

  const begin = () => {
    pendingTimer = null;
    pendingKey = null;
    startLayer(key, fadeIn, loop);
  };

  if (current) {
    fadeOutLayer(current, fadeOut);
    current = null;
  }

  // Attend la fin de TOUT fondu de sortie encore en cours (y compris celui
  // déclenché plus tôt par un stopMusic), puis le petit silence de respiration.
  const remainingFade = Math.max(0, fadingUntilMs - Date.now());
  if (remainingFade === 0) { begin(); return; }
  pendingKey = key;
  pendingTimer = setTimeout(begin, remainingFade + gap * 1000);
}

// Arrête la musique. `fade` en secondes (0 = coupure nette).
export function stopMusic(fade = 0) {
  // Annule aussi une piste programmée : elle ne doit pas démarrer après coup.
  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
  pendingKey = null;
  if (!current) return;
  fadeOutLayer(current, fade);
  current = null;
}

export function currentMusic(): MusicKey | null {
  return pendingKey ?? current?.key ?? null;
}

// ─── API par phase de match ──────────────────────────────────────────────────

// LOBBY / avant-match — lit chaleureux et patient.
export function startLobbyMusic() {
  playMusic("lobby");
}

// QUESTION_ACTIVE — la piste s'adapte à la manche (standard / rapide / finale).
export function startQuestionMusic(roundIndex = 0) {
  playMusic(questionTrackForRound(roundIndex));
}

// PODIUM — hymne de couronnement.
export function startPodiumMusic() {
  playMusic("podium", { fadeIn: 0.4 });
}

// Hall of Fame — nappe lumineuse en boucle.
export function startHallOfFameMusic() {
  playMusic("hallOfFame");
}

// Mode diffusion / écran d'attente — groove de plateau.
export function startBroadcastMusic() {
  playMusic("broadcast");
}

// CHAMPIONSHIP_INTRO — fanfare d'ouverture (la musique s'efface derrière).
export function playChampionshipIntro() {
  void playFx("intro", 0.15);
}

// COUNTDOWN — montée de 12 s vers le coup d'envoi.
export function playCountdownRiser() {
  void playFx("countdown", 0.2);
}

// ROUND_INTRO — annonce de manche.
export function playRoundStart() {
  void playFx("roundIntro", 0.25);
}

// ANSWER_REVEAL ✅
export function playCorrect() {
  void playFx("correct", 0.45);
}

// ANSWER_REVEAL ❌ (encourageant, jamais punitif)
export function playWrong() {
  void playFx("wrong", 0.45);
}

// ROUND_RESULTS — révélation du classement.
export function playRoundResults() {
  void playFx("roundResults", 0.25);
}

// BETWEEN_ROUNDS — transition.
export function playTransition() {
  void playFx("transition", 0.35);
}

// Fin de parcours — au revoir honorable.
export function playElimination() {
  void playFx("elimination", 0.2);
}

// Conservé pour compatibilité : la victoire lance désormais l'hymne du podium.
export function playVictoryFanfare() {
  startPodiumMusic();
}

// ─── Tics de compte à rebours (synthétisés : ultra-courts et sans latence) ────

export function playCountdown() {
  const c = getCtx();
  if (!fxGain) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
  osc.connect(g);
  g.connect(fxGain);
  osc.start();
  osc.stop(c.currentTime + 0.08);
}

export function playCountdownFinal() {
  const c = getCtx();
  if (!fxGain) return;
  [880, 1108].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.1;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(fxGain!);
    osc.start(t);
    osc.stop(t + 0.12);
  });
}
