import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { alternates, eventSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const url = `${BASE}/concours/${id}`;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("contests")
      .select("title, description, start_date, end_date")
      .eq("id", id)
      .single();

    if (data) {
      return {
        title: data.title,
        description: data.description ?? `Participez au concours biblique « ${data.title} » sur KONEKSYON PAM.`,
        alternates: alternates(`/concours/${id}`),
        openGraph: {
          title: `${data.title} — KONEKSYON PAM`,
          description: data.description ?? "Concours biblique en direct sur KONEKSYON PAM.",
          type: "website",
          url,
        },
      };
    }
  } catch { /* Supabase unavailable — use fallback */ }

  return {
    title: "Concours biblique",
    description: "Participez à ce concours biblique en direct sur KONEKSYON PAM.",
    alternates: alternates(`/concours/${id}`),
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const url = `${BASE}/concours/${id}`;

  let title = "Concours biblique";
  let description = "Participez à ce concours biblique en direct sur KONEKSYON PAM.";

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("contests")
      .select("title, description, start_date, end_date")
      .eq("id", id)
      .single();

    if (data) {
      title       = data.title;
      description = data.description ?? description;
    }
  } catch { /* degrade gracefully */ }

  const schema = eventSchema({ name: title, description, url });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
