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
  why: { fr: "Les bougies te disent ce qui vient de se passer. La structure te dit où tu es." },
  icon: "progression",
  color: "#7c3aed",
  passingScore: 80,
  status: "bientot",
  skills: [
    s("structure", "Identifier la structure du marché"),
    s("hh_hl", "Repérer Higher High et Higher Low"),
    s("lh_ll", "Repérer Lower High et Lower Low"),
    s("bos", "Reconnaître un Break of Structure"),
    s("choch", "Reconnaître un Change of Character"),
    s("supports", "Tracer supports et résistances"),
    s("zones", "Délimiter les zones importantes"),
  ],
  lessons: [],
};

const N4: Level = {
  n: 4,
  slug: "institutions",
  title: { fr: "Comprendre les institutions" },
  tagline: { fr: "Pourquoi le marché va souvent chercher tes stops avant de partir." },
  why: { fr: "Tant que tu ignores qui déplace réellement le prix, tu interprètes ses mouvements à l'envers." },
  icon: "batiment",
  color: "#1d4ed8",
  passingScore: 80,
  status: "bientot",
  skills: [
    s("acteurs", "Identifier qui déplace le marché"),
    s("liquidite_inst", "Expliquer le besoin institutionnel de liquidité"),
    s("stop_hunt", "Reconnaître un stop hunt"),
    s("fausses_cassures", "Repérer une fausse cassure"),
    s("manipulation", "Distinguer manipulation et hasard"),
  ],
  lessons: [],
};

const N5: Level = {
  n: 5,
  slug: "momentum",
  title: { fr: "Le Momentum" },
  tagline: { fr: "Sentir quand un marché accélère, et quand il s'essouffle." },
  why: { fr: "La direction ne suffit pas. La vitesse et l'essoufflement décident du moment d'agir." },
  icon: "eclair",
  color: "#ea580c",
  passingScore: 80,
  status: "bientot",
  skills: [
    s("force_marche", "Reconnaître un marché fort"),
    s("faiblesse_marche", "Reconnaître un marché qui faiblit"),
    s("acceleration", "Détecter une accélération"),
    s("ralentissement", "Détecter un ralentissement"),
  ],
  lessons: [],
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
