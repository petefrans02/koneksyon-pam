/**
 * L'HABILLAGE DU BOT.
 *
 * Un bot Telegram sérieux se reconnaît à trois choses, et aucune n'est
 * cosmétique : on sait quoi lui dire sans deviner, on n'a rien à taper, et ses
 * réponses se lisent d'un coup d'œil.
 *
 * — Le **menu de commandes** remplit le bouton ☰ à côté du champ de saisie.
 *   Sans lui, l'utilisateur ouvre le bot et se retrouve devant un écran vide
 *   en se demandant quoi écrire.
 * — Le **clavier permanent** met les paires en boutons. Sur un téléphone, en
 *   séance, taper « eurusd » est une friction de plus — et une friction de
 *   plus, c'est un relevé qu'on ne tient pas.
 * — Les **boutons sous chaque réponse** enchaînent l'action suivante : relire,
 *   changer d'unité, noter le trade.
 *
 * Tout est enregistré par l'API, pas à la main dans BotFather : la
 * configuration vit dans le dépôt, elle se relit et se corrige comme du code.
 */

const API = "https://api.telegram.org/bot";

// ------------------------------------------------------------------ types ---

export interface BoutonInline {
  text: string;
  callback_data: string;
}

export interface Clavier {
  inline_keyboard?: BoutonInline[][];
  keyboard?: { text: string }[][];
  resize_keyboard?: boolean;
  is_persistent?: boolean;
  input_field_placeholder?: string;
}

/** Les paires les plus liquides — celles qui ont de vraies données en continu. */
export const PAIRES = [
  ["EUR/USD", "GBP/USD", "USD/JPY"],
  ["AUD/USD", "USD/CHF", "USD/CAD"],
  ["EUR/GBP", "AUD/CHF", "GBP/JPY"],
];

/**
 * Le clavier permanent : les paires à portée de pouce.
 *
 * `is_persistent` le garde affiché entre deux messages — sans ça il disparaît
 * après chaque envoi et l'utilisateur doit le rappeler, ce qui annule tout
 * l'intérêt.
 */
export function clavierPaires(): Clavier {
  return {
    keyboard: PAIRES.map((rangee) => rangee.map((text) => ({ text }))),
    resize_keyboard: true,
    is_persistent: true,
    input_field_placeholder: "Une paire, ou tape son nom…",
  };
}

/**
 * Les boutons sous une analyse.
 *
 * `callback_data` est plafonné à 64 octets par Telegram : on y met le strict
 * nécessaire, séparé par des deux-points.
 */
export function clavierResultat(symbole: string, secondes: number | null): Clavier {
  const lignes: BoutonInline[][] = [
    [{ text: "🔄 Relire maintenant", callback_data: `lire:${symbole}` }],
  ];

  // Noter le trade n'a de sens que si une durée a été proposée.
  if (secondes) {
    lignes.push([
      { text: "✅ Gagné", callback_data: `note:g:${symbole}:${secondes}` },
      { text: "❌ Perdu", callback_data: `note:p:${symbole}:${secondes}` },
    ]);
  }

  lignes.push([
    { text: "📊 Mon relevé", callback_data: "releve" },
    { text: "❓ Comment lire", callback_data: "aide" },
  ]);

  return { inline_keyboard: lignes };
}

// ------------------------------------------------------------------ envoi ---

export async function envoyer(
  jeton: string,
  chatId: number,
  texte: string,
  clavier?: Clavier,
): Promise<number | null> {
  try {
    const res = await fetch(`${API}${jeton}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: texte,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...(clavier ? { reply_markup: clavier } : {}),
      }),
    });
    const data = (await res.json()) as { ok?: boolean; result?: { message_id?: number } };
    return data.result?.message_id ?? null;
  } catch (e) {
    console.error("[telegram] envoi", e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Remplace un message déjà envoyé.
 *
 * Sert au « Lecture en cours… » : on le remplace par le résultat au lieu
 * d'empiler deux messages. Le fil reste propre, ce qui compte quand on
 * enchaîne dix analyses dans la même séance.
 */
export async function remplacer(
  jeton: string,
  chatId: number,
  messageId: number,
  texte: string,
  clavier?: Clavier,
): Promise<void> {
  try {
    await fetch(`${API}${jeton}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: texte,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...(clavier ? { reply_markup: clavier } : {}),
      }),
    });
  } catch (e) {
    console.error("[telegram] remplacement", e instanceof Error ? e.message : e);
  }
}

