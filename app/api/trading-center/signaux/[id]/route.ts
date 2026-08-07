/**
 * UN SIGNAL, EN DÉTAIL.
 *
 * Renvoie le signal, son fil de vie complet, et — pour un Premium ayant
 * renseigné son capital — la taille de position calculée pour SON risque.
 *
 * Le calcul de taille se fait au serveur et pas dans le navigateur. Ce n'est
 * pas une question de sécurité mais d'exactitude : c'est le seul chiffre de
 * la page qui engage directement de l'argent, il doit être écrit une seule
 * fois, au même endroit que le reste de la logique, et pas dupliqué dans un
 * composant React où personne ne le relira.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminDb } from "@/lib/admin-auth";
import { masquer, planDe, taillePosition } from "@/lib/trading-center/acces";
import { config } from "@/lib/trading-center/config";
import { trouverMarche } from "@/lib/trading-center/marches";
import { ReglagesUtilisateur, Signal } from "@/lib/trading-center/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Un identifiant qui n'a pas la forme d'un UUID ne peut correspondre à
  // rien : on répond 404 sans interroger la base.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Signal introuvable." }, { status: 404 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  const plan = await planDe(user?.id ?? null);

  const db = adminDb();
  const { data } = await db.from("tc_signaux").select("*").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Signal introuvable." }, { status: 404 });

  const signal = data as Signal;
  const c = await config();
  const servi = masquer(signal, plan, c.delai_gratuit_min);

  const { data: evenements } = await db
    .from("tc_evenements")
    .select("type, prix, note, auteur, cree_le")
    .eq("signal_id", id)
    .order("cree_le", { ascending: true });

  // Taille de position : seulement si l'utilisateur voit réellement les
  // niveaux. La calculer sur un signal verrouillé reviendrait à livrer
  // l'entrée et le stop par un canal détourné — il suffirait de résoudre
  // l'équation à l'envers.
  let position: { unites: number; risque_montant: number; risque_pct: number } | null = null;

  if (user && !servi.verrouille) {
    const { data: r } = await db.from("tc_reglages").select("*").eq("user_id", user.id).maybeSingle();
    const reglages = r as ReglagesUtilisateur | null;
    if (reglages?.capital) {
      const unites = taillePosition(reglages.capital, reglages.risque_pct, signal.entree, signal.stop);
      if (unites) {
        position = {
          unites,
          risque_montant: Math.round(reglages.capital * (reglages.risque_pct / 100) * 100) / 100,
          risque_pct: reglages.risque_pct,
        };
      }
    }
  }

  return NextResponse.json({
    plan,
    signal: servi,
    marche: await trouverMarche(signal.marche),
    evenements: evenements ?? [],
    position,
  });
}
