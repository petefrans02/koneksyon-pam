// GET  — integration status (Facebook pages + YouTube)
// POST — test connection / toggle auto-post settings
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { getYouTubeLiveStream, getYouTubeVideos } from "@/lib/social-post";

async function getSocialSettings(db: ReturnType<typeof adminDb>) {
  const { data } = await db.from("social_settings").select("*").limit(1).maybeSingle();
  return data ?? {
    facebook_enabled: true,
    youtube_enabled: true,
    auto_post_contests: true,
    auto_post_prayers: false,
    auto_post_testimonies: true,
    auto_post_studies: true,
    auto_post_announcements: true,
  };
}

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const db = adminDb();
  const settings = await getSocialSettings(db);

  // Facebook pages status — just check if env vars are set (no API call on GET)
  const PAGE_NAMES: Record<string, string> = {
    "216627234857368": "Pasteur Peterson Francis",
    "111306667221374": "Pasteur P.Francis",
    "1097882603417911": "Koneksyon Pam",
  };
  const facebookPages = [];
  for (let i = 1; i <= 3; i++) {
    const id    = process.env[`FACEBOOK_PAGE_${i}_ID`];
    const token = process.env[`FACEBOOK_PAGE_${i}_TOKEN`];
    if (!id || !token) continue;
    facebookPages.push({ id, name: PAGE_NAMES[id] ?? `Page ${i}`, connected: true });
  }

  // YouTube status
  let youtubeConnected = false;
  let youtubeLive = false;
  let youtubeLiveTitle = "";
  if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID) {
    youtubeConnected = true;
    try {
      const live = await getYouTubeLiveStream();
      youtubeLive = live.live;
      youtubeLiveTitle = live.title ?? "";
    } catch {}
  }

  // Last social post log
  const { data: lastLog } = await db
    .from("social_post_logs")
    .select("created_at, platform, page_name, status")
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    facebook: { pages: facebookPages, connected: facebookPages.some(p => p.connected) },
    youtube: { connected: youtubeConnected, live: youtubeLive, live_title: youtubeLiveTitle },
    settings,
    recent_logs: lastLog ?? [],
  });
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { action, settings } = await request.json();
  const db = adminDb();

  if (action === "save_settings" && settings) {
    const existing = await getSocialSettings(db);
    if (existing.id) {
      await db.from("social_settings").update(settings).eq("id", existing.id);
    } else {
      await db.from("social_settings").insert(settings);
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "test_facebook") {
    const results = [];
    for (let i = 1; i <= 3; i++) {
      const id    = process.env[`FACEBOOK_PAGE_${i}_ID`];
      const token = process.env[`FACEBOOK_PAGE_${i}_TOKEN`];
      if (!id || !token) continue;
      try {
        const r = await fetch(`https://graph.facebook.com/v20.0/${id}?fields=name,fan_count&access_token=${token}`);
        const d = await r.json();
        results.push({ id, name: d.name, fan_count: d.fan_count, ok: !!d.name, error: d.error?.message });
      } catch (e) {
        results.push({ id, ok: false, error: String(e) });
      }
    }
    return NextResponse.json({ ok: true, results });
  }

  if (action === "test_youtube") {
    const { videos, error } = await getYouTubeVideos(3);
    return NextResponse.json({ ok: !error, videos, error });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
