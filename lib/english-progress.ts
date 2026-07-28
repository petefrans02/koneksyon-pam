"use client";

// Progression du cours d'anglais : XP, série de jours, leçons terminées.
//
// Deux niveaux : localStorage d'abord (instantané, marche hors connexion), puis
// synchronisation avec Supabase si l'utilisateur est connecté — il retrouve
// ainsi sa progression sur tous ses appareils.

import { supabase } from "@/lib/supabase";

const KEY = "kp_english_progress";

export interface Progress {
  xp: number;
  streak: number;
  lastDay: string;          // AAAA-MM-JJ du dernier jour joué
  done: string[];           // slugs des leçons terminées
}

const EMPTY: Progress = { xp: 0, streak: 0, lastDay: "", done: [] };

const today = () => new Date().toISOString().slice(0, 10);

export function loadLocal(): Progress {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...EMPTY };
}

function saveLocal(p: Progress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

/** La série augmente d'un jour à l'autre, et se remet à 1 après une absence. */
function bumpStreak(p: Progress): Progress {
  const d = today();
  if (p.lastDay === d) return p;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return { ...p, streak: p.lastDay === yesterday ? p.streak + 1 : 1, lastDay: d };
}

/** Enregistre une leçon terminée. Retourne la progression à jour. */
export function completeLesson(slug: string, xpGained: number): Progress {
  const cur = loadLocal();
  const next = bumpStreak({
    ...cur,
    xp: cur.xp + xpGained,
    done: cur.done.includes(slug) ? cur.done : [...cur.done, slug],
  });
  saveLocal(next);
  void syncUp(next);
  return next;
}

// ── Synchronisation Supabase (silencieuse : jamais bloquante) ────────────────

async function syncUp(p: Progress) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;
    await supabase.from("english_progress").upsert({
      user_id: user.id,
      xp: p.xp,
      streak: p.streak,
      last_day: p.lastDay || null,
      done: p.done,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  } catch { /* la progression locale reste la référence */ }
}

/** Récupère la progression du compte et garde la meilleure des deux. */
export async function syncDown(): Promise<Progress> {
  const local = loadLocal();
  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return local;
    const { data: row } = await supabase
      .from("english_progress").select("xp, streak, last_day, done").eq("user_id", user.id).maybeSingle();
    if (!row) { void syncUp(local); return local; }

    // Fusion prudente : on ne perd jamais une leçon réussie.
    const merged: Progress = {
      xp: Math.max(local.xp, Number(row.xp ?? 0)),
      streak: Math.max(local.streak, Number(row.streak ?? 0)),
      lastDay: (row.last_day as string) > local.lastDay ? (row.last_day as string) : local.lastDay,
      done: [...new Set([...local.done, ...((row.done as string[]) ?? [])])],
    };
    saveLocal(merged);
    return merged;
  } catch {
    return local;
  }
}
