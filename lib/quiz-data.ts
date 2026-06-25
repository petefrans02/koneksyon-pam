import { Lang } from "./translations";

export interface QuizQuestion {
  question: Partial<Record<Lang, string>>;
  options: Partial<Record<Lang, string[]>>;
  correct: number;
  explanation: Partial<Record<Lang, string>>;
  verse: string;
}

export interface QuizLevel {
  id: number;
  title: Partial<Record<Lang, string>>;
  description: Partial<Record<Lang, string>>;
  icon: string;
  color: string;
  requiredScore: number;
  questions: QuizQuestion[];
}

export const quizLevels: QuizLevel[] = [
  {
    id: 1,
    title: { fr: "Les Fondements", ht: "Fondasyon yo", en: "The Foundations" },
    description: { fr: "Les bases de la Bible — Création, premiers personnages", ht: "Baz Bib la — Kreyasyon, premye pèsonaj yo", en: "Bible basics — Creation, first characters" },
    icon: "🌱",
    color: "from-green-500 to-emerald-600",
    requiredScore: 70,
    questions: [
      {
        question: { fr: "En combien de jours Dieu a-t-il créé le monde ?", ht: "Nan konbyen jou Bondye te kreye mond lan ?", en: "In how many days did God create the world?" },
        options: { fr: ["3 jours", "5 jours", "6 jours", "7 jours"], ht: ["3 jou", "5 jou", "6 jou", "7 jou"], en: ["3 days", "5 days", "6 days", "7 days"] },
        correct: 2,
        explanation: { fr: "Dieu a créé le monde en 6 jours et s'est reposé le 7ème jour.", ht: "Bondye te kreye mond lan nan 6 jou epi li repoze 7èm jou a.", en: "God created the world in 6 days and rested on the 7th day." },
        verse: "Genèse 2:2",
      },
      {
        question: { fr: "Quel est le premier homme créé par Dieu ?", ht: "Ki premye nonm Bondye te kreye ?", en: "Who was the first man created by God?" },
        options: { fr: ["Noé", "Abraham", "Adam", "Moïse"], ht: ["Noe", "Abraram", "Adan", "Moyiz"], en: ["Noah", "Abraham", "Adam", "Moses"] },
        correct: 2,
        explanation: { fr: "Adam fut le premier homme, formé de la poussière de la terre.", ht: "Adan te premye nonm nan, Bondye te fòme l ak pousyè tè a.", en: "Adam was the first man, formed from the dust of the ground." },
        verse: "Genèse 2:7",
      },
      {
        question: { fr: "Quel fruit était interdit dans le jardin d'Éden ?", ht: "Ki fwi ki te entèdi nan jaden Edèn nan ?", en: "What was forbidden in the Garden of Eden?" },
        options: { fr: ["La pomme", "Le fruit de l'arbre de la connaissance", "Le raisin", "La figue"], ht: ["Pòm nan", "Fwi pyebwa konesans lan", "Rezen", "Fig"], en: ["The apple", "The fruit of the tree of knowledge", "The grape", "The fig"] },
        correct: 1,
        explanation: { fr: "Le fruit de l'arbre de la connaissance du bien et du mal était interdit. La Bible ne dit pas que c'était une pomme.", ht: "Fwi pyebwa konesans byen ak mal la te entèdi. Bib la pa di se te yon pòm.", en: "The fruit of the tree of knowledge of good and evil was forbidden. The Bible doesn't say it was an apple." },
        verse: "Genèse 2:17",
      },
      {
        question: { fr: "Qui a construit l'arche pour survivre au déluge ?", ht: "Ki moun ki te bati lach la pou siviv inondasyon an ?", en: "Who built the ark to survive the flood?" },
        options: { fr: ["Abraham", "Moïse", "Noé", "David"], ht: ["Abraram", "Moyiz", "Noe", "David"], en: ["Abraham", "Moses", "Noah", "David"] },
        correct: 2,
        explanation: { fr: "Noé a construit l'arche selon les instructions de Dieu, sauvant sa famille et les animaux.", ht: "Noe te bati lach la dapre enstriksyon Bondye, li te sove fanmi l ak bèt yo.", en: "Noah built the ark according to God's instructions, saving his family and the animals." },
        verse: "Genèse 6:14",
      },
      {
        question: { fr: "Combien de fils Noé avait-il ?", ht: "Konbyen pitit gason Noe te genyen ?", en: "How many sons did Noah have?" },
        options: { fr: ["2", "3", "4", "12"], ht: ["2", "3", "4", "12"], en: ["2", "3", "4", "12"] },
        correct: 1,
        explanation: { fr: "Noé avait 3 fils : Sem, Cham et Japhet.", ht: "Noe te gen 3 pitit gason : Sèm, Cham ak Jafèt.", en: "Noah had 3 sons: Shem, Ham, and Japheth." },
        verse: "Genèse 6:10",
      },
    ],
  },
  {
    id: 2,
    title: { fr: "Les Patriarches", ht: "Patriyach yo", en: "The Patriarchs" },
    description: { fr: "Abraham, Isaac, Jacob — Les pères de la foi", ht: "Abraram, Izaak, Jakòb — Papa lafwa yo", en: "Abraham, Isaac, Jacob — Fathers of the faith" },
    icon: "⭐",
    color: "from-amber-500 to-orange-600",
    requiredScore: 70,
    questions: [
      {
        question: { fr: "Quelle promesse Dieu a-t-il faite à Abraham ?", ht: "Ki pwomès Bondye te fè Abraram ?", en: "What promise did God make to Abraham?" },
        options: { fr: ["Un royaume terrestre", "Une descendance aussi nombreuse que les étoiles", "La vie éternelle sur terre", "Des richesses infinies"], ht: ["Yon wayòm sou tè a", "Yon desandans tankou zetwal yo", "Lavi etènèl sou tè a", "Richès san fen"], en: ["An earthly kingdom", "Descendants as numerous as the stars", "Eternal life on earth", "Infinite riches"] },
        correct: 1,
        explanation: { fr: "Dieu promit à Abraham une descendance innombrable, comme les étoiles du ciel et le sable de la mer.", ht: "Bondye te pwomèt Abraram yon desandans san kantite, tankou zetwal nan syèl la ak sab lanmè a.", en: "God promised Abraham innumerable descendants, like the stars of heaven and the sand of the sea." },
        verse: "Genèse 15:5",
      },
      {
        question: { fr: "Comment s'appelle le fils qu'Abraham a failli sacrifier ?", ht: "Ki non pitit gason Abraram te prèske sakrifye ?", en: "What was the name of the son Abraham almost sacrificed?" },
        options: { fr: ["Ismaël", "Isaac", "Jacob", "Joseph"], ht: ["Ismayèl", "Izaak", "Jakòb", "Jozèf"], en: ["Ishmael", "Isaac", "Jacob", "Joseph"] },
        correct: 1,
        explanation: { fr: "Dieu testa la foi d'Abraham en lui demandant de sacrifier Isaac, mais un ange l'arrêta et un bélier fut offert à la place.", ht: "Bondye te teste lafwa Abraram lè l mande l sakrifye Izaak, men yon zanj te rete l epi yon belye te ofri nan plas li.", en: "God tested Abraham's faith by asking him to sacrifice Isaac, but an angel stopped him and a ram was offered instead." },
        verse: "Genèse 22:2",
      },
      {
        question: { fr: "Combien de fils Jacob (Israël) avait-il ?", ht: "Konbyen pitit gason Jakòb (Izrayèl) te genyen ?", en: "How many sons did Jacob (Israel) have?" },
        options: { fr: ["7", "10", "12", "15"], ht: ["7", "10", "12", "15"], en: ["7", "10", "12", "15"] },
        correct: 2,
        explanation: { fr: "Jacob eut 12 fils qui devinrent les 12 tribus d'Israël.", ht: "Jakòb te gen 12 pitit gason ki te vin 12 tribi Izrayèl la.", en: "Jacob had 12 sons who became the 12 tribes of Israel." },
        verse: "Genèse 35:22",
      },
      {
        question: { fr: "Quel fils de Jacob a été vendu comme esclave par ses frères ?", ht: "Ki pitit gason Jakòb frè l yo te vann kòm esklav ?", en: "Which son of Jacob was sold as a slave by his brothers?" },
        options: { fr: ["Ruben", "Juda", "Joseph", "Benjamin"], ht: ["Ribèn", "Jida", "Jozèf", "Benjamen"], en: ["Reuben", "Judah", "Joseph", "Benjamin"] },
        correct: 2,
        explanation: { fr: "Joseph fut vendu par ses frères jaloux, mais Dieu transforma cette épreuve en bénédiction — il devint gouverneur d'Égypte.", ht: "Jozèf te vann pa frè l yo ki te jalou, men Bondye te transfòme eprèv sa a an benediksyon — li te vin gouvènè Lejip.", en: "Joseph was sold by his jealous brothers, but God turned this trial into a blessing — he became governor of Egypt." },
        verse: "Genèse 37:28",
      },
      {
        question: { fr: "Dans quel pays les Israélites furent-ils esclaves ?", ht: "Nan ki peyi Izrayelit yo te esklav ?", en: "In which country were the Israelites enslaved?" },
        options: { fr: ["Babylone", "Égypte", "Assyrie", "Rome"], ht: ["Babilòn", "Lejip", "Asiri", "Wòm"], en: ["Babylon", "Egypt", "Assyria", "Rome"] },
        correct: 1,
        explanation: { fr: "Les Israélites furent esclaves en Égypte pendant 400 ans avant que Moïse ne les libère.", ht: "Izrayelit yo te esklav nan peyi Lejip pandan 400 an anvan Moyiz te libere yo.", en: "The Israelites were enslaved in Egypt for 400 years before Moses freed them." },
        verse: "Exode 1:11",
      },
    ],
  },
  {
    id: 3,
    title: { fr: "Les Psaumes & la Sagesse", ht: "Sòm yo & Sajès", en: "Psalms & Wisdom" },
    description: { fr: "Les trésors des Psaumes, Proverbes et sagesse biblique", ht: "Trezò Sòm yo, Pwovèb ak sajès biblik", en: "Treasures of Psalms, Proverbs and biblical wisdom" },
    icon: "📖",
    color: "from-blue-500 to-indigo-600",
    requiredScore: 75,
    questions: [
      {
        question: { fr: "Qui a écrit la majorité des Psaumes ?", ht: "Ki moun ki te ekri pifò nan Sòm yo ?", en: "Who wrote most of the Psalms?" },
        options: { fr: ["Salomon", "Moïse", "David", "Samuel"], ht: ["Salomon", "Moyiz", "David", "Samyèl"], en: ["Solomon", "Moses", "David", "Samuel"] },
        correct: 2,
        explanation: { fr: "Le roi David a écrit environ 73 des 150 Psaumes. Il était musicien et adorateur passionné.", ht: "Wa David te ekri anviwon 73 nan 150 Sòm yo. Li te yon mizisyen ak yon adoratè pasyone.", en: "King David wrote about 73 of the 150 Psalms. He was a musician and passionate worshiper." },
        verse: "Psaume 23:1",
      },
      {
        question: { fr: "Quel Psaume parle de celui qui 'demeure sous l'abri du Très-Haut' ?", ht: "Ki Sòm ki pale de moun ki 'rete anba pwoteksyon Bondye' ?", en: "Which Psalm speaks of dwelling 'in the shelter of the Most High'?" },
        options: { fr: ["Psaume 23", "Psaume 51", "Psaume 91", "Psaume 119"], ht: ["Sòm 23", "Sòm 51", "Sòm 91", "Sòm 119"], en: ["Psalm 23", "Psalm 51", "Psalm 91", "Psalm 119"] },
        correct: 2,
        explanation: { fr: "Le Psaume 91 est le Psaume de la protection divine. Il promet la sécurité à celui qui se confie en Dieu.", ht: "Sòm 91 se Sòm pwoteksyon diven. Li pwomèt sekirite pou moun ki mete konfyans nan Bondye.", en: "Psalm 91 is the Psalm of divine protection. It promises safety to those who trust in God." },
        verse: "Psaume 91:1",
      },
      {
        question: { fr: "Quel est le plus long chapitre de la Bible ?", ht: "Ki chapit ki pi long nan Bib la ?", en: "What is the longest chapter in the Bible?" },
        options: { fr: ["Genèse 1", "Psaume 119", "Ésaïe 53", "Apocalypse 21"], ht: ["Jenèz 1", "Sòm 119", "Ezayi 53", "Apokalips 21"], en: ["Genesis 1", "Psalm 119", "Isaiah 53", "Revelation 21"] },
        correct: 1,
        explanation: { fr: "Le Psaume 119 est le plus long chapitre avec 176 versets. Chaque section commence par une lettre de l'alphabet hébreu.", ht: "Sòm 119 se chapit ki pi long ak 176 vèsè. Chak seksyon kòmanse ak yon lèt alfabe ebre a.", en: "Psalm 119 is the longest chapter with 176 verses. Each section begins with a letter of the Hebrew alphabet." },
        verse: "Psaume 119",
      },
      {
        question: { fr: "Qui a dit : 'Le commencement de la sagesse, c'est la crainte de l'Éternel' ?", ht: "Ki moun ki te di : 'Kòmansman sajès, se lakrent Senyè a' ?", en: "Who said: 'The fear of the Lord is the beginning of wisdom'?" },
        options: { fr: ["David", "Salomon", "Moïse", "Job"], ht: ["David", "Salomon", "Moyiz", "Jòb"], en: ["David", "Solomon", "Moses", "Job"] },
        correct: 1,
        explanation: { fr: "Salomon, le roi le plus sage, a écrit cette parole dans le livre des Proverbes.", ht: "Salomon, wa ki te pi saj la, te ekri pawòl sa a nan liv Pwovèb la.", en: "Solomon, the wisest king, wrote this in the book of Proverbs." },
        verse: "Proverbes 9:10",
      },
      {
        question: { fr: "Le Psaume 23 compare Dieu à quoi ?", ht: "Sòm 23 konpare Bondye ak kisa ?", en: "Psalm 23 compares God to what?" },
        options: { fr: ["Un roi", "Un berger", "Un guerrier", "Un père"], ht: ["Yon wa", "Yon gadò", "Yon gèrye", "Yon papa"], en: ["A king", "A shepherd", "A warrior", "A father"] },
        correct: 1,
        explanation: { fr: "David, lui-même ancien berger, compare Dieu à un berger qui prend soin de ses brebis avec amour.", ht: "David, li menm ki te yon ansyen gadò, konpare Bondye ak yon gadò ki pran swen mouton l yo ak lanmou.", en: "David, himself a former shepherd, compares God to a shepherd who cares for his sheep with love." },
        verse: "Psaume 23:1",
      },
    ],
  },
  {
    id: 4,
    title: { fr: "La Vie de Jésus", ht: "Lavi Jezi", en: "The Life of Jesus" },
    description: { fr: "Naissance, miracles, enseignements et résurrection", ht: "Nesans, mirak, ansèyman ak rezireksyon", en: "Birth, miracles, teachings and resurrection" },
    icon: "✝️",
    color: "from-purple-500 to-violet-600",
    requiredScore: 75,
    questions: [
      {
        question: { fr: "Dans quelle ville Jésus est-il né ?", ht: "Nan ki vil Jezi te fèt ?", en: "In which city was Jesus born?" },
        options: { fr: ["Jérusalem", "Nazareth", "Bethléhem", "Capernaüm"], ht: ["Jerizalèm", "Nazarèt", "Betleyèm", "Kapènawòm"], en: ["Jerusalem", "Nazareth", "Bethlehem", "Capernaum"] },
        correct: 2,
        explanation: { fr: "Jésus est né à Bethléhem, accomplissant la prophétie de Michée. Marie et Joseph s'y étaient rendus pour le recensement.", ht: "Jezi te fèt Betleyèm, li te akonpli pwofesi Miche a. Mari ak Jozèf te ale la pou resansman an.", en: "Jesus was born in Bethlehem, fulfilling Micah's prophecy. Mary and Joseph went there for the census." },
        verse: "Matthieu 2:1",
      },
      {
        question: { fr: "Quel est le premier miracle de Jésus ?", ht: "Ki premye mirak Jezi ?", en: "What was Jesus' first miracle?" },
        options: { fr: ["Marcher sur l'eau", "Guérir un aveugle", "Changer l'eau en vin", "Multiplier les pains"], ht: ["Mache sou dlo", "Geri yon avèg", "Chanje dlo an diven", "Miltipliye pen"], en: ["Walking on water", "Healing a blind man", "Turning water into wine", "Multiplying bread"] },
        correct: 2,
        explanation: { fr: "Aux noces de Cana, Jésus transforma l'eau en vin — son premier miracle public, révélant sa gloire.", ht: "Nan maryaj Kana, Jezi te chanje dlo an diven — premye mirak piblik li, ki te revele glwa li.", en: "At the wedding of Cana, Jesus turned water into wine — his first public miracle, revealing his glory." },
        verse: "Jean 2:11",
      },
      {
        question: { fr: "Combien de personnes Jésus a-t-il nourries avec 5 pains et 2 poissons ?", ht: "Konbyen moun Jezi te nouri ak 5 pen ak 2 pwason ?", en: "How many people did Jesus feed with 5 loaves and 2 fish?" },
        options: { fr: ["500", "2 000", "5 000", "10 000"], ht: ["500", "2 000", "5 000", "10 000"], en: ["500", "2,000", "5,000", "10,000"] },
        correct: 2,
        explanation: { fr: "Jésus nourrit 5 000 hommes (plus les femmes et enfants) — un miracle de multiplication qui montre que Dieu peut pourvoir au-delà de nos limites.", ht: "Jezi te nouri 5 000 gason (plis fanm ak timoun) — yon mirak miltiplikasyon ki montre Bondye ka bay plis pase limit nou.", en: "Jesus fed 5,000 men (plus women and children) — a multiplication miracle showing God can provide beyond our limits." },
        verse: "Matthieu 14:21",
      },
      {
        question: { fr: "Qui a trahi Jésus ?", ht: "Ki moun ki te trayi Jezi ?", en: "Who betrayed Jesus?" },
        options: { fr: ["Pierre", "Thomas", "Judas", "Jean"], ht: ["Pyè", "Toma", "Jida", "Jan"], en: ["Peter", "Thomas", "Judas", "John"] },
        correct: 2,
        explanation: { fr: "Judas Iscariote trahit Jésus pour 30 pièces d'argent, le livrant aux autorités avec un baiser.", ht: "Jida Iskaryòt te trayi Jezi pou 30 pyès ajan, li te livre l bay otorite yo ak yon bo.", en: "Judas Iscariot betrayed Jesus for 30 pieces of silver, handing him over to the authorities with a kiss." },
        verse: "Matthieu 26:15",
      },
      {
        question: { fr: "Combien de jours après sa mort Jésus est-il ressuscité ?", ht: "Konbyen jou apre lanmò li Jezi te resisite ?", en: "How many days after his death did Jesus rise?" },
        options: { fr: ["1 jour", "2 jours", "3 jours", "7 jours"], ht: ["1 jou", "2 jou", "3 jou", "7 jou"], en: ["1 day", "2 days", "3 days", "7 days"] },
        correct: 2,
        explanation: { fr: "Jésus est ressuscité le 3ème jour, vainquant la mort. C'est le fondement de la foi chrétienne.", ht: "Jezi te resisite 3èm jou a, li te genyen lanmò. Sa a se fondasyon lafwa kretyen an.", en: "Jesus rose on the 3rd day, conquering death. This is the foundation of Christian faith." },
        verse: "1 Corinthiens 15:4",
      },
    ],
  },
  {
    id: 5,
    title: { fr: "Défi Expert", ht: "Defi Ekspè", en: "Expert Challenge" },
    description: { fr: "Questions avancées pour les connaisseurs de la Bible", ht: "Kesyon avanse pou moun ki konnen Bib la", en: "Advanced questions for Bible scholars" },
    icon: "👑",
    color: "from-red-500 to-rose-600",
    requiredScore: 80,
    questions: [
      {
        question: { fr: "Quel prophète a été enlevé au ciel dans un char de feu ?", ht: "Ki pwofèt ki te monte nan syèl nan yon cha dife ?", en: "Which prophet was taken to heaven in a chariot of fire?" },
        options: { fr: ["Élisée", "Élie", "Ézéchiel", "Daniel"], ht: ["Elize", "Eli", "Ezekyèl", "Danyèl"], en: ["Elisha", "Elijah", "Ezekiel", "Daniel"] },
        correct: 1,
        explanation: { fr: "Élie fut enlevé au ciel dans un tourbillon avec un char et des chevaux de feu, sans connaître la mort.", ht: "Eli te monte nan syèl nan yon toubiyon ak yon cha ak chwal dife, san l pa t mouri.", en: "Elijah was taken to heaven in a whirlwind with a chariot and horses of fire, without experiencing death." },
        verse: "2 Rois 2:11",
      },
      {
        question: { fr: "Combien de livres y a-t-il dans le Nouveau Testament ?", ht: "Konbyen liv ki gen nan Nouvo Testaman an ?", en: "How many books are in the New Testament?" },
        options: { fr: ["21", "24", "27", "30"], ht: ["21", "24", "27", "30"], en: ["21", "24", "27", "30"] },
        correct: 2,
        explanation: { fr: "Le Nouveau Testament contient 27 livres : 4 Évangiles, les Actes, 21 Épîtres et l'Apocalypse.", ht: "Nouvo Testaman an gen 27 liv : 4 Evanjil, Travay, 21 Lèt ak Apokalips.", en: "The New Testament contains 27 books: 4 Gospels, Acts, 21 Epistles and Revelation." },
        verse: "Nouveau Testament",
      },
      {
        question: { fr: "Quel est le verset le plus court de la Bible ?", ht: "Ki vèsè ki pi kout nan Bib la ?", en: "What is the shortest verse in the Bible?" },
        options: { fr: ["Genèse 1:1", "Jean 11:35", "Exode 20:13", "Psaume 117:1"], ht: ["Jenèz 1:1", "Jan 11:35", "Egzòd 20:13", "Sòm 117:1"], en: ["Genesis 1:1", "John 11:35", "Exodus 20:13", "Psalm 117:1"] },
        correct: 1,
        explanation: { fr: "'Jésus pleura.' — Deux mots qui montrent l'humanité et la compassion de Jésus devant la mort de son ami Lazare.", ht: "'Jezi kriye.' — De mo ki montre imanite ak konpasyon Jezi devan lanmò zanmi l Laza.", en: "'Jesus wept.' — Two words that show Jesus' humanity and compassion at the death of his friend Lazarus." },
        verse: "Jean 11:35",
      },
      {
        question: { fr: "Qui a écrit le livre de l'Apocalypse ?", ht: "Ki moun ki te ekri liv Apokalips la ?", en: "Who wrote the book of Revelation?" },
        options: { fr: ["Paul", "Pierre", "Jean", "Jacques"], ht: ["Pòl", "Pyè", "Jan", "Jak"], en: ["Paul", "Peter", "John", "James"] },
        correct: 2,
        explanation: { fr: "L'apôtre Jean a écrit l'Apocalypse pendant son exil sur l'île de Patmos, recevant des visions de Dieu sur la fin des temps.", ht: "Apot Jan te ekri Apokalips pandan l te an egzil sou zile Patmòs, li te resevwa vizyon Bondye sou fen tan yo.", en: "The apostle John wrote Revelation during his exile on the island of Patmos, receiving visions from God about the end times." },
        verse: "Apocalypse 1:9",
      },
      {
        question: { fr: "Quel roi a demandé la sagesse à Dieu plutôt que la richesse ?", ht: "Ki wa ki te mande Bondye sajès olye richès ?", en: "Which king asked God for wisdom rather than riches?" },
        options: { fr: ["David", "Salomon", "Asa", "Josias"], ht: ["David", "Salomon", "Asa", "Jozyas"], en: ["David", "Solomon", "Asa", "Josiah"] },
        correct: 1,
        explanation: { fr: "Salomon demanda la sagesse, et Dieu, impressionné par sa demande, lui accorda aussi la richesse et la gloire.", ht: "Salomon te mande sajès, e Bondye, ki te enpresyone pa demann li, te ba l richès ak glwa tou.", en: "Solomon asked for wisdom, and God, impressed by his request, also granted him riches and glory." },
        verse: "1 Rois 3:9-12",
      },
    ],
  },
];
