"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";
import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { groups } from "@/lib/groups-data";
import { debates } from "@/lib/debates-data";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AdBanner from "@/app/components/AdBanner";
import Icon, { IconName } from "@/app/components/Icon";

const TOTAL_MEMBERS = 24563;

type Lang = "fr" | "ht" | "en" | "es";

const COMMUNITY_QUOTES = [
  {
    text: {
      fr: "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux.",
      ht: "Paske kote de oswa twa moun reyini nan non mwen, mwen la nan mitan yo.",
      en: "For where two or three gather in my name, there am I with them.",
      es: "Porque donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.",
    },
    ref: "Matthieu 18:20",
    icon: "croix",
  },
  {
    text: {
      fr: "Supportez-vous les uns les autres, et pardonnez-vous réciproquement si l'un a sujet de se plaindre de l'autre.",
      ht: "Pote chaj youn lòt, padone youn lòt si youn gen rezon plenn sou lòt.",
      en: "Bear with each other and forgive one another if any of you has a grievance against someone.",
      es: "Sopórtense mutuamente y perdónense unos a otros si alguno tiene queja contra el otro.",
    },
    ref: "Colossiens 3:13",
    icon: "poignee_main",
  },
  {
    text: {
      fr: "Ils étaient assidus à l'enseignement des apôtres, à la communion fraternelle, à la fraction du pain.",
      ht: "Yo te fidèl nan ansèyman apòt yo, nan kominyon, nan kase pen.",
      en: "They devoted themselves to the apostles' teaching, to fellowship, to the breaking of bread.",
      es: "Se dedicaban a la enseñanza de los apóstoles, a la comunión fraterna, al partimiento del pan.",
    },
    ref: "Actes 2:42",
    icon: "colombe",
  },
  {
    text: {
      fr: "Voici ce qui est bon et agréable : que des frères demeurent ensemble.",
      ht: "Se yon bèl bagay, se yon bagay ki agreyab, pou frè yo viv ansanm.",
      en: "How good and pleasant it is when God's people live together in unity.",
      es: "¡Cuán bueno y cuán agradable es que los hermanos convivan en armonía!",
    },
    ref: "Psaumes 133:1",
    icon: "monde",
  },
];

const STATS: { icon: IconName; key: string; value: string | null; label: Record<Lang, string> }[] = [
  { icon: "groupe", key: "groups",  value: null,     label: { fr: "Groupes actifs", ht: "Gwoup aktif", en: "Active groups", es: "Grupos activos" } },
  { icon: "utilisateurs", key: "members", value: "24.5K+", label: { fr: "Membres",         ht: "Manm",        en: "Members",       es: "Miembros"       } },
  { icon: "message", key: "debates", value: "48",      label: { fr: "Débats ouverts",  ht: "Deba ouvè",   en: "Open debates",  es: "Debates"        } },
  { icon: "monde", key: "nations", value: "12+",     label: { fr: "Nations",          ht: "Nasyon",      en: "Nations",       es: "Naciones"       } },
];

interface Reply { id: string; author_name: string; text: string; likes: number; created_at: string; }

