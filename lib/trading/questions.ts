/**
 * ACADÉMIE TRADING — banque de questions.
 *
 * Chaque question est rattachée à **une** compétence. C'est ce lien qui fait
 * fonctionner tout le système : répondre juste crédite la compétence, et une
 * compétence se maîtrise à force de réponses justes récentes (voir
 * `progress.ts`). Sans ce rattachement, un quiz ne serait qu'un score.
 *
 * Deux règles suivies dans la rédaction :
 *
 * 1. **Pas de question de mémoire pure.** On ne demande pas « comment
 *    s'appelle la figure X », mais « qu'est-ce que cette situation raconte ».
 *    Les distracteurs sont des erreurs de raisonnement réelles de débutants,
 *    pas des absurdités faciles à éliminer.
 *
 * 2. **`why` explique le raisonnement, pas la réponse.** Il est affiché après
 *    la réponse, juste comme fausse. C'est là que l'apprentissage se produit.
 */

export interface Question {
  id: string;
  /** Slug du niveau. */
  level: string;
  /** Clé de la compétence créditée. */
  skill: string;
  prompt: string;
  choices: string[];
  /** Index de la bonne réponse dans `choices`. */
  answer: number;
  /** Pourquoi c'est cette réponse — affiché après coup, juste ou faux. */
  why: string;
}

const q = (
  id: string,
  level: string,
  skill: string,
  prompt: string,
  choices: string[],
  answer: number,
  why: string,
): Question => ({ id, level, skill, prompt, choices, answer, why });

// ===================================================== NIVEAU 1 — FONDATIONS ===

