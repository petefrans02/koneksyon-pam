/**
 * LA DIFFUSION.
 *
 * Un signal validé ne vaut rien s'il arrive en retard. Les quatre canaux
 * partent donc EN PARALLÈLE, et aucun n'attend l'autre : un serveur SMTP lent
 * ne doit pas retarder la notification push, qui est celle qui réveille
 * réellement le téléphone.
 *
 * ── Le piège du faux « envoyé » ───────────────────────────────────────────
 *
 * Il a déjà été rencontré sur les notifications de la plateforme, et il est
 * traité de front ici : quand la configuration SMTP manque, `nodemailer` ne
 * lève pas, il ne fait simplement rien. L'interface affiche « envoyé », et
 * personne ne reçoit quoi que ce soit — le pire des deux mondes, puisque le
 * problème est invisible.
 *
 * La parade tient en une règle : **chaque canal écrit dans `tc_diffusions` le
 * nombre réel d'envois réussis, pas le nombre de tentatives.** Un canal non
 * configuré écrit `envoyes = 0` avec l'erreur en clair. L'admin affiche cette
 * ligne. Un zéro se voit.
 */

import { adminDb } from "@/lib/admin-auth";
import { sendPushToUsers } from "@/lib/push";
import { formaterPrix, trouverMarche } from "./marches";
import { LIBELLE_DRAPEAU, Marche, ReglagesUtilisateur, Signal } from "./types";

interface Destinataire {
  user_id: string;
  email: string | null;
  reglages: ReglagesUtilisateur;
}

/**
 * Les abonnés à prévenir pour ce marché.
 *
 * Seuls les PREMIUM sont notifiés en direct — c'est la différence de plan qui
 * se paie. Le gratuit voit le signal sur le tableau de bord après le délai,
 * sans notification. Notifier tout le monde puis masquer le contenu serait
 * une promesse tenue à moitié : la notification arrive, le contenu non, et
 * l'utilisateur gratuit se sent trompé plutôt que courtisé.
 */
async function destinataires(marche: string): Promise<Destinataire[]> {
  const db = adminDb();

  const { data: abos } = await db
    .from("tc_abonnements")
    .select("user_id, email, fin")
    .eq("plan", "premium");

  const actifs = ((abos ?? []) as { user_id: string; email: string | null; fin: string | null }[])
    .filter((a) => !a.fin || new Date(a.fin).getTime() > Date.now());

  if (actifs.length === 0) return [];

  const { data: reglages } = await db
    .from("tc_reglages")
    .select("*")
    .in("user_id", actifs.map((a) => a.user_id));

  const parUser = new Map(((reglages ?? []) as ReglagesUtilisateur[]).map((r) => [r.user_id, r]));

  // Un premium sans ligne de réglages reçoit tout : ne pas le notifier parce
  // qu'il n'a jamais ouvert la page des préférences serait le punir de ne
  // rien avoir demandé.
  const parDefaut = (user_id: string): ReglagesUtilisateur => ({
    user_id,
    marches: [marche],
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
  });

  return actifs
    .map((a) => ({ user_id: a.user_id, email: a.email, reglages: parUser.get(a.user_id) ?? parDefaut(a.user_id) }))
    .filter((d) => d.reglages.marches.includes(marche));
}

/** Enregistre le résultat réel d'un canal. Voir l'en-tête : c'est le garde-fou. */
async function relever(
  signalId: string,
  canal: string,
  cibles: number,
  envoyes: number,
  echecs: number,
  erreur: string | null,
  ms: number,
): Promise<void> {
  try {
    await adminDb().from("tc_diffusions").insert({ signal_id: signalId, canal, cibles, envoyes, echecs, erreur, ms });
  } catch {
    // Un relevé perdu ne doit pas empêcher les autres canaux de partir.
  }
}

// ------------------------------------------------------------- les textes --

function titre(s: Signal, m: Marche | null): string {
  const fleche = s.sens === "BUY" ? "▲" : "▼";
  return `${fleche} ${s.sens === "BUY" ? "ACHAT" : "VENTE"} ${m?.paire ?? s.marche} — ${s.confiance}%`;
}

function resume(s: Signal, m: Marche | null): string {
  const p = (v: number | null) => formaterPrix(v, m);
  return `Entrée ${p(s.entree)} · Stop ${p(s.stop)} · TP1 ${p(s.tp1)}${s.tp2 ? ` · TP2 ${p(s.tp2)}` : ""} · R:R ${s.rr.toFixed(1)}`;
}

/**
 * Le corps de l'email.
 *
 * Volontairement écrit ici et pas dans `lib/emails.ts` : c'est le seul email
 * de la plateforme dont le contenu engage de l'argent, il mérite d'être relu
 * à côté du code qui l'envoie. La mention de risque n'est pas une formule
 * juridique posée en bas de page — elle est dans le flux de lecture, parce
 * qu'un signal à 94 % de confiance donne exactement l'impression qu'elle est
 * là pour corriger.
 */
