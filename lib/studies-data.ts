import { Lang } from "./translations";
import type { IconName } from "@/app/components/Icon";
import { teachingStudies, teachingIcons } from "./teachings-data";

export interface StudySection {
  title: Partial<Record<Lang, string>>;
  content: Partial<Record<Lang, string>>;
  verse: string;
}

export type ParcoursKey =
  | "fondements"
  | "psaumes"
  | "nouveau-testament"
  | "histoire-sainte"
  | "formation-disciples"
  | "theologie"
  | "enseignements";

export interface Study {
  slug: string;
  parcours: ParcoursKey;
  title: Partial<Record<Lang, string>>;
  description: Partial<Record<Lang, string>>;
  icon: string;
  color: string;
  duration: string;
  difficulty: Partial<Record<Lang, string>>;
  youtubeId: string;
  sections: StudySection[];
  keyVerses: string[];
}

const baseStudies: Study[] = [
  {
    slug: "la-trinite",
    parcours: "fondements",
    title: { fr: "La Trinité", ht: "Trinite a", en: "The Trinity", es: "La Trinidad" },
    description: { fr: "Comprendre le Père, le Fils et le Saint-Esprit", ht: "Konprann Papa a, Pitit la ak Sentespri a", en: "Understanding the Father, Son and Holy Spirit", es: "Comprender al Padre, al Hijo y al Espíritu Santo" },
    icon: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
    color: "from-violet-500 to-purple-600",
    duration: "8 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Un seul Dieu, trois personnes", ht: "Yon sèl Bondye, twa pèsòn", en: "One God, three persons", es: "Un solo Dios, tres personas" },
        content: {
          fr: "La Trinité est l'un des concepts les plus profonds de la foi chrétienne. Dieu est UN en essence, mais existe en TROIS personnes distinctes : le Père, le Fils (Jésus-Christ), et le Saint-Esprit. Ce n'est pas trois dieux, ni un dieu qui change de forme. C'est un seul Dieu qui existe éternellement en trois personnes.\n\nPensez à l'eau : elle peut être liquide, glace ou vapeur — mais c'est toujours H₂O. De même, Dieu est Père, Fils et Esprit — mais c'est toujours le même Dieu unique.",
          ht: "Trinite a se youn nan konsèp ki pi pwofon nan lafwa kretyen an. Bondye se YON sèl nan esans li, men li egziste nan TWA pèsòn diferan : Papa a, Pitit la (Jezi Kris), ak Sentespri a. Se pa twa bondye, ni yon bondye ki chanje fòm. Se yon sèl Bondye ki egziste pou tout tan nan twa pèsòn.\n\nPanse ak dlo : li ka likid, glas oswa vapè — men se toujou H₂O. Menm jan an, Bondye se Papa, Pitit ak Lespri — men se toujou menm sèl Bondye a.",
          en: "The Trinity is one of the most profound concepts of Christian faith. God is ONE in essence, but exists in THREE distinct persons: the Father, the Son (Jesus Christ), and the Holy Spirit. This is not three gods, nor one god changing forms. It is one God who eternally exists in three persons.\n\nThink of water: it can be liquid, ice, or vapor — but it's always H₂O. Similarly, God is Father, Son, and Spirit — but always the same one God.",
          es: "La Trinidad es uno de los conceptos más profundos de la fe cristiana. Dios es UNO en esencia, pero existe en TRES personas distintas: el Padre, el Hijo (Jesucristo) y el Espíritu Santo. No son tres dioses, ni un dios que cambia de forma. Es un solo Dios que existe eternamente en tres personas.\n\nPiensa en el agua: puede ser líquida, hielo o vapor — pero siempre es H₂O. Del mismo modo, Dios es Padre, Hijo y Espíritu — pero siempre el mismo Dios único.",
        },
        verse: "Matthieu 28:19",
      },
      {
        title: { fr: "Le Père — Le Créateur", ht: "Papa a — Kreyatè a", en: "The Father — The Creator", es: "El Padre — El Creador" },
        content: {
          fr: "Le Père est la source de toute chose. Il a créé l'univers par sa Parole. Il est omniscient (sait tout), omnipotent (peut tout), et omniprésent (est partout). Il est le Dieu d'amour qui a envoyé son Fils pour sauver l'humanité.\n\nJésus nous a appris à l'appeler 'Abba' — un terme intime qui signifie 'Papa'. Ce n'est pas un Dieu distant et froid, mais un Père aimant qui prend soin de chacun de ses enfants.",
          ht: "Papa a se sous tout bagay. Li te kreye linivè pa Pawòl li. Li omisyan (konnen tout bagay), omnipotán (ka fè tout bagay), e omniprezán (toupatou). Li se Bondye lanmou ki te voye Pitit li pou sove limanite.\n\nJezi te aprann nou rele l 'Abba' — yon tèm entim ki vle di 'Papa'. Se pa yon Bondye ki lwen e frèt, men yon Papa ki renmen nou e ki pran swen chak pitit li.",
          en: "The Father is the source of all things. He created the universe by his Word. He is omniscient (knows everything), omnipotent (can do anything), and omnipresent (is everywhere). He is the God of love who sent his Son to save humanity.\n\nJesus taught us to call him 'Abba' — an intimate term meaning 'Dad'. He is not a distant, cold God, but a loving Father who cares for each of his children.",
          es: "El Padre es la fuente de todo. Creó el universo por su Palabra. Es omnisciente (todo lo sabe), omnipotente (todo lo puede) y omnipresente (está en todas partes). Es el Dios de amor que envió a su Hijo para salvar a la humanidad.\n\nJesús nos enseñó a llamarle 'Abba' — un término íntimo que significa 'Papá'. No es un Dios distante y frío, sino un Padre amoroso que cuida a cada uno de sus hijos.",
        },
        verse: "Jean 3:16",
      },
      {
        title: { fr: "Le Fils — Jésus-Christ", ht: "Pitit la — Jezi Kris", en: "The Son — Jesus Christ", es: "El Hijo — Jesucristo" },
        content: {
          fr: "Jésus est Dieu fait homme. Il existait avant la création du monde ('Au commencement était la Parole', Jean 1:1). Il est venu sur terre, a vécu une vie parfaite, est mort sur la croix pour nos péchés, et est ressuscité le 3ème jour.\n\nJésus est à la fois 100% Dieu et 100% homme. C'est un mystère, mais c'est essentiel : seul Dieu pouvait payer pour les péchés de l'humanité, et seul un homme pouvait représenter l'humanité. Jésus est le pont entre Dieu et nous.",
          ht: "Jezi se Bondye ki te fè tèt li tounen moun. Li te egziste anvan kreyasyon mond lan ('Nan kòmansman te gen Pawòl la', Jan 1:1). Li te vini sou tè a, li te viv yon lavi pafè, li te mouri sou kwa a pou peche nou yo, epi li te resisite 3èm jou a.\n\nJezi se an menm tan 100% Bondye ak 100% moun. Se yon mistè, men li esansyèl : sèl Bondye ki te ka peye pou peche limanite, e sèl yon moun ki te ka reprezante limanite. Jezi se pon ant Bondye ak nou.",
          en: "Jesus is God made man. He existed before the creation of the world ('In the beginning was the Word', John 1:1). He came to earth, lived a perfect life, died on the cross for our sins, and rose on the 3rd day.\n\nJesus is both 100% God and 100% man. It's a mystery, but it's essential: only God could pay for humanity's sins, and only a man could represent humanity. Jesus is the bridge between God and us.",
          es: "Jesús es Dios hecho hombre. Existía antes de la creación del mundo ('En el principio era el Verbo', Juan 1:1). Vino a la tierra, vivió una vida perfecta, murió en la cruz por nuestros pecados y resucitó al tercer día.\n\nJesús es a la vez 100% Dios y 100% hombre. Es un misterio, pero es esencial: solo Dios podía pagar por los pecados de la humanidad, y solo un hombre podía representar a la humanidad. Jesús es el puente entre Dios y nosotros.",
        },
        verse: "Jean 1:1-14",
      },
      {
        title: { fr: "Le Saint-Esprit — Notre guide", ht: "Sentespri a — Gid nou", en: "The Holy Spirit — Our guide", es: "El Espíritu Santo — Nuestro guía" },
        content: {
          fr: "Le Saint-Esprit est Dieu vivant en nous. Après l'ascension de Jésus, le Saint-Esprit est venu à la Pentecôte pour guider, consoler et donner la puissance aux croyants. Il n'est pas une force impersonnelle — c'est une personne divine qui parle, guide, et peut être attristé.\n\nLe Saint-Esprit produit des fruits dans notre vie : amour, joie, paix, patience, bonté, bienveillance, fidélité, douceur et maîtrise de soi (Galates 5:22-23). Si vous voyez ces fruits grandir dans votre vie, c'est le Saint-Esprit à l'œuvre.",
          ht: "Sentespri a se Bondye k ap viv nan nou. Apre Jezi te monte nan syèl, Sentespri a te vini nan Lapannkòt pou gide, konsole e bay kwayan yo pisans. Li pa yon fòs san pèsonalite — se yon pèsòn diven ki pale, gide, e ki ka tris.\n\nSentespri a pwodui fwi nan lavi nou : lanmou, kè kontan, lapè, pasyans, bonte, jantiyès, fidelite, dousè ak metriz tèt (Galat 5:22-23). Si ou wè fwi sa yo ap grandi nan lavi ou, se Sentespri a k ap travay.",
          en: "The Holy Spirit is God living in us. After Jesus' ascension, the Holy Spirit came at Pentecost to guide, comfort, and empower believers. He is not an impersonal force — he is a divine person who speaks, guides, and can be grieved.\n\nThe Holy Spirit produces fruit in our lives: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness and self-control (Galatians 5:22-23). If you see these fruits growing in your life, that's the Holy Spirit at work.",
          es: "El Espíritu Santo es Dios viviendo en nosotros. Después de la ascensión de Jesús, el Espíritu Santo vino en Pentecostés para guiar, consolar y dar poder a los creyentes. No es una fuerza impersonal — es una persona divina que habla, guía y puede ser entristecida.\n\nEl Espíritu Santo produce fruto en nuestras vidas: amor, gozo, paz, paciencia, bondad, benignidad, fidelidad, mansedumbre y dominio propio (Gálatas 5:22-23). Si ves estos frutos creciendo en tu vida, es el Espíritu Santo obrando.",
        },
        verse: "Actes 2:1-4",
      },
    ],
    keyVerses: ["Matthieu 28:19", "Jean 1:1", "Jean 3:16", "Actes 2:1-4", "Galates 5:22-23"],
  },
  {
    slug: "grace-vs-loi",
    parcours: "fondements",
    title: { fr: "La Grâce vs La Loi", ht: "Lagras kont Lalwa", en: "Grace vs The Law", es: "La Gracia vs La Ley" },
    description: { fr: "Sommes-nous sauvés par les œuvres ou par la foi ?", ht: "Èske nou sove pa zèv oswa pa lafwa ?", en: "Are we saved by works or by faith?", es: "¿Somos salvos por obras o por la fe?" },
    icon: "https://cdn-icons-png.flaticon.com/512/3122/3122803.png",
    color: "from-blue-500 to-cyan-600",
    duration: "7 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "La Loi de Moïse", ht: "Lalwa Moyiz", en: "The Law of Moses", es: "La Ley de Moisés" },
        content: {
          fr: "Dieu a donné la Loi (les 10 commandements et 613 lois) à Moïse sur le mont Sinaï. Cette Loi était parfaite — elle montrait le standard de Dieu. Mais aucun être humain n'a jamais pu la suivre parfaitement.\n\nLa Loi n'a pas été donnée pour nous sauver. Elle a été donnée comme un miroir — pour nous montrer notre péché et notre besoin d'un Sauveur. Paul dit : 'La Loi a été comme un pédagogue pour nous conduire à Christ' (Galates 3:24).",
          ht: "Bondye te bay Lalwa (10 kòmandman ak 613 lwa) bay Moyiz sou mòn Sinayi. Lalwa sa a te pafè — li te montre estanda Bondye a. Men okenn moun pa t janm ka swiv li pafètman.\n\nLalwa pa t bay pou sove nou. Li te bay tankou yon glas — pou montre nou peche nou ak bezwen nou pou yon Sovè. Pòl di : 'Lalwa te tankou yon monitè pou mennen nou bò kote Kris' (Galat 3:24).",
          en: "God gave the Law (the 10 commandments and 613 laws) to Moses on Mount Sinai. This Law was perfect — it showed God's standard. But no human being has ever been able to follow it perfectly.\n\nThe Law was not given to save us. It was given as a mirror — to show us our sin and our need for a Savior. Paul says: 'The Law was our guardian to lead us to Christ' (Galatians 3:24).",
          es: "Dios dio la Ley (los 10 mandamientos y 613 leyes) a Moisés en el monte Sinaí. Esta Ley era perfecta — mostraba el estándar de Dios. Pero ningún ser humano ha podido seguirla perfectamente.\n\nLa Ley no fue dada para salvarnos. Fue dada como un espejo — para mostrarnos nuestro pecado y nuestra necesidad de un Salvador. Pablo dice: 'La Ley fue nuestro ayo para llevarnos a Cristo' (Gálatas 3:24).",
        },
        verse: "Galates 3:24",
      },
      {
        title: { fr: "La Grâce — Le don gratuit", ht: "Lagras — Kado gratis la", en: "Grace — The free gift", es: "La Gracia — El don gratuito" },
        content: {
          fr: "La grâce, c'est recevoir ce qu'on ne mérite pas. Nous méritons la punition pour nos péchés, mais Dieu nous offre le pardon gratuitement à travers Jésus-Christ.\n\n'Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu. Ce n'est point par les œuvres, afin que personne ne se glorifie.' (Éphésiens 2:8-9)\n\nCela signifie que personne ne peut 'gagner' le ciel par ses bonnes actions. Le salut est un cadeau. Il suffit de le recevoir par la foi.",
          ht: "Lagras, se resevwa sa ou pa merite. Nou merite pinisyon pou peche nou yo, men Bondye ofri nou padon gratis atravè Jezi Kris.\n\n'Paske se pa lagras nou sove, pa mwayen lafwa. Sa pa soti nan nou menm, se kado Bondye. Se pa pa zèv, pou pèsonn pa ka vante tèt li.' (Efezyen 2:8-9)\n\nSa vle di pèsonn pa ka 'genyen' syèl la pa bon aksyon li. Delivrans lan se yon kado. Ou jis bezwen resevwa l pa lafwa.",
          en: "Grace is receiving what we don't deserve. We deserve punishment for our sins, but God offers us forgiveness freely through Jesus Christ.\n\n'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.' (Ephesians 2:8-9)\n\nThis means no one can 'earn' heaven by good deeds. Salvation is a gift. You just need to receive it by faith.",
          es: "La gracia es recibir lo que no merecemos. Merecemos castigo por nuestros pecados, pero Dios nos ofrece el perdón gratuitamente a través de Jesucristo.\n\n'Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe.' (Efesios 2:8-9)\n\nEsto significa que nadie puede 'ganarse' el cielo con buenas obras. La salvación es un regalo. Solo hay que recibirla por la fe.",
        },
        verse: "Éphésiens 2:8-9",
      },
      {
        title: { fr: "Alors, la Loi est-elle inutile ?", ht: "Alò, èske Lalwa pa itil ?", en: "So, is the Law useless?", es: "¿Entonces, la Ley es inútil?" },
        content: {
          fr: "Non ! La Loi reste le standard moral de Dieu. Jésus n'est pas venu abolir la Loi, mais l'accomplir (Matthieu 5:17). Nous ne sommes plus SOUS la Loi (elle ne nous condamne plus), mais nous suivons ses principes par amour.\n\nLa différence : sous la Loi, on obéit par PEUR de la punition. Sous la grâce, on obéit par AMOUR pour Dieu. Le résultat extérieur peut sembler identique, mais la motivation est complètement différente.\n\nUn enfant qui range sa chambre par peur d'être puni vs un enfant qui range par amour pour ses parents — l'action est la même, le cœur est différent.",
          ht: "Non ! Lalwa rete estanda moral Bondye. Jezi pa t vini pou aboli Lalwa, men pou akonpli l (Matye 5:17). Nou pa anba Lalwa ankò (li pa kondane nou ankò), men nou swiv prensip li pa lanmou.\n\nDiferans lan : anba Lalwa, ou obeyí pa LAPERÈZ pinisyon. Anba lagras, ou obeyí pa LANMOU pou Bondye. Rezilta deyò a ka sanble menm, men motivasyon an konplètman diferan.\n\nYon timoun ki ranje chanm li pa laperèz pou yo pini l vs yon timoun ki ranje pa lanmou pou paran l — aksyon an menm, kè a diferan.",
          en: "No! The Law remains God's moral standard. Jesus didn't come to abolish the Law, but to fulfill it (Matthew 5:17). We are no longer UNDER the Law (it no longer condemns us), but we follow its principles out of love.\n\nThe difference: under the Law, we obey out of FEAR of punishment. Under grace, we obey out of LOVE for God. The outward result may look the same, but the motivation is completely different.\n\nA child who cleans their room out of fear of punishment vs a child who cleans out of love for their parents — the action is the same, the heart is different.",
          es: "¡No! La Ley sigue siendo el estándar moral de Dios. Jesús no vino a abolir la Ley, sino a cumplirla (Mateo 5:17). Ya no estamos BAJO la Ley (ya no nos condena), pero seguimos sus principios por amor.\n\nLa diferencia: bajo la Ley, obedecemos por MIEDO al castigo. Bajo la gracia, obedecemos por AMOR a Dios. El resultado externo puede parecer idéntico, pero la motivación es completamente diferente.\n\nUn niño que ordena su habitación por miedo a ser castigado vs un niño que la ordena por amor a sus padres — la acción es la misma, el corazón es diferente.",
        },
        verse: "Matthieu 5:17",
      },
    ],
    keyVerses: ["Galates 3:24", "Éphésiens 2:8-9", "Matthieu 5:17", "Romains 6:14"],
  },
  {
    slug: "apocalypse",
    parcours: "nouveau-testament",
    title: { fr: "Les Prophéties de l'Apocalypse", ht: "Pwofesi Apokalips yo", en: "Revelation Prophecies", es: "Las Profecías del Apocalipsis" },
    description: { fr: "Les derniers temps expliqués simplement", ht: "Dènye tan yo eksplike tou senp", en: "End times explained simply", es: "Los últimos tiempos explicados de forma sencilla" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-red-500 to-orange-600",
    duration: "10 min",
    difficulty: { fr: "Expert", ht: "Ekspè", en: "Expert", es: "Experto" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Qu'est-ce que l'Apocalypse ?", ht: "Kisa Apokalips la ye ?", en: "What is Revelation?", es: "¿Qué es el Apocalipsis?" },
        content: {
          fr: "Le mot 'Apocalypse' vient du grec 'apokalypsis' qui signifie 'révélation' ou 'dévoilement'. Ce n'est PAS un livre de terreur — c'est un livre de VICTOIRE. Il révèle comment Dieu triomphera définitivement du mal.\n\nÉcrit par l'apôtre Jean sur l'île de Patmos vers l'an 95, ce livre utilise beaucoup de symbolisme : des nombres (7 = perfection, 12 = peuple de Dieu), des couleurs (blanc = pureté, rouge = sang/guerre), et des créatures (agneau = Jésus, dragon = Satan).\n\nLe message central est simple : peu importe les difficultés, JÉSUS GAGNE À LA FIN.",
          ht: "Mo 'Apokalips' soti nan grèk 'apokalypsis' ki vle di 'revelasyon' oswa 'devwale'. Se PA yon liv laterè — se yon liv VIKTWA. Li revele kijan Bondye ap triyanfe definitivman sou mal la.\n\nApot Jan te ekri l sou zile Patmòs vè ane 95, liv sa a itilize anpil senbolism : chif (7 = pèfeksyon, 12 = pèp Bondye), koulè (blan = pirete, wouj = san/lagè), ak bèt (mouton = Jezi, dragon = Satan).\n\nMesaj santral la senp : kèlkeswa difikilte yo, JEZI GENYEN NAN FEN AN.",
          en: "The word 'Apocalypse' comes from the Greek 'apokalypsis' meaning 'revelation' or 'unveiling'. It is NOT a book of terror — it's a book of VICTORY. It reveals how God will definitively triumph over evil.\n\nWritten by the apostle John on the island of Patmos around 95 AD, this book uses much symbolism: numbers (7 = perfection, 12 = God's people), colors (white = purity, red = blood/war), and creatures (lamb = Jesus, dragon = Satan).\n\nThe central message is simple: no matter the difficulties, JESUS WINS IN THE END.",
          es: "La palabra 'Apocalipsis' viene del griego 'apokalypsis' que significa 'revelación' o 'desvelamiento'. NO es un libro de terror — es un libro de VICTORIA. Revela cómo Dios triunfará definitivamente sobre el mal.\n\nEscrito por el apóstol Juan en la isla de Patmos hacia el año 95, este libro usa mucho simbolismo: números (7 = perfección, 12 = pueblo de Dios), colores (blanco = pureza, rojo = sangre/guerra) y criaturas (cordero = Jesús, dragón = Satanás).\n\nEl mensaje central es simple: sin importar las dificultades, JESÚS GANA AL FINAL.",
        },
        verse: "Apocalypse 1:1",
      },
      {
        title: { fr: "Les 7 Églises", ht: "7 Legliz yo", en: "The 7 Churches", es: "Las 7 Iglesias" },
        content: {
          fr: "Les chapitres 2-3 contiennent des lettres à 7 églises réelles d'Asie Mineure. Chaque lettre contient un message pertinent pour nous aujourd'hui :\n\n• Éphèse — a perdu son premier amour\n• Smyrne — fidèle malgré la souffrance\n• Pergame — tolère de faux enseignements\n• Thyatire — tolère l'immoralité\n• Sardes — morte spirituellement malgré une bonne réputation\n• Philadelphie — fidèle avec peu de force\n• Laodicée — tiède, ni chaud ni froid\n\nÀ laquelle de ces églises ressemblez-vous ? C'est la question que Dieu nous pose.",
          ht: "Chapit 2-3 gen lèt bay 7 legliz reyèl nan Azi Minè. Chak lèt gen yon mesaj ki enpòtan pou nou jodi a :\n\n• Efèz — te pèdi premye lanmou li\n• Smirn — fidèl malgre soufrans\n• Pègam — tolere fo ansèyman\n• Tiyati — tolere immoralite\n• Sard — mouri espirityèlman malgre yon bon repitasyon\n• Filadelfi — fidèl ak ti kras fòs\n• Laodise — tyèd, ni cho ni frèt\n\nNan ki legliz sa yo ou sanble ? Se kesyon Bondye poze nou.",
          en: "Chapters 2-3 contain letters to 7 real churches in Asia Minor. Each letter contains a message relevant for us today:\n\n• Ephesus — lost its first love\n• Smyrna — faithful despite suffering\n• Pergamum — tolerates false teachings\n• Thyatira — tolerates immorality\n• Sardis — spiritually dead despite a good reputation\n• Philadelphia — faithful with little strength\n• Laodicea — lukewarm, neither hot nor cold\n\nWhich of these churches do you resemble? That's the question God asks us.",
          es: "Los capítulos 2-3 contienen cartas a 7 iglesias reales de Asia Menor. Cada carta contiene un mensaje relevante para nosotros hoy:\n\n• Éfeso — perdió su primer amor\n• Esmirna — fiel a pesar del sufrimiento\n• Pérgamo — tolera falsas enseñanzas\n• Tiatira — tolera la inmoralidad\n• Sardis — muerta espiritualmente a pesar de buena reputación\n• Filadelfia — fiel con poca fuerza\n• Laodicea — tibia, ni fría ni caliente\n\n¿A cuál de estas iglesias se parece usted? Esa es la pregunta que Dios nos hace.",
        },
        verse: "Apocalypse 2-3",
      },
      {
        title: { fr: "La fin : Nouveau Ciel, Nouvelle Terre", ht: "Fen an : Nouvo Syèl, Nouvo Tè", en: "The End: New Heaven, New Earth", es: "El fin: Nuevo Cielo, Nueva Tierra" },
        content: {
          fr: "L'Apocalypse se termine par la plus belle promesse de la Bible : Dieu créera un nouveau ciel et une nouvelle terre. Plus de souffrance, plus de larmes, plus de mort.\n\n'Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu.' (Apocalypse 21:4)\n\nCe n'est pas la fin du monde — c'est le début du monde parfait que Dieu avait toujours voulu. Le jardin d'Éden restauré, mais en mieux. La relation brisée entre Dieu et l'humanité est complètement guérie.",
          ht: "Apokalips la fini ak pi bèl pwomès nan Bib la : Bondye ap kreye yon nouvo syèl ak yon nouvo tè. Pa gen soufrans ankò, pa gen dlo nan je ankò, pa gen lanmò ankò.\n\n'Li ap siye tout dlo nan je yo, lanmò p ap la ankò, pa gen chagren, ni rèl, ni doulè ankò, paske premye bagay yo disparèt.' (Apokalips 21:4)\n\nSe pa fen mond lan — se kòmansman mond pafè Bondye te toujou vle a. Jaden Edèn restore, men pi bon. Relasyon ki te kraze ant Bondye ak limanite konplètman geri.",
          en: "Revelation ends with the most beautiful promise in the Bible: God will create a new heaven and a new earth. No more suffering, no more tears, no more death.\n\n'He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away.' (Revelation 21:4)\n\nThis is not the end of the world — it's the beginning of the perfect world God always wanted. The Garden of Eden restored, but better. The broken relationship between God and humanity is completely healed.",
          es: "El Apocalipsis termina con la promesa más hermosa de la Biblia: Dios creará un nuevo cielo y una nueva tierra. No más sufrimiento, no más lágrimas, no más muerte.\n\n'Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor; porque las primeras cosas pasaron.' (Apocalipsis 21:4)\n\nNo es el fin del mundo — es el comienzo del mundo perfecto que Dios siempre quiso. El jardín del Edén restaurado, pero mejor. La relación rota entre Dios y la humanidad completamente sanada.",
        },
        verse: "Apocalypse 21:4",
      },
    ],
    keyVerses: ["Apocalypse 1:1", "Apocalypse 21:4", "Apocalypse 22:20"],
  },
  {
    slug: "le-pardon",
    parcours: "fondements",
    title: { fr: "Le Pardon", ht: "Padon", en: "Forgiveness", es: "El Perdón" },
    description: { fr: "Pourquoi et comment pardonner — même l'impardonnable", ht: "Poukisa ak kijan pou padonnen — menm sa ki pa ka padone", en: "Why and how to forgive — even the unforgivable", es: "Por qué y cómo perdonar — incluso lo imperdonable" },
    icon: "https://cdn-icons-png.flaticon.com/512/1216/1216575.png",
    color: "from-pink-500 to-rose-600",
    duration: "6 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner", es: "Principiante" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Dieu nous a pardonnés en premier", ht: "Bondye te padonnen nou an premye", en: "God forgave us first", es: "Dios nos perdonó primero" },
        content: {
          fr: "Le pardon commence avec Dieu. Alors que nous étions encore pécheurs, Christ est mort pour nous (Romains 5:8). Dieu ne nous a pas pardonnés parce que nous le méritions, mais parce qu'Il nous aime.\n\nSi Dieu, qui est parfait, peut pardonner nos péchés — des offenses contre un Dieu saint et infini — alors nous pouvons aussi pardonner les offenses que les autres commettent contre nous.\n\nLe pardon n'est pas un sentiment. C'est une décision. Vous pouvez choisir de pardonner même quand vos émotions crient le contraire.",
          ht: "Padon kòmanse ak Bondye. Pandan nou te toujou pechè, Kris te mouri pou nou (Womèn 5:8). Bondye pa t padonnen nou paske nou te merite l, men paske Li renmen nou.\n\nSi Bondye, ki pafè, ka padonnen peche nou yo — ofans kont yon Bondye sen e enfini — alò nou ka padonnen ofans lòt moun fè nou tou.\n\nPadon pa yon santiman. Se yon desizyon. Ou ka chwazi padonnen menm lè emosyon ou ap rele kontrè a.",
          en: "Forgiveness starts with God. While we were still sinners, Christ died for us (Romans 5:8). God didn't forgive us because we deserved it, but because He loves us.\n\nIf God, who is perfect, can forgive our sins — offenses against a holy and infinite God — then we can also forgive the offenses others commit against us.\n\nForgiveness is not a feeling. It's a decision. You can choose to forgive even when your emotions scream the opposite.",
          es: "El perdón comienza con Dios. Siendo aún pecadores, Cristo murió por nosotros (Romanos 5:8). Dios no nos perdonó porque lo mereciéramos, sino porque nos ama.\n\nSi Dios, que es perfecto, puede perdonar nuestros pecados — ofensas contra un Dios santo e infinito — entonces también nosotros podemos perdonar las ofensas que otros cometen contra nosotros.\n\nEl perdón no es un sentimiento. Es una decisión. Puedes elegir perdonar incluso cuando tus emociones gritan lo contrario.",
        },
        verse: "Romains 5:8",
      },
      {
        title: { fr: "70 fois 7 fois", ht: "70 fwa 7 fwa", en: "70 times 7", es: "70 veces 7 veces" },
        content: {
          fr: "Pierre a demandé à Jésus : 'Seigneur, combien de fois pardonnerai-je à mon frère ? Jusqu'à 7 fois ?' Jésus lui répondit : 'Je ne te dis pas jusqu'à 7 fois, mais jusqu'à 70 fois 7 fois.' (Matthieu 18:21-22)\n\n70 × 7 = 490 ? Non. Jésus ne donnait pas un nombre exact. Il disait : pardonne TOUJOURS, sans compter. Le pardon n'a pas de limite.\n\nCela ne veut pas dire accepter les abus ou ne pas se protéger. Le pardon, c'est libérer VOTRE cœur de l'amertume. Garder la rancune, c'est comme boire du poison et espérer que l'autre personne tombe malade.",
          ht: "Pyè te mande Jezi : 'Senyè, konbyen fwa m ap padonnen frè m nan ? Jiska 7 fwa ?' Jezi reponn li : 'Mwen pa di ou jiska 7 fwa, men jiska 70 fwa 7 fwa.' (Matye 18:21-22)\n\n70 × 7 = 490 ? Non. Jezi pa t bay yon chif egzak. Li t ap di : padonnen TOUJOU, san konte. Padon pa gen limit.\n\nSa pa vle di aksepte abi oswa pa pwoteje tèt ou. Padon, se libere KÈ OU de amètim. Kenbe rankin, se tankou bwè pwazon epi espere lòt moun nan tonbe malad.",
          en: "Peter asked Jesus: 'Lord, how many times shall I forgive my brother? Up to 7 times?' Jesus answered: 'I do not say to you up to 7 times, but up to 70 times 7.' (Matthew 18:21-22)\n\n70 × 7 = 490? No. Jesus wasn't giving an exact number. He was saying: forgive ALWAYS, without counting. Forgiveness has no limit.\n\nThis doesn't mean accepting abuse or not protecting yourself. Forgiveness is freeing YOUR heart from bitterness. Holding a grudge is like drinking poison and hoping the other person gets sick.",
          es: "Pedro preguntó a Jesús: '¿Señor, cuántas veces perdonaré a mi hermano? ¿Hasta siete?' Jesús le respondió: 'No te digo hasta siete, sino hasta setenta veces siete.' (Mateo 18:21-22)\n\n70 × 7 = 490? No. Jesús no daba un número exacto. Decía: perdona SIEMPRE, sin contar. El perdón no tiene límite.\n\nEsto no significa aceptar el abuso ni dejar de protegerse. El perdón es liberar TU corazón de la amargura. Guardar rencor es como beber veneno esperando que la otra persona se enferme.",
        },
        verse: "Matthieu 18:21-22",
      },
    ],
    keyVerses: ["Romains 5:8", "Matthieu 18:21-22", "Colossiens 3:13", "Éphésiens 4:32"],
  },
  {
    slug: "la-priere",
    parcours: "fondements",
    title: { fr: "La Puissance de la Prière", ht: "Pisans Lapriyè", en: "The Power of Prayer", es: "El Poder de la Oración" },
    description: { fr: "Comment prier efficacement et voir des résultats", ht: "Kijan pou priye efikasman epi wè rezilta", en: "How to pray effectively and see results", es: "Cómo orar eficazmente y ver resultados" },
    icon: "https://cdn-icons-png.flaticon.com/512/4305/4305512.png",
    color: "from-amber-500 to-yellow-600",
    duration: "7 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner", es: "Principiante" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Qu'est-ce que la prière ?", ht: "Kisa lapriyè ye ?", en: "What is prayer?", es: "¿Qué es la oración?" },
        content: {
          fr: "La prière n'est pas une récitation de mots religieux. C'est une CONVERSATION avec Dieu. Comme vous parlez à un ami, vous pouvez parler à Dieu — avec vos propres mots, dans votre propre langue, à n'importe quel moment.\n\nJésus a condamné ceux qui priaient pour être vus des autres (Matthieu 6:5). La vraie prière est sincère, humble et vient du cœur. Dieu ne cherche pas des mots parfaits — Il cherche un cœur sincère.\n\nVous n'avez pas besoin d'être dans une église pour prier. Priez en conduisant, en marchant, en travaillant. 'Priez sans cesse' (1 Thessaloniciens 5:17).",
          ht: "Lapriyè pa yon resitasyon mo relijye. Se yon KONVÈSASYON ak Bondye. Tankou ou pale ak yon zanmi, ou ka pale ak Bondye — ak pwòp mo ou, nan pwòp lang ou, nenpòt ki lè.\n\nJezi te kondane moun ki t ap priye pou lòt moun wè yo (Matye 6:5). Vrè lapriyè sensè, enb e soti nan kè. Bondye pa chèche mo pafè — Li chèche yon kè sensè.\n\nOu pa bezwen nan yon legliz pou priye. Priye pandan ou ap kondwi, mache, travay. 'Priye san rete' (1 Tesalonisyen 5:17).",
          en: "Prayer is not reciting religious words. It's a CONVERSATION with God. Just as you talk to a friend, you can talk to God — in your own words, in your own language, at any time.\n\nJesus condemned those who prayed to be seen by others (Matthew 6:5). True prayer is sincere, humble, and comes from the heart. God doesn't look for perfect words — He looks for a sincere heart.\n\nYou don't need to be in a church to pray. Pray while driving, walking, working. 'Pray without ceasing' (1 Thessalonians 5:17).",
          es: "La oración no es una recitación de palabras religiosas. Es una CONVERSACIÓN con Dios. Así como hablas con un amigo, puedes hablar con Dios — con tus propias palabras, en tu propio idioma, en cualquier momento.\n\nJesús condenó a quienes oraban para ser vistos por otros (Mateo 6:5). La verdadera oración es sincera, humilde y viene del corazón. Dios no busca palabras perfectas — busca un corazón sincero.\n\nNo necesitas estar en una iglesia para orar. Ora mientras conduces, caminas, trabajas. 'Orad sin cesar' (1 Tesalonicenses 5:17).",
        },
        verse: "1 Thessaloniciens 5:17",
      },
      {
        title: { fr: "Le modèle de Jésus : Le Notre Père", ht: "Modèl Jezi a : Notrè Pè a", en: "Jesus' model: The Lord's Prayer", es: "El modelo de Jesús: El Padre Nuestro" },
        content: {
          fr: "Jésus nous a donné un modèle de prière (Matthieu 6:9-13). Ce n'est pas une formule à répéter mécaniquement, mais un guide pour structurer nos prières :\n\n1. ADORATION — 'Notre Père qui es aux cieux, que ton nom soit sanctifié'\n2. SOUMISSION — 'Que ton règne vienne, que ta volonté soit faite'\n3. DEMANDE — 'Donne-nous notre pain quotidien'\n4. PARDON — 'Pardonne-nous nos offenses comme nous pardonnons'\n5. PROTECTION — 'Ne nous induis pas en tentation, mais délivre-nous du mal'\n\nCommencez par louer Dieu, puis soumettez-vous à sa volonté, demandez vos besoins, demandez pardon, et demandez sa protection.",
          ht: "Jezi te ban nou yon modèl lapriyè (Matye 6:9-13). Se pa yon fòmil pou repete mekanikman, men yon gid pou estrikture lapriyè nou yo :\n\n1. ADORASYON — 'Papa nou ki nan syèl la, se pou non ou sen'\n2. SOUMISYON — 'Se pou wayòm ou vini, se pou volonte ou fèt'\n3. DEMANN — 'Ban nou pen nou bezwen jodi a'\n4. PADON — 'Padonnen peche nou tankou nou padonnen'\n5. PWOTEKSYON — 'Pa kite nou tonbe nan tantasyon, men delivre nou anba mal'\n\nKòmanse pa fè lwanj Bondye, apre sa soumèt ou a volonte l, mande sa ou bezwen, mande padon, epi mande pwoteksyon l.",
          en: "Jesus gave us a model prayer (Matthew 6:9-13). It's not a formula to repeat mechanically, but a guide to structure our prayers:\n\n1. WORSHIP — 'Our Father in heaven, hallowed be your name'\n2. SUBMISSION — 'Your kingdom come, your will be done'\n3. REQUEST — 'Give us this day our daily bread'\n4. FORGIVENESS — 'Forgive us our debts, as we forgive our debtors'\n5. PROTECTION — 'Lead us not into temptation, but deliver us from evil'\n\nStart by praising God, then submit to his will, ask for your needs, ask for forgiveness, and ask for his protection.",
          es: "Jesús nos dio un modelo de oración (Mateo 6:9-13). No es una fórmula para repetir mecánicamente, sino una guía para estructurar nuestras oraciones:\n\n1. ADORACIÓN — 'Padre nuestro que estás en los cielos, santificado sea tu nombre'\n2. SUMISIÓN — 'Venga tu reino, hágase tu voluntad'\n3. PETICIÓN — 'Danos hoy nuestro pan de cada día'\n4. PERDÓN — 'Perdona nuestras deudas, como también nosotros perdonamos'\n5. PROTECCIÓN — 'No nos metas en tentación, mas líbranos del mal'\n\nComienza alabando a Dios, luego sométete a su voluntad, pide tus necesidades, pide perdón y pide su protección.",
        },
        verse: "Matthieu 6:9-13",
      },
    ],
    keyVerses: ["Matthieu 6:9-13", "1 Thessaloniciens 5:17", "Philippiens 4:6-7", "Jacques 5:16"],
  },
  {
    slug: "creation",
    parcours: "histoire-sainte",
    title: { fr: "La Création", ht: "Kreyasyon an", en: "The Creation", es: "La Creación" },
    description: { fr: "Comment Dieu a créé le monde en 6 jours", ht: "Kijan Bondye te kreye mond lan nan 6 jou", en: "How God created the world in 6 days", es: "Cómo Dios creó el mundo en 6 días" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-emerald-500 to-green-600",
    duration: "8 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner", es: "Principiante" },
    youtubeId: "",
    sections: [
      { title: { fr: "Au commencement", ht: "Nan kòmansman", en: "In the beginning", es: "En el principio" }, content: { fr: "Au commencement, Dieu créa les cieux et la terre. La terre était informe et vide ; il y avait des ténèbres à la surface de l'abîme, et l'esprit de Dieu se mouvait au-dessus des eaux.\n\nDieu dit : Que la lumière soit ! Et la lumière fut. Dieu vit que la lumière était bonne ; et Dieu sépara la lumière d'avec les ténèbres. Ce fut le premier jour de la création — le début de tout ce qui existe.", ht: "Nan kòmansman, Bondye te kreye syèl la ak tè a. Tè a te san fòm e vid; te gen fènwa sou sifas abim nan, e lespri Bondye t ap plane sou dlo yo.\n\nBondye di : Se pou limyè fèt ! E limyè te fèt. Bondye wè limyè a te bon ; e Bondye separe limyè a ak fènwa a. Se te premye jou kreyasyon an.", en: "In the beginning, God created the heavens and the earth. The earth was without form and void; and darkness was on the face of the deep, and the Spirit of God was hovering over the face of the waters.\n\nGod said: Let there be light! And there was light. God saw that the light was good; and God separated the light from the darkness. This was the first day of creation.", es: "En el principio, Dios creó los cielos y la tierra. La tierra estaba desordenada y vacía; las tinieblas cubrían el abismo, y el Espíritu de Dios se movía sobre las aguas.\n\nDios dijo: ¡Sea la luz! Y fue la luz. Dios vio que la luz era buena; y Dios separó la luz de las tinieblas. Este fue el primer día de la creación — el comienzo de todo lo que existe." }, verse: "Genèse 1:1-5" },
      { title: { fr: "L'homme à l'image de Dieu", ht: "Moun nan imaj Bondye", en: "Man in God's image", es: "El hombre a imagen de Dios" }, content: { fr: "Dieu dit : Faisons l'homme à notre image, selon notre ressemblance. L'Éternel Dieu forma l'homme de la poussière de la terre, il souffla dans ses narines un souffle de vie et l'homme devint un être vivant.\n\nDieu créa l'homme différent de tout le reste de la création. L'homme a une âme, une conscience, la capacité d'aimer et de choisir. Être créé à l'image de Dieu signifie que nous avons une valeur infinie aux yeux de Dieu.", ht: "Bondye di : Ann fè moun nan imaj nou, dapre resanblans nou. Senyè Bondye te fòme moun nan ak pousyè tè a, li te soufle nan nen l yon souf lavi e moun nan te vin yon èt vivan.\n\nBondye te kreye moun nan diferan de tout lòt kreyasyon an. Moun gen yon nanm, yon konsyans, kapasite pou renmen ak chwazi.", en: "God said: Let us make man in our image, after our likeness. The Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living being.\n\nGod created man different from all the rest of creation. Man has a soul, a conscience, the ability to love and choose.", es: "Dios dijo: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza. El Señor Dios formó al hombre del polvo de la tierra, y sopló en su nariz aliento de vida, y fue el hombre un ser viviente.\n\nDios creó al hombre diferente de toda la demás creación. El hombre tiene alma, conciencia, capacidad de amar y elegir. Ser creado a imagen de Dios significa que tenemos un valor infinito ante sus ojos." }, verse: "Genèse 1:26-27" },
    ],
    keyVerses: ["Genèse 1:1", "Genèse 1:26-27", "Genèse 2:7"],
  },
  {
    slug: "abraham",
    parcours: "histoire-sainte",
    title: { fr: "Abraham — Le Père de la Foi", ht: "Abraram — Papa Lafwa", en: "Abraham — Father of Faith", es: "Abraham — El Padre de la Fe" },
    description: { fr: "L'homme qui a cru Dieu contre toute espérance", ht: "Nonm ki te kwè Bondye kont tout esperans", en: "The man who believed God against all hope", es: "El hombre que creyó a Dios contra toda esperanza" },
    icon: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
    color: "from-amber-500 to-orange-600",
    duration: "9 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "L'appel d'Abraham", ht: "Apèl Abraram", en: "The call of Abraham", es: "El llamado de Abraham" }, content: { fr: "L'Éternel dit à Abram : Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai. Je ferai de toi une grande nation, et je te bénirai.\n\nAbraham avait 75 ans quand Dieu l'a appelé à tout quitter — sa famille, sa terre, sa sécurité — pour aller vers un pays inconnu. C'est la définition même de la foi : obéir à Dieu sans voir la destination.", ht: "Senyè a di Abram : Ale kite peyi ou, fanmi ou, ak kay papa ou, pou ale nan peyi mwen pral montre ou a. M ap fè ou vin yon gwo nasyon, e m ap beni ou.\n\nAbraram te gen 75 an lè Bondye te rele l kite tout bagay — fanmi l, tè l, sekirite l — pou ale nan yon peyi li pa konnen.", en: "The Lord said to Abram: Go from your country, your people and your father's household to the land I will show you. I will make you into a great nation, and I will bless you.\n\nAbraham was 75 years old when God called him to leave everything — his family, his land, his security — to go to an unknown country.", es: "El Señor dijo a Abram: Vete de tu tierra y de tu parentela, y de la casa de tu padre, a la tierra que te mostraré. Y haré de ti una nación grande, y te bendeciré.\n\nAbraham tenía 75 años cuando Dios lo llamó a dejarlo todo — su familia, su tierra, su seguridad — para ir a un país desconocido. Esta es la definición misma de la fe: obedecer a Dios sin ver el destino." }, verse: "Genèse 12:1-3" },
      { title: { fr: "La promesse d'un fils", ht: "Pwomès yon pitit gason", en: "The promise of a son", es: "La promesa de un hijo" }, content: { fr: "Dieu promit à Abraham un fils alors que Sara avait 90 ans et Abraham 100 ans. Humainement, c'était impossible. Mais Abraham crut en l'Éternel, et l'Éternel le lui imputa à justice.\n\nIsaac naquit — le fils de la promesse. Son nom signifie 'rire', car Sara avait ri quand Dieu avait annoncé sa naissance. Dieu transforme nos impossibilités en miracles.", ht: "Bondye te pwomèt Abraram yon pitit gason alòske Sara te gen 90 an e Abraram te gen 100 an. Nan je moun, sa te enposib. Men Abraram te kwè nan Senyè a, e Senyè a te konsidere sa kòm jistis.\n\nIzaak te fèt — pitit gason pwomès la. Non li vle di 'ri', paske Sara te ri lè Bondye te anonse nesans li.", en: "God promised Abraham a son when Sarah was 90 and Abraham was 100. Humanly, it was impossible. But Abraham believed the Lord, and he credited it to him as righteousness.\n\nIsaac was born — the son of promise.", es: "Dios prometió a Abraham un hijo cuando Sara tenía 90 años y Abraham 100. Humanamente, era imposible. Pero Abraham creyó al Señor, y le fue contado por justicia.\n\nNació Isaac — el hijo de la promesa. Su nombre significa 'risa', porque Sara se había reído cuando Dios anunció su nacimiento. Dios transforma nuestras imposibilidades en milagros." }, verse: "Genèse 15:6" },
    ],
    keyVerses: ["Genèse 12:1-3", "Genèse 15:6", "Hébreux 11:8"],
  },
  {
    slug: "moise-exode",
    parcours: "histoire-sainte",
    title: { fr: "Moïse et l'Exode", ht: "Moyiz ak Egzòd la", en: "Moses and the Exodus", es: "Moisés y el Éxodo" },
    description: { fr: "La libération du peuple de Dieu de l'esclavage", ht: "Liberasyon pèp Bondye a anba esklavaj", en: "The liberation of God's people from slavery", es: "La liberación del pueblo de Dios de la esclavitud" },
    icon: "https://cdn-icons-png.flaticon.com/512/3122/3122803.png",
    color: "from-red-500 to-rose-600",
    duration: "10 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "Le buisson ardent", ht: "Touf dife a", en: "The burning bush", es: "La zarza ardiente" }, content: { fr: "Moïse faisait paître le troupeau de son beau-père quand il vit un buisson en feu qui ne se consumait pas. Dieu l'appela du milieu du buisson : Moïse ! Moïse ! Ôte tes souliers de tes pieds, car le lieu sur lequel tu te tiens est une terre sainte.\n\nDieu dit : J'ai vu la souffrance de mon peuple en Égypte. Je t'envoie vers Pharaon pour faire sortir mon peuple. Moïse avait 80 ans — Dieu n'a pas de date limite pour nous utiliser.", ht: "Moyiz t ap fè mouton bopè l manje lè l te wè yon touf dife ki pa t ap boule nèt. Bondye te rele l nan mitan touf la : Moyiz ! Moyiz ! Retire soulye nan pye ou, paske kote ou kanpe a se yon tè ki sen.\n\nBondye di : Mwen wè soufrans pèp mwen an Lejip. M ap voye ou bò kote Farawon pou fè pèp mwen soti.", en: "Moses was tending his father-in-law's flock when he saw a bush on fire that was not consumed. God called to him from the bush: Moses! Moses! Take off your sandals, for you are standing on holy ground.\n\nGod said: I have seen the suffering of my people in Egypt. I am sending you to Pharaoh to bring my people out.", es: "Moisés apacentaba el rebaño de su suegro cuando vio una zarza que ardía en fuego pero no se consumía. Dios lo llamó de en medio de la zarza: ¡Moisés, Moisés! Quita tu calzado de tus pies, porque el lugar donde estás es tierra santa.\n\nDios dijo: He visto el sufrimiento de mi pueblo en Egipto. Te envío a Faraón para que saques a mi pueblo. Moisés tenía 80 años — Dios no tiene fecha límite para usarnos." }, verse: "Exode 3:1-10" },
      { title: { fr: "Les 10 plaies et la traversée", ht: "10 fleyo yo ak travèse a", en: "The 10 plagues and the crossing", es: "Las 10 plagas y el cruce del mar" }, content: { fr: "Pharaon refusa de libérer les Israélites. Dieu envoya 10 plaies sur l'Égypte : eau changée en sang, grenouilles, moustiques, mouches, peste, ulcères, grêle, sauterelles, ténèbres, et la mort des premiers-nés.\n\nAprès la 10ème plaie, Pharaon les laissa partir. Mais il changea d'avis et les poursuivit. Dieu ouvrit la mer Rouge — les Israélites passèrent à sec, et les eaux se refermèrent sur l'armée égyptienne. Dieu combat pour ceux qui lui font confiance.", ht: "Farawon te refize libere Izrayelit yo. Bondye te voye 10 fleyo sou Lejip : dlo chanje an san, krapo, moustik, mouch, maladi bèt, maleng, lagrèl, krikèt, fènwa, ak lanmò premye pitit yo.\n\nApre 10èm fleyo a, Farawon te kite yo ale. Men li te chanje lide e li te kouri dèyè yo. Bondye te ouvri Lanmè Wouj la — Izrayelit yo te pase sou tè sèk, e dlo a te fèmen sou lame ejipsyen an.", en: "Pharaoh refused to free the Israelites. God sent 10 plagues on Egypt. After the 10th plague, Pharaoh let them go. But he changed his mind and pursued them. God parted the Red Sea.", es: "Faraón se negó a liberar a los israelitas. Dios envió 10 plagas sobre Egipto: agua convertida en sangre, ranas, moscas, langostas, tinieblas y muerte de los primogénitos.\n\nTras la 10ª plaga, Faraón los dejó ir. Pero cambió de opinión y los persiguió. Dios abrió el Mar Rojo — los israelitas cruzaron en seco, y las aguas se cerraron sobre el ejército egipcio. Dios pelea por quienes confían en Él." }, verse: "Exode 14:21-22" },
    ],
    keyVerses: ["Exode 3:14", "Exode 14:21-22", "Exode 20:1-17"],
  },
  {
    slug: "10-commandements",
    parcours: "histoire-sainte",
    title: { fr: "Les 10 Commandements", ht: "10 Kòmandman yo", en: "The 10 Commandments", es: "Los 10 Mandamientos" },
    description: { fr: "La loi morale de Dieu pour l'humanité", ht: "Lwa moral Bondye pou limanite", en: "God's moral law for humanity", es: "La ley moral de Dios para la humanidad" },
    icon: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-stone-600 to-stone-800",
    duration: "8 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner", es: "Principiante" },
    youtubeId: "",
    sections: [
      { title: { fr: "Les commandements envers Dieu", ht: "Kòmandman anvè Bondye", en: "Commandments toward God", es: "Los mandamientos hacia Dios" }, content: { fr: "Les 4 premiers commandements concernent notre relation avec Dieu :\n\n1. Tu n'auras pas d'autres dieux devant ma face\n2. Tu ne te feras point d'image taillée\n3. Tu ne prendras point le nom de l'Éternel en vain\n4. Souviens-toi du jour du repos pour le sanctifier\n\nCes commandements nous enseignent que Dieu doit être premier dans notre vie. Pas l'argent, pas le travail, pas les relations — Dieu d'abord.", ht: "4 premye kòmandman yo konsène relasyon nou ak Bondye :\n\n1. Ou p ap gen lòt bondye devan fas mwen\n2. Ou p ap fè imaj taye\n3. Ou p ap pran non Senyè a an ven\n4. Sonje jou repo a pou sanktifye l", en: "The first 4 commandments concern our relationship with God:\n\n1. You shall have no other gods before me\n2. You shall not make idols\n3. You shall not take the name of the Lord in vain\n4. Remember the Sabbath day to keep it holy", es: "Los primeros 4 mandamientos conciernen nuestra relación con Dios:\n\n1. No tendrás dioses ajenos delante de mí\n2. No te harás imagen tallada\n3. No tomarás el nombre del Señor en vano\n4. Acuérdate del día de reposo para santificarlo\n\nEstos mandamientos nos enseñan que Dios debe ser primero en nuestra vida. No el dinero, no el trabajo, no las relaciones — Dios primero." }, verse: "Exode 20:1-11" },
      { title: { fr: "Les commandements envers les autres", ht: "Kòmandman anvè lòt moun", en: "Commandments toward others", es: "Los mandamientos hacia los demás" }, content: { fr: "Les 6 derniers commandements concernent nos relations avec les autres :\n\n5. Honore ton père et ta mère\n6. Tu ne tueras point\n7. Tu ne commettras point d'adultère\n8. Tu ne déroberas point\n9. Tu ne porteras pas de faux témoignage\n10. Tu ne convoiteras point\n\nJésus a résumé tous ces commandements en deux : Aime Dieu de tout ton cœur, et aime ton prochain comme toi-même. L'amour est l'accomplissement de la loi.", ht: "6 dènye kòmandman yo konsène relasyon nou ak lòt moun :\n\n5. Onore papa ou ak manman ou\n6. Ou pa dwe touye\n7. Ou pa dwe fè adiltè\n8. Ou pa dwe vòlè\n9. Ou pa dwe bay fo temwayaj\n10. Ou pa dwe anvye sa lòt moun genyen", en: "The last 6 commandments concern our relationships with others:\n\n5. Honor your father and mother\n6. You shall not murder\n7. You shall not commit adultery\n8. You shall not steal\n9. You shall not bear false witness\n10. You shall not covet", es: "Los últimos 6 mandamientos conciernen nuestras relaciones con los demás:\n\n5. Honra a tu padre y a tu madre\n6. No matarás\n7. No cometerás adulterio\n8. No robarás\n9. No hablarás contra tu prójimo falso testimonio\n10. No codiciarás\n\nJesús resumió todos estos mandamientos en dos: Ama a Dios con todo tu corazón, y ama a tu prójimo como a ti mismo. El amor es el cumplimiento de la ley." }, verse: "Exode 20:12-17" },
    ],
    keyVerses: ["Exode 20:1-17", "Matthieu 22:37-40", "Romains 13:10"],
  },
  {
    slug: "david",
    parcours: "histoire-sainte",
    title: { fr: "David — Un Homme selon le Cœur de Dieu", ht: "David — Yon Nonm dapre Kè Bondye", en: "David — A Man After God's Heart", es: "David — Un Hombre según el Corazón de Dios" },
    description: { fr: "Du berger au roi, une vie de foi et de repentance", ht: "Soti gadò rive wa, yon lavi lafwa ak repantans", en: "From shepherd to king, a life of faith and repentance", es: "Del pastor al rey, una vida de fe y arrepentimiento" },
    icon: "https://cdn-icons-png.flaticon.com/512/1216/1216575.png",
    color: "from-yellow-500 to-amber-600",
    duration: "9 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "David et Goliath", ht: "David ak Golyat", en: "David and Goliath", es: "David y Goliat" }, content: { fr: "David était un jeune berger quand il affronta Goliath, un géant philistin de près de 3 mètres. Toute l'armée d'Israël tremblait de peur, mais David dit : Tu marches contre moi avec l'épée et la lance, mais moi je viens contre toi au nom de l'Éternel.\n\nAvec une fronde et une pierre, David tua Goliath. Cette histoire nous enseigne que la taille du problème n'a pas d'importance — ce qui compte, c'est la taille de notre Dieu.", ht: "David te yon jèn gadò lè l te fè fas ak Golyat, yon jeyan Filisten ki te prèske 3 mèt wotè. Tout lame Izrayèl la t ap tranble ak laperèz, men David di : Ou vin kont mwen ak epe ak lans, men mwen vin kont ou nan non Senyè a.\n\nAk yon fistibal ak yon wòch, David te touye Golyat.", en: "David was a young shepherd when he faced Goliath, a Philistine giant nearly 3 meters tall. All of Israel's army trembled with fear, but David said: You come against me with sword and spear, but I come against you in the name of the Lord.\n\nWith a sling and a stone, David killed Goliath.", es: "David era un joven pastor cuando enfrentó a Goliat, un gigante filisteo de casi 3 metros. Todo el ejército de Israel temblaba de miedo, pero David dijo: Tú vienes a mí con espada y lanza, pero yo vengo a ti en el nombre del Señor.\n\nCon una honda y una piedra, David mató a Goliat. Esta historia nos enseña que el tamaño del problema no importa — lo que cuenta es el tamaño de nuestro Dios." }, verse: "1 Samuel 17:45-47" },
      { title: { fr: "La chute et la repentance", ht: "Chit la ak repantans", en: "The fall and repentance", es: "La caída y el arrepentimiento" }, content: { fr: "David commit un terrible péché : il prit Bathshéba, la femme d'Urie, et fit tuer Urie. Le prophète Nathan le confronta. David ne se justifia pas — il dit simplement : J'ai péché contre l'Éternel.\n\nIl écrivit le Psaume 51 : O Dieu, aie pitié de moi. Crée en moi un cœur pur. David nous montre que même après une chute terrible, la repentance sincère ouvre la porte du pardon de Dieu. Dieu ne rejette jamais un cœur brisé.", ht: "David te fè yon gwo peche : li te pran Batcheba, madanm Iri, epi li te fè touye Iri. Pwofèt Natan te konfwonte l. David pa t chèche jistifye tèt li — li te senpleman di : Mwen peche kont Senyè a.\n\nLi te ekri Sòm 51 : O Bondye, gen pitye pou mwen. Kreye yon kè pwòp nan mwen.", en: "David committed a terrible sin: he took Bathsheba, Uriah's wife, and had Uriah killed. The prophet Nathan confronted him. David didn't justify himself — he simply said: I have sinned against the Lord.\n\nHe wrote Psalm 51: Have mercy on me, O God. Create in me a clean heart.", es: "David cometió un terrible pecado: tomó a Betsabé, la esposa de Urías, y mandó matar a Urías. El profeta Natán lo confrontó. David no se justificó — simplemente dijo: Pequé contra el Señor.\n\nEscribió el Salmo 51: Ten piedad de mí, oh Dios. Crea en mí un corazón limpio. David nos muestra que incluso después de una terrible caída, el arrepentimiento sincero abre la puerta al perdón de Dios. Dios nunca rechaza un corazón quebrantado." }, verse: "Psaume 51:12" },
    ],
    keyVerses: ["1 Samuel 17:45", "Psaume 51:10-12", "Actes 13:22"],
  },
  {
    slug: "naissance-jesus",
    parcours: "nouveau-testament",
    title: { fr: "La Naissance de Jésus", ht: "Nesans Jezi", en: "The Birth of Jesus", es: "El Nacimiento de Jesús" },
    description: { fr: "L'incarnation — Dieu devenu homme pour nous sauver", ht: "Enkarnasyon an — Bondye ki vin moun pou sove nou", en: "The incarnation — God became man to save us", es: "La encarnación — Dios hecho hombre para salvarnos" },
    icon: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
    color: "from-sky-500 to-blue-600",
    duration: "7 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner", es: "Principiante" },
    youtubeId: "",
    sections: [
      { title: { fr: "L'annonce à Marie", ht: "Anons bay Mari", en: "The announcement to Mary", es: "El anuncio a María" }, content: { fr: "L'ange Gabriel fut envoyé par Dieu à une jeune vierge nommée Marie, fiancée à Joseph. L'ange dit : Je te salue, toi à qui une grâce a été faite. Tu enfanteras un fils, et tu lui donneras le nom de Jésus. Il sera grand et sera appelé Fils du Très-Haut.\n\nMarie répondit : Je suis la servante du Seigneur ; qu'il me soit fait selon ta parole. Une jeune fille humble accepta le plan de Dieu qui allait changer l'histoire de l'humanité.", ht: "Zanj Gabriyèl te voye pa Bondye bay yon jèn vyèj ki rele Mari, ki te fianse ak Jozèf. Zanj lan di : Mwen salye ou, ou menm ki gen gras. Ou pral fè yon pitit gason, e ou pral rele l Jezi. Li pral gran e yo pral rele l Pitit Bondye ki Anwo a.", en: "The angel Gabriel was sent by God to a young virgin named Mary, engaged to Joseph. The angel said: Greetings, you who are highly favored. You will conceive and give birth to a son, and you are to call him Jesus.", es: "El ángel Gabriel fue enviado por Dios a una joven virgen llamada María, desposada con José. El ángel dijo: ¡Salve, muy favorecida! Concebirás en tu vientre, y darás a luz un hijo, y llamarás su nombre Jesús. Será grande, y será llamado Hijo del Altísimo.\n\nMaría respondió: He aquí la sierva del Señor; hágase conmigo conforme a tu palabra. Una joven humilde aceptó el plan de Dios que cambiaría la historia de la humanidad." }, verse: "Luc 1:26-38" },
      { title: { fr: "La nuit à Bethléhem", ht: "Nuit nan Betleyèm", en: "The night in Bethlehem", es: "La noche en Belén" }, content: { fr: "Joseph et Marie durent voyager à Bethléhem pour le recensement. Il n'y avait pas de place dans l'hôtellerie, alors Jésus naquit dans une étable et fut couché dans une crèche.\n\nLe Roi des rois est né dans l'endroit le plus humble. Des bergers furent les premiers avertis — pas des rois ou des prêtres, mais des travailleurs ordinaires. Dieu choisit les humbles. Une étoile guida des mages venus d'Orient qui apportèrent de l'or, de l'encens et de la myrrhe.", ht: "Jozèf ak Mari te dwe vwayaje Betleyèm pou resansman an. Pa t gen plas nan otèl la, alò Jezi te fèt nan yon etabl e yo te kouche l nan yon krèch.\n\nWa wa yo te fèt nan kote ki pi enb la. Gadò mouton yo te premye moun ki te konnen — pa wa oswa prèt, men travayè òdinè.", en: "Joseph and Mary had to travel to Bethlehem for the census. There was no room in the inn, so Jesus was born in a stable and laid in a manger.\n\nThe King of kings was born in the humblest place.", es: "José y María tuvieron que viajar a Belén para el censo. No había lugar en el mesón, así que Jesús nació en un establo y fue acostado en un pesebre.\n\nEl Rey de reyes nació en el lugar más humilde. Los pastores fueron los primeros en saberlo — no reyes ni sacerdotes, sino trabajadores ordinarios. Dios elige a los humildes. Una estrella guió a unos magos de Oriente que trajeron oro, incienso y mirra." }, verse: "Luc 2:6-7" },
    ],
    keyVerses: ["Luc 1:35", "Luc 2:6-7", "Matthieu 2:1-2", "Jean 1:14"],
  },
  {
    slug: "miracles-jesus",
    parcours: "nouveau-testament",
    title: { fr: "Les Miracles de Jésus", ht: "Mirak Jezi yo", en: "The Miracles of Jesus", es: "Los Milagros de Jesús" },
    description: { fr: "Les œuvres surnaturelles qui prouvent sa divinité", ht: "Zèv sinatirèl ki pwouve divinite l", en: "Supernatural works proving his divinity", es: "Las obras sobrenaturales que prueban su divinidad" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-teal-500 to-cyan-600",
    duration: "8 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner", es: "Principiante" },
    youtubeId: "",
    sections: [
      { title: { fr: "Guérisons et délivrances", ht: "Gerizon ak delivrans", en: "Healings and deliverances", es: "Sanidades y liberaciones" }, content: { fr: "Jésus guérit des aveugles, des lépreux, des paralytiques, des sourds. Il chassa des démons et ressuscita des morts. Chaque miracle avait un but : montrer la compassion de Dieu et prouver que Jésus est le Fils de Dieu.\n\nLa femme atteinte d'une perte de sang depuis 12 ans toucha le bord de son vêtement et fut guérie instantanément. Jésus dit : Ma fille, ta foi t'a sauvée. La foi est la clé qui active la puissance de Dieu.", ht: "Jezi te geri avèg, lepre, paralize, soud. Li te chase demon e li te resisite moun mouri. Chak mirak te gen yon bi : montre konpasyon Bondye e pwouve Jezi se Pitit Bondye.", en: "Jesus healed the blind, lepers, paralytics, deaf. He cast out demons and raised the dead. Each miracle had a purpose: showing God's compassion and proving Jesus is the Son of God.", es: "Jesús sanó a ciegos, leprosos, paralíticos, sordos. Echó demonios y resucitó muertos. Cada milagro tenía un propósito: mostrar la compasión de Dios y probar que Jesús es el Hijo de Dios.\n\nLa mujer con flujo de sangre durante 12 años tocó el borde de su manto y fue sanada al instante. Jesús dijo: Hija, tu fe te ha salvado. La fe es la llave que activa el poder de Dios." }, verse: "Marc 5:34" },
      { title: { fr: "La multiplication et la tempête", ht: "Miltiplikasyon ak tanpèt la", en: "The multiplication and the storm", es: "La multiplicación y la tempestad" }, content: { fr: "Jésus nourrit 5,000 hommes (plus les femmes et enfants) avec 5 pains et 2 poissons. Il reste 12 paniers de restes. Dieu peut multiplier le peu que nous avons.\n\nSur la mer de Galilée, une tempête violente menaçait de faire couler le bateau. Les disciples paniquaient. Jésus se leva et dit : Silence, tais-toi ! Et le vent et la mer obéirent. Même les forces de la nature sont soumises à sa parole.", ht: "Jezi te nouri 5,000 gason (plis fanm ak timoun) ak 5 pen ak 2 pwason. Te gen 12 panye ki rete. Bondye ka miltipliye ti kras nou genyen.\n\nSou lanmè Galile, yon gwo tanpèt te menase koule bato a. Disip yo te panike. Jezi te leve e di : Silans, pe la ! E van an ak lanmè a te obeyí.", en: "Jesus fed 5,000 men with 5 loaves and 2 fish. On the Sea of Galilee, a violent storm threatened to sink the boat. Jesus stood up and said: Peace, be still! And the wind and sea obeyed.", es: "Jesús alimentó a 5,000 hombres (además de mujeres y niños) con 5 panes y 2 peces. Sobraron 12 cestas. Dios puede multiplicar lo poco que tenemos.\n\nEn el mar de Galilea, una violenta tempestad amenazaba con hundir la barca. Los discípulos entraron en pánico. Jesús se levantó y dijo: ¡Calla, enmudece! Y el viento y el mar obedecieron. Hasta las fuerzas de la naturaleza están sujetas a su palabra." }, verse: "Marc 4:39" },
    ],
    keyVerses: ["Marc 5:34", "Marc 4:39", "Jean 11:25-26", "Matthieu 14:21"],
  },
  {
    slug: "croix-resurrection",
    parcours: "nouveau-testament",
    title: { fr: "La Croix et la Résurrection", ht: "Kwa a ak Rezireksyon an", en: "The Cross and Resurrection", es: "La Cruz y la Resurrección" },
    description: { fr: "Le cœur de l'Évangile — la mort et la victoire de Jésus", ht: "Kè Levanjil la — lanmò ak viktwa Jezi", en: "The heart of the Gospel — Jesus' death and victory", es: "El corazón del Evangelio — la muerte y la victoria de Jesús" },
    icon: "https://cdn-icons-png.flaticon.com/512/1216/1216575.png",
    color: "from-rose-600 to-red-700",
    duration: "10 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "La crucifixion", ht: "Krisifiksyon an", en: "The crucifixion", es: "La crucifixión" }, content: { fr: "Jésus fut trahi par Judas, arrêté, jugé injustement, flagellé et crucifié. Sur la croix, il dit : Père, pardonne-leur, car ils ne savent ce qu'ils font. Même dans sa souffrance la plus extrême, Jésus pardonnait.\n\nÀ la 9ème heure, il cria : Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ? Puis il dit : Tout est accompli. Et il rendit l'esprit. Le voile du temple se déchira de haut en bas — l'accès à Dieu était ouvert pour tous.", ht: "Jezi te trayi pa Jida, arete, jije enjistman, bat ak kout fwèt e krisifye. Sou kwa a, li di : Papa, padonnen yo, paske yo pa konnen sa y ap fè.\n\nNan 9èm lè a, li rele : Bondye mwen, Bondye mwen, poukisa ou abandone m ? Apre li di : Tout bagay fini. E li te bay lespri l.", en: "Jesus was betrayed by Judas, arrested, unjustly tried, scourged and crucified. On the cross, he said: Father, forgive them, for they know not what they do.\n\nAt the 9th hour, he cried: My God, my God, why have you forsaken me? Then he said: It is finished.", es: "Jesús fue traicionado por Judas, arrestado, juzgado injustamente, azotado y crucificado. En la cruz dijo: Padre, perdónalos, porque no saben lo que hacen. Incluso en su sufrimiento más extremo, Jesús perdonaba.\n\nA la novena hora clamó: Dios mío, Dios mío, ¿por qué me has desamparado? Luego dijo: Consumado es. Y entregó el espíritu. El velo del templo se rasgó de arriba abajo — el acceso a Dios estaba abierto para todos." }, verse: "Jean 19:30" },
      { title: { fr: "Il est ressuscité !", ht: "Li resisite !", en: "He is risen!", es: "¡Él ha resucitado!" }, content: { fr: "Le 3ème jour, des femmes allèrent au tombeau et le trouvèrent vide. Un ange dit : Il n'est point ici, il est ressuscité ! La résurrection est le fondement de notre foi. Si Christ n'est pas ressuscité, notre foi est vaine (1 Corinthiens 15:17).\n\nJésus apparut à ses disciples pendant 40 jours. Il mangea avec eux, leur parla, et leur donna la Grande Commission : Allez, faites de toutes les nations des disciples. Puis il monta au ciel avec la promesse de revenir.", ht: "3èm jou a, kèk fanm te ale nan tonbo a e yo te jwenn li vid. Yon zanj di : Li pa la, li resisite ! Rezireksyon an se fondasyon lafwa nou. Si Kris pa resisite, lafwa nou initil (1 Korentyen 15:17).\n\nJezi te parèt bay disip li yo pandan 40 jou.", en: "On the 3rd day, women went to the tomb and found it empty. An angel said: He is not here, he is risen! The resurrection is the foundation of our faith.\n\nJesus appeared to his disciples for 40 days, then ascended to heaven with the promise to return.", es: "Al tercer día, unas mujeres fueron al sepulcro y lo encontraron vacío. Un ángel dijo: No está aquí, ha resucitado. La resurrección es el fundamento de nuestra fe. Si Cristo no resucitó, nuestra fe es vana (1 Corintios 15:17).\n\nJesús se apareció a sus discípulos durante 40 días, comió con ellos, les habló y les dio la Gran Comisión: Id y haced discípulos de todas las naciones. Luego ascendió al cielo con la promesa de volver." }, verse: "Matthieu 28:6" },
    ],
    keyVerses: ["Jean 19:30", "Matthieu 28:6", "1 Corinthiens 15:17", "Romains 6:9"],
  },
  {
    slug: "saint-esprit-pentecote",
    parcours: "nouveau-testament",
    title: { fr: "Le Saint-Esprit et la Pentecôte", ht: "Sentespri a ak Lapannkòt", en: "The Holy Spirit and Pentecost", es: "El Espíritu Santo y Pentecostés" },
    description: { fr: "La puissance de Dieu pour l'Église aujourd'hui", ht: "Pisans Bondye pou Legliz jodi a", en: "God's power for the Church today", es: "El poder de Dios para la Iglesia hoy" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-orange-500 to-red-500",
    duration: "8 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "La promesse du Père", ht: "Pwomès Papa a", en: "The Father's promise", es: "La promesa del Padre" }, content: { fr: "Avant de monter au ciel, Jésus dit à ses disciples : Vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins jusqu'aux extrémités de la terre.\n\nLes 120 disciples attendirent dans la chambre haute pendant 10 jours, priant d'un commun accord. Le jour de la Pentecôte, un bruit comme un vent violent remplit la maison. Des langues de feu apparurent et se posèrent sur chacun d'eux. Ils furent tous remplis du Saint-Esprit.", ht: "Anvan li te monte nan syèl, Jezi te di disip li yo : Nou pral resevwa yon pisans, Sentespri a ap vin sou nou, e nou pral temwen m jiska bout tè a.\n\n120 disip yo te tann nan chanm anwo a pandan 10 jou, yo t ap priye ansanm. Jou Lapannkòt la, yon bri tankou yon gwo van te ranpli kay la.", en: "Before ascending to heaven, Jesus told his disciples: You will receive power when the Holy Spirit comes on you, and you will be my witnesses to the ends of the earth.\n\nThe 120 disciples waited in the upper room for 10 days. On the day of Pentecost, a sound like a mighty wind filled the house.", es: "Antes de ascender al cielo, Jesús dijo a sus discípulos: Recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo, y me seréis testigos hasta lo último de la tierra.\n\nLos 120 discípulos esperaron en el aposento alto durante 10 días orando unánimemente. El día de Pentecostés, un estruendo como de un viento recio llenó la casa. Se les aparecieron lenguas de fuego y se posaron sobre cada uno. Todos fueron llenos del Espíritu Santo." }, verse: "Actes 1:8" },
      { title: { fr: "Les dons de l'Esprit", ht: "Don Lespri a", en: "Gifts of the Spirit", es: "Los dones del Espíritu" }, content: { fr: "Le Saint-Esprit accorde des dons spirituels aux croyants pour édifier l'Église : parole de sagesse, parole de connaissance, foi, guérison, miracles, prophétie, discernement des esprits, diversité des langues, interprétation.\n\nChaque croyant a au moins un don. Ces dons ne sont pas pour notre gloire personnelle, mais pour servir les autres et glorifier Dieu. Le plus grand de tous les dons reste l'amour (1 Corinthiens 13).", ht: "Sentespri a bay kwayan yo don espirityèl pou edifye Legliz la : pawòl sajès, pawòl konesans, lafwa, gerizon, mirak, pwofesi, disèneman lespri, divèsite lang, entèpretasyon.\n\nChak kwayan gen omwen yon don. Don sa yo pa pou glwa pèsonèl nou, men pou sèvi lòt moun e glorifye Bondye.", en: "The Holy Spirit gives spiritual gifts to believers to build up the Church: wisdom, knowledge, faith, healing, miracles, prophecy, discernment, tongues, interpretation.\n\nEvery believer has at least one gift. These gifts are not for personal glory, but to serve others and glorify God.", es: "El Espíritu Santo concede dones espirituales a los creyentes para edificar la Iglesia: palabra de sabiduría, palabra de ciencia, fe, sanidades, milagros, profecía, discernimiento, diversidad de lenguas, interpretación.\n\nCada creyente tiene al menos un don. Estos dones no son para gloria personal, sino para servir a los demás y glorificar a Dios. El mayor de todos los dones sigue siendo el amor (1 Corintios 13)." }, verse: "1 Corinthiens 12:7-11" },
    ],
    keyVerses: ["Actes 1:8", "Actes 2:1-4", "1 Corinthiens 12:7-11", "Galates 5:22-23"],
  },
  {
    slug: "lettres-paul",
    parcours: "nouveau-testament",
    title: { fr: "Les Lettres de Paul", ht: "Lèt Pòl yo", en: "Paul's Letters", es: "Las Cartas de Pablo" },
    description: { fr: "Les fondements doctrinaux de la foi chrétienne", ht: "Fondasyon doktrin lafwa kretyen an", en: "The doctrinal foundations of Christian faith", es: "Los fundamentos doctrinales de la fe cristiana" },
    icon: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-indigo-500 to-blue-600",
    duration: "9 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "Qui était Paul ?", ht: "Ki moun Pòl te ye ?", en: "Who was Paul?", es: "¿Quién era Pablo?" }, content: { fr: "Saul de Tarse était un pharisien zélé qui persécutait les chrétiens. Sur le chemin de Damas, Jésus lui apparut dans une lumière éblouissante : Saul, Saul, pourquoi me persécutes-tu ? Ce persécuteur devint le plus grand apôtre de l'histoire.\n\nPaul écrivit 13 des 27 livres du Nouveau Testament. Il fonda des églises dans tout le monde romain, souffrit la prison, les naufrages, les coups — tout pour l'Évangile. Sa conversion prouve que personne n'est trop loin pour Dieu.", ht: "Sol de Tars te yon farizyen zele ki t ap pèsekite kretyen yo. Sou chemen Damas, Jezi te parèt ba li nan yon limyè eblwiyan : Sol, Sol, poukisa w ap pèsekite m ? Pèsekitè sa a te vin pi gwo apot nan istwa a.\n\nPòl te ekri 13 nan 27 liv Nouvo Testaman an.", en: "Saul of Tarsus was a zealous Pharisee who persecuted Christians. On the road to Damascus, Jesus appeared to him in a blinding light: Saul, Saul, why do you persecute me? This persecutor became the greatest apostle in history.\n\nPaul wrote 13 of the 27 books of the New Testament.", es: "Saulo de Tarso era un fariseo celoso que perseguía a los cristianos. En el camino a Damasco, Jesús se le apareció en una luz cegadora: Saulo, Saulo, ¿por qué me persigues? Este perseguidor se convirtió en el mayor apóstol de la historia.\n\nPablo escribió 13 de los 27 libros del Nuevo Testamento. Fundó iglesias en todo el mundo romano, sufrió la cárcel, naufragios, azotes — todo por el Evangelio. Su conversión prueba que nadie está demasiado lejos para Dios." }, verse: "Actes 9:3-6" },
      { title: { fr: "L'Épître aux Romains — Le salut", ht: "Lèt bay Women yo — Delivrans", en: "Romans — Salvation", es: "La Epístola a los Romanos — La salvación" }, content: { fr: "L'Épître aux Romains est considérée comme le document le plus important du christianisme après les Évangiles. Paul y explique :\n\nTous ont péché et sont privés de la gloire de Dieu (3:23). Le salaire du péché, c'est la mort ; mais le don gratuit de Dieu, c'est la vie éternelle en Jésus-Christ (6:23). Il n'y a maintenant aucune condamnation pour ceux qui sont en Jésus-Christ (8:1).\n\nC'est le résumé complet de l'Évangile en un livre.", ht: "Lèt bay Women yo konsidere kòm dokiman ki pi enpòtan nan krisyanis apre Evanjil yo. Pòl eksplike :\n\nTout moun peche e yo pa gen glwa Bondye (3:23). Salè peche a se lanmò ; men kado gratis Bondye a se lavi etènèl nan Jezi Kris (6:23).", en: "The Epistle to the Romans is considered the most important document of Christianity after the Gospels. Paul explains:\n\nAll have sinned and fall short of the glory of God (3:23). The wages of sin is death, but the gift of God is eternal life in Christ Jesus (6:23).", es: "La Epístola a los Romanos es considerada el documento más importante del cristianismo después de los Evangelios. Pablo explica:\n\nTodos pecaron y están destituidos de la gloria de Dios (3:23). La paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús (6:23). Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús (8:1).\n\nEs el resumen completo del Evangelio en un solo libro." }, verse: "Romains 8:1" },
    ],
    keyVerses: ["Actes 9:3-6", "Romains 3:23", "Romains 6:23", "Romains 8:1", "Romains 8:28"],
  },
  {
    slug: "eglise-primitive",
    parcours: "nouveau-testament",
    title: { fr: "L'Église Primitive", ht: "Legliz Primitif la", en: "The Early Church", es: "La Iglesia Primitiva" },
    description: { fr: "Comment les premiers chrétiens vivaient et servaient Dieu", ht: "Kijan premye kretyen yo te viv e sèvi Bondye", en: "How the first Christians lived and served God", es: "Cómo vivían y servían a Dios los primeros cristianos" },
    icon: "https://cdn-icons-png.flaticon.com/512/1533/1533908.png",
    color: "from-lime-500 to-green-600",
    duration: "7 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "La vie communautaire", ht: "Lavi kominotè", en: "Community life", es: "La vida comunitaria" }, content: { fr: "Les premiers chrétiens persévéraient dans l'enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain et dans les prières. Tous ceux qui croyaient étaient ensemble et avaient tout en commun.\n\nIls vendaient leurs propriétés pour aider ceux qui étaient dans le besoin. Ils se réunissaient chaque jour dans le temple et rompaient le pain dans les maisons. Le Seigneur ajoutait chaque jour à l'Église ceux qui étaient sauvés. C'est le modèle de l'Église que Dieu désire.", ht: "Premye kretyen yo te pèsevere nan ansèyman apot yo, nan kominyon fratènèl, nan kase pen an ak nan lapriyè. Tout moun ki te kwè te ansanm e te gen tout bagay an komen.\n\nYo te vann pwopriyete yo pou ede moun ki nan bezwen.", en: "The first Christians devoted themselves to the apostles' teaching, fellowship, breaking of bread and prayer. All the believers were together and had everything in common.\n\nThey sold their possessions to help those in need.", es: "Los primeros cristianos perseveraban en la doctrina de los apóstoles, en la comunión fraterna, en el partimiento del pan y en las oraciones. Todos los que habían creído estaban juntos y tenían en común todas las cosas.\n\nVendían sus propiedades para ayudar a los necesitados. Se reunían cada día en el templo y partían el pan en las casas. El Señor añadía cada día a la iglesia los que habían de ser salvos. Este es el modelo de iglesia que Dios desea." }, verse: "Actes 2:42-47" },
    ],
    keyVerses: ["Actes 2:42-47", "Actes 4:32-35"],
  },

  // ══════════════════ PARCOURS : FORMATION DE DISCIPLES ══════════════════
  {
    slug: "grande-mission",
    parcours: "formation-disciples",
    title: { fr: "La Grande Mission", ht: "Gran Misyon an", en: "The Great Commission", es: "La Gran Comisión" },
    description: { fr: "L'ordre final de Jésus : faire des disciples de toutes les nations", ht: "Dènye lòd Jezi a : fè disip nan tout nasyon", en: "Jesus' final command: make disciples of all nations", es: "El mandato final de Jesús: hacer discípulos de todas las naciones" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-cyan-500 to-blue-600",
    duration: "7 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "Allez, faites de toutes les nations des disciples", ht: "Ale, fè tout nasyon vin disip", en: "Go and make disciples of all nations", es: "Id y haced discípulos a todas las naciones" }, content: {
        fr: "Avant de monter au ciel, Jésus donna à ses disciples leur mission ultime : « Tout pouvoir m'a été donné dans le ciel et sur la terre. Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit, et enseignez-leur à observer tout ce que je vous ai prescrit. »\n\nRemarquez que Jésus ne dit pas simplement « faites des convertis », mais « faites des disciples ». Un disciple n'est pas seulement quelqu'un qui croit — c'est quelqu'un qui suit, qui apprend et qui obéit. La mission de l'Église n'est pas de remplir des bancs, mais de former des disciples qui, à leur tour, en formeront d'autres.",
        ht: "Anvan li monte nan syèl la, Jezi te bay disip li yo dènye misyon yo : « Yo ban mwen tout pouvwa nan syèl la ak sou tè a. Ale, fè tout nasyon vin disip, batize yo nan non Papa a, Pitit la ak Sentespri a, epi montre yo pou yo obeyi tout sa mwen te kòmande nou. »\n\nRemake byen : Jezi pa di senpleman « fè moun konvèti », men « fè disip ». Yon disip se pa sèlman yon moun ki kwè — se yon moun ki swiv, ki aprann e ki obeyi. Misyon Legliz la se pa ranpli ban, men fòme disip.",
        en: "Before ascending to heaven, Jesus gave his disciples their ultimate mission: \"All authority in heaven and on earth has been given to me. Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you.\"\n\nNotice that Jesus does not simply say \"make converts,\" but \"make disciples.\" A disciple is not merely someone who believes — it is someone who follows, learns and obeys. The mission of the Church is not to fill pews, but to form disciples who will in turn form others.",
        es: "Antes de ascender al cielo, Jesús dio a sus discípulos su misión suprema: «Toda potestad me es dada en el cielo y en la tierra. Por tanto, id y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo, y enseñándoles a guardar todo lo que os he mandado.»\n\nObserva que Jesús no dice simplemente «haced conversos», sino «haced discípulos». Un discípulo no es solo alguien que cree — es alguien que sigue, que aprende y que obedece. La misión de la Iglesia no es llenar bancos, sino formar discípulos que, a su vez, formarán a otros." }, verse: "Matthieu 28:18-20" },
      { title: { fr: "Vous serez mes témoins", ht: "N ap temwen mwen", en: "You will be my witnesses", es: "Me seréis testigos" }, content: {
        fr: "Jésus promit que cette mission ne reposerait pas sur nos seules forces : « Vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins à Jérusalem, dans toute la Judée, dans la Samarie et jusqu'aux extrémités de la terre. »\n\nLe témoignage commence là où nous sommes (Jérusalem), puis s'étend progressivement au monde entier. Tu n'as pas besoin d'aller loin pour commencer : ta famille, ton quartier, ton lieu de travail sont ta première Jérusalem. Et ce n'est pas par ta capacité, mais par la puissance de l'Esprit que des vies sont transformées.",
        ht: "Jezi te pwomèt ke misyon sa a p ap chita sou fòs pa nou sèlman : « N ap resevwa yon pouvwa, lè Sentespri a va desann sou nou, epi n ap temwen mwen nan Jerizalèm, nan tout Jide, nan Samari e jouk nan dènye bout latè. »\n\nTemwayaj la kòmanse kote nou ye a (Jerizalèm), epi li gaye piti piti nan tout mond lan. Ou pa bezwen ale lwen pou kòmanse : fanmi ou, katye ou, travay ou se premye Jerizalèm ou. Se pa ak kapasite ou, men ak pouvwa Lespri a lavi moun chanje.",
        en: "Jesus promised that this mission would not rest on our strength alone: \"You will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.\"\n\nWitness begins where we are (Jerusalem), then gradually extends to the whole world. You don't need to go far to begin: your family, your neighborhood, your workplace are your first Jerusalem. And it is not by your ability, but by the power of the Spirit, that lives are transformed.",
        es: "Jesús prometió que esta misión no descansaría solo en nuestras fuerzas: «Recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo, y me seréis testigos en Jerusalén, en toda Judea, en Samaria, y hasta lo último de la tierra.»\n\nEl testimonio comienza donde estamos (Jerusalén), y luego se extiende gradualmente al mundo entero. No necesitas ir lejos para empezar: tu familia, tu vecindario, tu lugar de trabajo son tu primera Jerusalén. Y no es por tu capacidad, sino por el poder del Espíritu, que las vidas son transformadas." }, verse: "Actes 1:8" },
    ],
    keyVerses: ["Matthieu 28:18-20", "Actes 1:8", "Marc 16:15"],
  },
  {
    slug: "cout-disciple",
    parcours: "formation-disciples",
    title: { fr: "Le Coût du Disciple", ht: "Pri Disip la", en: "The Cost of Discipleship", es: "El Precio del Discipulado" },
    description: { fr: "Suivre Jésus exige tout — mais en vaut infiniment la peine", ht: "Swiv Jezi mande tout — men li vo lapèn nèt", en: "Following Jesus demands everything — but is infinitely worth it", es: "Seguir a Jesús exige todo — pero vale infinitamente la pena" },
    icon: "https://cdn-icons-png.flaticon.com/512/1216/1216575.png",
    color: "from-cyan-500 to-blue-600",
    duration: "6 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "Se renier soi-même et prendre sa croix", ht: "Renye tèt ou e pran kwa ou", en: "Deny yourself and take up your cross", es: "Negarse a sí mismo y tomar la cruz" }, content: {
        fr: "Jésus n'a jamais caché le prix de le suivre : « Si quelqu'un veut venir après moi, qu'il renonce à lui-même, qu'il se charge de sa croix et qu'il me suive. » Suivre Jésus, ce n'est pas ajouter un peu de religion à notre vie — c'est un changement complet de maître.\n\nPrendre sa croix signifiait, pour ceux qui l'écoutaient, marcher vers la mort. Jésus demande la mort de notre égoïsme, de notre volonté propre, de notre orgueil. Mais il ajoute une promesse : « Celui qui perdra sa vie à cause de moi la trouvera. » On ne perd jamais en donnant sa vie à Christ ; on la retrouve enfin telle qu'elle devait être.",
        ht: "Jezi pa t janm kache pri pou swiv li : « Si yon moun vle vin dèyè m, se pou li bliye tèt li, pran kwa li epi swiv mwen. » Swiv Jezi, se pa ajoute yon ti relijyon nan lavi nou — se yon chanjman konplè de mèt.\n\nPran kwa ou te vle di, pou moun ki t ap koute l yo, mache nan direksyon lanmò. Jezi mande lanmò egoyis nou, volonte pwòp nou, ògèy nou. Men li ajoute yon pwomès : « Moun ki pèdi lavi l poutèt mwen, l ap jwenn li. » Nou pa janm pèdi lè nou bay Kris lavi nou.",
        en: "Jesus never hid the cost of following him: \"Whoever wants to be my disciple must deny themselves and take up their cross and follow me.\" Following Jesus is not adding a bit of religion to our life — it is a complete change of master.\n\nTaking up one's cross meant, to those listening, walking toward death. Jesus asks for the death of our selfishness, our self-will, our pride. But he adds a promise: \"Whoever loses their life for me will find it.\" You never lose by giving your life to Christ; you finally find it as it was meant to be.",
        es: "Jesús nunca ocultó el precio de seguirle: «Si alguno quiere venir en pos de mí, niéguese a sí mismo, tome su cruz, y sígame.» Seguir a Jesús no es añadir un poco de religión a nuestra vida — es un cambio completo de amo.\n\nTomar la cruz significaba, para quienes le escuchaban, caminar hacia la muerte. Jesús pide la muerte de nuestro egoísmo, de nuestra propia voluntad, de nuestro orgullo. Pero añade una promesa: «El que pierda su vida por causa de mí, la hallará.» Nunca se pierde al entregar la vida a Cristo; por fin se la encuentra tal como debía ser." }, verse: "Matthieu 16:24-25" },
      { title: { fr: "Compter la dépense", ht: "Kalkile depans la", en: "Counting the cost", es: "Calcular el costo" }, content: {
        fr: "Jésus raconta la parabole d'un homme qui veut bâtir une tour : ne s'assied-il pas d'abord pour calculer la dépense, afin de voir s'il a de quoi la terminer ? Le Seigneur veut des disciples qui savent ce à quoi ils s'engagent.\n\nLa foi chrétienne n'est pas une décision émotionnelle passagère, mais un engagement réfléchi et durable. Compter la dépense, ce n'est pas se décourager — c'est comprendre que ce que Christ nous demande (tout) est infiniment plus petit que ce qu'il nous donne (lui-même, la vie éternelle, et une joie que rien ne peut ôter).",
        ht: "Jezi te rakonte parabòl yon nonm ki vle bati yon gwo kay : èske li pa chita anvan pou l kalkile depans la, pou l wè si li gen ase pou l fini l ? Senyè a vle disip ki konnen sa y ap angaje tèt yo ladan.\n\nLafwa kretyen an se pa yon desizyon emosyonèl k ap pase, men yon angajman ki reflechi e ki dire. Kalkile depans la, se pa dekouraje — se konprann ke sa Kris mande nou (tout bagay) pi piti anpil pase sa li ban nou (tèt li, lavi etènèl, ak yon lajwa anyen pa ka retire).",
        en: "Jesus told the parable of a man who wants to build a tower: does he not first sit down and estimate the cost to see if he has enough to complete it? The Lord wants disciples who know what they are committing to.\n\nChristian faith is not a passing emotional decision, but a thoughtful and lasting commitment. Counting the cost is not about being discouraged — it is understanding that what Christ asks of us (everything) is infinitely smaller than what he gives us (himself, eternal life, and a joy that nothing can take away).",
        es: "Jesús contó la parábola de un hombre que quiere edificar una torre: ¿no se sienta primero a calcular los gastos, para ver si tiene lo necesario para acabarla? El Señor quiere discípulos que sepan a qué se comprometen.\n\nLa fe cristiana no es una decisión emocional pasajera, sino un compromiso reflexivo y duradero. Calcular el costo no es desanimarse — es comprender que lo que Cristo nos pide (todo) es infinitamente menor que lo que nos da (a sí mismo, la vida eterna, y un gozo que nada puede quitar)." }, verse: "Luc 14:28" },
    ],
    keyVerses: ["Matthieu 16:24-25", "Luc 14:27-33", "Luc 9:23"],
  },
  {
    slug: "faire-disciples",
    parcours: "formation-disciples",
    title: { fr: "Faire des Disciples", ht: "Fè Disip", en: "Making Disciples", es: "Hacer Discípulos" },
    description: { fr: "Le modèle de Jésus pour multiplier des vies transformées", ht: "Modèl Jezi pou miltipliye lavi ki transfòme", en: "Jesus' model for multiplying transformed lives", es: "El modelo de Jesús para multiplicar vidas transformadas" },
    icon: "https://cdn-icons-png.flaticon.com/512/3122/3122803.png",
    color: "from-cyan-500 to-blue-600",
    duration: "7 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "Jésus a formé douze hommes", ht: "Jezi te fòme douz gason", en: "Jesus trained twelve men", es: "Jesús formó a doce hombres" }, content: {
        fr: "Jésus aurait pu prêcher aux foules jusqu'à la fin de sa vie. Pourtant, il a choisi d'investir la majeure partie de son temps dans douze hommes ordinaires. Il les appela d'abord à être « avec lui », puis il les envoya. La formation précède l'envoi.\n\nLa méthode de Jésus n'était pas des programmes, mais des relations. Il vivait avec ses disciples, il leur montrait comment prier, comment servir, comment aimer. Faire des disciples, c'est partager sa vie — pas seulement transmettre des informations. « Ce que tu as entendu de moi, confie-le à des hommes fidèles, qui soient capables de l'enseigner aussi à d'autres. » Voici la multiplication spirituelle.",
        ht: "Jezi te ka preche foul moun yo jouk nan fen lavi l. Men, li te chwazi mete pi fò tan l nan douz gason òdinè. Li te rele yo dabò pou yo « avèk li », epi li te voye yo. Fòmasyon vin anvan voye a.\n\nMetòd Jezi a se pa t pwogram, men relasyon. Li te viv ak disip li yo, li te montre yo kijan pou priye, sèvi, renmen. Fè disip, se pataje lavi ou — se pa sèlman bay enfòmasyon. « Sa ou tande nan men mwen, konfye l bay moun fidèl ki kapab montre l bay lòt moun tou. »",
        en: "Jesus could have preached to the crowds until the end of his life. Yet he chose to invest most of his time in twelve ordinary men. He first called them to be \"with him,\" then he sent them out. Training precedes sending.\n\nJesus' method was not programs, but relationships. He lived with his disciples, showing them how to pray, how to serve, how to love. Making disciples means sharing your life — not merely transmitting information. \"What you have heard from me entrust to faithful men who will be able to teach others also.\" This is spiritual multiplication.",
        es: "Jesús pudo haber predicado a las multitudes hasta el fin de su vida. Sin embargo, escogió invertir la mayor parte de su tiempo en doce hombres ordinarios. Primero los llamó a estar «con él», luego los envió. La formación precede al envío.\n\nEl método de Jesús no eran programas, sino relaciones. Vivía con sus discípulos, mostrándoles cómo orar, cómo servir, cómo amar. Hacer discípulos es compartir tu vida — no solo transmitir información. «Lo que has oído de mí, encárgalo a hombres fieles que sean idóneos para enseñar también a otros.» Esta es la multiplicación espiritual." }, verse: "2 Timothée 2:2" },
      { title: { fr: "Chaque croyant est appelé", ht: "Chak kwayan gen apèl la", en: "Every believer is called", es: "Cada creyente es llamado" }, content: {
        fr: "Faire des disciples n'est pas réservé aux pasteurs ou aux missionnaires. C'est l'appel de chaque croyant. Tu n'as pas besoin d'un diplôme de théologie — tu as besoin d'une vie transformée et d'un cœur qui aime.\n\nCommence simplement : accompagne un nouveau croyant, prie avec lui, lis la Bible ensemble, réponds à ses questions, sois un exemple. Un disciple qui fait un disciple, qui fait un disciple — c'est ainsi que l'Évangile a conquis le monde en une génération, sans internet ni radio. La chaîne ne s'arrête que si tu ne transmets pas ce que tu as reçu.",
        ht: "Fè disip se pa sèlman pou pastè oswa misyonè. Se apèl chak kwayan. Ou pa bezwen yon diplòm teyoloji — ou bezwen yon lavi ki transfòme ak yon kè ki renmen.\n\nKòmanse tou senp : akonpaye yon nouvo kwayan, priye avè l, li Bib la ansanm, reponn kesyon l, se yon egzanp. Yon disip ki fè yon disip, ki fè yon disip — se konsa Levanjil te konkeri mond lan nan yon sèl jenerasyon, san entènèt ni radyo. Chèn nan sèlman kanpe si ou pa transmèt sa ou resevwa.",
        en: "Making disciples is not reserved for pastors or missionaries. It is the calling of every believer. You don't need a theology degree — you need a transformed life and a loving heart.\n\nStart simply: walk alongside a new believer, pray with them, read the Bible together, answer their questions, be an example. A disciple who makes a disciple, who makes a disciple — this is how the Gospel conquered the world in one generation, without internet or radio. The chain only stops if you fail to pass on what you have received.",
        es: "Hacer discípulos no está reservado a los pastores o misioneros. Es el llamado de cada creyente. No necesitas un título en teología — necesitas una vida transformada y un corazón que ama.\n\nEmpieza de forma sencilla: acompaña a un nuevo creyente, ora con él, lean juntos la Biblia, responde sus preguntas, sé un ejemplo. Un discípulo que hace un discípulo, que hace un discípulo — así conquistó el Evangelio el mundo en una sola generación, sin internet ni radio. La cadena solo se detiene si no transmites lo que has recibido." }, verse: "2 Timothée 2:2" },
    ],
    keyVerses: ["2 Timothée 2:2", "Marc 3:14", "Jean 13:34-35"],
  },
  {
    slug: "communion-fraternelle",
    parcours: "formation-disciples",
    title: { fr: "La Communion Fraternelle", ht: "Kominyon Fratènèl la", en: "Christian Fellowship", es: "La Comunión Fraternal" },
    description: { fr: "Personne ne grandit seul : l'importance de la communauté", ht: "Pèsonn pa grandi pou kont li : enpòtans kominote a", en: "No one grows alone: the importance of community", es: "Nadie crece solo: la importancia de la comunidad" },
    icon: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-cyan-500 to-blue-600",
    duration: "6 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "Ne pas abandonner l'assemblée", ht: "Pa abandone reyinyon an", en: "Not giving up meeting together", es: "No dejar de congregarnos" }, content: {
        fr: "La Bible nous exhorte : « N'abandonnons pas notre assemblée, comme c'est la coutume de quelques-uns ; mais exhortons-nous réciproquement. » Le christianisme ne se vit pas en solitaire. Un charbon retiré du feu s'éteint vite ; de même, un croyant isolé se refroidit.\n\nDieu nous a créés pour la communauté. Dans l'Église, nous nous encourageons, nous portons les fardeaux les uns des autres, nous nous rappelons mutuellement les promesses de Dieu quand nous sommes faibles. Tu as besoin des autres, et d'autres ont besoin de toi.",
        ht: "Bib la egzòte nou : « Pa abandone reyinyon nou an, jan kèk moun gen abitid fè ; men ann ankouraje youn lòt. » Krisyanis pa viv pou kont li. Yon chabon ou retire nan dife etenn vit ; menm jan an, yon kwayan ki poukont li vin frèt.\n\nBondye te kreye nou pou kominote. Nan Legliz la, nou ankouraje youn lòt, nou pote chay youn lòt, nou raple youn lòt pwomès Bondye yo lè nou fèb. Ou bezwen lòt moun, e lòt moun bezwen ou.",
        en: "The Bible exhorts us: \"Let us not give up meeting together, as some are in the habit of doing, but encouraging one another.\" Christianity is not lived in isolation. A coal removed from the fire quickly goes cold; likewise, an isolated believer grows lukewarm.\n\nGod created us for community. In the Church, we encourage one another, we carry each other's burdens, we remind one another of God's promises when we are weak. You need others, and others need you.",
        es: "La Biblia nos exhorta: «No dejando de congregarnos, como algunos tienen por costumbre, sino exhortándonos.» El cristianismo no se vive en soledad. Un carbón retirado del fuego se apaga pronto; del mismo modo, un creyente aislado se enfría.\n\nDios nos creó para la comunidad. En la Iglesia nos animamos unos a otros, llevamos las cargas los unos de los otros, nos recordamos mutuamente las promesas de Dios cuando estamos débiles. Tú necesitas a otros, y otros te necesitan a ti." }, verse: "Hébreux 10:24-25" },
      { title: { fr: "Un seul corps, plusieurs membres", ht: "Yon sèl kò, plizyè manm", en: "One body, many members", es: "Un cuerpo, muchos miembros" }, content: {
        fr: "Paul compare l'Église à un corps : « Vous êtes le corps de Christ, et vous êtes ses membres, chacun pour sa part. » L'œil ne peut pas dire à la main : je n'ai pas besoin de toi. Chaque membre est nécessaire, chaque don compte.\n\nCela signifie deux choses. D'abord, tu as une place et un rôle uniques dans l'Église — personne ne peut te remplacer. Ensuite, tu ne peux pas fonctionner seul : tu as besoin des autres membres. La vraie communion fraternelle, c'est reconnaître notre interdépendance et servir avec humilité, dans l'amour, pour l'édification de tous.",
        ht: "Pòl konpare Legliz la ak yon kò : « Nou se kò Kris la, e chak nan nou se yon manm ladan l. » Je a pa ka di men an : mwen pa bezwen ou. Chak manm nesesè, chak don konte.\n\nSa vle di de bagay. Premyèman, ou gen yon plas ak yon wòl inik nan Legliz la — pèsonn pa ka ranplase ou. Dezyèmman, ou pa ka fonksyone pou kont ou : ou bezwen lòt manm yo. Vrè kominyon fratènèl la, se rekonèt ke nou depann youn de lòt e sèvi ak imilite, nan lanmou, pou edifikasyon tout moun.",
        en: "Paul compares the Church to a body: \"You are the body of Christ, and each one of you is a part of it.\" The eye cannot say to the hand: I don't need you. Every member is necessary, every gift matters.\n\nThis means two things. First, you have a unique place and role in the Church — no one can replace you. Second, you cannot function alone: you need the other members. True fellowship means recognizing our interdependence and serving with humility, in love, for the building up of all.",
        es: "Pablo compara la Iglesia con un cuerpo: «Vosotros sois el cuerpo de Cristo, y miembros cada uno en particular.» El ojo no puede decir a la mano: no te necesito. Cada miembro es necesario, cada don importa.\n\nEsto significa dos cosas. Primero, tienes un lugar y un papel únicos en la Iglesia — nadie puede reemplazarte. Segundo, no puedes funcionar solo: necesitas a los demás miembros. La verdadera comunión es reconocer nuestra interdependencia y servir con humildad, en amor, para la edificación de todos." }, verse: "1 Corinthiens 12:27" },
    ],
    keyVerses: ["Hébreux 10:24-25", "1 Corinthiens 12:12-27", "Actes 2:42"],
  },
  {
    slug: "servir-dons",
    parcours: "formation-disciples",
    title: { fr: "Servir avec ses Dons", ht: "Sèvi ak Don ou yo", en: "Serving with Your Gifts", es: "Servir con tus Dones" },
    description: { fr: "Dieu a donné à chacun un don pour servir les autres", ht: "Bondye bay chak moun yon don pou sèvi lòt yo", en: "God has given each person a gift to serve others", es: "Dios ha dado a cada uno un don para servir a los demás" },
    icon: "https://cdn-icons-png.flaticon.com/512/4305/4305512.png",
    color: "from-cyan-500 to-blue-600",
    duration: "6 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "Chacun a reçu un don", ht: "Chak moun resevwa yon don", en: "Each has received a gift", es: "Cada uno ha recibido un don" }, content: {
        fr: "« Comme de bons dispensateurs des diverses grâces de Dieu, que chacun de vous mette au service des autres le don qu'il a reçu. » Il n'existe pas de croyant sans don. Le Saint-Esprit distribue à chacun ce qu'il veut : enseignement, encouragement, service, générosité, hospitalité, direction, miséricorde.\n\nBeaucoup de chrétiens restent spectateurs parce qu'ils pensent n'avoir rien à offrir. C'est une erreur. Ton don n'est pas pour toi — il est pour les autres. Découvrir et exercer ton don, c'est trouver ta place dans le plan de Dieu et goûter la joie de servir.",
        ht: "« Tankou bon administratè divès gras Bondye yo, se pou chak nan nou mete don li resevwa a nan sèvis lòt yo. » Pa gen kwayan san don. Sentespri a distribye bay chak moun sa li vle : ansèyman, ankourajman, sèvis, jenerozite, resevwa moun, dirije, mizèrikòd.\n\nAnpil kretyen rete espektatè paske yo panse yo pa gen anyen pou ofri. Se yon erè. Don ou pa pou ou — li pou lòt moun. Dekouvri e egzèse don ou, se jwenn plas ou nan plan Bondye a e goute lajwa pou sèvi.",
        en: "\"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms.\" There is no believer without a gift. The Holy Spirit distributes to each one what he wills: teaching, encouragement, service, generosity, hospitality, leadership, mercy.\n\nMany Christians remain spectators because they think they have nothing to offer. This is a mistake. Your gift is not for you — it is for others. Discovering and exercising your gift means finding your place in God's plan and tasting the joy of serving.",
        es: "«Cada uno según el don que ha recibido, minístrelo a los otros, como buenos administradores de la multiforme gracia de Dios.» No hay creyente sin don. El Espíritu Santo reparte a cada uno lo que él quiere: enseñanza, exhortación, servicio, generosidad, hospitalidad, liderazgo, misericordia.\n\nMuchos cristianos permanecen como espectadores porque creen no tener nada que ofrecer. Es un error. Tu don no es para ti — es para los demás. Descubrir y ejercer tu don es encontrar tu lugar en el plan de Dios y gustar el gozo de servir." }, verse: "1 Pierre 4:10" },
      { title: { fr: "Servir comme Christ a servi", ht: "Sèvi jan Kris te sèvi", en: "Serving as Christ served", es: "Servir como Cristo sirvió" }, content: {
        fr: "Le soir avant sa mort, Jésus, le Maître et Seigneur, prit un linge et lava les pieds de ses disciples — la tâche du plus bas des serviteurs. Puis il dit : « Je vous ai donné un exemple, afin que vous fassiez comme je vous ai fait. »\n\nDans le royaume de Dieu, la grandeur se mesure au service, non au pouvoir. « Que le plus grand parmi vous soit votre serviteur. » Servir avec ses dons n'est pas rechercher la reconnaissance, mais imiter l'humilité de Christ. Le vrai leader chrétien est d'abord un serviteur.",
        ht: "Nan aswè anvan lanmò l, Jezi, Mèt la ak Senyè a, te pran yon sèvyèt e li te lave pye disip li yo — travay pi ba nan sèvitè yo. Apre sa li di : « Mwen ban nou yon egzanp, pou nou fè menm jan mwen fè nou an. »\n\nNan wayòm Bondye a, grandè mezire ak sèvis, pa ak pouvwa. « Se pou pi gran nan nou an vin sèvitè nou. » Sèvi ak don ou se pa chèche rekonesans, men imite imilite Kris la. Vrè lidè kretyen an se yon sèvitè anvan tout.",
        en: "On the evening before his death, Jesus, the Teacher and Lord, took a towel and washed his disciples' feet — the task of the lowest servant. Then he said: \"I have set you an example that you should do as I have done for you.\"\n\nIn God's kingdom, greatness is measured by service, not power. \"The greatest among you shall be your servant.\" Serving with your gifts is not seeking recognition, but imitating Christ's humility. The true Christian leader is first a servant.",
        es: "La noche antes de su muerte, Jesús, el Maestro y Señor, tomó una toalla y lavó los pies de sus discípulos — la tarea del más bajo de los siervos. Luego dijo: «Ejemplo os he dado, para que como yo os he hecho, vosotros también hagáis.»\n\nEn el reino de Dios, la grandeza se mide por el servicio, no por el poder. «El que es mayor entre vosotros, sea vuestro siervo.» Servir con tus dones no es buscar reconocimiento, sino imitar la humildad de Cristo. El verdadero líder cristiano es primero un siervo." }, verse: "Jean 13:14-15" },
    ],
    keyVerses: ["1 Pierre 4:10", "Romains 12:6-8", "Jean 13:14-15", "Marc 10:43-44"],
  },

  // ══════════════════ PARCOURS : THÉOLOGIE ÉVANGÉLIQUE ══════════════════
  {
    slug: "justification-foi",
    parcours: "theologie",
    title: { fr: "La Justification par la Foi", ht: "Jistifikasyon pa Lafwa", en: "Justification by Faith", es: "La Justificación por la Fe" },
    description: { fr: "Comment un pécheur peut être déclaré juste devant Dieu", ht: "Kijan yon pechè ka deklare jis devan Bondye", en: "How a sinner can be declared righteous before God", es: "Cómo un pecador puede ser declarado justo ante Dios" },
    icon: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
    color: "from-emerald-500 to-green-600",
    duration: "7 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "Justifiés gratuitement par sa grâce", ht: "Jistifye gratis pa gras li", en: "Justified freely by his grace", es: "Justificados gratuitamente por su gracia" }, content: {
        fr: "La question la plus importante de l'existence est celle-ci : comment un être humain pécheur peut-il tenir devant un Dieu saint ? La réponse de l'Évangile est stupéfiante : « Ils sont gratuitement justifiés par sa grâce, par le moyen de la rédemption qui est en Jésus-Christ. »\n\nÊtre « justifié » signifie être déclaré juste par Dieu — non parce que nous le sommes devenus par nos efforts, mais parce que Christ a porté notre condamnation et nous a revêtus de sa propre justice. Ce n'est pas un salaire mérité, c'est un don reçu. Nous n'apportons rien d'autre que notre foi ; tout le reste, Christ l'a accompli.",
        ht: "Kesyon ki pi enpòtan nan lavi a se sa a : kijan yon moun ki pechè ka kanpe devan yon Bondye ki sen ? Repons Levanjil la etonan : « Yo jistifye gratis pa gras li, gremesi delivrans ki nan Jezi Kris la. »\n\nÈt « jistifye » vle di Bondye deklare ou jis — se pa paske ou vin jis ak efò ou, men paske Kris te pote kondanasyon nou e li abiye nou ak pwòp jistis li. Se pa yon salè ou merite, se yon kado ou resevwa. Nou pa pote anyen apa lafwa nou ; tout rès la, Kris te akonpli l.",
        en: "The most important question of existence is this: how can a sinful human being stand before a holy God? The Gospel's answer is astonishing: \"All are justified freely by his grace through the redemption that came by Christ Jesus.\"\n\nTo be \"justified\" means to be declared righteous by God — not because we became righteous by our efforts, but because Christ bore our condemnation and clothed us with his own righteousness. It is not a wage earned, it is a gift received. We bring nothing but our faith; everything else, Christ accomplished.",
        es: "La pregunta más importante de la existencia es esta: ¿cómo puede un ser humano pecador estar en pie ante un Dios santo? La respuesta del Evangelio es asombrosa: «Siendo justificados gratuitamente por su gracia, mediante la redención que es en Cristo Jesús.»\n\nSer «justificado» significa ser declarado justo por Dios — no porque nos hayamos hecho justos por nuestros esfuerzos, sino porque Cristo cargó nuestra condenación y nos vistió con su propia justicia. No es un salario merecido, es un regalo recibido. No aportamos nada más que nuestra fe; todo lo demás, Cristo lo cumplió." }, verse: "Romains 3:24" },
      { title: { fr: "Par la foi, non par les œuvres", ht: "Pa lafwa, pa pa zèv", en: "By faith, not by works", es: "Por la fe, no por las obras" }, content: {
        fr: "« C'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu. Ce n'est point par les œuvres, afin que personne ne se glorifie. » Voici le cœur de la foi évangélique : le salut ne se gagne pas, il se reçoit.\n\nCela ne signifie pas que les œuvres n'ont pas d'importance. Mais elles sont le fruit du salut, non sa racine. Nous ne faisons pas le bien pour être sauvés ; nous faisons le bien parce que nous sommes sauvés. La foi qui justifie est une foi vivante, qui produit l'amour et l'obéissance par gratitude.",
        ht: "« Se pa gras nou sove, gremesi lafwa. Sa pa soti nan nou, se kado Bondye. Se pa pa zèv, pou pèsonn pa ka vante tèt li. » Men kè lafwa evanjelik la : delivrans pa genyen ak travay, li resevwa.\n\nSa pa vle di zèv pa gen enpòtans. Men yo se fwi delivrans lan, se pa rasin li. Nou pa fè byen pou nou sove ; nou fè byen paske nou sove. Lafwa ki jistifye a se yon lafwa vivan, ki pwodui lanmou ak obeyisans pa rekonesans.",
        en: "\"For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.\" Here is the heart of evangelical faith: salvation is not earned, it is received.\n\nThis does not mean works are unimportant. But they are the fruit of salvation, not its root. We do not do good in order to be saved; we do good because we are saved. The faith that justifies is a living faith, producing love and obedience out of gratitude.",
        es: "«Por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe.» Aquí está el corazón de la fe evangélica: la salvación no se gana, se recibe.\n\nEsto no significa que las obras no importen. Pero son el fruto de la salvación, no su raíz. No hacemos el bien para ser salvos; hacemos el bien porque somos salvos. La fe que justifica es una fe viva, que produce amor y obediencia por gratitud." }, verse: "Éphésiens 2:8-9" },
    ],
    keyVerses: ["Romains 3:23-24", "Éphésiens 2:8-9", "Romains 5:1", "Galates 2:16"],
  },
  {
    slug: "autorite-ecriture",
    parcours: "theologie",
    title: { fr: "L'Autorité de l'Écriture", ht: "Otorite Ekriti a", en: "The Authority of Scripture", es: "La Autoridad de la Escritura" },
    description: { fr: "Pourquoi la Bible est la Parole inspirée et suffisante de Dieu", ht: "Poukisa Bib la se Pawòl Bondye enspire e sifizan", en: "Why the Bible is God's inspired and sufficient Word", es: "Por qué la Biblia es la Palabra inspirada y suficiente de Dios" },
    icon: "https://cdn-icons-png.flaticon.com/512/1533/1533908.png",
    color: "from-emerald-500 to-green-600",
    duration: "6 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "Toute Écriture est inspirée de Dieu", ht: "Tout Ekriti soti nan Bondye", en: "All Scripture is God-breathed", es: "Toda la Escritura es inspirada por Dios" }, content: {
        fr: "« Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice. » Le mot traduit par « inspirée » signifie littéralement « soufflée par Dieu ». La Bible n'est pas seulement un livre sur Dieu — c'est la Parole de Dieu lui-même.\n\nDieu s'est servi d'environ quarante auteurs humains, sur 1 500 ans, dans trois langues et sur trois continents — pourtant l'Écriture forme un seul message cohérent qui pointe vers Jésus-Christ. Cette unité miraculeuse témoigne d'un seul Auteur divin derrière les auteurs humains.",
        ht: "« Tout Ekriti soti nan Bondye, e li itil pou anseye, pou konvenk, pou korije, pou enstwi nan jistis. » Mo yo tradui « enspire » a vle di literalman « Bondye soufle l ». Bib la se pa sèlman yon liv sou Bondye — se Pawòl Bondye li menm.\n\nBondye te sèvi ak anviwon karant otè imen, sou 1 500 an, nan twa lang e sou twa kontinan — men Ekriti a fòme yon sèl mesaj koyeran ki montre Jezi Kris. Inite mirakile sa a temwaye gen yon sèl Otè diven dèyè otè imen yo.",
        en: "\"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.\" The word translated \"inspired\" literally means \"breathed out by God.\" The Bible is not merely a book about God — it is the Word of God himself.\n\nGod used about forty human authors, over 1,500 years, in three languages and on three continents — yet Scripture forms one coherent message that points to Jesus Christ. This miraculous unity testifies to one divine Author behind the human writers.",
        es: "«Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia.» La palabra traducida «inspirada» significa literalmente «exhalada por Dios». La Biblia no es solo un libro acerca de Dios — es la Palabra de Dios mismo.\n\nDios usó a unos cuarenta autores humanos, a lo largo de 1.500 años, en tres idiomas y en tres continentes — y sin embargo la Escritura forma un solo mensaje coherente que señala a Jesucristo. Esta unidad milagrosa da testimonio de un solo Autor divino detrás de los escritores humanos." }, verse: "2 Timothée 3:16" },
      { title: { fr: "Une lampe à mes pieds", ht: "Yon lanp pou pye m", en: "A lamp to my feet", es: "Lámpara a mis pies" }, content: {
        fr: "« Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. » Dans un monde plein de voix contradictoires, l'Écriture est notre boussole sûre. Elle ne se contente pas d'informer : elle transforme. « La parole de Dieu est vivante et efficace, plus tranchante qu'une épée à deux tranchants. »\n\nParce qu'elle vient de Dieu, la Bible a autorité sur nos opinions, nos traditions et nos sentiments. Le disciple ne juge pas la Parole — il se laisse juger par elle. La lire, la méditer et lui obéir, c'est bâtir sa maison sur le roc qui ne sera jamais ébranlé.",
        ht: "« Pawòl ou se yon lanp pou pye m, e yon limyè sou chemen m. » Nan yon mond ki plen vwa ki kontredi youn lòt, Ekriti a se bousòl si nou. Li pa senpleman enfòme : li transfòme. « Pawòl Bondye a vivan e efikas, pi file pase yon nepe ki gen de bò. »\n\nPaske li soti nan Bondye, Bib la gen otorite sou opinyon nou, tradisyon nou ak santiman nou. Disip la pa jije Pawòl la — li kite Pawòl la jije l. Li li, medite sou li e obeyi l, se bati kay ou sou wòch ki p ap janm brannen.",
        en: "\"Your word is a lamp for my feet, a light on my path.\" In a world full of contradictory voices, Scripture is our sure compass. It does not merely inform: it transforms. \"The word of God is alive and active, sharper than any double-edged sword.\"\n\nBecause it comes from God, the Bible has authority over our opinions, traditions and feelings. The disciple does not judge the Word — he lets himself be judged by it. To read it, meditate on it and obey it is to build your house on the rock that will never be shaken.",
        es: "«Lámpara es a mis pies tu palabra, y lumbrera a mi camino.» En un mundo lleno de voces contradictorias, la Escritura es nuestra brújula segura. No solo informa: transforma. «La palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos.»\n\nPorque viene de Dios, la Biblia tiene autoridad sobre nuestras opiniones, tradiciones y sentimientos. El discípulo no juzga la Palabra — se deja juzgar por ella. Leerla, meditarla y obedecerla es edificar tu casa sobre la roca que jamás será sacudida." }, verse: "Psaume 119:105" },
    ],
    keyVerses: ["2 Timothée 3:16-17", "Psaume 119:105", "Hébreux 4:12", "Matthieu 24:35"],
  },
  {
    slug: "souverainete-dieu",
    parcours: "theologie",
    title: { fr: "La Souveraineté de Dieu", ht: "Souvrènte Bondye a", en: "The Sovereignty of God", es: "La Soberanía de Dios" },
    description: { fr: "Dieu règne sur toutes choses et accomplit son dessein parfait", ht: "Bondye reyen sou tout bagay e li akonpli plan pafè li", en: "God reigns over all things and accomplishes his perfect purpose", es: "Dios reina sobre todo y cumple su propósito perfecto" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-emerald-500 to-green-600",
    duration: "7 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" },
    youtubeId: "",
    sections: [
      { title: { fr: "Notre Dieu fait tout ce qu'il veut", ht: "Bondye nou an fè tout sa li vle", en: "Our God does whatever pleases him", es: "Nuestro Dios hace todo lo que quiere" }, content: {
        fr: "« Notre Dieu est au ciel, il fait tout ce qu'il veut. » La souveraineté de Dieu signifie qu'il règne absolument sur l'univers : rien n'arrive en dehors de sa volonté ou de sa permission. Les nations, les rois, la nature, l'histoire — tout est entre ses mains.\n\nCette vérité est profondément réconfortante. Le monde peut sembler chaotique, mais il n'échappe jamais au contrôle de Dieu. « Le cœur du roi est un courant d'eau dans la main de l'Éternel ; il l'incline partout où il veut. » Aucun tyran, aucune circonstance ne peut faire échouer le plan éternel de notre Père.",
        ht: "« Bondye nou an nan syèl la, li fè tout sa li vle. » Souvrènte Bondye a vle di li reyen absoliman sou linivè : anyen pa rive andeyò volonte l oswa pèmisyon l. Nasyon yo, wa yo, lanati, listwa — tout bagay nan men l.\n\nVerite sa a rekonfòtan anpil. Mond lan ka sanble dezòd, men li pa janm chape anba kontwòl Bondye. « Kè wa a se yon kouran dlo nan men Senyè a ; li vire l kote li vle. » Pa gen tiran, pa gen sikonstans ki ka fè plan etènèl Papa nou an echwe.",
        en: "\"Our God is in heaven; he does whatever pleases him.\" God's sovereignty means he reigns absolutely over the universe: nothing happens outside his will or permission. Nations, kings, nature, history — everything is in his hands.\n\nThis truth is deeply comforting. The world may seem chaotic, but it never escapes God's control. \"The king's heart is a stream of water in the hand of the Lord; he turns it wherever he will.\" No tyrant, no circumstance can thwart the eternal plan of our Father.",
        es: "«Nuestro Dios está en los cielos; todo lo que quiso ha hecho.» La soberanía de Dios significa que reina absolutamente sobre el universo: nada ocurre fuera de su voluntad o permiso. Las naciones, los reyes, la naturaleza, la historia — todo está en sus manos.\n\nEsta verdad es profundamente consoladora. El mundo puede parecer caótico, pero nunca escapa al control de Dios. «Como los repartimientos de las aguas, así está el corazón del rey en la mano del Señor; a todo lo que quiere lo inclina.» Ningún tirano, ninguna circunstancia puede frustrar el plan eterno de nuestro Padre." }, verse: "Psaume 115:3" },
      { title: { fr: "Tout concourt au bien", ht: "Tout bagay travay ansanm pou byen", en: "All things work together for good", es: "Todo obra para bien" }, content: {
        fr: "La souveraineté de Dieu ne le rend pas lointain ni froid — au contraire, elle est la source de notre plus grande assurance : « Nous savons que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein. »\n\nRemarquez : Dieu ne dit pas que toutes choses sont bonnes, mais qu'il fait concourir toutes choses — même les épreuves, même les souffrances — vers un bien final. Joseph, vendu par ses frères, put dire : « Vous aviez médité de me faire du mal, Dieu l'a changé en bien. » Rien dans ta vie n'est gaspillé entre les mains d'un Dieu souverain et bon.",
        ht: "Souvrènte Bondye a pa fè l lwen ni frèt — okontrè, se sous pi gwo asirans nou : « Nou konnen tout bagay travay ansanm pou byen moun ki renmen Bondye, moun li rele selon plan li. »\n\nRemake : Bondye pa di tout bagay bon, men li fè tout bagay travay ansanm — menm eprèv yo, menm soufrans yo — pou yon byen final. Jozèf, frè l yo te vann li, te ka di : « Nou te vle fè m mal, Bondye chanje l an byen. » Anyen nan lavi ou pa gaspiye nan men yon Bondye souveren e bon.",
        en: "God's sovereignty does not make him distant or cold — on the contrary, it is the source of our greatest assurance: \"We know that in all things God works for the good of those who love him, who have been called according to his purpose.\"\n\nNotice: God does not say all things are good, but that he works all things — even trials, even suffering — toward a final good. Joseph, sold by his brothers, could say: \"You intended to harm me, but God intended it for good.\" Nothing in your life is wasted in the hands of a sovereign and good God.",
        es: "La soberanía de Dios no lo hace distante ni frío — al contrario, es la fuente de nuestra mayor seguridad: «Sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.»\n\nObserva: Dios no dice que todas las cosas sean buenas, sino que hace que todas las cosas — incluso las pruebas, incluso el sufrimiento — obren para un bien final. José, vendido por sus hermanos, pudo decir: «Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien.» Nada en tu vida se desperdicia en las manos de un Dios soberano y bueno." }, verse: "Romains 8:28" },
    ],
    keyVerses: ["Psaume 115:3", "Romains 8:28", "Genèse 50:20", "Proverbes 21:1"],
  },
  {
    slug: "salut-assurance",
    parcours: "theologie",
    title: { fr: "Le Salut et l'Assurance", ht: "Delivrans ak Asirans", en: "Salvation and Assurance", es: "La Salvación y la Seguridad" },
    description: { fr: "Ce que Dieu a accompli pour nous sauver, et comment en être sûr", ht: "Sa Bondye akonpli pou sove nou, e kijan pou nou sèten", en: "What God accomplished to save us, and how to be sure of it", es: "Lo que Dios hizo para salvarnos, y cómo estar seguro" },
    icon: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-emerald-500 to-green-600",
    duration: "7 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "Le grand échange de la croix", ht: "Gwo echanj kwa a", en: "The great exchange of the cross", es: "El gran intercambio de la cruz" }, content: {
        fr: "Le salut repose sur ce que la Bible appelle un échange admirable : « Celui qui n'a point connu le péché, Dieu l'a fait devenir péché pour nous, afin que nous devenions en lui justice de Dieu. » À la croix, Jésus a pris notre péché, notre culpabilité et notre châtiment ; en retour, il nous donne sa justice parfaite.\n\nNous étions condamnés ; il est devenu notre substitut. « Il a été blessé pour nos péchés, brisé pour nos iniquités ; le châtiment qui nous donne la paix est tombé sur lui. » Le salut n'est donc pas notre œuvre, mais l'accomplissement du sacrifice de Christ en notre faveur.",
        ht: "Delivrans lan chita sou sa Bib la rele yon echanj admirab : « Sila ki pa t konnen peche a, Bondye fè l vin peche pou nou, pou nou ka vin jistis Bondye nan li. » Sou kwa a, Jezi te pran peche nou, kilpabilite nou ak pinisyon nou ; an retou, li ban nou jistis pafè li.\n\nNou te kondane ; li te vin ranplasan nou. « Yo te blese l pou peche nou, kraze l pou inikite nou ; pinisyon ki ban nou lapè a te tonbe sou li. » Kidonk, delivrans lan se pa zèv nou, men akonplisman sakrifis Kris la an favè nou.",
        en: "Salvation rests on what the Bible calls a wonderful exchange: \"God made him who had no sin to be sin for us, so that in him we might become the righteousness of God.\" At the cross, Jesus took our sin, our guilt and our punishment; in return, he gives us his perfect righteousness.\n\nWe were condemned; he became our substitute. \"He was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him.\" Salvation, therefore, is not our work, but the accomplishment of Christ's sacrifice on our behalf.",
        es: "La salvación se basa en lo que la Biblia llama un intercambio admirable: «Al que no conoció pecado, por nosotros lo hizo pecado, para que nosotros fuésemos hechos justicia de Dios en él.» En la cruz, Jesús tomó nuestro pecado, nuestra culpa y nuestro castigo; a cambio, nos da su justicia perfecta.\n\nEstábamos condenados; él se hizo nuestro sustituto. «Herido fue por nuestras rebeliones, molido por nuestros pecados; el castigo de nuestra paz fue sobre él.» La salvación, por tanto, no es nuestra obra, sino el cumplimiento del sacrificio de Cristo a nuestro favor." }, verse: "2 Corinthiens 5:21" },
      { title: { fr: "Vous pouvez savoir que vous avez la vie éternelle", ht: "Ou ka konnen ou gen lavi etènèl", en: "You may know you have eternal life", es: "Podéis saber que tenéis vida eterna" }, content: {
        fr: "Beaucoup de croyants sincères doutent de leur salut. Pourtant Dieu veut que nous en soyons assurés : « Je vous ai écrit ces choses, afin que vous sachiez que vous avez la vie éternelle, vous qui croyez au nom du Fils de Dieu. »\n\nNotre assurance ne repose pas sur nos sentiments changeants ni sur notre performance, mais sur les promesses de Dieu et sur l'œuvre achevée de Christ. « Mes brebis entendent ma voix… je leur donne la vie éternelle ; elles ne périront jamais, et personne ne les ravira de ma main. » Celui qui a commencé en toi cette bonne œuvre la rendra parfaite. Ton salut est gardé, non par ta force, mais par la sienne.",
        ht: "Anpil kwayan sensè gen dout sou delivrans yo. Men Bondye vle nou sèten : « Mwen ekri nou bagay sa yo, pou nou ka konnen nou gen lavi etènèl, nou menm ki kwè nan non Pitit Bondye a. »\n\nAsirans nou pa chita sou santiman nou k ap chanje ni sou pèfòmans nou, men sou pwomès Bondye ak zèv Kris fin akonpli a. « Mouton m yo tande vwa m… mwen ba yo lavi etènèl ; yo p ap janm peri, e pèsonn p ap ka rache yo nan men m. » Sila ki te kòmanse bon zèv sa a nan ou, l ap fè l pafè. Delivrans ou gade, se pa ak fòs ou, men ak fòs pa li.",
        en: "Many sincere believers doubt their salvation. Yet God wants us to be assured of it: \"I write these things to you who believe in the name of the Son of God so that you may know that you have eternal life.\"\n\nOur assurance rests not on our changing feelings nor on our performance, but on God's promises and the finished work of Christ. \"My sheep listen to my voice… I give them eternal life, and they shall never perish; no one will snatch them out of my hand.\" He who began this good work in you will carry it to completion. Your salvation is kept, not by your strength, but by his.",
        es: "Muchos creyentes sinceros dudan de su salvación. Sin embargo, Dios quiere que estemos seguros de ella: «Estas cosas os he escrito a vosotros que creéis en el nombre del Hijo de Dios, para que sepáis que tenéis vida eterna.»\n\nNuestra seguridad no descansa en nuestros sentimientos cambiantes ni en nuestro desempeño, sino en las promesas de Dios y en la obra consumada de Cristo. «Mis ovejas oyen mi voz… y yo les doy vida eterna; y no perecerán jamás, ni nadie las arrebatará de mi mano.» El que comenzó en ti la buena obra, la perfeccionará. Tu salvación está guardada, no por tu fuerza, sino por la suya." }, verse: "1 Jean 5:13" },
    ],
    keyVerses: ["2 Corinthiens 5:21", "1 Jean 5:13", "Jean 10:27-28", "Philippiens 1:6"],
  },
  {
    slug: "retour-christ",
    parcours: "theologie",
    title: { fr: "Le Retour de Christ", ht: "Retou Kris la", en: "The Return of Christ", es: "El Regreso de Cristo" },
    description: { fr: "L'espérance certaine du retour glorieux de Jésus", ht: "Esperans si retou glorye Jezi a", en: "The certain hope of Jesus' glorious return", es: "La esperanza cierta del regreso glorioso de Jesús" },
    icon: "https://cdn-icons-png.flaticon.com/512/3122/3122803.png",
    color: "from-emerald-500 to-green-600",
    duration: "6 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
    youtubeId: "",
    sections: [
      { title: { fr: "Il reviendra de la même manière", ht: "L ap retounen menm jan an", en: "He will come back in the same way", es: "Vendrá de la misma manera" }, content: {
        fr: "Après la résurrection, tandis que Jésus montait au ciel, deux anges déclarèrent aux disciples : « Ce Jésus, qui a été enlevé au ciel du milieu de vous, reviendra de la même manière que vous l'avez vu allant au ciel. » Le retour de Christ n'est pas un mythe, mais une promesse certaine, répétée plus de 300 fois dans le Nouveau Testament.\n\nIl est venu une première fois dans l'humilité, comme un enfant à Bethléem, pour porter nos péchés. Il reviendra une seconde fois dans la gloire, comme Roi et Juge de toute la terre. « Voici, il vient avec les nuées. Et tout œil le verra. »",
        ht: "Apre rezirèksyon an, pandan Jezi t ap monte nan syèl la, de zanj te deklare disip yo : « Jezi sa a, ki soti nan mitan nou pou monte nan syèl la, l ap retounen menm jan nou wè l ale nan syèl la. » Retou Kris la se pa yon mit, men yon pwomès si, ki repete plis pase 300 fwa nan Nouvo Testaman an.\n\nLi te vin yon premye fwa nan imilite, tankou yon timoun nan Betleyèm, pou pote peche nou. L ap retounen yon dezyèm fwa nan glwa, tankou Wa e Jij tout latè. « Gade, l ap vini nan nyaj yo. E tout je ap wè l. »",
        en: "After the resurrection, as Jesus ascended to heaven, two angels declared to the disciples: \"This same Jesus, who has been taken from you into heaven, will come back in the same way you have seen him go into heaven.\" Christ's return is not a myth, but a certain promise, repeated more than 300 times in the New Testament.\n\nHe came the first time in humility, as a child in Bethlehem, to bear our sins. He will come a second time in glory, as King and Judge of all the earth. \"Look, he is coming with the clouds, and every eye will see him.\"",
        es: "Después de la resurrección, mientras Jesús ascendía al cielo, dos ángeles declararon a los discípulos: «Este mismo Jesús, que ha sido tomado de vosotros al cielo, así vendrá como le habéis visto ir al cielo.» El regreso de Cristo no es un mito, sino una promesa cierta, repetida más de 300 veces en el Nuevo Testamento.\n\nVino la primera vez en humildad, como un niño en Belén, para llevar nuestros pecados. Vendrá una segunda vez en gloria, como Rey y Juez de toda la tierra. «He aquí que viene con las nubes, y todo ojo le verá.»" }, verse: "Actes 1:11" },
      { title: { fr: "Veillez, car vous ne savez ni le jour ni l'heure", ht: "Veye, paske nou pa konnen ni jou ni lè", en: "Watch, for you know neither the day nor the hour", es: "Velad, porque no sabéis el día ni la hora" }, content: {
        fr: "Jésus a été clair : « Pour ce qui est du jour et de l'heure, personne ne le sait, pas même les anges, mais le Père seul. » Toute tentative de fixer une date est vaine. L'attitude que Jésus demande n'est pas la spéculation, mais la vigilance : « Veillez donc, car vous ne savez pas quel jour votre Seigneur viendra. »\n\nCette espérance transforme notre manière de vivre. Elle nous détache de l'amour du monde, nous pousse à la sainteté et à l'évangélisation urgente. « Quiconque possède cette espérance en lui se purifie, comme lui-même est pur. » Nous ne vivons pas dans la peur, mais dans l'attente joyeuse : « Viens, Seigneur Jésus ! »",
        ht: "Jezi te klè : « Pou jou a ak lè a, pèsonn pa konnen l, menm zanj yo non, men se Papa a sèlman. » Tout tantativ pou fikse yon dat se anven. Atitid Jezi mande a se pa espekilasyon, men vijilans : « Veye donk, paske nou pa konnen ki jou Senyè nou an ap vini. »\n\nEsperans sa a transfòme fason nou viv. Li detache nou de lanmou mond lan, li pouse nou nan sentete ak evanjelizasyon ki ijan. « Nenpòt moun ki gen esperans sa a nan li, li pirifye tèt li, menm jan li menm li pi. » Nou pa viv nan laperèz, men nan yon atant ki plen lajwa : « Vini, Senyè Jezi ! »",
        en: "Jesus was clear: \"About that day or hour no one knows, not even the angels, but only the Father.\" Every attempt to set a date is vain. The attitude Jesus asks for is not speculation, but watchfulness: \"Therefore keep watch, because you do not know on what day your Lord will come.\"\n\nThis hope transforms the way we live. It detaches us from the love of the world, urging us toward holiness and urgent evangelism. \"All who have this hope in him purify themselves, just as he is pure.\" We do not live in fear, but in joyful expectation: \"Come, Lord Jesus!\"",
        es: "Jesús fue claro: «Del día y la hora nadie sabe, ni aun los ángeles, sino solo el Padre.» Todo intento de fijar una fecha es vano. La actitud que Jesús pide no es la especulación, sino la vigilancia: «Velad, pues, porque no sabéis a qué hora ha de venir vuestro Señor.»\n\nEsta esperanza transforma nuestra manera de vivir. Nos desprende del amor al mundo, impulsándonos a la santidad y a la evangelización urgente. «Todo aquel que tiene esta esperanza en él, se purifica a sí mismo, así como él es puro.» No vivimos en el temor, sino en la gozosa espera: «¡Ven, Señor Jesús!»" }, verse: "Matthieu 24:42" },
    ],
    keyVerses: ["Actes 1:11", "Matthieu 24:42", "Apocalypse 22:20", "1 Thessaloniciens 4:16-17"],
  },
];

