/**
 * ACADÉMIE TRADING — le programme.
 *
 * Principe directeur : on n'enseigne pas des recettes, on enseigne à lire le
 * marché. Chaque niveau se décompose en *compétences* (`Skill`), et une
 * compétence n'est acquise que lorsque l'élève la démontre — pas lorsqu'il a
 * regardé la leçon. C'est ce qui rend la progression sérieuse.
 *
 * Le déblocage est strictement séquentiel : un niveau exige la maîtrise du
 * précédent (voir `progress.ts`). Un élève ne peut pas sauter les probabilités
 * pour aller « aux stratégies » — c'est précisément l'erreur qui ruine les
 * débutants.
 *
 * Le contenu est rédigé en français ; le type accepte les 4 langues du site
 * (`Partial<Record<Lang, string>>`), les traductions viendront s'ajouter sans
 * changer la structure.
 */

import { Lang } from "@/lib/translations";

export type Loc = Partial<Record<Lang, string>>;
export type LocList = Partial<Record<Lang, string[]>>;

/** Type d'activité — c'est ce qui distingue une académie d'une playlist. */
export type ActivityKind =
  | "lecon" // exposé + points clés
  | "drill_bougie" // « que va faire le marché ensuite ? » sur graphique généré
  | "drill_figure" // nommer la figure affichée
  | "quiz" // questions à choix
  | "simulation" // gestion de position / risque
  | "analyse" // l'élève écrit son analyse, l'IA corrige
  | "examen"; // barrage de fin de niveau

export interface Activity {
  slug: string;
  kind: ActivityKind;
  title: Loc;
  /** XP accordé à la réussite. */
  xp: number;
  /** Compétences travaillées (clés de `Skill`). */
  skills: string[];
  /** Paramètres libres, interprétés par le lecteur d'activité. */
  config?: Record<string, unknown>;
}

export interface Lesson {
  slug: string;
  title: Loc;
  /** Emplacement vidéo — vide = « à venir », la leçon reste utilisable. */
  videoId?: string;
  /** Corps de la leçon, paragraphes séparés par \n\n. */
  content: Loc;
  keyPoints?: LocList;
  /** Ce que l'élève doit savoir FAIRE après la leçon, pas seulement savoir. */
  outcome?: Loc;
  activities?: Activity[];
}

export interface Skill {
  key: string;
  label: Loc;
}

export interface Level {
  /** Numéro affiché (1 à 10). */
  n: number;
  slug: string;
  title: Loc;
  /** Promesse du niveau en une phrase. */
  tagline: Loc;
  /** Pourquoi ce niveau existe — la motivation, pas le sommaire. */
  why: Loc;
  icon: string;
  color: string;
  skills: Skill[];
  lessons: Lesson[];
  /** Score minimum à l'examen pour débloquer le niveau suivant, en %. */
  passingScore: number;
  status: "pret" | "bientot";
}

const s = (key: string, fr: string): Skill => ({ key, label: { fr } });

// =============================================================== NIVEAU 1 ===

const N1: Level = {
  n: 1,
  slug: "fondations",
  title: { fr: "Les Fondations" },
  tagline: { fr: "Comprendre ce qu'est réellement un marché avant d'y toucher." },
  why: {
    fr: "La plupart des débutants perdent non pas parce qu'ils ont une mauvaise stratégie, mais parce qu'ils ne savent pas ce qu'ils achètent, à qui, ni pourquoi le prix bouge. Ce niveau élimine cette cause.",
  },
  icon: "monde",
  color: "#0891b2",
  passingScore: 80,
  status: "pret",
  skills: [
    s("marche_role", "Expliquer le rôle d'un marché"),
    s("marches_types", "Distinguer actions, futures, forex, options, crypto"),
    s("prix_formation", "Expliquer comment un prix se forme"),
    s("offre_demande", "Raisonner en offre et demande"),
    s("liquidite", "Reconnaître un marché liquide ou non"),
    s("erreurs_debutant", "Identifier les erreurs classiques du débutant"),
  ],
  lessons: [
    {
      slug: "a-quoi-sert-un-marche",
      title: { fr: "À quoi sert un marché financier" },
      outcome: { fr: "Expliquer avec tes mots pourquoi les marchés existent." },
      content: {
        fr: `Un marché financier n'est pas un casino, et ce n'est pas non plus une machine à enrichir. C'est un lieu de rencontre. D'un côté, des gens qui possèdent quelque chose et veulent s'en séparer. De l'autre, des gens qui veulent l'acquérir. Le marché existe pour que ces deux camps se trouvent.

Une entreprise a besoin d'argent pour construire une usine. Elle vend des parts d'elle-même — des actions. Un agriculteur veut garantir aujourd'hui le prix de sa récolte de dans six mois : il vend un contrat à terme. Une entreprise qui achète à l'étranger doit convertir sa monnaie : elle passe par le forex.

Retiens ceci : derrière chaque mouvement de prix, il y a des humains et des institutions avec des besoins réels. Quand tu vois une bougie monter, ce n'est pas un chiffre qui bouge tout seul. C'est quelqu'un qui a accepté de payer plus cher que le dernier acheteur.`,
      },
      keyPoints: {
        fr: [
          "Un marché sert à faire se rencontrer une offre et une demande.",
          "Chaque prix est le résultat d'un accord entre deux parties.",
          "Le prix ne bouge jamais « tout seul » : quelqu'un a agi.",
        ],
      },
    },
    {
      slug: "les-differents-marches",
      title: { fr: "Les différents marchés" },
      outcome: { fr: "Choisir le marché adapté à ta situation, et savoir lesquels éviter au début." },
      content: {
        fr: `**Les actions** — des parts d'entreprises. Le marché le plus intuitif : tu possèdes un morceau de quelque chose de réel. Horaires fixes, régulation forte.

**Les futures** — des contrats de livraison à date fixe. Très liquides, très rapides, fortement leviérés. C'est le terrain des professionnels : une erreur y coûte cher immédiatement.

**Le forex** — l'échange de monnaies. Ouvert 24h/5j, énorme volume. Le levier proposé y est souvent absurde, et c'est la première cause de ruine des débutants.

**Les options** — le droit d'acheter ou vendre à un prix donné. Puissantes mais complexes : leur prix dépend du temps et de la volatilité, pas seulement de la direction. À aborder tard.

**La crypto** — ouvert 24h/7j, très volatil, régulation faible selon les juridictions.

Un conseil qui vaut le reste du niveau : plus un marché est rapide et leviéré, plus il punit vite l'ignorance. Commence par ce qui est lent.`,
      },
      keyPoints: {
        fr: [
          "Actions : le plus lisible pour débuter.",
          "Futures et forex : rapides et leviérés, donc impitoyables.",
          "Options : leur prix dépend aussi du temps et de la volatilité.",
          "Le levier n'augmente pas tes chances, il accélère le résultat.",
        ],
      },
    },
    {
      slug: "comment-se-forme-un-prix",
      title: { fr: "Comment se forme un prix" },
      outcome: { fr: "Décrire ce qui se passe dans le carnet d'ordres quand un prix monte." },
      content: {
        fr: `À chaque instant, il existe deux prix : le meilleur prix auquel quelqu'un accepte d'acheter (le *bid*) et le meilleur prix auquel quelqu'un accepte de vendre (le *ask*). L'écart entre les deux s'appelle le spread.

Le « prix » que tu vois affiché est simplement celui de la dernière transaction conclue.

Maintenant, le point essentiel. Pour que le prix monte, il ne suffit pas que des gens « veuillent acheter ». Il faut qu'un acheteur consomme tous les ordres de vente disponibles au prix actuel, puis accepte de payer le niveau supérieur. Le prix monte parce que la demande a épuisé l'offre à ce niveau.

C'est pour cette raison qu'un gros ordre peut déplacer le prix violemment quand il n'y a pas grand monde en face — et à peine le déplacer quand le carnet est épais. Tu viens de comprendre la liquidité.`,
      },
      keyPoints: {
        fr: [
          "Bid = meilleure offre d'achat, Ask = meilleure offre de vente.",
          "Le prix affiché est celui de la dernière transaction.",
          "Le prix monte quand la demande épuise l'offre disponible à un niveau.",
        ],
      },
    },
    {
      slug: "offre-et-demande",
      title: { fr: "Offre et demande" },
      outcome: { fr: "Lire un mouvement de prix comme un déséquilibre, pas comme une prédiction." },
      content: {
        fr: `Tout se ramène à un déséquilibre. Si les acheteurs sont plus pressés que les vendeurs, le prix monte. Si les vendeurs sont plus pressés, il descend. « Pressés » est le mot important : ce n'est pas une question de nombre, mais d'urgence.

Un vendeur patient place un ordre et attend. Un vendeur pressé accepte le prix qu'on lui donne, tout de suite. Ce sont ces derniers qui font bouger le prix.

Voilà pourquoi une chute rapide et violente raconte autre chose qu'une baisse lente : dans le premier cas, des gens voulaient sortir à tout prix. Dans le second, l'offre dépasse simplement la demande, sans panique.

Tu apprendras au Niveau 2 que cette différence d'urgence est exactement ce qu'une bougie enregistre.`,
      },
      keyPoints: {
        fr: [
          "Le prix bouge par déséquilibre d'urgence, pas de quantité.",
          "Un mouvement violent signale de l'urgence ; un mouvement lent, un simple déséquilibre.",
          "Une bougie est la trace de ce rapport de force.",
        ],
      },
    },
    {
      slug: "liquidite",
      title: { fr: "La liquidité" },
      outcome: { fr: "Reconnaître un marché où tu peux sortir, et un marché où tu es piégé." },
      content: {
        fr: `La liquidité, c'est ta capacité à entrer et sortir sans déplacer le prix contre toi.

Un marché liquide a beaucoup d'ordres de part et d'autre : tu vends, quelqu'un achète immédiatement au prix affiché. Un marché illiquide a des trous : tu vends, et le prix s'effondre parce qu'il n'y a personne pour absorber.

Signes d'un manque de liquidité : un spread large, des bougies avec de longues mèches sans raison, des trous de prix (gaps), et un volume faible.

Ce concept revient au Niveau 4, sous un angle qui surprend beaucoup de débutants : les institutions ont *besoin* de liquidité pour exécuter leurs gros ordres. Et quand elle manque, elles vont la chercher — souvent là où sont placés les stops des particuliers.`,
      },
      keyPoints: {
        fr: [
          "Liquide = tu peux sortir au prix affiché.",
          "Spread large, volume faible, gaps : méfiance.",
          "Les gros acteurs ont besoin de liquidité — retiens ça pour le Niveau 4.",
        ],
      },
    },
    {
      slug: "pourquoi-le-prix-monte-et-descend",
      title: { fr: "Pourquoi le prix monte et descend" },
      outcome: { fr: "Cesser de chercher « la raison » d'un mouvement dans les nouvelles." },
      content: {
        fr: `Une habitude à casser tout de suite : chercher dans l'actualité la cause de chaque mouvement. Les commentaires du soir expliquent toujours pourquoi le marché a monté — après qu'il a monté. C'est du récit, pas de l'analyse.

Le prix monte pour une seule raison mécanique : des acheteurs ont accepté de payer plus cher. Les nouvelles, les résultats, les taux, la peur — tout cela influence *la décision* des acteurs. Mais la cause immédiate reste toujours la même : quelqu'un a payé plus cher, ou vendu moins cher.

Cette discipline mentale te protège de deux pièges : croire qu'une bonne nouvelle doit faire monter le prix (souvent elle était déjà anticipée), et rester bloqué sur une position parce que « fondamentalement ça devrait monter ».

Le marché n'a pas à être d'accord avec toi.`,
      },
      keyPoints: {
        fr: [
          "La cause immédiate d'un mouvement est toujours une transaction, pas une nouvelle.",
          "Les explications d'après-coup sont du récit.",
          "Une bonne nouvelle déjà anticipée ne fait pas monter le prix.",
        ],
      },
    },
    {
      slug: "erreurs-des-debutants",
      title: { fr: "Les erreurs des débutants" },
      outcome: { fr: "Reconnaître ces erreurs chez toi avant qu'elles ne coûtent." },
      content: {
        fr: `Ces erreurs sont si régulières qu'on peut les lister d'avance.

**Trop gros, trop tôt.** Risquer une part importante du capital sur une conviction. Quelques pertes suffisent alors à rendre la récupération mathématiquement improbable — tu le verras chiffré au Niveau 7.

**Pas de stop, ou un stop déplacé.** Décider de sa perte maximale *après* être entré, c'est laisser l'émotion décider.

**Le revenge trading.** Reprendre position immédiatement après une perte pour « se refaire ». La position n'est plus une analyse, c'est une réaction.

**Confondre chance et compétence.** Trois gains d'affilée ne prouvent rien. Un débutant chanceux augmente sa taille juste avant de rencontrer la réalité.

**Chercher la certitude.** Accumuler indicateurs et confirmations pour supprimer le doute. Le doute ne se supprime pas : il se gère par la taille de position.

**Le levier comme raccourci.** Le levier ne rend pas une mauvaise analyse rentable. Il rend une mauvaise analyse fatale.`,
      },
      keyPoints: {
        fr: [
          "Décide ta perte maximale AVANT d'entrer.",
          "Une série de gains ne prouve pas une compétence.",
          "Le doute se gère par la taille, pas par plus d'indicateurs.",
          "Le levier accélère le résultat, quel qu'il soit.",
        ],
      },
    },
  ],
};