function corpsEmail(s: Signal, m: Marche | null): string {
  const p = (v: number | null) => formaterPrix(v, m);
  const ligne = (cle: string, valeur: string, fort = false) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid #16305c;color:#8fa9cc;font-size:13px;">${cle}</td>
     <td style="padding:9px 0;border-bottom:1px solid #16305c;color:${fort ? "#f0c840" : "#ffffff"};font-size:${fort ? "17" : "15"}px;font-weight:${fort ? "800" : "600"};text-align:right;font-variant-numeric:tabular-nums;">${valeur}</td></tr>`;

  const drapeaux = (s.drapeaux_ia ?? [])
    .map((d) => LIBELLE_DRAPEAU[d])
    .filter(Boolean);

  return `
  <div style="background:linear-gradient(135deg,#06122a,#0d2048);border-radius:16px;padding:26px;">
    <p style="margin:0 0 4px;color:#67e8f9;font-size:11px;letter-spacing:3px;text-transform:uppercase;">KONEKSYON PAM TRADING CENTER</p>
    <p style="margin:0 0 18px;color:#fff;font-size:26px;font-weight:800;">
      ${s.sens === "BUY" ? "▲ ACHAT" : "▼ VENTE"} ${m?.paire ?? s.marche}
    </p>
    <div style="display:inline-block;background:rgba(240,200,64,.14);border:1px solid rgba(240,200,64,.35);border-radius:999px;padding:6px 16px;margin-bottom:20px;">
      <span style="color:#f0c840;font-size:14px;font-weight:800;">Confiance ${s.confiance}%</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${ligne("Zone d'entrée", `${p(s.zone_bas)} — ${p(s.zone_haut)}`)}
      ${ligne("Entrée préférentielle", p(s.entree), true)}
      ${ligne("Stop loss", p(s.stop), true)}
      ${ligne("Objectif 1", p(s.tp1))}
      ${s.tp2 ? ligne("Objectif 2", p(s.tp2)) : ""}
      ${s.tp3 ? ligne("Objectif 3", p(s.tp3)) : ""}
      ${ligne("Risque / rendement", `${s.rr.toFixed(2)} : 1`)}
      ${ligne("Durée estimée", s.duree_texte ?? "—")}
      ${ligne("Unité d'entrée", s.unite)}
      ${ligne("Séance", s.session)}
    </table>
  </div>

  ${s.explication_ia ? `
  <div style="margin-top:20px;padding:18px;background:#f7f9fc;border-left:3px solid #00aac8;border-radius:8px;">
    <p style="margin:0 0 7px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0891b2;font-weight:700;">Analyse</p>
    <p style="margin:0;font-size:14.5px;line-height:1.7;color:#2d3748;">${s.explication_ia}</p>
  </div>` : ""}

  <div style="margin-top:16px;padding:16px;background:#fffbf0;border-radius:8px;">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8960f;font-weight:700;">Critères retenus</p>
    <p style="margin:0;font-size:13px;line-height:1.65;color:#4a6080;">${s.raison}</p>
  </div>

  ${drapeaux.length ? `
  <div style="margin-top:16px;padding:14px 16px;background:#fff5f5;border-radius:8px;">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#dc2626;font-weight:700;">Points de vigilance</p>
    <p style="margin:0;font-size:13px;color:#7f1d1d;">${drapeaux.join(" · ")}</p>
  </div>` : ""}

  <p style="text-align:center;margin:26px 0 8px;">
    <a href="https://koneksyonpam.com/trading-center/signal/${s.id}"
       style="display:inline-block;background:linear-gradient(135deg,#c8960f,#f0c840);color:#0d1d3d;text-decoration:none;padding:14px 34px;border-radius:999px;font-weight:800;font-size:15px;">
      Ouvrir le signal complet
    </a>
  </p>

  <p style="margin:22px 0 0;font-size:12px;line-height:1.65;color:#9ca3af;text-align:center;">
    Ce signal est une analyse, pas un conseil en investissement. Le trading comporte un risque
    de perte en capital. N'engage jamais plus que ce que tu peux perdre, et applique toujours
    le stop indiqué.
  </p>`;
}

// ------------------------------------------------------------- les canaux --

async function canalApp(s: Signal, m: Marche | null, cibles: Destinataire[]): Promise<void> {
  const t0 = Date.now();
  const vises = cibles.filter((d) => d.reglages.canal_app);
  if (vises.length === 0) return relever(s.id, "app", 0, 0, 0, null, 0);

  const lignes = vises.map((d) => ({
    user_id: d.user_id,
    type: "announcement",
    title_fr: titre(s, m),
    title_en: titre(s, m),
    body_fr: resume(s, m),
    body_en: resume(s, m),
    link: `/trading-center/signal/${s.id}`,
  }));

  const { error } = await adminDb().from("notifications").insert(lignes);
  await relever(s.id, "app", vises.length, error ? 0 : vises.length, error ? vises.length : 0, error?.message ?? null, Date.now() - t0);
}

