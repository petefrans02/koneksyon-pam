/**
 * QUI VOIT QUOI.
 *
 * Deux plans, et une seule différence qui compte : le PREMIUM reçoit les
 * niveaux tout de suite, le GRATUIT les reçoit avec un retard configurable.
 *
 * ── Le masquage se fait au SERVEUR, jamais à l'écran ──────────────────────
 *
 * C'est le point non négociable de ce fichier. Un signal envoyé complet au
 * navigateur puis flouté en CSS se lit avec la touche F12. Le premier
 * utilisateur qui s'en aperçoit a raison de ne plus jamais payer, et il le
 * dira. `masquer()` remplace donc les valeurs par `null` AVANT la sérialisation
 * de la réponse : ce qui n'est pas envoyé ne peut pas être lu.
 *
 * ── Ce que le gratuit garde ───────────────────────────────────────────────
 *
 * Le sens, la confiance, le marché, la tendance, la séance, l'heure. C'est
 * assez pour constater que le système a raison, pas assez pour trader la
 * position. La promesse commerciale tient sans jamais mentir sur le contenu.
 */

import { adminDb } from "@/lib/admin-auth";
import { config } from "./config";
import { Abonnement, Plan, Signal, SignalServi } from "./types";

/**
 * Le plan d'un utilisateur.
 *
 * Un abonnement expiré redevient `free` silencieusement — la ligne reste en
 * base, ce qui permet de voir l'historique et de réactiver sans ressaisie.
 * Une erreur de lecture renvoie `free` : en cas de doute on donne MOINS
 * d'accès, jamais plus.
 */
export async function planDe(userId: string | null): Promise<Plan> {
  if (!userId) return "free";

  try {
    const { data, error } = await adminDb()
      .from("tc_abonnements")
      .select("plan, fin")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return "free";

    const abo = data as { plan: Plan; fin: string | null };
    if (abo.plan !== "premium") return "free";
    if (abo.fin && new Date(abo.fin).getTime() < Date.now()) return "free";
    return "premium";
  } catch {
    return "free";
  }
}

/** Charge l'abonnement complet — utilisé par la page compte et l'admin. */
export async function abonnementDe(userId: string): Promise<Abonnement | null> {
  const { data } = await adminDb()
    .from("tc_abonnements")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as Abonnement) ?? null;
}

/**
 * Accorde ou prolonge un premium.
 *
 * Prolonger PART DE LA FIN EXISTANTE quand elle est dans le futur, et de
 * maintenant sinon. Sans cette distinction, un utilisateur qui renouvelle
 * trois jours avant l'échéance perd ces trois jours — le genre de détail qui
 * ne se voit qu'en production, dans un message de réclamation.
 */
export async function accorderPremium(
  userId: string,
  email: string | null,
  mois: number,
  source: string,
  reference: string | null,
): Promise<void> {
  const existant = await abonnementDe(userId);
  const base =
    existant?.plan === "premium" && existant.fin && new Date(existant.fin).getTime() > Date.now()
      ? new Date(existant.fin)
      : new Date();

  const fin = new Date(base);
  fin.setMonth(fin.getMonth() + mois);

  await adminDb().from("tc_abonnements").upsert(
    {
      user_id: userId,
      email,
      plan: "premium",
      debut: existant?.debut ?? new Date().toISOString(),
      fin: fin.toISOString(),
      source,
      reference,
      maj_le: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

/** Retire le premium — remboursement, litige, ou décision d'administration. */
export async function retirerPremium(userId: string, raison: string): Promise<void> {
  await adminDb()
    .from("tc_abonnements")
    .update({ plan: "free", fin: new Date().toISOString(), source: `retire: ${raison}`, maj_le: new Date().toISOString() })
    .eq("user_id", userId);
}

/**
 * Applique le plan à un signal.
 *
 * Le délai ne court pas pendant que le signal est actif seulement : il court
 * depuis la publication. Un signal déjà clôturé est donc entièrement visible
 * par tout le monde — cacher les niveaux d'un trade terminé n'apporte rien
 * commercialement et empêche le gratuit de vérifier que le système est
 * honnête, ce qui est exactement ce qui fait souscrire.
 */
export function masquer(signal: Signal, plan: Plan, delaiMinutes: number): SignalServi {
  const ageMinutes = (Date.now() - new Date(signal.publie_le).getTime()) / 60000;
  const termine = signal.statut !== "actif" && signal.statut !== "tp1" && signal.statut !== "tp2";
  const verrouille = plan === "free" && !termine && ageMinutes < delaiMinutes;

  if (!verrouille) {
    return { ...signal, verrouille: false, deverrouille_dans: null };
  }

  return {
    ...signal,
    entree: null,
    stop: null,
    tp1: null,
    tp2: null,
    tp3: null,
    zone_bas: null,
    zone_haut: null,
    // L'explication de l'IA cite les niveaux : la laisser passerait par la
    // fenêtre ce qu'on ferme par la porte.
    explication_ia: null,
    indicateurs: null,
    verrouille: true,
    deverrouille_dans: Math.max(1, Math.ceil(delaiMinutes - ageMinutes)),
  };
}

/** Applique le masquage et la limite d'historique en une passe. */
export async function servir(signaux: Signal[], plan: Plan): Promise<SignalServi[]> {
  const c = await config();
  const limites = plan === "free" ? signaux.slice(0, c.historique_gratuit) : signaux;
  return limites.map((s) => masquer(s, plan, c.delai_gratuit_min));
}

/**
 * Taille de position, en unités de l'actif.
 *
 * Volontairement dans ce fichier et pas dans l'interface : c'est un calcul
 * qui engage de l'argent réel, il doit être écrit une seule fois et testé.
 *
 * capital × risque% ÷ distance au stop. Rien de plus. Le résultat n'est PAS
 * arrondi vers le haut — arrondir vers le haut fait dépasser le risque
 * accepté, ce qui est la seule direction où l'erreur coûte.
 */
export function taillePosition(
  capital: number | null,
  risquePct: number,
  entree: number,
  stop: number,
): number | null {
  if (!capital || capital <= 0) return null;
  const distance = Math.abs(entree - stop);
  if (distance <= 0) return null;
  const montantRisque = capital * (risquePct / 100);
  return Math.floor((montantRisque / distance) * 100) / 100;
}