const N1: Question[] = [
  // --- marche_role ---
  q("n1-role-1", "fondations", "marche_role",
    "À quoi sert fondamentalement un marché financier ?",
    ["À faire se rencontrer ceux qui veulent vendre et ceux qui veulent acheter",
     "À garantir un rendement à ceux qui investissent longtemps",
     "À fixer le prix juste d'une entreprise",
     "À permettre aux États de contrôler l'économie"],
    0,
    "Un marché est un lieu de rencontre, rien de plus. Il ne promet aucun rendement et ne calcule aucun prix « juste » : il enregistre ce sur quoi deux parties se sont mises d'accord."),
  q("n1-role-2", "fondations", "marche_role",
    "Une entreprise vend des actions d'elle-même. Pourquoi ?",
    ["Parce qu'elle a besoin de capital pour financer son activité",
     "Parce que ses dirigeants pensent que le cours va baisser",
     "Parce que la loi l'oblige au-delà d'une certaine taille",
     "Pour faire monter son propre cours de bourse"],
    0,
    "L'émission d'actions est un financement : l'entreprise échange une part d'elle-même contre de l'argent immédiat. C'est un besoin réel, pas une manœuvre boursière."),
  q("n1-role-3", "fondations", "marche_role",
    "Un agriculteur vend aujourd'hui un contrat à terme sur sa récolte de dans six mois. Que cherche-t-il ?",
    ["Fixer dès maintenant le prix qu'il touchera, pour ne plus dépendre du marché",
     "Parier que le prix du blé va monter",
     "Emprunter de l'argent auprès de sa banque",
     "Éviter de payer des impôts sur la récolte"],
    0,
    "C'est de la couverture, pas de la spéculation. Il accepte de renoncer à un gain éventuel en échange de la certitude — et c'est pour ce besoin que les marchés à terme existent."),
  q("n1-role-4", "fondations", "marche_role",
    "« Le prix a monté tout seul aujourd'hui, il n'y avait aucune nouvelle. » Que dire de cette phrase ?",
    ["Elle est fausse : quelqu'un a accepté de payer plus cher, il y a toujours un acte derrière",
     "Elle est correcte, les prix bougent parfois sans cause",
     "Elle est correcte si le volume était faible",
     "Elle décrit un bug de la plateforme"],
    0,
    "Un prix ne se déplace jamais sans transaction. L'absence de *nouvelle* n'est pas l'absence de *cause* : quelqu'un a agi, et c'est cet acte qui est la cause immédiate."),
  q("n1-role-5", "fondations", "marche_role",
    "Qui se trouve derrière un mouvement de prix ?",
    ["Des humains et des institutions avec des besoins et des contraintes réels",
     "Principalement des algorithmes sans intention",
     "Les banques centrales, qui pilotent les cours",
     "Personne : le prix suit une loi mathématique"],
    0,
    "Même exécutés par des machines, les ordres traduisent des décisions humaines et des contraintes réelles — trésorerie, couverture, échéance, obligation de vendre. Le prix est une trace sociale."),
  q("n1-role-6", "fondations", "marche_role",
    "Le prix affiché d'une action correspond à quoi, exactement ?",
    ["Au prix de la dernière transaction effectivement conclue",
     "À la moyenne entre le meilleur acheteur et le meilleur vendeur",
     "À la valeur estimée de l'entreprise divisée par le nombre d'actions",
     "Au prix auquel tu peux acheter maintenant à coup sûr"],
    0,
    "C'est un enregistrement du passé, pas une promesse. Le prix auquel tu peux acheter maintenant est le *ask*, qui est plus haut — d'où la confusion fréquente."),

  // --- marches_types ---
  q("n1-types-1", "fondations", "marches_types",
    "Pourquoi le forex ruine-t-il particulièrement les débutants ?",
    ["Le levier proposé y est énorme, donc les erreurs deviennent fatales très vite",
     "Les cours y sont manipulés par les courtiers",
     "Il est ouvert 24h, donc on ne peut jamais dormir",
     "Les monnaies bougent plus fort que les actions"],
    0,
    "Les monnaies bougent en réalité *moins* que beaucoup d'actions. C'est le levier qui transforme un petit mouvement en perte totale — pas la volatilité du marché lui-même."),
  q("n1-types-2", "fondations", "marches_types",
    "Une option ne se comporte pas comme une action. Pourquoi ?",
    ["Son prix dépend aussi du temps qui reste et de la volatilité, pas seulement de la direction",
     "Elle ne peut être vendue qu'à l'échéance",
     "Son prix est fixé par l'émetteur, pas par le marché",
     "Elle ne perd jamais plus que 50 % de sa valeur"],
    0,
    "C'est le piège classique : on peut avoir raison sur la direction et perdre quand même, parce que le temps s'est écoulé ou que la volatilité a chuté. D'où le conseil d'aborder les options tard."),
  q("n1-types-3", "fondations", "marches_types",
    "Quel marché est le plus adapté pour débuter, et pourquoi ?",
    ["Les actions : le plus lisible, horaires fixes, régulation forte",
     "Les futures : les plus liquides, donc les plus sûrs",
     "La crypto : ouverte 24h/7j, on apprend plus vite",
     "Le forex : les mouvements sont plus petits, donc moins risqués"],
    0,
    "Liquidité et sécurité ne sont pas synonymes : les futures sont très liquides *et* impitoyables. Le bon critère pour débuter est la lenteur et la lisibilité."),
  q("n1-types-4", "fondations", "marches_types",
    "Que fait le levier à une mauvaise analyse ?",
    ["Il la rend fatale, sans la rendre moins mauvaise",
     "Il la corrige si le marché finit par te donner raison",
     "Il augmente statistiquement tes chances de gain",
     "Il n'a d'effet que sur les gains, pas sur les pertes"],
    0,
    "Le levier est un amplificateur neutre : il n'améliore pas la qualité de ta décision, il accélère seulement son résultat. Une analyse fausse leviérée sort du marché plus vite."),
  q("n1-types-5", "fondations", "marches_types",
    "Un contrat à terme (future) se caractérise par :",
    ["Une échéance fixe et une livraison prévue à cette date",
     "Un droit d'acheter sans obligation",
     "Une détention illimitée dans le temps",
     "Une absence totale de levier"],
    0,
    "L'obligation à échéance distingue le future de l'option (qui n'est qu'un droit) et de l'action (qu'on garde indéfiniment). Cette échéance change complètement la gestion du temps."),
  q("n1-types-6", "fondations", "marches_types",
    "Quelle règle générale relie vitesse d'un marché et danger pour un débutant ?",
    ["Plus un marché est rapide et leviéré, plus il punit vite l'ignorance",
     "Plus un marché est rapide, plus il y a d'occasions donc de gains",
     "La vitesse d'un marché n'a pas de rapport avec le risque",
     "Les marchés lents sont plus dangereux car les pertes s'accumulent"],
    0,
    "La vitesse ne crée pas l'erreur, elle réduit le temps dont tu disposes pour la corriger. Commencer par du lent, c'est s'acheter du temps d'apprentissage."),

  // --- prix_formation ---
  q("n1-prix-1", "fondations", "prix_formation",
    "Que faut-il pour que le prix monte d'un cran ?",
    ["Qu'un acheteur épuise les ordres de vente au prix actuel, puis accepte de payer plus cher",
     "Qu'il y ait plus d'acheteurs que de vendeurs sur le marché",
     "Que le volume global augmente",
     "Que les vendeurs retirent leurs ordres"],
    0,
    "Ce n'est pas une affaire de nombre. Même avec des milliers d'acheteurs, si personne n'accepte de payer le niveau supérieur, le prix ne monte pas. Il faut consommer l'offre puis franchir."),
  q("n1-prix-2", "fondations", "prix_formation",
    "Le bid et le ask, c'est quoi ?",
    ["Le meilleur prix d'achat proposé et le meilleur prix de vente proposé",
     "Le prix d'ouverture et le prix de clôture",
     "Le plus haut et le plus bas de la journée",
     "Le prix du marché et celui du courtier"],
    0,
    "Bid = ce que le meilleur acheteur accepte de payer. Ask = ce que le meilleur vendeur accepte de recevoir. Tu achètes au ask et tu vends au bid : l'écart, le spread, est un coût immédiat."),
  q("n1-prix-3", "fondations", "prix_formation",
    "Un gros ordre d'achat arrive sur un carnet d'ordres très mince. Que se passe-t-il ?",
    ["Le prix bondit fortement, car il n'y a pas assez d'offre pour absorber l'ordre",
     "Le prix ne bouge pas, l'ordre est simplement mis en attente",
     "L'ordre est refusé par la plateforme",
     "Le prix baisse, car un gros ordre fait peur au marché"],
    0,
    "C'est exactement le mécanisme de la liquidité. Le même ordre sur un carnet épais bougerait à peine le prix. La taille de l'ordre ne suffit donc pas à prédire l'impact — il faut regarder ce qu'il y a en face."),
  q("n1-prix-4", "fondations", "prix_formation",
    "Le spread s'élargit brutalement sur un titre. Qu'est-ce que ça t'indique ?",
    ["Qu'il y a moins de monde prêt à traiter : la liquidité se retire",
     "Que le prix va monter",
     "Que le courtier augmente ses frais",
     "Que le volume vient d'exploser"],
    0,
    "Le spread est un thermomètre de liquidité. Quand il s'écarte, entrer et sortir coûte plus cher — c'est souvent le premier signe d'un marché où tu risques de rester coincé."),
  q("n1-prix-5", "fondations", "prix_formation",
    "Pourquoi le close d'une bougie est-il considéré comme son prix le plus important ?",
    ["C'est le seul niveau sur lequel les deux camps se sont accordés pour terminer la période",
     "C'est toujours le prix le plus élevé de la période",
     "C'est celui que les courtiers utilisent pour facturer",
     "C'est le prix qui a été traité le plus souvent"],
    0,
    "Le high et le low disent où le prix est *allé*. Le close dit où il a *tenu*. Un niveau visité puis abandonné raconte un rejet ; un niveau tenu à la clôture raconte un accord."),
  q("n1-prix-6", "fondations", "prix_formation",
    "Tu passes un ordre au marché pour acheter. À quel prix es-tu servi ?",
    ["Au ask, donc légèrement plus haut que le prix affiché comme « dernier »",
     "Au dernier prix affiché, exactement",
     "Au bid, donc légèrement plus bas",
     "À la moyenne du bid et du ask"],
    0,
    "Beaucoup de débutants croient acheter « au prix affiché » et s'étonnent d'entrer plus haut. Tu traverses le spread à chaque aller-retour : c'est un coût réel, souvent sous-estimé."),

  // --- offre_demande ---
  q("n1-od-1", "fondations", "offre_demande",
    "Le prix monte. Qu'est-ce que ça dit du rapport de force ?",
    ["Les acheteurs étaient plus pressés que les vendeurs",
     "Il y avait plus d'acheteurs que de vendeurs",
     "Les vendeurs avaient disparu du marché",
     "La valeur de l'actif a réellement augmenté"],
    0,
    "C'est une question d'urgence, pas de nombre. Chaque transaction a exactement un acheteur et un vendeur — il y a donc toujours autant des deux. Ce qui diffère, c'est qui accepte de subir le prix de l'autre."),
  q("n1-od-2", "fondations", "offre_demande",
    "Qui fait bouger le prix : le vendeur patient ou le vendeur pressé ?",
    ["Le pressé, parce qu'il accepte le prix qu'on lui donne immédiatement",
     "Le patient, parce que son ordre reste visible dans le carnet",
     "Les deux à parts égales",
     "Ni l'un ni l'autre, c'est le volume qui décide"],
    0,
    "Le patient *fournit* la liquidité (il attend), le pressé la *consomme* (il traverse le spread). Seul le second déplace le prix. C'est la distinction la plus utile du niveau."),
  q("n1-od-3", "fondations", "offre_demande",
    "Une chute lente et régulière, contre une chute violente et rapide : même information ?",
    ["Non. La violente traduit de l'urgence à sortir ; la lente, un simple déséquilibre",
     "Oui, seule l'ampleur totale compte",
     "Non, la lente est toujours plus grave",
     "Oui, si le volume est identique"],
    0,
    "La vitesse est une donnée à part entière. Elle renseigne sur l'état émotionnel des acteurs, pas seulement sur la direction — et tu apprendras au Niveau 2 que la bougie enregistre précisément cela."),
  q("n1-od-4", "fondations", "offre_demande",
    "Il y a « beaucoup d'acheteurs » sur un titre mais le prix ne monte pas. Est-ce contradictoire ?",
    ["Non : s'ils attendent tous patiemment sans franchir le ask, rien ne bouge",
     "Oui, c'est impossible",
     "Non, cela signifie que la plateforme est en retard",
     "Oui, sauf si le marché est fermé"],
    0,
    "Des acheteurs qui posent des ordres en dessous du marché ne font pas monter le prix — ils construisent un support. Vouloir acheter et faire monter le prix sont deux choses différentes."),
  q("n1-od-5", "fondations", "offre_demande",
    "Quel est le meilleur résumé de ce qui déplace un prix ?",
    ["Un déséquilibre d'urgence entre les deux camps",
     "Le rapport entre le nombre d'acheteurs et de vendeurs",
     "La valeur fondamentale de l'actif",
     "Les décisions des grandes banques"],
    0,
    "Retiens « déséquilibre d'urgence ». C'est la formulation qui reste vraie sur tous les marchés et à toutes les échelles de temps."),
  q("n1-od-6", "fondations", "offre_demande",
    "Une bougie enregistre quoi, au fond ?",
    ["La trace du rapport de force entre acheteurs et vendeurs sur la période",
     "Le nombre de transactions effectuées",
     "L'opinion moyenne des analystes",
     "La valeur comptable de l'actif à cet instant"],
    0,
    "C'est le pont vers le Niveau 2 : si tu vois la bougie comme un enregistrement de bataille plutôt qu'un symbole à mémoriser, tu n'auras plus besoin d'apprendre des figures par cœur."),

  // --- liquidite ---
  q("n1-liq-1", "fondations", "liquidite",
    "Qu'est-ce que la liquidité, concrètement, pour toi qui traites ?",
    ["Ta capacité à entrer et sortir sans déplacer le prix contre toi",
     "La quantité d'argent disponible sur ton compte",
     "La vitesse d'exécution de ta plateforme",
     "Le nombre d'actifs cotés sur le marché"],
    0,
    "La liquidité ne se mesure pas à ton compte mais au marché en face de toi. Un marché illiquide te laisse entrer facilement — c'est en sortant que le problème apparaît."),
  q("n1-liq-2", "fondations", "liquidite",
    "Lequel de ces signaux évoque un manque de liquidité ?",
    ["Un spread large, un volume faible et des trous de prix",
     "Un prix qui monte régulièrement",
     "Un grand nombre de bougies vertes consécutives",
     "Une forte volatilité intrajournalière"],
    0,
    "La volatilité et l'illiquidité se confondent souvent mais ne sont pas la même chose : un marché peut être très liquide et très volatil. Les vrais indices sont le spread, le volume et les gaps."),
  q("n1-liq-3", "fondations", "liquidite",
    "Pourquoi les institutions ont-elles besoin de liquidité ?",
    ["Parce que leurs ordres sont trop gros pour être exécutés sans faire bouger le prix",
     "Parce qu'elles sont obligées de traiter en continu",
     "Parce que leurs algorithmes exigent un spread nul",
     "Parce que la réglementation le leur impose"],
    0,
    "Retiens-le pour le Niveau 4 : ce besoin explique pourquoi le prix va parfois chercher des zones précises. Un gros acteur ne peut pas se servir là où il n'y a personne."),
  q("n1-liq-4", "fondations", "liquidite",
    "Tu détiens une position sur un titre devenu illiquide. Quel est le vrai risque ?",
    ["Ne pas pouvoir sortir à un prix raisonnable quand tu le décideras",
     "Que le titre soit retiré de la cote",
     "Que ton courtier augmente ses frais",
     "Que le prix cesse totalement de bouger"],
    0,
    "Le risque n'est pas de perdre sur la direction, c'est de ne pas pouvoir *appliquer* ta décision. Un stop ne protège que s'il existe quelqu'un en face pour l'exécuter."),
  q("n1-liq-5", "fondations", "liquidite",
    "Une très longue mèche apparaît sur un titre à volume très faible. Comment la lire ?",
    ["Avec prudence : elle peut ne traduire aucun rapport de force, juste un carnet vide",
     "Comme un signal de retournement fort",
     "Comme une erreur de cotation à ignorer totalement",
     "Comme la preuve qu'une institution est intervenue"],
    0,
    "Une mèche est censée raconter un rejet. En marché vide, elle peut n'être que le passage d'un ordre modeste dans le désert — la forme est identique, l'information est absente."),
  q("n1-liq-6", "fondations", "liquidite",
    "Le même ordre de 10 000 titres déplace fortement le prix sur A et à peine sur B. Pourquoi ?",
    ["Le carnet de B est plus épais : il y a plus de contrepartie pour absorber",
     "B est un titre moins volatil par nature",
     "A est un titre plus cher que B",
     "Le courtier traite A et B différemment"],
    0,
    "L'impact d'un ordre ne dépend pas de sa taille absolue, mais de sa taille *relative* à ce qui l'attend en face. C'est toute la notion de profondeur de marché."),

  // --- erreurs_debutant ---
  q("n1-err-1", "fondations", "erreurs_debutant",
    "Quand faut-il décider de sa perte maximale sur un trade ?",
    ["Avant d'entrer en position",
     "Quand la position commence à perdre",
     "Quand la perte devient inconfortable",
     "Il ne faut pas fixer de limite, il faut laisser au marché le temps"],
    0,
    "Après l'entrée, ce n'est plus toi qui décides : c'est ton émotion, en présence d'une perte réelle. Fixer la limite à froid est le seul moment où ton jugement est encore disponible."),
  q("n1-err-2", "fondations", "erreurs_debutant",
    "Tu viens d'enchaîner trois gains. Que peux-tu en conclure ?",
    ["Rien de fiable : trois trades ne distinguent pas la compétence de la chance",
     "Que ta méthode fonctionne et que tu peux augmenter la taille",
     "Que le marché est actuellement favorable à ton style",
     "Que tu es prêt à passer à un marché plus leviéré"],
    0,
    "C'est le piège du débutant chanceux : il augmente sa taille juste avant de rencontrer la réalité statistique. Un échantillon de trois n'autorise aucune conclusion."),
  q("n1-err-3", "fondations", "erreurs_debutant",
    "Qu'est-ce que le revenge trading ?",
    ["Reprendre position immédiatement après une perte pour se refaire",
     "Suivre la position inverse d'un autre trader",
     "Augmenter progressivement une position perdante",
     "Traiter uniquement les actifs sur lesquels on a déjà gagné"],
    0,
    "Le problème n'est pas la position, c'est son origine : elle vient d'une émotion, pas d'une analyse. Le signe distinctif est que tu n'aurais pas pris ce trade dans un état calme."),
  q("n1-err-4", "fondations", "erreurs_debutant",
    "Tu doutes d'un signal. Que faire ?",
    ["Réduire la taille de la position : le doute se gère par la taille",
     "Ajouter des indicateurs jusqu'à obtenir une confirmation nette",
     "Attendre d'être certain avant d'agir",
     "Prendre la position habituelle : le doute est normal, on l'ignore"],
    0,
    "Chercher à supprimer le doute est une impasse : il ne disparaît jamais. Accumuler des indicateurs produit une fausse certitude. La variable d'ajustement, c'est la taille."),
  q("n1-err-5", "fondations", "erreurs_debutant",
    "Pourquoi risquer une part importante du capital sur une conviction forte est-il dangereux ?",
    ["Parce que quelques pertes rendent alors la récupération mathématiquement très difficile",
     "Parce que les convictions fortes sont statistiquement plus souvent fausses",
     "Parce que le courtier limite les positions trop grosses",
     "Parce que cela augmente les impôts sur les gains"],
    0,
    "C'est de l'arithmétique, pas de la prudence morale : après −50 %, il faut +100 % pour revenir. Tu chiffreras cet effet au Niveau 7 — c'est ce qui rend la gestion du risque prioritaire."),
  q("n1-err-6", "fondations", "erreurs_debutant",
    "Une bonne nouvelle est publiée sur une entreprise et le cours ne monte pas. Explication la plus probable ?",
    ["Elle était déjà anticipée, donc déjà intégrée dans le prix",
     "Le marché n'a pas encore réagi, il faut attendre",
     "Les investisseurs ont mal compris l'information",
     "Il s'agit d'une manipulation de cours"],
    0,
    "Le marché ne réagit pas aux nouvelles, il réagit à l'écart entre la nouvelle et ce qui était attendu. Croire qu'une bonne nouvelle « doit » faire monter le prix est une source d'erreurs constante."),
];