// =============================================================== NIVEAU 2 ===

const N2: Level = {
  n: 2,
  slug: "bougies",
  title: { fr: "Les Bougies" },
  tagline: { fr: "Lire le rapport de force entre acheteurs et vendeurs, bougie par bougie." },
  why: {
    fr: "Une bougie n'est pas un symbole à mémoriser dans un tableau. C'est l'enregistrement d'une bataille : qui a attaqué, qui a cédé, qui a repris la main avant la cloche. Apprends à lire ça, et tu n'as plus besoin de mémoriser de figures.",
  },
  icon: "etincelles",
  color: "#c8960f",
  passingScore: 80,
  status: "pret",
  skills: [
    s("anatomie", "Décomposer une bougie (corps, mèches, OHLC)"),
    s("psychologie", "Traduire une bougie en rapport de force"),
    s("controle", "Dire qui contrôle le marché"),
    s("force_faiblesse", "Distinguer force et faiblesse"),
    s("figures_simples", "Reconnaître les figures à une bougie"),
    s("figures_combinees", "Reconnaître les figures à 2 et 3 bougies"),
    s("sequences", "Lire une séquence, pas une bougie isolée"),
    s("confirmations", "Exiger une confirmation"),
    s("faux_signaux", "Repérer les faux signaux et les pièges"),
    s("prediction", "Estimer la suite probable d'un graphique"),
  ],
  lessons: [
    {
      slug: "anatomie-d-une-bougie",
      title: { fr: "Anatomie d'une bougie" },
      outcome: { fr: "Retrouver open, high, low, close sur n'importe quelle bougie." },
      content: {
        fr: `Une bougie résume une période — une minute, une heure, un jour — avec quatre nombres seulement.

**Open** : le premier prix traité de la période.
**High** : le prix le plus haut atteint.
**Low** : le prix le plus bas atteint.
**Close** : le dernier prix traité.

Ces quatre nombres se dessinent en deux parties. Le **corps** relie l'open au close : c'est le bilan net de la période. Les **mèches** (ou ombres) vont du corps jusqu'au high et au low : ce sont les territoires visités puis abandonnés.

Si le close est au-dessus de l'open, la bougie est haussière — on la dessine claire ou verte. Sinon elle est baissière, sombre ou rouge.

Une chose que beaucoup ratent : **le corps compte plus que les extrêmes**. Le high et le low disent où le prix est allé. Le close dit où il a *tenu*. C'est le close qui compte, parce que c'est le seul prix sur lequel les deux camps se sont mis d'accord pour terminer.`,
      },
      keyPoints: {
        fr: [
          "Quatre nombres : open, high, low, close.",
          "Le corps = le bilan net ; les mèches = les territoires abandonnés.",
          "Le close est le prix le plus important de la bougie.",
        ],
      },
      activities: [
        {
          slug: "identifier-ohlc",
          kind: "quiz",
          title: { fr: "Retrouver l'OHLC" },
          xp: 20,
          skills: ["anatomie"],
        },
      ],
    },
    {
      slug: "ce-que-raconte-une-bougie",
      title: { fr: "Ce que raconte une bougie" },
      outcome: { fr: "Raconter à voix haute l'histoire d'une bougie donnée." },
      content: {
        fr: `Prends une bougie avec un petit corps vert et une très longue mèche basse. Raconte-la dans l'ordre chronologique :

« La période s'ouvre. Les vendeurs prennent le contrôle et poussent le prix loin vers le bas. À un certain niveau, quelque chose se produit : des acheteurs entrent, et pas timidement — ils récupèrent tout le terrain perdu, et la période ferme même légèrement au-dessus de l'ouverture. »

Cette bougie ne « signifie » pas mécaniquement « ça va monter ». Elle documente un fait : à ce niveau bas, une demande sérieuse s'est manifestée. C'est une information, pas une prédiction.

Entraîne-toi systématiquement à cette lecture chronologique. Une longue mèche = un territoire visité puis **rejeté**. Un grand corps = une direction tenue jusqu'au bout. Un petit corps = personne n'a tranché.

C'est tout. Il n'y a rien de plus mystique dans les chandeliers.`,
      },
      keyPoints: {
        fr: [
          "Lis toujours une bougie dans l'ordre : open → extrêmes → close.",
          "Longue mèche = niveau visité puis rejeté.",
          "Une bougie documente un fait, elle ne prédit pas.",
        ],
      },
    },
    {
      slug: "psychologie-de-la-bougie",
      title: { fr: "La psychologie derrière chaque bougie" },
      outcome: { fr: "Dire qui contrôle, et si le contrôle est ferme ou fragile." },
      content: {
        fr: `Trois questions suffisent à lire n'importe quelle bougie.

**Qui a gagné la période ?** Le close par rapport à l'open. Simple.

**A-t-on été contesté ?** Regarde les mèches. Un grand corps sans mèche signifie que personne n'a résisté. Un corps entouré de deux longues mèches signifie que les deux camps ont poussé fort et que le résultat s'est joué de justesse.

**Le gagnant a-t-il fini en force ?** Un close collé au high dans une bougie verte, c'est de la force. Un close vert mais loin sous le high, c'est un aveu de faiblesse : les acheteurs ont gagné, mais ils ont été absorbés en fin de période.

Cette troisième question est celle qui sépare un lecteur débutant d'un lecteur sérieux. Deux bougies vertes de même taille ne racontent pas la même chose selon la position du close dans l'amplitude.

Force et faiblesse ne sont pas des synonymes de vert et rouge. Une bougie rouge qui clôture près de son high, après une chute, montre de la faiblesse *chez les vendeurs*.`,
      },
      keyPoints: {
        fr: [
          "Qui a gagné ? → open vs close.",
          "A-t-on résisté ? → les mèches.",
          "En force ? → position du close dans l'amplitude.",
          "Force ≠ vert. Une rouge peut révéler la faiblesse des vendeurs.",
        ],
      },
    },
    {
      slug: "figures-a-une-bougie",
      title: { fr: "Les figures à une bougie" },
      outcome: { fr: "Nommer et surtout justifier les figures à une bougie." },
      content: {
        fr: `Maintenant que tu sais lire, les noms deviennent de simples raccourcis. Ne mémorise pas les formes — vérifie que tu peux justifier chacune par le rapport de force.

**Doji** — corps minuscule. Le prix finit où il a commencé : personne ne contrôle. Un doji ne dit pas la direction, il dit que la tendance en cours hésite.

**Marteau** — petit corps en haut, longue mèche basse, après une baisse. Rejet d'un niveau bas.

**Pendu** — la même forme, mais après une hausse. Même fait brut, sens opposé : pour la première fois dans la hausse, des vendeurs se sont manifestés violemment.

**Étoile filante** — petit corps en bas, longue mèche haute, après une hausse. Les acheteurs ont été absorbés en haut.

**Marteau inversé** — même forme après une baisse. Tentative de remontée avortée, mais tentative quand même. Signal plus faible.

**Marubozu** — grand corps, presque pas de mèche. Contrôle total du début à la fin.

Note bien : marteau et pendu sont **identiques**. Étoile filante et marteau inversé aussi. Seul le contexte les distingue. C'est la preuve qu'une figure sans contexte ne vaut rien.`,
      },
      keyPoints: {
        fr: [
          "Marteau et pendu ont la même forme : seul le contexte diffère.",
          "Une figure sans contexte ne vaut rien.",
          "Le doji signale l'hésitation, pas une direction.",
        ],
      },
      activities: [
        {
          slug: "nommer-la-figure",
          kind: "drill_figure",
          title: { fr: "Nommer la figure" },
          xp: 25,
          skills: ["figures_simples", "controle"],
          config: { taille: 1 },
        },
      ],
    },
    {
      slug: "combinaisons-et-sequences",
      title: { fr: "Combinaisons et séquences" },
      outcome: { fr: "Lire un groupe de bougies comme un récit continu." },
      content: {
        fr: `Une bougie seule est une phrase. Plusieurs bougies forment un paragraphe — et c'est là que le sens apparaît.

**Avalement haussier** — une verte engloutit tout le corps de la rouge précédente. Le travail d'une période entière de vendeurs effacé en une seule. Changement de main visible.

**Avalement baissier** — le miroir.

**Harami** — une bougie entièrement contenue dans la précédente. L'amplitude se comprime : le marché accumule de l'énergie. Souvent avant un mouvement, sans indiquer le sens.

**Étoile du matin** — trois actes : chute franche, pause hésitante au plus bas, reprise décidée. C'est la séquence complète d'un retournement : la panique, le doute, le retour des acheteurs.

**Étoile du soir** — le miroir : euphorie, doute, reprise en main des vendeurs.

**Trois soldats blancs** — trois vertes franches en escalier, chacune ouvrant dans le corps de la précédente. Pas un saut : une pression soutenue, période après période.

**Trois corbeaux noirs** — distribution méthodique à la baisse.

L'habitude à prendre : ne jamais juger la dernière bougie seule. Demande-toi toujours ce que les cinq précédentes racontaient.`,
      },
      keyPoints: {
        fr: [
          "Une bougie = une phrase. Une séquence = le sens.",
          "L'avalement montre un changement de main.",
          "Le harami comprime : mouvement probable, direction inconnue.",
          "Ne juge jamais la dernière bougie isolément.",
        ],
      },
      activities: [
        {
          slug: "nommer-la-combinaison",
          kind: "drill_figure",
          title: { fr: "Nommer la combinaison" },
          xp: 30,
          skills: ["figures_combinees", "sequences"],
          config: { taille: 3 },
        },
      ],
    },
    {
      slug: "faux-signaux-et-pieges",
      title: { fr: "Faux signaux, confirmations et pièges" },
      outcome: { fr: "Rejeter un signal séduisant mais mal placé." },
      content: {
        fr: `Voici la leçon la plus importante du niveau, et celle que la plupart des cours passent sous silence.

**Une figure échoue souvent.** Ce n'est pas un défaut de la méthode, c'est sa nature. Une figure décale les probabilités ; elle ne décide de rien. Un marteau parfait dans un marché qui continue de chuter reste un marteau parfait — et il a échoué.

**Le contexte prime sur la forme.** Un avalement haussier au milieu d'un range n'a pas la même valeur qu'un avalement haussier sur un niveau que le prix a déjà respecté trois fois.

**La confirmation.** Attendre que la bougie suivante valide l'idée coûte un peu de prix d'entrée et élimine beaucoup de faux signaux. Ce n'est pas de la lâcheté, c'est de la gestion.

**Le piège classique.** Une figure de retournement très visible attire de nombreux ordres au même endroit — donc des stops au même endroit. Cette concentration est précisément ce que les gros acteurs viennent chercher. Tu verras au Niveau 4 pourquoi la figure la plus évidente du graphique est souvent celle qui échoue.

**Les mèches sur faible volume.** En marché illiquide, une longue mèche peut ne traduire aucun rapport de force réel — juste un carnet d'ordres vide.

Conclusion : cherche une figure *au bon endroit*, jamais une belle figure.`,
      },
      keyPoints: {
        fr: [
          "Une figure décale les probabilités, elle ne décide rien.",
          "Le contexte prime toujours sur la forme.",
          "La confirmation coûte un peu d'entrée et évite beaucoup d'erreurs.",
          "Une figure trop évidente attire les stops — et ceux qui les chassent.",
        ],
      },
      activities: [
        {
          slug: "que-va-faire-le-marche",
          kind: "drill_bougie",
          title: { fr: "Que va faire le marché ensuite ?" },
          xp: 40,
          skills: ["prediction", "sequences", "faux_signaux"],
          config: { horizon: 5, fiabilite: 0.62 },
        },
      ],
    },
  ],
};

