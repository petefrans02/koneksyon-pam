"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import Image from "next/image";
import NotificationCenter from "@/app/components/NotificationCenter";
import LangSwitch from "@/app/components/LangSwitch";
import Icon, { IconName } from "@/app/components/Icon";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@supabase/supabase-js";
import { signOut } from "@/lib/supabase";

type Lang = "fr"|"ht"|"en"|"es";

const NAV_LINKS = [
  { href: "/mission",     fr: "Mission",       ht: "Misyon",    en: "Mission",       es: "Misión"      },
  { href: "/academie",    fr: "Académie",      ht: "Akademi",   en: "Academy",       es: "Academia"    },
  { href: "/prieres",     fr: "Prière",        ht: "Lapriyè",   en: "Prayer",        es: "Oración"     },
  { href: "/championnats",fr: "Championnats",  ht: "Chanpyona", en: "Championships", es: "Campeonatos" },
  { href: "/anglais",     fr: "Apprendre l'anglais", ht: "Aprann anglè", en: "Learn English", es: "Aprender inglés" },
  { href: "/quiz",        fr: "Quiz",          ht: "Kiz",       en: "Quiz",          es: "Quiz"        },
  { href: "/bible",       fr: "Bible",         ht: "Bib",       en: "Bible",         es: "Biblia"      },
];

const FOUNDATION_LINKS = [
  { href: "/fondation",              fr: "Qui sommes-nous",  en: "About us"       },
  { href: "/mission",                fr: "Notre Mission",    en: "Our Mission"    },
  { href: "/impact",                 fr: "Notre Impact",     en: "Our Impact"     },
  { href: "/communaute",             fr: "La Communauté",    en: "Community"      },
  { href: "/projets",                fr: "Nos Projets",      en: "Our Projects"   },
  { href: "/fondation/partenaires",  fr: "Partenaires",      en: "Partners"       },
  { href: "/fondation/transparence", fr: "Transparence",     en: "Transparency"   },
  { href: "/fondation/rapports",     fr: "Nos rapports",     en: "Reports"        },
];

const MOBILE_LINKS = [
  { href: "/",             fr: "Accueil",      en: "Home"          },
  { href: "/mission",      fr: "Mission",      en: "Mission"       },
  { href: "/academie",     fr: "Académie",     en: "Academy"       },
  { href: "/impact",       fr: "Impact",       en: "Impact"        },
  { href: "/projets",      fr: "Nos Projets",  en: "Projects"      },
  { href: "/fondation",    fr: "Le Mouvement", en: "The Movement"  },
  { href: "/championnats", fr: "Championnats", en: "Championships" },
  { href: "/anglais",      fr: "Apprendre l'anglais", en: "Learn English" },
  { href: "/quiz",         fr: "Quiz Biblique", en: "Bible Quiz"   },
  { href: "/bible",        fr: "Bible",        en: "Bible"         },
  { href: "/etude",        fr: "Études",       en: "Studies"       },
  { href: "/prieres",      fr: "Prières",      en: "Prayers"       },
  { href: "/louange",      fr: "Louange",      en: "Worship"       },
  { href: "/temoignages",  fr: "Témoignages",  en: "Testimonies"   },
  { href: "/communaute",   fr: "Communauté",   en: "Community"     },
  { href: "/classement",   fr: "Classement",   en: "Rankings"      },
  { href: "/contact",      fr: "Contact",      en: "Contact"       },
];

type UserType = { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };

