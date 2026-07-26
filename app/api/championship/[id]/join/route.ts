import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// POST — inscription AUTOMATIQUE : place le joueur dans une équipe non complète
// (celle avec le moins de vrais joueurs), en remplaçant un joueur IA. Aucun choix.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: season } = await db.from("champ_seasons").select("id, status").eq("id", id).maybeSingle();
  if (!season) return NextResponse.json({ error: "Championnat introuvable" }, { status: 404 });
  if (season.status === "finished") return NextResponse.json({ error: "Ce championnat est terminé." }, { status: 400 });

  // Déjà inscrit ?
  const { data: existing } = await db.from("champ_members")
    .select("id, team_id").eq("season_id", id).eq("user_id", user.id).maybeSingle();
  if (existing) {
    const { data: t } = await db.from("champ_teams").select("id, name, color, logo_seed").eq("id", existing.team_id).maybeSingle();
    return NextResponse.json({ ok: true, already: true, team: t });
  }

  const body = await req.json().catch(() => ({})) as { team_id?: string };

  // Compte réels / IA par équipe
  const { data: members } = await db.from("champ_members").select("id, team_id, is_ai").eq("season_id", id);
  const stat: Record<string, { real: number; ai: string[] }> = {};
  for (const m of members ?? []) {
    const tid = m.team_id as string;
    (stat[tid] ??= { real: 0, ai: [] });
    if (m.is_ai) stat[tid].ai.push(m.id as string); else stat[tid].real++;
  }

  let target: string | null = null;
  if (body.team_id) {
    // Le joueur a CHOISI son équipe (son église)
    if (!stat[body.team_id]) return NextResponse.json({ error: "Équipe introuvable." }, { status: 404 });
    if (stat[body.team_id].ai.length === 0) return NextResponse.json({ error: "Cette équipe est complète." }, { status: 400 });
    target = body.team_id;
  } else {
    // Auto : l'équipe avec le moins de vrais joueurs ET au moins une IA à remplacer
    let minReal = Infinity;
    for (const [tid, s] of Object.entries(stat)) {
      if (s.ai.length > 0 && s.real < minReal) { minReal = s.real; target = tid; }
    }
  }
  if (!target) return NextResponse.json({ error: "Toutes les équipes sont complètes." }, { status: 400 });

  // Remplace un joueur IA par le vrai joueur
  const aiToReplace = stat[target].ai[0];
  await db.from("champ_members").update({
    user_id: user.id, is_ai: false,
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Joueur",
    avatar: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    country: null, level: null, skill: 0.65, speed: 0.65,
  }).eq("id", aiToReplace);

  const { data: t } = await db.from("champ_teams").select("id, name, color, logo_seed").eq("id", target).maybeSingle();
  return NextResponse.json({ ok: true, team: t });
}
