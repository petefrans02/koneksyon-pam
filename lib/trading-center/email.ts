/**
 * L'ENVOI D'EMAIL DU TRADING CENTER.
 *
 * Un fichier minuscule, et une seule raison d'exister : renvoyer un booléen
 * HONNÊTE.
 *
 * `lib/emails.ts` suit la convention du reste de la plateforme — quand le mot
 * de passe SMTP est absent, il ne fait rien et ne dit rien. C'est acceptable
 * pour un email de bienvenue ; ça ne l'est pas ici. Un signal de trading qui
 * n'est pas parti doit apparaître comme tel dans `tc_diffusions`, sinon le
 * relevé de diffusion ment, et on découvre le problème le jour où un
 * utilisateur demande pourquoi il n'a rien reçu depuis trois semaines.
 *
 * D'où ce `Promise<boolean>` : `true` = le serveur SMTP a accepté le message.
 * Rien d'autre ne compte comme un succès.
 */

import nodemailer from "nodemailer";

const FROM = `"KONEKSYON PAM TRADING CENTER" <${process.env.GMAIL_USER ?? "contact@koneksyonpam.com"}>`;

export function emailConfigure(): boolean {
  return !!process.env.GMAIL_APP_PASSWORD;
}

/** Le transport est créé une fois : ouvrir une connexion par email ferait
 *  refuser les envois groupés par le fournisseur. */
let transport: nodemailer.Transporter | null = null;

function obtenirTransport(): nodemailer.Transporter | null {
  if (!emailConfigure()) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
      port: parseInt(process.env.SMTP_PORT ?? "465"),
      secure: true,
      auth: { user: process.env.GMAIL_USER ?? "contact@koneksyonpam.com", pass: process.env.GMAIL_APP_PASSWORD },
      pool: true,
      maxConnections: 3,
    });
  }
  return transport;
}

/** Habillage sombre — cohérent avec l'identité visuelle du Trading Center. */
function envelopper(contenu: string): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><title>KONEKSYON PAM Trading Center</title></head>
<body style="margin:0;padding:0;background:#070d18;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#070d18;padding:28px 14px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;">
  <tr><td style="padding:28px 30px 34px;">${contenu}</td></tr>
  <tr><td style="background:#0a1628;padding:20px 30px;text-align:center;">
    <p style="color:rgba(147,197,253,.45);font-size:11px;margin:0 0 5px;">
      KONEKSYON PAM TRADING CENTER · <a href="https://koneksyonpam.com/trading-center" style="color:rgba(147,197,253,.55);text-decoration:none;">koneksyonpam.com</a>
    </p>
    <p style="color:rgba(147,197,253,.28);font-size:10px;margin:0;">
      Tu reçois cet email parce que ton compte Premium est actif. Gère tes canaux dans tes réglages.
    </p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Envoie un signal par email. Renvoie `true` seulement en cas d'acceptation
 * réelle par le serveur SMTP.
 */
export async function envoyerSignalTrading(to: string, sujet: string, contenu: string): Promise<boolean> {
  const t = obtenirTransport();
  if (!t) return false;

  try {
    await t.sendMail({ from: FROM, to, subject: sujet, html: envelopper(contenu) });
    return true;
  } catch (e) {
    console.error("[trading-center/email]", e instanceof Error ? e.message : e);
    return false;
  }
}