// Études de base + séries d'enseignement intégrées (parcours « enseignements »).
export const studies: Study[] = [...baseStudies, ...teachingStudies];

/** Toutes les études d'un parcours donné, dans l'ordre du fichier. */
export function studiesByParcours(key: ParcoursKey): Study[] {
  return studies.filter((s) => s.parcours === key);
}

/** Nombre d'études réellement disponibles pour un parcours. */
export function parcoursLessonCount(key: ParcoursKey): number {
  return studiesByParcours(key).length;
}

/** Étude suivante / précédente à l'intérieur du même parcours (leçons connectées). */
export function adjacentStudies(slug: string): { prev: Study | null; next: Study | null } {
  const study = studies.find((s) => s.slug === slug);
  if (!study) return { prev: null, next: null };
  const list = studiesByParcours(study.parcours);
  const i = list.findIndex((s) => s.slug === slug);
  return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

/** Icône SVG sémantique par étude (remplace les images génériques). */
export const STUDY_ICONS: Record<string, IconName> = {
  "la-trinite": "colombe", "grace-vs-loi": "balance", "le-pardon": "main_coeur", "la-priere": "priere",
  "apocalypse": "couronne", "naissance-jesus": "etoile", "miracles-jesus": "etincelles",
  "croix-resurrection": "croix", "saint-esprit-pentecote": "feu", "lettres-paul": "lecture", "eglise-primitive": "eglise",
  "creation": "soleil", "abraham": "etoile", "moise-exode": "epee", "10-commandements": "balance", "david": "couronne",
  "grande-mission": "monde", "cout-disciple": "cible", "faire-disciples": "groupe", "communion-fraternelle": "communaute", "servir-dons": "cadeau",
  "justification-foi": "foi", "autorite-ecriture": "bible", "souverainete-dieu": "couronne", "salut-assurance": "bouclier", "retour-christ": "esperance",
  ...(teachingIcons as Record<string, IconName>),
};
export function studyIcon(slug: string): IconName {
  return STUDY_ICONS[slug] ?? "etude";
}

/** Couleur d'accent (hex) dérivée du `from-<couleur>-<nuance>` de l'étude, pour teinter icône & fonds. */
const TW_HEX: Record<string, string> = {
  slate: "#64748b", gray: "#6b7280", stone: "#78716c", red: "#ef4444", orange: "#f97316",
  amber: "#f59e0b", yellow: "#eab308", lime: "#65a30d", green: "#16a34a", emerald: "#10b981",
  teal: "#14b8a6", cyan: "#06b6d4", sky: "#0ea5e9", blue: "#3b82f6", indigo: "#6366f1",
  violet: "#8b5cf6", purple: "#a855f7", fuchsia: "#d946ef", pink: "#ec4899", rose: "#f43f5e",
};
export function studyAccent(colorClass: string): string {
  const m = colorClass.match(/from-([a-z]+)-\d+/);
  return (m && TW_HEX[m[1]]) || "#1a3568";
}