// ======================================================= NIVEAU 2 — BOUGIES ===

const N2: Question[] = [
  // --- anatomie ---
  q("n2-ana-1", "bougies", "anatomie",
    "Une bougie a : ouverture 100, haut 108, bas 99, clôture 106. Quelle est la hauteur du corps ?",
    ["6", "9", "8", "2"],
    0,
    "Le corps relie l'ouverture à la clôture : |106 − 100| = 6. L'amplitude totale (108 − 99 = 9) est autre chose — c'est elle qui sert de référence pour les ratios."),
  q("n2-ana-2", "bougies", "anatomie",
    "Même bougie (o=100, h=108, b=99, c=106). Quelle est la mèche haute ?",
    ["2", "8", "6", "1"],
    0,
    "La mèche haute part du sommet du corps jusqu'au haut : 108 − 106 = 2. Attention à ne pas partir de l'ouverture — le sommet du corps est le plus grand des deux (ouverture, clôture)."),
  q("n2-ana-3", "bougies", "anatomie",
    "Une bougie est baissière quand :",
    ["La clôture est en dessous de l'ouverture",
     "La clôture est en dessous du bas de la bougie précédente",
     "Le bas est inférieur à celui de la bougie précédente",
     "La mèche basse est plus longue que la mèche haute"],
    0,
    "La couleur ne dépend que du couple ouverture/clôture, jamais de la bougie précédente ni des mèches. Une bougie peut être rouge tout en ayant clôturé plus haut que la veille."),
  q("n2-ana-4", "bougies", "anatomie",
    "Que représentent les mèches d'une bougie ?",
    ["Des territoires de prix visités puis abandonnés avant la clôture",
     "Le volume échangé aux extrêmes",
     "L'écart entre le bid et le ask",
     "Les ordres qui n'ont pas été exécutés"],
    0,
    "« Visité puis abandonné » est la bonne formule. Une longue mèche est la trace d'un aller-retour : le prix y est allé, et il n'y est pas resté. C'est ça qui en fait un rejet."),
  q("n2-ana-5", "bougies", "anatomie",
    "Quels quatre nombres résument une bougie ?",
    ["Ouverture, haut, bas, clôture",
     "Ouverture, clôture, volume, amplitude",
     "Haut, bas, moyenne, volume",
     "Bid, ask, dernier, volume"],
    0,
    "Open, High, Low, Close — l'OHLC. Le volume est une donnée utile mais séparée : il ne fait pas partie du dessin de la bougie."),
  q("n2-ana-6", "bougies", "anatomie",
    "Une bougie a un corps de 1 et une amplitude de 12. Que peux-tu dire ?",
    ["Le corps est minuscule par rapport à l'amplitude : c'est une bougie d'indécision",
     "C'est une grande bougie de tendance",
     "C'est un marubozu",
     "Les données sont incohérentes"],
    0,
    "Le ratio corps/amplitude vaut ici 1/12 ≈ 0,08, sous le seuil du doji. Beaucoup de mouvement, aucun résultat net : personne n'a tranché la période."),

  // --- psychologie / controle / force_faiblesse ---
  q("n2-psy-1", "bougies", "psychologie",
    "Trois questions permettent de lire n'importe quelle bougie. Lesquelles ?",
    ["Qui a gagné ? A-t-on été contesté ? Le gagnant a-t-il fini en force ?",
     "Le volume est-il haut ? Le prix monte-t-il ? La tendance est-elle claire ?",
     "Quelle figure est-ce ? Quel est son biais ? Quelle est sa fiabilité ?",
     "Où est le support ? Où est la résistance ? Où est le stop ?"],
    0,
    "Ces trois questions se répondent avec l'ouverture, la clôture et les mèches — rien d'autre. Elles remplacent la mémorisation d'un catalogue de figures."),
  q("n2-psy-2", "bougies", "psychologie",
    "Deux bougies vertes de taille identique. L'une clôture collée à son haut, l'autre loin sous son haut. Différence ?",
    ["La seconde révèle une faiblesse : les acheteurs ont été absorbés en fin de période",
     "Aucune : même couleur, même taille, même information",
     "La seconde est plus fiable car elle laisse de la place pour monter",
     "La première annonce un retournement baissier"],
    0,
    "C'est la troisième question — finir en force ou non. La position du close dans l'amplitude est ce qui sépare une lecture débutante d'une lecture sérieuse."),
  q("n2-psy-3", "bougies", "psychologie",
    "Une bougie rouge clôture tout près de son haut, après une forte chute. Que révèle-t-elle ?",
    ["Une faiblesse chez les vendeurs : ils n'ont pas tenu leur avantage",
     "Une force des vendeurs, puisque la bougie est rouge",
     "Rien : une bougie rouge est toujours baissière",
     "Une erreur de cotation"],
    0,
    "Force et faiblesse ne sont pas des synonymes de vert et rouge. Ici les vendeurs ont gagné la période mais ont rendu presque tout le terrain avant la clôture."),
  q("n2-psy-4", "bougies", "force_faiblesse",
    "Un grand corps sans presque aucune mèche signifie :",
    ["Que le camp gagnant a contrôlé la période sans être contesté",
     "Que le volume était faible",
     "Qu'un retournement est imminent",
     "Que le marché est illiquide"],
    0,
    "Pas de mèche = pas d'aller-retour = aucune contestation sérieuse. C'est la définition du marubozu, et c'est l'expression la plus pure de la force directionnelle."),
  q("n2-psy-5", "bougies", "force_faiblesse",
    "Une bougie avec deux longues mèches et un petit corps raconte quoi ?",
    ["Les deux camps ont poussé fort et le résultat s'est joué de justesse",
     "Le marché n'a pas bougé de la période",
     "Les acheteurs ont dominé sans résistance",
     "Le volume a été exceptionnellement bas"],
    0,
    "Ne confonds pas « petit corps » et « rien ne s'est passé ». L'amplitude peut être énorme : il y a eu bataille, elle s'est simplement terminée à égalité."),
  q("n2-psy-6", "bougies", "controle",
    "Comment savoir qui contrôle une période, en une seule observation ?",
    ["En comparant la clôture à l'ouverture",
     "En regardant laquelle des deux mèches est la plus longue",
     "En comparant le haut au haut de la bougie précédente",
     "En regardant le volume"],
    0,
    "La question « qui a gagné » se règle uniquement avec ouverture et clôture. Les mèches répondent à une autre question : celle de la contestation."),
  q("n2-psy-7", "bougies", "controle",
    "Un doji apparaît dans une tendance haussière franche. Que conclure ?",
    ["Que la tendance hésite — sans que le doji indique une direction",
     "Que la tendance va s'inverser",
     "Que la tendance va se poursuivre",
     "Que le volume s'est effondré"],
    0,
    "Le doji signale l'indécision, pas le retournement. Le lire comme un signal baissier est l'erreur la plus répandue à son sujet : il dit « personne ne contrôle », pas « les vendeurs arrivent »."),

  // --- figures_simples ---
  q("n2-fig-1", "bougies", "figures_simples",
    "Marteau et pendu ont exactement la même forme. Qu'est-ce qui les distingue ?",
    ["Le contexte : le marteau suit une baisse, le pendu suit une hausse",
     "La couleur du corps",
     "La longueur de la mèche basse",
     "Le volume associé"],
    0,
    "C'est la preuve la plus nette qu'une figure sans contexte ne vaut rien. Forme identique, signification opposée — seul ce qui précède tranche."),
  q("n2-fig-2", "bougies", "figures_simples",
    "Une longue mèche haute avec un petit corps, après une hausse, s'appelle :",
    ["Une étoile filante", "Un marteau", "Un marubozu", "Un harami"],
    0,
    "Étoile filante. Et sa lecture importe plus que son nom : le prix est monté haut puis a tout rendu — des vendeurs ont absorbé les acheteurs à ce niveau."),
  q("n2-fig-3", "bougies", "figures_simples",
    "Que raconte la longue mèche basse d'un marteau ?",
    ["Les vendeurs ont poussé bas puis ont perdu tout le terrain gagné : rejet du niveau",
     "Les acheteurs ont abandonné le niveau",
     "Le volume était concentré au plus bas",
     "Un gap va se former à l'ouverture suivante"],
    0,
    "Le mot clé est *rejet*. À ce niveau bas, une demande sérieuse s'est manifestée assez fort pour effacer le travail des vendeurs sur la période."),
  q("n2-fig-4", "bougies", "figures_simples",
    "Pourquoi le marteau inversé est-il un signal plus faible que le marteau ?",
    ["Parce que la tentative de remontée a échoué avant la clôture",
     "Parce qu'il est plus rare",
     "Parce que son corps est toujours plus petit",
     "Parce qu'il n'apparaît qu'en marché illiquide"],
    0,
    "La bougie montre que des acheteurs ont osé — c'est l'élément positif — mais aussi qu'ils n'ont pas tenu jusqu'à la clôture. D'où la nécessité d'une confirmation."),
  q("n2-fig-5", "bougies", "figures_simples",
    "Le seuil usuel pour parler de doji est un corps qui représente au maximum :",
    ["Environ 10 % de l'amplitude", "50 % de l'amplitude", "Zéro exactement", "33 % de l'amplitude"],
    0,
    "Environ 10 %. Exiger un corps nul rendrait la figure quasi introuvable ; c'est pourquoi les seuils se pensent toujours en fraction de l'amplitude, jamais en valeur absolue."),

  // --- figures_combinees ---
  q("n2-comb-1", "bougies", "figures_combinees",
    "Qu'est-ce qu'un avalement haussier ?",
    ["Une bougie verte dont le corps englobe entièrement le corps de la rouge précédente",
     "Deux bougies vertes consécutives de plus en plus grandes",
     "Une bougie verte qui ouvre au-dessus du haut de la précédente",
     "Une bougie verte entièrement contenue dans la précédente"],
    0,
    "L'englobement du *corps* est le critère. Ce qui compte, c'est le sens : le travail d'une période entière de vendeurs a été effacé en une seule — un changement de main visible."),
  q("n2-comb-2", "bougies", "figures_combinees",
    "Une bougie entièrement contenue dans les extrêmes de la précédente s'appelle :",
    ["Un harami", "Un avalement", "Un marubozu", "Une étoile du matin"],
    0,
    "Harami. Sa lecture est particulière : l'amplitude se comprime, le marché accumule de l'énergie. Il annonce souvent un mouvement — sans dire dans quel sens."),
  q("n2-comb-3", "bougies", "figures_combinees",
    "Les trois actes d'une étoile du matin, dans l'ordre ?",
    ["Chute franche, pause hésitante au plus bas, reprise décidée",
     "Hausse franche, pause, rechute",
     "Trois baisses consécutives de plus en plus fortes",
     "Doji, avalement, marubozu"],
    0,
    "Panique, doute, retour des acheteurs. C'est la séquence complète d'un retournement — et c'est pour ça qu'elle est plus parlante qu'une bougie isolée."),
  q("n2-comb-4", "bougies", "figures_combinees",
    "Dans trois soldats blancs, chaque bougie doit ouvrir :",
    ["Dans le corps de la précédente, pour marquer une progression tenue",
     "Au-dessus du haut de la précédente, pour marquer la force",
     "Exactement à la clôture de la précédente",
     "Peu importe : seules les clôtures comptent"],
    0,
    "Ouvrir dans le corps de la veille distingue une pression d'achat *soutenue* d'une série de gaps — qui serait un autre phénomène, souvent plus fragile."),
  q("n2-comb-5", "bougies", "figures_combinees",
    "Pourquoi ne faut-il jamais juger la dernière bougie isolément ?",
    ["Parce que le sens vient de la séquence : une bougie est une phrase, pas un texte",
     "Parce que la dernière bougie est souvent mal cotée",
     "Parce qu'il faut toujours au moins trois bougies pour une figure valide",
     "Parce que le volume n'est connu qu'à la clôture suivante"],
    0,
    "Une bougie seule est une phrase ; plusieurs forment un paragraphe. Le réflexe à installer : que racontaient les cinq précédentes ?"),

  // --- confirmations / faux_signaux ---
  q("n2-conf-1", "bougies", "confirmations",
    "Attendre une bougie de confirmation, ça coûte quoi et ça apporte quoi ?",
    ["Ça coûte un peu de prix d'entrée et ça élimine beaucoup de faux signaux",
     "Ça ne coûte rien et ça garantit le trade",
     "Ça coûte du temps mais n'apporte aucun avantage statistique",
     "Ça coûte un peu d'entrée et réduit le gain potentiel sans réduire le risque"],
    0,
    "Ce n'est pas de la lâcheté, c'est un arbitrage assumé : tu paies une entrée moins bonne contre un taux d'échec plus bas. Le solde est généralement favorable."),
  q("n2-conf-2", "bougies", "confirmations",
    "Un avalement haussier au milieu d'un range, contre le même sur un niveau respecté trois fois. Même valeur ?",
    ["Non : le contexte prime sur la forme",
     "Oui, la figure est identique donc l'information est identique",
     "Non, celui du range est plus fiable car moins attendu",
     "Oui, si le volume est comparable"],
    0,
    "La règle générale du niveau : cherche une figure *au bon endroit*, jamais une belle figure. Un niveau déjà validé donne à la figure un point d'appui qu'elle n'a pas dans le vide."),
  q("n2-faux-1", "bougies", "faux_signaux",
    "Un marteau parfait apparaît, et le marché continue de chuter. Qu'en conclure ?",
    ["Que la figure a échoué — ce qui est normal, elle décale les probabilités sans rien décider",
     "Que ce n'était pas un vrai marteau",
     "Que tu as mal lu le contexte, nécessairement",
     "Que les figures en chandeliers ne fonctionnent pas"],
    0,
    "C'est la leçon centrale du niveau. L'échec d'une figure n'est pas un défaut de la méthode, c'est sa nature. Un marteau qui échoue reste un marteau correctement identifié."),
  q("n2-faux-2", "bougies", "faux_signaux",
    "Pourquoi la figure la plus évidente du graphique échoue-t-elle souvent ?",
    ["Parce qu'elle attire beaucoup d'ordres au même endroit, donc beaucoup de stops au même endroit",
     "Parce que les figures évidentes sont mal dessinées",
     "Parce que les débutants la tradent et font baisser le prix",
     "Parce que les plateformes retardent l'affichage"],
    0,
    "Cette concentration de stops est précisément ce que les gros acteurs viennent chercher — tu verras le mécanisme au Niveau 4. Une figure très visible est aussi une cible très visible."),
  q("n2-faux-3", "bougies", "faux_signaux",
    "Quelle attitude résume le mieux la lecture des figures ?",
    ["Chercher une figure au bon endroit, plutôt qu'une belle figure",
     "Chercher la figure la plus nette possible, où qu'elle soit",
     "Multiplier les indicateurs pour confirmer chaque figure",
     "Ne traiter que les figures à trois bougies, plus fiables"],
    0,
    "L'emplacement fait la valeur, pas l'esthétique. C'est le principe qui te suivra jusqu'au Niveau 10."),
];

