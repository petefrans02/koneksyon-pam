// Sons générés à la volée (Web Audio API) — aucun fichier externe, aucun blocage CSP.
// Utilisé pour le « tic-tac » du compte à rebours et les petits effets du championnat.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}

// À appeler sur la 1re interaction utilisateur (clic/tap) pour débloquer l'audio du navigateur.
export function armAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

// Un « tic » (aigu) ou « tac » (grave) court et sec.
export function playTick(high = false) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "square";
    osc.frequency.value = high ? 1500 : 850;
    const t = c.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(high ? 0.22 : 0.28, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(t); osc.stop(t + 0.1);
  } catch { /* ignore */ }
}

// Petite fanfare descendante douce (utilisée quand une équipe est éliminée).
export function playSad() {
  const c = getCtx();
  if (!c) return;
  try {
    const notes = [440, 392, 349, 294];
    notes.forEach((f, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      const t = c.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t); osc.stop(t + 0.3);
    });
  } catch { /* ignore */ }
}

// Petit carillon montant joyeux (départ de match / victoire).
export function playChime() {
  const c = getCtx();
  if (!c) return;
  try {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t = c.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t); osc.stop(t + 0.37);
    });
  } catch { /* ignore */ }
}
