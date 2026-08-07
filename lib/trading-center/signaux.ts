/**
 * LE PARCOURS D'UNE ALERTE.
 *
 * Un seul chemin, huit portes, et chaque porte peut renvoyer l'alerte chez
 * elle. C'est ce qui donne son sens à la promesse « ne jamais spammer » :
 * l'immense majorité des alertes TradingView doivent mourir ici.
 *
 *   1. Le secret est-il le bon ?                    (webhook.ts)
 *   2. La charge utile est-elle cohérente ?         (webhook.ts)
 *   3. Le marché est-il en service ?
 *   4. N'a-t-on pas déjà publié sur ce marché ?     ← anti-doublon
 *   5. Le quota du jour est-il épuisé ?             ← anti-spam
 *   6. Le score déterministe passe-t-il ?           (score.ts)
 *   7. L'IA ne voit-elle pas un défaut ?            (ia.ts)
 *   8. Le total franchit-il le seuil ?
 *
 * ── Ce qui est écrit même en cas de refus ─────────────────────────────────
 *
 * TOUT. Chaque alerte laisse une ligne dans `tc_alertes` avec son statut, sa
 * raison et son score. Sans cela, un signal attendu qui n'arrive pas laisse
 * devant trois hypothèses indiscernables : TradingView n'a pas tiré, le
 * webhook est cassé, ou le filtre a fait son travail. Avec cette table, la
 * réponse tient en une requête.
 */

import { adminDb } from "@/lib/admin-auth";
import { config } from "./config";
import { filtrer } from "./ia";
import { codesActifs, enPips, trouverMarche } from "./marches";
import { estimerDuree, noter, redigerRaison } from "./score";
import {
  AlerteTradingView,
  AlerteValide,
  MINUTES_UNITE,
  Signal,
  StatutAlerte,
  StatutSignal,
  VerdictIA,
} from "./types";
import { AlerteInvalide, valider } from "./webhook";

export interface Resultat {
  statut: StatutAlerte;
  raison: string | null;
  signal: Signal | null;
  score_brut: number | null;
  score_final: number | null;
  verdict: VerdictIA | null;
}

/** Journalise l'alerte, quoi qu'il lui soit arrivé. Ne lève jamais. */
async function tracer(
  charge: AlerteTradingView,
  marche: string | null,
  r: Resultat,
  ms: number,
): Promise<void> {
  try {
    await adminDb().from("tc_alertes").insert({
      marche,
      charge,
      statut: r.statut,
      raison: r.raison,
      score_brut: r.score_brut,
      score_ia: r.score_final,
      signal_id: r.signal?.id ?? null,
      ms,
    });
  } catch (e) {
    // La traçabilité ne doit jamais faire échouer la publication d'un signal
    // valide. On perd la ligne de journal, pas le signal.
    console.error("[trading-center/tracer]", e instanceof Error ? e.message : e);
  }
}

/** Le dernier signal publié sur un marché — sert à l'anti-doublon. */
async function dernierSignal(marche: string): Promise<{ publie_le: string; sens: string } | null> {
  const { data } = await adminDb()
    .from("tc_signaux")
    .select("publie_le, sens")
    .eq("marche", marche)
    .order("publie_le", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { publie_le: string; sens: string }) ?? null;
}

/** Nombre de signaux publiés aujourd'hui sur un marché — sert au quota. */
async function compteDuJour(marche: string): Promise<number> {
  const debut = new Date();
  debut.setUTCHours(0, 0, 0, 0);
  const { count } = await adminDb()
    .from("tc_signaux")
    .select("id", { count: "exact", head: true })
    .eq("marche", marche)
    .gte("publie_le", debut.toISOString());
  return count ?? 0;
}

/**
 * Traite une alerte de bout en bout.
 *
 * Ne lève jamais : une exception non attrapée renverrait un 500 à
 * TradingView, qui réessaierait, ce qui multiplierait le problème au lieu de
 * le signaler.
 */
