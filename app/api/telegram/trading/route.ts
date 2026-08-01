/**
 * LE BOT TELEGRAM.
 *
 * L'élève tape « eurusd » — ou touche un bouton — et reçoit en quelques
 * secondes le sens, la durée exacte à saisir, les niveaux et le raisonnement,
 * sur de vraies bougies.
 *
 * Ce que ce bot N'EST PAS, et c'est délibéré : il n'envoie jamais rien de
 * lui-même. Pas de « BUY EUR/USD 5 SEC » à intervalles réguliers. Un bot qui
 * pousse des signaux sans qu'on les demande n'a aucun moyen de savoir si le
 * moment est bon — il sait seulement qu'il doit poster. C'est ce qui sépare un
 * outil de lecture d'une machine à faire cliquer.
 *
 * Le raisonnement accompagne toujours le verdict. Un score de 70 qu'on ne peut
 * pas décomposer ne vaut rien, et c'est précisément le reproche qu'on fait aux
 * canaux de signaux : la conclusion sans la démonstration.
 *
 * Sécurité : Telegram signe ses appels par un jeton secret dans l'en-tête
 * `X-Telegram-Bot-Api-Secret-Token`. Sans cette vérification, connaître l'URL
 * suffirait à faire parler le bot.
 */

import { NextRequest } from "next/server";
import {
  ErreurMarche,
  MINUTES,
  Unite,
  estOTC,
  normaliserSymbole,
  plusieursUnites,
} from "@/lib/trading/marche";
import { Lecture, Synthese, lire, synthetiser } from "@/lib/trading/lecture";
import {
  accuser,
  clavierPaires,
  clavierResultat,
  envoyer,
  remplacer,
} from "@/lib/trading/telegram";

export const maxDuration = 60;

/** Assez d'unités pour la confluence, sous le plafond de 8 appels/minute. */
const UNITES: Unite[] = ["M1", "M5", "M15", "H1"];

// ------------------------------------------------------------------ types ---

interface Chat {
  id: number;
}

interface Message {
  message_id: number;
  chat: Chat;
  text?: string;
  photo?: unknown[];
}

interface CallbackQuery {
  id: string;
  data?: string;
  message?: { message_id: number; chat: Chat };
}

// ------------------------------------------------------------- rédaction ---

const BOUTON = { achat: "🟢 BUY", vente: "🔴 SELL", attendre: "⚪️ ATTENDRE" } as const;
const TENDANCE = { haussiere: "haussière", baissiere: "baissière", range: "range" } as const;
const MARQUE = { achat: "🟢", vente: "🔴", attendre: "⚪️" } as const;

/** Assez de décimales pour du forex, pas trop pour une action. */
const prix = (n: number) => (n < 20 ? n.toFixed(5) : n.toFixed(2));

function redigerSynthese(s: Synthese): string {
  const e = s.entree;
  const d = e?.couverte ?? e?.directe ?? null;

  const L: string[] = [];

  L.push(`<b>${s.symbole}</b>`);
  L.push("─────────────────");
  L.push(`<b>${BOUTON[s.sens]}</b>${d ? `      ⏱ <code>${d.temps}</code>` : ""}`);
  L.push(`<i>Confiance ${s.confiance}% · accord ${s.accord}% · ${s.alignement}</i>`);
  L.push("");

  L.push("<b>Les unités de temps</b>");
  for (const l of s.lectures) {
    const accord = l.sens === s.sens ? "✓" : l.sens === "attendre" ? "·" : "✗";
    L.push(
      `<code>${accord} ${l.unite.padEnd(3)}</code> ${MARQUE[l.sens]} ${String(l.confiance).padStart(3)}%  <i>${TENDANCE[l.tendance]}</i>`,
    );
  }
  L.push("");

  if (e && d) {
    L.push(`<b>Entrée en ${e.unite}</b> — prix <code>${prix(e.prix)}</code>`);
    L.push(
      `${d.bougies} bougie${d.bougies > 1 ? "s" : ""} de ${MINUTES[e.unite]} min, arrondi à la durée sélectionnable au-dessus.`,
    );
    if (e.couverte && e.directe && e.couverte.secondes !== e.directe.secondes) {
      L.push(`Sans repli : <code>${e.directe.temps}</code>`);
    }
    L.push("<i>Chrono à lancer à la clôture de la bougie en cours.</i>");
    L.push("");

    if (e.objectif) {
      const nature =
        e.objectif.touches > 0 ? `${e.objectif.touches} touches` : "projection, jamais touché";
      L.push(`🎯 <b>Objectif</b> <code>${prix(e.objectif.price)}</code> <i>(${nature})</i>`);
    }
    if (e.obstacle) {
      L.push(
        `⚠️ <b>Obstacle</b> <code>${prix(e.obstacle.price)}</code> <i>(${e.obstacle.touches} touches)</i>`,
      );
    }
    L.push("");

    L.push("<b>Pourquoi</b>");
    for (const r of e.raisons) L.push(`· ${r}`);
  } else {
    L.push("<b>Pourquoi on n'entre pas</b>");
    const source = s.lectures.find((l) => l.raisons.length) ?? s.lectures[0];
    if (source) for (const r of source.raisons) L.push(`· ${r}`);
    if (s.alignement === "conflit") {
      L.push("");
      L.push(
        "<i>Les échelles se contredisent. Ce n'est pas un signal faible, c'est une absence de signal.</i>",
      );
    }
  }

  L.push("");
  L.push("<i>Lecture technique, pas un conseil financier.</i>");
  return L.join("\n");
}

