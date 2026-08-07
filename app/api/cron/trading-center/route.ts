/**
 * L'ENTRETIEN HORAIRE.
 *
 * Deux tâches, et une seule raison d'exister pour chacune :
 *
 * 1. **Expirer les signaux abandonnés.** Un signal qui reste « actif » pour
 *    toujours ment deux fois : il occupe le tableau de bord avec une position
 *    que plus personne ne tient, et il reste hors du calcul du taux de
 *    réussite, ce qui embellit le relevé en cachant les cas non résolus.
 *
 * 2. **Signaler le silence.** C'est la tâche la plus importante des deux. Une
 *    alerte TradingView expirée s'éteint sans prévenir personne, et son
 *    silence est indiscernable d'un filtre qui fait bien son travail. Ce cron
 *    fait la différence et prévient l'administrateur.
 *
 * Le contrôle du secret suit la convention des autres crons du projet, en
 * production seulement, pour rester déclenchable à la main en local.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";
import { diagnostiquer } from "@/lib/trading-center/sante";
import { expirerAnciens } from "@/lib/trading-center/signaux";
import { isAdminEmail } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Une seule alerte de silence toutes les 12 h : au-delà, c'est du harcèlement. */
const RAPPEL_H = 12;

export async function GET(request: NextRequest) {
  const entete = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && entete !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actions: string[] = [];

  const expires = await expirerAnciens();
  if (expires > 0) actions.push(`${expires} signal(aux) expiré(s) faute de résolution.`);

  const sante = await diagnostiquer();

  if (sante.alerte) {
    const db = adminDb();

    // On ne renotifie pas si une alerte identique est déjà partie récemment.
    // Sans ce contrôle, un webhook cassé un vendredi soir produit vingt-quatre
    // notifications identiques avant le lundi matin — et la vingt-quatrième
    // ne sera pas plus lue que la première.
    const depuis = new Date(Date.now() - RAPPEL_H * 3_600_000).toISOString();
    const { count } = await db
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("type", "announcement")
      .ilike("title_fr", "%Trading Center%")
      .gte("created_at", depuis);

    if (!count) {
      // Les administrateurs sont identifiés par leur email dans les
      // abonnements ; c'est la seule table qui associe un user_id à un email
      // sans passer par l'API d'administration de Supabase.
      const { data: comptes } = await db.from("tc_abonnements").select("user_id, email");
      const admins = ((comptes ?? []) as { user_id: string; email: string | null }[])
        .filter((c) => c.email && isAdminEmail(c.email));

      if (admins.length) {
        await db.from("notifications").insert(
          admins.map((a) => ({
            user_id: a.user_id,
            type: "announcement",
            title_fr: "⚠️ Trading Center — flux interrompu",
            title_en: "⚠️ Trading Center — feed interrupted",
            body_fr: sante.diagnostic,
            body_en: sante.diagnostic,
            link: "/admin/trading-center",
          })),
        );
        actions.push(`Alerte de silence envoyée à ${admins.length} administrateur(s).`);
      } else {
        actions.push("Silence détecté, mais aucun administrateur identifiable à prévenir.");
      }
    }
  }

  return NextResponse.json({ ok: true, actions, sante });
}