// ======================================================= NIVEAUX 3 À 10 ====
// Structure et compétences définies : le programme est arrêté, la rédaction
// des leçons suit. Le statut "bientot" les affiche verrouillés mais visibles —
// l'élève voit où il va, ce qui est motivant, sans pouvoir entrer dans du vide.

const N3: Level = {
  n: 3,
  slug: "price-action",
  title: { fr: "Price Action" },
  tagline: { fr: "Lire la structure du marché sans un seul indicateur." },
  why: {
    fr: "Les bougies te disent ce qui vient de se passer. La structure te dit où tu es. Sans elle, tu lis des figures dans le vide — un marteau superbe au milieu de nulle part ne vaut rien, et tu as appris pourquoi au niveau précédent.",
  },
  icon: "progression",
  color: "#7c3aed",
  passingScore: 80,
  status: "pret",
  skills: [
    s("structure", "Identifier la structure du marché"),
    s("hh_hl", "Repérer Higher High et Higher Low"),
    s("lh_ll", "Repérer Lower High et Lower Low"),
    s("bos", "Reconnaître un Break of Structure"),
    s("choch", "Reconnaître un Change of Character"),
    s("supports", "Tracer supports et résistances"),
    s("zones", "Délimiter les zones importantes"),
  ],
  lessons: [
    {
      slug: "qu-est-ce-que-la-structure",
      title: { fr: "Qu'est-ce que la structure du marché" },
      outcome: { fr: "Dire en une phrase où en est un marché, sans aucun indicateur." },
      content: {
        fr: `Un graphique n'avance pas en ligne droite. Il progresse par vagues : une poussée, une pause, une nouvelle poussée. La structure, c'est simplement la façon dont ces vagues s'enchaînent.

Pour la lire, tu n'as besoin que de deux choses : les **sommets** (les points hauts où le prix a fait demi-tour) et les **creux** (les points bas). Rien d'autre. Pas de moyenne mobile, pas d'oscillateur.

Une fois ces points repérés, tu poses une seule question : est-ce que les sommets montent ? est-ce que les creux montent ? Selon les réponses, tu obtiens l'un des trois états possibles du marché.

**Tendance haussière** — les sommets montent ET les creux montent. Chaque recul est acheté plus haut que le précédent : il y a une demande qui n'attend pas.

**Tendance baissière** — les sommets descendent ET les creux descendent.

**Range** — tout le reste. Et ce « tout le reste » est plus large qu'on ne croit : des sommets plus hauts *avec* des creux plus bas, ce n'est pas une tendance, c'est une expansion. Le marché s'agite dans les deux sens. Beaucoup de débutants y voient une hausse parce qu'ils ne regardent que les sommets.

Retiens la règle : **il faut les deux**. Sommets et creux dans le même sens, sinon ce n'est pas une tendance.`,
      },
      keyPoints: {
        fr: [
          "La structure se lit avec deux choses : les sommets et les creux.",
          "Tendance haussière = sommets ET creux qui montent.",
          "Sommets plus hauts avec creux plus bas = expansion, pas tendance.",
          "Trois états seulement : haussier, baissier, range.",
        ],
      },
    },
    {
      slug: "hh-hl-lh-ll",
      title: { fr: "HH, HL, LH, LL : le vocabulaire" },
      outcome: { fr: "Étiqueter chaque sommet et chaque creux d'un graphique." },
      content: {
        fr: `Quatre étiquettes suffisent à décrire n'importe quelle structure. Elles se lisent en comparant chaque point au point **de même nature** qui le précède — un sommet à un sommet, un creux à un creux. Jamais un sommet à un creux.

**HH** — *Higher High*, sommet plus haut que le sommet précédent.
**HL** — *Higher Low*, creux plus haut que le creux précédent.
**LH** — *Lower High*, sommet plus bas que le sommet précédent.
**LL** — *Lower Low*, creux plus bas que le creux précédent.

Une tendance haussière s'écrit donc : HH, HL, HH, HL… Une baissière : LH, LL, LH, LL…

Le plus utile n'est pas de nommer, c'est de **repérer le moment où la série se casse**. Une suite HH, HL, HH, HL, puis soudain un **LH** — un sommet qui n'arrive plus à dépasser le précédent. Rien n'est encore cassé, le prix peut monter encore. Mais les acheteurs viennent d'échouer pour la première fois. C'est une information que tu obtiens *avant* la cassure.

Un détail qui compte : le premier sommet et le premier creux d'un graphique n'ont pas d'étiquette. Plus haut que quoi ? Il n'y a pas de référence. Il faut toujours deux points de même nature pour commencer à lire.`,
      },
      keyPoints: {
        fr: [
          "On compare toujours un sommet à un sommet, un creux à un creux.",
          "Haussier : HH, HL, HH, HL… · Baissier : LH, LL, LH, LL…",
          "Le premier point n'a pas d'étiquette : pas de référence.",
          "Le premier LH d'une hausse est un avertissement, pas une cassure.",
        ],
      },
    },
    {
      slug: "bos-break-of-structure",
      title: { fr: "Break of Structure (BOS)" },
      outcome: { fr: "Distinguer une continuation confirmée d'un simple mouvement." },
      content: {
        fr: `Un **BOS** est une cassure dans le sens de la tendance en cours. Le marché monte, et il franchit son dernier sommet : la structure haussière se prolonge, confirmée. C'est une continuation.

Ça paraît trivial. Le point qui ne l'est pas, c'est **comment** on juge la cassure.

Une cassure se juge sur la **clôture**, pas sur la mèche.

Le prix peut dépasser un sommet en pleine séance puis retomber, et clôturer en dessous. Visuellement la mèche a franchi le niveau. Mais qu'est-ce que ça raconte ? Que le prix est allé là-haut et qu'il a été rejeté — tu sais lire ça depuis le niveau 2. Ce n'est pas une cassure, c'est un rejet. Traiter ces dépassements de mèche comme des BOS est l'une des façons les plus rapides d'accumuler des pertes.

Alors pourquoi la clôture ? Parce que c'est le seul prix sur lequel les deux camps se sont accordés pour terminer la période. Une mèche est une tentative ; une clôture est un résultat.

Et un BOS ne te dit pas d'entrer. Il te dit que la structure tient toujours. C'est un constat sur l'état du marché, pas un signal.`,
      },
      keyPoints: {
        fr: [
          "BOS = cassure dans le sens de la tendance = continuation confirmée.",
          "Une cassure se juge à la CLÔTURE, jamais à la mèche.",
          "Une mèche qui dépasse puis retombe est un rejet, pas une cassure.",
          "Un BOS constate un état, il ne donne pas d'ordre d'entrée.",
        ],
      },
    },
    {
      slug: "choch-change-of-character",
      title: { fr: "Change of Character (CHoCH)" },
      outcome: { fr: "Repérer le premier signe qu'une tendance change de nature." },
      content: {
        fr: `Le **CHoCH** est l'inverse du BOS : une cassure dans le sens **opposé** à la tendance en cours.

Le marché monte en HH et HL. Puis il clôture **sous le dernier HL** — sous le dernier creux plus haut. Pour la première fois depuis le début de la hausse, les vendeurs obtiennent quelque chose qu'ils n'avaient jamais obtenu : ils ont cassé un plancher que les acheteurs défendaient.

Le nom est bien choisi. Ce n'est pas encore un retournement — le prix peut remonter et reprendre sa hausse. C'est un changement de *caractère* : le marché ne se comporte plus comme avant.

La différence entre les deux se résume à une question : **la cassure va-t-elle dans le sens de la tendance ou contre elle ?**

| | Sens | Signification |
|---|---|---|
| BOS | avec la tendance | la structure tient |
| CHoCH | contre la tendance | la structure se fissure |

La confusion classique consiste à appeler CHoCH n'importe quelle bougie rouge dans une hausse. Non : il faut une **clôture sous un creux structurel identifié**. Sans ce niveau précis, il n'y a rien à casser.

Et il faut une tendance pour commencer. Dans un range, ni BOS ni CHoCH n'ont de sens — il n'y a pas de structure à confirmer ou à briser.`,
      },
      keyPoints: {
        fr: [
          "CHoCH = cassure contre le sens de la tendance.",
          "En hausse : clôture sous le dernier HL.",
          "Ce n'est pas un retournement, c'est un changement de caractère.",
          "Sans tendance établie, ni BOS ni CHoCH n'existent.",
        ],
      },
    },
    {
      slug: "supports-et-resistances",
      title: { fr: "Supports et résistances" },
      outcome: { fr: "Tracer un niveau utile et rejeter les niveaux inventés." },
      content: {
        fr: `Un **support** est un niveau où le prix a déjà cessé de baisser. Une **résistance**, un niveau où il a déjà cessé de monter. C'est tout — et c'est du passé, pas une prédiction.

Pourquoi ces niveaux fonctionnent-ils parfois ? Pas par magie. Parce que des acteurs y ont pris des décisions, et qu'ils s'en souviennent. Quelqu'un qui a acheté à ce prix et vu le marché monter rachètera volontiers au même endroit. Quelqu'un qui est resté coincé au-dessus vendra pour sortir à l'équilibre. Le niveau existe parce que des gens ont une raison d'y agir.

Trois règles pour ne pas se raconter d'histoires.

**Un niveau se mérite.** Un point touché une fois n'est pas un support, c'est un point. Deux touches donnent une hypothèse, trois une zone sérieuse.

**Un niveau est une zone, pas un trait.** Le prix ne s'arrête pas au centime. Si tu as besoin d'une précision au centime pour que ton niveau tienne, ton niveau est faux.

**Le plus important : plus un niveau est visible, plus il attire d'ordres — donc de stops au même endroit.** Cette concentration est exactement ce que tu étudieras au Niveau 4. Un support évident n'est pas seulement un endroit où acheter : c'est aussi un endroit où beaucoup de monde placera son stop juste en dessous.

Le piège de ce niveau, c'est de tracer trop de traits. Avec assez de lignes, on trouve toujours une explication après coup. Garde ce que tu peux justifier : un niveau touché plusieurs fois, où il s'est visiblement passé quelque chose.`,
      },
      keyPoints: {
        fr: [
          "Un support/résistance est un fait passé, pas une prédiction.",
          "Une touche = un point. Deux = une hypothèse. Trois = une zone.",
          "C'est une zone, jamais un trait au centime.",
          "Un niveau évident concentre les stops — retiens-le pour le Niveau 4.",
        ],
      },
    },
    {
      slug: "zones-importantes",
      title: { fr: "Les zones qui comptent vraiment" },
      outcome: { fr: "Hiérarchiser les niveaux au lieu de les empiler." },
      content: {
        fr: `Tu sais tracer des niveaux. Le vrai travail est maintenant de savoir **lesquels ignorer**.

Ce qui donne du poids à une zone :

**Le nombre de réactions.** Trois pivots au même prix valent mieux qu'un. Chaque réaction est la preuve qu'il s'y passe quelque chose de répété.

**La violence de la réaction.** Un prix qui quitte une zone lentement raconte moins qu'un prix qui en part d'un coup. Le second signale qu'un déséquilibre attendait là.

**L'échelle de temps.** Un niveau visible sur le graphique journalier pèse plus qu'un niveau de cinq minutes. Plus d'acteurs le voient, donc plus de monde y réagit.

**Le rôle inversé.** Une résistance cassée devient souvent un support, et inversement. Les acheteurs qui n'ont pas osé au-dessus reviennent au retest.

Et un point de méthode qui change tout : **change d'échelle**. La même série de bougies observée avec un pas plus large montre moins de sommets, mais des sommets plus importants. Les zigzags qui semblaient décisifs disparaissent. Faire varier cette sensibilité et voir la structure se simplifier est le meilleur exercice de ce niveau — c'est ce qui t'apprend à distinguer le bruit du mouvement.

Si un graphique te donne quinze niveaux, tu n'en as aucun. Trois ou quatre que tu peux défendre suffisent.`,
      },
      keyPoints: {
        fr: [
          "Nombre de réactions, violence du départ, échelle de temps : voilà le poids d'une zone.",
          "Une résistance cassée devient souvent un support.",
          "Change d'échelle : la structure se simplifie, le bruit disparaît.",
          "Quinze niveaux = aucun niveau. Trois que tu peux défendre suffisent.",
        ],
      },
      activities: [
        {
          slug: "lire-la-structure",
          kind: "drill_bougie",
          title: { fr: "Lire la structure" },
          xp: 40,
          skills: ["structure", "hh_hl", "lh_ll"],
          config: { mode: "structure" },
        },
      ],
    },
  ],
};

