import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://koneksyonpam.com";
const NOW  = new Date();

type Freq = MetadataRoute.Sitemap[0]["changeFrequency"];

function entry(
  path: string,
  priority: number,
  changeFrequency: Freq,
  lastModified?: Date
): MetadataRoute.Sitemap[0] {
  return {
    url: `${BASE}${path}`,
    lastModified: lastModified ?? NOW,
    changeFrequency,
    priority,
  };
}

const STATIC: MetadataRoute.Sitemap = [
  entry("/",             1.00, "daily"),
  entry("/aujourd-hui",  0.95, "daily"),
  entry("/bible",        0.95, "monthly"),
  entry("/prieres",      0.85, "hourly"),
  entry("/temoignages",  0.85, "daily"),
  entry("/etude",        0.82, "weekly"),
  entry("/concours",     0.82, "daily"),
  entry("/eglise",       0.78, "weekly"),
  entry("/communaute",   0.78, "weekly"),
  entry("/quiz",         0.72, "weekly"),
  entry("/jeu",          0.70, "weekly"),
  entry("/enseignement", 0.70, "weekly"),
  entry("/decouvrir",    0.65, "monthly"),
  entry("/psaumes",      0.65, "monthly"),
  entry("/louange",      0.65, "monthly"),
  entry("/don",          0.60, "monthly"),
  entry("/apropos",      0.50, "yearly"),
  entry("/contact",      0.50, "yearly"),
];

// Refresh dynamic contest/church URLs every hour on Vercel
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamic: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Contests — every status is publicly viewable
    const { data: contests } = await supabase
      .from("contests")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);

    for (const c of contests ?? []) {
      dynamic.push({
        url: `${BASE}/concours/${c.id}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : NOW,
        changeFrequency: "daily",
        priority: 0.72,
      });
    }
  } catch { /* contests table unavailable — degrade gracefully */ }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Public church / community groups
    const { data: churches } = await supabase
      .from("churches")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);

    for (const c of churches ?? []) {
      dynamic.push({
        url: `${BASE}/eglise/${c.id}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : NOW,
        changeFrequency: "weekly",
        priority: 0.60,
      });
    }
  } catch { /* churches table unavailable — degrade gracefully */ }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Community posts / threads
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .order("updated_at", { ascending: false })
      .limit(300);

    for (const p of posts ?? []) {
      dynamic.push({
        url: `${BASE}/communaute/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : NOW,
        changeFrequency: "weekly",
        priority: 0.55,
      });
    }
  } catch { /* posts table unavailable — degrade gracefully */ }

  return [...STATIC, ...dynamic];
}
