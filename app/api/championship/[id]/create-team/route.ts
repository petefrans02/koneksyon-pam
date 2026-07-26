import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// POST { name } — une église crée SON équipe : renomme une équipe libre à son nom et rejoint.
// Ses membres pourront ensuite la retrouver dans la liste et la rejoindre.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { name?: string };
  const name = (body.name ?? "").trim();
  if (name.length < 2) return NextResponse.json({ error: "Nom trop court" }, { status: 400 });
  if (name.length > 40) return NextResponse.json({ error: "Nom trop long (40 max)" }, { status: 400 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: season } = await db.from("champ_seasons").select("status").eq("id", id).maybeSingle();
  if (!season) return NextResponse.json({ error: "Championnat introuvable" }, { status: 404 });
  if (season.status === "finished") return NextResponse.json({ error: "Championnat terminé." }, { status: 400 });

  // Déjà inscrit ?
  const { data: existing } = await db.from("champ_members").select("id, team_id").eq("season_id", id).eq("user_id", user.id).maybeSingle();
  if (existing) {
    const { data: t } = await db.from("champ_teams").select("id, name").eq("id", existing.team_id).maybeSingle();
    return NextResponse.json({ ok: true, already: true, team: t });
  }

  // Nom déjà pris ?
  const { data: dup } = await db.from("champ_teams").select("id").eq("season_id", id).ilike("name", name).maybeSingle();
  if (dup) return NextResponse.json({ error: "Ce nom d'équipe existe déjà. Rejoins-la plutôt." }, { status: 409 });

  // Membres par équipe → choisir une équipe 100% IA (libre) à renommer
  const { data: members } = await db.from("champ_members").select("id, team_id, is_ai").eq("season_id", id);
  const stat: Record<string, { real: number; ai: string[] }> = {};
  for (const m of members ?? []) {
    const tid = m.team_id as string; (stat[tid] ??= { real: 0, ai: [] });
    if (m.is_ai) stat[tid].ai.push(m.id as string); else stat[tid].real++;
  }
  let target: string | null = null;
  for (const [tid, s] of Object.entries(stat)) { if (s.real === 0 && s.ai.length > 0) { target = tid; break; } }
  if (!target) for (const [tid, s] of Object.entries(stat)) { if (s.ai.length > 0) { target = tid; break; } }
  if (!target) return NextResponse.json({ error: "Aucune équipe libre." }, { status: 400 });

  // Renomme l'équipe au nom de l'église + logo (initiales)
  const initials = name.replace(/^Équipe\s+/i, "").slice(0, 2).toUpperCase();
  await db.from("champ_teams").update({ name, logo_seed: initials }).eq("id", target);

  // Rejoint (remplace une IA)
  await db.from("champ_members").update({
    user_id: user.id, is_ai: false,
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Joueur",
    avatar: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    country: null, level: null, skill: 0.65, speed: 0.65,
  }).eq("id", stat[target].ai[0]);

  return NextResponse.json({ ok: true, team: { id: target, name } });
}