const N4: Level = {
  n: 4,
  slug: "institutions",
  title: { fr: "Comprendre les institutions" },
  tagline: { fr: "Pourquoi le marché va souvent chercher tes stops avant de partir." },
  why: {
    fr: "Tant que tu ignores qui déplace réellement le prix, tu interprètes ses mouvements à l'envers : tu vois une cassure là où quelqu'un se sert, et tu places ton stop exactement là où on viendra le chercher.",
  },
  icon: "batiment",
  color: "#1d4ed8",
  passingScore: 80,
  status: "pret",
  skills: [
    s("acteurs", "Identifier qui déplace le marché"),
    s("liquidite_inst", "Expliquer le besoin institutionnel de liquidité"),
    s("stop_hunt", "Reconnaître un stop hunt"),
    s("fausses_cassures", "Repérer une fausse cassure"),
    s("manipulation", "Distinguer manipulation et hasard"),
  ],
  lessons: [
    {
      slug: "qui-deplace-le-marche",
      title: { fr: "Qui déplace réellement le marché" },
      outcome: { fr: "Cesser de te croire seul face à un graphique neutre." },
      content: {
        fr: `Les participants d'un marché n'ont ni la même taille, ni les mêmes contraintes, ni le même objectif. Les mettre tous dans le même sac est la première erreur.

**Les particuliers.** Positions petites, entrées et sorties libres, aucune obligation. Ils ne déplacent pas le prix — sauf tous ensemble, dans le même sens, ce qui arrive et qui est précisément exploitable.

**Les institutions.** Fonds, banques, assureurs, teneurs de marché. Positions énormes. Et surtout : des **contraintes**. Un fonds qui doit investir une collecte n'a pas le choix d'attendre. Un assureur doit couvrir une échéance à date fixe. Un tenede marché est obligé d'afficher un prix des deux côtés, même quand ça l'arrange mal.

Cette différence de contrainte est le cœur du niveau. Un particulier peut ne rien faire. Une institution doit souvent agir, à un moment donné, pour une taille donnée.

Et quand tu dois acheter très gros, tu as un problème que le particulier n'a jamais : **si tu achètes en une fois, tu fais monter le prix contre toi**. Ton propre ordre dégrade ton propre prix d'entrée.

C'est de ce problème que découle tout le reste du niveau. Pas d'un complot : d'une contrainte arithmétique.`,
      },
      keyPoints: {
        fr: [
          "Les acteurs diffèrent par leur taille ET par leurs contraintes.",
          "Un particulier peut attendre ; une institution doit souvent agir.",
          "Un gros ordre exécuté d'un coup dégrade son propre prix d'entrée.",
          "Tout ce niveau découle de cette contrainte, pas d'un complot.",
        ],
      },
    },
    {
      slug: "le-besoin-de-liquidite",
      title: { fr: "Le besoin de liquidité" },
      outcome: { fr: "Expliquer pourquoi un gros acteur cherche des zones précises." },
      content: {
        fr: `Reprends le problème. Tu dois acheter l'équivalent de 500 fois le volume affiché au meilleur prix. Que fais-tu ?

Si tu envoies tout au marché, tu consommes toute l'offre disponible et tu montes de niveau en niveau. Ton prix moyen finit très au-dessus de ce que tu voulais payer. Personne ne travaille comme ça.

Ce qu'il te faut, c'est **des vendeurs**. Beaucoup, au même endroit, prêts à te livrer sans que tu aies à courir après le prix.

Alors où trouve-t-on une concentration de vendeurs ? À un endroit très simple : là où beaucoup de gens ont décidé d'avance de vendre. C'est-à-dire **là où sont les ordres stop**.

Reprends ce que tu sais du Niveau 3. Un support évident, touché trois fois. Où les acheteurs placent-ils leur stop ? Juste en dessous. Tous au même endroit. Et un stop de vente, quand il se déclenche, est un ordre de vente au marché.

Sous ce support dort donc un réservoir de vendeurs involontaires. Pour qui veut acheter gros, c'est exactement la contrepartie nécessaire.

Tu peux maintenant relire un graphique autrement : les zones les plus évidentes ne sont pas seulement des niveaux où réagir. Ce sont des **réserves de liquidité**, et quelqu'un a une bonne raison d'aller les chercher.`,
      },
      keyPoints: {
        fr: [
          "Un gros acheteur a besoin de vendeurs concentrés au même endroit.",
          "Les stops groupés forment exactement cette concentration.",
          "Un stop de vente déclenché EST un ordre de vente au marché.",
          "Les niveaux les plus évidents sont les réserves les plus visibles.",
        ],
      },
    },
    {
      slug: "le-stop-hunt",
      title: { fr: "Le stop hunt" },
      outcome: { fr: "Reconnaître la signature d'un balayage de stops." },
      content: {
        fr: `Le scénario, maintenant que tu as les deux morceaux.

Un support net à 100, touché trois fois. Des centaines de particuliers sont acheteurs au-dessus, stops placés vers 99. Un gros acteur veut acheter, et il a besoin de contrepartie.

Le prix descend sous 100. Les stops se déclenchent en cascade : chacun devient un ordre de vente. Pendant quelques minutes, le marché déborde de vendeurs. C'est exactement le moment où un gros acheteur peut se remplir sans faire monter le prix.

Puis le prix remonte. Vite. Souvent au-dessus de 100.

Résultat vu du particulier : « je me suis fait sortir au plus bas et ça est reparti sans moi ». Résultat vu du gros acteur : position construite à bon prix.

**La signature à reconnaître :**

Une mèche marquée qui passe sous un niveau évident, une **clôture qui revient au-dessus**, et un retour rapide. Tu sais déjà lire ça : c'est un rejet (Niveau 2) qui ne produit pas de cassure (Niveau 3). Le vocabulaire change, la lecture est la même.

**Ce que ça change pour toi**, concrètement : ne place pas ton stop juste sous un niveau que tout le monde voit. Non pas parce qu'« ils » te visent personnellement — personne ne connaît ton stop. Mais parce que ton stop est au milieu d'une foule, et que la foule est la cible.`,
      },
      keyPoints: {
        fr: [
          "Un stop de vente déclenché fournit la contrepartie d'un gros achat.",
          "Signature : mèche sous le niveau, clôture au-dessus, retour rapide.",
          "C'est un rejet qui ne produit pas de cassure — vocabulaire des niveaux 2 et 3.",
          "Évite de placer ton stop dans la foule, juste sous un niveau évident.",
        ],
      },
    },
    {
      slug: "fausses-cassures",
      title: { fr: "Les fausses cassures" },
      outcome: { fr: "Distinguer une cassure qui tient d'un balayage." },
      content: {
        fr: `Une fausse cassure, c'est un niveau franchi qui ne tient pas. Le prix passe au-delà, attire ceux qui traitent la cassure, puis revient et repart dans l'autre sens.

Le critère de distinction, tu l'as depuis le Niveau 3 : **la clôture**.

**Cassure qui tient** — clôture nette au-delà du niveau, puis le prix reste de ce côté. Un BOS s'inscrit dans la structure.

**Fausse cassure** — mèche au-delà, clôture en deçà. Aucun BOS. La structure n'a pas bougé, et pourtant beaucoup ont acheté la cassure.

Pourquoi ça piège autant de monde ? Parce qu'en séance, la mèche est *vraie*. Le prix est vraiment allé au-delà. Ceux qui entrent sur dépassement de niveau — sans attendre la clôture — sont servis. Ils ne découvrent le problème qu'à la clôture, quand le prix est déjà revenu.

Un signe supplémentaire, utile : **la vitesse du retour**. Une vraie cassure a tendance à consolider au-delà du niveau. Une fausse revient vite, souvent violemment — parce que le mouvement de retour est alimenté par la sortie de ceux qui viennent d'entrer.

Et méfie-toi du miroir de cette leçon : toutes les mèches ne sont pas des pièges. Une mèche en marché illiquide ne raconte parfois rien du tout (Niveau 1). Le contexte reste roi.`,
      },
      keyPoints: {
        fr: [
          "Cassure qui tient = clôture au-delà. Fausse cassure = mèche seule.",
          "Une fausse cassure ne produit aucun BOS : la structure est intacte.",
          "Elle piège ceux qui entrent au dépassement, sans attendre la clôture.",
          "Un retour rapide et violent est un indice supplémentaire.",
        ],
      },
      activities: [
        {
          slug: "vraie-ou-fausse-cassure",
          kind: "drill_bougie",
          title: { fr: "Vraie ou fausse cassure ?" },
          xp: 45,
          skills: ["fausses_cassures", "stop_hunt", "manipulation"],
          config: { mode: "cassure" },
        },
      ],
    },
    {
      slug: "manipulation-ou-hasard",
      title: { fr: "Manipulation ou hasard ?" },
      outcome: { fr: "Résister à l'explication complotiste, qui coûte cher." },
      content: {
        fr: `Cette leçon est la plus importante du niveau, et elle va dans le sens inverse des précédentes.

Tu viens d'apprendre que de gros acteurs vont chercher la liquidité là où elle se trouve. C'est vrai, c'est documenté, et ça découle d'une contrainte arithmétique. Mais un piège s'ouvre juste derrière : expliquer **chacune** de tes pertes par une manipulation dirigée contre toi.

C'est confortable — ce n'est jamais ton analyse qui était fausse. Et c'est exactement pour ça que c'est dangereux : une explication qui te déresponsabilise t'empêche d'apprendre.

**Trois vérités à tenir ensemble.**

**Personne ne connaît ton stop.** Ton courtier voit ton ordre, pas le marché. Un balayage de stops ne vise pas *toi* : il vise une zone où beaucoup de stops se ressemblent. Tu n'es pas ciblé, tu es dans la foule.

**Beaucoup de mouvements n'ont aucune intention derrière.** Un prix qui dépasse un niveau puis revient, ça arrive aussi par simple hasard. Un marché est bruyant. Voir une intention dans chaque mèche, c'est le même biais que voir une figure dans chaque nuage.

**La différence pratique : rien.** Que ta perte vienne d'un balayage organisé ou du hasard, ta réponse est identique — attendre la clôture, ne pas mettre son stop dans la foule, dimensionner sa position. La question « était-ce une manipulation ? » n'a aucune conséquence sur ce que tu dois faire.

C'est le vrai test du niveau. Un trader mûr utilise ces notions pour **placer ses ordres différemment**, pas pour se raconter qu'on lui en veut.`,
      },
      keyPoints: {
        fr: [
          "Personne ne connaît ton stop : tu n'es pas ciblé, tu es dans la foule.",
          "Beaucoup de dépassements suivis d'un retour sont du simple bruit.",
          "Manipulation ou hasard, ta réponse pratique est la même.",
          "Utilise ces notions pour placer tes ordres, pas pour te déresponsabiliser.",
        ],
      },
    },
    {
      slug: "ce-que-ca-change",
      title: { fr: "Ce que ça change dans ta façon de faire" },
      outcome: { fr: "Traduire ce niveau en trois décisions concrètes." },
      content: {
        fr: `Un niveau qui ne change pas ta façon d'agir n'a servi à rien. Voici ce qui devrait changer.

**1. Attendre la clôture.** C'est la conclusion la plus rentable de tout le cours jusqu'ici, et la plus simple. Elle t'écarte des fausses cassures sans aucune analyse supplémentaire. Elle coûte un peu de prix d'entrée — tu connais cet arbitrage depuis le Niveau 2.

**2. Décaler ses stops de la foule.** Pas de stop à un centime sous un support que tout le monde voit. Soit plus loin, sous la zone entière plutôt que sous le trait, soit ailleurs selon ton plan. Ce qui implique une position plus petite pour un risque égal — et ce n'est pas un défaut, c'est le Niveau 7 qui commence.

**3. Voir les niveaux évidents comme des zones à double sens.** Un support très visible n'est plus seulement « un endroit où acheter ». C'est aussi un réservoir de liquidité que quelqu'un peut venir chercher. Les deux lectures sont vraies en même temps.

Et une chose qui ne change pas : tu ne sauras jamais avec certitude ce qui s'est passé. Tu n'as pas accès aux intentions, seulement aux traces. Ce niveau ne te donne pas de vision — il te donne de meilleures habitudes.`,
      },
      keyPoints: {
        fr: [
          "Attendre la clôture : la règle la plus rentable, et la plus simple.",
          "Ne pas placer son stop dans la foule — donc position plus petite.",
          "Un niveau évident est à la fois un appui et un réservoir de liquidité.",
          "Tu lis des traces, jamais des intentions.",
        ],
      },
    },
  ],
};