function UserMenu({ user, l, onSignOut }: { user: UserType; l: Lang; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatar = user.user_metadata?.avatar_url;
  const initial = name[0]?.toUpperCase() ?? "U";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = {
    dashboard: { fr:"Mon tableau de bord", ht:"Tablo de bò mwen", en:"Dashboard", es:"Mi panel" },
    profile:   { fr:"Mon profil",          ht:"Pwofil mwen",      en:"My profile", es:"Mi perfil" },
    logout:    { fr:"Déconnexion",         ht:"Dekonekte",        en:"Sign out",   es:"Cerrar sesión" },
  };

  return (
    <div ref={ref} style={{ position:"relative" }} className="nav-sm-show">
      <button onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", gap:8,
        background: open ? "#f0ede8" : "transparent",
        border:"1.5px solid #e8e4de", borderRadius:10,
        padding:"5px 10px 5px 6px", cursor:"pointer",
        transition:"all .2s ease",
      }}>
        {avatar ? (
          <Image src={avatar} alt="" width={28} height={28} style={{ borderRadius:"50%", objectFit:"cover" }} unoptimized />
        ) : (
          <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#1a3568,#00aac8)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.78rem", fontWeight:900 }}>
            {initial}
          </div>
        )}
        <span style={{ color:"#1a3568", fontWeight:700, fontSize:"0.82rem" }}>{name.split(" ")[0]}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition:"transform .2s" }}>
          <path d="M1.5 3.5l3.5 3 3.5-3" stroke="#1a3568" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", right:0,
          background:"#fff", borderRadius:16, padding:"6px",
          boxShadow:"0 8px 40px rgba(26,53,104,0.16)", border:"1px solid #e8e4de",
          minWidth:200, zIndex:200,
        }}>
          {/* Info utilisateur */}
          <div style={{ padding:"10px 14px 10px", borderBottom:"1px solid #f0ede8", marginBottom:4 }}>
            <div style={{ fontWeight:800, fontSize:"0.85rem", color:"#1a3568" }}>{name}</div>
            <div style={{ fontSize:"0.72rem", color:"#9ca3af", marginTop:2 }}>{user.email}</div>
          </div>
          {/* Liens */}
          {([
            { href:"/dashboard", icon:"home" as IconName,   key:"dashboard" },
            { href:"/profile",   icon:"profil" as IconName, key:"profile"   },
          ]).map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", color:"#2d3748", fontSize:"0.84rem",
              fontWeight:500, textDecoration:"none", borderRadius:10,
              transition:"all .15s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#f7f6f2"; (e.currentTarget as HTMLElement).style.color="#1a3568"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; (e.currentTarget as HTMLElement).style.color="#2d3748"; }}>
              <Icon name={item.icon} size={17} /> {label[item.key as keyof typeof label][l]}
            </Link>
          ))}
          {/* Lien Admin — visible uniquement pour les administrateurs */}
          {isAdmin(user) && (
            <Link href="/admin" onClick={() => setOpen(false)} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", color:"#c8960f", fontSize:"0.84rem",
              fontWeight:700, textDecoration:"none", borderRadius:10, transition:"all .15s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#fffbf0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; }}>
              <Icon name="parametres" size={17} /> Administration
            </Link>
          )}
          {/* Déconnexion */}
          <div style={{ borderTop:"1px solid #f0ede8", marginTop:4, paddingTop:4 }}>
            <button onClick={() => { setOpen(false); onSignOut(); }} style={{
              display:"flex", alignItems:"center", gap:8, width:"100%",
              padding:"10px 14px", color:"#dc2626", fontSize:"0.84rem",
              fontWeight:600, background:"none", border:"none",
              cursor:"pointer", borderRadius:10, textAlign:"left",
              transition:"all .15s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#fef2f2"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; }}>
              <Icon name="deconnexion" size={17} /> {label.logout[l]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavBar() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [foundationOpen, setFoundationOpen] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const foundationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (foundationRef.current && !foundationRef.current.contains(e.target as Node)) {
        setFoundationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const t = (key: string) => ({
    join:      { fr: "Rejoindre", ht: "Rantre",      en: "Join",      es: "Unirse"    },
    login:     { fr: "Connexion", ht: "Konekte",     en: "Sign in",   es: "Entrar"    },
    found:     { fr: "Le Mouvement", ht: "Mouvman an",en: "The Movement",es: "El Movimiento" },
    dashboard: { fr: "Mon espace", ht: "Espas mwen", en: "Dashboard", es: "Mi espacio"},
    logout:    { fr: "Déconnexion", ht: "Dekonekte", en: "Sign out", es: "Cerrar sesión"},
  } as Record<string, Record<Lang, string>>)[key]?.[l] ?? key;

  return (
    <>
      <nav style={{
        position: "fixed", top: 36, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.97)" : "#ffffff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled
          ? "0 2px 20px rgba(26,53,104,0.10)"
          : "0 1px 0 rgba(26,53,104,0.08)",
        transition: "box-shadow .3s ease, background .3s ease",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", height: 68, gap: 8,
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <Image src="/logo-kpf.png" alt="KPF" width={40} height={40} style={{ objectFit: "contain" }} />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#1a3568", letterSpacing: "0.06em" }}>
                KONEKSYON PAM
              </div>
              <div style={{ fontWeight: 800, fontSize: "0.76rem", color: "#00aac8", letterSpacing: "0.14em" }}>
                ACADEMY
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="nav-desktop-links">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                style={{
                  padding: "9px 16px", color: "#2d3748", fontWeight: 600, fontSize: "1rem",
                  textDecoration: "none", borderRadius: 8, transition: "all .2s ease", letterSpacing: "0.01em",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = "#1a3568";
                  (e.currentTarget as HTMLElement).style.background = "#f0ede8";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = "#2d3748";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}>
                {(link as Record<string, string>)[l] || link.fr}
              </Link>
            ))}

            {/* La Fondation dropdown */}
            <div ref={foundationRef} style={{ position: "relative" }}>
              <button
                onClick={() => setFoundationOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "9px 16px", color: "#1a3568", fontWeight: 700, fontSize: "1rem",
                  background: foundationOpen ? "#f0ede8" : "transparent",
                  borderRadius: 8, border: "none", cursor: "pointer", transition: "background .2s ease",
                }}>
                {t("found")}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: foundationOpen ? "rotate(180deg)" : "none", transition: "transform .25s ease" }}>
                  <path d="M2 4l4 4 4-4" stroke="#1a3568" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {foundationOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                  background: "#fff", borderRadius: 16, padding: "8px",
                  boxShadow: "0 8px 40px rgba(26,53,104,0.18)", border: "1px solid #e8e4de",
                  minWidth: 220, zIndex: 100,
                }}>
                  {FOUNDATION_LINKS.map(fl => (
                    <Link key={fl.href} href={fl.href}
                      onClick={() => setFoundationOpen(false)}
                      style={{
                        display: "block", padding: "10px 14px", color: "#2d3748",
                        fontWeight: 500, fontSize: "0.84rem", textDecoration: "none",
                        borderRadius: 10, transition: "all .15s ease",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "#f7f6f2";
                        (e.currentTarget as HTMLElement).style.color = "#1a3568";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#2d3748";
                      }}>
                      {l === "en" ? fl.en : fl.fr}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <div className="nav-right-icons">
              <NotificationCenter />
              <LangSwitch />
            </div>

            {user ? (
              <UserMenu user={user as {email?:string; user_metadata?:{full_name?:string; avatar_url?:string}}} l={l} onSignOut={async () => { await signOut(); }} />
            ) : (
              <>
                <Link href="/auth"
                  className="nav-sm-show"
                  style={{
                    padding: "8px 14px", color: "#1a3568", fontWeight: 600,
                    fontSize: "0.92rem", textDecoration: "none", borderRadius: 8,
                    transition: "background .2s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0ede8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {t("login")}
                </Link>
                <Link href="/auth"
                  className="nav-sm-show"
                  style={{
                    padding: "8px 18px",
                    background: "linear-gradient(135deg,#c8960f,#e8b84b)",
                    color: "#0d1d3d", fontWeight: 800, fontSize: "0.92rem",
                    borderRadius: 8, textDecoration: "none",
                    transition: "transform .2s ease, box-shadow .2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(200,150,15,0.35)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  {t("join")}
                </Link>
              </>
            )}

            {/* Mobile burger */}
            <button
              className="nav-burger"
              onClick={() => setMobileOpen(o => !o)}
              style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}
              aria-label="Menu">
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 4l14 14M18 4L4 18" stroke="#1a3568" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 6h16M3 11h16M3 16h16" stroke="#1a3568" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(13,29,61,0.55)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setMobileOpen(false)}>
          <div
            style={{
              position: "absolute", top: 0, right: 0,
              width: "min(320px, 88vw)", height: "100dvh",
              background: "#fff", overflowY: "auto", padding: "80px 0 40px",
              boxShadow: "-8px 0 40px rgba(26,53,104,0.18)",
            }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 2 }}>
              {MOBILE_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "15px 16px", color: "#1c1c2e", fontWeight: 600,
                    fontSize: "1.1rem", textDecoration: "none", borderRadius: 10,
                    transition: "background .15s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f7f6f2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {l === "en" ? link.en : link.fr}
                </Link>
              ))}

              <div style={{
                borderTop: "1px solid #e8e4de", marginTop: 12, paddingTop: 16,
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <LangSwitch />
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                      style={{
                        padding: "12px 16px", background: "#1a3568", color: "#fff",
                        fontWeight: 700, fontSize: "0.9rem", borderRadius: 10,
                        textDecoration: "none", textAlign: "center",
                      }}>
                      {t("dashboard")}
                    </Link>
                    <button onClick={async () => { setMobileOpen(false); await signOut(); }}
                      style={{
                        padding: "12px 16px", background: "#fff", border: "1.5px solid #e2c9c9", color: "#dc2626",
                        fontWeight: 800, fontSize: "0.9rem", borderRadius: 10, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                      <Icon name="deconnexion" size={16} /> {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setMobileOpen(false)}
                      style={{
                        padding: "12px 16px", border: "1.5px solid #1a3568", color: "#1a3568",
                        fontWeight: 700, fontSize: "0.9rem", borderRadius: 10,
                        textDecoration: "none", textAlign: "center",
                      }}>
                      {t("login")}
                    </Link>
                    <Link href="/auth" onClick={() => setMobileOpen(false)}
                      style={{
                        padding: "12px 16px",
                        background: "linear-gradient(135deg,#c8960f,#e8b84b)",
                        color: "#0d1d3d", fontWeight: 800, fontSize: "0.9rem",
                        borderRadius: 10, textDecoration: "none", textAlign: "center",
                      }}>
                      {t("join")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
