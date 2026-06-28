// Social media posting — server-side only, never import in client components.
// Keys live exclusively in Vercel environment variables.

export interface SocialResult {
  success: boolean;
  post_id?: string;
  error?: string;
}

export interface PageResult {
  page_id: string;
  page_name: string;
  success: boolean;
  post_id?: string;
  error?: string;
}

// ── Facebook ──────────────────────────────────────────────────────────────────
// Publishes to all configured pages (FACEBOOK_PAGE_1..3)
// Each page has its own PAGE_N_ID and PAGE_N_TOKEN env var.

function getFacebookPages(): { id: string; token: string; name: string }[] {
  const pages = [];
  const names: Record<string, string> = {
    [process.env.FACEBOOK_PAGE_1_ID ?? ""]: "Pasteur Peterson Francis",
    [process.env.FACEBOOK_PAGE_2_ID ?? ""]: "Pasteur P.Francis",
    [process.env.FACEBOOK_PAGE_3_ID ?? ""]: "Koneksyon Pam",
  };
  for (let i = 1; i <= 3; i++) {
    const id    = process.env[`FACEBOOK_PAGE_${i}_ID`];
    const token = process.env[`FACEBOOK_PAGE_${i}_TOKEN`];
    if (id && token) pages.push({ id, token, name: names[id] ?? `Page ${i}` });
  }
  return pages;
}

async function postToOnePage(
  pageId: string, token: string, message: string, link?: string
): Promise<SocialResult> {
  const body: Record<string, string> = { message, access_token: token };
  if (link) body.link = link;

  const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error?.message ?? "Facebook error" };
  return { success: true, post_id: data.id };
}

export async function postToFacebook(
  message: string, link?: string
): Promise<{ results: PageResult[]; any_success: boolean }> {
  const pages = getFacebookPages();
  if (!pages.length) {
    return {
      results: [{ page_id: "", page_name: "—", success: false, error: "Aucune page Facebook configurée" }],
      any_success: false,
    };
  }

  const results = await Promise.all(
    pages.map(async p => {
      const r = await postToOnePage(p.id, p.token, message, link);
      return { page_id: p.id, page_name: p.name, ...r };
    })
  );

  return { results, any_success: results.some(r => r.success) };
}

// ── Facebook auto-post helpers ─────────────────────────────────────────────────
// Called from API routes when new content is published

export async function autoPostContest(title: string, contestId: string, lang = "fr") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koneksyonpam.com";
  const link = `${base}/concours/${contestId}`;

  const messages: Record<string, string> = {
    fr: `🏆 Nouveau concours biblique : "${title}" !\n\nParticipe maintenant et teste tes connaissances de la Bible.\n👉 ${link}\n\n#KoneksyonPAM #Concours #Bible`,
    ht: `🏆 Nouvo konkou biblik : "${title}" !\n\nPatisipe kounye a epi teste konesans ou nan Bib la.\n👉 ${link}\n\n#KoneksyonPAM #Konkou #Bibla`,
    en: `🏆 New Bible contest: "${title}"!\n\nJoin now and test your Bible knowledge.\n👉 ${link}\n\n#KoneksyonPAM #Contest #Bible`,
  };

  return postToFacebook(messages[lang] ?? messages.fr, link);
}

export async function autoPostTestimony(name: string, preview: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koneksyonpam.com";
  const link = `${base}/temoignages`;
  const message = `✨ Nouveau témoignage partagé par ${name} :\n\n"${preview.slice(0, 150)}${preview.length > 150 ? "…" : ""}"\n\nLis tous les témoignages sur KONEKSYON PAM !\n👉 ${link}\n\n#KoneksyonPAM #Témoignage #Foi`;
  return postToFacebook(message, link);
}

export async function autoPostBibleStudy(title: string, slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koneksyonpam.com";
  const link = `${base}/etude/${slug}`;
  const message = `📖 Nouvelle étude biblique disponible : "${title}"\n\nApprofondis ta foi avec nos études sur KONEKSYON PAM.\n👉 ${link}\n\n#KoneksyonPAM #EtudeBiblique #Parole`;
  return postToFacebook(message, link);
}

export async function autoPostAnnouncement(title: string, body: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koneksyonpam.com";
  const message = `📢 ${title}\n\n${body.slice(0, 200)}${body.length > 200 ? "…" : ""}\n\n👉 ${base}\n\n#KoneksyonPAM`;
  return postToFacebook(message, base);
}

// ── YouTube ───────────────────────────────────────────────────────────────────
// Fetches latest videos and checks for active live streams via YouTube Data API v3

export async function getYouTubeVideos(maxResults = 6): Promise<{
  videos: { id: string; title: string; thumbnail: string; published: string; url: string }[];
  error?: string;
}> {
  const apiKey    = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) return { videos: [], error: "YouTube credentials not configured" };

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}&type=video`,
    { next: { revalidate: 300 } } // cache 5 min
  );
  const data = await res.json();
  if (!res.ok) return { videos: [], error: data.error?.message };

  const videos = (data.items ?? []).map((item: {
    id: { videoId: string };
    snippet: { title: string; thumbnails: { high?: { url: string }; medium?: { url: string } }; publishedAt: string };
  }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? "",
    published: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));

  return { videos };
}

export async function getYouTubeLiveStream(): Promise<{
  live: boolean;
  video_id?: string;
  title?: string;
  error?: string;
}> {
  const apiKey    = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) return { live: false, error: "YouTube credentials not configured" };

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&eventType=live&type=video`,
    { next: { revalidate: 60 } } // check every minute
  );
  const data = await res.json();
  if (!res.ok) return { live: false, error: data.error?.message };

  const item = data.items?.[0];
  if (!item) return { live: false };

  return {
    live: true,
    video_id: item.id.videoId,
    title: item.snippet.title,
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export type Platform = "facebook" | "youtube";

export async function publishToSocial(
  platforms: Platform[],
  message: string,
  link?: string
): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};
  if (platforms.includes("facebook")) {
    results.facebook = await postToFacebook(message, link);
  }
  return results;
}