const N5: Level = {
  n: 5,
  slug: "momentum",
  title: { fr: "Le Momentum" },
  tagline: { fr: "Sentir quand un marché accélère, et quand il s'essouffle." },
  why: {
    fr: "La direction ne suffit pas. Un marché peut monter en s'essoufflant — le prix dit où il va, le momentum dit avec quelle conviction. C'est cette conviction qui décide du moment d'agir, et du moment de s'abstenir.",
  },
  icon: "eclair",
  color: "#ea580c",
  passingScore: 80,
  status: "pret",
  skills: [
    s("force_marche", "Reconnaître un marché fort"),
    s("faiblesse_marche", "Reconnaître un marché qui faiblit"),
    s("acceleration", "Détecter une accélération"),
    s("ralentissement", "Détecter un ralentissement"),
  ],
  lessons: [
    {
      slug: "momentum-n-est-pas-direction",
      title: { fr: "Le momentum n'est pas la direction" },
      outcome: { fr: "Séparer deux questions que tu confondais probablement." },
      content: {
        fr: `Jusqu'ici tu as appris à répondre à « où va le marché ». Ce niveau ajoute une question distincte : **avec quelle conviction y va-t-il ?**

Ce sont deux axes indépendants. Un marché peut monter avec force, monter en s'essoufflant, baisser avec force, baisser en s'essoufflant. Quatre situations, deux directions seulement.

Et l'essentiel : **le momentum change souvent avant le prix**. Une hausse qui ralentit monte encore. Rien n'a cassé, la structure est intacte, les sommets sont toujours plus hauts — mais les bougies rétrécissent, les clôtures s'éloignent des sommets, chaque poussée gagne moins de terrain que la précédente. C'est une information que tu obtiens *avant* le retournement, et avant même le premier LH du Niveau 3.

Comment le mesurer sans indicateur ? En comparant le proche au moins proche. Trois questions :

**Les corps grandissent-ils ou rétrécissent-ils ?** Un corps est une décision. Des corps qui grossissent signalent des décisions plus tranchées.

**L'amplitude s'élargit-elle ?** Le marché prend-il plus de place ?

**Le prix avance-t-il plus vite ?** Combien de terrain net par période ?

Cette troisième question est la plus importante, et la leçon 5 t'expliquera pourquoi elle peut contredire les deux premières.`,
      },
      keyPoints: {
        fr: [
          "Direction et momentum sont deux axes indépendants.",
          "Le momentum change souvent AVANT le prix.",
          "On le mesure en comparant une fenêtre récente à celle qui la précède.",
          "Corps, amplitude, vitesse — et la vitesse primera.",
        ],
      },
    },
    {
      slug: "marche-fort",
      title: { fr: "Reconnaître un marché fort" },
      outcome: { fr: "Décrire à voix haute ce qui rend un mouvement crédible." },
      content: {
        fr: `Trois signes se cumulent dans un marché réellement fort. Tu les connais déjà tous les trois — ils viennent du Niveau 2, appliqués à une série au lieu d'une bougie.

**Les bougies vont dans le même sens.** Dans une hausse forte, la grande majorité des bougies sont vertes. Pas toutes — un marché sans aucune respiration est rare, et souvent le signe d'une phase terminale. Mais l'alignement domine.

**Les corps occupent une grande part de l'amplitude.** Peu de mèches signifie peu de contestation. Le camp gagnant tient la période de bout en bout.

**Les clôtures se font près de l'extrême du mouvement.** C'est le signe le plus fiable, et c'est exactement la troisième question du Niveau 2 : finir en force ou non. Dans une hausse forte, les bougies clôturent près de leur haut. Ce n'est pas un détail esthétique — ça veut dire que personne n'a réussi à faire refluer le prix avant la cloche.

**Ce que la force ne dit pas.** Elle ne dit pas que le mouvement va continuer. Un marché très fort peut être en train de terminer son mouvement — l'euphorie finale ressemble beaucoup à de la force. La force te dit dans quel sens le déséquilibre penche *maintenant*, pas combien de temps il durera.`,
      },
      keyPoints: {
        fr: [
          "Bougies alignées, corps larges, clôtures près des extrêmes.",
          "La position de la clôture est le signe le plus fiable.",
          "Un marché sans aucune respiration est souvent en phase terminale.",
          "La force décrit le présent, elle ne prédit pas la durée.",
        ],
      },
    },
    {
      slug: "marche-qui-faiblit",
      title: { fr: "Reconnaître un marché qui faiblit" },
      outcome: { fr: "Repérer l'essoufflement pendant que le prix monte encore." },
      content: {
        fr: `L'essoufflement est plus difficile à voir que la force, parce qu'il se produit **pendant que le prix va encore dans le bon sens**. C'est ce qui le rend précieux.

Les signes, dans l'ordre où ils apparaissent généralement :

**Les corps rétrécissent.** Même direction, moins de conviction. Chaque période tranche moins que la précédente.

**Les mèches s'allongent du côté opposé.** Dans une hausse, des mèches hautes de plus en plus longues : le prix monte, se fait repousser, remonte, se fait repousser. L'offre se réveille.

**Les clôtures s'éloignent des sommets.** Un marché fort clôture près du haut. Un marché qui faiblit gagne encore du terrain mais le rend en partie avant la cloche.

**Chaque poussée gagne moins que la précédente.** Trois vagues de hausse de 8 %, puis 5 %, puis 2 % : la structure est toujours haussière, chaque sommet est plus haut. Mais la mécanique s'épuise.

**Ce que ce n'est pas.** L'essoufflement n'est pas un signal de vente. C'est une raison de réduire ses attentes, de serrer sa gestion, de ne pas ajouter à une position. Beaucoup de traders perdent de l'argent en vendant à découvert un marché qui « faiblit » et qui continue de monter trois mois.

Le lien avec le Niveau 3 est direct : l'essoufflement précède souvent le premier LH, qui précède le CHoCH, qui précède le retournement. Tu es en train d'apprendre à lire de plus en plus tôt.`,
      },
      keyPoints: {
        fr: [
          "L'essoufflement se voit pendant que le prix monte encore.",
          "Corps qui rétrécissent, mèches opposées qui s'allongent, clôtures qui décrochent.",
          "Chaque poussée gagne moins que la précédente.",
          "Ce n'est PAS un signal de vente — c'est une raison de réduire ses attentes.",
        ],
      },
    },
    {
      slug: "acceleration",
      title: { fr: "L'accélération" },
      outcome: { fr: "Distinguer une accélération saine d'une fuite en avant." },
      content: {
        fr: `Une accélération, c'est quand tout s'amplifie en même temps : corps plus grands, amplitudes plus larges, et surtout **plus de terrain parcouru par période**.

Ce qui la provoque, tu le sais déjà. Une cassure de structure qui déclenche une vague d'ordres (Niveau 3). Une zone de liquidité consommée (Niveau 4). Une nouvelle qui contredit ce qui était anticipé (Niveau 1). Dans tous les cas : un déséquilibre soudain entre gens pressés et gens patients.

**Le piège de l'accélération.** Elle est le moment le plus tentant d'entrer, et souvent le plus mauvais. Quand tout le monde voit le mouvement, le prix a déjà parcouru l'essentiel du chemin. Entrer dans une accélération, c'est acheter au moment où ceux qui étaient positionnés avant commencent à prendre leurs bénéfices — c'est-à-dire te vendre leur position.

Comment distinguer une accélération exploitable d'une fuite en avant ?

**Le point de départ.** Une accélération qui démarre depuis une zone identifiée, après une structure claire, est autre chose qu'une accélération au milieu de nulle part, après que le prix a déjà triplé.

**La durée.** Une accélération dure rarement longtemps. Par nature, elle épuise ce qui l'alimente : les gens pressés finissent par être servis.

**Ce qui suit.** Après une accélération, un marché consolide ou se retourne. Il ne continue pas à accélérer indéfiniment — la fin de l'accélération est presque plus informative que son début.`,
      },
      keyPoints: {
        fr: [
          "Accélération = corps, amplitude ET vitesse qui augmentent ensemble.",
          "C'est le moment le plus tentant d'entrer, et souvent le plus mauvais.",
          "Une accélération épuise ce qui l'alimente : elle dure peu.",
          "Sa fin informe presque plus que son début.",
        ],
      },
    },
    {
      slug: "ralentissement",
      title: { fr: "Le ralentissement, et un piège" },
      outcome: { fr: "Ne plus confondre agitation et progression." },
      content: {
        fr: `Un ralentissement, c'est l'inverse : les corps rétrécissent, les amplitudes se resserrent, le prix avance moins par période. Le marché reprend son souffle — soit avant de repartir, soit avant de se retourner. Le ralentissement seul ne dit pas lequel.

Maintenant le piège de ce niveau, et il est important.

**De grosses bougies ne signifient pas du momentum.**

Imagine huit bougies énormes qui alternent : +5, −5, +5, −5… Les corps sont massifs, les amplitudes énormes. Un œil non entraîné voit un marché « très actif », donc « fort ».

Mais où est allé le prix ? Nulle part. Il est revenu à son point de départ.

C'est de l'**expansion de volatilité**, pas du momentum. Le marché s'agite, il n'avance pas. Et c'est souvent bien plus dangereux qu'un marché calme : les mouvements sont larges, donc les stops sautent dans les deux sens, alors que rien ne progresse.

C'est pour cette raison que la **vitesse** — la distance nette parcourue par période — compte plus que la taille des bougies. Deux marchés peuvent avoir les mêmes corps et des momentums opposés.

Retiens la formule : **sans avancée, pas d'accélération**, quelle que soit la taille des bougies. C'est d'ailleurs comme ça que le système d'exercices est calibré : une série qui s'agite sans progresser est classée en *perte* de momentum, jamais en accélération.`,
      },
      keyPoints: {
        fr: [
          "Ralentissement : corps, amplitudes et vitesse qui diminuent.",
          "De grosses bougies alternées = expansion de volatilité, pas momentum.",
          "La distance NETTE parcourue compte plus que la taille des bougies.",
          "Sans avancée, pas d'accélération.",
        ],
      },
      activities: [
        {
          slug: "accelere-ou-essouffle",
          kind: "drill_bougie",
          title: { fr: "Accélère ou s'essouffle ?" },
          xp: 40,
          skills: ["ralentissement", "acceleration", "faiblesse_marche"],
          config: { mode: "momentum" },
        },
      ],
    },
    {
      slug: "utiliser-le-momentum",
      title: { fr: "Ce que le momentum change dans ta façon de faire" },
      outcome: { fr: "Traduire ce niveau en décisions, pas en opinions." },
      content: {
        fr: `Le momentum ne te donne pas de signal d'entrée. Il modifie **la façon dont tu traites les signaux que tu as déjà**.

**Il filtre.** Une figure de continuation dans un marché qui s'essouffle vaut moins que la même figure dans un marché qui accélère. Même figure, contexte différent — tu connais ce principe depuis le Niveau 2, le momentum en est une nouvelle couche.

**Il tempère les attentes.** Dans un marché qui ralentit, viser un grand mouvement est peu réaliste. Ce n'est pas une raison de ne rien faire : c'est une raison de prendre ses bénéfices plus tôt.

**Il avertit tôt.** L'essoufflement apparaît avant le premier LH, qui apparaît avant le CHoCH, qui apparaît avant le retournement. Chaque niveau de ce cours t'a fait lire un peu plus tôt. C'est cumulatif.

**Il dit quand s'abstenir.** Un marché en expansion de volatilité sans progression est le pire terrain pour la plupart des approches : les mouvements sont larges, les stops sautent dans les deux sens, rien n'aboutit. Reconnaître ce régime pour ne pas y trader est une compétence à part entière — et probablement la plus rentable de ce niveau.

Un avertissement pour finir. Le momentum est la notion la plus subjective vue jusqu'ici. « Ça ralentit » est une impression facile à se raconter après coup. C'est pourquoi les exercices le mesurent explicitement : pour que tu confrontes ton impression à un calcul, et que tu ajustes ton œil.`,
      },
      keyPoints: {
        fr: [
          "Le momentum filtre les signaux, il n'en produit pas.",
          "Marché qui ralentit : viser moins loin, pas s'interdire d'agir.",
          "Il avertit avant le LH, qui avertit avant le CHoCH.",
          "Savoir s'abstenir en expansion sans progression est la compétence la plus rentable ici.",
        ],
      },
    },
  ],
};

