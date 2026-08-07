/**
 * LA SURVEILLANCE DU SILENCE.
 *
 * Le défaut le plus dangereux de ce système n'est pas un mauvais signal :
 * c'est l'ABSENCE de signal qui ressemble à un marché calme.
 *
 * Une alerte TradingView arrivée à sa date d'expiration s'éteint sans
 * prévenir personne. Une clé API révoquée, un secret modifié d'un côté
 * seulement, un script Pine retiré du graphique par erreur : tous produisent
 * exactement la même chose côté utilisateur — rien. Et « rien » se confond
 * avec « le filtre fait bien son travail », qui est le fonctionnement normal
 * et attendu de la plateforme.
 *
 * D'où ce fichier : il distingue les deux. « Aucune alerte reçue depuis 26 h
 * un mercredi » n'est pas un marché calme, c'est un robinet fermé — parce que
 * le script Pine émet un battement de cœur à chaque clôture de bougie, même
 * quand il n'a rien à signaler.
 */

import { adminDb } from "@/lib/admin-auth";
import { sessionDe } from "./webhook";

export interface Sante {
  /** true quand quelque chose demande une intervention. */
  alerte: boolean;
  /** Le diagnostic, en une phrase lisible. */
  diagnostic: string;
  derniere_alerte: string | null;
  heures_silence: number | null;
  alertes_24h: number;
  signaux_7j: number;
  secret_configure: boolean;
  ia_configuree: boolean;
  email_configure: boolean;
  push_configure: boolean;
}

/** Au-delà, en semaine, le silence n'est plus imputable au marché. */
const SEUIL_SILENCE_H = 24;

export async function diagnostiquer(): Promise<Sante> {
  const db = adminDb();

  const secret_configure = !!process.env.TRADINGVIEW_WEBHOOK_SECRET;
  const ia_configuree = !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY);
  const email_configure = !!process.env.GMAIL_APP_PASSWORD;
  const push_configure = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

  const base: Sante = {
    alerte: false,
    diagnostic: "",
    derniere_alerte: null,
    heures_silence: null,
    alertes_24h: 0,
    signaux_7j: 0,
    secret_configure,
    ia_configuree,
    email_configure,
    push_configure,
  };

  // Une configuration incomplète prime sur tout le reste : inutile
  // d'analyser un silence quand la porte n'est même pas ouverte.
  if (!secret_configure) {
    return {
      ...base,
      alerte: true,
      diagnostic: "TRADINGVIEW_WEBHOOK_SECRET n'est pas défini : le webhook refuse TOUTES les alertes.",
    };
  }

  const { data: derniere } = await db
    .from("tc_alertes")
    .select("recu_le")
    .order("recu_le", { ascending: false })
    .limit(1)
    .maybeSingle();

  const il24h = new Date(Date.now() - 86_400_000).toISOString();
  const il7j = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { count: alertes24 } = await db
    .from("tc_alertes")
    .select("id", { count: "exact", head: true })
    .gte("recu_le", il24h);

  const { count: signaux7 } = await db
    .from("tc_signaux")
    .select("id", { count: "exact", head: true })
    .gte("publie_le", il7j);

  const recu = (derniere as { recu_le: string } | null)?.recu_le ?? null;
  const heures = recu ? Math.round((Date.now() - new Date(recu).getTime()) / 3_600_000) : null;

  const etat: Sante = {
    ...base,
    derniere_alerte: recu,
    heures_silence: heures,
    alertes_24h: alertes24 ?? 0,
    signaux_7j: signaux7 ?? 0,
  };

  if (recu === null) {
    return {
      ...etat,
      alerte: true,
      diagnostic: "Aucune alerte n'a JAMAIS été reçue. L'alerte TradingView est-elle créée, avec la bonne URL et le bon secret ?",
    };
  }

  // Le week-end, le silence est normal et attendu : on ne crie pas.
  const enSeance = sessionDe(new Date()) !== "hors-session";
  if (heures !== null && heures > SEUIL_SILENCE_H && enSeance) {
    return {
      ...etat,
      alerte: true,
      diagnostic: `Aucune alerte depuis ${heures} h alors que le marché est ouvert. Vérifie que l'alerte TradingView est toujours active et « Open-ended » (sans date d'expiration).`,
    };
  }

  return {
    ...etat,
    alerte: false,
    diagnostic:
      etat.alertes_24h > 0
        ? `${etat.alertes_24h} alertes reçues en 24 h, ${etat.signaux_7j} signaux publiés sur 7 jours. Le flux est vivant.`
        : "Flux au repos — normal hors séance.",
  };
}
