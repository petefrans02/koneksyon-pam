/**
 * LA CONFIGURATION DU BOT, EN UN APPEL.
 *
 * Menu de commandes, description, texte de profil, bouton de menu — tout ce
 * que BotFather fait taper à la main. Le faire par l'API garde la vitrine dans
 * le dépôt : elle se relit, se corrige et se rejoue comme du code, au lieu de
 * vivre dans un fil de conversation qu'on ne retrouve plus six mois après.
 *
 * Idempotent : rejouable autant de fois qu'on veut.
 *
 * Protégé par le même secret que le webhook — sans quoi n'importe qui pourrait
 * réécrire la vitrine du bot.
 */

import { NextRequest } from "next/server";
import { COMMANDES, configurer } from "@/lib/trading/telegram";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const jeton = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!jeton || !secret) {
    return Response.json({ error: "Configuration Telegram absente." }, { status: 503 });
  }

  const fourni =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-telegram-bot-api-secret-token");

  if (fourni !== secret) {
    return Response.json({ error: "Secret invalide." }, { status: 401 });
  }

  const resultats = await configurer(jeton);
  const tout = Object.values(resultats).every(Boolean);

  return Response.json({
    ok: tout,
    resultats,
    commandes: COMMANDES.map((c) => `/${c.command} — ${c.description}`),
    message: tout
      ? "Vitrine enregistrée. Rouvre la conversation dans Telegram pour voir le menu."
      : "Une partie de la configuration a échoué — voir les journaux.",
  });
}