const N6: Level = {
  n: 6,
  slug: "probabilites",
  title: { fr: "Les Probabilités" },
  tagline: { fr: "Accepter qu'on ne sait jamais — et agir quand même." },
  why: { fr: "Le trading ne récompense pas ceux qui ont raison, mais ceux qui gèrent le fait de ne pas savoir." },
  icon: "balance",
  color: "#0d9488",
  passingScore: 85,
  status: "bientot",
  skills: [
    s("incertitude", "Accepter l'absence de certitude"),
    s("penser_proba", "Raisonner en probabilités"),
    s("echantillon", "Juger sur un échantillon, pas sur un trade"),
    s("variance", "Distinguer variance et erreur"),
  ],
  lessons: [],
};

const N7: Level = {
  n: 7,
  slug: "gestion-du-risque",
  title: { fr: "Gestion du risque" },
  tagline: { fr: "Le seul niveau qui décide si tu es encore là dans un an." },
  why: { fr: "Une bonne stratégie mal dimensionnée ruine. Une stratégie moyenne bien dimensionnée survit. La gestion du risque compte plus que la stratégie." },
  icon: "bouclier",
  color: "#16a34a",
  passingScore: 90,
  status: "bientot",
  skills: [
    s("taille_position", "Calculer une taille de position"),
    s("risque_trade", "Fixer un risque par trade"),
    s("drawdown", "Comprendre le drawdown"),
    s("esperance", "Calculer une espérance"),
    s("ratio_rr", "Utiliser le ratio risque/rendement"),
    s("capital", "Protéger le capital"),
    s("survie", "Raisonner en survie de compte"),
  ],
  lessons: [],
};

