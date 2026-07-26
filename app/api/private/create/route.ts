import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { isAdminEmail } from "@/lib/admin-auth";

// Allow up to 5 minutes for AI generation
export const maxDuration = 300;

function generateInviteCode(): string {
  return `KP-${Math.floor(Math.random() * 900000 + 100000)}`;
}

const ROUND_COLORS: Record<string, string> = {
  mcq: "#1d4ed8", tf: "#7c3aed", fill: "#0891b2", character: "#be185d",
  location: "#0f766e", book: "#7c2d12", chrono: "#b45309", finale: "#c5a84f",
};
const ROUND_ICONS: Record<string, string> = {
  mcq: "⚡", tf: "🔮", fill: "📝", character: "👤",
  location: "🗺️", book: "📚", chrono: "⏳", finale: "🏆",
};

export async function POST(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  // Réservé aux administrateurs — les utilisateurs ne peuvent pas créer de championnat privé.
  if (!user.email || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({})) as {
    theme?: string;
    title?: string;
    difficulty?: string;
    target_language?: string;
    num_rounds?: number;
  };

  const theme = body.theme?.trim();
  if (!theme) return NextResponse.json({ error: "Le sujet est requis" }, { status: 400 });

  const difficulty = body.difficulty ?? "medium";
  const target_language = body.target_language ?? "fr";
  const num_rounds = Math.min(Math.max(body.num_rounds ?? 5, 2), 8);
  const title = body.title?.trim() || `Championnat : ${theme}`;

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Dedup: never allow two active/upcoming private contests for the same user+theme
  const { data: existing } = await db
    .from("contests")
    .select("id, invite_code")
    .eq("organizer_id", user.id)
    .eq("is_private", true)
    .in("status", ["upcoming", "active"])
    .ilike("theme", theme)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id, invite_code: existing.invite_code, rounds_created: 0 });
  }

  // Generate unique invite code
  let invite_code = generateInviteCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await db.from("contests").select("id").eq("invite_code", invite_code).maybeSingle();
    if (!existing) break;
    invite_code = generateInviteCode();
    attempts++;
  }

  // Create contest first so we have an ID for the rounds
  const { data: contest, error: contestErr } = await db.from("contests").insert({
    title,
    theme,
    status: "upcoming",
    is_private: true,
    invite_code,
    organizer_id: user.id,
    difficulty,
    target_language,
    num_rounds,
    max_participants: 500,
    auto_launch_count: 2, // auto-start when organizer + 1 friend are in the lobby
    duration_minutes: num_rounds * 3,
    description: `Championnat privé sur le thème : ${theme}`,
  }).select("id, invite_code").single();

  if (contestErr || !contest) {
    return NextResponse.json({ error: contestErr?.message ?? "Erreur création" }, { status: 500 });
  }

  // AI generation
  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
  });

  const diffLabel = difficulty === "easy" ? "Débutant" : difficulty === "hard" ? "Expert" : "Intermédiaire";
  const langNote = target_language === "ht" ? "haïtien créole" : target_language === "en" ? "anglais" : "français";

  const prompt = `Tu es un expert en éducation biblique. Génère ${num_rounds} manches pour un championnat biblique privé.

THÈME : "${theme}"
NIVEAU : ${diffLabel}
LANGUE PRINCIPALE : ${langNote} (inclure aussi fr, ht, en dans chaque champ)

Retourne UNIQUEMENT ce JSON valide (aucun texte avant ou après) :
{
  "rounds": [
    {
      "round_type": "mcq",
      "title": { "fr": "...", "ht": "...", "en": "..." },
      "instructions": { "fr": "...", "ht": "...", "en": "..." },
      "time_limit_sec": 15,
      "points_per_q": 100,
      "questions": [
        {
          "q": { "fr": "...", "ht": "...", "en": "..." },
          "options": [
            { "fr": "...", "ht": "...", "en": "..." },
            { "fr": "...", "ht": "...", "en": "..." },
            { "fr": "...", "ht": "...", "en": "..." },
            { "fr": "...", "ht": "...", "en": "..." }
          ],
          "correct": 0,
          "ref": "Référence biblique",
          "explanation": { "fr": "...", "ht": "...", "en": "..." }
        }
      ]
    }
  ]
}

Types disponibles (varie les types) :
- "mcq": QCM 4 options (5 questions) — format ci-dessus
- "tf": Vrai/Faux (6 questions) — statement:{fr,ht,en}, is_true:bool, ref, explanation:{fr,ht,en}
- "fill": Compléter verset (4 questions) — verse:{fr,ht,en} avec ___, fill_options:[{fr,ht,en}x4], correct:int, ref, explanation:{fr,ht,en}
- "character": Identifier personnage (4 questions) — clues:[{fr,ht,en}x3], options:[{fr,ht,en}x4], correct:int(0-3), answer:{fr,ht,en}, ref
- "location": Identifier lieu (4 questions) — même format que character
- "book": Reconnaître livre (4 questions) — même format que character
- "finale": Finale difficile (5 questions) — même format que mcq, difficulté maximale

Règles :
- La DERNIÈRE manche doit TOUJOURS être de type "finale"
- Varie les types pour les autres manches
- Génère exactement ${num_rounds} manches
- Chaque question doit être liée au thème "${theme}"
- Retourne UNIQUEMENT le JSON`;

  let rawText = "";
  try {
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 12000,
      system: "Tu génères du contenu éducatif biblique en JSON valide uniquement. Aucun texte avant ou après le JSON.",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        rawText += chunk.delta.text;
      }
    }
  } catch (err) {
    // Delete the contest if AI fails
    await db.from("contests").delete().eq("id", contest.id);
    return NextResponse.json({ error: "Erreur IA", detail: String(err) }, { status: 500 });
  }

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    await db.from("contests").delete().eq("id", contest.id);
    return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });
  }

  let parsed: { rounds: Record<string, unknown>[] };
  try { parsed = JSON.parse(jsonMatch[0]); }
  catch {
    await db.from("contests").delete().eq("id", contest.id);
    return NextResponse.json({ error: "JSON invalide" }, { status: 500 });
  }

  if (!parsed.rounds?.length) {
    await db.from("contests").delete().eq("id", contest.id);
    return NextResponse.json({ error: "Aucune manche générée" }, { status: 500 });
  }

  type ParsedRound = {
    round_type: string;
    title: Record<string, string>;
    instructions: Record<string, string>;
    time_limit_sec?: number;
    points_per_q?: number;
    questions: unknown[];
  };

  const roundInserts = (parsed.rounds as ParsedRound[]).map((r, i) => ({
    contest_id: contest.id,
    round_number: i + 1,
    round_type: r.round_type,
    title: r.title,
    instructions: r.instructions,
    color_theme: ROUND_COLORS[r.round_type] || "#1d4ed8",
    icon: ROUND_ICONS[r.round_type] || "⚡",
    time_limit_sec: r.time_limit_sec || 15,
    points_per_q: r.points_per_q || 100,
    questions: r.questions,
  }));

  const { error: roundsErr } = await db.from("contest_rounds").insert(roundInserts);
  if (roundsErr) {
    await db.from("contests").delete().eq("id", contest.id);
    return NextResponse.json({ error: roundsErr.message }, { status: 500 });
  }

  // Auto-join the organizer as a participant
  await db.from("contest_participants").upsert({
    contest_id: contest.id,
    user_id: user.id,
    user_name: (user.user_metadata?.full_name as string) ?? user.email ?? "Organisateur",
    user_avatar: (user.user_metadata?.avatar_url as string) ?? null,
  }, { onConflict: "contest_id,user_id" });

  return NextResponse.json({
    ok: true,
    id: contest.id,
    invite_code: contest.invite_code,
    rounds_created: roundInserts.length,
  });
}
