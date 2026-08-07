/**
 * LE SCORE DE CONFIANCE.
 *
 * Un score qu'on ne peut pas décomposer ne vaut rien. C'est exactement le
 * reproche qu'on fait aux canaux de signaux : « 94 % de confiance » sans rien
 * derrière est un argument commercial, pas une mesure.
 *
 * Ici, le score est une SOMME de critères nommés. Chaque point ajouté ou
 * retiré est étiqueté dans `criteres`, affiché à l'utilisateur, et
 * reconstituable à la main. Si le total est 91, on peut lire les onze lignes
 * qui font 91.
 *
 * ── Pourquoi un moteur déterministe AVANT l'IA ────────────────────────────
 *
 * L'IA passe en second, et son pouvoir est volontairement borné (±15 points).
 * L'ordre compte : un modèle de langage à qui on demande « note ce setup sur
 * 100 » produit des nombres plausibles et instables — 88 aujourd'hui, 93
 * demain sur les mêmes données. Impossible d'en tirer une statistique, donc
 * impossible de savoir si la méthode marche.
 *
 * Le déterministe donne la note ; l'IA a le droit de dire « attention, cette
 * cassure est fausse » et de retirer des points, ou de confirmer et d'en
 * ajouter un peu. Elle arbitre, elle ne décide pas.
 *
 * ── Le total dépasse 100, volontairement ──────────────────────────────────
 *
 * La somme de tous les critères favorables vaut 116. Un setup doit donc en
 * réunir environ quatre cinquièmes pour franchir 90. C'est le but : à 90 le
 * système doit se taire la plupart du temps. Un barème qui plafonnerait
 * pile à 100 rendrait le seuil atteignable en cochant simplement « tendance
 * + EMA + séance », ce qui décrit la moitié des heures d'une semaine.
 */

import { AlerteValide, Critere, Score, Tendance, Unite } from "./types";

/** Les échelles qui décident de la tendance de fond, et leur poids. */
const ECHELLES_FOND: { unite: Unite; points: number }[] = [
  { unite: "D", points: 10 },
  { unite: "4H", points: 9 },
  { unite: "1H", points: 6 },
];

function sensAttendu(sens: AlerteValide["sens"]): Tendance {
  return sens === "BUY" ? "haussiere" : "baissiere";
}

/**
 * Calcule le score et les disqualifiants.
 *
 * `rrMinimum` vient de la configuration : il peut être remonté sans toucher
 * au code, par exemple pendant une période où les spreads s'élargissent.
 */
