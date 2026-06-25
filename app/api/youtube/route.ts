export async function GET() {
  try {
    const res = await fetch(
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCl01tzkV_QzhPvZ-pf9Ey-g",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("YouTube feed unavailable");
    const xml = await res.text();

    const videoIds = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)].map((m) => m[1]);
    const titles = [...xml.matchAll(/<title>([^<]+)<\/title>/g)].slice(1).map((m) => m[1]);
    const published = [...xml.matchAll(/<published>([^<]+)<\/published>/g)].map((m) => m[1]);

    const videos = videoIds.slice(0, 12).map((id, i) => ({
      id,
      title: titles[i] || "KONEKSYON PAM",
      published: published[i] || "",
    }));

    return Response.json({ videos });
  } catch {
    return Response.json({ videos: [] }, { status: 200 });
  }
}
