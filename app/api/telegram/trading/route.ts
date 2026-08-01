/**
 * LE BOT TELEGRAM.
 *
 * L'élève envoie « eurusd », le bot répond en quelques secondes avec le sens,
 * la durée exacte à saisir, les niveaux et le raisonnement — sur de vraies
 * bougies, pas sur une capture d'écran.
 *
 * Ce que ce bot N'EST PAS, et c'est délibéré : il n'envoie jamais rien de
 * lui-même. Pas de « BUY EUR/USD 5 SEC » à intervalles réguliers. Un bot qui
 * pousse des signaux sans qu'on les demande n'a aucun moyen de savoir si le
 * moment est bon — il sait seulement qu'il doit poster. C'est ce qui distingue
 * un outil de lecture d'une machine à faire cliquer.
 *
 * Le raisonnement est toujours affiché avec le verdict. Un score de 70 qu'on
 * ne peut pas décomposer ne vaut rien, et c'est précisément le reproche qu'on
 * fait aux canaux de signaux : ils donnent la conclusion sans la démonstration.
 *
 * Sécurité : Telegram signe ses appels par un jeton secret placé dans l'en-tête
 * `X-Telegram-Bot-Api-Secret-Token`. Sans cette vérification, n'importe qui
 * connaissant l'URL pourrait faire parler le bot.
 */

import { NextRequest } from "next/server";
import { Unite } from "@/lib/trading/marche";
import {
  ErreurMarche,
  MINUTES,
  estOTC,
  normaliserSymbole,
  plusieursUnites,
} from "@/lib/trading/marche";
import { Lecture, Synthese, lire, synthetiser } from "@/lib/trading/lecture";

export const maxDuration = 60;

const API = "https://api.telegram.org/bot";

/** Les unités qu'on lit par défaut : assez pour la confluence, sous le plafond de 8 appels/minute. */
const UNITES_PAR_DEFAUT: Unite[] = ["M1", "M5", "M15", "H1"];

// ------------------------------------------------------------- Telegram ----

interface Message {
  message_id: number;
  chat: { id: number };
  text?: string;
  photo?: unknown[];
}