export function noter(a: AlerteValide, rrMinimum: number, sessionsAutorisees: string[]): Score {
  const criteres: Critere[] = [];
  const disqualifiants: string[] = [];
  const attendue = sensAttendu(a.sens);
  const achat = a.sens === "BUY";
  const ind = a.indicateurs;
  const smc = a.smc;

  const ajouter = (libelle: string, points: number, favorable = true) =>
    criteres.push({ libelle, points, favorable });

  // ─────────────────────────────────────────── 1. alignement multi-échelles ──
  //
  // Le critère le plus lourd du barème (25 points), et c'est justifié : un
  // achat en 15 minutes dans un quotidien baissier n'est pas un achat, c'est
  // un rebond. C'est la façon la plus courante de perdre en ayant « bien lu ».
  let contreFond = 0;
  for (const { unite, points } of ECHELLES_FOND) {
    const lecture = a.unites[unite];
    if (!lecture?.tendance) continue;

    if (lecture.tendance === attendue) {
      ajouter(`Tendance ${unite} dans le sens du signal`, points);
    } else if (lecture.tendance === "range") {
      ajouter(`${unite} sans direction — aucun appui`, 0, false);
    } else {
      contreFond++;
      ajouter(`Tendance ${unite} CONTRE le signal`, -points, false);
    }
  }

  // Deux échelles de fond contraires : ce n'est plus une pénalité, c'est un
  // refus. Aucun empilement de confluences ne rachète un contresens pareil.
  if (contreFond >= 2) {
    disqualifiants.push("Le quotidien et le 4H vont tous deux contre le signal.");
  }

  // ────────────────────────────────────────────────── 2. empilement des EMA ──
  if (ind.ema20 !== undefined && ind.ema50 !== undefined && ind.ema200 !== undefined) {
    const empile = achat
      ? ind.ema20 > ind.ema50 && ind.ema50 > ind.ema200
      : ind.ema20 < ind.ema50 && ind.ema50 < ind.ema200;
    if (empile) ajouter("EMA 20/50/200 empilées dans le sens", 12);
    else ajouter("EMA non empilées — tendance non confirmée", 0, false);

    // Le prix sous l'EMA 200 à l'achat (ou au-dessus à la vente) est le
    // marqueur classique du contre-tendance de fond.
    const bonCote = achat ? a.prix > ind.ema200 : a.prix < ind.ema200;
    if (!bonCote) ajouter("Prix du mauvais côté de l'EMA 200", -8, false);
  }

  // ─────────────────────────────────────────────────────────────── 3. VWAP ──
  if (ind.vwap !== undefined) {
    const bonCote = achat ? a.prix > ind.vwap : a.prix < ind.vwap;
    if (bonCote) ajouter("Prix du bon côté du VWAP", 6);
    else ajouter("Prix du mauvais côté du VWAP", -4, false);
  }

  // ────────────────────────────────────────────────────────────── 4. ADX ────
  //
  // L'ADX mesure la FORCE de la tendance, pas sa direction. En dessous de 15,
  // il n'y a pas de tendance du tout : les objectifs ne seront pas atteints,
  // le prix va osciller et finir par toucher le stop. C'est disqualifiant.
  if (ind.adx !== undefined) {
    if (ind.adx >= 25) ajouter(`ADX ${ind.adx.toFixed(0)} — tendance affirmée`, 8);
    else if (ind.adx >= 20) ajouter(`ADX ${ind.adx.toFixed(0)} — tendance naissante`, 4);
    else if (ind.adx < 15) {
      disqualifiants.push(`ADX à ${ind.adx.toFixed(0)} : marché sans tendance, les objectifs ne seront pas atteints.`);
    } else ajouter(`ADX ${ind.adx.toFixed(0)} — tendance faible`, 0, false);
  }

  // ────────────────────────────────────────────────────────────── 5. RSI ────
  //
  // On ne se sert pas du RSI comme d'un signal de retournement — c'est
  // l'erreur de débutant qui fait vendre les plus belles hausses. On s'en
  // sert pour repérer l'entrée TARDIVE : acheter à 82 de RSI, c'est acheter
  // à la fin du mouvement, juste avant la respiration.
  if (ind.rsi !== undefined) {
    const extreme = achat ? ind.rsi > 78 : ind.rsi < 22;
    const sain = achat ? ind.rsi >= 45 && ind.rsi <= 70 : ind.rsi >= 30 && ind.rsi <= 55;
    if (extreme) ajouter(`RSI ${ind.rsi.toFixed(0)} — entrée tardive`, -8, false);
    else if (sain) ajouter(`RSI ${ind.rsi.toFixed(0)} — zone d'entrée saine`, 6);
    else ajouter(`RSI ${ind.rsi.toFixed(0)} — neutre`, 0, false);
  }

  // ────────────────────────────────────────────────────────────── 6. MACD ───
  if (ind.macd !== undefined && ind.macd_signal !== undefined) {
    const aligne = achat ? ind.macd > ind.macd_signal : ind.macd < ind.macd_signal;
    if (aligne) ajouter("MACD croisé dans le sens", 6);
    else ajouter("MACD croisé contre le sens", -5, false);
  }

  // ─────────────────────────────────────────────────────── 7. volume relatif ─
  //
  // Une cassure sans volume est le premier symptôme d'une fausse cassure. On
  // n'en fait pas un disqualifiant automatique — certaines séances calmes
  // produisent de vrais mouvements — mais c'est le critère que l'IA devra
  // regarder en priorité.
  if (ind.rvol !== undefined) {
    if (ind.rvol >= 1.5) ajouter(`Volume ${ind.rvol.toFixed(1)}× la moyenne`, 6);
    else if (ind.rvol >= 1.2) ajouter(`Volume ${ind.rvol.toFixed(1)}× la moyenne`, 4);
    else if (ind.rvol < 0.7) ajouter(`Volume ${ind.rvol.toFixed(1)}× — participation faible`, -6, false);
  }

  // ──────────────────────────────────────────── 8. structure Smart Money ────
  if (smc.bos) {
    if ((smc.bos === "haussier") === achat) ajouter("Cassure de structure (BOS) dans le sens", 8);
    else ajouter("BOS contre le sens", -8, false);
  }
  if (smc.choch) {
    if ((smc.choch === "haussier") === achat) ajouter("Changement de caractère (CHOCH) dans le sens", 6);
    else ajouter("CHOCH contre le sens", -6, false);
  }

  // Le balayage de liquidité doit purger le côté OPPOSÉ à l'entrée : à
  // l'achat, on veut que les stops des acheteurs aient été ramassés SOUS le
  // marché juste avant. Un balayage du même côté que l'entrée est le
  // contraire d'un appui — c'est nous qui sommes en train d'être ramassés.
  if (smc.sweep) {
    const purgeOpposee = achat ? smc.sweep === "bas" : smc.sweep === "haut";
    if (purgeOpposee) ajouter("Liquidité purgée du côté opposé avant l'entrée", 8);
    else ajouter("Balayage du même côté que l'entrée — appui absent", -6, false);
  }

  // Zones institutionnelles : il suffit que l'entrée tombe dans l'une d'elles.
  const zones: { nom: string; bas?: number; haut?: number }[] = [
    { nom: "Order block", bas: smc.order_block_bas, haut: smc.order_block_haut },
    { nom: "Fair Value Gap", bas: smc.fvg_bas, haut: smc.fvg_haut },
    { nom: "Breaker block", bas: smc.breaker_bas, haut: smc.breaker_haut },
    { nom: "Bloc de mitigation", bas: smc.mitigation_bas, haut: smc.mitigation_haut },
  ];
  const dansZone = zones.find(
    (z) => z.bas !== undefined && z.haut !== undefined && a.plan.entree >= Math.min(z.bas, z.haut) && a.plan.entree <= Math.max(z.bas, z.haut),
  );
  if (dansZone) ajouter(`Entrée dans un ${dansZone.nom}`, 6);

  // ────────────────────────────────────────── 9. confirmation en bougie ─────
  if (a.bougie) {
    ajouter(`Confirmation : ${a.bougie}`, 5);
  }

  // ──────────────────────────────────────────────────────── 10. séance ──────
  if (!sessionsAutorisees.includes(a.session)) {
    disqualifiants.push(
      a.session === "hors-session"
        ? "Marché fermé ou hors séance active."
        : `Séance « ${a.session} » exclue par la configuration.`,
    );
  } else if (a.session === "chevauchement") {
    ajouter("Chevauchement Londres/New York — volume maximal", 6);
  } else {
    ajouter(`Séance ${a.session === "new-york" ? "New York" : "Londres"}`, 4);
  }

  // ────────────────────────────────────────────── 11. risque / rendement ────
  if (a.rr < rrMinimum) {
    disqualifiants.push(`Risque/rendement de ${a.rr.toFixed(2)} — sous le minimum de ${rrMinimum}.`);
  } else if (a.rr >= 3) ajouter(`Risque/rendement ${a.rr.toFixed(1)}:1`, 8);
  else if (a.rr >= 2) ajouter(`Risque/rendement ${a.rr.toFixed(1)}:1`, 6);
  else ajouter(`Risque/rendement ${a.rr.toFixed(1)}:1`, 3);

  // ──────────────────────────────────── 12. cohérence du stop avec l'ATR ────
  //
  // Deux erreurs symétriques, toutes deux fatales et toutes deux invisibles
  // sans l'ATR :
  //
  // — Un stop plus serré que la moitié de l'amplitude moyenne sera touché par
  //   le simple bruit, même si la lecture est parfaitement juste. Le trade
  //   perd sans que le marché ait rien démenti.
  // — Un stop à plus de cinq ATR n'est pas une protection, c'est un espoir :
  //   le risque réel est cinq fois celui qu'on croit prendre.
  if (ind.atr !== undefined && ind.atr > 0) {
    const enATR = a.risque / ind.atr;
    if (enATR < 0.5) {
      disqualifiants.push(`Stop à ${enATR.toFixed(2)} ATR : trop serré, le bruit le touchera.`);
    } else if (enATR > 5) {
      disqualifiants.push(`Stop à ${enATR.toFixed(1)} ATR : risque réel démesuré.`);
    } else if (enATR >= 1 && enATR <= 2.5) {
      ajouter(`Stop à ${enATR.toFixed(1)} ATR — dimensionné sur la volatilité`, 6);
    }

    // Sur-extension : un prix très loin de son EMA 20 revient presque
    // toujours la toucher avant de continuer. Entrer là, c'est payer le plus
    // haut du mouvement.
    if (ind.ema20 !== undefined) {
      const ecart = Math.abs(a.prix - ind.ema20) / ind.atr;
      if (ecart > 3) {
        disqualifiants.push(`Prix à ${ecart.toFixed(1)} ATR de l'EMA 20 : sur-extension, entrée tardive.`);
      } else if (ecart > 2) {
        ajouter(`Prix étiré à ${ecart.toFixed(1)} ATR de l'EMA 20`, -5, false);
      }
    }
  }

  // ──────────────────────────────────────────────────────────── le total ────
  const brut = criteres.reduce((s, c) => s + c.points, 0);
  const valeur = Math.max(0, Math.min(100, Math.round(brut)));

  return { valeur, criteres, disqualifiants };
}

