/**
 * Débats & discussions de la communauté — conversations à plusieurs voix.
 * Sujets bibliques classiques, abordés avec respect et fraternité.
 * (Contenu d'amorce pour donner vie à l'espace communautaire.)
 */
import type { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

export interface DebateMessage {
  author: string;
  color: string;      // couleur de l'avatar
  flag: string;       // drapeau (emoji)
  time: string;       // ex. "2h"
  likes: number;
  replyTo?: string;   // prénom auquel ce message répond
  text: Record<Lang, string>;
}

export interface Debate {
  id: string;
  icon: IconName;
  accent: string;
  category: Record<Lang, string>;
  question: Record<Lang, string>;
  messages: DebateMessage[];
}

export const debates: Debate[] = [
  {
    id: "predestination",
    icon: "couronne",
    accent: "#7c3aed",
    category: { fr: "Doctrine", ht: "Doktrin", en: "Doctrine", es: "Doctrina" },
    question: {
      fr: "Prédestination ou libre arbitre : est-ce Dieu qui nous choisit, ou nous qui le choisissons ?",
      ht: "Predestinasyon oswa libète chwazi : èske se Bondye ki chwazi nou, oswa nou ki chwazi li ?",
      en: "Predestination or free will: does God choose us, or do we choose Him?",
      es: "¿Predestinación o libre albedrío: nos elige Dios, o lo elegimos nosotros?",
    },
    messages: [
      { author: "Marc", color: "#7c3aed", flag: "🇭🇹", time: "3h", likes: 24, text: {
        fr: "Éphésiens 1:4 le dit clairement : Dieu nous a élus « avant la fondation du monde ». Tout part de sa grâce souveraine, pas de nos mérites.",
        ht: "Efezyen 1:4 di li klè : Bondye chwazi nou « anvan fondasyon mond lan ». Tout soti nan gras souveren li, pa nan merit nou.",
        en: "Ephesians 1:4 is clear: God chose us 'before the foundation of the world.' It all begins with His sovereign grace, not our merit.",
        es: "Efesios 1:4 lo dice claro: Dios nos eligió 'antes de la fundación del mundo.' Todo parte de su gracia soberana, no de nuestros méritos.",
      } },
      { author: "Esther", color: "#0891b2", flag: "🇨🇩", time: "2h", likes: 18, replyTo: "Marc", text: {
        fr: "Je comprends, mais Josué 24:15 dit « choisissez aujourd'hui qui vous voulez servir ». Dieu nous laisse un vrai choix, sinon pourquoi nous appeler à décider ?",
        ht: "Mwen konprann, men Jozye 24:15 di « chwazi jodi a kiyès nou vle sèvi ». Bondye kite nou yon vrè chwa, sinon poukisa li rele nou pou deside ?",
        en: "I understand, but Joshua 24:15 says 'choose this day whom you will serve.' God gives us a real choice — why call us to decide otherwise?",
        es: "Entiendo, pero Josué 24:15 dice 'escojan hoy a quién servirán.' Dios nos da una elección real, ¿si no, por qué llamarnos a decidir?",
      } },
      { author: "Daniel", color: "#16a34a", flag: "🇫🇷", time: "2h", likes: 31, text: {
        fr: "Les deux sont vrais en même temps : Dieu est pleinement souverain, et l'homme pleinement responsable. C'est un mystère qu'on porte avec humilité, pas une contradiction.",
        ht: "Toude vre an menm tan : Bondye souveren nèt, e lòm responsab nèt. Se yon mistè nou pote ak imilite, se pa yon kontradiksyon.",
        en: "Both are true at once: God is fully sovereign, and man fully responsible. It's a mystery we hold with humility, not a contradiction.",
        es: "Ambas son ciertas a la vez: Dios es plenamente soberano, y el hombre plenamente responsable. Es un misterio que sostenemos con humildad, no una contradicción.",
      } },
      { author: "Ruth", color: "#db2777", flag: "🇭🇹", time: "1h", likes: 22, replyTo: "Daniel", text: {
        fr: "Amen frère. Je crois que Dieu appelle le premier, et nous répondons librement. L'amour véritable n'a jamais forcé personne. Restons unis sur l'essentiel : la grâce de Christ.",
        ht: "Amèn frè. Mwen kwè Bondye rele an premye, e nou reponn lib. Vrè lanmou pa janm fòse pèsòn. Ann rete ini sou sa ki esansyèl : gras Kris la.",
        en: "Amen brother. I believe God calls first, and we respond freely. True love never forced anyone. Let's stay united on the essential: the grace of Christ.",
        es: "Amén hermano. Creo que Dios llama primero, y respondemos libremente. El amor verdadero nunca forzó a nadie. Sigamos unidos en lo esencial: la gracia de Cristo.",
      } },
    ],
  },
  {
    id: "sabbat",
    icon: "soleil",
    accent: "#c8960f",
    category: { fr: "Vie chrétienne", ht: "Lavi kretyen", en: "Christian life", es: "Vida cristiana" },
    question: {
      fr: "Le jour du Seigneur : faut-il l'observer le samedi (sabbat) ou le dimanche ?",
      ht: "Jou Senyè a : èske nou dwe obsève l samdi (saba) oswa dimanch ?",
      en: "The Lord's Day: should we keep it on Saturday (Sabbath) or Sunday?",
      es: "El día del Señor: ¿debe guardarse el sábado (sabbat) o el domingo?",
    },
    messages: [
      { author: "Jean", color: "#c8960f", flag: "🇭🇹", time: "5h", likes: 15, text: {
        fr: "Le sabbat est le 7e jour, institué dès la création (Genèse 2:2-3). C'est un commandement, et Jésus lui-même l'observait.",
        ht: "Saba se 7yèm jou a, etabli depi kreyasyon (Jenèz 2:2-3). Se yon kòmandman, e Jezi menm te obsève l.",
        en: "The Sabbath is the 7th day, set apart from creation (Genesis 2:2-3). It's a commandment, and Jesus Himself kept it.",
        es: "El sábado es el 7º día, instituido desde la creación (Génesis 2:2-3). Es un mandamiento, y Jesús mismo lo guardaba.",
      } },
      { author: "Grace", color: "#0284c7", flag: "🇺🇸", time: "4h", likes: 20, replyTo: "Jean", text: {
        fr: "C'est vrai, mais les premiers chrétiens se réunissaient le 1er jour de la semaine, jour de la résurrection (Actes 20:7 ; 1 Corinthiens 16:2).",
        ht: "Se vre, men premye kretyen yo te reyini premye jou semèn nan, jou rezirèksyon an (Travay 20:7 ; 1 Korentyen 16:2).",
        en: "True, but the early Christians gathered on the first day of the week, the day of the resurrection (Acts 20:7; 1 Corinthians 16:2).",
        es: "Es cierto, pero los primeros cristianos se reunían el primer día de la semana, el día de la resurrección (Hechos 20:7; 1 Corintios 16:2).",
      } },
      { author: "Paul", color: "#1a3568", flag: "🇫🇷", time: "3h", likes: 27, text: {
        fr: "Romains 14:5 tranche : « que chacun ait dans son esprit une pleine conviction ». Ce n'est pas le jour qui nous sauve, mais l'adoration du cœur envers Dieu.",
        ht: "Women 14:5 klè : « se pou chak moun gen yon konviksyon fèm nan lespri l ». Se pa jou a ki sove nou, men adorasyon kè a devan Bondye.",
        en: "Romans 14:5 settles it: 'let each be fully convinced in his own mind.' It's not the day that saves us, but heartfelt worship toward God.",
        es: "Romanos 14:5 lo resuelve: 'cada uno esté plenamente convencido en su mente.' No es el día lo que salva, sino la adoración del corazón a Dios.",
      } },
      { author: "Marie", color: "#16a34a", flag: "🇨🇦", time: "2h", likes: 19, replyTo: "Paul", text: {
        fr: "Bien dit. Le repos et l'adoration comptent plus que la case du calendrier. Christ est notre vrai repos (Matthieu 11:28).",
        ht: "Byen di. Repo ak adorasyon konte plis pase kaz nan kalandriye a. Kris se vrè repo nou (Matye 11:28).",
        en: "Well said. Rest and worship matter more than the calendar box. Christ is our true rest (Matthew 11:28).",
        es: "Bien dicho. El descanso y la adoración importan más que la casilla del calendario. Cristo es nuestro verdadero descanso (Mateo 11:28).",
      } },
    ],
  },
  {
    id: "bapteme",
    icon: "colombe",
    accent: "#0891b2",
    category: { fr: "Sacrements", ht: "Sakreman", en: "Sacraments", es: "Sacramentos" },
    question: {
      fr: "Le baptême : par immersion ou aspersion ? Pour les bébés ou les croyants ?",
      ht: "Batèm : pa imèsyon oswa aspèsyon ? Pou tibebe oswa kwayan ?",
      en: "Baptism: by immersion or sprinkling? For infants or believers?",
      es: "El bautismo: ¿por inmersión o aspersión? ¿Para bebés o creyentes?",
    },
    messages: [
      { author: "Pierre", color: "#0891b2", flag: "🇭🇹", time: "6h", likes: 17, text: {
        fr: "Jésus a été baptisé par immersion : Marc 1:10 dit qu'« il sortit de l'eau ». Le mot grec baptizô signifie littéralement plonger. C'est le modèle.",
        ht: "Jezi te batize pa imèsyon : Mak 1:10 di « li soti nan dlo a ». Mo grèk baptizô a vle di plonje. Se modèl la.",
        en: "Jesus was baptized by immersion: Mark 1:10 says He 'came up out of the water.' The Greek baptizô literally means to plunge. That's the model.",
        es: "Jesús fue bautizado por inmersión: Marcos 1:10 dice que 'subió del agua.' La palabra griega baptizô significa sumergir. Es el modelo.",
      } },
      { author: "Sarah", color: "#db2777", flag: "🇧🇪", time: "5h", likes: 12, replyTo: "Pierre", text: {
        fr: "Et les enfants ? Actes 16:33 parle du baptême de « toute la maison ». Certaines traditions y voient l'alliance offerte aussi aux petits.",
        ht: "E timoun yo ? Travay 16:33 pale de batèm « tout kay la ». Kèk tradisyon wè alyans lan ofri tou pou tipitit yo.",
        en: "And children? Acts 16:33 speaks of 'his whole household' being baptized. Some traditions see the covenant extended to little ones too.",
        es: "¿Y los niños? Hechos 16:33 habla del bautismo de 'toda su casa.' Algunas tradiciones ven el pacto ofrecido también a los pequeños.",
      } },
      { author: "Luc", color: "#16a34a", flag: "🇫🇷", time: "4h", likes: 21, replyTo: "Sarah", text: {
        fr: "Je crois au baptême du croyant qui confesse sa foi : Actes 2:38, « repentez-vous et soyez baptisés ». La repentance vient avant. Mais je respecte l'autre conviction.",
        ht: "Mwen kwè nan batèm kwayan ki konfese lafwa l : Travay 2:38, « repanti epi batize ». Repantans vin anvan. Men mwen respekte lòt konviksyon an.",
        en: "I hold to believer's baptism upon confession of faith: Acts 2:38, 'repent and be baptized.' Repentance comes first. But I respect the other view.",
        es: "Creo en el bautismo del creyente que confiesa su fe: Hechos 2:38, 'arrepiéntanse y bautícense.' El arrepentimiento va primero. Pero respeto la otra postura.",
      } },
      { author: "Anne", color: "#c8960f", flag: "🇭🇹", time: "2h", likes: 25, text: {
        fr: "Chaque église a sa conviction sur la forme. Restons unis sur le cœur : le baptême proclame notre union à la mort et la résurrection de Christ (Romains 6:4).",
        ht: "Chak legliz gen konviksyon l sou fòm nan. Ann rete ini sou kè a : batèm pwoklame inyon nou ak lanmò ak rezirèksyon Kris (Women 6:4).",
        en: "Each church has its conviction on the form. Let's stay united on the heart of it: baptism proclaims our union with Christ's death and resurrection (Romans 6:4).",
        es: "Cada iglesia tiene su convicción sobre la forma. Sigamos unidos en el corazón: el bautismo proclama nuestra unión con la muerte y resurrección de Cristo (Romanos 6:4).",
      } },
    ],
  },
  {
    id: "salut",
    icon: "bouclier",
    accent: "#16a34a",
    category: { fr: "Salut", ht: "Sali", en: "Salvation", es: "Salvación" },
    question: {
      fr: "Peut-on perdre son salut, ou est-il éternellement assuré ?",
      ht: "Èske yon moun ka pèdi sali l, oswa li asire pou tout tan ?",
      en: "Can we lose our salvation, or is it eternally secure?",
      es: "¿Se puede perder la salvación, o está eternamente asegurada?",
    },
    messages: [
      { author: "David", color: "#16a34a", flag: "🇨🇮", time: "7h", likes: 29, text: {
        fr: "Jean 10:28 : « personne ne les ravira de ma main ». Le salut repose sur la fidélité de Dieu, pas sur la nôtre. Il est éternellement sûr.",
        ht: "Jan 10:28 : « pèsòn p ap rache yo nan men m ». Sali a chita sou fidelite Bondye, pa sou pa nou. Li asire pou tout tan.",
        en: "John 10:28: 'no one will snatch them out of my hand.' Salvation rests on God's faithfulness, not ours. It is eternally secure.",
        es: "Juan 10:28: 'nadie las arrebatará de mi mano.' La salvación descansa en la fidelidad de Dios, no en la nuestra. Es eternamente segura.",
      } },
      { author: "Rachel", color: "#db2777", flag: "🇫🇷", time: "6h", likes: 16, replyTo: "David", text: {
        fr: "Pourtant Hébreux 6:4-6 avertit sérieusement ceux qui se détournent. La persévérance dans la foi n'est-elle pas la preuve d'un salut véritable ?",
        ht: "Men Ebre 6:4-6 avèti seryezman moun ki vire do. Èske pèseverans nan lafwa se pa prèv yon vrè sali ?",
        en: "Yet Hebrews 6:4-6 seriously warns those who fall away. Isn't perseverance in faith the evidence of true salvation?",
        es: "Sin embargo Hebreos 6:4-6 advierte seriamente a los que se apartan. ¿No es la perseverancia en la fe la prueba de una salvación verdadera?",
      } },
      { author: "Samuel", color: "#1a3568", flag: "🇭🇹", time: "4h", likes: 24, text: {
        fr: "Les deux vérités se tiennent : Dieu nous garde (Jude 24) ET nous appelle à demeurer en Christ (Jean 15:4). Sa sécurité produit notre persévérance, elle ne l'annule pas.",
        ht: "Toude verite yo kanpe ansanm : Bondye kenbe nou (Jid 24) EPI li rele nou pou nou rete nan Kris (Jan 15:4). Sekirite li pwodui pèseverans nou, li pa anile l.",
        en: "Both truths stand together: God keeps us (Jude 24) AND calls us to abide in Christ (John 15:4). His security produces our perseverance — it doesn't cancel it.",
        es: "Ambas verdades se sostienen: Dios nos guarda (Judas 24) Y nos llama a permanecer en Cristo (Juan 15:4). Su seguridad produce nuestra perseverancia, no la anula.",
      } },
    ],
  },
  {
    id: "dons-esprit",
    icon: "feu",
    accent: "#ea580c",
    category: { fr: "Saint-Esprit", ht: "Sentespri", en: "Holy Spirit", es: "Espíritu Santo" },
    question: {
      fr: "Les dons de l'Esprit (langues, guérison, prophétie) sont-ils encore pour aujourd'hui ?",
      ht: "Èske don Lespri a (lang, gerizon, pwofesi) toujou pou jodi a ?",
      en: "Are the gifts of the Spirit (tongues, healing, prophecy) still for today?",
      es: "¿Los dones del Espíritu (lenguas, sanidad, profecía) son aún para hoy?",
    },
    messages: [
      { author: "Josué", color: "#ea580c", flag: "🇭🇹", time: "8h", likes: 26, text: {
        fr: "1 Corinthiens 12 décrit les dons pour l'édification de l'Église, et rien n'annonce clairement leur arrêt. Dieu agit encore avec puissance aujourd'hui.",
        ht: "1 Korentyen 12 dekri don yo pou edifikasyon Legliz la, e anyen pa anonse klè yo sispann. Bondye toujou aji ak pwisans jodi a.",
        en: "1 Corinthians 12 describes the gifts for building up the Church, and nothing clearly announces their end. God still works with power today.",
        es: "1 Corintios 12 describe los dones para la edificación de la Iglesia, y nada anuncia claramente su cese. Dios aún obra con poder hoy.",
      } },
      { author: "Déborah", color: "#7c3aed", flag: "🇬🇧", time: "6h", likes: 14, replyTo: "Josué", text: {
        fr: "1 Corinthiens 13:8 dit pourtant que « les langues cesseront ». Certains pensent que certains dons-signes ont accompli leur rôle à l'époque des apôtres.",
        ht: "Men 1 Korentyen 13:8 di « lang yo ap sispann ». Kèk moun panse kèk don-siy te akonpli wòl yo nan epòk apòt yo.",
        en: "Yet 1 Corinthians 13:8 says 'tongues will cease.' Some believe certain sign-gifts fulfilled their role in the apostolic era.",
        es: "Sin embargo 1 Corintios 13:8 dice que 'las lenguas cesarán.' Algunos creen que ciertos dones-señal cumplieron su papel en la era apostólica.",
      } },
      { author: "Emmanuel", color: "#0891b2", flag: "🇨🇩", time: "3h", likes: 23, text: {
        fr: "Quel que soit notre avis, gardons le centre : « recherchez l'amour » (1 Cor 14:1) et tout « pour l'édification de l'Église » (1 Cor 14:12). L'amour ne cessera jamais.",
        ht: "Kèlkeswa opinyon nou, ann kenbe sant lan : « chèche lanmou » (1 Kor 14:1) e tout « pou edifikasyon Legliz la » (1 Kor 14:12). Lanmou p ap janm sispann.",
        en: "Whatever our view, let's keep the center: 'pursue love' (1 Cor 14:1) and everything 'for the building up of the Church' (1 Cor 14:12). Love will never cease.",
        es: "Sea cual sea nuestra opinión, mantengamos el centro: 'busquen el amor' (1 Cor 14:1) y todo 'para la edificación de la Iglesia' (1 Cor 14:12). El amor nunca cesará.",
      } },
    ],
  },
];