const N8: Level = {
  n: 8,
  slug: "psychologie",
  title: { fr: "Psychologie" },
  tagline: { fr: "Identifier tes propres faiblesses avant que le marché ne les trouve." },
  why: { fr: "Tu connaîtras les règles. Les appliquer sous pression est un autre métier." },
  icon: "idee",
  color: "#db2777",
  passingScore: 80,
  status: "bientot",
  skills: [
    s("peur", "Reconnaître la peur en action"),
    s("avidite", "Reconnaître l'avidité"),
    s("patience", "Développer la patience"),
    s("discipline", "Tenir sa discipline"),
    s("fomo", "Résister au FOMO"),
    s("revenge", "Éviter le revenge trading"),
    s("exces_confiance", "Détecter l'excès de confiance"),
  ],
  lessons: [],
};

const N9: Level = {
  n: 9,
  slug: "strategie",
  title: { fr: "Construire ta stratégie" },
  tagline: { fr: "Écrire tes propres règles, au lieu d'emprunter celles des autres." },
  why: { fr: "Une stratégie copiée s'abandonne à la première série de pertes. Une stratégie comprise se tient." },
  icon: "cible",
  color: "#4f46e5",
  passingScore: 85,
  status: "bientot",
  skills: [
    s("entree", "Définir des conditions d'entrée"),
    s("sortie", "Définir des conditions de sortie"),
    s("stop_loss", "Placer un stop loss cohérent"),
    s("take_profit", "Placer un take profit cohérent"),
    s("gestion_position", "Gérer une position ouverte"),
    s("journal", "Tenir un journal de trading"),
  ],
  lessons: [],
};

