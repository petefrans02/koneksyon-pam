import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  const { session_id } = await request.json();
  if (!session_id) return Response.json({ ok: false });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return Response.json({ ok: false });

  // Retrieve session from Stripe to get customer email and amount
  const stripe = (await import("stripe")).default;
  const client = new stripe(stripeKey);
  const session = await client.checkout.sessions.retrieve(session_id);

  const email = session.customer_details?.email;
  const name = session.customer_details?.name || "";
  const amount = ((session.amount_total || 0) / 100).toFixed(2);

  if (!email) return Response.json({ ok: false, reason: "no email" });

  const gmailUser = process.env.GMAIL_USER || "koneksyonpam@gmail.com";
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailPass) return Response.json({ ok: false, reason: "no gmail config" });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0a1628,#0f2044);border-radius:16px 16px 0 0;padding:40px 40px 30px;text-align:center;">
          <img src="https://koneksyonpam.com/logo-kp.png" alt="KP" width="70" height="70" style="border-radius:50%;border:3px solid rgba(255,255,255,0.2);margin-bottom:16px;" />
          <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 6px;">KONEKSYON PAM</h1>
          <p style="color:rgba(147,197,253,0.7);font-size:12px;margin:0;letter-spacing:2px;text-transform:uppercase;">La plateforme des chrétiens connectés</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:40px;">
          <div style="text-align:center;margin-bottom:30px;">
            <div style="font-size:56px;margin-bottom:12px;">🙏</div>
            <h2 style="color:#1e293b;font-size:24px;font-weight:800;margin:0 0 8px;">
              ${name ? `${name}, que Dieu vous bénisse !` : "Que Dieu vous bénisse !"}
            </h2>
            <p style="color:#64748b;font-size:15px;margin:0;">Votre don de <strong style="color:#f59e0b;">$${amount} USD</strong> a bien été reçu.</p>
          </div>

          <div style="background:linear-gradient(135deg,#fef3c7,#fffbeb);border:1px solid #fde68a;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
            <p style="color:#92400e;font-size:14px;font-style:italic;margin:0;line-height:1.6;">
              &ldquo;Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie.&rdquo;
            </p>
            <p style="color:#b45309;font-size:13px;font-weight:700;margin:8px 0 0;">— 2 Corinthiens 9:7</p>
          </div>

          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
            Votre générosité nous permet de garder KONEKSYON PAM <strong>100% gratuit</strong> pour des milliers de chrétiens à travers le monde — en Haïti, en France, aux États-Unis, au Canada et bien au-delà.
          </p>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
            Grâce à vous, nous pouvons continuer à offrir la Bible complète, le mur de prières, les études bibliques, les jeux bibliques et bien plus encore — gratuitement, pour la gloire de Dieu.
          </p>

          <!-- Impact grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td width="33%" style="text-align:center;padding:12px;">
                <p style="color:#1e293b;font-size:22px;font-weight:800;margin:0;">24K+</p>
                <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">chrétiens connectés</p>
              </td>
              <td width="33%" style="text-align:center;padding:12px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                <p style="color:#1e293b;font-size:22px;font-weight:800;margin:0;">12+</p>
                <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">pays représentés</p>
              </td>
              <td width="33%" style="text-align:center;padding:12px;">
                <p style="color:#1e293b;font-size:22px;font-weight:800;margin:0;">100%</p>
                <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">gratuit pour tous</p>
              </td>
            </tr>
          </table>

          <div style="text-align:center;">
            <a href="https://koneksyonpam.com" style="background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block;">
              Visiter KONEKSYON PAM →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0a1628;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
          <p style="color:rgba(147,197,253,0.5);font-size:12px;margin:0 0 6px;">KONEKSYON PAM · koneksyonpam.com</p>
          <p style="color:rgba(147,197,253,0.3);font-size:11px;margin:0;">Cet email a été envoyé suite à votre don. Merci pour votre soutien.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"KONEKSYON PAM" <${gmailUser}>`,
    to: email,
    subject: `🙏 Merci pour votre don de $${amount} — KONEKSYON PAM`,
    html,
  });

  return Response.json({ ok: true });
}