/** Acquitte un appui sur bouton — sans ça, Telegram affiche une horloge qui tourne. */
export async function accuser(jeton: string, callbackId: string, texte?: string): Promise<void> {
  try {
    await fetch(`${API}${jeton}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId, ...(texte ? { text: texte } : {}) }),
    });
  } catch {
    /* sans effet : l'horloge disparaîtra d'elle-même */
  }
}

// ------------------------------------------------------------ la vitrine ---

export const COMMANDES = [
  { command: "start", description: "Démarrer et afficher les paires" },
  { command: "aide", description: "Comment lire une réponse" },
  { command: "releve", description: "Mon taux de réussite réel" },
];

export const DESCRIPTION =
  "Lecture technique sur données réelles. Envoie une paire, reçois le sens, " +
  "la durée exacte à saisir et le raisonnement complet — structure, momentum, " +
  "figures, niveaux. Aucun signal automatique : tu demandes, je lis.";

export const A_PROPOS =
  "Analyse multi-unités de temps sur bougies réelles. " +
  "Académie Trading — KONEKSYON PAM.";

/**
 * Enregistre le webhook — côté serveur, et c'est tout l'intérêt.
 *
 * Faire lancer un `curl` avec le token ET le secret ouvre deux façons de se
 * tromper, et la seconde est silencieuse : si le `secret_token` transmis à
 * Telegram diffère d'un espace de celui enregistré ici, la route répond 401 à
 * chaque message et le bot reste muet sans qu'aucune erreur ne soit visible.
 *
 * En le faisant ici, le serveur utilise **la même variable** des deux côtés.
 * Le décalage devient impossible par construction.
 */
export async function enregistrerWebhook(
  jeton: string,
  url: string,
  secret: string,
): Promise<{ ok: boolean; description?: string }> {
  try {
    const res = await fetch(`${API}${jeton}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        secret_token: secret,
        // Un ancien message en attente rejouerait une analyse périmée dès la
        // reconnexion : on repart propre.
        drop_pending_updates: true,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    const data = (await res.json()) as { ok?: boolean; description?: string };
    return { ok: data.ok === true, description: data.description };
  } catch (e) {
    return { ok: false, description: e instanceof Error ? e.message : "échec réseau" };
  }
}

export interface InfoWebhook {
  url?: string;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
}

/** L'état vu par Telegram — la seule source qui dise pourquoi le bot se tait. */
export async function infoWebhook(jeton: string): Promise<InfoWebhook | null> {
  try {
    const res = await fetch(`${API}${jeton}/getWebhookInfo`);
    const data = (await res.json()) as { ok?: boolean; result?: InfoWebhook };
    return data.ok ? (data.result ?? null) : null;
  } catch {
    return null;
  }
}

/** Vérifie que le token est valide et renvoie l'identité du bot. */
export async function identite(jeton: string): Promise<{ username?: string; id?: number } | null> {
  try {
    const res = await fetch(`${API}${jeton}/getMe`);
    const data = (await res.json()) as { ok?: boolean; result?: { username?: string; id?: number } };
    return data.ok ? (data.result ?? null) : null;
  } catch {
    return null;
  }
}

/**
 * Enregistre la vitrine du bot auprès de Telegram.
 *
 * Idempotent : on peut le rejouer autant de fois qu'on veut, ça écrase la
 * configuration précédente. C'est ce qui permet de faire évoluer les
 * commandes en modifiant ce fichier plutôt qu'en retapant dans BotFather.
 */
export async function configurer(jeton: string): Promise<Record<string, boolean>> {
  const appels: [string, unknown][] = [
    ["setMyCommands", { commands: COMMANDES }],
    ["setMyDescription", { description: DESCRIPTION }],
    ["setMyShortDescription", { short_description: A_PROPOS }],
    ["setChatMenuButton", { menu_button: { type: "commands" } }],
  ];

  const resultats: Record<string, boolean> = {};
  for (const [methode, corps] of appels) {
    try {
      const res = await fetch(`${API}${jeton}/${methode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const data = (await res.json()) as { ok?: boolean; description?: string };
      resultats[methode] = data.ok === true;
      if (!data.ok) console.error(`[telegram] ${methode}`, data.description);
    } catch (e) {
      resultats[methode] = false;
      console.error(`[telegram] ${methode}`, e instanceof Error ? e.message : e);
    }
  }
  return resultats;
}