export const QUESTIONS: Question[] = [...N1, ...N2];

export function questionsForLevel(levelSlug: string): Question[] {
  return QUESTIONS.filter((x) => x.level === levelSlug);
}

export function questionsForSkill(skill: string): Question[] {
  return QUESTIONS.filter((x) => x.skill === skill);
}

/**
 * Hachage d'une chaîne en entier 32 bits (FNV-1a).
 *
 * Sert à dériver une graine de mélange propre à chaque question. Une graine
 * naïve du genre `id.length` donnerait la même permutation à toutes les
 * questions dont l'identifiant a la même longueur — et comme les bonnes
 * réponses sont écrites en première position dans ce fichier, elles se
 * retrouveraient affichées au même endroit plusieurs fois de suite.
 */
export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Mélange déterministe (Fisher-Yates piloté par une graine).
 * Déterministe pour la même raison que les exercices sur bougies : un examen
 * doit pouvoir être rejoué à l'identique, et le rendu serveur ne doit pas
 * différer du rendu navigateur.
 */
export function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Sélection d'examen : on tire au moins une question par compétence du niveau
 * avant de compléter. Sans cette contrainte, un tirage au hasard pourrait
 * ignorer complètement une compétence — et l'examen ne vérifierait plus ce
 * qu'il prétend vérifier.
 */
export function examSelection(levelSlug: string, skills: string[], total: number, seed: number): Question[] {
  const pool = questionsForLevel(levelSlug);
  const retenues: Question[] = [];
  const prises = new Set<string>();

  for (const sk of skills) {
    const candidates = shuffle(pool.filter((x) => x.skill === sk), seed + sk.length);
    if (candidates.length) {
      retenues.push(candidates[0]);
      prises.add(candidates[0].id);
    }
  }
  const reste = shuffle(pool.filter((x) => !prises.has(x.id)), seed);
  for (const x of reste) {
    if (retenues.length >= total) break;
    retenues.push(x);
  }
  return shuffle(retenues, seed + 7);
}
