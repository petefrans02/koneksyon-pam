// Centralized email system for KONEKSYON PAM
// All outgoing emails go through this module.
// Transport: Hostinger SMTP (smtp.hostinger.com:465) via nodemailer

import nodemailer from "nodemailer";

// ── Transport ─────────────────────────────────────────────────────────────────
function createTransport() {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT ?? "465"),
    secure: true,
    auth: {
      user: process.env.GMAIL_USER ?? "contact@koneksyonpam.com",
      pass,
    },
  });
}

const FROM = `"KONEKSYON PAM ACADEMY" <${process.env.GMAIL_USER ?? "contact@koneksyonpam.com"}>`;

// ── Base HTML wrapper (shared branding) ───────────────────────────────────────
function base(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>KONEKSYON PAM</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;</div>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f4f8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0a1628,#0f2044);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
    <img src="https://koneksyonpam.com/logo-kp.png" alt="" width="64" height="64"
      style="border-radius:50%;border:2px solid rgba(255,255,255,0.15);margin-bottom:14px;display:block;margin-left:auto;margin-right:auto;" />
    <p style="color:#fff;font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-0.5px;">KONEKSYON PAM ACADEMY</p>
    <p style="color:rgba(147,197,253,0.5);font-size:10px;margin:0;letter-spacing:3px;text-transform:uppercase;">L&rsquo;ecole chretienne en ligne</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:40px 40px 32px;">
    ${content}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0a1628;border-radius:0 0 16px 16px;padding:22px 40px;text-align:center;">
    <p style="color:rgba(147,197,253,0.45);font-size:11px;margin:0 0 5px;">
      KONEKSYON PAM · <a href="https://koneksyonpam.com" style="color:rgba(147,197,253,0.45);text-decoration:none;">koneksyonpam.com</a>
    </p>
    <p style="color:rgba(147,197,253,0.25);font-size:10px;margin:0;">
      Vous recevez cet email car vous avez un compte ou avez effectué une action sur la plateforme.
      · <a href="https://koneksyonpam.com/contact" style="color:rgba(147,197,253,0.25);">Se désinscrire</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function btn(label: string, href: string, color = "#1d4ed8"): string {
  return `<div style="text-align:center;margin:24px 0 8px;">
    <a href="${href}" style="background:${color};color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px;display:inline-block;letter-spacing:0.2px;">${label}</a>
  </div>`;
}

function verse(text: string, ref: string): string {
  return `<div style="background:linear-gradient(135deg,#fef3c7,#fffbeb);border:1px solid #fde68a;border-radius:10px;padding:18px 20px;margin:20px 0;">
    <p style="color:#92400e;font-size:13px;font-style:italic;line-height:1.7;margin:0 0 6px;">&ldquo;${text}&rdquo;</p>
    <p style="color:#b45309;font-size:12px;font-weight:700;margin:0;">— ${ref}</p>
  </div>`;
}

// Le SMTP est-il réellement configuré ? À vérifier AVANT tout envoi en masse :
// sans ça, `send()` ne fait qu'ignorer silencieusement le message et l'appelant
// croit que l'envoi a réussi.
export function isEmailConfigured(): boolean {
  return !!process.env.GMAIL_APP_PASSWORD;
}

// ── Send helper ───────────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
  const transport = createTransport();
  if (!transport) {
    console.warn(`[Email] SMTP not configured — skipped: ${subject}`);
    return;
  }
  await transport.sendMail({ from: FROM, to, subject, html });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Welcome email
export async function sendWelcomeEmail(to: string, name?: string): Promise<void> {
  const greeting = name ? `Bienvenue, ${name} !` : "Bienvenue sur KONEKSYON PAM !";
  const html = base(
    `<div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:52px;margin-bottom:12px;">🙏</div>
      <h2 style="color:#1e293b;font-size:24px;font-weight:800;margin:0 0 10px;">${greeting}</h2>
      <p style="color:#64748b;font-size:15px;margin:0;line-height:1.6;">Vous faites maintenant partie d'une communauté de chrétiens connectés à travers le monde.</p>
    </div>
    ${verse("Car vous êtes tous fils de Dieu par la foi en Jésus-Christ.", "Galates 3:26")}
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:20px 0;">Voici ce que vous pouvez faire dès maintenant :</p>
    <table width="100%" cellpadding="0" cellspacing="8">
      ${[
        ["📖", "Lire la Bible", "/bible"],
        ["🙏", "Poster une demande de prière", "/prieres"],
        ["🏆", "Participer à un concours biblique", "/concours"],
        ["⛪", "Rejoindre un groupe d'église", "/eglise"],
      ].map(([icon, label, href]) =>
        `<tr><td style="background:#f8fafc;border-radius:8px;padding:12px 16px;">
          <span style="font-size:18px;margin-right:10px;">${icon}</span>
          <a href="https://koneksyonpam.com${href}" style="color:#1d4ed8;font-weight:600;font-size:14px;text-decoration:none;">${label}</a>
        </td></tr>`
      ).join("")}
    </table>
    ${btn("Explorer la plateforme", "https://koneksyonpam.com/aujourd-hui", "#0f2044")}`,
    `Bienvenue sur KONEKSYON PAM, la plateforme chrétienne internationale.`
  );
  await send(to, "🙏 Bienvenue sur KONEKSYON PAM !", html);
}

// 2. Donation thank-you (moved from lib/email-donations.ts)
export async function sendDonationThankYou({
  to, name, amount, currency = "USD", captureId,
}: {
  to: string; name?: string; amount: number; currency?: string; captureId?: string;
}): Promise<void> {
  const amountStr = `${amount.toFixed(2)} ${currency}`;
  const greeting = name ? `${name}, que Dieu vous bénisse !` : "Que Dieu vous bénisse !";
  const html = base(
    `<div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:10px;">🙏</div>
      <h2 style="color:#1e293b;font-size:24px;font-weight:800;margin:0 0 8px;">${greeting}</h2>
      <p style="color:#64748b;font-size:15px;margin:0;">Votre don de <strong style="color:#f59e0b;font-size:18px;">$${amountStr}</strong> a bien été reçu.</p>
      ${captureId ? `<p style="color:#94a3b8;font-size:10px;margin:6px 0 0;font-family:monospace;">Réf : ${captureId}</p>` : ""}
    </div>
    ${verse("Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie.", "2 Corinthiens 9:7")}
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:16px 0;">Votre générosité maintient KONEKSYON PAM <strong>100 % gratuit</strong> pour des milliers de chrétiens à travers le monde.</p>
    ${btn("Continuer à explorer", "https://koneksyonpam.com/aujourd-hui")}`,
    `Merci pour votre don de $${amountStr} à KONEKSYON PAM.`
  );
  await send(to, `🙏 Merci pour votre don de $${amountStr} — KONEKSYON PAM`, html);
}

// 3. Contest registration confirmation
export async function sendContestConfirmation({
  to, name, contestTitle, contestId,
}: {
  to: string; name?: string; contestTitle: string; contestId: string;
}): Promise<void> {
  const html = base(
    `<div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:52px;margin-bottom:10px;">🏆</div>
      <h2 style="color:#1e293b;font-size:22px;font-weight:800;margin:0 0 8px;">Inscription confirmée !</h2>
      <p style="color:#64748b;font-size:14px;margin:0;">${name ? `${name}, vous` : "Vous"} êtes inscrit(e) au concours :</p>
      <p style="color:#0f2044;font-size:16px;font-weight:800;margin:8px 0 0;">${contestTitle}</p>
    </div>
    ${verse("L'homme aux grands projets réussit, mais celui qui s'empresse manque son but.", "Proverbes 21:5")}
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:16px 0;">Préparez-vous bien ! Révisez votre Bible et que la grâce de Dieu vous accompagne.</p>
    ${btn("Accéder au concours", `https://koneksyonpam.com/concours/${contestId}`, "#0f2044")}`,
    `Inscription confirmée au concours ${contestTitle}.`
  );
  await send(to, `🏆 Inscription confirmée — ${contestTitle}`, html);
}

// 4. Prayer response notification
export async function sendPrayerNotification({
  to, name, prayerCount,
}: {
  to: string; name?: string; prayerCount: number;
}): Promise<void> {
  const html = base(
    `<div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:52px;margin-bottom:10px;">🙏</div>
      <h2 style="color:#1e293b;font-size:22px;font-weight:800;margin:0 0 8px;">Des frères prient pour vous !</h2>
      <p style="color:#64748b;font-size:14px;margin:0 0 4px;">${name ? `${name},` : ""} <strong style="color:#0f2044;">${prayerCount} membre${prayerCount > 1 ? "s" : ""}</strong> de la communauté ${prayerCount > 1 ? "ont" : "a"} prié pour votre demande.</p>
    </div>
    ${verse("Je vous le dis encore, si deux d'entre vous s'accordent sur la terre pour demander une chose quelconque, elle leur sera accordée par mon Père qui est dans les cieux.", "Matthieu 18:19")}
    ${btn("Voir votre demande de prière", "https://koneksyonpam.com/prieres", "#0f2044")}`,
    `${prayerCount} personnes ont prié pour votre demande.`
  );
  await send(to, `🙏 ${prayerCount} personne${prayerCount > 1 ? "s" : ""} prie${prayerCount > 1 ? "nt" : ""} pour vous`, html);
}

// 5. Testimony published notification
export async function sendTestimonyPublished({
  to, name,
}: {
  to: string; name?: string;
}): Promise<void> {
  const html = base(
    `<div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:52px;margin-bottom:10px;">✨</div>
      <h2 style="color:#1e293b;font-size:22px;font-weight:800;margin:0 0 8px;">Votre témoignage est publié !</h2>
      <p style="color:#64748b;font-size:14px;margin:0;">${name ? `${name},` : ""} votre témoignage a été approuvé et publié sur la plateforme.</p>
    </div>
    ${verse("Et ils l'ont vaincu à cause du sang de l'Agneau et à cause de la parole de leur témoignage.", "Apocalypse 12:11")}
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:16px 0;">Votre témoignage peut transformer la vie d'autres chrétiens. Merci de partager ce que Dieu a fait dans votre vie.</p>
    ${btn("Voir les témoignages", "https://koneksyonpam.com/temoignages")}`,
    "Votre témoignage est maintenant visible par toute la communauté."
  );
  await send(to, "✨ Votre témoignage a été publié — KONEKSYON PAM", html);
}

// ── Multilingual contest launch email ─────────────────────────────────────────
type ContestLang = "fr" | "ht" | "en";

function contestLaunchHtml(opts: {
  lang: ContestLang;
  title: string;
  description?: string;
  contestId: string;
  startAt?: string | null;
}): string {
  const { lang, title, description, contestId, startAt } = opts;
  const url = `https://koneksyonpam.com/concours/${contestId}?lang=${lang}`;

  const t = {
    fr: {
      subject: `🏆 Nouveau concours : ${title}`,
      preheader: `Un nouveau concours biblique vient d'ouvrir ses portes — rejoignez-nous maintenant !`,
      headline: "Nouveau concours biblique",
      cta: "Participer maintenant →",
      dateLabel: "Date d'ouverture",
      soon: "Très bientôt",
      hint: "Les places sont limitées. Inscrivez-vous dès maintenant et préparez-vous à briller pour la gloire de Dieu !",
      verse: { text: "Celui qui participe aux compétitions s'impose une discipline en toutes choses.", ref: "1 Corinthiens 9:25" },
    },
    ht: {
      subject: `🏆 Nouvo konkou : ${title}`,
      preheader: `Yon nouvo konkou biblik fèk louvri — vin jwenn nou kounye a !`,
      headline: "Nouvo konkou biblik",
      cta: "Patisipe kounye a →",
      dateLabel: "Dat louvèti",
      soon: "Trè byento",
      hint: "Plas yo limite. Enskri kounye a epi prepare ou pou klere pou glwa Bondye !",
      verse: { text: "Sila ki patisipe nan konpetisyon yo enpoze tèt li yon disiplin nan tout bagay.", ref: "1 Korentyen 9:25" },
    },
    en: {
      subject: `🏆 New contest: ${title}`,
      preheader: `A new biblical contest just opened — join us now!`,
      headline: "New Biblical Contest",
      cta: "Participate now →",
      dateLabel: "Opening date",
      soon: "Very soon",
      hint: "Spots are limited. Register now and prepare to shine for the glory of God!",
      verse: { text: "Everyone who competes in the games goes into strict training.", ref: "1 Corinthians 9:25" },
    },
  }[lang];

  let dateStr = t.soon;
  if (startAt) {
    try {
      dateStr = new Date(startAt).toLocaleDateString(
        lang === "fr" ? "fr-FR" : lang === "ht" ? "fr-HT" : "en-US",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      );
    } catch {}
  }

  const content = `
    <!-- Contest banner -->
    <div style="background:linear-gradient(135deg,#0f2044,#1d4ed8);border-radius:12px;padding:32px 28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;margin-bottom:12px;">🏆</div>
      <p style="color:rgba(197,168,79,0.9);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">${t.headline}</p>
      <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 10px;line-height:1.3;">${title}</h2>
      ${description ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;line-height:1.6;">${description}</p>` : ""}
    </div>

    <!-- Date -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#f8fafc;border-radius:10px;padding:14px 18px;border-left:4px solid #c5a84f;">
          <p style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">${t.dateLabel}</p>
          <p style="color:#0f2044;font-size:15px;font-weight:800;margin:0;">${dateStr}</p>
        </td>
      </tr>
    </table>

    ${verse(t.verse.text, t.verse.ref)}
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:16px 0;">${t.hint}</p>
    ${btn(t.cta, url, "#c5a84f")}
  `;

  return base(content, t.preheader);
}

export async function sendContestLaunch(opts: {
  to: string;
  lang: ContestLang;
  title: string;
  description?: string;
  contestId: string;
  startAt?: string | null;
}): Promise<void> {
  const { to, lang, title, contestId } = opts;
  const subjects = {
    fr: `🏆 Nouveau concours : ${title}`,
    ht: `🏆 Nouvo konkou : ${title}`,
    en: `🏆 New contest: ${title}`,
  };
  const html = contestLaunchHtml(opts);
  await send(to, subjects[lang], html);
}

// 6. Password reset (Supabase handles this, but custom template available)
export async function sendPasswordReset({
  to, resetLink,
}: {
  to: string; resetLink: string;
}): Promise<void> {
  const html = base(
    `<div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:10px;">🔐</div>
      <h2 style="color:#1e293b;font-size:22px;font-weight:800;margin:0 0 8px;">Réinitialisation du mot de passe</h2>
      <p style="color:#64748b;font-size:14px;margin:0;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.</p>
    </div>
    <div style="background:#fef2f2;border:1px solid #fee2e2;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
      <p style="color:#b91c1c;font-size:12px;margin:0;">⚠️ Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    </div>
    ${btn("Réinitialiser mon mot de passe", resetLink, "#dc2626")}`,
    "Réinitialisez votre mot de passe KONEKSYON PAM."
  );
  await send(to, "🔐 Réinitialisation de votre mot de passe — KONEKSYON PAM", html);
}

// 7. Newsletter
export async function sendNewsletter({
  to, subject, content, unsubscribeToken,
}: {
  to: string; subject: string; content: string; unsubscribeToken: string;
}): Promise<void> {
  const html = base(
    `${content}
    <div style="border-top:1px solid #e2e8f0;margin-top:28px;padding-top:16px;text-align:center;">
      <a href="https://koneksyonpam.com/unsubscribe?token=${unsubscribeToken}"
        style="color:#94a3b8;font-size:11px;">Se désabonner de la newsletter</a>
    </div>`,
    subject
  );
  await send(to, subject, html);
}

// 8. Lancement d'un Championnat Biblique — envoyé à tous les inscrits.
export async function sendChampionshipLaunch({
  to, lang, seasonName,
}: {
  to: string;
  lang: "fr" | "ht" | "en" | "es";
  seasonName: string;
}): Promise<void> {
  const t = {
    fr: {
      subject: `🏆 Le Championnat Biblique commence : ${seasonName}`,
      preheader: "Rejoins ton équipe et joue en direct contre tout le pays !",
      headline: "Championnat Biblique",
      lead: "Le championnat vient de commencer. Rejoins ton équipe et affronte les autres en direct !",
      cta: "Rejoindre le championnat →",
      hint: "Les matchs se jouent par journées : toutes les équipes jouent en même temps. Ne rate pas le coup d'envoi !",
      verse: { text: "Je puis tout par celui qui me fortifie.", ref: "Philippiens 4:13" },
    },
    ht: {
      subject: `🏆 Chanpyona Biblik la kòmanse : ${seasonName}`,
      preheader: "Antre nan ekip ou epi jwe an dirèk kont tout peyi a !",
      headline: "Chanpyona Biblik",
      lead: "Chanpyona a fèk kòmanse. Antre nan ekip ou epi afwonte lòt yo an dirèk !",
      cta: "Antre nan chanpyona a →",
      hint: "Match yo jwe pa jounen : tout ekip yo jwe an menm tan. Pa rate kòmansman an !",
      verse: { text: "Mwen ka fè tout bagay nan Kris ki ban m fòs la.", ref: "Filipyen 4:13" },
    },
    en: {
      subject: `🏆 The Bible Championship begins: ${seasonName}`,
      preheader: "Join your team and play live against the whole country!",
      headline: "Bible Championship",
      lead: "The championship has just started. Join your team and take on the others live!",
      cta: "Join the championship →",
      hint: "Matches are played in rounds — every team plays at the same time. Don't miss kickoff!",
      verse: { text: "I can do all things through him who strengthens me.", ref: "Philippians 4:13" },
    },
    es: {
      subject: `🏆 Comienza el Campeonato Bíblico: ${seasonName}`,
      preheader: "¡Únete a tu equipo y juega en vivo contra todo el país!",
      headline: "Campeonato Bíblico",
      lead: "El campeonato acaba de comenzar. ¡Únete a tu equipo y enfrenta a los demás en vivo!",
      cta: "Unirme al campeonato →",
      hint: "Los partidos se juegan por jornadas: todos los equipos juegan al mismo tiempo. ¡No te pierdas el inicio!",
      verse: { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
    },
  }[lang];

  const content = `
    <div style="background:linear-gradient(135deg,#0f2044,#1d4ed8);border-radius:12px;padding:32px 28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;margin-bottom:12px;">🏆</div>
      <p style="color:rgba(197,168,79,0.9);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">${t.headline}</p>
      <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 10px;line-height:1.3;">${seasonName}</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;line-height:1.6;">${t.lead}</p>
    </div>
    ${verse(t.verse.text, t.verse.ref)}
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:16px 0;">${t.hint}</p>
    ${btn(t.cta, "https://koneksyonpam.com/championnat", "#c5a84f")}
  `;

  await send(to, t.subject, base(content, t.preheader));
}
