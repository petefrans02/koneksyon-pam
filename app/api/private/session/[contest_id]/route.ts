import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function generateInviteCode(): string {
  return `KP-${Math.floor(Math.random() * 900000 + 100000)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contest_id: string }> }
) {
  const { contest_id } = await params;

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { target_count?: number };
  const target_count = Math.min(Math.max(body.target_count ?? 2, 2), 100);

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Load source contest
  const { data: source } = await db
    .from("contests")
    .select("*")
    .eq("id", contest_id)
    .single();

  if (!source) return NextResponse.json({ error: "Championnat introuvable" }, { status: 404 });

  // Load source rounds
  const { data: sourceRounds } = await db
    .from("contest_rounds")
    .select("*")
    .eq("contest_id", contest_id)
    .order("round_number");

  if (!sourceRounds?.length) {
    return NextResponse.json({ error: "Ce championnat n'a pas encore de manches" }, { status: 400 });
  }

  // Generate unique invite code
  let invite_code = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await db.from("contests").select("id").eq("invite_code", invite_code).maybeSingle();
    if (!existing) break;
    invite_code = generateInviteCode();
  }

  // Clone the contest
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, updated_at: _ua, started_at: _sa, ended_at: _ea, scheduled_start_at: _ssa, ...sourceFields } = source;

  const { data: cloned, error: cloneErr } = await db.from("contests").insert({
    ...sourceFields,
    title: source.title,
    status: "upcoming",
    is_private: true,
    parent_contest_id: contest_id,
    invite_code,
    organizer_id: user.id,
    auto_launch_count: target_count,
    max_participants: target_count + 10, // slight buffer
    enabled: true,
  }).select("id, invite_code").single();

  if (cloneErr || !cloned) {
    return NextResponse.json({ error: cloneErr?.message ?? "Erreur création" }, { status: 500 });
  }

  // Clone the rounds
  const roundInserts = sourceRounds.map(r => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _rid, created_at: _rca, ...roundFields } = r;
    return { ...roundFields, contest_id: cloned.id };
  });

  const { error: roundsErr } = await db.from("contest_rounds").insert(roundInserts);
  if (roundsErr) {
    await db.from("contests").delete().eq("id", cloned.id);
    return NextResponse.json({ error: roundsErr.message }, { status: 500 });
  }

  // Auto-join the host
  await db.from("contest_participants").upsert({
    contest_id: cloned.id,
    user_id: user.id,
    user_name: (user.user_metadata?.full_name as string) ?? user.email ?? "Hôte",
    user_avatar: (user.user_metadata?.avatar_url as string) ?? null,
  }, { onConflict: "contest_id,user_id" });

  return NextResponse.json({
    ok: true,
    id: cloned.id,
    invite_code: cloned.invite_code,
    target_count,
  });
}
