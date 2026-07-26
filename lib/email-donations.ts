// SERVER-SIDE ONLY — email sending for donation confirmations
import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER || "contact@koneksyonpam.com";
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: { user, pass },
  });
}

export async function sendDonationThankYou({
  to,
  name,
  amount,
  currency = "USD",
  captureId,
}: {
  to: string;
  name?: string;
  amount: number;
  currency?: string;
  captureId?: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Email] GMAIL_APP_PASSWORD not set — skipping thank-you email");
    return;
  }

  const smtpUser = process.env.GMAIL_USER || "contact@koneksyonpam.com";
  const greeting = name ? `${name}, que Dieu vous bénisse !` : "Que Dieu vous bénisse !";
  const amountStr = `${amount.toFixed(2)} ${currency}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0a1628,#0f2044);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
    <img src="https://koneksyonpam.com/logo-kp.png" alt="KP" width="72" height="72"
      style="border-radius:50%;border:3px solid rgba(255,255,255,0.2);margin-bottom:16px;" />
    <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 6px;">KONEKSYON PAM</h1>
    <p style="color:rgba(147,197,253,0.6);font-size:11px;margin:0;letter-spacing:3px;text-transform:uppercase;">
      La plateforme des chrétiens connectés
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:44px 40px;">

    <!-- Hero -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:60px;margin-bottom:12px;">🙏</div>
      <h2 style="color:#1e293b;font-size:26px;font-weight:800;margin:0 0 10px;">${greeting}</h2>
      <p style="color:#64748b;font-size:15px;margin:0;">
        Votre don de <strong style="color:#f59e0b;font-size:18px;">$${amountStr}</strong> a bien été reçu.
      </p>
      ${captureId ? `<p style="color:#94a3b8;font-size:11px;margin:8px 0 0;">Référence : ${captureId}</p>` : ""}
    </div>

    <!-- Verse -->
    <div style="background:linear-gradient(135deg,#fef3c7,#fffbeb);border:1px solid #fde68a;border-radius:12px;padding:22px;text-align:center;margin-bottom:30px;">
      <p style="color:#92400e;font-size:14px;font-style:italic;line-height:1.7;margin:0;">
        &ldquo;Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ;
        car Dieu aime celui qui donne avec joie.&rdquo;
      </p>
      <p style="color:#b45309;font-size:13px;font-weight:700;margin:10px 0 0;">— 2 Corinthiens 9:7</p>
    </div>

    <!-- Message -->
    <p style="color:#475569;font-size:15px;line-height:1.8;margin:0 0 16px;">
      Votre générosité maintient KONEKSYON PAM <strong>100 % gratuit</strong> pour des milliers de
      chrétiens en Haïti, en France, aux États-Unis, au Canada et dans le monde entier.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.8;margin:0 0 30px;">
      Chaque dollar reçu finance directement nos études bibliques, le mur de prière, les concours
      et le développement de la plateforme — pour la gloire de Dieu.
    </p>

    <!-- Stats -->
    <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:32px;">
      <tr>
        <td style="text-align:center;background:#f8fafc;border-radius:10px;padding:16px 8px;">
          <p style="color:#0f2044;font-size:20px;font-weight:800;margin:0;">24K+</p>
          <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">chrétiens connectés</p>
        </td>
        <td width="8"></td>
        <td style="text-align:center;background:#f8fafc;border-radius:10px;padding:16px 8px;">
          <p style="color:#0f2044;font-size:20px;font-weight:800;margin:0;">12+</p>
          <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">pays représentés</p>
        </td>
        <td width="8"></td>
        <td style="text-align:center;background:#f8fafc;border-radius:10px;padding:16px 8px;">
          <p style="color:#0f2044;font-size:20px;font-weight:800;margin:0;">100%</p>
          <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">toujours gratuit</p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="https://koneksyonpam.com/aujourd-hui"
        style="background:linear-gradient(135deg,#0f2044,#1d4ed8);color:#fff;text-decoration:none;
               padding:15px 36px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block;">
        Continuer à explorer →
      </a>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0a1628;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
    <p style="color:rgba(147,197,253,0.5);font-size:12px;margin:0 0 6px;">
      KONEKSYON PAM · <a href="https://koneksyonpam.com" style="color:rgba(147,197,253,0.5);">koneksyonpam.com</a>
    </p>
    <p style="color:rgba(147,197,253,0.3);font-size:11px;margin:0;">
      Cet email vous a été envoyé suite à votre don. Aucune action supplémentaire n'est requise.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  await transporter.sendMail({
    from: `"KONEKSYON PAM" <${smtpUser}>`,
    to,
    subject: `🙏 Merci pour votre don de $${amountStr} — KONEKSYON PAM`,
    html,
  });
}
