// POST /api/admin/notifications — send contest launch notifications to all users
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { sendContestLaunch, isEmailConfigured } from "@/lib/emails";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { contest_id } = await request.json();
  if (!contest_id) return NextResponse.json({ error: "contest_id required" }, { status: 400 });

  // Sans SMTP, `send()` ignore chaque message en silence : on compterait des
  // envois réussis, on les logguerait comme « sent », et l'anti-doublon
  // empêcherait ensuite tout renvoi. Mieux vaut refuser franchement.
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "SMTP non configuré (GMAIL_APP_PASSWORD absent) — aucun email ne peut partir." },
      { status: 503 },
    );
  }

  const db = adminDb();

  const { data: contest } = await db.from("contests").select("*").eq("id", contest_id).single();
  if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });

  // Get all users via Supabase admin API (includes emails)
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = authData?.users ?? [];

  // Load notification preferences
  const { data: prefs } = await db.from("notification_preferences").select("user_id, email_contests");
  const prefsMap = new Map((prefs || []).map((p: { user_id: string; email_contests: boolean }) => [p.user_id, p]));

  // Filter users who opted in (or have no preference → default opt-in)
  const eligible = authUsers.filter(u => {
    if (!u.email) return false;
    const pref = prefsMap.get(u.id) as { email_contests?: boolean } | undefined;
    return pref ? pref.email_contests !== false : true;
  });

  // Dedup — skip users who already received this notification
  const { data: alreadySent } = await db.from("notification_logs").select("user_id").eq("contest_id", contest_id);
  const sentSet = new Set((alreadySent || []).map((r: { user_id: string }) => r.user_id));
  const toNotify = eligible.filter(u => !sentSet.has(u.id));

  // Batch-load preferred_lang from profiles
  const userIds = toNotify.map(u => u.id);
  let profilesMap = new Map<string, { preferred_lang?: string }>();
  if (userIds.length > 0) {
    const { data: profilesData } = await db.from("profiles").select("id, preferred_lang").in("id", userIds);
    profilesMap = new Map((profilesData || []).map((p: { id: string; preferred_lang?: string }) => [p.id, p]));
  }

  const contestTitle = contest.title || "Concours";
  const titleHt = contest.title_ht || contestTitle;
  const titleEn = contest.title_en || contestTitle;

  let sent = 0;
  let failed = 0;
  const logs: {
    contest_id: string; user_id: string; email: string;
    type: string; status: string; error_message?: string;
  }[] = [];
  const inAppNotifs: {
    user_id: string; type: string;
    title_fr: string; title_ht: string; title_en: string;
    body_fr: string; body_ht: string; body_en: string; link: string;
  }[] = [];

  for (const u of toNotify) {
    const profile = profilesMap.get(u.id);
    const rawLang = profile?.preferred_lang ?? "";
    const lang = (["fr", "ht", "en"].includes(rawLang) ? rawLang : "fr") as "fr" | "ht" | "en";

    inAppNotifs.push({
      user_id: u.id,
      type: "contest",
      title_fr: `🏆 Nouveau concours : ${contestTitle}`,
      title_ht: `🏆 Nouvo konkou : ${titleHt}`,
      title_en: `🏆 New contest: ${titleEn}`,
      body_fr: contest.description || "",
      body_ht: contest.description_ht || contest.description || "",
      body_en: contest.description_en || contest.description || "",
      link: `/championnats/${contest_id}`,
    });

    try {
      await sendContestLaunch({
        to: u.email!,
        lang,
        title: lang === "ht" ? titleHt : lang === "en" ? titleEn : contestTitle,
        description:
          lang === "ht" ? (contest.description_ht || contest.description) :
          lang === "en" ? (contest.description_en || contest.description) :
          contest.description,
        contestId: contest_id,
        startAt: contest.start_at,
      });
      logs.push({ contest_id, user_id: u.id, email: u.email!, type: "email", status: "sent" });
      sent++;
    } catch (err) {
      logs.push({ contest_id, user_id: u.id, email: u.email!, type: "email", status: "failed", error_message: String(err) });
      failed++;
    }
  }

  if (inAppNotifs.length) await db.from("notifications").insert(inAppNotifs);
  if (logs.length) {
    await db.from("notification_logs").upsert(logs, { onConflict: "contest_id,user_id", ignoreDuplicates: true });
  }

  return NextResponse.json({
    ok: true,
    total_users: toNotify.length,
    sent,
    failed,
    already_sent: (alreadySent || []).length,
  });
}

// GET /api/admin/notifications — notification summary per contest
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const db = adminDb();
  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get("contest_id");

  let query = db
    .from("notification_logs")
    .select("contest_id, status, created_at, email")
    .order("created_at", { ascending: false });

  if (contestId) query = (query as typeof query).eq("contest_id", contestId);

  const { data: logs } = await query.limit(500);

  // Aggregate per contest
  const map = new Map<string, { sent: number; failed: number; last_sent: string }>();
  for (const log of logs || []) {
    const existing = map.get(log.contest_id) ?? { sent: 0, failed: 0, last_sent: "" };
    if (log.status === "sent") existing.sent++;
    else existing.failed++;
    if (!existing.last_sent || log.created_at > existing.last_sent) existing.last_sent = log.created_at;
    map.set(log.contest_id, existing);
  }

  return NextResponse.json({ summary: Object.fromEntries(map) });
}
