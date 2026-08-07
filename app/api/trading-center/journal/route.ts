/**
 * LE JOURNAL — rapports jour / semaine / mois.
 *
 * Réservé au Premium, et c'est la seule fonctionnalité entièrement fermée au
 * gratuit. Le raisonnement : les statistiques GLOBALES restent publiques
 * (route `/signaux`), parce qu'un visiteur doit pouvoir vérifier que le
 * système est honnête avant de payer. Le journal DÉTAILLÉ — courbe de
 * capital, performance par séance, par tranche de confiance — est l'outil de
 * travail, et c'est ce qu'on vend.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminDb } from "@/lib/admin-auth";
import { planDe } from "@/lib/trading-center/acces";
import {
  Periode,
  courbe,
  manquePourConclure,
  parConfiance,
  parSession,
  rapport,
  statistiques,
} from "@/lib/trading-center/journal";
import { Signal } from "@/lib/trading-center/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PERIODES: Periode[] = ["jour", "semaine", "mois", "tout"];

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data: auth } = await supabase.auth.getUser();
  const plan = await planDe(auth.user?.id ?? null);

  if (plan !== "premium") {
    return NextResponse.json(
      { error: "Le journal complet est réservé au plan Premium.", plan },
      { status: 403 },
    );
  }

  const marche = new URL(request.url).searchParams.get("marche");

  let requete = adminDb().from("tc_signaux").select("*").order("publie_le", { ascending: false }).limit(1000);
  if (marche) requete = requete.eq("marche", marche);

  const { data, error } = await requete;
  if (error) return NextResponse.json({ error: error.message }, { status: 503 });

  const signaux = (data ?? []) as Signal[];

  return NextResponse.json({
    plan,
    global: statistiques(signaux),
    manque_pour_conclure: manquePourConclure(signaux),
    rapports: PERIODES.map((p) => {
      const r = rapport(signaux, p);
      // On ne renvoie pas les signaux de chaque période : quatre copies du
      // même tableau alourdiraient la réponse sans rien apporter, la liste
      // complète étant déjà servie par la route /signaux.
      return { periode: r.periode, debut: r.debut, stats: r.stats };
    }),
    courbe: courbe(signaux),
    par_confiance: parConfiance(signaux),
    par_session: parSession(signaux),
  });
}
