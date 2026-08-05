/**
 * PARTIE 2 — Les combinaisons, et le contexte qui décide de tout.
 */

import { figure, tendance } from "@/lib/trading/livre/dessins";
import { Chapitre, definition, exercices, note, piege, retenir, tableau } from "@/lib/trading/livre/livre";

const baisse = tendance(6, 100, -0.8, 0.5, 31);
const hausse = tendance(6, 100, 0.8, 0.5, 41);

// ════════════════════════════════════ 4. DEUX BOUGIES ═══

const deux: Chapitre = {
  n: 4,
  titre: "Les figures à deux bougies",
  accroche:
    "Une bougie décrit une bataille. Deux bougies décrivent un renversement de situation — c'est là que la lecture devient utile.",
  niveau: "intermediaire",
  sections: [
    {
      titre: "L'avalement — la figure la plus fiable du répertoire",
      html: `
<p>Une petite bougie, puis une grande de couleur opposée dont le corps <strong>englobe entièrement</strong> celui de la précédente. « Englober » porte sur les corps, pas sur les mèches.</p>

${figure(
  "Avalement haussier, après une baisse",
  [...baisse, { o: 95.4, h: 95.6, l: 94.6, c: 94.8 }, { o: 94.6, h: 98.4, l: 94.5, c: 98.2, vedette: true }],
  "La première bougie prolonge la baisse — petit corps rouge, les vendeurs avancent encore mais faiblement. La seconde ouvre encore plus bas, ce qui semble confirmer… puis les acheteurs prennent le contrôle et clôturent au-dessus de l'ouverture de la bougie précédente. Tout le terrain de la période précédente est repris en une seule période.",
  { hauteur: 240 },
)}

${definition(
  "Pourquoi ça marche",
  "Ce n'est pas la forme qui compte, c'est ce qu'elle implique. Tous ceux qui ont vendu pendant la période précédente sont désormais <strong>en perte</strong>. Quand ils voudront sortir, ils devront racheter — et ces rachats poussent le prix vers le haut. La figure ne prédit pas le futur : elle crée une <em>situation</em> où des acteurs sont contraints d'agir dans un sens.",
)}

<p>Ce qui distingue un bon avalement d'un avalement ordinaire :</p>

${tableau(
  ["Critère", "Pourquoi ça compte"],
  [
    ["La seconde bougie a un grand corps", "Plus le corps est grand, plus il y a de perdants coincés"],
    ["Elle clôture nettement au-delà, pas de justesse", "Une clôture au ras du corps précédent ne coince personne"],
    ["La figure tombe sur un niveau connu", "Le niveau donne une raison d'intervenir aux acheteurs"],
    ["La tendance qui précède est nette", "Sans tendance à retourner, il n'y a rien à avaler"],
  ],
)}

${piege(
  "L'avalement en unité très courte, au milieu d'un range, est du bruit pur. On en trouve dix par heure sur un graphique d'une minute. Ce qui fait la valeur de la figure, ce sont les <strong>vendeurs coincés</strong> — s'il n'y avait presque personne dans la première bougie, personne n'est coincé, et la figure ne pèse rien.",
)}
`,
    },
    {
      titre: "Le harami — l'essoufflement",
      html: `
<p>L'inverse de l'avalement : une grande bougie, puis une petite <strong>entièrement contenue</strong> dans le corps de la précédente. <em>Harami</em> signifie « enceinte » en japonais — la grande bougie porte la petite.</p>

${figure(
  "Harami baissier, après une hausse",
  [...hausse, { o: 100.2, h: 104.4, l: 100, c: 104.2 }, { o: 102.6, h: 103.2, l: 102.1, c: 102.4, vedette: true }],
  "Une grande bougie verte prolonge la hausse. Puis, brutalement, plus rien : la période suivante tient tout entière à l'intérieur de la précédente. Les acheteurs qui poussaient si fort ont disparu du jour au lendemain.",
  { hauteur: 240 },
)}

<p><strong>Ce que ça dit :</strong> le mouvement s'est arrêté net. Ce n'est pas un retournement — c'est un <em>arrêt</em>. La différence est importante et souvent mal comprise.</p>

${note(
  "Le harami est un signal d'essoufflement, pas d'inversion. Après un harami, trois choses peuvent arriver : la tendance reprend, le prix entre en range, ou il se retourne. La figure ne dit pas laquelle. Elle dit seulement que <strong>la poussée est finie</strong>. Sortir d'une position sur un harami est souvent judicieux ; en ouvrir une dans le sens inverse est prématuré.",
)}
`,
    },
    {
      titre: "La pénétrante et le nuage noir",
      html: `
<p>Deux figures symétriques, plus faibles que l'avalement mais construites sur la même logique : une bougie qui reprend une <strong>partie</strong> du terrain de la précédente.</p>

<div class="paire">
${figure("Pénétrante", [{ o: 100, h: 100.2, l: 96, c: 96.2 }, { o: 95.6, h: 98.6, l: 95.4, c: 98.4 }], "Après une baisse : la seconde bougie ouvre plus bas puis remonte au-delà de la moitié du corps rouge précédent.", { largeur: 250, hauteur: 220 })}
${figure("Nuage noir", [{ o: 96.2, h: 100.2, l: 96, c: 100 }, { o: 100.6, h: 100.8, l: 97.4, c: 97.6 }], "Après une hausse : la seconde ouvre plus haut puis retombe sous la moitié du corps vert.", { largeur: 250, hauteur: 220 })}
</div>

${definition(
  "La règle de la moitié",
  "Ces figures ne valent que si la seconde bougie dépasse <strong>la moitié du corps</strong> de la première. En dessous, ce n'est qu'une correction ordinaire. Plus la pénétration est profonde, plus le signal est fort — et à 100 %, ce n'est plus une pénétrante, c'est un avalement.",
)}
`,
    },
    {
      titre: "Les pinces — le même niveau, deux fois",
      html: `
<p>Deux bougies dont les extrêmes s'arrêtent au <strong>même prix</strong>, à très peu près. En bas, on parle de pinces basses ; en haut, de pinces hautes.</p>

${figure(
  "Pinces basses",
  [...baisse, { o: 95.6, h: 95.8, l: 93.8, c: 94.2 }, { o: 94.2, h: 96.4, l: 93.8, c: 96.2, vedette: true }],
  "Deux périodes de suite, le prix descend exactement au même niveau — 93,8 — et remonte. Ce n'est plus un hasard : quelqu'un défend ce prix.",
  { hauteur: 240 },
)}

<p>La force de cette figure est qu'elle <strong>crée un niveau sous vos yeux</strong>. Vous ne le déduisez pas de l'histoire ancienne : vous le voyez se former deux fois de suite. Et vous avez immédiatement l'endroit où vous auriez tort — sous ce prix.</p>

${retenir(
  "Les figures à deux bougies partagent une même mécanique : elles <strong>créent des perdants coincés</strong> ou <strong>révèlent un niveau défendu</strong>. C'est ce qui produit l'effet, pas la forme. Quand vous voyez une figure, cherchez toujours qui est coincé, et à quel prix.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 4",
      html: exercices("Comprendre la mécanique", [
        {
          n: 1,
          enonce:
            "Un avalement haussier apparaît. Expliquez, sans employer le mot « signal », pourquoi le prix a tendance à monter ensuite.",
          correction:
            "Parce que tous ceux qui ont vendu pendant la période précédente sont maintenant en perte. Leur position leur coûte de l'argent, et la seule façon de la refermer est de <strong>racheter</strong>. Ces rachats forcés constituent une demande mécanique.<br><br>S'y ajoutent les acheteurs qui voient la figure et entrent. Mais le moteur principal, ce sont les vendeurs piégés : la figure ne prédit rien, elle crée une situation où certains acteurs <em>doivent</em> agir dans un sens.",
        },
        {
          n: 2,
          enonce:
            "Un avalement haussier apparaît, mais la première bougie était minuscule — presque un doji. La figure est-elle valable ?",
          correction:
            "<strong>Techniquement oui, pratiquement non.</strong> La définition est respectée. Mais si la première bougie était minuscule, très peu de gens ont vendu pendant cette période — donc presque personne n'est coincé, et le moteur de la figure est absent.<br><br>C'est le cas typique de la figure « valide » et inutile. Un avalement vaut par la quantité de perdants qu'il crée, pas par sa géométrie.",
        },
        {
          n: 3,
          enonce:
            "Vous êtes acheteur depuis trois périodes. Un harami baissier se forme. Que faites-vous, et que ne faites-vous pas ?",
          correction:
            "<strong>Ce que vous faites :</strong> vous envisagez de sortir, ou au moins de réduire. Le harami dit que la poussée qui portait votre position est terminée.<br><br><strong>Ce que vous ne faites pas :</strong> vous retourner à la vente. Un harami signale un arrêt, pas une inversion. Après un harami, la tendance peut reprendre, le prix peut entrer en range, ou se retourner — la figure ne dit pas laquelle des trois. Vendre sur un harami, c'est parier sur un scénario que la figure n'annonce pas.",
        },
        {
          n: 4,
          enonce:
            "Une pénétrante se forme, mais la seconde bougie ne remonte qu'à 30 % du corps de la première. Que concluez-vous ?",
          correction:
            "Que ce n'est <strong>pas une pénétrante</strong>. La règle exige de dépasser la moitié du corps précédent. À 30 %, c'est une correction ordinaire — le genre de rebond qu'on observe en permanence à l'intérieur d'une tendance baissière, sans qu'il annonce quoi que ce soit.<br><br>Le seuil de la moitié n'est pas arbitraire : en dessous, les vendeurs de la première bougie sont toujours largement gagnants et n'ont aucune raison de racheter.",
        },
      ]),
    },
  ],
};

// ══════════════════════════════════ 5. TROIS BOUGIES ═══

const trois: Chapitre = {
  n: 5,
  titre: "Les figures à trois bougies",
  accroche:
    "Trois périodes suffisent à raconter un retournement complet : la poussée, l'hésitation, la réponse.",
  niveau: "intermediaire",
  sections: [
    {
      titre: "L'étoile du matin et l'étoile du soir",
      html: `
<p>La figure de retournement la plus complète du répertoire, et l'une des plus fiables. Elle se lit comme un récit en trois temps.</p>

${figure(
  "Étoile du matin",
  [
    ...baisse,
    { o: 95.6, h: 95.8, l: 93.2, c: 93.4, vedette: true },
    { o: 93.1, h: 93.4, l: 92.6, c: 92.9, vedette: true },
    { o: 93.2, h: 96.2, l: 93, c: 96, vedette: true },
  ],
  "Acte I : une grande bougie rouge, la baisse continue avec conviction. Acte II : une toute petite bougie, plus bas encore — les vendeurs ont poussé, mais ils n'avancent presque plus. C'est l'hésitation. Acte III : une grande bougie verte qui remonte dans le corps du premier acte. Les acheteurs répondent, et ils répondent fort.",
  { hauteur: 250 },
)}

<p>L'étoile du soir est le miroir exact, après une hausse : grande verte, petite indécise, grande rouge.</p>

${definition(
  "Pourquoi trois bougies valent mieux que deux",
  "Parce que la figure contient l'<strong>hésitation</strong>. Un avalement montre un renversement brutal, qui peut n'être qu'une réaction ponctuelle. L'étoile montre la séquence complète : la force qui s'épuise, le point mort, puis la force adverse qui prend le relais. C'est un processus, pas un accident — et un processus est plus difficile à produire par hasard.",
)}

<p>Ce qui renforce une étoile :</p>
<ul>
  <li>La troisième bougie remonte <strong>au-delà de la moitié</strong> du corps de la première</li>
  <li>La bougie du milieu est vraiment petite — plus elle est petite, plus le point mort est net</li>
  <li>L'ensemble tombe sur un niveau déjà respecté</li>
  <li>Le volume augmente sur la troisième bougie</li>
</ul>
`,
    },
    {
      titre: "Trois soldats blancs, trois corbeaux noirs",
      html: `
<p>Trois bougies consécutives de même couleur, à grands corps, chacune clôturant au-delà de la précédente.</p>

<div class="paire">
${figure("Trois soldats blancs", [{ o: 96, h: 98.2, l: 95.8, c: 98 }, { o: 97.9, h: 100.3, l: 97.8, c: 100.1 }, { o: 100, h: 102.4, l: 99.9, c: 102.2 }], "Trois périodes de domination acheteuse ininterrompue.", { largeur: 250, hauteur: 220 })}
${figure("Trois corbeaux noirs", [{ o: 102.2, h: 102.4, l: 99.9, c: 100 }, { o: 100.1, h: 100.3, l: 97.8, c: 97.9 }, { o: 98, h: 98.2, l: 95.8, c: 96 }], "Le miroir : trois périodes de domination vendeuse.", { largeur: 250, hauteur: 220 })}
</div>

<p>C'est une figure de <strong>continuation</strong> quand elle démarre un mouvement, et un signal d'<strong>épuisement</strong> quand elle le termine. Encore une fois, la position décide.</p>

${piege(
  "Trois soldats blancs apparaissant <em>après</em> une longue hausse sont un avertissement, pas une invitation. C'est souvent la phase où les derniers entrants se précipitent — et une fois qu'ils sont entrés, il n'y a plus personne pour acheter. Le signe qui doit alerter : des corps qui <strong>rétrécissent</strong> d'un soldat à l'autre, ou des mèches hautes qui s'allongent. La poussée reste visible, mais elle coûte de plus en plus cher.",
)}
`,
    },
    {
      titre: "Les méthodes ascendantes et descendantes",
      html: `
<p>Une grande bougie, puis deux ou trois petites de couleur opposée qui restent <strong>dans son amplitude</strong>, puis une nouvelle grande dans le sens de la première.</p>

${figure(
  "Trois méthodes ascendantes",
  [
    { o: 96, h: 101.2, l: 95.8, c: 101 },
    { o: 100.6, h: 100.8, l: 99.4, c: 99.6 },
    { o: 99.8, h: 100.2, l: 98.6, c: 98.8 },
    { o: 99, h: 99.4, l: 98.2, c: 99.2 },
    { o: 99.4, h: 103.2, l: 99.2, c: 103, vedette: true },
  ],
  "Une forte poussée, puis trois périodes de respiration qui ne cassent jamais le plus bas de la grande bougie, puis la reprise au-delà du sommet précédent. C'est la figure de continuation la plus lisible.",
  { hauteur: 240 },
)}

${definition(
  "Ce que raconte cette figure",
  "Une prise de bénéfices ordinaire, pas un retournement. Les petites bougies montrent que ceux qui vendent sont ceux qui encaissent leur gain, <strong>pas des vendeurs convaincus</strong> — sinon le prix casserait le plus bas de la grande bougie. Quand la reprise arrive, elle confirme que les acheteurs étaient toujours là.",
)}

<p><strong>Condition indispensable :</strong> les petites bougies ne doivent jamais clôturer sous le plus bas de la grande. Si elles le font, ce n'est plus une respiration, c'est un vrai retournement — et la figure est annulée.</p>
`,
    },
    {
      titre: "Le récapitulatif des figures",
      html: `
${tableau(
  ["Figure", "Bougies", "Ce qu'elle annonce", "Sa force"],
  [
    ["Marubozu", "1", "Conviction, continuation à court terme", "Moyenne"],
    ["Doji", "1", "Équilibre des forces modifié", "Faible seul, forte sur un niveau"],
    ["Marteau / Pendu", "1", "Rejet d'un extrême", "Moyenne, forte avec confirmation"],
    ["Étoile filante", "1", "Rejet du haut après hausse", "Moyenne à forte"],
    ["Toupie", "1", "Hésitation", "Faible seule, forte en série"],
    ["<strong>Avalement</strong>", "2", "Retournement, perdants coincés", "<strong>Forte</strong>"],
    ["Harami", "2", "Arrêt du mouvement", "Moyenne"],
    ["Pénétrante / Nuage noir", "2", "Retournement partiel", "Moyenne"],
    ["Pinces", "2", "Niveau défendu deux fois", "Moyenne à forte"],
    ["<strong>Étoile du matin / soir</strong>", "3", "Retournement complet", "<strong>Forte</strong>"],
    ["Trois soldats / corbeaux", "3", "Continuation, ou épuisement en fin de mouvement", "Variable"],
    ["Trois méthodes", "3-5", "Continuation après respiration", "Moyenne à forte"],
  ],
)}

${retenir(
  "Ce tableau est le moins important du livre, et c'est celui que tout le monde photographie. Aucune de ces figures ne vaut quoi que ce soit sans le chapitre suivant — celui qui explique <strong>pourquoi elles échouent</strong>.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 5",
      html: exercices("Trois temps, trois lectures", [
        {
          n: 1,
          enonce:
            "Racontez une étoile du soir comme une scène, en trois actes, sans employer de vocabulaire technique.",
          correction:
            "<strong>Acte I</strong> — les acheteurs poussent fort et gagnent beaucoup de terrain : grande bougie verte.<br><strong>Acte II</strong> — la période suivante, plus personne n'avance vraiment. Le prix monte encore un peu mais la bougie est minuscule : la poussée n'a plus de force.<br><strong>Acte III</strong> — les vendeurs entrent et reprennent une bonne partie du terrain conquis à l'acte I.<br><br>La force de la figure tient à l'acte II : sans l'hésitation, on aurait un simple renversement brutal, qui peut n'être qu'une réaction ponctuelle. Avec elle, on voit le <em>processus</em> d'épuisement.",
        },
        {
          n: 2,
          enonce:
            "Vous voyez trois soldats blancs. Quelle observation supplémentaire décide si c'est une continuation ou un épuisement ?",
          correction:
            "<strong>Ce qui précède</strong>, d'abord : trois soldats après un range ou une baisse démarrent un mouvement ; après une longue hausse, ils la terminent souvent.<br><br><strong>La forme des trois soldats</strong>, ensuite : si les corps rétrécissent d'une bougie à l'autre, ou si les mèches hautes s'allongent, la poussée coûte de plus en plus cher pour un résultat décroissant. C'est le signe d'un climax, pas d'une continuation.",
        },
        {
          n: 3,
          enonce:
            "Dans une figure de trois méthodes ascendantes, l'une des petites bougies clôture sous le plus bas de la grande bougie initiale. Que se passe-t-il ?",
          correction:
            "<strong>La figure est annulée.</strong> La condition est explicite : les bougies de respiration doivent rester dans l'amplitude de la grande.<br><br>Et la raison compte plus que la règle : tant que le prix reste dans l'amplitude, les vendeurs sont des gens qui encaissent leur bénéfice. Dès qu'il casse le plus bas, ce sont des vendeurs convaincus qui prennent le dessus. Ce n'est plus une respiration, c'est un renversement.",
        },
      ]),
    },
  ],
};

// ═════════════════════════════════════════ 6. LE CONTEXTE ═══

const ctx: Chapitre = {
  n: 6,
  titre: "Pourquoi les figures échouent",
  accroche:
    "Le chapitre que les formations ne font pas. Une figure se réalise environ six fois sur dix — et les quatre autres fois ont des causes identifiables.",
  niveau: "intermediaire",
  sections: [
    {
      titre: "Le chiffre que personne ne vous donne",
      html: `
<p>Commençons par ce qui devrait figurer en première page de tout livre sur les bougies :</p>

${definition(
  "Le taux de réalisation",
  "Une figure de bougie bien identifiée, dans un contexte favorable, se réalise <strong>entre 55 % et 65 % du temps</strong> selon les études et les marchés. Pas 90 %. Pas « presque toujours ». Environ six fois sur dix.",
)}

<p>Ce chiffre change tout. Il signifie que <strong>quatre fois sur dix, vous aurez parfaitement lu et vous aurez tort.</strong> Ce n'est pas une erreur d'analyse : c'est la nature de l'exercice.</p>

<p>Deux conséquences directes, et elles sont plus importantes que toutes les figures des chapitres précédents :</p>

<ol>
  <li><strong>Aucun trade ne doit pouvoir vous faire mal.</strong> Si quatre pertes de suite vous mettent en difficulté, votre problème n'est pas votre lecture, c'est votre taille de position.</li>
  <li><strong>On ne juge pas une méthode sur dix trades.</strong> Avec un taux de 60 %, obtenir quatre pertes sur dix est parfaitement banal — et obtenir six gains sur dix par pur hasard l'est tout autant.</li>
</ol>

${piege(
  "Quand une formation vous montre uniquement des figures qui ont fonctionné, elle ne vous ment pas sur les images : elle a simplement gardé les six sur dix qui marchaient. C'est le biais de sélection le plus courant du secteur. Demandez toujours à voir les échecs — c'est là que se trouve tout ce qu'il y a à apprendre.",
)}
`,
    },
    {
      titre: "Cause d'échec n° 1 — la figure était contre la structure",
      html: `
<p>C'est de loin la première cause, et la plus coûteuse.</p>

${figure(
  "Un marteau parfait dans une tendance baissière",
  [
    ...tendance(8, 104, -0.9, 0.6, 53),
    { o: 96.4, h: 96.6, l: 93.4, c: 96.2, vedette: true },
    { o: 96.2, h: 97.2, l: 95.4, c: 95.6 },
    { o: 95.5, h: 95.7, l: 93.2, c: 93.4 },
    { o: 93.4, h: 93.6, l: 91.2, c: 91.4 },
  ],
  "Le marteau est irréprochable : petit corps en haut, longue mèche basse, il suit une baisse. Et pourtant la baisse reprend immédiatement. Pourquoi ? Parce que la structure de fond n'a jamais été cassée : après le marteau, le prix ne dépasse aucun sommet précédent. Le rebond n'était qu'une respiration.",
  { hauteur: 250 },
)}

${definition(
  "La règle qui évite la majorité des pertes",
  "Une figure haussière dans une tendance baissière est un <strong>rebond</strong>, pas un retournement — tant qu'aucun sommet plus haut n'est formé. Une figure baissière dans une tendance haussière est une <strong>respiration</strong>, pas un sommet — tant qu'aucun creux plus bas n'est cassé.",
)}

<p>Concrètement, avant toute figure, posez-vous une seule question : <strong>est-ce que je trade dans le sens de la structure, ou contre elle ?</strong> Si c'est contre, il vous faut beaucoup plus qu'une figure — il vous faut une cassure de structure confirmée.</p>
`,
    },
    {
      titre: "Cause d'échec n° 2 — la figure n'était nulle part",
      html: `
<p>Une figure a besoin d'un <strong>endroit</strong>. Un marteau qui tombe sur un support respecté trois fois n'a rien à voir avec un marteau au milieu de nulle part.</p>

<p>La raison est mécanique : sur un niveau connu, des acteurs ont des raisons d'agir. Certains y ont acheté et rachèteront volontiers au même prix. D'autres y ont vendu et voudront sortir à l'équilibre. Des ordres y sont posés d'avance. <strong>Le niveau existe parce que des gens ont une raison d'y agir.</strong></p>

<p>Au milieu de nulle part, personne n'a de raison particulière. La figure ne repose sur rien.</p>

${tableau(
  ["Un niveau vaut quelque chose si…", "Ce qui ne fait pas un niveau"],
  [
    ["Le prix y a réagi au moins deux fois", "Un point touché une seule fois"],
    ["Il est visible sur une unité de temps supérieure", "Un trait tracé pour justifier une entrée"],
    ["Il se lit comme une zone, pas comme un trait", "Un niveau qui exige une précision au centime"],
    ["Quelque chose s'y est visiblement produit", "Un chiffre rond sans réaction observée"],
  ],
)}

${note(
  "Un piège de méthode : avec assez de lignes tracées, on trouve toujours une explication après coup. Ne gardez que les niveaux que vous pouviez justifier <strong>avant</strong> que le prix n'y arrive.",
)}
`,
    },
    {
      titre: "Cause d'échec n° 3 — l'unité de temps était trop courte",
      html: `
<p>La même figure n'a pas le même poids selon l'échelle. Une étoile du soir en journalier résume les décisions de milliers d'acteurs sur une journée entière. Une étoile du soir en une minute peut résulter de trois ordres.</p>

${tableau(
  ["Unité de temps", "Ce qu'une figure y représente", "Fiabilité relative"],
  [
    ["1 minute", "Parfois un seul ordre un peu gros", "Très faible"],
    ["5 minutes", "Un mouvement de court terme", "Faible à moyenne"],
    ["15 minutes à 1 heure", "Une décision collective sur une séance", "Correcte"],
    ["4 heures à journalier", "Un consensus de marché", "Bonne"],
  ],
)}

${retenir(
  "Si vous tradez en une ou cinq minutes — ce que fait la plupart du monde en options à durée fixe — vous travaillez dans la zone où les figures sont les moins fiables. Ce n'est pas une raison d'arrêter, c'est une raison de <strong>toujours vérifier l'unité supérieure</strong>. Une figure en M1 qui va dans le sens de la H1 vaut infiniment mieux qu'une figure en M1 isolée.",
)}
`,
    },
    {
      titre: "Cause d'échec n° 4 — on a lu la mèche au lieu de la clôture",
      html: `
<p>C'est l'erreur technique la plus fréquente, et la plus facile à éliminer.</p>

${figure(
  "Une mèche qui dépasse n'est pas une cassure",
  [
    ...tendance(5, 96, 0.5, 0.4, 67),
    { o: 98.6, h: 101.4, l: 98.4, c: 98.8, vedette: true },
    { o: 98.8, h: 99.1, l: 97.2, c: 97.4 },
    { o: 97.4, h: 97.6, l: 95.8, c: 96 },
  ],
  "La mèche dépasse nettement la résistance à 100. Beaucoup y voient une cassure et achètent. Mais la clôture se fait à 98,8, sous le niveau : le prix est allé là-haut et il a été refusé. Ce n'est pas une cassure, c'est un rejet — exactement le contraire.",
  { hauteur: 240, niveaux: [[100, "Résistance", "#c8960f"]] },
)}

${definition(
  "La règle, en une phrase",
  "Une cassure exige une <strong>clôture</strong> au-delà du niveau. Une mèche qui dépasse et revient est un <strong>rejet</strong> — le niveau a été testé et défendu. Traiter les dépassements de mèche comme des cassures est l'une des façons les plus rapides d'accumuler des pertes.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 6",
      html: exercices("Diagnostiquer un échec", [
        {
          n: 1,
          enonce:
            "Vous prenez un avalement haussier parfaitement formé. Le prix baisse. Citez les quatre questions à vous poser dans l'ordre.",
          correction:
            "<strong>1. Étais-je dans le sens de la structure ?</strong> Si la tendance de fond était baissière, mon avalement n'était qu'un rebond — c'est la cause la plus probable.<br><br><strong>2. La figure tombait-elle sur un niveau ?</strong> Sans niveau, personne n'avait de raison d'intervenir.<br><br><strong>3. L'unité de temps était-elle suffisante ?</strong> En M1, la figure pèse très peu.<br><br><strong>4. Ai-je lu une clôture ou une mèche ?</strong><br><br>Et si les quatre réponses sont bonnes : <strong>vous n'avez rien fait de mal.</strong> C'est l'une des quatre fois sur dix. Ne changez rien à votre méthode sur un trade.",
        },
        {
          n: 2,
          enonce:
            "Une résistance à 1,0900. Une bougie monte à 1,0925 puis clôture à 1,0890. Le niveau est-il cassé ?",
          correction:
            "<strong>Non. C'est même le contraire.</strong> La clôture à 1,0890 se situe sous la résistance : le prix est allé la tester, et il a été repoussé.<br><br>Cette bougie est un argument <em>baissier</em>, pas haussier. Elle prouve que des vendeurs attendaient à ce niveau et qu'ils avaient les moyens de le défendre. Acheter la cassure ici, c'est acheter au moment précis où le niveau vient de démontrer sa solidité.",
        },
        {
          n: 3,
          enonce:
            "Votre méthode a un taux de réussite réel de 60 %. Vous enchaînez cinq pertes. Que faites-vous ?",
          correction:
            "<strong>Rien.</strong> Avec un taux de 60 %, la probabilité d'enchaîner cinq pertes consécutives est d'environ 1 %. C'est rare, mais sur cent séries de cinq trades, ça arrive une fois — et vous ferez bien plus de cent séries dans votre vie.<br><br>Changer de méthode après cinq pertes est l'erreur classique : on abandonne une méthode qui fonctionne à cause d'une séquence normale, puis on en essaie une autre, qu'on abandonnera pour la même raison. <strong>Une méthode se juge sur des dizaines de trades, pas sur cinq.</strong><br><br>La seule chose à vérifier après une série de pertes : que la taille de vos positions ne vous a pas mis en difficulté. Si c'est le cas, le problème n'est pas la méthode.",
        },
      ]),
    },
  ],
};

export const partie2: Chapitre[] = [deux, trois, ctx];
