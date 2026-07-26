export interface Psalm {
  number: number;
  title: Record<string, string>;
  text: Record<string, string>;
  youtubeId?: string;
}

export const featuredPsalms: Psalm[] = [
  {
    number: 23,
    title: {
      fr: "L'Éternel est mon berger",
      ht: "Senyè a se gadò mwen",
      en: "The Lord is my shepherd",
      es: "Jehová es mi pastor",
    },
    text: {
      fr: "L'Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles. Il restaure mon âme, il me conduit dans les sentiers de la justice, à cause de son nom. Quand je marche dans la vallée de l'ombre de la mort, je ne crains aucun mal, car tu es avec moi : ta houlette et ton bâton me rassurent.",
      ht: "Senyè a se gadò mwen, mwen p ap janm manke anyen. Li fè m kouche nan bèl savann vèt. Li mennen m bò dlo ki kalm. Li remete nanm mwen sou pye. Li mennen m nan chemen dwat pou non li. Menm si m ap mache nan fon nwa lanmò a, mwen p ap pè anyen, paske ou avèk mwen. Se baton ou ak gòl ou ki fè kè m poze.",
      en: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
      es: "Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará. Confortará mi alma; me guiará por sendas de justicia por amor de su nombre. Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento.",
    },
  },
  {
    number: 91,
    title: {
      fr: "Celui qui demeure sous l'abri du Très-Haut",
      ht: "Moun ki rete anba pwoteksyon Bondye",
      en: "He who dwells in the shelter of the Most High",
      es: "El que habita al abrigo del Altísimo",
    },
    text: {
      fr: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant. Je dis à l'Éternel : Mon refuge et ma forteresse, mon Dieu en qui je me confie ! Car c'est lui qui te délivrera du filet de l'oiseleur, de la peste et de ses ravages. Il te couvrira de ses plumes, et tu trouveras un refuge sous ses ailes.",
      ht: "Moun ki rete anba pwoteksyon Bondye ki anwo anwo a, moun ki kouche anba lonbraj Bondye ki gen tout pouvwa a, ap di Senyè a: Se ou ki kote m kache a, se ou ki fòtrès mwen. Ou se Bondye mwen. Se nan ou mwen mete konfyans mwen.",
      en: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty. I will say to the Lord, My refuge and my fortress, my God, in whom I trust. For he will deliver you from the snare of the fowler and from the deadly pestilence. He will cover you with his pinions, and under his wings you will find refuge.",
      es: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente. Diré yo a Jehová: Esperanza mía, y castillo mío; mi Dios, en quien confiaré. Él te librará del lazo del cazador, de la peste destructora. Con sus plumas te cubrirá, y debajo de sus alas estarás seguro.",
    },
  },
  {
    number: 27,
    title: {
      fr: "L'Éternel est ma lumière et mon salut",
      ht: "Senyè a se limyè mwen ak delivrans mwen",
      en: "The Lord is my light and my salvation",
      es: "Jehová es mi luz y mi salvación",
    },
    text: {
      fr: "L'Éternel est ma lumière et mon salut : de qui aurais-je crainte ? L'Éternel est le soutien de ma vie : de qui aurais-je peur ? Quand des méchants s'avancent contre moi, pour dévorer ma chair, ce sont mes persécuteurs et mes ennemis qui chancellent et qui tombent.",
      ht: "Senyè a se limyè mwen, se li ki delivre m. Ki moun mwen ta dwe pè? Senyè a se pwoteksyon mwen. Ki moun ki ka fè m tranble? Lè mechan yo vin atake m pou yo devore m, se yo menm k ap bite, se yo menm k ap tonbe.",
      en: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid? When evildoers assail me to eat up my flesh, my adversaries and foes, it is they who stumble and fall.",
      es: "Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme? Cuando se juntaron contra mí los malignos, mis angustiadores y mis enemigos, para comer mis carnes, ellos tropezaron y cayeron.",
    },
  },
  {
    number: 46,
    title: {
      fr: "Dieu est notre refuge et notre force",
      ht: "Bondye se refij nou ak fòs nou",
      en: "God is our refuge and strength",
      es: "Dios es nuestro amparo y fortaleza",
    },
    text: {
      fr: "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse. C'est pourquoi nous sommes sans crainte quand la terre est bouleversée, quand les montagnes s'ébranlent au cœur des mers.",
      ht: "Bondye se refij nou ak fòs nou. Li toujou la pou ede nou lè nou nan tray. Se poutèt sa, nou pa pè menm si latè tranble, menm si mòn yo chavire al tonbe nan fon lanmè a.",
      en: "God is our refuge and strength, a very present help in trouble. Therefore we will not fear though the earth gives way, though the mountains be moved into the heart of the sea.",
      es: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones. Por tanto, no temeremos, aunque la tierra sea removida, y se traspasen los montes al corazón del mar.",
    },
  },
  {
    number: 121,
    title: {
      fr: "Je lève mes yeux vers les montagnes",
      ht: "Mwen leve je m gade mòn yo",
      en: "I lift up my eyes to the hills",
      es: "Alzaré mis ojos a los montes",
    },
    text: {
      fr: "Je lève mes yeux vers les montagnes... D'où me viendra le secours ? Le secours me vient de l'Éternel, qui a fait les cieux et la terre. Il ne permettra point que ton pied chancelle ; celui qui te garde ne sommeillera point.",
      ht: "Mwen leve je m gade mòn yo. Ki kote sekou mwen soti? Sekou mwen soti nan men Senyè a, li menm ki fè syèl la ak latè a. Li p ap kite pye ou glise. Moun k ap veye sou ou a p ap janm dòmi.",
      en: "I lift up my eyes to the hills. From where does my help come? My help comes from the Lord, who made heaven and earth. He will not let your foot be moved; he who keeps you will not slumber.",
      es: "Alzaré mis ojos a los montes; ¿de dónde vendrá mi socorro? Mi socorro viene de Jehová, que hizo los cielos y la tierra. No dará tu pie al resbaladero, ni se dormirá el que te guarda.",
    },
  },
  {
    number: 150,
    title: {
      fr: "Louez l'Éternel !",
      ht: "Lwanj pou Senyè a!",
      en: "Praise the Lord!",
      es: "¡Alabad a Jehová!",
    },
    text: {
      fr: "Louez l'Éternel ! Louez Dieu dans son sanctuaire ! Louez-le dans l'étendue, où éclate sa puissance ! Louez-le pour ses hauts faits ! Louez-le selon l'immensité de sa grandeur ! Que tout ce qui respire loue l'Éternel ! Louez l'Éternel !",
      ht: "Lwanj pou Senyè a! Fè lwanj Bondye nan kay ki apa pou li a! Fè lwanj li nan syèl la kote li montre pouvwa li! Fè lwanj li pou gwo bagay li fè yo! Fè lwanj li paske li gen anpil pouvwa! Tout sa ki gen souf nan nen yo, fè lwanj Senyè a! Lwanj pou Senyè a!",
      en: "Praise the Lord! Praise God in his sanctuary; praise him in his mighty heavens! Praise him for his mighty deeds; praise him according to his excellent greatness! Let everything that has breath praise the Lord! Praise the Lord!",
      es: "¡Alabad a Jehová! Alabad a Dios en su santuario; alabadle en la magnificencia de su firmamento. Alabadle por sus proezas; alabadle conforme a la muchedumbre de su grandeza. Todo lo que respira alabe a Jehová. ¡Alabad a Jehová!",
    },
  },
  {
    number: 1,
    title: {
      fr: "Heureux l'homme qui ne marche pas selon le conseil des méchants",
      ht: "Ala yon nonm kontan, nonm ki pa koute konsèy mechan yo",
      en: "Blessed is the man who walks not in the counsel of the wicked",
      es: "Bienaventurado el varón que no anduvo en consejo de malos",
    },
    text: {
      fr: "Heureux l'homme qui ne marche pas selon le conseil des méchants, qui ne s'arrête pas sur la voie des pécheurs, et qui ne s'assied pas en compagnie des moqueurs, mais qui trouve son plaisir dans la loi de l'Éternel, et qui la médite jour et nuit !",
      ht: "Ala yon nonm kontan, nonm ki pa koute konsèy mechan yo, ki pa swiv egzanp moun k ap fè peche yo, ki pa chita ak moun k ap pase Bondye nan betiz! Men, li pran tout plezi l nan lalwa Senyè a, l ap kalkile lajounen kou lannwit sou lalwa sa a.",
      en: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the Lord, and on his law he meditates day and night.",
      es: "Bienaventurado el varón que no anduvo en consejo de malos, ni estuvo en camino de pecadores, ni en silla de escarnecedores se ha sentado; sino que en la ley de Jehová está su delicia, y en su ley medita de día y de noche.",
    },
  },
  {
    number: 51,
    title: {
      fr: "O Dieu, aie pitié de moi dans ta bonté",
      ht: "O Bondye, gen pitye pou mwen paske ou gen bon kè",
      en: "Have mercy on me, O God, according to your steadfast love",
      es: "Ten piedad de mí, oh Dios, conforme a tu misericordia",
    },
    text: {
      fr: "O Dieu ! aie pitié de moi dans ta bonté ; selon ta grande miséricorde, efface mes transgressions ; lave-moi complètement de mon iniquité, et purifie-moi de mon péché. Crée en moi un cœur pur, O Dieu, renouvelle en moi un esprit bien disposé.",
      ht: "Gen pitye pou mwen, O Bondye, paske ou gen bon kè. Paske ou gen kè sansib, efase peche m yo. Lave m nèt ale pou tout sa m fè ki mal. Netwaye m pou peche m yo. Kreye yon kè pwòp nan mwen, O Bondye. Mete yon lespri tou nèf nan mwen.",
      en: "Have mercy on me, O God, according to your steadfast love; according to your abundant mercy blot out my transgressions. Wash me thoroughly from my iniquity, and cleanse me from my sin. Create in me a clean heart, O God, and renew a right spirit within me.",
      es: "Ten piedad de mí, oh Dios, conforme a tu misericordia; conforme a la multitud de tus piedades borra mis rebeliones. Lávame más y más de mi maldad, y límpiame de mi pecado. Crea en mí, oh Dios, un corazón limpio, y renueva un espíritu recto dentro de mí.",
    },
  },
];
