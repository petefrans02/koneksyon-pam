import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
async function authUser(req: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  return user;
}

// GET — liste des équipes du concours avec score total et nombre de membres.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = db();

  const { data: teams } = await client
    .from("contest_teams")
    .select("id, name, created_at, created_by")
    .eq("contest_id", id)
    .order("created_at", { ascending: true });

  const { data: rows } = await client
    .from("championship_leaderboard")
    .select("team_id, total_score, player_id, player_name")
    .eq("contest_id", id);

  const agg: Record<string, { score: number; members: number }> = {};
  const nameById: Record<string, string> = {};
  for (const r of rows ?? []) {
    const rr = r as { team_id?: string | null; total_score?: number; player_id?: string; player_name?: string };
    if (rr.player_id && rr.player_name) nameById[rr.player_id] = rr.player_name;
    const tid = rr.team_id;
    if (!tid) continue;
    if (!agg[tid]) agg[tid] = { score: 0, members: 0 };
    agg[tid].score += rr.total_score ?? 0;
    agg[tid].members += 1;
  }

  const result = (teams ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    total_score: agg[t.id]?.score ?? 0,
    member_count: agg[t.id]?.members ?? 0,
    captain_name: (t as { created_by?: string }).created_by ? (nameById[(t as { created_by?: string }).created_by!] ?? null) : null,
  })).sort((a, b) => b.total_score - a.total_score);

  return NextResponse.json({ teams: result });
}

// POST — rejoindre (ou créer) une équipe par son nom, et s'y affilier.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { name?: string; mode?: "create" | "join" };
  const name = (body.name ?? "").trim();
  const mode = body.mode;
  if (!name || name.length < 2) return NextResponse.json({ error: "Nom d'équipe requis" }, { status: 400 });
  if (name.length > 60) return NextResponse.json({ error: "Nom trop long" }, { status: 400 });

  const client = db();

  // Trouver l'équipe existante (insensible à la casse).
  const { data: existing } = await client
    .from("contest_teams")
    .select("id, name")
    .eq("contest_id", id)
    .ilike("name", name)
    .maybeSingle();

  // Le responsable CRÉE : refuse si le nom existe déjà.
  if (mode === "create" && existing) {
    return NextResponse.json({ error: "team_exists" }, { status: 409 });
  }
  // Un membre REJOINT : l'équipe doit exister.
  if (mode === "join" && !existing) {
    return NextResponse.json({ error: "team_not_found" }, { status: 404 });
  }

  let team = existing;
  if (!team) {
    const { data: created, error: cErr } = await client
      .from("contest_teams")
      .insert({ contest_id: id, name, created_by: user.id })
      .select("id, name")
      .single();
    if (cErr) {
      // Course : quelqu'un l'a créée entre-temps → on la relit.
      const { data: again } = await client
        .from("contest_teams").select("id, name").eq("contest_id", id).ilike("name", name).maybeSingle();
      if (!again) return NextResponse.json({ error: cErr.message }, { status: 500 });
      team = again;
    } else {
      team = created;
    }
  }

  // Affilier le joueur (upsert de sa ligne de classement avec team_id).
  await client.from("championship_leaderboard").upsert({
    contest_id: id,
    player_id: user.id,
    player_name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Joueur",
    player_avatar: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    team_id: team!.id,
  }, { onConflict: "contest_id,player_id" });

  return NextResponse.json({ ok: true, team });
}