const ACCUEIL = `<b>Koneksyon Trading</b>
─────────────────
Je lis de <b>vraies bougies</b> — pas des captures d'écran.

Touche une paire ci-dessous, ou tape son nom.

Je lis <b>M1, M5, M15 et H1</b> d'un coup, puis je les confronte : un M1 haussier dans une H1 baissière n'est pas un achat, c'est un rebond.

<b>Je n'envoie jamais de signal tout seul.</b>
Un bot qui poste à heure fixe ne sait pas si le moment est bon — il sait seulement qu'il doit poster.`;

const AIDE = `<b>Comment lire une réponse</b>
─────────────────
<b>Le sens et la durée</b>
Le bouton à presser et la valeur à saisir dans le champ <i>Time</i>. La durée est calculée : distance à l'objectif ÷ vitesse moyenne des bougies, arrondie à la durée sélectionnable au-dessus.

<b>Les unités de temps</b>
✓ suit la conclusion · ✗ la contredit · · indécise
Plus elles s'accordent, plus la confiance monte. Quand elles se contredisent, la réponse est <b>ATTENDRE</b> — un conflit n'est pas un signal faible, c'est une absence de signal.

<b>Pourquoi</b>
Chaque point de confiance est justifié et additionné devant toi :
· Structure +30
· Momentum régulier +10, en accélération +20
· Figure dans le sens de la structure +20
· Cassure de structure +10, changement de caractère +15

Une figure <b>contre</b> la structure est ignorée : c'est un rebond, pas un signal.

<b>Les actifs OTC</b>
Personne ne les cote à part le broker — aucune donnée n'existe. Pour ceux-là : koneksyonpam.com/trading/analyse, avec une capture.`;

// ------------------------------------------------------------- traitement ---

/** Le cœur : lit un symbole et remplace le message d'attente par le résultat. */
async function analyser(
  jeton: string,
  chatId: number,
  symbole: string,
  messageAttente: number | null,
): Promise<void> {
  const remplacerOuEnvoyer = (texte: string, clavier?: Parameters<typeof envoyer>[3]) =>
    messageAttente
      ? remplacer(jeton, chatId, messageAttente, texte, clavier)
      : envoyer(jeton, chatId, texte, clavier).then(() => undefined);

  try {
    const { series, echecs } = await plusieursUnites(symbole, UNITES);

    if (!series.length) {
      await remplacerOuEnvoyer(
        `❌ Aucune donnée pour <b>${symbole}</b>.\n\n<i>${echecs[0]?.raison ?? "symbole inconnu"}</i>`,
      );
      return;
    }

    const lectures: Lecture[] = series.map((s) => lire(s.symbole, s.unite, s.candles));
    const synthese = synthetiser(lectures);

    let texte = redigerSynthese(synthese);
    if (echecs.length) {
      texte += `\n<i>Unités indisponibles : ${echecs.map((e) => e.unite).join(", ")}</i>`;
    }

    const e = synthese.entree;
    const secondes = e?.couverte?.secondes ?? e?.directe?.secondes ?? null;
    await remplacerOuEnvoyer(texte, clavierResultat(symbole, secondes));
  } catch (err) {
    const temporaire = err instanceof ErreurMarche && err.temporaire;
    console.error("[telegram/trading]", err instanceof Error ? err.message : err);
    await remplacerOuEnvoyer(
      temporaire
        ? "⏳ Le fournisseur de données est momentanément indisponible, ou le quota par minute est atteint. Réessaie dans une minute."
        : "❌ La lecture a échoué. Vérifie le symbole et réessaie.",
    );
  }
}

