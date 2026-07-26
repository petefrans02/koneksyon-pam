import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { sendChampionshipLaunch, isEmailConfigured } from "@/lib/emails";
import { sendPushToUsers } from "@/lib/push";

// POST — notifie TOUS les utilisateurs inscrits du Championnat Biblique.
// TROIS canaux : notification in-app (cloche du site), email réel, et push
// (l'annonce arrive sur le téléphone même site fermé, pour les abonnés).
// Body optionnel : { force: true } pour renvoyer à ceux déjà notifiés.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { id } = await params;
  const db = adminDb();

  const body = await req.json().catch(() => ({})) as { force?: boolean };
  const force = body?.force === true;

  const { data: season } = await db.from("champ_seasons").select("id, name").eq("id", id).maybeSingle();
  if (!season) return NextResponse.json({ error: "Championnat introuvable" }, { status: 404 });

  // Tous les utilisateurs inscrits sur le site.
  const { data: authData, error: usersErr } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (usersErr) return NextResponse.json({ error: `Lecture des inscrits impossible : ${usersErr.message}` }, { status: 500 });
  const users = (authData?.users ?? []).filter((u) => u.id);

  // Le lien encode l'id du championnat → permet l'anti-doublon (la page ignore le paramètre).
  const link = `/championnat?c=${id}`;
  const { data: already } = await db.from("notifications").select("user_id").eq("link", link);
  const sentSet = new Set((already ?? []).map((r: { user_id: string }) => r.user_id));
  const toNotify = force ? users : users.filter((u) => !sentSet.has(u.id));

  if (toNotify.length === 0) {
    return NextResponse.json({
      ok: true, notified: 0, already: sentSet.size, emails_sent: 0, emails_failed: 0, emails_skipped: 0,
      in_app_error: null,
      email_error: "Tout le monde a déjà été notifié pour ce championnat — utilise « Renvoyer » pour forcer l'envoi.",
    });
  }

  // Langue préférée de chaque utilisateur (pour l'email).
  const { data: profiles } = await db
    .from("profiles").select("id, preferred_lang").in("id", toNotify.map((u) => u.id));
  const langOf = new Map((profiles ?? []).map((p: { id: string; preferred_lang?: string }) => [p.id, p.preferred_lang]));

  // Préférences email — absence de ligne = opt-in par défaut.
  const { data: prefs } = await db.from("notification_preferences").select("user_id, email_contests");
  const prefsMap = new Map((prefs ?? []).map((p: { user_id: string; email_contests: boolean }) => [p.user_id, p.email_contests]));

  const name = season.name as string;

  // ── 1. Notification in-app (cloche) ───────────────────────────────────────

  const notifs = toNotify.map((u) => ({
    user_id: u.id,
    type: "announcement", // contrainte CHECK: contest|prayer|testimony|study|announcement
    title_fr: "🏆 Nouveau Championnat Biblique !",
    title_ht: "🏆 Nouvo Chanpyona Biblik !",
    title_en: "🏆 New Bible Championship!",
    body_fr: `${name} vient de commencer. Rejoins ton équipe et joue en direct ! 🔥`,
    body_ht: `${name} fèk kòmanse. Antre nan ekip ou epi jwe an dirèk ! 🔥`,
    body_en: `${name} has started. Join your team and play live! 🔥`,
    link,
  }));

  // Une erreur d'insertion ne doit PLUS passer inaperçue.
  let inAppInserted = 0;
  let inAppError: string | null = null;
  for (let i = 0; i < notifs.length; i += 500) {
    const slice = notifs.slice(i, i + 500);
    const { error } = await db.from("notifications").insert(slice);
    if (error) inAppError = error.message;
    else inAppInserted += slice.length;
  }

  // ── 2. Email réel ─────────────────────────────────────────────────────────

  let emailsSent = 0;
  let emailsFailed = 0;
  let emailSkipped = 0;
  let emailError: string | null = null;

  if (!isEmailConfigured()) {
    // Sans cette garde, `send()` ignore le message en silence et on annonce
    // un succès alors que rien n'est parti.
    emailError = "SMTP non configuré (GMAIL_APP_PASSWORD absent) — aucun email n'est parti.";
  } else {
    const recipients = toNotify.filter((u) => {
      if (!u.email) return false;
      return prefsMap.get(u.id) !== false; // pas de préférence = opt-in
    });
    emailSkipped = toNotify.length - recipients.length;

    // Par lots de 5 pour ne pas saturer le SMTP mutualisé.
    for (let i = 0; i < recipients.length; i += 5) {
      const batch = recipients.slice(i, i + 5);
      const results = await Promise.allSettled(batch.map((u) => {
        const raw = langOf.get(u.id) ?? "";
        const lang = (["fr", "ht", "en", "es"].includes(raw) ? raw : "fr") as "fr" | "ht" | "en" | "es";
        return sendChampionshipLaunch({ to: u.email!, lang, seasonName: name });
      }));
      for (const r of results) {
        if (r.status === "fulfilled") emailsSent++;
        else { emailsFailed++; if (!emailError) emailError = String(r.reason).slice(0, 200); }
      }
    }
  }

  // ── 3. Notification push (téléphone, site fermé) ──────────────────────────

  const push = await sendPushToUsers(toNotify.map((u) => u.id), {
    title: "🏆 Nouveau Championnat Biblique !",
    body: `${name} vient de commencer. Rejoins ton équipe et joue en direct !`,
    url: "/championnat",
    tag: `champ-${id}`,
  });

  return NextResponse.json({
    ok: true,
    notified: inAppInserted,
    already: sentSet.size,
    emails_sent: emailsSent,
    emails_failed: emailsFailed,
    emails_skipped: emailSkipped,
    push_sent: push.sent,
    push_failed: push.failed,
    push_devices: push.devices,
    in_app_error: inAppError,
    email_error: emailError,
    push_error: push.error,
  });
}