export async function traiter(charge: AlerteTradingView): Promise<Resultat> {
  const depart = Date.now();
  const fin = (r: Resultat, marche: string | null = null): Promise<Resultat> =>
    tracer(charge, marche, r, Date.now() - depart).then(() => r);

  const vide = { signal: null, score_brut: null, score_final: null, verdict: null };

  // ── portes 2 et 3 : forme et marché ───────────────────────────────────
  let a: AlerteValide;
  try {
    a = valider(charge, await codesActifs());
  } catch (e) {
    if (e instanceof AlerteInvalide) {
      return fin({ ...vide, statut: e.statut, raison: e.message }, typeof charge.marche === "string" ? charge.marche : null);
    }
    return fin({ ...vide, statut: "erreur", raison: e instanceof Error ? e.message : "erreur inconnue" });
  }

  const marche = await trouverMarche(a.marche);
  if (!marche) {
    return fin({ ...vide, statut: "rejetee_marche", raison: "Marché introuvable." }, a.marche);
  }

  const c = await config();

  // ── porte 4 : anti-doublon ────────────────────────────────────────────
  //
  // Deux signaux à quelques minutes d'intervalle sur le même marché, c'est
  // le même setup vu deux fois — le script Pine tire souvent à chaque
  // clôture de bougie tant que la condition tient. Sans ce garde-fou, une
  // configuration valide qui dure une heure produit vingt notifications, et
  // c'est précisément ce qu'on a promis de ne jamais faire.
  const dernier = await dernierSignal(a.marche);
  if (dernier) {
    const minutes = (Date.now() - new Date(dernier.publie_le).getTime()) / 60000;
    if (minutes < c.anti_doublon_min) {
      return fin(
        {
          ...vide,
          statut: "rejetee_doublon",
          raison: `Signal ${dernier.sens} publié il y a ${Math.round(minutes)} min (délai minimal : ${c.anti_doublon_min} min).`,
        },
        a.marche,
      );
    }
  }

  // ── porte 5 : quota journalier ────────────────────────────────────────
  const dujour = await compteDuJour(a.marche);
  if (dujour >= c.max_signaux_jour) {
    return fin(
      { ...vide, statut: "rejetee_cadence", raison: `Quota atteint : ${dujour} signaux publiés aujourd'hui sur ${a.marche}.` },
      a.marche,
    );
  }

  // ── porte 6 : le score déterministe ───────────────────────────────────
  const score = noter(a, c.rr_minimum, c.sessions_autorisees);

  if (score.disqualifiants.length > 0) {
    const horsSeance = score.disqualifiants.some((d) => d.includes("séance") || d.includes("fermé"));
    return fin(
      {
        ...vide,
        statut: horsSeance ? "rejetee_session" : "rejetee_score",
        raison: score.disqualifiants.join(" · "),
        score_brut: score.valeur,
      },
      a.marche,
    );
  }

  // L'IA ne peut ajouter que 15 points. En dessous de seuil-15, l'appel est
  // perdu d'avance : on économise la latence et le coût du modèle sur ce qui
  // sera de toute façon la majorité des alertes.
  if (score.valeur < c.seuil_confiance - 15) {
    return fin(
      {
        ...vide,
        statut: "rejetee_score",
        raison: `Score ${score.valeur} — hors d'atteinte du seuil de ${c.seuil_confiance}, même avec l'arbitrage maximal de l'IA.`,
        score_brut: score.valeur,
      },
      a.marche,
    );
  }

  // ── porte 7 : le filtre IA ────────────────────────────────────────────
  const verdict = c.ia_active
    ? await filtrer(a, score, marche, c.ia_modele)
    : { valide: true, ajustement: 0, drapeaux: [], explication: "", refus: null, modele: "desactivee" };

  if (!verdict.valide) {
    return fin(
      {
        ...vide,
        statut: "rejetee_ia",
        raison: verdict.refus ?? "Refusé par le filtre IA.",
        score_brut: score.valeur,
        score_final: score.valeur + verdict.ajustement,
        verdict,
      },
      a.marche,
    );
  }

  // ── porte 8 : le seuil ────────────────────────────────────────────────
  const finale = Math.max(0, Math.min(100, score.valeur + verdict.ajustement));
  if (finale < c.seuil_confiance) {
    return fin(
      {
        ...vide,
        statut: "rejetee_score",
        raison: `Confiance finale ${finale}% — sous le seuil de ${c.seuil_confiance}%.`,
        score_brut: score.valeur,
        score_final: finale,
        verdict,
      },
      a.marche,
    );
  }

  // ── publication ───────────────────────────────────────────────────────
  const duree = estimerDuree(a, MINUTES_UNITE[a.unite]);

  const { data, error } = await adminDb()
    .from("tc_signaux")
    .insert({
      marche: a.marche,
      sens: a.sens,
      confiance: finale,
      prix_actuel: a.prix,
      zone_bas: a.plan.zone_bas,
      zone_haut: a.plan.zone_haut,
      entree: a.plan.entree,
      stop: a.plan.stop,
      tp1: a.plan.tp1,
      tp2: a.plan.tp2,
      tp3: a.plan.tp3,
      rr: Math.round(a.rr * 100) / 100,
      duree_texte: duree?.texte ?? null,
      duree_minutes: duree?.minutes ?? null,
      tendance: a.tendance,
      session: a.session,
      unite: a.unite,
      unites: a.unites,
      indicateurs: a.indicateurs,
      raison: redigerRaison(score),
      explication_ia: verdict.explication || null,
      drapeaux_ia: verdict.drapeaux,
      capture_url: a.capture_url,
      statut: "actif",
    })
    .select("*")
    .single();

  if (error || !data) {
    return fin(
      {
        ...vide,
        statut: "erreur",
        raison: `Écriture impossible : ${error?.message ?? "aucune ligne"}`,
        score_brut: score.valeur,
        score_final: finale,
        verdict,
      },
      a.marche,
    );
  }

  const signal = data as Signal;
  await journaliser(signal.id, "publie", signal.prix_actuel, `Confiance ${finale}% · ${verdict.modele}`);

  return fin(
    { statut: "publiee", raison: null, signal, score_brut: score.valeur, score_final: finale, verdict },
    a.marche,
  );
}

