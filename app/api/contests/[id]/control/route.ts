import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";
import Anthropic from "@anthropic-ai/sdk";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

const ROUND_COLORS: Record<string, string> = {
  mcq:"#1d4ed8", tf:"#7c3aed", fill:"#0891b2", match:"#ea580c",
  order_verse:"#16a34a", chrono:"#b45309", character:"#be185d",
  location:"#0f766e", book:"#7c2d12", finale:"#c5a84f",
};
const ROUND_ICONS: Record<string, string> = {
  mcq:"⚡", tf:"🔮", fill:"📝", match:"🔗",
  order_verse:"📖", chrono:"⏳", character:"👤",
  location:"🗺️", book:"📚", finale:"🏆",
};

// Generate rounds for a contest using Claude (one round at a time)
async function autoGenerateRounds(contestId: string, topic: string): Promise<boolean> {
  const ai = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const db = getDb();

  const SPECS = [
    { type: "mcq",       n: 5, label: "Manche 1 — QCM",           instruct: "Choisissez la bonne réponse parmi 4 options.", time: 150, pts: 100 },
    { type: "tf",        n: 6, label: "Manche 2 — Vrai ou Faux",  instruct: "Vrai ou Faux ?",                               time: 120, pts: 80  },
    { type: "fill",      n: 4, label: "Manche 3 — Compléter",     instruct: "Choisissez le mot manquant.",                  time: 120, pts: 120 },
    { type: "character", n: 4, label: "Manche 4 — Personnage",    instruct: "Identifiez le personnage biblique.",           time: 150, pts: 120 },
    { type: "mcq",       n: 5, label: "Manche 5 — QCM Avancé",   instruct: "Questions bibliques avancées.",                time: 140, pts: 120 },
    { type: "tf",        n: 6, label: "Manche 6 — V/F Avancé",   instruct: "Vrai ou Faux — niveau avancé.",               time: 110, pts: 100 },
    { type: "fill",      n: 4, label: "Manche 7 — Versets II",    instruct: "Complétez ce verset biblique.",               time: 120, pts: 130 },
    { type: "character", n: 4, label: "Manche 8 — Personnages II",instruct: "Qui est ce personnage biblique ?",            time: 150, pts: 130 },
    { type: "mcq",       n: 6, label: "Manche 9 — QCM Expert",   instruct: "Questions expertes à choix multiples.",       time: 130, pts: 140 },
    { type: "tf",        n: 6, label: "Manche 10 — V/F Expert",  instruct: "Vrai ou Faux — niveau expert.",               time: 100, pts: 110 },
    { type: "fill",      n: 5, label: "Manche 11 — Versets III",  instruct: "Quel mot complète ce verset ?",              time: 120, pts: 140 },
    { type: "character", n: 4, label: "Manche 12 — Figures III",  instruct: "Reconnaissez ce personnage biblique.",       time: 140, pts: 150 },
    { type: "mcq",       n: 6, label: "Manche 13 — Maître",      instruct: "QCM niveau maître — difficile.",             time: 120, pts: 160 },
    { type: "tf",        n: 8, label: "Manche 14 — V/F Maître",  instruct: "Dernière épreuve avant la finale.",          time: 100, pts: 130 },
    { type: "finale",    n: 5, label: "Manche 15 — GRANDE FINALE",instruct: "Questions expertes — niveau finale.",        time: 200, pts: 300 },
  ];

  const SCHEMAS: Record<string, string> = {
    mcq: `[{"q":{"fr":"...","ht":"...","en":"..."},"options":[{"fr":"A","ht":"A","en":"A"},{"fr":"B","ht":"B","en":"B"},{"fr":"C","ht":"C","en":"C"},{"fr":"D","ht":"D","en":"D"}],"correct":0,"ref":"Jean 3:16","explanation":{"fr":"...","ht":"...","en":"..."}}]`,
    tf: `[{"statement":{"fr":"...","ht":"...","en":"..."},"is_true":true,"ref":"Genèse 1:1","explanation":{"fr":"...","ht":"...","en":"..."}}]`,
    fill: `[{"verse_with_blank":{"fr":"Car Dieu a tant ___ le monde","ht":"...","en":"..."},"options":[{"fr":"aimé","ht":"renmen","en":"loved"},{"fr":"créé","ht":"kreye","en":"created"},{"fr":"béni","ht":"beni","en":"blessed"},{"fr":"sauvé","ht":"sove","en":"saved"}],"correct":0,"ref":"Jean 3:16"}]`,
    character: `[{"clues":[{"fr":"Indice 1","ht":"...","en":"..."},{"fr":"Indice 2","ht":"...","en":"..."},{"fr":"Indice 3","ht":"...","en":"..."}],"options":[{"fr":"Nom A","ht":"...","en":"..."},{"fr":"Nom B","ht":"...","en":"..."},{"fr":"Nom C","ht":"...","en":"..."},{"fr":"Nom D","ht":"...","en":"..."}],"correct":0,"answer":{"fr":"Nom du personnage","ht":"...","en":"..."},"ref":"Livre X:Y"}]`,
    finale: `[{"q":{"fr":"...","ht":"...","en":"..."},"options":[{"fr":"A","ht":"A","en":"A"},{"fr":"B","ht":"B","en":"B"},{"fr":"C","ht":"C","en":"C"},{"fr":"D","ht":"D","en":"D"}],"correct":0,"ref":"Réf","explanation":{"fr":"Explication détaillée","ht":"...","en":"..."}}]`,
  };

  const rounds = [];

  for (let i = 0; i < SPECS.length; i++) {
    const spec = SPECS[i];
    const schema = SCHEMAS[spec.type] || SCHEMAS.mcq;

    try {
      const msg = await ai.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [{ role: "user", content:
          `Génère EXACTEMENT ${spec.n} questions bibliques sur "${topic}" pour une manche "${spec.type}".
Retourne UNIQUEMENT ce tableau JSON (sans texte avant/après) :
${schema}
Remplace tous les "..." par de vraies valeurs. ${spec.n} questions exactement. JSON valide uniquement.` }],
      });

      const block = msg.content[0];
      const raw = (block.type === "text" ? block.text : "").trim();
      const m = raw.match(/\[[\s\S]*\]/);
      if (!m) continue;

      const questions = JSON.parse(m[0]);
      if (!Array.isArray(questions) || questions.length === 0) continue;

      rounds.push({
        contest_id: contestId,
        round_number: i + 1,
        round_type: spec.type,
        title: { fr: `Manche ${i+1} — ${spec.label}`, ht: `Mach ${i+1} — ${spec.label}`, en: `Round ${i+1} — ${spec.label}` },
        instructions: { fr: spec.instruct, ht: spec.instruct, en: spec.instruct },
        color_theme: ROUND_COLORS[spec.type],
        icon: ROUND_ICONS[spec.type],
        time_limit_sec: spec.time,
        points_per_q: spec.pts,
        questions,
      });
    } catch { /* skip round on error */ }
  }

  if (rounds.length === 0) return false;

  await db.from("contest_rounds").delete().eq("contest_id", contestId);
  const { error } = await db.from("contest_rounds").insert(rounds);
  return !error;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { action } = await request.json();
  const db = getDb();

  const { data: contest } = await db
    .from("contests")
    .select("status, current_question, created_by, title, theme")
    .eq("id", id)
    .single();

  if (!contest) return Response.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin(user) && contest.created_by !== user.id) return Response.json({ error: "Not organizer" }, { status: 403 });

  // ── Start contest ──────────────────────────────────────────────────────────
  if (action === "next_status" && contest.status === "upcoming") {
    // Auto-generate rounds if none exist
    const { count: roundCount } = await db
      .from("contest_rounds")
      .select("id", { count: "exact", head: true })
      .eq("contest_id", id);

    if (!roundCount || roundCount === 0) {
      const topic = contest.theme || contest.title;
      const generated = await autoGenerateRounds(id, topic);
      if (!generated) {
        return Response.json({ error: "Impossible de générer les manches automatiquement. Réessayez." }, { status: 500 });
      }
    }

    await db.from("contests").update({
      status: "active",
      started_at: new Date().toISOString(),
    }).eq("id", id);

    return Response.json({ ok: true, status: "active" });
  }

  // ── End contest ────────────────────────────────────────────────────────────
  if (action === "next_status" && contest.status === "active") {
    await db.from("contests").update({
      status: "completed",
      ended_at: new Date().toISOString(),
    }).eq("id", id);

    return Response.json({ ok: true, status: "completed" });
  }

  // ── Unknown status transition ──────────────────────────────────────────────
  if (action === "next_status") {
    return Response.json({ error: "Cannot advance status from " + contest.status }, { status: 400 });
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  if (action === "reset") {
    await db.from("contest_sessions").delete().eq("contest_id", id);
    await db.from("contest_leaderboard").delete().eq("contest_id", id);
    await db.from("contest_participants").delete().eq("contest_id", id);
    await db.from("notification_logs").delete().eq("contest_id", id);
    await db.from("contests").update({
      status: "upcoming",
      current_question: 0,
      started_at: null,
      ended_at: null,
    }).eq("id", id);
    return Response.json({ ok: true, status: "upcoming" });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
