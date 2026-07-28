import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { STUDY_SLUGS, GROUP_SLUGS, COURSE_SLUGS, ENGLISH_SLUGS, BIBLE_CHAPTERS } from "@/lib/valid-slugs";

// Supports multiple admins via ADMIN_EMAILS env var (comma-separated)
// Primary admin is always included as a failsafe
const PRIMARY_ADMIN = "contact@koneksyonpam.com";
const ADMIN_EMAILS = [
  PRIMARY_ADMIN,
  ...(process.env.ADMIN_EMAILS ?? "")
    .split(",").map(e => e.trim().toLowerCase()).filter(Boolean),
];

// Une adresse inventée doit répondre 404, pas « 200 OK » sur une page vide.
// Ce contrôle est fait ICI et pas dans la page : le fichier app/loading.tsx
// met tout le site en mode « streaming », si bien que le statut HTTP est déjà
// envoyé avant que la page ne puisse appeler notFound().
function isMissingPage(pathname: string): boolean {
  const seg = pathname.split("/").filter(Boolean);

  if (seg[0] === "etude" && seg.length === 2) return !STUDY_SLUGS.has(seg[1]);
  if (seg[0] === "communaute" && seg.length === 2) return !GROUP_SLUGS.has(seg[1]);
  if (seg[0] === "academie" && seg.length === 2) return !COURSE_SLUGS.has(seg[1]);
  if (seg[0] === "anglais" && seg.length === 2) return !ENGLISH_SLUGS.has(seg[1]);

  if (seg[0] === "bible" && seg.length === 3) {
    const max = BIBLE_CHAPTERS[seg[1]];
    if (max === undefined) return true;              // livre inconnu
    const n = Number(seg[2]);
    return !Number.isInteger(n) || n < 1 || n > max;  // chapitre hors limites
  }

  // Concours : on ne consulte pas la base ici (trop coûteux à chaque requête),
  // mais un identifiant qui n'a pas la forme d'un UUID est forcément faux.
  if (seg[0] === "championnats" && seg.length === 2) {
    return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg[1]);
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMissingPage(pathname)) {
    // Réécrit vers la page « introuvable » AVEC le vrai statut 404.
    return NextResponse.rewrite(new URL("/introuvable", request.url), { status: 404 });
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("blocked", "1");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/etude/:path*",
    "/communaute/:path*",
    "/academie/:path*",
    "/anglais/:path*",
    "/bible/:path*",
    "/championnats/:path*",
  ],
};
