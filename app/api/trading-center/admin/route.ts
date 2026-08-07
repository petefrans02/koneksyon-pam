/**
 * LE PANNEAU D'ADMINISTRATION — données et actions.
 *
 * Une seule route, deux verbes, et `requireAdmin` en première ligne des deux.
 * L'accès à `/admin` est déjà filtré par `proxy.ts`, mais un filtre de
 * routage protège une PAGE, pas une API : l'URL de cette route est devinable,
 * et sans le contrôle ci-dessous, n'importe qui pourrait abaisser le seuil de
 * confiance à 0 ou s'offrir un abonnement Premium.
 *
 * Les deux contrôles ne font donc pas doublon — ils protègent deux choses
 * différentes.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/admin-auth";
import { accorderPremium, retirerPremium } from "@/lib/trading-center/acces";
import { ConfigTC, config, ecrireConfig, viderCache } from "@/lib/trading-center/config";
import { tousLesMarches, viderCacheMarches } from "@/lib/trading-center/marches";
import { diagnostiquer } from "@/lib/trading-center/sante";
import { avancer } from "@/lib/trading-center/signaux";
import { statistiques } from "@/lib/trading-center/journal";
import { Signal, StatutSignal } from "@/lib/trading-center/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Les clés modifiables, avec leur validation. Toute autre clé est ignorée. */
const REGLAGES: Record<keyof ConfigTC, (v: unknown) => unknown | undefined> = {
  seuil_confiance: (v) => {
    const n = Number(v);
    // Plancher à 50 : en dessous, le mot « signal » ne veut plus rien dire et
    // la plateforme deviendrait exactement le canal à spam qu'elle refuse
    // d'être. C'est une limite de produit, pas une limite technique.
    return Number.isFinite(n) && n >= 50 && n <= 100 ? Math.round(n) : undefined;
  },
  ia_active: (v) => (typeof v === "boolean" ? v : undefined),
  ia_modele: (v) => (typeof v === "string" && v.length < 64 ? v : undefined),
  delai_gratuit_min: (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 1440 ? Math.round(n) : undefined;
  },
  historique_gratuit: (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : undefined;
  },
  max_signaux_jour: (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 1 && n <= 50 ? Math.round(n) : undefined;
  },
  anti_doublon_min: (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 1440 ? Math.round(n) : undefined;
  },
  rr_minimum: (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0.5 && n <= 10 ? Math.round(n * 100) / 100 : undefined;
  },
  sessions_autorisees: (v) => {
    const connues = ["asie", "londres", "new-york", "chevauchement", "hors-session"];
    return Array.isArray(v) && v.every((s) => connues.includes(String(s))) ? v : undefined;
  },
};

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const db = adminDb();

  const [signaux, alertes, abonnes, diffusions] = await Promise.all([
    db.from("tc_signaux").select("*").order("publie_le", { ascending: false }).limit(200),
    db.from("tc_alertes").select("id, recu_le, marche, statut, raison, score_brut, score_ia, ms").order("recu_le", { ascending: false }).limit(60),
    db.from("tc_abonnements").select("user_id, email, plan, debut, fin, source").order("maj_le", { ascending: false }).limit(200),
    db.from("tc_diffusions").select("*").order("cree_le", { ascending: false }).limit(40),
  ]);

  const liste = (signaux.data ?? []) as Signal[];

  // La ventilation des rejets est le tableau le plus utile de l'admin : elle
  // dit si le système est trop strict, trop laxiste, ou simplement mal
  // branché. « 40 rejets pour doublon » et « 40 rejets pour secret invalide »
  // décrivent deux situations qui n'ont rien à voir.
  const rejets: Record<string, number> = {};
  for (const a of (alertes.data ?? []) as { statut: string }[]) {
    rejets[a.statut] = (rejets[a.statut] ?? 0) + 1;
  }

  return NextResponse.json({
    sante: await diagnostiquer(),
    config: await config(),
    marches: await tousLesMarches(),
    stats: statistiques(liste),
    signaux: liste,
    alertes: alertes.data ?? [],
    rejets,
    abonnes: abonnes.data ?? [],
    diffusions: diffusions.data ?? [],
    erreurs: [signaux.error, alertes.error, abonnes.error, diffusions.error]
      .filter(Boolean)
      .map((e) => e!.message),
  });
}

export async function POST(request: NextRequest) {
  let email: string;
  try {
    email = await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  let corps: Record<string, unknown>;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const action = String(corps.action ?? "");

  switch (action) {
    // ─────────────────────────────────────────────── configuration ────
    case "config": {
      const modifs = (corps.valeurs ?? {}) as Record<string, unknown>;
      const appliques: string[] = [];
      const refuses: string[] = [];

      for (const [cle, brut] of Object.entries(modifs)) {
        const validateur = REGLAGES[cle as keyof ConfigTC];
        if (!validateur) {
          refuses.push(`${cle} (clé inconnue)`);
          continue;
        }
        const valeur = validateur(brut);
        if (valeur === undefined) {
          refuses.push(`${cle} (valeur hors bornes)`);
          continue;
        }
        await ecrireConfig(cle as keyof ConfigTC, valeur);
        appliques.push(cle);
      }

      viderCache();
      return NextResponse.json({ ok: true, appliques, refuses, config: await config() });
    }

    // ───────────────────────────────────────────────────── marché ─────
    case "marche": {
      const code = String(corps.code ?? "");
      const actif = corps.actif === true;
      const { error } = await adminDb().from("tc_marches").update({ actif }).eq("code", code);
      viderCacheMarches();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, code, actif });
    }

    // ────────────────────────────────────── cycle de vie d'un signal ──
    case "signal": {
      const id = String(corps.id ?? "");
      const etape = String(corps.etape ?? "") as StatutSignal;
      const permis: StatutSignal[] = ["tp1", "tp2", "tp3", "gagne", "perdu", "annule", "expire"];
      if (!permis.includes(etape)) {
        return NextResponse.json({ error: `Étape « ${etape} » inconnue.` }, { status: 400 });
      }
      const prix = corps.prix === null || corps.prix === undefined ? null : Number(corps.prix);
      const signal = await avancer(
        id,
        etape,
        Number.isFinite(prix as number) ? (prix as number) : null,
        typeof corps.note === "string" ? corps.note.slice(0, 500) : null,
        `admin:${email}`,
      );
      if (!signal) return NextResponse.json({ error: "Signal introuvable." }, { status: 404 });
      return NextResponse.json({ ok: true, signal });
    }

    // ────────────────────────────────────────────────── abonnement ────
    case "premium": {
      const userId = String(corps.user_id ?? "");
      if (!userId) return NextResponse.json({ error: "user_id manquant." }, { status: 400 });

      if (corps.retirer === true) {
        await retirerPremium(userId, `admin:${email}`);
        return NextResponse.json({ ok: true, plan: "free" });
      }

      const mois = Math.min(120, Math.max(1, Number(corps.mois) || 1));
      await accorderPremium(
        userId,
        typeof corps.email === "string" ? corps.email : null,
        mois,
        `manuel:${email}`,
        null,
      );
      return NextResponse.json({ ok: true, plan: "premium", mois });
    }

    default:
      return NextResponse.json({ error: `Action « ${action} » inconnue.` }, { status: 400 });
  }
}