export default function CommunautePage() {
  const { lang } = useLang();
  const [search, setSearch]       = useState("");
  const [quoteIdx, setQuoteIdx]   = useState(0);
  const [quoteVis, setQuoteVis]   = useState(true);
  const [openDebate, setOpenDebate] = useState<string | null>(debates[0].id);
  const [aiDiscussions, setAiDiscussions] = useState<typeof debates>([]);
  const [discTotal, setDiscTotal] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState<string | null>(null);

  // Utilisateur connecté (pour publier une réponse).
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user as { id: string; email?: string; user_metadata?: { full_name?: string } } | null;
      if (u) setUser({ id: u.id, name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Membre" });
    }).catch(() => {});
  }, []);

  // Charge les réponses des membres quand un débat s'ouvre.
  useEffect(() => {
    const id = openDebate;
    if (!id || replies[id]) return;
    supabase.from("discussion_replies")
      .select("id,author_name,text,likes,created_at")
      .eq("discussion_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setReplies((r) => ({ ...r, [id]: data as Reply[] })); });
  }, [openDebate, replies]);

  async function postReply(id: string) {
    const text = (drafts[id] || "").trim();
    if (!text || !user || posting) return;
    setPosting(id);
    const optimistic: Reply = { id: `tmp-${id}-${text.length}-${(replies[id]?.length ?? 0)}`, author_name: user.name, text, likes: 0, created_at: "" };
    setReplies((r) => ({ ...r, [id]: [...(r[id] || []), optimistic] }));
    setDrafts((d) => ({ ...d, [id]: "" }));
    const { data, error } = await supabase.from("discussion_replies")
      .insert({ discussion_id: id, author_name: user.name, author_id: user.id, text })
      .select("id,author_name,text,likes,created_at").single();
    setPosting(null);
    if (!error && data) {
      setReplies((r) => ({ ...r, [id]: (r[id] || []).map((x) => (x.id === optimistic.id ? (data as Reply) : x)) }));
    }
  }

  useEffect(() => {
    let alive = true;
    fetch("/api/discussions?limit=15")
      .then((r) => r.json())
      .then((d: { discussions?: { id: string; topic: Record<string,string>; category: Record<string,string>; accent: string; icon: string; messages: typeof debates[number]["messages"]; participants?: number }[]; total?: number }) => {
        if (!alive) return;
        if (Array.isArray(d.discussions) && d.discussions.length) {
          setAiDiscussions(d.discussions.map((x) => ({
            id: x.id, icon: x.icon as typeof debates[number]["icon"], accent: x.accent,
            category: x.category as typeof debates[number]["category"],
            question: x.topic as typeof debates[number]["question"],
            messages: x.messages,
          })));
        }
        if (typeof d.total === "number") setDiscTotal(d.total);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const allDebates = [...aiDiscussions, ...debates];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextQuote = useCallback(() => {
    setQuoteVis(false);
    setTimeout(() => { setQuoteIdx(i => (i + 1) % COMMUNITY_QUOTES.length); setQuoteVis(true); }, 300);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextQuote, 6000);
  }, [nextQuote]);

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [resetTimer]);

  const filtered = groups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (g.title[lang] || g.title.fr).toLowerCase().includes(q) ||
      (g.description[lang] || g.description.fr).toLowerCase().includes(q)
    );
  });

  const q = COMMUNITY_QUOTES[quoteIdx];

  return (
    <RequireAuth>
      <style>{`
        @keyframes comm-aurora {
          0%,100% { opacity:.55; transform:scale(1) translateY(0); }
          50%      { opacity:.82; transform:scale(1.07) translateY(-14px); }
        }
        @keyframes comm-orb-a {
          0%,100% { transform:translate(0,0); }
          40%      { transform:translate(20px,-24px); }
          70%      { transform:translate(-14px,16px); }
        }
        @keyframes comm-orb-b {
          0%,100% { transform:translate(0,0); }
          35%      { transform:translate(-22px,18px); }
          68%      { transform:translate(16px,-12px); }
        }
        @keyframes comm-ring {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes comm-ring2 {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes comm-up {
          from { opacity:0; transform:translateY(22px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes comm-badge {
          from { opacity:0; transform:scale(.82) translateY(-8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes comm-card-in {
          from { opacity:0; transform:translateY(28px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes comm-shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes comm-stat-in {
          from { opacity:0; transform:scale(.88) translateY(14px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes comm-icon-float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-9px); }
        }
        @keyframes comm-dot-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(0,170,200,0); }
          50%      { box-shadow:0 0 0 5px rgba(0,170,200,0.20); }
        }
        .comm-card-reveal { animation: comm-card-in .65s cubic-bezier(.16,1,.3,1) both; }
        .comm-stat-reveal { animation: comm-stat-in .6s cubic-bezier(.16,1,.3,1) both; }
        .comm-group-card {
          display:block; text-decoration:none; color:inherit;
          background:#ffffff;
          border:1px solid #e8e4de;
          border-radius:20px; overflow:hidden; position:relative;
          transition: transform .38s cubic-bezier(.34,1.56,.64,1),
                      box-shadow .3s ease, border-top .2s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .comm-group-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 40px rgba(45,106,79,0.12);
          border-top: 3px solid #2d6a4f !important;
        }
        .comm-eglise-card {
          display:block; text-decoration:none; color:inherit;
          border-radius:24px; overflow:hidden; position:relative;
          transition: transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease;
        }
        .comm-eglise-card:hover { transform:translateY(-5px); box-shadow:0 18px 52px rgba(96,165,250,0.16); }
        .comm-search:focus {
          outline:none;
          border-color:rgba(0,170,200,0.50) !important;
          box-shadow:0 0 0 4px rgba(0,170,200,0.12);
        }
        .comm-live-dot { animation: comm-dot-pulse 2s ease-in-out infinite; }
      `}</style>

      <main
        className="animate-page-awaken"
        style={{
          background:"#ffffff",
          minHeight:"100vh", color:"#1c1c2e",
        }}
      >
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <div style={{
          position:"relative", overflow:"hidden",
          background:"linear-gradient(135deg, #1a3568 0%, #0d2a0d 50%, #0d1d3d 100%)",
          color:"#fff",
        }}>
          <HeroBackdrop image="/hero/communaute.jpg" tint="dark" />
          {/* Depth orbs */}
          <div style={{
            position:"absolute", top:"10%", left:"5%",
            width:250, height:250, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(45,106,79,0.30) 0%, transparent 70%)",
            filter:"blur(50px)", pointerEvents:"none",
          }} />
          <div style={{
            position:"absolute", top:"18%", right:"4%",
            width:200, height:200, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(0,170,200,0.18) 0%, transparent 70%)",
            filter:"blur(40px)", pointerEvents:"none",
          }} />
          {/* Anneaux */}
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            width:520, height:520,
            border:"1px solid rgba(45,106,79,0.10)", borderRadius:"50%",
            animation:"comm-ring 45s linear infinite", pointerEvents:"none",
          }} />
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            width:340, height:340,
            border:"1px solid rgba(0,170,200,0.07)", borderRadius:"50%",
            animation:"comm-ring2 30s linear infinite", pointerEvents:"none",
          }} />

          {/* Contenu */}
          <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-14 text-center" style={{ position:"relative", zIndex:10 }}>
            {/* Badge live */}
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"rgba(0,170,200,0.10)", border:"1px solid rgba(0,170,200,0.25)",
              color:"#00aac8", fontSize:10, fontWeight:900,
              padding:"6px 18px", borderRadius:999, marginBottom:24,
              letterSpacing:"0.22em",
              animation:"comm-badge .9s cubic-bezier(.16,1,.3,1) both",
            }}>
              <span className="comm-live-dot" style={{
                width:6, height:6, borderRadius:"50%",
                background:"#00aac8", boxShadow:"0 0 8px #00aac8", display:"inline-block",
              }} />
              <Icon name="monde" size={13} /> {TOTAL_MEMBERS.toLocaleString()} {lang==="fr"?"membres dans 12 pays":lang==="ht"?"manm nan 12 peyi":lang==="es"?"miembros en 12 países":"members in 12 countries"}
            </div>

            {/* Titre */}
            <h1 style={{
              fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900, lineHeight:1.08, marginBottom:16,
              background:"linear-gradient(135deg,#fff 0%,#67e8f9 50%,#00aac8 100%)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              animation:"comm-up .9s cubic-bezier(.16,1,.3,1) .2s both, comm-shimmer 7s linear infinite",
            }}>
              {lang==="fr"?"Communauté Mondiale":lang==="ht"?"Kominote Mondyal":lang==="es"?"Comunidad Mundial":"World Community"}
            </h1>

            {/* Sous-titre */}
            <p style={{
              color:"rgba(255,255,255,0.48)", maxWidth:520, margin:"0 auto 28px",
              lineHeight:1.7, fontSize:"0.96rem",
              animation:"comm-up .9s cubic-bezier(.16,1,.3,1) .4s both",
            }}>
              {lang==="fr"
                ?"Prière, témoignages, théologie, famille, louange — une communauté évangélique mondiale pour grandir dans la foi et l'amour de Dieu"
                :lang==="ht"
                ?"Lapriyè, temwayaj, teyoloji, fanmi, lwanj — yon kominote evanjelik mondyal pou grandi nan lafwa ak lanmou Bondye"
                :lang==="es"
                ?"Oración, testimonios, teología, familia, alabanza — una comunidad evangélica mundial para crecer en la fe y el amor de Dios"
                :"Prayer, testimonies, theology, family, worship — a global evangelical community to grow in faith and the love of God"}
            </p>

            {/* Icônes flottantes */}
            <div style={{
              display:"flex", justifyContent:"center", gap:26, marginBottom:30,
              animation:"comm-up .9s cubic-bezier(.16,1,.3,1) .55s both",
            }}>
              {(["poignee_main","monde","croix","priere","message"] as IconName[]).map((icon,i) => (
                <span key={icon} style={{
                  display:"inline-flex",
                  animation:`comm-icon-float ${3.2+i*0.4}s ease-in-out infinite`,
                  animationDelay:`${i*0.18}s`,
                  filter:"drop-shadow(0 0 9px rgba(0,170,200,0.32))",
                }}><Icon name={icon} size={24} /></span>
              ))}
            </div>

            {/* Barre de recherche */}
            <div style={{ maxWidth:460, margin:"0 auto", position:"relative", animation:"comm-up .9s cubic-bezier(.16,1,.3,1) .7s both" }}>
              <span style={{ position:"absolute", left:20, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.6)", pointerEvents:"none" }}>
                <Icon name="recherche" size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang==="fr"?"Rechercher un groupe ou un sujet…":lang==="ht"?"Chèche yon gwoup…":lang==="es"?"Buscar un grupo…":"Search a group…"}
                className="comm-search"
                style={{
                  background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)",
                  color:"#fff", borderRadius:999, padding:"13px 22px 13px 48px",
                  fontSize:"0.88rem", width:"100%", boxSizing:"border-box" as const,
                  transition:"border-color .25s, box-shadow .25s",
                }}
              />
            </div>
          </div>
        </div>

        {/* ══ STATS ═════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map((s, i) => (
              <div key={s.key} className="comm-stat-reveal" style={{
                animationDelay:`${i*0.08}s`,
                background:"#ffffff", border:"1px solid #e8e4de",
                borderTop:"3px solid #2d6a4f",
                borderRadius:16, padding:"18px 12px", textAlign:"center",
                boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <span style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><Icon name={s.icon} size={26} color="#2d6a4f" /></span>
                <p style={{ fontSize:"1.25rem", fontWeight:900, color:"#2d6a4f" }}>
                  {s.key==="groups" ? groups.length.toString()
                    : s.key==="debates" && discTotal != null && discTotal > 0 ? discTotal.toLocaleString()
                    : s.value}
                </p>
                <p style={{ fontSize:"0.7rem", color:"#4a6080", marginTop:3 }}>
                  {s.label[lang as Lang]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CITATION CAROUSEL ═════════════════════════════════════════ */}
        <div className="max-w-3xl mx-auto px-5 sm:px-8 mb-12">
          <div style={{
            background:"#ffffff",
            border:"1px solid #e8e4de", borderLeft:"4px solid #2d6a4f",
            borderRadius:20, padding:"30px 34px", textAlign:"center", position:"relative",
            overflow:"hidden", minHeight:170,
            boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              opacity:quoteVis?1:0, transform:quoteVis?"translateY(0)":"translateY(10px)",
              transition:"opacity .3s, transform .3s",
            }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><Icon name={q.icon as IconName} size={28} color="#2d6a4f" /></div>
              <p style={{ fontSize:"1rem", color:"#1a3568", fontStyle:"italic", lineHeight:1.68, marginBottom:10,
                fontFamily:"'Playfair Display',Georgia,serif" }}>
                &ldquo;{q.text[lang as Lang]}&rdquo;
              </p>
              <p style={{ fontSize:"0.74rem", color:"#2d6a4f", fontWeight:700, letterSpacing:"0.10em" }}>
                — {q.ref}
              </p>
            </div>
            {/* dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
              {COMMUNITY_QUOTES.map((_,i) => (
                <button key={i} onClick={() => {
                  setQuoteVis(false);
                  setTimeout(()=>{ setQuoteIdx(i); setQuoteVis(true); }, 280);
                  resetTimer();
                }} style={{
                  width:i===quoteIdx?24:7, height:7, borderRadius:999,
                  background:i===quoteIdx?"#2d6a4f":"#e8e4de",
                  border:"none", cursor:"pointer",
                  transition:"width .3s, background .3s",
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* ══ DÉBATS & DISCUSSIONS ══════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-14">
          <div style={{ textAlign:"center", marginBottom:26 }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#2d6a4f", marginBottom:10, textTransform:"uppercase" }}>
              <Icon name="message" size={13} /> {lang==="fr"?"ÉCHANGES FRATERNELS":lang==="ht"?"ECHANJ FRATÈNÈL":lang==="es"?"INTERCAMBIOS FRATERNOS":"FRATERNAL EXCHANGES"}
            </p>
            <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, margin:"8px auto 14px" }} />
            <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:8 }}>
              {lang==="fr"?"Débats & Discussions":lang==="ht"?"Deba & Diskisyon":lang==="es"?"Debates & Discusiones":"Debates & Discussions"}
            </h2>
            <p style={{ color:"#4a6080", fontSize:"0.9rem", maxWidth:560, margin:"0 auto" }}>
              {lang==="fr"?"Des sujets bibliques abordés avec respect et fraternité. De nouvelles discussions apparaissent chaque jour."
               :lang==="ht"?"Sijè biblik abòde ak respè ak fratènite. Nouvo diskisyon parèt chak jou."
               :lang==="es"?"Temas bíblicos tratados con respeto y fraternidad. Nuevas discusiones aparecen cada día."
               :"Biblical topics discussed with respect and fraternity. New discussions appear every day."}
            </p>
            {discTotal != null && discTotal > 0 && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginTop:14, background:"rgba(22,163,74,0.08)", border:"1px solid rgba(22,163,74,0.22)", color:"#16a34a", fontSize:12, fontWeight:800, padding:"7px 16px", borderRadius:999 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 8px #16a34a" }} />
                {discTotal.toLocaleString()} {lang==="fr"?"discussions ouvertes":lang==="ht"?"diskisyon ouvè":lang==="es"?"discusiones abiertas":"open discussions"}
              </div>
            )}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {allDebates.map((d) => {
              const open = openDebate === d.id;
              const shown = open ? d.messages : d.messages.slice(0, 2);
              const participants = new Set(d.messages.map((m) => m.author)).size;
              return (
                <div key={d.id} style={{ background:"#fff", border:"1px solid #e8e4de", borderRadius:20, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                  {/* Sujet */}
                  <button onClick={() => setOpenDebate(open ? null : d.id)}
                    style={{ width:"100%", textAlign:"left", background:"none", border:"none", cursor:"pointer", padding:"18px 20px", display:"flex", alignItems:"flex-start", gap:14, borderBottom:open?"1px solid #f0ede8":"none" }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`${d.accent}14`, border:`1px solid ${d.accent}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon name={d.icon} size={22} color={d.accent} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span style={{ display:"inline-block", fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.10em", textTransform:"uppercase", color:d.accent, background:`${d.accent}12`, border:`1px solid ${d.accent}2a`, padding:"2px 8px", borderRadius:999, marginBottom:6 }}>
                        {d.category[lang as Lang]}
                      </span>
                      <h3 style={{ fontWeight:800, fontSize:"0.98rem", color:"#1a3568", lineHeight:1.4, fontFamily:"'Playfair Display',Georgia,serif" }}>
                        {d.question[lang as Lang]}
                      </h3>
                      <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:8, fontSize:"0.72rem", color:"#9ca3af" }}>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Icon name="message" size={12} /> {d.messages.length} {lang==="fr"?"messages":lang==="ht"?"mesaj":lang==="es"?"mensajes":"messages"}</span>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Icon name="utilisateurs" size={12} /> {participants} {lang==="fr"?"participants":lang==="ht"?"patisipan":lang==="es"?"participantes":"participants"}</span>
                      </div>
                    </div>
                    <span style={{ color:"#9ca3af", flexShrink:0, transform:open?"rotate(90deg)":"none", transition:"transform .25s" }}><Icon name="chevron_droite" size={18} /></span>
                  </button>

                  {/* Fil de discussion */}
                  <div style={{ padding: open ? "16px 20px 20px" : "0 20px 16px" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      {shown.map((m, mi) => (
                        <div key={mi} style={{ display:"flex", gap:12, marginLeft: m.replyTo ? 24 : 0 }}>
                          <div style={{ width:38, height:38, borderRadius:"50%", background:m.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:"0.9rem", flexShrink:0 }}>
                            {m.author[0]}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:3 }}>
                              <span style={{ fontWeight:800, fontSize:"0.82rem", color:"#1a3568" }}>{m.author}</span>
                              <span style={{ fontSize:"0.78rem" }}>{m.flag}</span>
                              <span style={{ fontSize:"0.68rem", color:"#9ca3af" }}>· {m.time}</span>
                              {m.replyTo && (
                                <span style={{ fontSize:"0.66rem", color:"#9ca3af", display:"inline-flex", alignItems:"center", gap:3 }}>
                                  <Icon name="fleche_gauche" size={10} /> {lang==="fr"?"en réponse à":lang==="ht"?"an repons a":lang==="es"?"en respuesta a":"replying to"} {m.replyTo}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize:"0.85rem", color:"#2d3748", lineHeight:1.6 }}>{m.text[lang as Lang]}</p>
                            <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:6, fontSize:"0.72rem", color:"#9ca3af" }}>
                              <Icon name="jaime" size={13} color="#2d6a4f" /> {m.likes} {lang==="fr"?"Amen":lang==="ht"?"Amèn":lang==="es"?"Amén":"Amen"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Réponses des membres + formulaire (quand ouvert) */}
                    {open && (
                      <div style={{ marginTop:16, paddingTop:16, borderTop:"1px dashed #e8e4de" }}>
                        {(replies[d.id] || []).length > 0 && (
                          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:16 }}>
                            {(replies[d.id] || []).map((r) => (
                              <div key={r.id} style={{ display:"flex", gap:12 }}>
                                <div style={{ width:38, height:38, borderRadius:"50%", background:d.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:"0.9rem", flexShrink:0 }}>
                                  {(r.author_name[0] || "M").toUpperCase()}
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                                    <span style={{ fontWeight:800, fontSize:"0.82rem", color:"#1a3568" }}>{r.author_name}</span>
                                    <span style={{ fontSize:"0.6rem", fontWeight:800, color:d.accent, background:`${d.accent}14`, padding:"1px 8px", borderRadius:999 }}>
                                      {lang==="fr"?"Membre":lang==="ht"?"Manm":lang==="es"?"Miembro":"Member"}
                                    </span>
                                  </div>
                                  <p style={{ fontSize:"0.85rem", color:"#2d3748", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{r.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Champ de réponse */}
                        <div id={`reply-${d.id}`} style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          <textarea
                            value={drafts[d.id] || ""}
                            onChange={(e) => setDrafts((v) => ({ ...v, [d.id]: e.target.value }))}
                            placeholder={lang==="fr"?"Écris ta réponse, avec respect…":lang==="ht"?"Ekri repons ou, ak respè…":lang==="es"?"Escribe tu respuesta, con respeto…":"Write your reply, with respect…"}
                            rows={2}
                            style={{ width:"100%", boxSizing:"border-box", border:"1px solid #e8e4de", borderRadius:12, padding:"10px 12px", fontSize:"0.85rem", resize:"vertical", fontFamily:"inherit", outline:"none", color:"#1a3568" }}
                          />
                          <div style={{ display:"flex", justifyContent:"flex-end" }}>
                            <button onClick={() => postReply(d.id)} disabled={posting===d.id || !(drafts[d.id]||"").trim()}
                              style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:"0.78rem", fontWeight:800, color:"#fff", background:"linear-gradient(135deg,#2d6a4f,#16a34a)", padding:"9px 20px", borderRadius:999, border:"none", cursor:(posting===d.id||!(drafts[d.id]||"").trim())?"not-allowed":"pointer", opacity:(posting===d.id||!(drafts[d.id]||"").trim())?0.5:1 }}>
                              <Icon name="envoyer" size={14} /> {posting===d.id ? (lang==="fr"?"Envoi…":lang==="ht"?"Voye…":lang==="es"?"Enviando…":"Posting…") : (lang==="fr"?"Publier":lang==="ht"?"Pibliye":lang==="es"?"Publicar":"Post")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginTop:16, flexWrap:"wrap" }}>
                      {!open && d.messages.length > 2 ? (
                        <button onClick={() => setOpenDebate(d.id)} style={{ fontSize:"0.78rem", fontWeight:700, color:d.accent, background:"none", border:"none", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:5 }}>
                          {lang==="fr"?`Voir les ${d.messages.length - 2} autres réponses`:lang==="ht"?`Wè ${d.messages.length - 2} lòt repons`:lang==="es"?`Ver las otras ${d.messages.length - 2} respuestas`:`See ${d.messages.length - 2} more replies`} <Icon name="chevron_droite" size={13} />
                        </button>
                      ) : <span />}
                      <button
                        onClick={() => {
                          setOpenDebate(d.id);
                          setTimeout(() => {
                            const el = document.getElementById(`reply-${d.id}`);
                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                            (el?.querySelector("textarea") as HTMLTextAreaElement | null)?.focus();
                          }, 250);
                        }}
                        style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:"0.76rem", fontWeight:800, color:"#fff", background:"linear-gradient(135deg,#2d6a4f,#16a34a)", padding:"8px 16px", borderRadius:999, border:"none", cursor:"pointer" }}>
                        <Icon name="editer" size={13} /> {lang==="fr"?"Rejoindre la discussion":lang==="ht"?"Rantre nan diskisyon an":lang==="es"?"Unirse a la discusión":"Join the discussion"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ GROUPES ════════════════════════════════════════════════════ */}
        <div id="kp-groupes" className="max-w-6xl mx-auto px-5 sm:px-8 mb-12" style={{ scrollMarginTop: 90 }}>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p style={{ color:"#4a5568", fontSize:"0.9rem" }}>
                {lang==="fr"?"Aucun groupe trouvé pour":lang==="ht"?"Pa gen gwoup jwenn pou":lang==="es"?"Ningún grupo para":"No group found for"} &ldquo;{search}&rdquo;
              </p>
              <button onClick={() => setSearch("")}
                style={{ color:"#2d6a4f", fontSize:"0.85rem", marginTop:8, background:"none", border:"none", cursor:"pointer" }}>
                {lang==="fr"?"Voir tous les groupes":lang==="ht"?"Wè tout gwoup yo":lang==="es"?"Ver todos":"See all groups"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((group, i) => (
                <Link
                  key={group.slug}
                  href={`/communaute/${group.slug}`}
                  className="comm-group-card comm-card-reveal"
                  style={{
                    animationDelay:`${Math.min(i,8)*0.05}s`,
                  }}
                >
                  {/* Badge */}
                  {group.badge && (
                    <div style={{
                      position:"absolute", top:12, left:12, zIndex:10,
                      background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)",
                      color:"#fff", fontSize:"0.68rem", fontWeight:700,
                      padding:"3px 10px", borderRadius:999,
                    }}>{group.badge}</div>
                  )}

                  {/* Cover */}
                  <div className={`bg-gradient-to-br ${group.color}`}
                    style={{ height:108, position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ position:"absolute", inset:0, opacity:.22 }}>
                      <div style={{ position:"absolute", top:6, right:16, width:56, height:56, background:"#fff", borderRadius:"50%", filter:"blur(18px)" }} />
                      <div style={{ position:"absolute", bottom:0, left:22, width:40, height:40, background:"#fff", borderRadius:"50%", filter:"blur(12px)" }} />
                    </div>
                    <img src={group.image} alt="" style={{ width:50, height:50, filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.4))", position:"relative", zIndex:1 }} />
                    <div style={{
                      position:"absolute", bottom:8, right:10,
                      background:"rgba(0,0,0,0.48)", backdropFilter:"blur(4px)",
                      color:"#fff", fontSize:"0.68rem", fontWeight:700,
                      padding:"2px 8px", borderRadius:999,
                    }}>
                      {group.memberCount.toLocaleString()} {lang==="fr"?"membres":lang==="ht"?"manm":lang==="es"?"miembros":"members"}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div style={{ padding:"16px 18px" }}>
                    <h3 style={{ fontWeight:800, fontSize:"0.94rem", color:"#1a3568", marginBottom:5, transition:"color .2s", fontFamily:"'Playfair Display',Georgia,serif" }}>
                      {group.title[lang] || group.title.fr}
                    </h3>
                    <p style={{
                      fontSize:"0.76rem", color:"#4a6080", lineHeight:1.6, marginBottom:12,
                      display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden",
                    }}>
                      {group.description[lang] || group.description.fr}
                    </p>
                    <div style={{ display:"flex", flexWrap:"wrap" as const, gap:5, marginBottom:12 }}>
                      {group.sections.slice(0,3).map((s) => (
                        <span key={s.slug} style={{
                          fontSize:"0.68rem", padding:"2px 9px", borderRadius:999,
                          background:"rgba(26,53,104,0.06)", color:"#1a3568",
                          display:"inline-flex", alignItems:"center", gap:4,
                        }}><Icon name={s.icon as IconName} size={12} color="#1a3568" /> {s.title[lang] || s.title.fr}</span>
                      ))}
                      {group.sections.length > 3 && (
                        <span style={{
                          fontSize:"0.68rem", padding:"2px 9px", borderRadius:999,
                          background:"rgba(45,106,79,0.10)", color:"#2d6a4f",
                        }}>+{group.sections.length-3}</span>
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.70rem", color:"#9ca3af" }}>
                        {group.sections.length} {lang==="fr"?"sujets":lang==="ht"?"sijè":lang==="es"?"temas":"topics"}
                      </span>
                      <span style={{ fontSize:"0.76rem", fontWeight:800, color:"#2d6a4f" }}>
                        {lang==="fr"?"Rejoindre →":lang==="ht"?"Rantre →":lang==="es"?"Unirse →":"Join →"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ══ AD SLOT ════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-10">
          <AdBanner slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COMMUNAUTE ?? "0000000006"} format="horizontal" minHeight={90} />
        </div>

        {/* ══ 3 ACTIONS CTA ══════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
          {/* Titre section */}
          <p style={{ fontSize:10, fontWeight:900, letterSpacing:"0.26em", color:"#00aac8", marginBottom:20, textAlign:"center", textTransform:"uppercase" as const }}>
            ✦ {lang==="fr"?"Continuer votre parcours":lang==="ht"?"Kontinye vwayaj ou":lang==="es"?"Continúa tu camino":"Continue your journey"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                href:"/championnats",
                icon:"trophee",
                color:"#d4a017",
                bg:"rgba(212,160,23,0.08)",
                border:"rgba(212,160,23,0.22)",
                title:{ fr:"Championnats Bibliques", ht:"Chanpyona Biblik", en:"Biblical Championships", es:"Campeonatos Bíblicos" },
                desc:{ fr:"Teste tes connaissances et affronte des croyants du monde entier.", ht:"Teste konesans ou ak kwayan toupatou nan mond lan.", en:"Test your knowledge and compete with believers worldwide.", es:"Prueba tu conocimiento y compite con creyentes de todo el mundo." },
                btn:{ fr:"Rejoindre →", ht:"Patisipe →", en:"Join →", es:"Unirse →" },
              },
              {
                href:"/prieres",
                icon:"priere",
                color:"#a78bfa",
                bg:"rgba(26,53,104,0.08)",
                border:"rgba(0,170,200,0.22)",
                title:{ fr:"Prière Collective", ht:"Lapriyè Kolektif", en:"Collective Prayer", es:"Oración Colectiva" },
                desc:{ fr:"Soumets ta prière et rejoins des milliers de croyants qui prient ensemble.", ht:"Soumèt lapriyè ou epi rejwenn dè milye kwayan k ap priye ansanm.", en:"Submit your prayer and join thousands of believers praying together.", es:"Envía tu oración y únete a miles de creyentes orando juntos." },
                btn:{ fr:"Prier →", ht:"Priye →", en:"Pray →", es:"Orar →" },
              },
              {
                href:"/temoignages",
                icon:"etincelles",
                color:"#ec4899",
                bg:"rgba(236,72,153,0.08)",
                border:"rgba(236,72,153,0.22)",
                title:{ fr:"Témoignages", ht:"Temwayaj", en:"Testimonies", es:"Testimonios" },
                desc:{ fr:"Partage ce que Dieu a fait dans ta vie et encourage la communauté.", ht:"Pataje sa Bondye fè nan lavi ou epi ankouraje kominote a.", en:"Share what God has done in your life and encourage the community.", es:"Comparte lo que Dios ha hecho en tu vida y anima a la comunidad." },
                btn:{ fr:"Partager →", ht:"Pataje →", en:"Share →", es:"Compartir →" },
              },
            ].map((card) => (
              <Link key={card.href} href={card.href} style={{
                display:"block", textDecoration:"none", color:"inherit",
                background:"#ffffff", border:`1px solid #e8e4de`,
                borderTop:`3px solid ${card.color}`,
                borderRadius:20, padding:"26px 24px", position:"relative", overflow:"hidden",
                transition:"transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease",
                boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform="translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow=`0 14px 40px ${card.color}25`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform="translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow="0 2px 12px rgba(0,0,0,0.04)"; }}
              >
                {/* icon circle */}
                <div style={{ width:52, height:52, borderRadius:"50%", background:`${card.color}15`,
                  display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <Icon name={card.icon as IconName} size={26} color={card.color} />
                </div>
                <h3 style={{ color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"1rem", marginBottom:8 }}>{card.title[lang as Lang]}</h3>
                <p style={{ color:"#4a6080", fontSize:"0.80rem", lineHeight:1.65, marginBottom:18 }}>{card.desc[lang as Lang]}</p>
                <span style={{
                  display:"inline-flex", alignItems:"center",
                  fontSize:"0.80rem", fontWeight:800, color:card.color,
                  padding:"7px 16px", borderRadius:999,
                  background:`${card.color}12`, border:`1px solid ${card.color}30`,
                }}>{card.btn[lang as Lang]}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
