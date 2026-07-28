import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { alternates } from "@/lib/seo";
import ConcoursClient from "./ConcoursClient";

// Vérification côté SERVEUR : un concours supprimé (ou un identifiant inventé)
// renvoyait « 200 OK » sur une page vide. Google traitait ça comme un soft 404
// et cessait d'indexer correctement le site.

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

// Un identifiant qui n'a même pas la forme d'un UUID ne mérite pas un aller-retour en base.
const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

async function getContest(id: string) {
  if (!isUuid(id)) return null;
  try {
    const { data } = await db().from("contests").select("id, title").eq("id", id).maybeSingle();
    return data ?? null;
  } catch {
    // En cas de souci réseau on laisse passer : mieux vaut afficher la page que
    // renvoyer un 404 à tort sur un concours qui existe vraiment.
    return { id, title: null };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contest = await getContest(id);
  if (!contest) return {};
  const t = contest.title as string | Record<string, string> | null;
  const title = typeof t === "string" ? t : (t?.fr ?? "Championnat");
  return { title, alternates: alternates(`/championnats/${id}`) };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getContest(id))) notFound();
  return <ConcoursClient />;
}
