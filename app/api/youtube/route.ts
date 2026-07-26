// GET /api/youtube — latest videos + live stream detection
// Uses YouTube Data API v3 if YOUTUBE_API_KEY is set, falls back to RSS feed
import { NextResponse } from "next/server";
import { getYouTubeLiveStream } from "@/lib/social-post";

export async function GET() {
  const apiKey    = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCl01tzkV_QzhPvZ-pf9Ey-g";

  let videos: { id: string; title: string; thumbnail?: string; published: string; url: string }[] = [];
  let live: { live: boolean; video_id?: string; title?: string } = { live: false };

  // ── Live stream detection (requires API key) ──────────────────────────────
  if (apiKey) {
    live = await getYouTubeLiveStream().catch(() => ({ live: false }));
  }

  // ── Videos via API (better thumbnails) ───────────────────────────────────
  if (apiKey) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`,
        { next: { revalidate: 300 } }
      );
      const data = await res.json();
      if (res.ok && data.items) {
        videos = data.items.map((item: {
          id: { videoId: string };
          snippet: { title: string; thumbnails: { high?: { url: string }; medium?: { url: string } }; publishedAt: string };
        }) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url,
          published: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
      }
    } catch {}
  }

  // ── Fallback: RSS feed (no API key needed) ────────────────────────────────
  if (!videos.length) {
    try {
      const res = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const xml = await res.text();
        const ids       = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)].map(m => m[1]);
        const titles    = [...xml.matchAll(/<title>([^<]+)<\/title>/g)].slice(1).map(m => m[1]);
        const published = [...xml.matchAll(/<published>([^<]+)<\/published>/g)].map(m => m[1]);
        videos = ids.slice(0, 12).map((id, i) => ({
          id,
          title: titles[i] ?? "KONEKSYON PAM",
          published: published[i] ?? "",
          url: `https://www.youtube.com/watch?v=${id}`,
        }));
      }
    } catch {}
  }

  return NextResponse.json({ videos, live });
}
