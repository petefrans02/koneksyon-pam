import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// CERTIFICATS DE PARTICIPATION.
//
// Cadre volontairement clair : ce sont des attestations de fin de parcours,
// PAS des diplômes accrédités. Aucune licence n'est requise pour en délivrer,
// à condition de ne jamais laisser croire à une équivalence académique — la
// mention légale est imprimée sur le certificat lui-même.

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

async function currentUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } },
  );
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// Code lisible et sans ambiguïté : ni O/0 ni I/1, pour être dicté au téléphone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(): string {
  let out = "KPA-";
  for (let i = 0; i < 8; i++) {
    if (i === 4) out += "-";
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

// POST — délivre un certificat pour un parcours terminé.
export async function POST(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as {
    program?: string; level?: string; lessons?: number; xp?: number; name?: string;
  };
  const program = (body.program ?? "").trim().slice(0, 120);
  if (!program) return NextResponse.json({ error: "Programme manquant" }, { status: 400 });

  const client = db();

  // Un seul certificat par personne et par programme : on renvoie l'existant.
  const { data: existing } = await client
    .from("certificates").select("*").eq("user_id", user.id).eq("program", program).maybeSingle();
  if (existing) return NextResponse.json({ certificate: existing, already: true });

  const holder =
    (body.name ?? "").trim().slice(0, 80) ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Apprenant";

  // Collision de code quasi impossible, mais on réessaie par sécurité.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const { data, error } = await client.from("certificates").insert({
      code,
      user_id: user.id,
      holder_name: holder,
      program,
      level: body.level ?? null,
      lessons_done: Math.max(0, Math.round(body.lessons ?? 0)),
      xp: Math.max(0, Math.round(body.xp ?? 0)),
    }).select().single();

    if (!error && data) return NextResponse.json({ certificate: data });
    if (error && !error.message.includes("duplicate")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "Impossible de générer un code unique" }, { status: 500 });
}

// GET — la liste de mes certificats.
export async function GET(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ certificates: [] });
  const { data } = await db()
    .from("certificates").select("*").eq("user_id", user.id).order("issued_at", { ascending: false });
  return NextResponse.json({ certificates: data ?? [] });
}