async function canalPush(s: Signal, m: Marche | null, cibles: Destinataire[]): Promise<void> {
  const t0 = Date.now();
  const vises = cibles.filter((d) => d.reglages.canal_push).map((d) => d.user_id);
  if (vises.length === 0) return relever(s.id, "push", 0, 0, 0, null, 0);

  const r = await sendPushToUsers(vises, {
    title: titre(s, m),
    body: resume(s, m),
    url: `/trading-center/signal/${s.id}`,
    tag: `tc-${s.id}`,
  });

  await relever(s.id, "push", r.devices, r.sent, r.failed, r.error, Date.now() - t0);
}

async function canalEmail(s: Signal, m: Marche | null, cibles: Destinataire[]): Promise<void> {
  const t0 = Date.now();
  const vises = cibles.filter((d) => d.reglages.canal_email && d.email);
  if (vises.length === 0) return relever(s.id, "email", 0, 0, 0, null, 0);

  // Import différé : `lib/emails.ts` monte nodemailer, inutile quand aucun
  // destinataire n'a coché l'email.
  const { envoyerSignalTrading } = await import("./email");

  let envoyes = 0;
  let echecs = 0;
  let premiereErreur: string | null = null;

  // Par lots de 8 : au-delà, Hostinger commence à refuser les connexions.
  for (let i = 0; i < vises.length; i += 8) {
    const lot = vises.slice(i, i + 8);
    const res = await Promise.allSettled(
      lot.map((d) => envoyerSignalTrading(d.email!, titre(s, m), corpsEmail(s, m))),
    );
    for (const r of res) {
      if (r.status === "fulfilled" && r.value) envoyes++;
      else {
        echecs++;
        if (!premiereErreur) {
          premiereErreur = r.status === "rejected" ? String(r.reason).slice(0, 200) : "SMTP non configuré";
        }
      }
    }
  }

  await relever(s.id, "email", vises.length, envoyes, echecs, premiereErreur, Date.now() - t0);
}

async function canalTelegram(s: Signal, m: Marche | null, cibles: Destinataire[]): Promise<void> {
  const t0 = Date.now();
  const jeton = process.env.TELEGRAM_BOT_TOKEN;
  const vises = cibles.filter((d) => d.reglages.canal_telegram && d.reglages.telegram_chat_id);

  if (vises.length === 0) return relever(s.id, "telegram", 0, 0, 0, null, 0);
  if (!jeton) {
    return relever(s.id, "telegram", vises.length, 0, vises.length, "TELEGRAM_BOT_TOKEN absent — rien n'est parti.", 0);
  }

  const p = (v: number | null) => formaterPrix(v, m);
  const texte = [
    `*${s.sens === "BUY" ? "▲ ACHAT" : "▼ VENTE"} ${m?.paire ?? s.marche}*`,
    `Confiance : *${s.confiance}%*`,
    "",
    `Zone : \`${p(s.zone_bas)} — ${p(s.zone_haut)}\``,
    `Entrée : \`${p(s.entree)}\``,
    `Stop : \`${p(s.stop)}\``,
    `TP1 : \`${p(s.tp1)}\`${s.tp2 ? `\nTP2 : \`${p(s.tp2)}\`` : ""}${s.tp3 ? `\nTP3 : \`${p(s.tp3)}\`` : ""}`,
    `R:R : ${s.rr.toFixed(2)}:1 · ${s.duree_texte ?? "—"}`,
    "",
    s.explication_ia ? `_${s.explication_ia}_` : "",
    "",
    "⚠️ Analyse, pas un conseil. Risque de perte en capital.",
  ].join("\n");

  let envoyes = 0;
  let echecs = 0;
  let erreur: string | null = null;

  await Promise.allSettled(
    vises.map(async (d) => {
      const res = await fetch(`https://api.telegram.org/bot${jeton}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: d.reglages.telegram_chat_id,
          text: texte,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "Ouvrir le signal", url: `https://koneksyonpam.com/trading-center/signal/${s.id}` }]],
          },
        }),
      });
      if (res.ok) envoyes++;
      else {
        echecs++;
        if (!erreur) erreur = `Telegram ${res.status}`;
      }
    }),
  );

  await relever(s.id, "telegram", vises.length, envoyes, echecs, erreur, Date.now() - t0);
}

/**
 * Diffuse un signal sur tous les canaux, en parallèle.
 *
 * Ne lève jamais : un signal publié en base doit le rester même si aucun
 * canal ne fonctionne. L'inverse — annuler la publication parce que l'email
 * a échoué — ferait disparaître un signal valide du tableau de bord.
 */
export async function diffuser(signal: Signal): Promise<void> {
  try {
    const marche = await trouverMarche(signal.marche);
    const cibles = await destinataires(signal.marche);

    if (cibles.length === 0) {
      await relever(signal.id, "app", 0, 0, 0, "Aucun abonné Premium pour ce marché.", 0);
      return;
    }

    await Promise.allSettled([
      canalApp(signal, marche, cibles),
      canalPush(signal, marche, cibles),
      canalEmail(signal, marche, cibles),
      canalTelegram(signal, marche, cibles),
    ]);
  } catch (e) {
    console.error("[trading-center/diffusion]", e instanceof Error ? e.message : e);
  }
}