async function envoyer(chatId: number, texte: string, jeton: string): Promise<void> {
  try {
    await fetch(`${API}${jeton}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: texte,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("[telegram] envoi", e instanceof Error ? e.message : e);
  }
}

// ------------------------------------------------------------- rédaction ---

const FLECHE = { achat: "🟢 BUY", vente: "🔴 SELL", attendre: "⚪️ ATTENDRE" } as const;
const TENDANCE = { haussiere: "haussière", baissiere: "baissière", range: "range" } as const;

/** Assez de décimales pour du forex, pas trop pour une action. */
const prix = (n: number) => (n < 20 ? n.toFixed(5) : n.toFixed(2));

function ligneUnite(l: Lecture, retenu: string): string {
  const marque = l.sens === retenu ? "✓" : l.sens === "attendre" ? "·" : "✗";
  return `${marque} <b>${l.unite}</b> ${FLECHE[l.sens].slice(2)} ${l.confiance}% — ${TENDANCE[l.tendance]}`;
}

function redigerSynthese(s: Synthese): string {
  const e = s.entree;
  const d = e?.couverte ?? e?.directe ?? null;

  const lignes: string[] = [
    `<b>${s.symbole}</b>`,
    "",
    `<b>${FLECHE[s.sens]}</b>${d ? `   ⏱ <code>${d.temps}</code>` : ""}`,
    `Confiance ${s.confiance}% · accord ${s.accord}% · ${s.alignement}`,
    "",
  ];

  lignes.push("<b>Les unités de temps</b>");
  for (const l of s.lectures) lignes.push(ligneUnite(l, s.sens));
  lignes.push("");

  if (e && d) {
    lignes.push(`<b>Entrée en ${e.unite}</b> — prix ${prix(e.prix)}`);
    lignes.push(
      `${d.bougies} bougie${d.bougies > 1 ? "s" : ""} de ${MINUTES[e.unite]} min, arrondi à la durée sélectionnable au-dessus.`,
    );
    if (e.couverte && e.directe && e.couverte.secondes !== e.directe.secondes) {
      lignes.push(`Sans repli : <code>${e.directe.temps}</code>`);
    }
    lignes.push("Chrono à lancer à la clôture de la bougie en cours.");
    lignes.push("");

    if (e.objectif) lignes.push(`🎯 Objectif ${prix(e.objectif.price)} (${e.objectif.touches} touches)`);
    if (e.obstacle) lignes.push(`⚠️ Obstacle ${prix(e.obstacle.price)} (${e.obstacle.touches} touches)`);
    lignes.push("");

    lignes.push("<b>Pourquoi</b>");
    for (const r of e.raisons) lignes.push(`· ${r}`);
  } else {
    const l = s.lectures[0];
    if (l) {
      lignes.push("<b>Pourquoi on n'entre pas</b>");
      for (const r of l.raisons) lignes.push(`· ${r}`);
    }
  }

  lignes.push("");
  lignes.push("<i>Lecture technique, pas un conseil financier.</i>");
  return lignes.join("\n");
}

const AIDE = `<b>Koneksyon Trading</b>

Envoie-moi un symbole, je lis les vraies bougies et je te donne le sens, la durée exacte et le raisonnement.

<b>Exemples</b>
<code>eurusd</code>
<code>audchf</code>
<code>gbpjpy</code>

Je lis M1, M5, M15 et H1 d'un coup, puis je les confronte : un M1 haussier dans une H1 baissière n'est pas un achat, c'est un rebond.

<b>Ce que je ne fais pas</b>
Je n'envoie jamais de signal tout seul. Un bot qui poste à heure fixe ne sait pas si le moment est bon — il sait seulement qu'il doit poster.

<b>Les actifs OTC</b>
Personne ne les cote à part le broker. Aucune donnée n'existe pour eux : pour ceux-là, passe par koneksyonpam.com/trading/analyse avec une capture d'écran.`;

// ---------------------------------------------------------------- route ----

async function traiter(msg: Message, jeton: string): Promise<void> {
  const chatId = msg.chat.id;
  const texte = (msg.text ?? "").trim();

  if (msg.photo) {
    await envoyer(
      chatId,
      "Pour une capture d'écran, passe par koneksyonpam.com/trading/analyse — l'analyse d'image y est complète.\n\nIci, envoie-moi plutôt un symbole comme <code>eurusd</code> : je lis les vraies bougies, c'est plus précis.",
      jeton,
    );
    return;
  }

  if (!texte) return;

  if (/^\/(start|aide|help)/i.test(texte)) {
    await envoyer(chatId, AIDE, jeton);
    return;
  }

  if (estOTC(texte)) {
    await envoyer(
      chatId,
      "⚠️ <b>Actif OTC</b>\n\nLes actifs OTC sont cotés par le broker lui-même — aucune source de données au monde ne les fournit, donc je ne peux pas les lire ici.\n\nPour ceux-là : koneksyonpam.com/trading/analyse, avec une capture d'écran.",
      jeton,
    );
    return;
  }

  const symbole = normaliserSymbole(texte);
  if (!symbole) {
    await envoyer(
      chatId,
      "Je n'ai pas reconnu ce symbole. Essaie <code>eurusd</code>, <code>audchf</code>, <code>gbpjpy</code>…\n\n/aide pour le reste.",
      jeton,
    );
    return;
  }

  await envoyer(chatId, `Lecture de <b>${symbole}</b> sur 4 unités de temps…`, jeton);

  try {
    const { series, echecs } = await plusieursUnites(symbole, UNITES_PAR_DEFAUT);

    if (!series.length) {
      const raison = echecs[0]?.raison ?? "aucune donnée";
      await envoyer(chatId, `❌ Aucune donnée pour <b>${symbole}</b>.\n\n${raison}`, jeton);
      return;
    }

    const lectures = series.map((s) => lire(s.symbole, s.unite, s.candles));
    let reponse = redigerSynthese(synthetiser(lectures));

    if (echecs.length) {
      reponse += `\n\n<i>Unités indisponibles : ${echecs.map((e) => e.unite).join(", ")}</i>`;
    }

    await envoyer(chatId, reponse, jeton);
  } catch (e) {
    const temporaire = e instanceof ErreurMarche && e.temporaire;
    console.error("[telegram/trading]", e instanceof Error ? e.message : e);
    await envoyer(
      chatId,
      temporaire
        ? "Le fournisseur de données est momentanément indisponible ou le quota est atteint. Réessaie dans une minute."
        : "La lecture a échoué. Vérifie le symbole et réessaie.",
      jeton,
    );
  }
}

export async function POST(request: NextRequest) {
  const jeton = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!jeton || !secret) {
    console.error("[telegram/trading] configuration absente");
    return Response.json({ ok: true });
  }

  // Sans cette vérification, l'URL suffirait à faire parler le bot.
  if (request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let update: { message?: Message };
  try {
    update = await request.json();
  } catch {
    return Response.json({ ok: true });
  }

  // Telegram réessaie tant qu'il n'a pas reçu 200 : on répond d'abord, on
  // travaille ensuite. Sinon une analyse un peu longue produit des doublons.
  if (update.message) {
    await traiter(update.message, jeton);
  }

  return Response.json({ ok: true });
}
