/**
 * LES RÉGLAGES DE L'UTILISATEUR.
 *
 * Tout ce qui est écrit ici est VALIDÉ côté serveur, y compris ce que
 * l'interface empêche déjà de saisir. Le formulaire React est une commodité
 * pour l'utilisateur, pas une garantie : une requête forgée à la main court-
 * circuite chaque contrôle du navigateur.
 *
 * Le champ qui compte vraiment est `risque_pct`. Il alimente le calcul de
 * taille de position, donc le montant réellement engagé sur un trade. Une
 * valeur négative renverrait une taille négative, un `NaN` en renverrait une
 * absurde, et 400 % viderait un compte en un trade. Le plafond à 10 % est
 * déjà très généreux.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminDb } from "@/lib/admin-auth";
import { planDe } from "@/lib/trading-center/acces";
import { codesActifs } from "@/lib/trading-center/marches";
import { ReglagesUtilisateur } from "@/lib/trading-center/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANGUES = ["fr", "ht", "en", "es"];
const THEMES = ["sombre", "clair"];

async function utilisateur(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data } = await supabase.auth.getUser();
  return data.user;
}

const DEFAUTS = {
  marches: ["XAUUSD"],
  canal_app: true,
  canal_email: true,
  canal_push: true,
  canal_telegram: false,
  telegram_chat_id: null,
  canal_sms: false,
  telephone: null,
  risque_pct: 1,
  capital: null,
  langue: "fr",
  fuseau: "America/New_York",
  theme: "sombre",
};

export async function GET(request: NextRequest) {
  const user = await utilisateur(request);
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { data } = await adminDb().from("tc_reglages").select("*").eq("user_id", user.id).maybeSingle();

  return NextResponse.json({
    plan: await planDe(user.id),
    reglages: (data as ReglagesUtilisateur) ?? { user_id: user.id, ...DEFAUTS },
    marches_disponibles: await codesActifs(),
  });
}

export async function PUT(request: NextRequest) {
  const user = await utilisateur(request);
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  let corps: Record<string, unknown>;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const disponibles = await codesActifs();

  // Un marché inconnu est écarté silencieusement plutôt que de faire échouer
  // tout l'enregistrement : si un marché est désactivé pendant que la page
  // est ouverte, l'utilisateur ne doit pas se retrouver bloqué sans
  // comprendre pourquoi son formulaire refuse de s'enregistrer.
  const marches = Array.isArray(corps.marches)
    ? corps.marches.filter((m): m is string => typeof m === "string" && disponibles.includes(m))
    : DEFAUTS.marches;

  const booleen = (v: unknown, defaut: boolean) => (typeof v === "boolean" ? v : defaut);

  const risqueBrut = Number(corps.risque_pct);
  const risque = Number.isFinite(risqueBrut) ? Math.min(10, Math.max(0.1, risqueBrut)) : 1;

  const capitalBrut = Number(corps.capital);
  const capital = Number.isFinite(capitalBrut) && capitalBrut > 0 ? Math.min(100_000_000, capitalBrut) : null;

  // Un chat_id Telegram est un entier, parfois négatif pour un groupe. Tout
  // le reste est refusé — c'est une valeur qu'on injecte dans une URL d'API.
  const chatBrut = typeof corps.telegram_chat_id === "string" ? corps.telegram_chat_id.trim() : "";
  const telegram_chat_id = /^-?\d{5,20}$/.test(chatBrut) ? chatBrut : null;

  const ligne = {
    user_id: user.id,
    marches: marches.length ? marches : DEFAUTS.marches,
    canal_app: booleen(corps.canal_app, true),
    canal_email: booleen(corps.canal_email, true),
    canal_push: booleen(corps.canal_push, true),
    // Cocher Telegram sans identifiant ne servirait à rien : on refuse le
    // canal plutôt que d'enregistrer un réglage qui ne produira jamais rien.
    canal_telegram: booleen(corps.canal_telegram, false) && !!telegram_chat_id,
    telegram_chat_id,
    canal_sms: false, // pas encore de fournisseur SMS branché — voir TRADING-CENTER.md
    telephone: typeof corps.telephone === "string" ? corps.telephone.slice(0, 24) : null,
    risque_pct: risque,
    capital,
    langue: LANGUES.includes(String(corps.langue)) ? String(corps.langue) : "fr",
    fuseau: typeof corps.fuseau === "string" && corps.fuseau.length < 64 ? corps.fuseau : "America/New_York",
    theme: THEMES.includes(String(corps.theme)) ? String(corps.theme) : "sombre",
    maj_le: new Date().toISOString(),
  };

  const { data, error } = await adminDb()
    .from("tc_reglages")
    .upsert(ligne, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, reglages: data });
}
