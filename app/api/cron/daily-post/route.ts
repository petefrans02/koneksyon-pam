// Runs daily at 8:00 AM UTC — posts verse of the day to all Facebook pages
import { NextRequest, NextResponse } from "next/server";
import { postToFacebook } from "@/lib/social-post";
import { adminDb } from "@/lib/admin-auth";

const VERSES = [
  { ref: "Jérémie 29:11",   fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè, pa dezas, pou ba nou yon avni ak espwa.", en: "For I know the plans I have for you — plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Philippiens 4:13", fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me." },
  { ref: "Ésaïe 41:10",     fr: "Ne crains rien, car je suis avec toi. Ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou. Pa dekouraje, paske mwen se Bondye ou.", en: "Do not fear, for I am with you. Do not be dismayed, for I am your God." },
  { ref: "Psaumes 23:1",    fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Senyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing." },
  { ref: "Romains 8:28",    fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him." },
  { ref: "2 Timothée 1:7",  fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin.", en: "God has not given us a spirit of fear, but of power, love and sound mind." },
  { ref: "Jean 14:6",       fr: "Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ht: "Mwen se chemen an, verite a, ak lavi a. Pesonn pa ka al jwenn Papa a si se pa pase nan mwen.", en: "I am the way and the truth and the life. No one comes to the Father except through me." },
  { ref: "Jean 3:16",       fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.", ht: "Paske Bondye sitèlman renmen lèzòm, li bay Pitit li a.", en: "For God so loved the world that he gave his one and only Son." },
  { ref: "Psaumes 46:1",    fr: "Dieu est notre refuge et notre force, un secours toujours présent dans la détresse.", ht: "Bondye se refij nou ak fòs nou, yon sekou ki toujou la nan tray.", en: "God is our refuge and strength, an ever-present help in trouble." },
  { ref: "Ésaïe 40:31",    fr: "Ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.", ht: "Moun ki mete konfyans nan Senyè a ap jwenn fòs nèf. Yo pral vole tankou malfini.", en: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles." },
  { ref: "Matthieu 11:28",  fr: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", ht: "Vin jwenn mwen, nou tout ki fatige epi ki koube anba chaj, epi mwen pral ban nou repo.", en: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { ref: "Psaumes 121:1-2", fr: "Je lève mes yeux vers les montagnes. D'où me viendra le secours ? Le secours me vient de l'Éternel.", ht: "Mwen leve je m gade mòn yo. Kote sekou m ap soti ? Sekou mwen soti nan Senyè a.", en: "I lift up my eyes to the hills. Where does my help come from? My help comes from the Lord." },
  { ref: "Proverbes 3:5-6", fr: "Confie-toi en l'Éternel de tout ton cœur et ne t'appuie pas sur ta sagesse.", ht: "Mete tout konfyans ou nan Senyè a, pa konte sou konprennesyon pa ou.", en: "Trust in the Lord with all your heart and lean not on your own understanding." },
  { ref: "Psaumes 91:1",    fr: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.", ht: "Moun ki rete anba pwoteksyon Bondye ap repoze anba lonbraj Bondye Toupisan.", en: "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty." },
];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koneksyonpam.com";
  const now  = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const verse = VERSES[dayOfYear % VERSES.length];

  const message =
`✨ Verset du jour — ${verse.ref}

📖 "${verse.fr}"

🕊️ "${verse.ht}"

💫 "${verse.en}"

👉 Retrouvez le verset du jour et tous nos contenus spirituels sur KONEKSYON PAM !
${base}/aujourd-hui

#KoneksyonPAM #VersetDuJour #Bible #Parole #Évangile #Foi #Prière`;

  let result;
  try {
    result = await postToFacebook(message, `${base}/aujourd-hui`);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }

  const db = adminDb();

  // Log verse post
  try {
    await db.from("social_post_logs").insert(
      result.results.map(r => ({
        platform: "facebook",
        page_name: r.page_name,
        status: r.success ? "success" : "error",
        post_id: r.post_id ?? null,
        error_message: r.error ?? null,
        content_type: "daily_verse",
        content_preview: verse.fr.slice(0, 120),
      }))
    );
  } catch {}

  // ── Post du championnat actif ou à venir ───────────────────────────────────
  let contestResult = null;
  try {
    const { data: contest } = await db
      .from("contests")
      .select("id, title, title_ht, title_en, description, scheduled_start_at, start_at, status, max_participants, week_number, season_number")
      .in("status", ["active", "upcoming"])
      .eq("enabled", true)
      .eq("is_private", false)
      .order("scheduled_start_at", { ascending: true })
      .limit(1)
      .single();

    if (contest) {
      const startDate = contest.scheduled_start_at ?? contest.start_at;
      const dateStr = startDate
        ? new Date(startDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" })
        : null;

      const weekLabel = contest.week_number ? `Semaine ${contest.week_number}` : "";
      const seasonLabel = contest.season_number ? ` — Saison ${contest.season_number}` : "";
      const statusLabel = contest.status === "active" ? "🔴 EN COURS" : "🔔 À VENIR";

      const contestMessage =
`🏆 CHAMPIONNAT BIBLIQUE ${statusLabel}

📖 "${contest.title}"
${contest.title_ht ? `\n🕊️ "${contest.title_ht}"` : ""}
${weekLabel}${seasonLabel}
${dateStr ? `\n📅 ${dateStr} (heure de Miami)` : ""}
${contest.max_participants ? `\n👥 Max ${contest.max_participants} participants` : ""}

✨ Testez vos connaissances de la Bible et gagnez votre place au classement mondial !

👉 Inscrivez-vous maintenant :
${base}/championnats

#KoneksyonPAM #ChampionnatBiblique #Bible #Quiz #Concours #Foi #Évangile`;

      const contestLink = `${base}/championnats`;
      contestResult = await postToFacebook(contestMessage, contestLink);

      // Log contest post
      await db.from("social_post_logs").insert(
        contestResult.results.map(r => ({
          platform: "facebook",
          page_name: r.page_name,
          status: r.success ? "success" : "error",
          post_id: r.post_id ?? null,
          error_message: r.error ?? null,
          content_type: "contest_promo",
          content_preview: contest.title.slice(0, 120),
        }))
      );
    }
  } catch {}

  return NextResponse.json({
    ok: result.any_success,
    verse: verse.ref,
    verse_results: result.results,
    contest_posted: !!contestResult,
    contest_results: contestResult?.results ?? null,
    timestamp: now.toISOString(),
  });
}
