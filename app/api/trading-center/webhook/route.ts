/**
 * LE POINT D'ENTRÉE TRADINGVIEW.
 *
 *   URL à coller dans l'alerte :
 *   https://koneksyonpam.com/api/trading-center/webhook
 *
 * ── Trois décisions qui ne sautent pas aux yeux ───────────────────────────
 *
 * 1. **On répond 200 même quand on refuse l'alerte.**
 *    TradingView ne montre pas le corps des réponses d'erreur, mais il
 *    DÉSACTIVE une alerte dont le webhook renvoie trop d'erreurs. Un rejet
 *    légitime — score insuffisant, doublon — n'est pas une panne : répondre
 *    400 ferait éteindre l'alerte au bout de quelques refus, et le système se
 *    tairait définitivement en croyant bien faire. Le vrai diagnostic est
 *    dans `tc_alertes`, pas dans le code HTTP.
 *
 *    L'exception est le secret invalide : là, 401 est la bonne réponse, et il
 *    n'y a aucune alerte légitime à protéger.
 *
 * 2. **La diffusion ne bloque pas la réponse.**
 *    Envoyer quarante emails prend plusieurs secondes ; TradingView coupe la
 *    connexion bien avant et considère l'appel en échec. On répond dès que le
 *    signal est écrit en base, la diffusion continue derrière.
 *
 * 3. **`runtime = nodejs` est obligatoire.**
 *    `timingSafeEqual` (crypto) et `nodemailer` n'existent pas sur le runtime
 *    Edge. Sans cette ligne, la route se déploie et tombe à la première
 *    alerte, en production, un mardi matin.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";
import { diffuser } from "@/lib/trading-center/diffusion";
import { traiter } from "@/lib/trading-center/signaux";
import { AlerteInvalide, lireCorps, secretValide } from "@/lib/trading-center/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Le secret peut venir de l'en-tête (propre) ou du corps JSON (seule
  // option quand on colle un message d'alerte sans toucher aux en-têtes,
  // ce qui est le cas dans l'interface TradingView).
  const enTete = request.headers.get("x-tc-secret") ?? request.headers.get("x-webhook-secret");

  let charge;
  try {
    charge = await lireCorps(request);
  } catch (e) {
    const msg = e instanceof AlerteInvalide ? e.message : "Corps illisible.";
    return NextResponse.json({ ok: false, raison: msg }, { status: 200 });
  }

  if (!secretValide(enTete ?? charge.secret)) {
    // On ne trace pas la charge utile d'une requête non authentifiée : ce
    // serait offrir à n'importe qui le droit d'écrire dans notre base en
    // frappant l'URL en boucle.
    return NextResponse.json({ ok: false, raison: "Secret invalide." }, { status: 401 });
  }

  // Le secret ne doit jamais finir écrit en clair dans `tc_alertes`.
  delete charge.secret;

  // ── Le battement de cœur ────────────────────────────────────────────
  //
  // Le script Pine envoie un signe de vie toutes les heures, même quand il
  // n'a rien à signaler. Il est enregistré comme tel — surtout PAS comme un
  // rejet : la ventilation des rejets de l'admin sert à comprendre pourquoi
  // le système ne publie pas, et vingt-quatre faux « format incorrect » par
  // jour la rendraient illisible.
  //
  // C'est cette ligne qui permet à `sante.ts` de distinguer « le marché est
  // calme » de « l'alerte TradingView est morte ».
  if ((charge as { type?: string }).type === "pouls") {
    try {
      await adminDb().from("tc_alertes").insert({
        marche: typeof charge.marche === "string" ? charge.marche : null,
        charge,
        statut: "pouls",
        raison: "Signe de vie horaire du script Pine.",
      });
    } catch (e) {
      console.error("[trading-center/webhook] pouls", e instanceof Error ? e.message : e);
    }
    return NextResponse.json({ ok: true, pouls: true });
  }

  const resultat = await traiter(charge);

  if (resultat.statut === "publiee" && resultat.signal) {
    const signal = resultat.signal;
    // Volontairement sans await — voir le point 2 de l'en-tête. Le `catch`
    // est indispensable : une promesse rejetée sans gestionnaire fait tomber
    // le processus Node entier.
    void diffuser(signal).catch((e) =>
      console.error("[trading-center/webhook] diffusion", e instanceof Error ? e.message : e),
    );

    return NextResponse.json({
      ok: true,
      publie: true,
      signal_id: signal.id,
      numero: signal.numero,
      confiance: signal.confiance,
    });
  }

  return NextResponse.json({
    ok: true,
    publie: false,
    statut: resultat.statut,
    raison: resultat.raison,
    score: resultat.score_final ?? resultat.score_brut,
  });
}

/**
 * GET — le test de vie.
 *
 * Ouvrir l'URL dans un navigateur doit répondre quelque chose d'utile plutôt
 * qu'un 405 sec. C'est la première chose qu'on fait quand une alerte semble
 * ne pas passer, et la réponse dit immédiatement si le secret est configuré
 * côté serveur — la cause numéro un des webhooks silencieux.
 */
export async function GET() {
  return NextResponse.json({
    service: "KONEKSYON PAM TRADING CENTER — webhook",
    methode: "POST",
    secret_configure: !!process.env.TRADINGVIEW_WEBHOOK_SECRET,
    ia_configuree: !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY),
    aide: "Colle cette URL dans l'alerte TradingView, avec le message JSON documenté dans TRADING-CENTER.md.",
  });
}
