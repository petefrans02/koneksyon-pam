/**
 * PARTIE 3 — La lecture avancée, le passage au trade, et la synthèse.
 */

import { figure, tendance } from "@/lib/trading/livre/dessins";
import { Chapitre, definition, exercices, note, piege, retenir, tableau } from "@/lib/trading/livre/livre";

// ══════════════════════════════════ 7. LECTURE AVANCÉE ═══

const avance: Chapitre = {
  n: 7,
  titre: "La lecture avancée",
  accroche:
    "Cesser de chercher des figures pour lire un rapport de force en continu. C'est ce qui sépare celui qui reconnaît des formes de celui qui comprend le marché.",
  niveau: "avance",
  sections: [
    {
      titre: "Lire la structure avant les bougies",
      html: `
<p>À partir d'ici, on inverse l'ordre. Le débutant regarde la bougie puis cherche le contexte. <strong>Le trader avancé lit la structure d'abord, et ne regarde les bougies qu'ensuite.</strong></p>

<p>La structure se lit avec quatre étiquettes, posées sur les sommets et les creux successifs :</p>

${tableau(
  ["Sigle", "Signification", "Ce que ça dit"],
  [
    ["HH", "Higher High — sommet plus haut", "Les acheteurs vont plus loin qu'avant"],
    ["HL", "Higher Low — creux plus haut", "Les vendeurs reculent moins loin qu'avant"],
    ["LH", "Lower High — sommet plus bas", "Les acheteurs vont moins loin"],
    ["LL", "Lower Low — creux plus bas", "Les vendeurs vont plus loin"],
  ],
)}

${definition(
  "Les trois états possibles",
  "<strong>Tendance haussière</strong> : succession de HH et de HL. <strong>Tendance baissière</strong> : succession de LH et de LL. <strong>Range</strong> : tout le reste — c'est-à-dire dès que la succession se brise.",
)}

<p>Deux événements changent l'état, et il faut absolument les distinguer :</p>

<ul>
  <li><strong>BOS — cassure de structure.</strong> Le prix clôture au-delà du dernier sommet (ou creux) <em>dans le sens de la tendance</em>. La tendance se poursuit, confirmée.</li>
  <li><strong>CHoCH — changement de caractère.</strong> Le prix clôture au-delà d'un niveau structurel <em>contre</em> la tendance. C'est le premier signe sérieux qu'elle pourrait s'inverser.</li>
</ul>

${figure(
  "Un changement de caractère",
  [
    ...tendance(6, 104, -0.9, 0.5, 71),
    { o: 98.6, h: 99, l: 97.4, c: 98.8 },
    { o: 98.8, h: 101.6, l: 98.6, c: 101.4, vedette: true },
    { o: 101.4, h: 102.2, l: 100.6, c: 101.8 },
  ],
  "La tendance était baissière — sommets et creux plus bas. La bougie mise en avant clôture au-dessus du dernier sommet significatif : c'est un CHoCH. Ce n'est pas encore une tendance haussière, mais la baisse n'est plus intacte. C'est le moment où l'on cesse de vendre les rebonds.",
  { hauteur: 240 },
)}

${piege(
  "La confusion la plus fréquente : appeler CHoCH n'importe quelle bougie verte dans une baisse. Il faut une <strong>clôture au-delà d'un creux ou d'un sommet structurel identifié</strong>. Sans niveau précis franchi en clôture, il n'y a rien de cassé.",
)}
`,
    },
    {
      titre: "Le momentum : ce que la taille des corps raconte",
      html: `
<p>Les bougies portent une information que les figures ignorent complètement : <strong>l'évolution de la force du mouvement</strong>. Elle se lit sur trois mesures.</p>

${tableau(
  ["Mesure", "Ce qu'on compare", "Ce qu'elle révèle"],
  [
    ["Corps moyen", "Les 8 dernières bougies contre les 8 précédentes", "La conviction augmente ou diminue"],
    ["Amplitude moyenne", "Idem", "L'agitation augmente ou diminue"],
    ["Distance nette parcourue", "Idem", "La <strong>progression réelle</strong>, une fois les allers-retours annulés"],
  ],
)}

<p>La troisième est la plus importante, et c'est celle que personne ne regarde. Voici pourquoi :</p>

${figure(
  "L'agitation sans progression",
  [
    { o: 100, h: 102.6, l: 99.8, c: 102.4 },
    { o: 102.4, h: 102.6, l: 99.6, c: 99.8 },
    { o: 99.8, h: 102.8, l: 99.6, c: 102.6 },
    { o: 102.6, h: 102.8, l: 99.8, c: 100 },
    { o: 100, h: 102.7, l: 99.7, c: 102.5 },
    { o: 102.5, h: 102.7, l: 99.9, c: 100.1 },
  ],
  "Six grandes bougies : les corps sont énormes, l'amplitude est forte. Un indicateur de volatilité crierait à l'accélération. Mais le prix termine exactement où il a commencé. Toute cette énergie n'a produit aucune progression — c'est un marché qui s'agite sans avancer, et c'est le pire endroit pour entrer.",
  { hauteur: 230 },
)}

${definition(
  "Expansion sans progression",
  "Quand les corps grandissent mais que la distance nette parcourue stagne, le marché <strong>consomme de l'énergie sans avancer</strong>. C'est typiquement ce qui précède une cassure violente — dans un sens ou dans l'autre, et rien ne dit lequel. La bonne réaction est d'attendre, pas de deviner.",
)}
`,
    },
    {
      titre: "Les mèches et la liquidité",
      html: `
<p>Voici la lecture qui manque à la plupart des traders de détail, et qui change la façon de voir un graphique.</p>

<p><strong>Plus un niveau est visible, plus il attire d'ordres — donc plus il concentre de stops au même endroit.</strong> Un support évident n'est pas seulement un endroit où acheter : c'est aussi un endroit où des centaines de personnes ont placé leur stop, quelques points en dessous.</p>

<p>Ces stops forment une réserve d'ordres. Et une réserve d'ordres, pour un acteur qui a besoin d'acheter beaucoup, c'est exactement ce qu'il cherche : quelqu'un qui vendra forcément.</p>

${figure(
  "Une prise de liquidité",
  [
    ...tendance(5, 100, -0.4, 0.4, 83),
    { o: 97.8, h: 98, l: 97.2, c: 97.6 },
    { o: 97.6, h: 97.8, l: 95.2, c: 97.5, vedette: true },
    { o: 97.5, h: 99.6, l: 97.4, c: 99.4 },
    { o: 99.4, h: 101.2, l: 99.2, c: 101 },
  ],
  "Le prix repose sur un support à 97,2 depuis plusieurs périodes. La bougie mise en avant plonge brutalement à 95,2 — sous le support — puis remonte intégralement dans la même période. Tous les stops placés sous 97,2 ont été déclenchés, fournissant les ventes dont quelqu'un avait besoin pour acheter en quantité. Et le prix repart à la hausse immédiatement.",
  { hauteur: 250, niveaux: [[97.2, "Support visible", "#c8960f"]] },
)}

${definition(
  "Comment le reconnaître",
  "Une longue mèche qui dépasse un niveau évident, suivie d'une clôture <strong>du bon côté du niveau</strong>, et d'une reprise franche. Ce n'est pas une cassure ratée par hasard : c'est le mécanisme normal d'un marché où les gros acteurs ont besoin de contreparties.",
)}

${retenir(
  "Quand vous voyez un support très évident, ne pensez pas seulement « je vais acheter là ». Pensez aussi : <strong>« tout le monde va mettre son stop juste en dessous, et ce paquet de stops est une cible »</strong>. C'est la raison pour laquelle un stop placé au ras d'un niveau évident est un mauvais stop.",
)}
`,
    },
    {
      titre: "La fausse cassure",
      html: `
<p>Prolongement direct : le prix franchit un niveau, on croit à la cassure, et il revient aussitôt. C'est l'un des pièges les plus coûteux du trading de détail.</p>

${figure(
  "Vraie cassure et fausse cassure",
  [
    ...tendance(4, 97, 0.5, 0.4, 91),
    { o: 99.4, h: 101.8, l: 99.2, c: 99.6, vedette: true },
    { o: 99.6, h: 99.9, l: 98.2, c: 98.4 },
    { o: 98.4, h: 100.8, l: 98.2, c: 100.6 },
    { o: 100.6, h: 102.4, l: 100.4, c: 102.2, vedette: true },
  ],
  "La première bougie mise en avant dépasse la résistance à 100 par sa mèche mais clôture en dessous : fausse cassure, le prix retombe. La seconde clôture nettement au-dessus : cassure véritable. La différence tient entièrement à l'emplacement de la clôture.",
  { hauteur: 250, niveaux: [[100, "Résistance", "#c8960f"]] },
)}

${tableau(
  ["Ce qui distingue une vraie cassure", "Ce qui signale une fausse"],
  [
    ["Clôture nette au-delà, pas au ras", "Mèche qui dépasse, clôture en deçà"],
    ["Grand corps dans le sens de la cassure", "Petit corps, longue mèche du côté franchi"],
    ["Le prix ne revient pas sous le niveau", "Retour immédiat de l'autre côté"],
    ["Le niveau franchi devient un support", "Le niveau repousse le prix une fois de plus"],
  ],
)}

${note(
  "La méthode la plus simple pour éviter les fausses cassures ne demande aucune analyse : <strong>attendre la clôture de la bougie</strong>. Elle vous fera rater quelques bonnes entrées et vous évitera la majorité des mauvaises. Le solde est très largement positif.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 7",
      html: exercices("Lecture en conditions réelles", [
        {
          n: 1,
          enonce:
            "Le prix évolue en LH et LL depuis vingt bougies. Une bougie clôture au-dessus du dernier LH. Que s'est-il passé, et que faites-vous ?",
          correction:
            "<strong>Un CHoCH</strong> — un changement de caractère. La série de sommets plus bas vient d'être brisée en clôture. La tendance baissière n'est plus intacte.<br><br><strong>Ce que vous faites :</strong> vous cessez de vendre les rebonds. C'est tout.<br><br><strong>Ce que vous ne faites pas :</strong> acheter immédiatement. Un CHoCH n'est pas une tendance haussière — c'est la fin de la certitude baissière. Pour acheter, il faut voir se former un creux plus haut, c'est-à-dire une vraie structure haussière. Beaucoup de CHoCH ne débouchent que sur un range.",
        },
        {
          n: 2,
          enonce:
            "Les corps des huit dernières bougies sont deux fois plus grands qu'avant, mais le prix est au même niveau qu'il y a huit bougies. Que concluez-vous ?",
          correction:
            "<strong>Expansion sans progression.</strong> Le marché dépense beaucoup d'énergie sans avancer : les deux camps sont engagés à parts égales et s'annulent.<br><br>C'est un état instable — il précède souvent une cassure violente. Mais rien n'indique dans quel sens, et c'est précisément le point : <strong>c'est le pire moment pour entrer, et le meilleur pour préparer les deux scénarios.</strong> Repérez les bornes de l'agitation et attendez qu'une clôture les franchisse.",
        },
        {
          n: 3,
          enonce:
            "Un support à 1,2000 tient depuis six bougies. Une bougie plonge à 1,1960 puis clôture à 1,2010. Que s'est-il probablement passé ?",
          correction:
            "<strong>Une prise de liquidité.</strong> Les stops accumulés sous 1,2000 ont été déclenchés, fournissant les ventes nécessaires à quelqu'un qui voulait acheter en quantité. Puis le prix est revenu au-dessus du support.<br><br>C'est souvent un signal haussier fort : le niveau a non seulement tenu, mais il a servi à évacuer les vendeurs faibles.<br><br><strong>La leçon pratique :</strong> si vous aviez acheté sur ce support avec un stop à 1,1990, vous auriez été sorti au plus bas — avant que le mouvement que vous aviez correctement anticipé ne se produise. Un stop au ras d'un niveau évident est un mauvais stop.",
        },
        {
          n: 4,
          enonce:
            "Vous hésitez entre entrer dès que la mèche dépasse le niveau, ou attendre la clôture. Que choisissez-vous, et que vous coûte ce choix ?",
          correction:
            "<strong>Attendre la clôture.</strong><br><br>Ce que ça coûte : vous entrerez à un prix moins bon, et vous raterez les mouvements qui partent sans jamais revenir.<br><br>Ce que ça rapporte : vous éliminez la majorité des fausses cassures, qui sont l'une des premières causes de perte du trader de détail.<br><br>Le solde est nettement positif — et surtout, il est <strong>mesurable</strong> : notez vos trades pendant un mois avec chaque méthode et comparez. C'est ce genre de question que le journal du chapitre suivant permet de trancher.",
        },
      ]),
    },
  ],
};

// ═══════════════════════════════ 8. DU SIGNAL AU TRADE ═══

const trader: Chapitre = {
  n: 8,
  titre: "Du signal au trade",
  accroche:
    "Le chapitre le plus important du livre, et celui que tout le monde saute. Savoir lire ne suffit pas : il faut survivre assez longtemps pour que la lecture paie.",
  niveau: "avance",
  sections: [
    {
      titre: "L'arithmétique qui décide de tout",
      html: `
<p>Avant toute considération technique, un calcul. Il s'applique à toute forme de trading, mais il est brutal en options à durée fixe.</p>

${definition(
  "Le seuil de rentabilité",
  "En option à durée fixe, le gain est plafonné au <em>payout</em> et la perte est totale. Le taux de réussite nécessaire pour ne rien perdre vaut <strong>100 ÷ (100 + payout)</strong>.",
)}

${tableau(
  ["Payout affiché", "Taux de réussite pour l'équilibre", "Ce que ça veut dire"],
  [
    ["92 %", "<strong>52,1 %</strong>", "Il faut gagner plus d'une fois sur deux, et un peu plus"],
    ["85 %", "<strong>54,1 %</strong>", ""],
    ["80 %", "<strong>55,6 %</strong>", "Presque six fois sur dix"],
    ["70 %", "<strong>58,8 %</strong>", "Au-delà du taux de réalisation moyen des figures"],
  ],
)}

<p>Relisez la dernière ligne. À 70 % de payout, il faut un taux de réussite de 58,8 % — <strong>c'est-à-dire le haut de la fourchette de ce que produisent les meilleures figures dans les meilleures conditions.</strong> Autrement dit : à ce payout, une lecture parfaite vous met tout juste à l'équilibre.</p>

${piege(
  "« Gagner plus d'une fois sur deux » ne suffit jamais en option à durée fixe. Un trader à 53 % de réussite est rentable à 92 % de payout et perdant à 80 %. <strong>Le taux de réussite ne veut rien dire sans le payout.</strong> Toute personne qui vous annonce un taux sans mentionner son payout vous donne un chiffre vide.",
)}
`,
    },
    {
      titre: "La taille de position, seule variable qui vous garde en vie",
      html: `
<p>En option à durée fixe, il n'y a ni stop ni sortie partielle. La seule chose que vous contrôlez est <strong>combien vous misez</strong>.</p>

<p>La règle standard, et elle n'a pas d'alternative sérieuse : <strong>1 à 2 % du capital par trade.</strong></p>

<p>Pourquoi si peu ? Le tableau suivant répond mieux que n'importe quel discours. Il montre la probabilité de subir une série de pertes consécutives, pour un trader à 60 % de réussite :</p>

${tableau(
  ["Série de pertes", "Probabilité sur une séquence", "À quelle fréquence ça arrive"],
  [
    ["3 d'affilée", "6,4 %", "Toutes les 16 séries environ"],
    ["5 d'affilée", "1,0 %", "Une fois sur 100"],
    ["7 d'affilée", "0,16 %", "Rare, mais certain sur une carrière"],
    ["10 d'affilée", "0,01 %", "Arrive à ceux qui tradent longtemps"],
  ],
)}

<p>Traduction : avec un excellent taux de 60 %, <strong>vous subirez des séries de sept pertes.</strong> Pas peut-être — vous en subirez. La seule question est de savoir dans quel état vous en sortirez.</p>

${tableau(
  ["Mise par trade", "Après 7 pertes consécutives", "Capital restant sur 1 000 $"],
  [
    ["2 %", "−13 %", "870 $ — vous continuez"],
    ["5 %", "−30 %", "700 $ — ça devient difficile"],
    ["10 %", "−52 %", "480 $ — il faut doubler pour revenir"],
    ["25 %", "−87 %", "133 $ — c'est fini"],
  ],
)}

${retenir(
  "Une bonne méthode mal dimensionnée ruine. Une méthode moyenne bien dimensionnée survit. <strong>La gestion du risque compte davantage que la qualité de la lecture</strong> — et c'est exactement l'inverse de ce que croient les débutants.",
)}
`,
    },
    {
      titre: "La martingale, et pourquoi elle vide les comptes",
      html: `
<p>Doubler la mise après chaque perte, pour que le prochain gain efface tout. L'idée séduit parce qu'elle paraît mathématiquement imparable : on finit toujours par gagner.</p>

<p>Voyons ce qu'elle exige réellement, en partant d'une mise de 10 $ :</p>

${tableau(
  ["Perte n°", "Mise requise", "Total engagé"],
  [
    ["1", "10 $", "10 $"],
    ["3", "40 $", "70 $"],
    ["5", "160 $", "310 $"],
    ["7", "640 $", "1 270 $"],
    ["9", "2 560 $", "5 110 $"],
  ],
)}

<p>Au septième échec — qui, on vient de le voir, <strong>arrive à tout le monde</strong> — il faut miser 640 $ pour récupérer 10 $ de gain net. Deux obstacles rendent ça impossible : votre capital, et le plafond de mise imposé par la plateforme.</p>

${definition(
  "L'erreur de raisonnement",
  "La martingale ne change pas votre taux de réussite. Elle ne fait qu'<strong>augmenter votre exposition au moment précis où vous traversez une série perdante</strong>. Elle transforme une séquence normale et inévitable en compte à zéro. Ce n'est pas une stratégie de récupération : c'est un pari sur le fait que la série s'arrêtera avant votre capital.",
)}
`,
    },
    {
      titre: "Le journal, seul juge de votre méthode",
      html: `
<p>Vous croirez savoir ce qui marche chez vous. Vous vous tromperez — la mémoire retient les gains éclatants et efface les pertes ordinaires. Le seul remède est de compter.</p>

<p>Notez, pour chaque trade : la date, l'actif, l'unité de temps, le sens, la durée choisie, la figure identifiée, le payout, et le résultat.</p>

<p>Puis, régulièrement, calculez votre taux de réussite <strong>par catégorie</strong> et comparez-le à votre seuil de rentabilité :</p>

<ul>
  <li>Par unité de temps — vos trades en M1 valent-ils vos trades en M15 ?</li>
  <li>Par durée d'expiration — les longues font-elles vraiment mieux que les courtes ?</li>
  <li>Par figure — laquelle marche <em>chez vous</em>, pas dans les livres ?</li>
  <li>Selon que les unités de temps étaient d'accord ou non</li>
</ul>

${piege(
  "Ne concluez rien avant <strong>trente trades minimum</strong> dans une catégorie. Sur vingt trades, un écart de quinze points entre deux méthodes s'explique parfaitement par le hasard. Le nombre de traders qui abandonnent une bonne méthode sur dix trades, puis adoptent une mauvaise pour la même raison, est considérable.",
)}

${retenir(
  "Un journal transforme une impression en fait — ou en doute. Sans lui, vous ajusterez votre méthode au gré de vos dernières émotions, ce qui revient à ne pas avoir de méthode du tout.",
)}
`,
    },
    {
      titre: "Le protocole en sept points",
      html: `
<p>Tout ce livre tient dans cette liste. Elle se parcourt avant chaque trade, dans l'ordre.</p>

<ol>
  <li><strong>Quelle est la structure sur l'unité supérieure ?</strong> Si je ne peux pas répondre, je n'entre pas.</li>
  <li><strong>Suis-je dans le sens de cette structure ?</strong> Sinon, il me faut un CHoCH confirmé, pas une figure.</li>
  <li><strong>Y a-t-il un niveau ?</strong> Une figure au milieu de nulle part ne repose sur rien.</li>
  <li><strong>La figure est-elle confirmée en clôture ?</strong> Pas une mèche. Une clôture.</li>
  <li><strong>Où aurais-je tort ?</strong> Si je ne peux pas nommer le prix qui invalide ma lecture, je n'ai pas d'analyse, j'ai un pari.</li>
  <li><strong>Combien je mise ?</strong> 1 à 2 %, quelle que soit ma confiance. Surtout quand elle est élevée.</li>
  <li><strong>Je le note.</strong> Avant de connaître le résultat.</li>
</ol>

${note(
  "Le point 5 est celui qui distingue une analyse d'un pari, et le point 6 est celui qui vous garde en vie. Le point 7 est celui qui vous fera progresser. Les figures des chapitres 3 à 5 ne servent qu'aux points 3 et 4.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 8",
      html: exercices("Les calculs qui comptent", [
        {
          n: 1,
          enonce:
            "Votre payout est de 85 %. Vous gagnez 54 trades sur 100. Êtes-vous rentable ?",
          correction:
            "<strong>Non, vous perdez — de très peu.</strong><br><br>Le seuil à 85 % de payout vaut 100 ÷ 185 = <strong>54,05 %</strong>. À 54 %, vous êtes juste en dessous.<br><br>Vérification sur 100 trades à 10 $ : 54 gains × 8,50 $ = 459 $ de gains ; 46 pertes × 10 $ = 460 $ de pertes. Résultat : −1 $.<br><br>C'est l'illustration exacte du piège : « gagner plus d'une fois sur deux » ne veut rien dire. La différence entre gagner et perdre se joue ici sur un dixième de point.",
        },
        {
          n: 2,
          enonce:
            "Vous avez 500 $. Vous misez 50 $ par trade parce que vous êtes très confiant. Que se passe-t-il après sept pertes consécutives ?",
          correction:
            "Sept pertes de 50 $ font <strong>350 $</strong>. Il vous reste 150 $ — <strong>70 % du capital envolé</strong>.<br><br>Et pour revenir à 500 $, il vous faut désormais multiplier votre capital par 3,3. À 92 % de payout, cela demande une série de gains bien plus longue que la série de pertes que vous venez de subir.<br><br>Rappel : sept pertes consécutives à 60 % de réussite ne sont pas de la malchance exceptionnelle. C'est un événement qui <em>arrive</em> sur une carrière. Le tout est d'y survivre.<br><br>À 2 % — soit 10 $ — les mêmes sept pertes vous coûtent 70 $ et vous continuez normalement.",
        },
        {
          n: 3,
          enonce:
            "Votre relevé montre 62 % de réussite sur les expirations longues et 47 % sur les courtes. Vous avez 18 trades dans chaque catégorie. Que concluez-vous ?",
          correction:
            "<strong>Rien du tout.</strong> Dix-huit trades par catégorie, c'est bien trop peu.<br><br>Sur 18 trades, 62 % représente 11 gains et 47 % en représente 8. Trois trades d'écart. Une pièce parfaitement équilibrée produit ce genre d'écart en permanence.<br><br>L'intuition est peut-être juste — les expirations longues laissent plus de temps à une lecture structurelle de se réaliser, il y a une vraie raison à ça. Mais <strong>vous avez pour l'instant une bonne théorie, pas une preuve</strong>. Continuez à noter, et reposez-vous la question à trente trades par catégorie.",
        },
        {
          n: 4,
          enonce:
            "Un ami vous propose son bot de signaux, payant, qui aurait 85 % de réussite. Quelles questions posez-vous ?",
          correction:
            "<strong>1. Sur combien de trades ?</strong> 85 % sur vingt trades ne veut rien dire.<br><br><strong>2. À quel payout ?</strong> Sans le payout, un taux de réussite est un chiffre vide.<br><br><strong>3. Puis-je voir le relevé complet, pertes comprises ?</strong> Un historique sans pertes est un historique filtré.<br><br><strong>4. Quelles durées d'expiration ?</strong> Sur 5 à 30 secondes, aucune analyse n'est possible : le résultat est décidé par le spread et le bruit.<br><br><strong>5. Comment gagne-t-il de l'argent ?</strong> Si c'est par commission d'affiliation sur un courtier, il est payé sur vos <em>pertes</em>.<br><br>Et le test qui tranche sans rien risquer : demandez-lui les vingt prochains signaux, notez-les <strong>sans miser</strong>, et comparez le taux réel à votre seuil de rentabilité.",
        },
      ]),
    },
  ],
};

// ═════════════════════════════════════ 9. SYNTHÈSE ═══

const synthese: Chapitre = {
  n: 9,
  titre: "Exercices de synthèse",
  accroche:
    "Douze situations complètes. Elles mélangent tous les chapitres — parce que le marché ne prévient pas de quelle leçon il s'agit.",
  niveau: "avance",
  sections: [
    {
      titre: "Douze cas",
      html: exercices("Lire, décider, justifier", [
        {
          n: 1,
          enonce:
            "Tendance haussière nette en H1. En M5, un avalement baissier se forme sur une résistance. Qu'est-ce que vous faites ?",
          correction:
            "<strong>Vous n'ouvrez pas de vente.</strong> Un avalement baissier en M5 dans une hausse H1 est une respiration, pas un retournement. La structure supérieure commande.<br><br>Ce que la figure vous apprend en revanche : le prix a du mal à passer cette résistance. Si vous étiez acheteur, c'est un signal de sortie ou de réduction. Et si le prix redescend chercher un support en formant un creux plus haut, c'est là que se trouve votre entrée — <strong>dans le sens de la H1</strong>.",
        },
        {
          n: 2,
          enonce:
            "Un marteau parfait, sur un support touché trois fois, en M15, avec une H1 également haussière. Payout 92 %. Que faites-vous ?",
          correction:
            "<strong>C'est le meilleur cas de figure du livre</strong> : structure alignée, niveau solide, figure claire, unité de temps correcte.<br><br>Mais vous n'entrez pas encore : vous attendez la <strong>confirmation en clôture</strong> au-dessus du haut du marteau. Sans elle, la baisse reprend environ quatre fois sur dix.<br><br>Puis : mise de 1 à 2 %, jamais plus, malgré la qualité de la configuration. C'est précisément quand tout semble parfait qu'on est tenté de doubler — et c'est ainsi qu'on perd d'un coup ce qu'on a mis un mois à gagner. Notez le trade avant de connaître le résultat.",
        },
        {
          n: 3,
          enonce:
            "Le prix casse une résistance majeure avec une grande bougie verte, puis les trois bougies suivantes sont de petites toupies au-dessus du niveau. Bon ou mauvais signe ?",
          correction:
            "<strong>Bon signe.</strong> Après une cassure, ce qu'il faut craindre est un retour immédiat sous le niveau — la fausse cassure.<br><br>Ici, le prix <em>tient</em> au-dessus. Les toupies indiquent une pause, pas un rejet : personne ne parvient à ramener le prix sous l'ancienne résistance. Ce niveau est en train de devenir un support, ce qui est exactement le comportement attendu d'une cassure véritable.<br><br>Le signal d'alerte serait une clôture repassant sous le niveau.",
        },
        {
          n: 4,
          enonce:
            "Vous repérez une étoile du soir irréprochable. Mais c'est samedi, sur un actif OTC. Que vaut la figure ?",
          correction:
            "<strong>Beaucoup moins qu'elle n'en a l'air.</strong> Les prix OTC ne viennent d'aucun marché : c'est le courtier qui les cote, avec un générateur qui imite le comportement d'un marché.<br><br>La forme apparaît, mais la <em>raison</em> pour laquelle une étoile du soir signifie quelque chose — des acheteurs réels qui s'épuisent, des vendeurs réels qui prennent le relais — n'existe pas. Vous lisez la sortie d'un algorithme, pas un rapport de force.<br><br>Ce n'est pas une raison de ne pas trader, c'est une raison de ne pas confondre les deux et de ne pas transposer un taux de réussite obtenu sur le marché réel.",
        },
        {
          n: 5,
          enonce:
            "Votre analyse dit ACHAT. Le prix baisse aussitôt et vous perdez. Le lendemain, configuration identique. Que faites-vous ?",
          correction:
            "<strong>Vous prenez le trade</strong> — si la configuration est réellement identique et que votre méthode est validée par un historique suffisant.<br><br>Avec un taux de 60 %, perdre est parfaitement normal quatre fois sur dix. Refuser la configuration suivante parce que la précédente a échoué revient à laisser le hasard piloter votre méthode.<br><br>La seule chose qui justifierait de ne pas entrer : avoir découvert, en analysant l'échec, que vous aviez raté un élément — une structure supérieure contraire, un niveau inexistant. Auquel cas ce n'est pas la même configuration.",
        },
        {
          n: 6,
          enonce:
            "En M1, huit bougies vertes consécutives, dont les corps rétrécissent régulièrement. Que lisez-vous ?",
          correction:
            "<strong>Un essoufflement.</strong> La hausse continue, mais elle coûte de plus en plus cher : chaque période produit moins de progression que la précédente.<br><br>Ce n'est pas encore un signal de vente — un marché essoufflé peut entrer en range plutôt que se retourner. Mais c'est un signal <strong>de non-achat</strong> : entrer maintenant, c'est acheter la fin d'un mouvement, avec un objectif de plus en plus proche et un risque de plus en plus grand.",
        },
        {
          n: 7,
          enonce:
            "Vous êtes en M5. La M1 dit achat, la M15 dit vente, la H1 est en range. Que faites-vous ?",
          correction:
            "<strong>Rien.</strong> Les échelles se contredisent.<br><br>Ce n'est pas un signal faible qu'il faudrait jouer petit — c'est une <strong>absence de signal</strong>. Quand les unités de temps divergent, la probabilité retombe vers 50 %, et à 50 % aucun payout ne vous rend gagnant.<br><br>La discipline la plus rentable du trading consiste à ne pas entrer quand rien n'est clair. Elle est aussi la plus difficile : ne rien faire ne procure aucune satisfaction.",
        },
        {
          n: 8,
          enonce:
            "Un support à 1,3000 tient depuis dix bougies. Où placez-vous votre invalidation, et pourquoi pas juste en dessous ?",
          correction:
            "<strong>Nettement en dessous, pas au ras.</strong><br><br>Parce que tous ceux qui achètent ce support évident placent leur stop juste sous 1,3000. Ce paquet de stops constitue une réserve de ventes — exactement ce que cherche un acteur qui veut acheter en quantité.<br><br>Il est donc probable que le prix aille les chercher avant de repartir. Un stop à 1,2990 vous fera sortir au plus bas, juste avant le mouvement que vous aviez correctement anticipé.<br><br>Placez l'invalidation là où le scénario est <em>réellement</em> mort — sous le creux structurel — et ajustez la taille de position en conséquence.",
        },
        {
          n: 9,
          enonce:
            "Payout 78 %. Votre taux de réussite mesuré sur 80 trades est de 56 %. Continuez-vous ?",
          correction:
            "<strong>Oui, mais de justesse.</strong> Le seuil à 78 % vaut 100 ÷ 178 = <strong>56,2 %</strong>. À 56 %, vous êtes juste en dessous de l'équilibre.<br><br>Sur 80 trades, la marge d'erreur est d'environ ±11 points : votre taux réel se situe quelque part entre 45 % et 67 %. Vous ne savez pas encore si vous êtes rentable.<br><br><strong>Le levier le plus rapide n'est pas d'améliorer votre lecture, c'est de trouver un meilleur payout.</strong> Passer de 78 % à 92 % fait tomber votre seuil de 56,2 % à 52,1 % — quatre points gagnés sans changer une seule chose à votre analyse.",
        },
        {
          n: 10,
          enonce:
            "Une bougie dépasse une résistance par sa mèche mais clôture en dessous. La bougie suivante clôture nettement au-dessus. Cassure ou non ?",
          correction:
            "<strong>Cassure, à partir de la seconde bougie.</strong><br><br>La première était un rejet : le niveau a été testé et défendu. La seconde est une vraie cassure : la clôture est au-delà.<br><br>La séquence est même plutôt favorable. Le premier test a probablement déclenché les stops des vendeurs placés au-dessus de la résistance, ce qui a nettoyé le terrain. La cassure qui suit rencontre moins de résistance.<br><br>Attention toutefois : après une cassure, le retour au niveau est fréquent. Entrer au plus haut de la bougie de cassure vous expose à ce retour.",
        },
        {
          n: 11,
          enonce:
            "Vous avez 200 $ et vous voulez atteindre 1 000 $. Quelle mise choisissez-vous ?",
          correction:
            "<strong>2 à 4 $ par trade.</strong> Et la vraie réponse est que la question est mal posée.<br><br>Avec 200 $ et une mise de 2 %, un objectif de 1 000 $ demande de multiplier le capital par cinq — soit, à 92 % de payout et 60 % de réussite, plusieurs centaines de trades. C'est long, et c'est la <em>seule</em> voie qui ne finit pas à zéro.<br><br>La tentation est de miser 20 ou 40 $ pour aller plus vite. Refaites le calcul : sept pertes consécutives à 40 $ font 280 $ — <strong>plus que votre capital entier</strong>. Vous n'atteindrez jamais 1 000 $, vous atteindrez 0 avant.<br><br>Un objectif en dollars n'est pas un plan. Le plan, c'est la mise et la méthode ; le montant en est la conséquence.",
        },
        {
          n: 12,
          enonce:
            "Résumez en une phrase ce qui distingue quelqu'un qui reconnaît des figures de quelqu'un qui sait lire un marché.",
          correction:
            "<strong>Celui qui reconnaît des figures demande « qu'est-ce que c'est ? ». Celui qui lit le marché demande « où est-ce, et qui est coincé ? ».</strong><br><br>Le premier voit un marteau et achète. Le second voit un marteau, vérifie la structure de l'unité supérieure, regarde s'il tombe sur un niveau qui a déjà servi, attend la confirmation en clôture, nomme le prix qui l'invaliderait, calcule sa mise, et note le trade avant d'en connaître l'issue.<br><br>La même bougie. Deux métiers différents.",
        },
      ]),
    },
    {
      titre: "Pour aller plus loin",
      html: `
<p>Ce livre vous a donné la lecture. Il vous manque la <strong>répétition</strong> et la <strong>mesure</strong> — les deux seules choses qui transforment une connaissance en compétence.</p>

<ul>
  <li><strong>Les exercices sur graphiques générés</strong> — voir des centaines de configurations, avec la réponse à chaque fois. Reconnaître une figure doit devenir instantané.</li>
  <li><strong>L'étude bougie par bougie</strong> — prendre une capture de votre propre marché et faire commenter chaque bougie, une par une. C'est l'exercice qui fait le plus progresser, parce qu'il porte sur ce que vous voyez vraiment.</li>
  <li><strong>Le relevé</strong> — noter chaque trade et calculer votre taux réel par catégorie. C'est le seul juge.</li>
</ul>

${retenir(
  "Si vous ne deviez retenir qu'une chose de ce livre : <strong>une figure ne vaut rien sans son contexte, et une méthode ne vaut rien sans une taille de position qui vous permet d'y survivre.</strong> Tout le reste est du détail utile.",
)}
`,
    },
  ],
};

export const partie3: Chapitre[] = [avance, trader, synthese];