async function traiterMessage(msg: Message, jeton: string): Promise<void> {
  const chatId = msg.chat.id;
  const texte = (msg.text ?? "").trim();

  if (msg.photo) {
    await envoyer(
      jeton,
      chatId,
      "Pour une capture d'écran, passe par <b>koneksyonpam.com/trading/analyse</b> — l'analyse d'image y est complète.\n\nIci, envoie plutôt une paire : je lis les vraies bougies, c'est nettement plus précis.",
      clavierPaires(),
    );
    return;
  }

  if (!texte) return;

  if (/^\/(start|démarrer|demarrer)/i.test(texte)) {
    await envoyer(jeton, chatId, ACCUEIL, clavierPaires());
    return;
  }
  if (/^\/(aide|help)/i.test(texte)) {
    await envoyer(jeton, chatId, AIDE);
    return;
  }
  if (/^\/releve/i.test(texte)) {
    await envoyer(
      jeton,
      chatId,
      "📊 <b>Ton relevé</b>\n\nkoneksyonpam.com/trading/journal\n\nTaux de réussite réel par durée d'expiration, comparé au seuil de rentabilité de ton payout. Aucune conclusion tant que l'échantillon est trop petit.",
    );
    return;
  }

  if (estOTC(texte)) {
    await envoyer(
      jeton,
      chatId,
      "⚠️ <b>Actif OTC</b>\n\nLes actifs OTC sont cotés par le broker lui-même — aucune source de données au monde ne les fournit, donc je ne peux pas les lire ici.\n\nPour ceux-là : <b>koneksyonpam.com/trading/analyse</b>, avec une capture d'écran.",
    );
    return;
  }

  const symbole = normaliserSymbole(texte);
  if (!symbole) {
    await envoyer(
      jeton,
      chatId,
      "Je n'ai pas reconnu ce symbole.\n\nTouche une paire ci-dessous, ou tape <code>eurusd</code>, <code>gbpjpy</code>…",
      clavierPaires(),
    );
    return;
  }

  const attente = await envoyer(jeton, chatId, `⏳ Lecture de <b>${symbole}</b> sur 4 unités…`);
  await analyser(jeton, chatId, symbole, attente);
}

async function traiterBouton(q: CallbackQuery, jeton: string): Promise<void> {
  const chatId = q.message?.chat.id;
  if (!chatId || !q.data) return;

  const [action, ...reste] = q.data.split(":");

  if (action === "lire") {
    await accuser(jeton, q.id, "Relecture…");
    const attente = await envoyer(jeton, chatId, `⏳ Lecture de <b>${reste[0]}</b>…`);
    await analyser(jeton, chatId, reste[0], attente);
    return;
  }

  if (action === "note") {
    // Le relevé vit encore dans le navigateur : on renvoie l'élève vers lui
    // plutôt que de faire semblant d'enregistrer. La migration Supabase
    // fermera cette boucle.
    await accuser(jeton, q.id);
    const gagne = reste[0] === "g";
    await envoyer(
      jeton,
      chatId,
      `${gagne ? "✅" : "❌"} Noté pour <b>${reste[1]}</b>.\n\nAjoute-le à ton relevé : koneksyonpam.com/trading/journal\n\n<i>L'enregistrement direct depuis Telegram arrive avec la migration du relevé sur le serveur.</i>`,
    );
    return;
  }

  if (action === "releve") {
    await accuser(jeton, q.id);
    await envoyer(
      jeton,
      chatId,
      "📊 <b>Ton relevé</b>\n\nkoneksyonpam.com/trading/journal",
    );
    return;
  }

  if (action === "aide") {
    await accuser(jeton, q.id);
    await envoyer(jeton, chatId, AIDE);
    return;
  }

  await accuser(jeton, q.id);
}

// ---------------------------------------------------------------- route ----

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

  let update: { message?: Message; callback_query?: CallbackQuery };
  try {
    update = await request.json();
  } catch {
    return Response.json({ ok: true });
  }

  try {
    if (update.callback_query) await traiterBouton(update.callback_query, jeton);
    else if (update.message) await traiterMessage(update.message, jeton);
  } catch (e) {
    console.error("[telegram/trading] non rattrapé", e instanceof Error ? e.message : e);
  }

  // Toujours 200 : sur toute autre réponse, Telegram réessaie le même message
  // en boucle, et l'élève reçoit l'analyse en double.
  return Response.json({ ok: true });
}
