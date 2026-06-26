import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();

  const [contestsRes, prayersRes, votesRes] = await Promise.all([
    db.from("contest_participants").select("id, score, contest_id, answers, contests(title, status)").eq("user_id", user.id),
    db.from("prayer_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    db.from("contest_votes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const participations = contestsRes.data || [];
  const totalScore = participations.reduce((s, p) => s + (p.score || 0), 0);
  const totalCorrect = participations.reduce((s, p) => {
    const answers = (p.answers || []) as { correct: boolean }[];
    return s + answers.filter(a => a.correct).length;
  }, 0);
  const totalAnswers = participations.reduce((s, p) => s + ((p.answers || []) as unknown[]).length, 0);
  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  // Compute XP: 10 per correct, 5 per prayer, 2 per vote, 50 per contest completed
  const xp = totalCorrect * 10 + (prayersRes.count || 0) * 5 + (votesRes.count || 0) * 2 + participations.length * 50;

  // Levels
  const levels = [
    { name: "Disciple",          min: 0,    icon: "🌱" },
    { name: "Serviteur",         min: 200,  icon: "🌿" },
    { name: "Évangéliste",       min: 500,  icon: "📢" },
    { name: "Missionnaire",      min: 1000, icon: "🌍" },
    { name: "Ancien",            min: 2000, icon: "🕊️" },
    { name: "Pasteur",           min: 3500, icon: "📖" },
    { name: "Docteur de la Parole", min: 5000, icon: "🎓" },
    { name: "Champion KP",       min: 7500, icon: "🏆" },
    { name: "Maître Biblique",   min: 10000, icon: "👑" },
    { name: "Légende Biblique",  min: 15000, icon: "⭐" },
  ];

  let levelIdx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].min) { levelIdx = i; break; }
  }
  const currentLevel = levels[Math.max(0, levelIdx)];
  const nextLevel = levels[levelIdx + 1] || null;
  const xpToNext = nextLevel ? nextLevel.min - xp : 0;
  const xpProgress = nextLevel ? Math.round(((xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100) : 100;

  // Badges
  const badges: { icon: string; name: string; earned: boolean }[] = [
    { icon: "🥉", name: "Bronze",          earned: xp >= 200 },
    { icon: "🥈", name: "Argent",          earned: xp >= 500 },
    { icon: "🥇", name: "Or",              earned: xp >= 1000 },
    { icon: "💎", name: "Diamant",         earned: xp >= 2000 },
    { icon: "🔥", name: "Champion",        earned: participations.length >= 3 },
    { icon: "📖", name: "Théologien",      earned: totalCorrect >= 50 },
    { icon: "🕊",  name: "Disciple Fidèle", earned: (prayersRes.count || 0) >= 5 },
    { icon: "❤️", name: "Soutien du Public", earned: (votesRes.count || 0) >= 10 },
  ];

  const liveContests = participations
    .filter(p => {
      const c = p.contests as unknown as { title: string; status: string } | null;
      return c?.status === "active" || c?.status === "upcoming";
    })
    .map(p => {
      const c = p.contests as unknown as { title: string; status: string };
      return { id: p.contest_id, title: c?.title, status: c?.status, score: p.score };
    });

  return Response.json({
    xp, currentLevel, nextLevel, xpToNext, xpProgress,
    stats: {
      contests: participations.length,
      totalScore,
      accuracy,
      prayers: prayersRes.count || 0,
      votes: votesRes.count || 0,
      correctAnswers: totalCorrect,
    },
    badges,
    liveContests,
    name: user.user_metadata?.full_name || user.email,
    avatar: user.user_metadata?.avatar_url || null,
  });
}
