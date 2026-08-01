/**
 * INSTALLATION ET DIAGNOSTIC DU BOT, EN UNE SEULE URL.
 *
 * Cette route fait tout ce qui devait être tapé à la main : elle enregistre le
 * webhook, installe la vitrine (menu, description, profil), puis demande à
 * Telegram ce qu'il en pense et renvoie le verdict en clair.
 *
 * Pourquoi côté serveur plutôt qu'en `curl` : le secret du webhook devait être
 * transmis identique à deux endroits — dans Vercel et dans l'appel à Telegram.
 * Un espace de différence, et la route répond 401 à chaque message : le bot se
 * tait, et rien ne l'explique. Ici le serveur lit **la même variable** pour les
 * deux usages, le décalage devient impossible.
 *
 * Le résultat est rédigé en français et se lit dans un navigateur : c'est un
 * outil de dépannage, pas une réponse d'API à décoder.
 */

import { NextRequest } from "next/server";
import {
  COMMANDES,
  configurer,
  enregistrerWebhook,
  identite,
  infoWebhook,
} from "@/lib/trading/telegram";

export const maxDuration = 30;

const URL_WEBHOOK = "https://koneksyonpam.com/api/telegram/trading";

export async function GET(request: NextRequest) {
  const jeton = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!jeton || !secret) {
    return Response.json(
      {
        ok: false,
        probleme: "Variables absentes sur le serveur.",
        manquant: [!jeton && "TELEGRAM_BOT_TOKEN", !secret && "TELEGRAM_WEBHOOK_SECRET"].filter(
          Boolean,
        ),
      },
      { status: 503 },
    );
  }

  const fourni =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-telegram-bot-api-secret-token");

  if (fourni !== secret) {
    return Response.json(
      {
        ok: false,
        probleme:
          "Le secret fourni ne correspond pas à TELEGRAM_WEBHOOK_SECRET. Vérifie qu'il n'y a ni espace ni retour à la ligne collé par accident.",
      },
      { status: 401 },
    );
  }

  // 1. Le token est-il seulement valide ?
  const bot = await identite(jeton);
  if (!bot) {
    return Response.json(
      {
        ok: false,
        probleme:
          "Telegram refuse ce token. TELEGRAM_BOT_TOKEN est incorrect ou incomplet — recopie-le entier depuis BotFather, chiffres avant les deux-points compris.",
      },
      { status: 502 },
    );
  }

  // 2. Le webhook, avec le secret que ce serveur connaît réellement.
  const webhook = await enregistrerWebhook(jeton, URL_WEBHOOK, secret);

  // 3. La vitrine.
  const vitrine = await configurer(jeton);

  // 4. Ce que Telegram en dit — la seule source qui explique un bot muet.
  const info = await infoWebhook(jeton);

  const tout = webhook.ok && Object.values(vitrine).every(Boolean);

  return Response.json({
    ok: tout,
    bot: bot.username ? `@${bot.username}` : "identité inconnue",
    webhook: {
      enregistre: webhook.ok,
      url: info?.url || "(aucune)",
      erreur: info?.last_error_message ?? null,
      en_attente: info?.pending_update_count ?? 0,
      detail: webhook.description ?? null,
    },
    vitrine,
    commandes: COMMANDES.map((c) => `/${c.command} — ${c.description}`),
    suite: tout
      ? `Tout est en place. Ouvre @${bot.username ?? "ton bot"} dans Telegram, envoie /start, et le clavier des paires doit apparaître.`
      : "Une partie a échoué — regarde le champ webhook.erreur ci-dessus.",
  });
}
