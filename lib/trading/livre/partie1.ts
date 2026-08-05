/**
 * PARTIE 1 — L'histoire, les fondations, les bougies simples.
 */

import { figure, tendance } from "@/lib/trading/livre/dessins";
import { Chapitre, definition, exercices, note, piege, retenir, tableau } from "@/lib/trading/livre/livre";

// ═══════════════════════════════════════════════ 1. L'HISTOIRE ═══

const histoire: Chapitre = {
  n: 1,
  titre: "D'où viennent les bougies",
  accroche:
    "Trois siècles avant les écrans, un marchand de riz japonais a compris que le prix racontait une histoire. Rien d'essentiel n'a changé depuis.",
  niveau: "debutant",
  sections: [
    {
      titre: "Sakata, 1750 : le riz avant la bourse",
      html: `
<p>Au XVIII<sup>e</sup> siècle, le Japon possède ce qui est probablement le premier marché à terme organisé au monde. À Ōsaka, le <strong>Dōjima Rice Exchange</strong> ne négocie pas des sacs de riz : il négocie des <em>promesses</em> de riz — des récépissés d'entrepôt échangés bien avant la récolte. Un marché à terme, avec ses spéculateurs, ses paniques et ses euphories, cent cinquante ans avant Chicago.</p>

<p>C'est là qu'apparaît <strong>Munehisa Homma</strong> (1724-1803), héritier d'une riche famille de négociants de la région de Sakata. Homma fait une chose que personne ne fait alors : il <strong>note les prix, jour après jour, pendant des années</strong>. Il remonte les cotations sur plusieurs décennies. Et il cherche des régularités.</p>

<p>Sa découverte n'est pas une formule. Elle tient en une phrase, et elle est encore vraie aujourd'hui :</p>

${definition(
  "Ce que Homma a compris",
  "Le prix ne reflète pas seulement l'offre et la demande de riz. Il reflète ce que les gens <em>ressentent</em> à propos de l'offre et de la demande. La peur et l'avidité laissent des traces lisibles dans la façon dont le prix bouge.",
)}

<p>Homma écrit que « le marché psychologique » et « le marché réel » ne coïncident pas toujours — et que l'écart entre les deux est là où se gagne l'argent. Il aurait, dit-on, réalisé cent transactions gagnantes consécutives. La légende exagère probablement. Le principe, lui, tient.</p>

${note(
  "Homma disposait d'un avantage qu'aucun trader moderne n'a : un réseau d'hommes postés le long de la route entre Sakata et Ōsaka, se transmettant les prix par signaux de drapeaux. L'information avant tout le monde. Cette partie-là de sa méthode n'est plus reproductible.",
)}
`,
    },
    {
      titre: "Pourquoi une bougie plutôt qu'un point",
      html: `
<p>Avant les bougies, on notait un prix par période : celui de la clôture. Une ligne reliait les points. C'est encore ce que font les graphiques en courbe.</p>

<p>Le problème saute aux yeux dès qu'on y pense : <strong>deux journées qui finissent au même prix peuvent avoir été radicalement différentes.</strong> L'une calme, l'autre une bataille rangée avec un effondrement le matin et une reprise totale l'après-midi. Une courbe les confond. Une bougie les distingue.</p>

<p>La bougie retient quatre prix au lieu d'un : l'<strong>ouverture</strong>, le <strong>plus haut</strong>, le <strong>plus bas</strong>, la <strong>clôture</strong>. Et surtout, elle les dispose de façon à ce que l'œil lise instantanément qui a gagné la période.</p>

${figure(
  "La même clôture, deux journées opposées",
  [
    { o: 100, h: 100.6, l: 99.4, c: 100.2, note: "calme" },
    { o: 100, h: 100.8, l: 96.5, c: 100.2, note: "bataille" },
  ],
  "Les deux périodes ouvrent à 100 et ferment à 100,2. Un graphique en courbe les dessinerait identiques. La seconde a pourtant vu le prix chuter de trois points et demi avant que les acheteurs ne reprennent tout. C'est une information majeure, et elle n'existe que grâce à la mèche.",
)}
`,
    },
    {
      titre: "L'arrivée en Occident, deux siècles plus tard",
      html: `
<p>La technique reste japonaise pendant très longtemps. Les traders occidentaux utilisent des barres — mêmes données, présentation moins lisible. Les bougies existent dans les salles de marché de Tokyo, mais les ouvrages sont en japonais et personne ne traduit.</p>

<p>Le basculement date de <strong>1989-1991</strong>. Un analyste américain, <strong>Steve Nison</strong>, découvre la technique auprès d'un courtier japonais, s'attelle aux sources, et publie <em>Japanese Candlestick Charting Techniques</em>. Le livre fait l'effet d'une révélation : les mêmes données, mais soudain lisibles.</p>

<p>En quelques années, tous les logiciels de graphiques basculent. Aujourd'hui la bougie est l'affichage par défaut sur toutes les plateformes du monde — y compris celle que vous utilisez.</p>

${tableau(
  ["Époque", "Ce qui change", "Ce qui ne change pas"],
  [
    ["1750, Sakata", "Le riz, les drapeaux, les carnets manuscrits", "Le prix reflète la psychologie autant que l'offre"],
    ["1990, Wall Street", "Les écrans, la diffusion mondiale de la technique", "Un grand corps signifie toujours qu'un camp a dominé"],
    ["Aujourd'hui", "Les algorithmes, la microseconde, le trading de détail", "Une mèche longue signifie toujours un niveau refusé"],
  ],
)}
`,
    },
    {
      titre: "Ce que l'ère moderne a réellement changé",
      html: `
<p>Beaucoup de formations vous vendent les bougies comme un savoir intemporel et inaltéré. C'est à moitié faux, et la moitié fausse coûte cher. Quatre choses ont changé, et il faut les connaître.</p>

<h4>1. Les marchés ne dorment plus</h4>
<p>Sur le riz de Sakata, chaque bougie journalière représentait une vraie journée : ouverture, séance, clôture. La nuit séparait deux batailles distinctes. Le forex tourne vingt-quatre heures sur vingt-quatre et cinq jours sur sept : <strong>l'« ouverture » d'une bougie n'est que la clôture de la précédente.</strong> Les écarts d'ouverture, très signifiants à l'époque, ont pratiquement disparu du forex.</p>

<h4>2. Les unités de temps se sont effondrées</h4>
<p>Homma lisait des bougies journalières. Vous lisez des bougies d'une minute. Ce n'est pas la même chose du tout : une bougie journalière résume les décisions de milliers d'acteurs sur des heures ; une bougie d'une minute peut n'être que le passage d'un seul ordre un peu gros. <strong>Plus l'unité de temps est courte, plus le bruit domine le signal.</strong></p>

<h4>3. Tout le monde voit la même chose</h4>
<p>L'avantage de Homma venait de son information privée. Aujourd'hui, votre marteau sur le support, dix millions de personnes le voient aussi — et des programmes le détectent avant vous. Une figure connue de tous ne peut plus être un avantage <em>en soi</em>. Elle reste un <strong>outil de lecture</strong>, ce qui est différent.</p>

<h4>4. Les actifs synthétiques</h4>
<p>Certains courtiers proposent des actifs dits « OTC », disponibles le week-end quand les vrais marchés sont fermés. <strong>Ces prix ne viennent d'aucun marché</strong> : c'est le courtier qui les cote. Les figures y apparaissent parce que le générateur imite un marché, mais derrière elles il n'y a ni acheteurs ni vendeurs réels — donc rien de la psychologie qui fait le sens d'une bougie.</p>

${piege(
  "On vous dira que les bougies « fonctionnent partout ». La forme apparaît partout, en effet. Mais la <em>raison</em> pour laquelle un marteau signifie quelque chose — de vrais acheteurs sont intervenus à ce niveau — n'existe que sur un vrai marché. Sur un flux synthétique, vous lisez la sortie d'un algorithme.",
)}

${retenir(
  "Les bougies restent l'outil de lecture le plus efficace jamais inventé. Mais elles ont été conçues pour des marchés lents, sur des données journalières, à une époque où l'information circulait mal. Plus vous descendez en unité de temps, moins il en reste. C'est la raison pour laquelle ce livre insistera sans arrêt sur le contexte : c'est lui qui a remplacé l'avantage informationnel de Homma.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 1",
      html: exercices("Vérifier ce qui est acquis", [
        {
          n: 1,
          enonce:
            "Un graphique en courbe et un graphique en bougies affichent la même séance, qui ouvre à 50 et ferme à 50. Quelle information la bougie apporte-t-elle que la courbe ne donne pas ?",
          correction:
            "Le <strong>chemin parcouru</strong>. La courbe montre deux points identiques et laisse croire à une séance immobile. La bougie montre les extrêmes atteints : le prix a peut-être chuté à 44 puis tout repris. Cette amplitude et ce rejet constituent l'essentiel de l'information — ils disent où le marché a été refusé, et par qui.",
        },
        {
          n: 2,
          enonce:
            "Pourquoi une figure de bougie identifiée sur une unité d'une minute est-elle moins fiable que la même figure en journalier ?",
          correction:
            "Parce que le rapport signal/bruit s'effondre. Une bougie journalière résume les décisions de milliers d'acteurs sur des heures ; une bougie d'une minute peut résulter d'un seul ordre un peu gros. La forme est la même, mais ce qu'elle représente n'a pas le même poids. C'est aussi pourquoi les figures se réalisent moins souvent en unité courte.",
        },
        {
          n: 3,
          enonce:
            "Un ami vous dit : « les bougies marchent, elles ont fait leurs preuves depuis 300 ans ». Que lui répondez-vous ?",
          correction:
            "Que la technique a effectivement traversé trois siècles, mais que le contexte a changé sur quatre points : les marchés ne ferment plus (donc les écarts d'ouverture ont disparu), les unités de temps se sont effondrées (donc le bruit domine), tout le monde voit les mêmes figures (donc elles ne sont plus un avantage en soi), et certains actifs sont purement synthétiques. Les bougies restent le meilleur outil de <em>lecture</em> ; elles ne sont plus un avantage <em>en soi</em>.",
        },
      ]),
    },
  ],
};

// ══════════════════════════════════════════ 2. ANATOMIE ═══

const anatomie: Chapitre = {
  n: 2,
  titre: "Anatomie d'une bougie",
  accroche:
    "Quatre prix, deux formes, et tout le reste en découle. Ce chapitre est le seul qu'il faut connaître par cœur.",
  niveau: "debutant",
  sections: [
    {
      titre: "Les quatre prix",
      html: `
<p>Une bougie résume une période — une minute, cinq minutes, une heure, une journée. Peu importe la durée : la construction est identique. Elle retient quatre prix.</p>

<ul>
  <li><strong>L'ouverture</strong> — le premier prix traité de la période.</li>
  <li><strong>Le plus haut</strong> — le prix le plus élevé atteint, même une seconde.</li>
  <li><strong>Le plus bas</strong> — le prix le plus faible atteint.</li>
  <li><strong>La clôture</strong> — le dernier prix traité. <strong>C'est le plus important des quatre.</strong></li>
</ul>

${figure(
  "Les quatre prix d'une bougie haussière",
  [{ o: 100, h: 104, l: 98.5, c: 103 }],
  "Le corps va de l'ouverture à la clôture. Les mèches montent jusqu'aux extrêmes atteints pendant la période.",
  { legendes: true, largeur: 420, hauteur: 260 },
)}

${definition(
  "Pourquoi la clôture prime",
  "Les extrêmes sont atteints par n'importe qui, à n'importe quel moment — un seul ordre suffit à créer une mèche. La clôture, elle, est le prix sur lequel le marché s'est arrêté après avoir tout digéré. C'est le seul des quatre sur lequel tous les acteurs se sont mis d'accord au moment où ça comptait. Toutes les règles sérieuses de ce livre reposent sur des clôtures, jamais sur des mèches.",
)}
`,
    },
    {
      titre: "Le corps et les mèches",
      html: `
<p>Le rectangle est le <strong>corps</strong>. Il relie l'ouverture à la clôture. Les traits fins au-dessus et en dessous sont les <strong>mèches</strong> — on dit aussi les ombres.</p>

<p>La couleur suit une convention universelle : <span style="color:#16a34a;font-weight:600">verte</span> quand la clôture est au-dessus de l'ouverture, <span style="color:#dc2626;font-weight:600">rouge</span> dans le cas inverse. Les couleurs varient d'une plateforme à l'autre, jamais le principe.</p>

<div class="paire">
${figure("Bougie haussière", [{ o: 100, h: 104, l: 99, c: 103.2 }], "La clôture est au-dessus de l'ouverture : le corps se remplit vers le haut.", { largeur: 200, hauteur: 200 })}
${figure("Bougie baissière", [{ o: 103.2, h: 104, l: 99, c: 100 }], "La clôture est en dessous : mêmes extrêmes, sens inverse.", { largeur: 200, hauteur: 200 })}
</div>

<p>Voici la lecture qui compte, et c'est elle qu'il faut installer une fois pour toutes :</p>

${definition(
  "Ce que dit chaque partie",
  "Le <strong>corps</strong> est le terrain conservé à la fin de la bataille. La <strong>mèche</strong> est le terrain visité puis rendu — le prix y est allé, et on l'en a chassé.",
)}

<p>Une longue mèche basse ne dit pas « le prix est descendu ». Elle dit : <strong>le prix est descendu jusque-là, et quelqu'un l'a fait remonter avant la fin.</strong> C'est une information sur un rapport de force, pas sur un déplacement.</p>
`,
    },
    {
      titre: "Lire une bougie comme une bataille",
      html: `
<p>C'est la méthode centrale de ce livre, et elle vaut mieux que n'importe quel catalogue de figures. Devant une bougie, racontez-vous la scène dans l'ordre :</p>

<ol>
  <li><strong>La période s'ouvre</strong> à l'ouverture.</li>
  <li><strong>Un camp pousse</strong> — vers le haut de la mèche haute, ou vers le bas de la mèche basse.</li>
  <li><strong>L'autre répond</strong> — c'est ce qui crée l'autre mèche, ou son absence.</li>
  <li><strong>La clôture dit qui tenait le terrain</strong> quand la cloche a sonné.</li>
</ol>

${figure(
  "Une même bougie, racontée",
  [{ o: 100, h: 100.4, l: 96, c: 99.6, vedette: true }],
  "La période ouvre à 100. Les vendeurs poussent violemment jusqu'à 96 — quatre points perdus. Puis des acheteurs entrent à ce niveau et reprennent presque tout : la clôture se fait à 99,6, à peine sous l'ouverture. Les vendeurs ont dominé la période mais n'ont rien gardé. C'est un échec des vendeurs, pas une victoire.",
  { largeur: 300, hauteur: 240 },
)}

${piege(
  "Le débutant lit la couleur et s'arrête. Cette bougie est rouge, donc « baissière ». C'est l'inverse : les vendeurs ont eu quatre points d'avance et les ont tous rendus. Une bougie rouge peut être une excellente nouvelle pour les acheteurs. <strong>La couleur ne dit presque rien ; la structure du corps et des mèches dit presque tout.</strong>",
)}
`,
    },
    {
      titre: "Les proportions, seules choses à mesurer",
      html: `
<p>Toutes les définitions de figures de ce livre reposent sur trois rapports. Prenez l'habitude de les estimer à l'œil — ça devient automatique en quelques semaines.</p>

${tableau(
  ["Mesure", "Calcul", "Ce qu'elle dit"],
  [
    ["Amplitude", "haut − bas", "L'agitation totale de la période"],
    ["Corps", "|clôture − ouverture|", "Le terrain réellement conservé"],
    ["Corps / amplitude", "en pourcentage", "La conviction. Au-dessus de 70 %, un camp a dominé ; en dessous de 20 %, personne n'a tranché"],
  ],
)}

${figure(
  "Même amplitude, conviction opposée",
  [
    { o: 98.4, h: 104, l: 98, c: 103.6, note: "corps 87 %" },
    { o: 100.8, h: 104, l: 98, c: 101.2, note: "corps 7 %" },
  ],
  "Les deux bougies ont exactement la même amplitude — de 98 à 104. La première a été tenue par les acheteurs du début à la fin. La seconde a vu les deux camps s'annuler. Un indicateur d'amplitude les confondrait ; l'œil ne s'y trompe pas.",
)}

${retenir(
  "Ce n'est jamais la taille de la bougie qui compte, mais <strong>la part du mouvement qui a été conservée</strong>. Grand corps = conviction. Petit corps entre deux longues mèches = combat sans vainqueur.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 2",
      html: exercices("Lire avant de nommer", [
        {
          n: 1,
          enonce:
            "Une bougie ouvre à 200, monte à 208, descend à 199, ferme à 200,5. Racontez la bataille, puis dites qui a gagné.",
          support: figure("", [{ o: 200, h: 208, l: 199, c: 200.5, vedette: true }], "", {
            largeur: 260,
            hauteur: 220,
          }),
          correction:
            "Les acheteurs ouvrent fort et poussent jusqu'à 208 — huit points de gain. Puis les vendeurs entrent, effacent tout le mouvement et emmènent même le prix sous l'ouverture, jusqu'à 199. La clôture à 200,5 est presque au point de départ.<br><br><strong>Personne n'a gagné, et c'est justement l'information.</strong> Mais la mèche haute est bien plus longue que la basse : la tentative haussière a été refusée plus nettement que la tentative baissière. Sur un sommet, ce genre de bougie est un signal d'alerte pour les acheteurs.",
        },
        {
          n: 2,
          enonce:
            "Deux bougies ont la même amplitude de 10 points. La première a un corps de 9, la seconde un corps de 1. Laquelle préférez-vous voir dans le sens de votre position, et pourquoi ?",
          correction:
            "La première, sans hésiter. Un corps de 9 sur 10 points d'amplitude signifie que le camp gagnant a tenu du début à la fin : <strong>90 % du mouvement a été conservé</strong>. Un corps de 1 sur 10 signifie que les deux camps se sont annulés — le marché s'est beaucoup agité pour ne rien décider. Dans le sens de votre position, c'est un avertissement, pas un encouragement.",
        },
        {
          n: 3,
          enonce:
            "Pourquoi les règles sérieuses reposent-elles sur les clôtures et non sur les mèches ?",
          correction:
            "Parce qu'une mèche peut être créée par un seul ordre, à n'importe quel instant de la période, et qu'elle a été <em>rejetée</em> par définition : le prix n'y est pas resté. La clôture est le prix sur lequel le marché s'est arrêté après avoir tout digéré. C'est pour cette raison qu'une mèche qui dépasse un niveau ne constitue pas une cassure : sans clôture au-delà, le niveau a été <strong>testé et défendu</strong>, ce qui est exactement le contraire.",
        },
      ]),
    },
  ],
};

// ═══════════════════════════════════ 3. LES BOUGIES SIMPLES ═══

const t = tendance(6, 100, -0.7, 0.5, 11);
const th = tendance(6, 100, 0.7, 0.5, 23);

const simples: Chapitre = {
  n: 3,
  titre: "Les bougies simples",
  accroche:
    "Sept formes à connaître. Chacune raconte une scène précise — et aucune ne vaut quoi que ce soit hors de son contexte.",
  niveau: "debutant",
  sections: [
    {
      titre: "Le marubozu — la domination totale",
      html: `
<p><em>Marubozu</em> signifie « crâne rasé » en japonais : une bougie sans mèches, ou presque. Le corps occupe toute l'amplitude.</p>

<div class="paire">
${figure("Marubozu haussier", [{ o: 100, h: 105.1, l: 99.9, c: 105 }], "Ouverture au plus bas, clôture au plus haut.", { largeur: 200, hauteur: 210 })}
${figure("Marubozu baissier", [{ o: 105, h: 105.1, l: 99.9, c: 100 }], "Ouverture au plus haut, clôture au plus bas.", { largeur: 200, hauteur: 210 })}
</div>

<p><strong>La scène :</strong> un camp prend le contrôle à la première seconde et ne le lâche jamais. L'autre camp n'a pas réussi à faire reculer le prix une seule fois de façon notable. C'est la conviction à l'état pur.</p>

<p><strong>Ce que ça implique :</strong> une continuation est probable à très court terme — un mouvement aussi net s'arrête rarement d'un coup. Mais attention à la suite.</p>

${piege(
  "Un très grand marubozu <em>après un long mouvement</em> est souvent un signal d'épuisement, pas de continuation. C'est le moment où les derniers entrants se précipitent. Le vocabulaire pour ça est « climax » : tout le monde est déjà dedans, il ne reste plus personne pour acheter. La même forme signifie donc deux choses opposées selon l'endroit où elle apparaît.",
)}
`,
    },
    {
      titre: "Le doji — l'indécision",
      html: `
<p>Le doji a un corps quasi inexistant : la clôture revient au niveau de l'ouverture. Après toute l'agitation de la période, le marché n'a rien décidé.</p>

<div class="paire">
${figure("Doji classique", [{ o: 100, h: 102, l: 98, c: 100.02, ton: "#64748b" }], "Mèches des deux côtés, aucun vainqueur.", { largeur: 200, hauteur: 210 })}
${figure("Doji à longues jambes", [{ o: 100, h: 104, l: 96, c: 100.02, ton: "#64748b" }], "Beaucoup d'agitation, toujours aucune décision.", { largeur: 200, hauteur: 210 })}
</div>

<p>Deux variantes ont un sens plus tranché que le doji ordinaire, car leurs mèches sont d'un seul côté :</p>

<div class="paire">
${figure("Doji libellule", [{ o: 103.9, h: 104, l: 98, c: 104, ton: "#16a34a" }], "Toute l'action s'est faite en dessous, et tout a été repris. Rejet du bas.", { largeur: 200, hauteur: 210 })}
${figure("Doji pierre tombale", [{ o: 98.1, h: 104, l: 98, c: 98, ton: "#dc2626" }], "Toute l'action au-dessus, tout a été rendu. Rejet du haut.", { largeur: 200, hauteur: 210 })}
</div>

${definition(
  "Ce qu'un doji dit vraiment",
  "Il ne dit pas « ça va se retourner ». Il dit : <strong>l'équilibre des forces vient de changer.</strong> Le camp qui menait n'a plus assez de force pour avancer. Ce qui suit peut être un retournement, ou simplement une pause avant la reprise.",
)}

<p>La valeur d'un doji dépend entièrement de son emplacement :</p>

${tableau(
  ["Où il apparaît", "Ce qu'il signifie"],
  [
    ["Après une longue tendance", "<strong>Signal fort.</strong> Le camp qui menait s'essouffle"],
    ["Sur un support ou une résistance connus", "<strong>Signal fort.</strong> Le niveau est disputé"],
    ["Au milieu d'un range", "<strong>Aucune valeur.</strong> Un range n'est qu'une succession d'indécisions"],
    ["En unité de temps très courte", "<strong>Presque aucune valeur.</strong> Souvent un simple manque de volume"],
  ],
)}
`,
    },
    {
      titre: "Le marteau et le pendu — même forme, sens opposés",
      html: `
<p>Petit corps en haut de l'amplitude, longue mèche basse d'au moins deux fois le corps, peu ou pas de mèche haute. <strong>La forme est identique dans les deux cas.</strong> Seule la position dans la tendance décide du nom et du sens.</p>

${figure(
  "Marteau : après une baisse",
  [...t, { o: 96.2, h: 96.5, l: 92.5, c: 96, vedette: true }],
  "Le prix descend depuis plusieurs périodes. La dernière bougie plonge encore, jusqu'à 92,5 — puis des acheteurs entrent à ce niveau et ramènent le prix à 96 avant la clôture. Les vendeurs sont allés au bout de leur poussée et ont tout rendu.",
  { hauteur: 230 },
)}

${figure(
  "Pendu : la même forme, après une hausse",
  [...th, { o: 103.8, h: 104.1, l: 100, c: 103.6, vedette: true }],
  "Forme identique. Mais ici le marché monte depuis plusieurs périodes. Cette longue mèche basse révèle que des vendeurs sont désormais assez nombreux pour faire chuter le prix de quatre points en une seule période. Ils ont été repoussés cette fois — mais ils n'étaient pas là avant.",
  { hauteur: 230 },
)}

${definition(
  "La règle qui fait toute la différence",
  "Le marteau après une baisse est un signal de <strong>retournement haussier</strong> : les vendeurs ont épuisé leur poussée. Le pendu après une hausse est un signal d'<strong>alerte baissière</strong> : des vendeurs sont apparus là où il n'y en avait pas. Même dessin, lectures inverses. <strong>Sans la tendance qui précède, la figure ne veut rien dire du tout.</strong>",
)}

<p>Leurs symétriques existent aussi : le <strong>marteau inversé</strong> (petit corps en bas, longue mèche haute, après une baisse) et l'<strong>étoile filante</strong> (même forme, après une hausse).</p>

<div class="paire">
${figure("Marteau inversé", [{ o: 100.2, h: 104, l: 100, c: 100.6 }], "Après une baisse : tentative de rebond repoussée, mais les acheteurs se sont manifestés.", { largeur: 200, hauteur: 210 })}
${figure("Étoile filante", [{ o: 100.4, h: 104, l: 100, c: 100.2 }], "Après une hausse : les acheteurs ont poussé jusqu'à 104 et tout perdu. Signal baissier net.", { largeur: 200, hauteur: 210 })}
</div>

${piege(
  "L'erreur la plus fréquente du débutant : voir un marteau <em>au milieu d'une tendance baissière qui continue</em> et acheter. Un marteau n'a de valeur qu'après une baisse <strong>prolongée</strong>, idéalement <strong>sur un niveau où le prix a déjà réagi</strong>. Au milieu de nulle part, c'est une bougie parmi d'autres — et il y en a des dizaines dans toute tendance.",
)}
`,
    },
    {
      titre: "La toupie — le marché qui hésite",
      html: `
<p>Petit corps, mèches des deux côtés de longueur comparable. Moins extrême qu'un doji, même message : <strong>personne ne contrôle.</strong></p>

${figure(
  "Toupie",
  [{ o: 100, h: 103, l: 97, c: 100.8 }],
  "Le prix a monté de trois points, baissé de trois points, et fini presque à son point de départ. Les deux camps se sont neutralisés.",
  { largeur: 240, hauteur: 210 },
)}

<p>Une toupie isolée n'apprend rien. <strong>Une série de toupies après une forte tendance est en revanche l'un des signaux les plus fiables du livre :</strong> le mouvement n'a plus de carburant. Ce n'est pas encore un retournement, mais la poussée est terminée.</p>

${retenir(
  "Les sept formes de ce chapitre ne sont pas des signaux d'achat ou de vente. Ce sont des <strong>descriptions de rapports de force</strong>. Le signal naît de la rencontre entre une forme et un endroit. La forme seule ne vaut rien — et c'est ce que vend l'essentiel des formations en ligne.",
)}
`,
    },
    {
      titre: "Exercices — chapitre 3",
      html: exercices("Nommer, puis interpréter", [
        {
          n: 1,
          enonce:
            "Le prix baisse depuis douze périodes. Apparaît alors une bougie à petit corps vert avec une longue mèche basse. Nommez la figure, puis dites ce que vous faites.",
          correction:
            "C'est un <strong>marteau</strong>. Il indique que les vendeurs ont poussé une dernière fois et que des acheteurs sont intervenus assez fort pour tout reprendre.<br><br>Ce que vous faites : <strong>rien encore.</strong> Un marteau est une alerte, pas une entrée. Il faut attendre la <em>confirmation</em> — une bougie suivante qui clôture au-dessus du haut du marteau. Sans confirmation, la baisse reprend environ quatre fois sur dix. Et vérifiez d'abord si le marteau tombe sur un niveau déjà respecté : c'est ce qui distingue un bon marteau d'un marteau ordinaire.",
        },
        {
          n: 2,
          enonce:
            "Deux traders voient exactement la même bougie : petit corps en haut, longue mèche basse. Le premier annonce un signal haussier, le second un signal baissier. Peuvent-ils avoir raison tous les deux ?",
          correction:
            "<strong>Oui, s'ils ne regardent pas le même graphique.</strong> Cette forme s'appelle un marteau après une baisse — signal haussier — et un pendu après une hausse — signal baissier. C'est exactement la même bougie ; c'est la tendance qui précède qui décide.<br><br>C'est l'illustration la plus claire du principe central de ce livre : <strong>le contexte prime sur la forme.</strong>",
        },
        {
          n: 3,
          enonce:
            "Un marubozu haussier très grand apparaît après huit périodes de hausse ininterrompue. Continuation ou épuisement ?",
          correction:
            "Les deux lectures sont défendables, et c'est précisément le problème. Un marubozu exprime la conviction, ce qui plaide pour la continuation. Mais <strong>après une longue hausse déjà installée</strong>, un très grand corps signale souvent un climax : les derniers acheteurs se précipitent, et une fois qu'ils sont entrés, il ne reste plus personne pour acheter.<br><br>La bonne réponse n'est pas dans la bougie : elle est dans <em>ce qui suit</em>. Si la période suivante ne parvient pas à dépasser le haut du marubozu, c'était un épuisement. C'est pour ça qu'on ne trade pas la bougie elle-même, mais sa confirmation.",
        },
        {
          n: 4,
          enonce:
            "Vous repérez trois toupies consécutives après une forte hausse. Qu'est-ce que ça vous dit, et qu'est-ce que ça ne vous dit pas ?",
          correction:
            "<strong>Ce que ça dit :</strong> la poussée haussière est terminée. Trois périodes consécutives sans qu'aucun camp ne l'emporte signifient que les acheteurs n'ont plus la force d'avancer. Le carburant est épuisé.<br><br><strong>Ce que ça ne dit pas :</strong> que le prix va baisser. Un marché sans carburant peut aussi bien s'installer dans un range pendant longtemps. L'absence de hausse n'est pas une baisse — confondre les deux fait vendre trop tôt, et c'est une erreur coûteuse.",
        },
      ]),
    },
  ],
};

export const partie1: Chapitre[] = [histoire, anatomie, simples];
