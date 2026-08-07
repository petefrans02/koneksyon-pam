/**
 * LA LISTE DES SIGNAUX.
 *
 * Une seule route sert les deux plans. La différence se joue dans `servir()`,
 * côté serveur : le gratuit reçoit un objet où les niveaux valent `null`,
 * pas un objet complet accompagné d'une consigne de ne pas l'afficher.
 *
 * Cette route est aussi la source du tableau de bord, d'où les compteurs
 * agrégés : les calculer ici évite un second aller-retour au chargement de
 * la page, qui est le moment où l'utilisateur juge si le produit est rapide.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminDb } from "@/lib/admin-auth";
import { planDe, servir } from "@/lib/trading-center/acces";
import { config } from "@/lib/trading-center/config";
import { marchesActifs } from "@/lib/trading-center/marches";
import { statistiques } from "@/lib/trading-center/journal";
import { sessionDe } from "@/lib/trading-center/webhook";
import { Signal } from "@/lib/trading-center/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function utilisateur(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function GET(request: NextRequest) {
  const user = await utilisateur(request);
  const plan = await planDe(user?.id ?? null);

  const url = new URL(request.url);
  const marche = url.searchParams.get("marche");
  const limite = Math.min(100, Math.max(1, Number(url.searchParams.get("limite")) || 40));

  let requete = adminDb()
    .from("tc_signaux")
    .select("*")
    .order("publie_le", { ascending: false })
    .limit(limite);

  if (marche) requete = requete.eq("marche", marche);

  const { data, error } = await requete;

  if (error) {
    // Message explicite plutôt qu'un 500 muet : sur ce projet, l'erreur la
    // plus probable au premier lancement est « migration SQL pas encore
    // exécutée », et il faut que ça se lise sans ouvrir les journaux Vercel.
    return NextResponse.json(
      { error: `Lecture impossible : ${error.message}`, indice: "La migration supabase/trading-center.sql a-t-elle été exécutée ?" },
      { status: 503 },
    );
  }

  const signaux = (data ?? []) as Signal[];

  return NextResponse.json({
    plan,
    connecte: !!user,
    signaux: await servir(signaux, plan),
    // Les statistiques portent sur les signaux RÉELS, pas sur la version
    // masquée : un utilisateur gratuit doit voir le vrai taux de réussite.
    // C'est précisément ce qui donne envie de souscrire.
    stats: statistiques(signaux),
    marches: await marchesActifs(),
    session_actuelle: sessionDe(new Date()),
    config: {
      seuil: (await config()).seuil_confiance,
      delai_gratuit_min: (await config()).delai_gratuit_min,
      historique_gratuit: (await config()).historique_gratuit,
    },
  });
}
