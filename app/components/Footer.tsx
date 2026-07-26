"use client";
import { useLang } from "@/lib/LangContext";
import Image from "next/image";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";

export default function Footer() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as "fr" | "ht" | "en" | "es";

  const COLUMNS = [
    {
      color: "#d4a017",
      title: { fr: "Championnats Bibliques", ht: "Chanpyona Biblik", en: "Biblical Championships", es: "Campeonatos Bíblicos" },
      icon: "trophee" as IconName,
      links: [
        { href: "/championnats",              label: { fr: "Tous les championnats",   ht: "Tout chanpyona",    en: "All championships",   es: "Todos los campeonatos" } },
        { href: "/classement",            label: { fr: "Classement mondial",     ht: "Klasman mondyal",   en: "World rankings",      es: "Ranking mundial"      } },
        { href: "/trophees",              label: { fr: "Mes trophées",           ht: "Twofè mwen",        en: "My trophies",         es: "Mis trofeos"          } },
        { href: "/championnats/hall-of-fame", label: { fr: "Hall of Fame",           ht: "Hall of Fame",      en: "Hall of Fame",        es: "Hall of Fame"         } },
      ],
    },
    {
      color: "#60a5fa",
      title: { fr: "Bible & La Parole", ht: "Bib & Pawòl la", en: "Bible & The Word", es: "Biblia & La Palabra" },
      icon: "bible" as IconName,
      links: [
        { href: "/bible",         label: { fr: "Lire la Bible",       ht: "Li Bib la",        en: "Read the Bible",     es: "Leer la Biblia"       } },
        { href: "/aujourd-hui",   label: { fr: "Verset du jour",      ht: "Vèsè jou a",       en: "Verse of the day",   es: "Versículo del día"    } },
        { href: "/psaumes",       label: { fr: "Psaumes",             ht: "Sòm",              en: "Psalms",             es: "Salmos"               } },
        { href: "/etude",         label: { fr: "Études bibliques",    ht: "Etid biblik",      en: "Bible studies",      es: "Estudios bíblicos"    } },
      ],
    },
    {
      color: "#00aac8",
      title: { fr: "Prière, Louange & Vie", ht: "Lapriyè, Lwanj & Vi", en: "Prayer, Worship & Life", es: "Oración, Alabanza & Vida" },
      icon: "priere" as IconName,
      links: [
        { href: "/prieres",       label: { fr: "Prières",             ht: "Priyè",            en: "Prayers",            es: "Oraciones"            } },
        { href: "/louange",       label: { fr: "Louange & Adoration", ht: "Lwanj & Adowasyon",en: "Worship & Praise",   es: "Alabanza & Adoración" } },
        { href: "/temoignages",   label: { fr: "Témoignages",         ht: "Temwayaj",         en: "Testimonies",        es: "Testimonios"          } },
        { href: "/communaute",    label: { fr: "Communauté",          ht: "Kominote",         en: "Community",          es: "Comunidad"            } },
        { href: "/communaute",        label: { fr: "Église",              ht: "Legliz",           en: "Church",             es: "Iglesia"              } },
      ],
    },
    {
      color: "#94a3b8",
      title: { fr: "À propos & Soutien", ht: "Sou nou & Sipò", en: "About & Support", es: "Acerca de & Apoyo" },
      icon: "info" as IconName,
      links: [
        { href: "/apropos",                    label: { fr: "Notre mission",          ht: "Misyon nou",        en: "Our mission",          es: "Nuestra misión"       } },
        { href: "/contact",                    label: { fr: "Contact",                ht: "Kontakte nou",      en: "Contact",              es: "Contacto"             } },
        { href: "/don",                        label: { fr: "Soutenir la communauté", ht: "Sipòte kominote a", en: "Support the community", es: "Apoyar la comunidad" } },
        { href: "/conditions-utilisation",     label: { fr: "Conditions",             ht: "Kondisyon",         en: "Terms",                es: "Términos"             } },
        { href: "/politique-confidentialite",  label: { fr: "Confidentialité",        ht: "Konfidansyalite",   en: "Privacy",              es: "Privacidad"           } },
      ],
    },
  ];

  const tagline = {
    fr: "Une plateforme évangélique mondiale, dédiée à Jésus-Christ et à l'édification des croyants.",
    ht: "Yon platfòm evanjelik mondyal, dedye bay Jezi-Kri ak edifikasyon kwayan yo.",
    en: "A global evangelical platform, dedicated to Jesus Christ and the edification of believers.",
    es: "Una plataforma evangélica mundial, dedicada a Jesucristo y a la edificación de los creyentes.",
  };

  const SPIRIT_LINKS: { icon: IconName; color: string; href: string; label: Record<string,string> }[] = [
    { icon: "trophee",      color: "#d4a017", href: "/championnats", label: { fr: "Championnats", ht: "Chanpyona", en: "Championships", es: "Campeonatos" } },
    { icon: "bible",        color: "#60a5fa", href: "/bible",      label: { fr: "Bible",      ht: "Bib",      en: "Bible",     es: "Biblia"    } },
    { icon: "priere",       color: "#00aac8", href: "/prieres",    label: { fr: "Prière",     ht: "Lapriyè",  en: "Prayer",    es: "Oración"   } },
    { icon: "musique",      color: "#ec4899", href: "/louange",    label: { fr: "Louange",    ht: "Lwanj",    en: "Worship",   es: "Alabanza"  } },
    { icon: "communaute",   color: "#22c55e", href: "/communaute", label: { fr: "Communauté", ht: "Kominote", en: "Community", es: "Comunidad" } },
  ];

  return (
    <footer style={{ background: "linear-gradient(180deg, #0d1d3d 0%, #060d1a 100%)", borderTop: "1px solid rgba(200,150,15,0.12)", color: "#fff" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Logo + verset */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12"
          style={{ paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <Image src="/logo-kpf.png" alt="KPF" width={56} height={56} style={{ objectFit:"contain" }} />
            <div>
              <p className="text-white font-black text-base leading-tight">KONEKSYON PAM <span style={{ color:"#c8960f" }}>Communauté</span></p>
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: "rgba(200,150,15,0.65)" }}>
                Former • Équiper • Évangéliser • Servir
              </p>
            </div>
          </div>
          <p className="text-white/35 text-sm max-w-sm leading-relaxed italic">
            &ldquo;{l === "fr" ? "Car Dieu a tant aimé le monde qu'il a donné son Fils unique." :
              l === "ht" ? "Paske Bondye sitèlman renmen lèzòm, li bay Pitit li a." :
              l === "es" ? "Porque tanto amó Dios al mundo que dio a su Hijo unigénito." :
              "For God so loved the world that he gave his one and only Son."}&rdquo;
            <span className="not-italic ml-1 text-white/20">— Jean 3:16</span>
          </p>
        </div>

        {/* Mission tagline */}
        <p className="text-white/25 text-xs text-center mb-10 leading-relaxed max-w-xl mx-auto">
          {tagline[l]}
        </p>

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {COLUMNS.map((col) => (
            <div key={col.title.fr}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                <h4 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5" style={{ color: col.color }}><Icon name={col.icon} size={13} strokeWidth={2.25} /> {col.title[l]}</h4>
              </div>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm transition-colors block"
                      style={{ color: "rgba(255,255,255,0.40)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = col.color)}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.40)")}
                    >
                      {link.label[l]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex flex-wrap gap-3">
            {SPIRIT_LINKS.map(u => (
              <Link key={u.href} href={u.href}
                className="flex items-center gap-1.5 text-xs font-bold transition-colors"
                style={{ color: "rgba(255,255,255,0.25)" }}
                onMouseEnter={e => (e.currentTarget.style.color = u.color)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
                <Icon name={u.icon} size={14} /> {u.label[l]}
              </Link>
            ))}
          </div>
          <p className="text-white/20 text-xs text-center">
            © {new Date().getFullYear()} KONEKSYON PAM — P. Francis
          </p>
        </div>
      </div>
    </footer>
  );
}