const N10: Level = {
  n: 10,
  slug: "autonomie",
  title: { fr: "Devenir autonome" },
  tagline: { fr: "Le système retire ses aides. Tu analyses seul, il corrige." },
  why: { fr: "L'objectif n'a jamais été que tu suives une méthode. C'est que tu n'aies plus besoin de nous." },
  icon: "couronne",
  color: "#c8960f",
  passingScore: 90,
  status: "bientot",
  skills: [
    s("analyse_autonome", "Analyser un graphique sans aide"),
    s("justification", "Justifier chaque décision"),
    s("auto_critique", "Critiquer sa propre analyse"),
    s("plan_complet", "Produire un plan de trade complet"),
  ],
  lessons: [],
};

export const LEVELS: Level[] = [N1, N2, N3, N4, N5, N6, N7, N8, N9, N10];

export const LEVEL_BY_SLUG: Record<string, Level> = Object.fromEntries(
  LEVELS.map((l) => [l.slug, l]),
);

export function getLevel(slug: string): Level | undefined {
  return LEVEL_BY_SLUG[slug];
}

/** Toutes les compétences du programme, tous niveaux confondus. */
export const ALL_SKILLS: Skill[] = LEVELS.flatMap((l) => l.skills);

export function countLessons(l: Level): number {
  return l.lessons.length;
}

export const TOTAL_LESSONS = LEVELS.reduce((n, l) => n + l.lessons.length, 0);
export const TOTAL_SKILLS = ALL_SKILLS.length;
