import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { alternates } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("churches")
      .select("name, description, city, country")
      .eq("id", id)
      .single();

    if (data) {
      const title = data.name;
      const location = [data.city, data.country].filter(Boolean).join(", ");
      const description =
        data.description ??
        `Rejoignez le groupe d'église « ${data.name} »${location ? ` à ${location}` : ""} sur KONEKSYON PAM.`;

      return {
        title,
        description,
        alternates: alternates(`/eglise/${id}`),
        openGraph: {
          title: `${title} — KONEKSYON PAM`,
          description,
          type: "website",
          url: `${BASE}/eglise/${id}`,
        },
      };
    }
  } catch { /* degrade gracefully */ }

  return {
    title: "Groupe d'église",
    description: "Rejoignez ce groupe d'église sur KONEKSYON PAM.",
    alternates: alternates(`/eglise/${id}`),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
