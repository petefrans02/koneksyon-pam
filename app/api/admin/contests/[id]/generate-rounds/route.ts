import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

const ROUND_COLORS: Record<string, string> = {
  mcq: "#1d4ed8", tf: "#7c3aed", fill: "#0891b2", match: "#ea580c",
  order_verse: "#16a34a", chrono: "#b45309", character: "#be185d",
  location: "#0f766e", book: "#7c2d12", finale: "#c5a84f",
};
const ROUND_ICONS: Record<string, string> = {
  mcq: "⚡", tf: "🔮", fill: "📝", match: "🔗",
  order_verse: "📖", chrono: "⏳", character: "👤",
  location: "🗺️", book: "📚", finale: "🏆",
};

// Schema descriptions per round type for targeted single-round generation
const TYPE_SCHEMAS: Record<string, string> = {
  mcq: `QCM avec 5 questions. Chaque question: {"q":{"fr":"...","ht":"...","en":"..."},"options":[{"fr":"...","ht":"...","en":"..."}x4],"correct":0,"ref":"...","explanation":{"fr":"...","ht":"...","en":"..."}}`,
  tf: `Vrai/Faux avec 6 questions. Chaque question: {"statement":{"fr":"...","ht":"...","en":"..."},"is_true":true,"ref":"...","explanation":{"fr":"...","ht":"...","en":"..."}}`,
  fill: `Compléter le verset avec 4 questions. Chaque question: {"verse":{"fr":"verset avec ___ vide","ht":"...","en":"..."},"fill_options":[{"fr":"...","ht":"...","en":"..."}x4],"correct":0,"ref":"...","explanation":{"fr":"...","ht":"...","en":"..."}}`,
  character: `Identifier personnage avec 4 questions. Chaque question: {"clues":[{"fr":"Indice 1","ht":"...","en":"..."},{"fr":"Indice 2","ht":"...","en":"..."},{"fr":"Indice 3","ht":"...","en":"..."}],"options":[{"fr":"Nom A","ht":"...","en":"..."},{"fr":"Nom B","ht":"...","en":"..."},{"fr":"Nom C","ht":"...","en":"..."},{"fr":"Nom D","ht":"...","en":"..."}],"correct":0,"answer":{"fr":"Nom A","ht":"...","en":"..."},"ref":"..."}. Les 4 options sont des personnages bibliques différents, la bonne réponse est à l'index "correct".`,
  location: `Identifier lieu biblique avec 4 questions. Chaque question: {"clues":[{"fr":"...","ht":"...","en":"..."}x3],"options":[{"fr":"Lieu A","ht":"...","en":"..."}x4],"correct":0,"answer":{"fr":"Lieu A","ht":"...","en":"..."},"ref":"..."}. Les 4 options sont des lieux bibliques différents.`,
  book: `Identifier livre de la Bible avec 4 questions. Chaque question: {"clues":[{"fr":"...","ht":"...","en":"..."}x3],"options":[{"fr":"Livre A","ht":"...","en":"..."}x4],"correct":0,"answer":{"fr":"Livre A","ht":"...","en":"..."},"ref":"..."}. Les 4 options sont des livres bibliques différents.`,
  chrono: `Ordre chronologique avec 1 question. La question: {"events":[{"id":"1","text":{"fr":"...","ht":"...","en":"..."},"correct_position":1},{"id":"2","text":{"fr":"...","ht":"...","en":"..."},"correct_position":2},{"id":"3","text":{"fr":"...","ht":"...","en":"..."},"correct_position":3},{"id":"4","text":{"fr":"...","ht":"...","en":"..."},"correct_position":4}],"ref":"..."}`,
  match: `Associer des paires avec 1 question. La question: {"pairs":[{"left":{"fr":"...","ht":"...","en":"..."},"right":{"fr":"...","ht":"...","en":"..."}}x5],"ref":"..."}`,
  order_verse: `Remettre en ordre avec 2 questions. Chaque question: {"parts":[{"id":"a","text":{"fr":"partie 1","ht":"...","en":"..."}},{"id":"b","text":{"fr":"partie 2","ht":"...","en":"..."}},{"id":"c","text":{"fr":"partie 3","ht":"...","en":"..."}}],"correct_order":["a","b","c"],"ref":"..."}`,
  finale: `Finale avec 5 questions difficiles. Même format que MCQ mais avec des questions très approfondies.`,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(request); }
  catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }

  const { id } = await params;
  const body = await request.json().catch(() => ({})) as {
    num_rounds?: number;
    round_type?: string;
    round_number?: number;
  };
  const { num_rounds = 5, round_type, round_number } = body;

  const db = adminDb();

  // Fetch contest
  const { data: contest } = await db
    .from("contests")
    .select("title, theme, duration_minutes")
    .eq("id", id)
    .single();

  if (!contest) return NextResponse.json({ error: "Concours introuvable" }, { status: 404 });

  const topic = contest.theme || contest.title;

  // FIX 1: Use CLAUDE_API_KEY (Vercel env var name) with fallback to ANTHROPIC_API_KEY
  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `Tu es un expert en éducation biblique. Tu génères des championnats bibliques complets en JSON valide et UNIQUEMENT en JSON (aucun texte avant ou après). Le JSON doit être strictement valide et parseable.`;

  let userPrompt: string;
  let isSingleRound = false;

  // FIX 2: If round_type and round_number are provided, generate only that specific round
  if (round_type && round_number) {
    isSingleRound = true;
    const schema = TYPE_SCHEMAS[round_type] || TYPE_SCHEMAS.mcq;
    userPrompt = `Génère UNE manche de type "${round_type}" pour un championnat biblique sur le thème : "${topic}".
Niveau : Moyen à Difficile
Langue : français avec traductions en haïtien créole (ht) et anglais (en)

Schema de la manche : ${schema}

Retourne UNIQUEMENT ce JSON (sans texte avant ou après) :
{
  "rounds": [
    {
      "round_type": "${round_type}",
      "title": { "fr": "Épreuve ${round_number} — [titre thématique]", "ht": "...", "en": "..." },
      "instructions": { "fr": "[instruction claire pour ce type]", "ht": "...", "en": "..." },
      "time_limit_sec": 150,
      "points_per_q": 100,
      "questions": [ /* questions selon le schema ci-dessus */ ]
    }
  ]
}`;
  } else {
    // FIX 2b: Full generation — delete all rounds and regenerate
    await db.from("contest_rounds").delete().eq("contest_id", id);

    userPrompt = `Génère ${num_rounds} manches pour un championnat biblique sur le thème : "${topic}"
Niveau : Moyen
Langue : français (avec traductions ht et en)

Retourne UNIQUEMENT ce JSON (sans texte avant ou après) :
{
  "rounds": [
    {
      "round_type": "mcq",
      "title": { "fr": "Manche 1 — ...", "ht": "...", "en": "..." },
      "instructions": { "fr": "Choisissez la bonne réponse.", "ht": "...", "en": "..." },
      "time_limit_sec": 150,
      "points_per_q": 100,
      "questions": [
        {
          "q": { "fr": "...", "ht": "...", "en": "..." },
          "options": [{"fr":"...","ht":"...","en":"..."},{"fr":"...","ht":"...","en":"..."},{"fr":"...","ht":"...","en":"..."},{"fr":"...","ht":"...","en":"..."}],
          "correct": 0,
          "ref": "Jean 3:16",
          "explanation": { "fr": "...", "ht": "...", "en": "..." }
        }
      ]
    }
  ]
}

Types disponibles (varie les types) :
- "mcq": QCM 4 options (5-7 questions, 150s, 100pts)
- "tf": Vrai/Faux (6-8 questions, 120s, 80pts) — statement:{fr,ht,en}, is_true:bool, ref, explanation:{fr,ht,en}
- "fill": Compléter verset (4-6 questions, 120s, 120pts) — verse:{fr,ht,en} avec ___, fill_options:[{fr,ht,en}x4], correct:int, ref
- "character": Identifier personnage (4-5 questions, 150s, 120pts) — clues:[{fr,ht,en}x3], options:[{fr,ht,en}x4], correct:int(0-3), answer:{fr,ht,en}, ref
- "location": Identifier lieu (4-5 questions, 150s, 120pts) — clues:[{fr,ht,en}x3], options:[{fr,ht,en}x4], correct:int(0-3), answer:{fr,ht,en}, ref
- "book": Reconnaître livre (5-6 questions, 120s, 100pts) — clues:[{fr,ht,en}x3], options:[{fr,ht,en}x4], correct:int(0-3), answer:{fr,ht,en}, ref
- "finale": Finale expert (5-7 questions, 200s, 200pts) — format MCQ avancé

La DERNIÈRE manche doit TOUJOURS être de type "finale".
Génère exactement ${num_rounds} manches, chacune avec au moins 4 questions.
Retourne UNIQUEMENT le JSON, rien d'autre.`;
  }

  let rawText = "";
  try {
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      stream: true,
    });
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        rawText += chunk.delta.text;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Erreur IA", detail: msg }, { status: 500 });
  }

  // Extract JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Réponse IA invalide", raw: rawText.slice(0, 300) }, { status: 500 });
  }

  let parsed: { rounds: Record<string, unknown>[] };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "JSON invalide", raw: rawText.slice(0, 300) }, { status: 500 });
  }

  if (!parsed.rounds?.length) {
    return NextResponse.json({ error: "Aucune manche générée" }, { status: 500 });
  }

  type ParsedRound = {
    round_type: string;
    title: Record<string, string>;
    instructions: Record<string, string>;
    color_theme?: string;
    icon?: string;
    time_limit_sec?: number;
    points_per_q?: number;
    questions: unknown[];
  };

  if (isSingleRound && round_number) {
    // FIX 3: Upsert just the one round at the specified round_number (don't delete others)
    const r = (parsed.rounds as ParsedRound[])[0];
    const roundData = {
      contest_id: id,
      round_number,
      round_type: round_type || r.round_type,
      title: r.title,
      instructions: r.instructions,
      color_theme: ROUND_COLORS[round_type || r.round_type] || r.color_theme || "#1d4ed8",
      icon: ROUND_ICONS[round_type || r.round_type] || r.icon || "⚡",
      time_limit_sec: r.time_limit_sec || 150,
      points_per_q: r.points_per_q || 100,
      questions: r.questions,
    };

    const { error: upsertErr } = await db
      .from("contest_rounds")
      .upsert(roundData, { onConflict: "contest_id,round_number" });

    if (upsertErr) {
      return NextResponse.json({ error: "Erreur d'insertion", detail: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      rounds_created: 1,
      round_number,
      questions: (r.questions as unknown[]).length,
    });
  }

  // Full generation: insert all rounds
  const roundInserts = (parsed.rounds as ParsedRound[]).map((r, i) => ({
    contest_id: id,
    round_number: i + 1,
    round_type: r.round_type,
    title: r.title,
    instructions: r.instructions,
    color_theme: ROUND_COLORS[r.round_type] || r.color_theme || "#1d4ed8",
    icon: ROUND_ICONS[r.round_type] || r.icon || "⚡",
    time_limit_sec: r.time_limit_sec || 150,
    points_per_q: r.points_per_q || 100,
    questions: r.questions,
  }));

  const { error: insertErr } = await db.from("contest_rounds").insert(roundInserts);
  if (insertErr) {
    return NextResponse.json({ error: "Erreur d'insertion", detail: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    rounds_created: roundInserts.length,
    summary: roundInserts.map(r => ({
      round_number: r.round_number,
      type: r.round_type,
      questions: (r.questions as unknown[]).length,
    })),
  });
}
