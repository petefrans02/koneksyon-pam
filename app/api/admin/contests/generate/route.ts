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

export async function POST(request: NextRequest) {
  try { await requireAdmin(request); }
  catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }

  const body = await request.json();
  const {
    theme,
    difficulty = 2,
    lang = "fr",
    num_rounds = 5,
    scheduled_start_at,
    duration_minutes = 45,
  }: {
    theme: string;
    difficulty: 1 | 2 | 3;
    lang: "fr" | "ht" | "en";
    num_rounds: number;
    scheduled_start_at?: string;
    duration_minutes?: number;
  } = body;

  if (!theme) return NextResponse.json({ error: "theme is required" }, { status: 400 });

  const diffLabel =
    difficulty === 1 ? "Facile (débutant)" :
    difficulty === 2 ? "Moyen (confirmé)" : "Avancé (expert)";

  const userPrompt = `Génère un championnat biblique complet en JSON sur le thème : "${theme}"
Niveau de difficulté : ${diffLabel}
Langue principale : ${lang}
Nombre de manches : ${num_rounds}

Le JSON doit avoir cette structure EXACTE :
{
  "title": { "fr": "...", "ht": "...", "en": "..." },
  "description": { "fr": "...", "ht": "...", "en": "..." },
  "rounds": [
    {
      "round_type": "mcq",
      "title": { "fr": "Manche 1 — Questions à choix multiples", "ht": "...", "en": "..." },
      "instructions": { "fr": "Choisissez la bonne réponse parmi 4 options.", "ht": "...", "en": "..." },
      "color_theme": "#1d4ed8",
      "icon": "⚡",
      "time_limit_sec": 150,
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
          "ref": "Jean 3:16",
          "explanation": { "fr": "...", "ht": "...", "en": "..." }
        }
      ]
    }
  ]
}

Types de manches disponibles (choisis les plus adaptés au thème) :
- "mcq" : Questions à choix multiples (4 options). icon: ⚡, color: #1d4ed8. 5-7 questions.
- "tf" : Vrai ou Faux. icon: 🔮, color: #7c3aed. 6-10 questions. Structure question: { "statement":{fr,ht,en}, "is_true":bool, "ref":"...", "explanation":{fr,ht,en} }
- "fill" : Compléter le verset. icon: 📝, color: #0891b2. 4-6 questions. Structure: { "verse_with_blank":{fr,ht,en}, "choices":["mot1","mot2","mot3","mot4"], "correct":0, "ref":"...", "explanation":{fr,ht,en} }
- "match" : Associer les paires. icon: 🔗, color: #ea580c. 1 seule question avec 4 paires. Structure: { "pairs":[{"left":{fr,ht,en},"right":{fr,ht,en}},{"left":{fr,ht,en},"right":{fr,ht,en}},{"left":{fr,ht,en},"right":{fr,ht,en}},{"left":{fr,ht,en},"right":{fr,ht,en}}], "explanation":{fr,ht,en} }
- "order_verse" : Remettre un verset dans l'ordre. icon: 📖, color: #16a34a. 2-3 questions. Structure: { "parts":[{"id":"a","text":{fr,ht,en}},{"id":"b","text":{fr,ht,en}},{"id":"c","text":{fr,ht,en}},{"id":"d","text":{fr,ht,en}},{"id":"e","text":{fr,ht,en}}], "correct_order":["a","b","c","d","e"], "ref":"...", "explanation":{fr,ht,en} }
- "chrono" : Remettre des événements en ordre chronologique. icon: ⏳, color: #b45309. 1-2 questions avec 5 événements. Structure: { "events":[{"id":"a","text":{fr,ht,en},"correct_position":1},{"id":"b","text":{fr,ht,en},"correct_position":2},{"id":"c","text":{fr,ht,en},"correct_position":3},{"id":"d","text":{fr,ht,en},"correct_position":4},{"id":"e","text":{fr,ht,en},"correct_position":5}], "explanation":{fr,ht,en} }
- "character" : Identifier un personnage biblique. icon: 👤, color: #be185d. 4-5 questions MCQ avec description. Structure identique à mcq.
- "finale" : Questions finales très difficiles. icon: 🏆, color: #c5a84f. 5 questions MCQ niveau expert.

RÈGLES IMPORTANTES :
- La dernière manche DOIT être de type "finale" si num_rounds >= 4.
- Génère exactement ${num_rounds} manches.
- Toutes les questions doivent être variées et couvrir différents aspects du thème.
- Les color_theme et icon dans le JSON doivent correspondre aux valeurs données ci-dessus pour chaque type.
- Réponds UNIQUEMENT avec le JSON, rien d'autre.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let rawText = "";
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: `Tu es un théologien expert et game designer spécialisé dans les concours bibliques.
Tu crées des championnats bibliques pour KONEKSYON PAM, une plateforme chrétienne internationale.
Tu génères UNIQUEMENT du JSON valide, sans texte avant ou après.
Chaque question doit être bibliquement exacte avec référence précise (livre, chapitre, verset).`,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = message.content[0];
    rawText = block.type === "text" ? block.text.trim() : "";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Claude API error", detail: msg }, { status: 502 });
  }

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  let parsed: {
    title: Record<string, string>;
    description: Record<string, string>;
    rounds: Array<{
      round_type: string;
      title: Record<string, string>;
      instructions: Record<string, string>;
      color_theme: string;
      icon: string;
      time_limit_sec: number;
      points_per_q: number;
      questions: unknown[];
    }>;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Claude returned invalid JSON", raw: rawText.slice(0, 2000) },
      { status: 422 }
    );
  }

  const db = adminDb();

  // Insert contest
  const titleFr = parsed.title?.fr || theme;
  const { data: contest, error: contestErr } = await db
    .from("contests")
    .insert({
      title: titleFr,
      title_ht: parsed.title?.ht || null,
      title_en: parsed.title?.en || null,
      description: parsed.description?.fr || "",
      description_ht: parsed.description?.ht || null,
      description_en: parsed.description?.en || null,
      theme,
      status: "upcoming",
      scheduled_start_at: scheduled_start_at || null,
      duration_minutes: duration_minutes || 45,
      max_participants: 1000,
      current_question: 0,
      enabled: true,
    })
    .select("id")
    .single();

  if (contestErr || !contest) {
    return NextResponse.json({ error: "Failed to create contest", detail: contestErr?.message }, { status: 500 });
  }

  // Insert rounds
  const roundInserts = parsed.rounds.map((r, i) => ({
    contest_id: contest.id,
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

  const { error: roundsErr } = await db.from("contest_rounds").insert(roundInserts);
  if (roundsErr) {
    // Clean up the contest
    await db.from("contests").delete().eq("id", contest.id);
    return NextResponse.json({ error: "Failed to save rounds", detail: roundsErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    contest_id: contest.id,
    rounds_created: roundInserts.length,
    summary: roundInserts.map(r => ({ round_number: r.round_number, type: r.round_type, questions: (r.questions as unknown[]).length })),
  });
}