// ═══════════════════════════════════════════════════════ cycle de vie ══════

/** Ajoute une ligne au fil de vie d'un signal. */
export async function journaliser(
  signalId: string,
  type: string,
  prix: number | null,
  note: string | null,
  auteur = "systeme",
): Promise<void> {
  await adminDb().from("tc_evenements").insert({ signal_id: signalId, type, prix, note, auteur });
}

/** Les signaux encore en vie — pour le suivi et le tableau de bord. */
export async function signauxOuverts(): Promise<Signal[]> {
  const { data } = await adminDb()
    .from("tc_signaux")
    .select("*")
    .in("statut", ["actif", "tp1", "tp2"])
    .order("publie_le", { ascending: false });
  return (data ?? []) as Signal[];
}

/**
 * Fait avancer un signal : objectif atteint, stop touché, ou clôture.
 *
 * Le multiple de R est calculé sur la distance au stop D'ORIGINE, jamais sur
 * un stop déplacé. C'est ce qui rend les résultats comparables entre eux :
 * un trade dont on a remonté le stop à l'équilibre puis encaissé +2R doit
 * compter +2R, pas « +∞ parce que le risque final était nul ».
 */
export async function avancer(
  signalId: string,
  etape: StatutSignal,
  prix: number | null,
  note: string | null,
  auteur = "systeme",
): Promise<Signal | null> {
  const { data: avant } = await adminDb().from("tc_signaux").select("*").eq("id", signalId).maybeSingle();
  if (!avant) return null;

  const s = avant as Signal;
  const marche = await trouverMarche(s.marche);
  const risque = Math.abs(s.entree - s.stop);
  const sortie = prix ?? (etape === "perdu" ? s.stop : etape === "tp1" ? s.tp1 : etape === "tp2" ? s.tp2 ?? s.tp1 : etape === "tp3" ? s.tp3 ?? s.tp2 ?? s.tp1 : s.prix_actuel);

  const gain = s.sens === "BUY" ? sortie - s.entree : s.entree - sortie;
  const r = risque > 0 ? Math.round((gain / risque) * 100) / 100 : null;

  // Un TP1 ou TP2 touché n'est pas une clôture : la position reste ouverte
  // sur le reste. Seuls gagne/perdu/annule/expire ferment le signal.
  const cloture = ["gagne", "perdu", "annule", "expire"].includes(etape);

  const maj: Record<string, unknown> = { statut: etape };
  if (cloture) {
    maj.cloture_le = new Date().toISOString();
    maj.prix_sortie = sortie;
    maj.pips = enPips(gain, marche);
    maj.r_realise = r;
    maj.resultat =
      etape === "gagne" ? "gagne" : etape === "perdu" ? "perdu" : gain > 0 ? "gagne" : gain < 0 ? "perdu" : "neutre";
    if (note) maj.notes_suivi = note;
  }

  const { data } = await adminDb().from("tc_signaux").update(maj).eq("id", signalId).select("*").single();
  await journaliser(signalId, etape, sortie, note, auteur);

  return (data as Signal) ?? null;
}

/**
 * Expire les signaux dont la durée estimée est largement dépassée.
 *
 * « Largement » = trois fois la durée annoncée, avec un plancher de six
 * heures. Un signal laissé « actif » indéfiniment pollue deux fois : il
 * occupe le tableau de bord avec une position que personne ne tient plus, et
 * il fausse le taux de réussite en restant hors du calcul pour toujours.
 *
 * L'expiration est marquée `neutre`, jamais `perdu` : on ne sait pas ce qui
 * s'est passé, et compter une perte qu'on n'a pas mesurée serait aussi
 * malhonnête que compter un gain.
 */
export async function expirerAnciens(): Promise<number> {
  const ouverts = await signauxOuverts();
  let expires = 0;

  for (const s of ouverts) {
    const limite = Math.max(360, (s.duree_minutes ?? 240) * 3);
    const age = (Date.now() - new Date(s.publie_le).getTime()) / 60000;
    if (age > limite) {
      await avancer(s.id, "expire", null, `Sans résolution après ${Math.round(age / 60)} h.`);
      expires++;
    }
  }
  return expires;
}