/**
 * La raison d'entrée, rédigée à partir des seuls critères favorables.
 *
 * Pas de prose : une liste de faits, dans l'ordre de leur poids. C'est ce
 * qu'un trader relit six mois plus tard pour comprendre pourquoi il est entré,
 * et c'est ce qui permet de vérifier a posteriori quels critères tiennent
 * vraiment leurs promesses.
 */
export function redigerRaison(score: Score): string {
  return score.criteres
    .filter((c) => c.favorable && c.points > 0)
    .sort((a, b) => b.points - a.points)
    .map((c) => `${c.libelle} (+${c.points})`)
    .join(" · ");
}

/**
 * Estime la durée de vie du trade à partir de l'ATR et de la distance à TP2.
 *
 * Le raisonnement est simple et assumé comme approximatif : l'ATR d'une unité
 * donne le parcours moyen d'une bougie ; la distance divisée par l'ATR donne
 * un nombre de bougies ; multiplié par la durée d'une bougie, on obtient un
 * ordre de grandeur. On annonce une FOURCHETTE et jamais une heure précise —
 * une heure précise serait fausse, et une fourchette est utile.
 */
export function estimerDuree(
  a: AlerteValide,
  minutesParBougie: number,
): { texte: string; minutes: number } | null {
  const atr = a.indicateurs.atr;
  if (!atr || atr <= 0) return null;

  const cible = a.plan.tp2 ?? a.plan.tp1;
  const bougies = Math.abs(cible - a.plan.entree) / atr;
  if (!Number.isFinite(bougies) || bougies <= 0) return null;

  const minutes = Math.round(bougies * minutesParBougie);
  const bas = Math.max(1, Math.round(minutes * 0.6));
  const haut = Math.round(minutes * 1.8);

  const format = (m: number): string => {
    if (m < 60) return `${m} min`;
    if (m < 1440) {
      const h = Math.round(m / 60);
      return `${h} h`;
    }
    const j = Math.round(m / 1440);
    return `${j} j`;
  };

  return { texte: `${format(bas)} à ${format(haut)}`, minutes };
}
