import { Lang } from "./translations";

export interface StudySection {
  title: Partial<Record<Lang, string>>;
  content: Partial<Record<Lang, string>>;
  verse: string;
}

export interface Study {
  slug: string;
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

export const studies: Study[] = [
  {
    slug: "la-trinite",
    title: { fr: "La Trinité", ht: "Trinite a", en: "The Trinity" },
    description: { fr: "Comprendre le Père, le Fils et le Saint-Esprit", ht: "Konprann Papa a, Pitit la ak Sentespri a", en: "Understanding the Father, Son and Holy Spirit" },
    icon: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
    color: "from-violet-500 to-purple-600",
    duration: "8 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Un seul Dieu, trois personnes", ht: "Yon sèl Bondye, twa pèsòn", en: "One God, three persons" },
        content: {
          fr: "La Trinité est l'un des concepts les plus profonds de la foi chrétienne. Dieu est UN en essence, mais existe en TROIS personnes distinctes : le Père, le Fils (Jésus-Christ), et le Saint-Esprit. Ce n'est pas trois dieux, ni un dieu qui change de forme. C'est un seul Dieu qui existe éternellement en trois personnes.\n\nPensez à l'eau : elle peut être liquide, glace ou vapeur — mais c'est toujours H₂O. De même, Dieu est Père, Fils et Esprit — mais c'est toujours le même Dieu unique.",
          ht: "Trinite a se youn nan konsèp ki pi pwofon nan lafwa kretyen an. Bondye se YON sèl nan esans li, men li egziste nan TWA pèsòn diferan : Papa a, Pitit la (Jezi Kris), ak Sentespri a. Se pa twa bondye, ni yon bondye ki chanje fòm. Se yon sèl Bondye ki egziste pou tout tan nan twa pèsòn.\n\nPanse ak dlo : li ka likid, glas oswa vapè — men se toujou H₂O. Menm jan an, Bondye se Papa, Pitit ak Lespri — men se toujou menm sèl Bondye a.",
          en: "The Trinity is one of the most profound concepts of Christian faith. God is ONE in essence, but exists in THREE distinct persons: the Father, the Son (Jesus Christ), and the Holy Spirit. This is not three gods, nor one god changing forms. It is one God who eternally exists in three persons.\n\nThink of water: it can be liquid, ice, or vapor — but it's always H₂O. Similarly, God is Father, Son, and Spirit — but always the same one God.",
        },
        verse: "Matthieu 28:19",
      },
      {
        title: { fr: "Le Père — Le Créateur", ht: "Papa a — Kreyatè a", en: "The Father — The Creator" },
        content: {
          fr: "Le Père est la source de toute chose. Il a créé l'univers par sa Parole. Il est omniscient (sait tout), omnipotent (peut tout), et omniprésent (est partout). Il est le Dieu d'amour qui a envoyé son Fils pour sauver l'humanité.\n\nJésus nous a appris à l'appeler 'Abba' — un terme intime qui signifie 'Papa'. Ce n'est pas un Dieu distant et froid, mais un Père aimant qui prend soin de chacun de ses enfants.",
          ht: "Papa a se sous tout bagay. Li te kreye linivè pa Pawòl li. Li omisyan (konnen tout bagay), omnipotán (ka fè tout bagay), e omniprezán (toupatou). Li se Bondye lanmou ki te voye Pitit li pou sove limanite.\n\nJezi te aprann nou rele l 'Abba' — yon tèm entim ki vle di 'Papa'. Se pa yon Bondye ki lwen e frèt, men yon Papa ki renmen nou e ki pran swen chak pitit li.",
          en: "The Father is the source of all things. He created the universe by his Word. He is omniscient (knows everything), omnipotent (can do anything), and omnipresent (is everywhere). He is the God of love who sent his Son to save humanity.\n\nJesus taught us to call him 'Abba' — an intimate term meaning 'Dad'. He is not a distant, cold God, but a loving Father who cares for each of his children.",
        },
        verse: "Jean 3:16",
      },
      {
        title: { fr: "Le Fils — Jésus-Christ", ht: "Pitit la — Jezi Kris", en: "The Son — Jesus Christ" },
        content: {
          fr: "Jésus est Dieu fait homme. Il existait avant la création du monde ('Au commencement était la Parole', Jean 1:1). Il est venu sur terre, a vécu une vie parfaite, est mort sur la croix pour nos péchés, et est ressuscité le 3ème jour.\n\nJésus est à la fois 100% Dieu et 100% homme. C'est un mystère, mais c'est essentiel : seul Dieu pouvait payer pour les péchés de l'humanité, et seul un homme pouvait représenter l'humanité. Jésus est le pont entre Dieu et nous.",
          ht: "Jezi se Bondye ki te fè tèt li tounen moun. Li te egziste anvan kreyasyon mond lan ('Nan kòmansman te gen Pawòl la', Jan 1:1). Li te vini sou tè a, li te viv yon lavi pafè, li te mouri sou kwa a pou peche nou yo, epi li te resisite 3èm jou a.\n\nJezi se an menm tan 100% Bondye ak 100% moun. Se yon mistè, men li esansyèl : sèl Bondye ki te ka peye pou peche limanite, e sèl yon moun ki te ka reprezante limanite. Jezi se pon ant Bondye ak nou.",
          en: "Jesus is God made man. He existed before the creation of the world ('In the beginning was the Word', John 1:1). He came to earth, lived a perfect life, died on the cross for our sins, and rose on the 3rd day.\n\nJesus is both 100% God and 100% man. It's a mystery, but it's essential: only God could pay for humanity's sins, and only a man could represent humanity. Jesus is the bridge between God and us.",
        },
        verse: "Jean 1:1-14",
      },
      {
        title: { fr: "Le Saint-Esprit — Notre guide", ht: "Sentespri a — Gid nou", en: "The Holy Spirit — Our guide" },
        content: {
          fr: "Le Saint-Esprit est Dieu vivant en nous. Après l'ascension de Jésus, le Saint-Esprit est venu à la Pentecôte pour guider, consoler et donner la puissance aux croyants. Il n'est pas une force impersonnelle — c'est une personne divine qui parle, guide, et peut être attristé.\n\nLe Saint-Esprit produit des fruits dans notre vie : amour, joie, paix, patience, bonté, bienveillance, fidélité, douceur et maîtrise de soi (Galates 5:22-23). Si vous voyez ces fruits grandir dans votre vie, c'est le Saint-Esprit à l'œuvre.",
          ht: "Sentespri a se Bondye k ap viv nan nou. Apre Jezi te monte nan syèl, Sentespri a te vini nan Lapannkòt pou gide, konsole e bay kwayan yo pisans. Li pa yon fòs san pèsonalite — se yon pèsòn diven ki pale, gide, e ki ka tris.\n\nSentespri a pwodui fwi nan lavi nou : lanmou, kè kontan, lapè, pasyans, bonte, jantiyès, fidelite, dousè ak metriz tèt (Galat 5:22-23). Si ou wè fwi sa yo ap grandi nan lavi ou, se Sentespri a k ap travay.",
          en: "The Holy Spirit is God living in us. After Jesus' ascension, the Holy Spirit came at Pentecost to guide, comfort, and empower believers. He is not an impersonal force — he is a divine person who speaks, guides, and can be grieved.\n\nThe Holy Spirit produces fruit in our lives: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness and self-control (Galatians 5:22-23). If you see these fruits growing in your life, that's the Holy Spirit at work.",
        },
        verse: "Actes 2:1-4",
      },
    ],
    keyVerses: ["Matthieu 28:19", "Jean 1:1", "Jean 3:16", "Actes 2:1-4", "Galates 5:22-23"],
  },
  {
    slug: "grace-vs-loi",
    title: { fr: "La Grâce vs La Loi", ht: "Lagras kont Lalwa", en: "Grace vs The Law" },
    description: { fr: "Sommes-nous sauvés par les œuvres ou par la foi ?", ht: "Èske nou sove pa zèv oswa pa lafwa ?", en: "Are we saved by works or by faith?" },
    icon: "https://cdn-icons-png.flaticon.com/512/3122/3122803.png",
    color: "from-blue-500 to-cyan-600",
    duration: "7 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "La Loi de Moïse", ht: "Lalwa Moyiz", en: "The Law of Moses" },
        content: {
          fr: "Dieu a donné la Loi (les 10 commandements et 613 lois) à Moïse sur le mont Sinaï. Cette Loi était parfaite — elle montrait le standard de Dieu. Mais aucun être humain n'a jamais pu la suivre parfaitement.\n\nLa Loi n'a pas été donnée pour nous sauver. Elle a été donnée comme un miroir — pour nous montrer notre péché et notre besoin d'un Sauveur. Paul dit : 'La Loi a été comme un pédagogue pour nous conduire à Christ' (Galates 3:24).",
          ht: "Bondye te bay Lalwa (10 kòmandman ak 613 lwa) bay Moyiz sou mòn Sinayi. Lalwa sa a te pafè — li te montre estanda Bondye a. Men okenn moun pa t janm ka swiv li pafètman.\n\nLalwa pa t bay pou sove nou. Li te bay tankou yon glas — pou montre nou peche nou ak bezwen nou pou yon Sovè. Pòl di : 'Lalwa te tankou yon monitè pou mennen nou bò kote Kris' (Galat 3:24).",
          en: "God gave the Law (the 10 commandments and 613 laws) to Moses on Mount Sinai. This Law was perfect — it showed God's standard. But no human being has ever been able to follow it perfectly.\n\nThe Law was not given to save us. It was given as a mirror — to show us our sin and our need for a Savior. Paul says: 'The Law was our guardian to lead us to Christ' (Galatians 3:24).",
        },
        verse: "Galates 3:24",
      },
      {
        title: { fr: "La Grâce — Le don gratuit", ht: "Lagras — Kado gratis la", en: "Grace — The free gift" },
        content: {
          fr: "La grâce, c'est recevoir ce qu'on ne mérite pas. Nous méritons la punition pour nos péchés, mais Dieu nous offre le pardon gratuitement à travers Jésus-Christ.\n\n'Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu. Ce n'est point par les œuvres, afin que personne ne se glorifie.' (Éphésiens 2:8-9)\n\nCela signifie que personne ne peut 'gagner' le ciel par ses bonnes actions. Le salut est un cadeau. Il suffit de le recevoir par la foi.",
          ht: "Lagras, se resevwa sa ou pa merite. Nou merite pinisyon pou peche nou yo, men Bondye ofri nou padon gratis atravè Jezi Kris.\n\n'Paske se pa lagras nou sove, pa mwayen lafwa. Sa pa soti nan nou menm, se kado Bondye. Se pa pa zèv, pou pèsonn pa ka vante tèt li.' (Efezyen 2:8-9)\n\nSa vle di pèsonn pa ka 'genyen' syèl la pa bon aksyon li. Delivrans lan se yon kado. Ou jis bezwen resevwa l pa lafwa.",
          en: "Grace is receiving what we don't deserve. We deserve punishment for our sins, but God offers us forgiveness freely through Jesus Christ.\n\n'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.' (Ephesians 2:8-9)\n\nThis means no one can 'earn' heaven by good deeds. Salvation is a gift. You just need to receive it by faith.",
        },
        verse: "Éphésiens 2:8-9",
      },
      {
        title: { fr: "Alors, la Loi est-elle inutile ?", ht: "Alò, èske Lalwa pa itil ?", en: "So, is the Law useless?" },
        content: {
          fr: "Non ! La Loi reste le standard moral de Dieu. Jésus n'est pas venu abolir la Loi, mais l'accomplir (Matthieu 5:17). Nous ne sommes plus SOUS la Loi (elle ne nous condamne plus), mais nous suivons ses principes par amour.\n\nLa différence : sous la Loi, on obéit par PEUR de la punition. Sous la grâce, on obéit par AMOUR pour Dieu. Le résultat extérieur peut sembler identique, mais la motivation est complètement différente.\n\nUn enfant qui range sa chambre par peur d'être puni vs un enfant qui range par amour pour ses parents — l'action est la même, le cœur est différent.",
          ht: "Non ! Lalwa rete estanda moral Bondye. Jezi pa t vini pou aboli Lalwa, men pou akonpli l (Matye 5:17). Nou pa anba Lalwa ankò (li pa kondane nou ankò), men nou swiv prensip li pa lanmou.\n\nDiferans lan : anba Lalwa, ou obeyí pa LAPERÈZ pinisyon. Anba lagras, ou obeyí pa LANMOU pou Bondye. Rezilta deyò a ka sanble menm, men motivasyon an konplètman diferan.\n\nYon timoun ki ranje chanm li pa laperèz pou yo pini l vs yon timoun ki ranje pa lanmou pou paran l — aksyon an menm, kè a diferan.",
          en: "No! The Law remains God's moral standard. Jesus didn't come to abolish the Law, but to fulfill it (Matthew 5:17). We are no longer UNDER the Law (it no longer condemns us), but we follow its principles out of love.\n\nThe difference: under the Law, we obey out of FEAR of punishment. Under grace, we obey out of LOVE for God. The outward result may look the same, but the motivation is completely different.\n\nA child who cleans their room out of fear of punishment vs a child who cleans out of love for their parents — the action is the same, the heart is different.",
        },
        verse: "Matthieu 5:17",
      },
    ],
    keyVerses: ["Galates 3:24", "Éphésiens 2:8-9", "Matthieu 5:17", "Romains 6:14"],
  },
  {
    slug: "apocalypse",
    title: { fr: "Les Prophéties de l'Apocalypse", ht: "Pwofesi Apokalips yo", en: "Revelation Prophecies" },
    description: { fr: "Les derniers temps expliqués simplement", ht: "Dènye tan yo eksplike tou senp", en: "End times explained simply" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-red-500 to-orange-600",
    duration: "10 min",
    difficulty: { fr: "Expert", ht: "Ekspè", en: "Expert" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Qu'est-ce que l'Apocalypse ?", ht: "Kisa Apokalips la ye ?", en: "What is Revelation?" },
        content: {
          fr: "Le mot 'Apocalypse' vient du grec 'apokalypsis' qui signifie 'révélation' ou 'dévoilement'. Ce n'est PAS un livre de terreur — c'est un livre de VICTOIRE. Il révèle comment Dieu triomphera définitivement du mal.\n\nÉcrit par l'apôtre Jean sur l'île de Patmos vers l'an 95, ce livre utilise beaucoup de symbolisme : des nombres (7 = perfection, 12 = peuple de Dieu), des couleurs (blanc = pureté, rouge = sang/guerre), et des créatures (agneau = Jésus, dragon = Satan).\n\nLe message central est simple : peu importe les difficultés, JÉSUS GAGNE À LA FIN.",
          ht: "Mo 'Apokalips' soti nan grèk 'apokalypsis' ki vle di 'revelasyon' oswa 'devwale'. Se PA yon liv laterè — se yon liv VIKTWA. Li revele kijan Bondye ap triyanfe definitivman sou mal la.\n\nApot Jan te ekri l sou zile Patmòs vè ane 95, liv sa a itilize anpil senbolism : chif (7 = pèfeksyon, 12 = pèp Bondye), koulè (blan = pirete, wouj = san/lagè), ak bèt (mouton = Jezi, dragon = Satan).\n\nMesaj santral la senp : kèlkeswa difikilte yo, JEZI GENYEN NAN FEN AN.",
          en: "The word 'Apocalypse' comes from the Greek 'apokalypsis' meaning 'revelation' or 'unveiling'. It is NOT a book of terror — it's a book of VICTORY. It reveals how God will definitively triumph over evil.\n\nWritten by the apostle John on the island of Patmos around 95 AD, this book uses much symbolism: numbers (7 = perfection, 12 = God's people), colors (white = purity, red = blood/war), and creatures (lamb = Jesus, dragon = Satan).\n\nThe central message is simple: no matter the difficulties, JESUS WINS IN THE END.",
        },
        verse: "Apocalypse 1:1",
      },
      {
        title: { fr: "Les 7 Églises", ht: "7 Legliz yo", en: "The 7 Churches" },
        content: {
          fr: "Les chapitres 2-3 contiennent des lettres à 7 églises réelles d'Asie Mineure. Chaque lettre contient un message pertinent pour nous aujourd'hui :\n\n• Éphèse — a perdu son premier amour\n• Smyrne — fidèle malgré la souffrance\n• Pergame — tolère de faux enseignements\n• Thyatire — tolère l'immoralité\n• Sardes — morte spirituellement malgré une bonne réputation\n• Philadelphie — fidèle avec peu de force\n• Laodicée — tiède, ni chaud ni froid\n\nÀ laquelle de ces églises ressemblez-vous ? C'est la question que Dieu nous pose.",
          ht: "Chapit 2-3 gen lèt bay 7 legliz reyèl nan Azi Minè. Chak lèt gen yon mesaj ki enpòtan pou nou jodi a :\n\n• Efèz — te pèdi premye lanmou li\n• Smirn — fidèl malgre soufrans\n• Pègam — tolere fo ansèyman\n• Tiyati — tolere immoralite\n• Sard — mouri espirityèlman malgre yon bon repitasyon\n• Filadelfi — fidèl ak ti kras fòs\n• Laodise — tyèd, ni cho ni frèt\n\nNan ki legliz sa yo ou sanble ? Se kesyon Bondye poze nou.",
          en: "Chapters 2-3 contain letters to 7 real churches in Asia Minor. Each letter contains a message relevant for us today:\n\n• Ephesus — lost its first love\n• Smyrna — faithful despite suffering\n• Pergamum — tolerates false teachings\n• Thyatira — tolerates immorality\n• Sardis — spiritually dead despite a good reputation\n• Philadelphia — faithful with little strength\n• Laodicea — lukewarm, neither hot nor cold\n\nWhich of these churches do you resemble? That's the question God asks us.",
        },
        verse: "Apocalypse 2-3",
      },
      {
        title: { fr: "La fin : Nouveau Ciel, Nouvelle Terre", ht: "Fen an : Nouvo Syèl, Nouvo Tè", en: "The End: New Heaven, New Earth" },
        content: {
          fr: "L'Apocalypse se termine par la plus belle promesse de la Bible : Dieu créera un nouveau ciel et une nouvelle terre. Plus de souffrance, plus de larmes, plus de mort.\n\n'Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu.' (Apocalypse 21:4)\n\nCe n'est pas la fin du monde — c'est le début du monde parfait que Dieu avait toujours voulu. Le jardin d'Éden restauré, mais en mieux. La relation brisée entre Dieu et l'humanité est complètement guérie.",
          ht: "Apokalips la fini ak pi bèl pwomès nan Bib la : Bondye ap kreye yon nouvo syèl ak yon nouvo tè. Pa gen soufrans ankò, pa gen dlo nan je ankò, pa gen lanmò ankò.\n\n'Li ap siye tout dlo nan je yo, lanmò p ap la ankò, pa gen chagren, ni rèl, ni doulè ankò, paske premye bagay yo disparèt.' (Apokalips 21:4)\n\nSe pa fen mond lan — se kòmansman mond pafè Bondye te toujou vle a. Jaden Edèn restore, men pi bon. Relasyon ki te kraze ant Bondye ak limanite konplètman geri.",
          en: "Revelation ends with the most beautiful promise in the Bible: God will create a new heaven and a new earth. No more suffering, no more tears, no more death.\n\n'He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away.' (Revelation 21:4)\n\nThis is not the end of the world — it's the beginning of the perfect world God always wanted. The Garden of Eden restored, but better. The broken relationship between God and humanity is completely healed.",
        },
        verse: "Apocalypse 21:4",
      },
    ],
    keyVerses: ["Apocalypse 1:1", "Apocalypse 21:4", "Apocalypse 22:20"],
  },
  {
    slug: "le-pardon",
    title: { fr: "Le Pardon", ht: "Padon", en: "Forgiveness" },
    description: { fr: "Pourquoi et comment pardonner — même l'impardonnable", ht: "Poukisa ak kijan pou padonnen — menm sa ki pa ka padone", en: "Why and how to forgive — even the unforgivable" },
    icon: "https://cdn-icons-png.flaticon.com/512/1216/1216575.png",
    color: "from-pink-500 to-rose-600",
    duration: "6 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Dieu nous a pardonnés en premier", ht: "Bondye te padonnen nou an premye", en: "God forgave us first" },
        content: {
          fr: "Le pardon commence avec Dieu. Alors que nous étions encore pécheurs, Christ est mort pour nous (Romains 5:8). Dieu ne nous a pas pardonnés parce que nous le méritions, mais parce qu'Il nous aime.\n\nSi Dieu, qui est parfait, peut pardonner nos péchés — des offenses contre un Dieu saint et infini — alors nous pouvons aussi pardonner les offenses que les autres commettent contre nous.\n\nLe pardon n'est pas un sentiment. C'est une décision. Vous pouvez choisir de pardonner même quand vos émotions crient le contraire.",
          ht: "Padon kòmanse ak Bondye. Pandan nou te toujou pechè, Kris te mouri pou nou (Womèn 5:8). Bondye pa t padonnen nou paske nou te merite l, men paske Li renmen nou.\n\nSi Bondye, ki pafè, ka padonnen peche nou yo — ofans kont yon Bondye sen e enfini — alò nou ka padonnen ofans lòt moun fè nou tou.\n\nPadon pa yon santiman. Se yon desizyon. Ou ka chwazi padonnen menm lè emosyon ou ap rele kontrè a.",
          en: "Forgiveness starts with God. While we were still sinners, Christ died for us (Romans 5:8). God didn't forgive us because we deserved it, but because He loves us.\n\nIf God, who is perfect, can forgive our sins — offenses against a holy and infinite God — then we can also forgive the offenses others commit against us.\n\nForgiveness is not a feeling. It's a decision. You can choose to forgive even when your emotions scream the opposite.",
        },
        verse: "Romains 5:8",
      },
      {
        title: { fr: "70 fois 7 fois", ht: "70 fwa 7 fwa", en: "70 times 7" },
        content: {
          fr: "Pierre a demandé à Jésus : 'Seigneur, combien de fois pardonnerai-je à mon frère ? Jusqu'à 7 fois ?' Jésus lui répondit : 'Je ne te dis pas jusqu'à 7 fois, mais jusqu'à 70 fois 7 fois.' (Matthieu 18:21-22)\n\n70 × 7 = 490 ? Non. Jésus ne donnait pas un nombre exact. Il disait : pardonne TOUJOURS, sans compter. Le pardon n'a pas de limite.\n\nCela ne veut pas dire accepter les abus ou ne pas se protéger. Le pardon, c'est libérer VOTRE cœur de l'amertume. Garder la rancune, c'est comme boire du poison et espérer que l'autre personne tombe malade.",
          ht: "Pyè te mande Jezi : 'Senyè, konbyen fwa m ap padonnen frè m nan ? Jiska 7 fwa ?' Jezi reponn li : 'Mwen pa di ou jiska 7 fwa, men jiska 70 fwa 7 fwa.' (Matye 18:21-22)\n\n70 × 7 = 490 ? Non. Jezi pa t bay yon chif egzak. Li t ap di : padonnen TOUJOU, san konte. Padon pa gen limit.\n\nSa pa vle di aksepte abi oswa pa pwoteje tèt ou. Padon, se libere KÈ OU de amètim. Kenbe rankin, se tankou bwè pwazon epi espere lòt moun nan tonbe malad.",
          en: "Peter asked Jesus: 'Lord, how many times shall I forgive my brother? Up to 7 times?' Jesus answered: 'I do not say to you up to 7 times, but up to 70 times 7.' (Matthew 18:21-22)\n\n70 × 7 = 490? No. Jesus wasn't giving an exact number. He was saying: forgive ALWAYS, without counting. Forgiveness has no limit.\n\nThis doesn't mean accepting abuse or not protecting yourself. Forgiveness is freeing YOUR heart from bitterness. Holding a grudge is like drinking poison and hoping the other person gets sick.",
        },
        verse: "Matthieu 18:21-22",
      },
    ],
    keyVerses: ["Romains 5:8", "Matthieu 18:21-22", "Colossiens 3:13", "Éphésiens 4:32"],
  },
  {
    slug: "la-priere",
    title: { fr: "La Puissance de la Prière", ht: "Pisans Lapriyè", en: "The Power of Prayer" },
    description: { fr: "Comment prier efficacement et voir des résultats", ht: "Kijan pou priye efikasman epi wè rezilta", en: "How to pray effectively and see results" },
    icon: "https://cdn-icons-png.flaticon.com/512/4305/4305512.png",
    color: "from-amber-500 to-yellow-600",
    duration: "7 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner" },
    youtubeId: "",
    sections: [
      {
        title: { fr: "Qu'est-ce que la prière ?", ht: "Kisa lapriyè ye ?", en: "What is prayer?" },
        content: {
          fr: "La prière n'est pas une récitation de mots religieux. C'est une CONVERSATION avec Dieu. Comme vous parlez à un ami, vous pouvez parler à Dieu — avec vos propres mots, dans votre propre langue, à n'importe quel moment.\n\nJésus a condamné ceux qui priaient pour être vus des autres (Matthieu 6:5). La vraie prière est sincère, humble et vient du cœur. Dieu ne cherche pas des mots parfaits — Il cherche un cœur sincère.\n\nVous n'avez pas besoin d'être dans une église pour prier. Priez en conduisant, en marchant, en travaillant. 'Priez sans cesse' (1 Thessaloniciens 5:17).",
          ht: "Lapriyè pa yon resitasyon mo relijye. Se yon KONVÈSASYON ak Bondye. Tankou ou pale ak yon zanmi, ou ka pale ak Bondye — ak pwòp mo ou, nan pwòp lang ou, nenpòt ki lè.\n\nJezi te kondane moun ki t ap priye pou lòt moun wè yo (Matye 6:5). Vrè lapriyè sensè, enb e soti nan kè. Bondye pa chèche mo pafè — Li chèche yon kè sensè.\n\nOu pa bezwen nan yon legliz pou priye. Priye pandan ou ap kondwi, mache, travay. 'Priye san rete' (1 Tesalonisyen 5:17).",
          en: "Prayer is not reciting religious words. It's a CONVERSATION with God. Just as you talk to a friend, you can talk to God — in your own words, in your own language, at any time.\n\nJesus condemned those who prayed to be seen by others (Matthew 6:5). True prayer is sincere, humble, and comes from the heart. God doesn't look for perfect words — He looks for a sincere heart.\n\nYou don't need to be in a church to pray. Pray while driving, walking, working. 'Pray without ceasing' (1 Thessalonians 5:17).",
        },
        verse: "1 Thessaloniciens 5:17",
      },
      {
        title: { fr: "Le modèle de Jésus : Le Notre Père", ht: "Modèl Jezi a : Notrè Pè a", en: "Jesus' model: The Lord's Prayer" },
        content: {
          fr: "Jésus nous a donné un modèle de prière (Matthieu 6:9-13). Ce n'est pas une formule à répéter mécaniquement, mais un guide pour structurer nos prières :\n\n1. ADORATION — 'Notre Père qui es aux cieux, que ton nom soit sanctifié'\n2. SOUMISSION — 'Que ton règne vienne, que ta volonté soit faite'\n3. DEMANDE — 'Donne-nous notre pain quotidien'\n4. PARDON — 'Pardonne-nous nos offenses comme nous pardonnons'\n5. PROTECTION — 'Ne nous induis pas en tentation, mais délivre-nous du mal'\n\nCommencez par louer Dieu, puis soumettez-vous à sa volonté, demandez vos besoins, demandez pardon, et demandez sa protection.",
          ht: "Jezi te ban nou yon modèl lapriyè (Matye 6:9-13). Se pa yon fòmil pou repete mekanikman, men yon gid pou estrikture lapriyè nou yo :\n\n1. ADORASYON — 'Papa nou ki nan syèl la, se pou non ou sen'\n2. SOUMISYON — 'Se pou wayòm ou vini, se pou volonte ou fèt'\n3. DEMANN — 'Ban nou pen nou bezwen jodi a'\n4. PADON — 'Padonnen peche nou tankou nou padonnen'\n5. PWOTEKSYON — 'Pa kite nou tonbe nan tantasyon, men delivre nou anba mal'\n\nKòmanse pa fè lwanj Bondye, apre sa soumèt ou a volonte l, mande sa ou bezwen, mande padon, epi mande pwoteksyon l.",
          en: "Jesus gave us a model prayer (Matthew 6:9-13). It's not a formula to repeat mechanically, but a guide to structure our prayers:\n\n1. WORSHIP — 'Our Father in heaven, hallowed be your name'\n2. SUBMISSION — 'Your kingdom come, your will be done'\n3. REQUEST — 'Give us this day our daily bread'\n4. FORGIVENESS — 'Forgive us our debts, as we forgive our debtors'\n5. PROTECTION — 'Lead us not into temptation, but deliver us from evil'\n\nStart by praising God, then submit to his will, ask for your needs, ask for forgiveness, and ask for his protection.",
        },
        verse: "Matthieu 6:9-13",
      },
    ],
    keyVerses: ["Matthieu 6:9-13", "1 Thessaloniciens 5:17", "Philippiens 4:6-7", "Jacques 5:16"],
  },
  {
    slug: "creation",
    title: { fr: "La Création", ht: "Kreyasyon an", en: "The Creation" },
    description: { fr: "Comment Dieu a créé le monde en 6 jours", ht: "Kijan Bondye te kreye mond lan nan 6 jou", en: "How God created the world in 6 days" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-emerald-500 to-green-600",
    duration: "8 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner" },
    youtubeId: "",
    sections: [
      { title: { fr: "Au commencement", ht: "Nan kòmansman", en: "In the beginning" }, content: { fr: "Au commencement, Dieu créa les cieux et la terre. La terre était informe et vide ; il y avait des ténèbres à la surface de l'abîme, et l'esprit de Dieu se mouvait au-dessus des eaux.\n\nDieu dit : Que la lumière soit ! Et la lumière fut. Dieu vit que la lumière était bonne ; et Dieu sépara la lumière d'avec les ténèbres. Ce fut le premier jour de la création — le début de tout ce qui existe.", ht: "Nan kòmansman, Bondye te kreye syèl la ak tè a. Tè a te san fòm e vid; te gen fènwa sou sifas abim nan, e lespri Bondye t ap plane sou dlo yo.\n\nBondye di : Se pou limyè fèt ! E limyè te fèt. Bondye wè limyè a te bon ; e Bondye separe limyè a ak fènwa a. Se te premye jou kreyasyon an.", en: "In the beginning, God created the heavens and the earth. The earth was without form and void; and darkness was on the face of the deep, and the Spirit of God was hovering over the face of the waters.\n\nGod said: Let there be light! And there was light. God saw that the light was good; and God separated the light from the darkness. This was the first day of creation." }, verse: "Genèse 1:1-5" },
      { title: { fr: "L'homme à l'image de Dieu", ht: "Moun nan imaj Bondye", en: "Man in God's image" }, content: { fr: "Dieu dit : Faisons l'homme à notre image, selon notre ressemblance. L'Éternel Dieu forma l'homme de la poussière de la terre, il souffla dans ses narines un souffle de vie et l'homme devint un être vivant.\n\nDieu créa l'homme différent de tout le reste de la création. L'homme a une âme, une conscience, la capacité d'aimer et de choisir. Être créé à l'image de Dieu signifie que nous avons une valeur infinie aux yeux de Dieu.", ht: "Bondye di : Ann fè moun nan imaj nou, dapre resanblans nou. Senyè Bondye te fòme moun nan ak pousyè tè a, li te soufle nan nen l yon souf lavi e moun nan te vin yon èt vivan.\n\nBondye te kreye moun nan diferan de tout lòt kreyasyon an. Moun gen yon nanm, yon konsyans, kapasite pou renmen ak chwazi.", en: "God said: Let us make man in our image, after our likeness. The Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living being.\n\nGod created man different from all the rest of creation. Man has a soul, a conscience, the ability to love and choose." }, verse: "Genèse 1:26-27" },
    ],
    keyVerses: ["Genèse 1:1", "Genèse 1:26-27", "Genèse 2:7"],
  },
  {
    slug: "abraham",
    title: { fr: "Abraham — Le Père de la Foi", ht: "Abraram — Papa Lafwa", en: "Abraham — Father of Faith" },
    description: { fr: "L'homme qui a cru Dieu contre toute espérance", ht: "Nonm ki te kwè Bondye kont tout esperans", en: "The man who believed God against all hope" },
    icon: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
    color: "from-amber-500 to-orange-600",
    duration: "9 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate" },
    youtubeId: "",
    sections: [
      { title: { fr: "L'appel d'Abraham", ht: "Apèl Abraram", en: "The call of Abraham" }, content: { fr: "L'Éternel dit à Abram : Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai. Je ferai de toi une grande nation, et je te bénirai.\n\nAbraham avait 75 ans quand Dieu l'a appelé à tout quitter — sa famille, sa terre, sa sécurité — pour aller vers un pays inconnu. C'est la définition même de la foi : obéir à Dieu sans voir la destination.", ht: "Senyè a di Abram : Ale kite peyi ou, fanmi ou, ak kay papa ou, pou ale nan peyi mwen pral montre ou a. M ap fè ou vin yon gwo nasyon, e m ap beni ou.\n\nAbraram te gen 75 an lè Bondye te rele l kite tout bagay — fanmi l, tè l, sekirite l — pou ale nan yon peyi li pa konnen.", en: "The Lord said to Abram: Go from your country, your people and your father's household to the land I will show you. I will make you into a great nation, and I will bless you.\n\nAbraham was 75 years old when God called him to leave everything — his family, his land, his security — to go to an unknown country." }, verse: "Genèse 12:1-3" },
      { title: { fr: "La promesse d'un fils", ht: "Pwomès yon pitit gason", en: "The promise of a son" }, content: { fr: "Dieu promit à Abraham un fils alors que Sara avait 90 ans et Abraham 100 ans. Humainement, c'était impossible. Mais Abraham crut en l'Éternel, et l'Éternel le lui imputa à justice.\n\nIsaac naquit — le fils de la promesse. Son nom signifie 'rire', car Sara avait ri quand Dieu avait annoncé sa naissance. Dieu transforme nos impossibilités en miracles.", ht: "Bondye te pwomèt Abraram yon pitit gason alòske Sara te gen 90 an e Abraram te gen 100 an. Nan je moun, sa te enposib. Men Abraram te kwè nan Senyè a, e Senyè a te konsidere sa kòm jistis.\n\nIzaak te fèt — pitit gason pwomès la. Non li vle di 'ri', paske Sara te ri lè Bondye te anonse nesans li.", en: "God promised Abraham a son when Sarah was 90 and Abraham was 100. Humanly, it was impossible. But Abraham believed the Lord, and he credited it to him as righteousness.\n\nIsaac was born — the son of promise." }, verse: "Genèse 15:6" },
    ],
    keyVerses: ["Genèse 12:1-3", "Genèse 15:6", "Hébreux 11:8"],
  },
  {
    slug: "moise-exode",
    title: { fr: "Moïse et l'Exode", ht: "Moyiz ak Egzòd la", en: "Moses and the Exodus" },
    description: { fr: "La libération du peuple de Dieu de l'esclavage", ht: "Liberasyon pèp Bondye a anba esklavaj", en: "The liberation of God's people from slavery" },
    icon: "https://cdn-icons-png.flaticon.com/512/3122/3122803.png",
    color: "from-red-500 to-rose-600",
    duration: "10 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate" },
    youtubeId: "",
    sections: [
      { title: { fr: "Le buisson ardent", ht: "Touf dife a", en: "The burning bush" }, content: { fr: "Moïse faisait paître le troupeau de son beau-père quand il vit un buisson en feu qui ne se consumait pas. Dieu l'appela du milieu du buisson : Moïse ! Moïse ! Ôte tes souliers de tes pieds, car le lieu sur lequel tu te tiens est une terre sainte.\n\nDieu dit : J'ai vu la souffrance de mon peuple en Égypte. Je t'envoie vers Pharaon pour faire sortir mon peuple. Moïse avait 80 ans — Dieu n'a pas de date limite pour nous utiliser.", ht: "Moyiz t ap fè mouton bopè l manje lè l te wè yon touf dife ki pa t ap boule nèt. Bondye te rele l nan mitan touf la : Moyiz ! Moyiz ! Retire soulye nan pye ou, paske kote ou kanpe a se yon tè ki sen.\n\nBondye di : Mwen wè soufrans pèp mwen an Lejip. M ap voye ou bò kote Farawon pou fè pèp mwen soti.", en: "Moses was tending his father-in-law's flock when he saw a bush on fire that was not consumed. God called to him from the bush: Moses! Moses! Take off your sandals, for you are standing on holy ground.\n\nGod said: I have seen the suffering of my people in Egypt. I am sending you to Pharaoh to bring my people out." }, verse: "Exode 3:1-10" },
      { title: { fr: "Les 10 plaies et la traversée", ht: "10 fleyo yo ak travèse a", en: "The 10 plagues and the crossing" }, content: { fr: "Pharaon refusa de libérer les Israélites. Dieu envoya 10 plaies sur l'Égypte : eau changée en sang, grenouilles, moustiques, mouches, peste, ulcères, grêle, sauterelles, ténèbres, et la mort des premiers-nés.\n\nAprès la 10ème plaie, Pharaon les laissa partir. Mais il changea d'avis et les poursuivit. Dieu ouvrit la mer Rouge — les Israélites passèrent à sec, et les eaux se refermèrent sur l'armée égyptienne. Dieu combat pour ceux qui lui font confiance.", ht: "Farawon te refize libere Izrayelit yo. Bondye te voye 10 fleyo sou Lejip : dlo chanje an san, krapo, moustik, mouch, maladi bèt, maleng, lagrèl, krikèt, fènwa, ak lanmò premye pitit yo.\n\nApre 10èm fleyo a, Farawon te kite yo ale. Men li te chanje lide e li te kouri dèyè yo. Bondye te ouvri Lanmè Wouj la — Izrayelit yo te pase sou tè sèk, e dlo a te fèmen sou lame ejipsyen an.", en: "Pharaoh refused to free the Israelites. God sent 10 plagues on Egypt. After the 10th plague, Pharaoh let them go. But he changed his mind and pursued them. God parted the Red Sea." }, verse: "Exode 14:21-22" },
    ],
    keyVerses: ["Exode 3:14", "Exode 14:21-22", "Exode 20:1-17"],
  },
  {
    slug: "10-commandements",
    title: { fr: "Les 10 Commandements", ht: "10 Kòmandman yo", en: "The 10 Commandments" },
    description: { fr: "La loi morale de Dieu pour l'humanité", ht: "Lwa moral Bondye pou limanite", en: "God's moral law for humanity" },
    icon: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-stone-600 to-stone-800",
    duration: "8 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner" },
    youtubeId: "",
    sections: [
      { title: { fr: "Les commandements envers Dieu", ht: "Kòmandman anvè Bondye", en: "Commandments toward God" }, content: { fr: "Les 4 premiers commandements concernent notre relation avec Dieu :\n\n1. Tu n'auras pas d'autres dieux devant ma face\n2. Tu ne te feras point d'image taillée\n3. Tu ne prendras point le nom de l'Éternel en vain\n4. Souviens-toi du jour du repos pour le sanctifier\n\nCes commandements nous enseignent que Dieu doit être premier dans notre vie. Pas l'argent, pas le travail, pas les relations — Dieu d'abord.", ht: "4 premye kòmandman yo konsène relasyon nou ak Bondye :\n\n1. Ou p ap gen lòt bondye devan fas mwen\n2. Ou p ap fè imaj taye\n3. Ou p ap pran non Senyè a an ven\n4. Sonje jou repo a pou sanktifye l", en: "The first 4 commandments concern our relationship with God:\n\n1. You shall have no other gods before me\n2. You shall not make idols\n3. You shall not take the name of the Lord in vain\n4. Remember the Sabbath day to keep it holy" }, verse: "Exode 20:1-11" },
      { title: { fr: "Les commandements envers les autres", ht: "Kòmandman anvè lòt moun", en: "Commandments toward others" }, content: { fr: "Les 6 derniers commandements concernent nos relations avec les autres :\n\n5. Honore ton père et ta mère\n6. Tu ne tueras point\n7. Tu ne commettras point d'adultère\n8. Tu ne déroberas point\n9. Tu ne porteras pas de faux témoignage\n10. Tu ne convoiteras point\n\nJésus a résumé tous ces commandements en deux : Aime Dieu de tout ton cœur, et aime ton prochain comme toi-même. L'amour est l'accomplissement de la loi.", ht: "6 dènye kòmandman yo konsène relasyon nou ak lòt moun :\n\n5. Onore papa ou ak manman ou\n6. Ou pa dwe touye\n7. Ou pa dwe fè adiltè\n8. Ou pa dwe vòlè\n9. Ou pa dwe bay fo temwayaj\n10. Ou pa dwe anvye sa lòt moun genyen", en: "The last 6 commandments concern our relationships with others:\n\n5. Honor your father and mother\n6. You shall not murder\n7. You shall not commit adultery\n8. You shall not steal\n9. You shall not bear false witness\n10. You shall not covet" }, verse: "Exode 20:12-17" },
    ],
    keyVerses: ["Exode 20:1-17", "Matthieu 22:37-40", "Romains 13:10"],
  },
  {
    slug: "david",
    title: { fr: "David — Un Homme selon le Cœur de Dieu", ht: "David — Yon Nonm dapre Kè Bondye", en: "David — A Man After God's Heart" },
    description: { fr: "Du berger au roi, une vie de foi et de repentance", ht: "Soti gadò rive wa, yon lavi lafwa ak repantans", en: "From shepherd to king, a life of faith and repentance" },
    icon: "https://cdn-icons-png.flaticon.com/512/1216/1216575.png",
    color: "from-yellow-500 to-amber-600",
    duration: "9 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate" },
    youtubeId: "",
    sections: [
      { title: { fr: "David et Goliath", ht: "David ak Golyat", en: "David and Goliath" }, content: { fr: "David était un jeune berger quand il affronta Goliath, un géant philistin de près de 3 mètres. Toute l'armée d'Israël tremblait de peur, mais David dit : Tu marches contre moi avec l'épée et la lance, mais moi je viens contre toi au nom de l'Éternel.\n\nAvec une fronde et une pierre, David tua Goliath. Cette histoire nous enseigne que la taille du problème n'a pas d'importance — ce qui compte, c'est la taille de notre Dieu.", ht: "David te yon jèn gadò lè l te fè fas ak Golyat, yon jeyan Filisten ki te prèske 3 mèt wotè. Tout lame Izrayèl la t ap tranble ak laperèz, men David di : Ou vin kont mwen ak epe ak lans, men mwen vin kont ou nan non Senyè a.\n\nAk yon fistibal ak yon wòch, David te touye Golyat.", en: "David was a young shepherd when he faced Goliath, a Philistine giant nearly 3 meters tall. All of Israel's army trembled with fear, but David said: You come against me with sword and spear, but I come against you in the name of the Lord.\n\nWith a sling and a stone, David killed Goliath." }, verse: "1 Samuel 17:45-47" },
      { title: { fr: "La chute et la repentance", ht: "Chit la ak repantans", en: "The fall and repentance" }, content: { fr: "David commit un terrible péché : il prit Bathshéba, la femme d'Urie, et fit tuer Urie. Le prophète Nathan le confronta. David ne se justifia pas — il dit simplement : J'ai péché contre l'Éternel.\n\nIl écrivit le Psaume 51 : O Dieu, aie pitié de moi. Crée en moi un cœur pur. David nous montre que même après une chute terrible, la repentance sincère ouvre la porte du pardon de Dieu. Dieu ne rejette jamais un cœur brisé.", ht: "David te fè yon gwo peche : li te pran Batcheba, madanm Iri, epi li te fè touye Iri. Pwofèt Natan te konfwonte l. David pa t chèche jistifye tèt li — li te senpleman di : Mwen peche kont Senyè a.\n\nLi te ekri Sòm 51 : O Bondye, gen pitye pou mwen. Kreye yon kè pwòp nan mwen.", en: "David committed a terrible sin: he took Bathsheba, Uriah's wife, and had Uriah killed. The prophet Nathan confronted him. David didn't justify himself — he simply said: I have sinned against the Lord.\n\nHe wrote Psalm 51: Have mercy on me, O God. Create in me a clean heart." }, verse: "Psaume 51:12" },
    ],
    keyVerses: ["1 Samuel 17:45", "Psaume 51:10-12", "Actes 13:22"],
  },
  {
    slug: "naissance-jesus",
    title: { fr: "La Naissance de Jésus", ht: "Nesans Jezi", en: "The Birth of Jesus" },
    description: { fr: "L'incarnation — Dieu devenu homme pour nous sauver", ht: "Enkarnasyon an — Bondye ki vin moun pou sove nou", en: "The incarnation — God became man to save us" },
    icon: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
    color: "from-sky-500 to-blue-600",
    duration: "7 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner" },
    youtubeId: "",
    sections: [
      { title: { fr: "L'annonce à Marie", ht: "Anons bay Mari", en: "The announcement to Mary" }, content: { fr: "L'ange Gabriel fut envoyé par Dieu à une jeune vierge nommée Marie, fiancée à Joseph. L'ange dit : Je te salue, toi à qui une grâce a été faite. Tu enfanteras un fils, et tu lui donneras le nom de Jésus. Il sera grand et sera appelé Fils du Très-Haut.\n\nMarie répondit : Je suis la servante du Seigneur ; qu'il me soit fait selon ta parole. Une jeune fille humble accepta le plan de Dieu qui allait changer l'histoire de l'humanité.", ht: "Zanj Gabriyèl te voye pa Bondye bay yon jèn vyèj ki rele Mari, ki te fianse ak Jozèf. Zanj lan di : Mwen salye ou, ou menm ki gen gras. Ou pral fè yon pitit gason, e ou pral rele l Jezi. Li pral gran e yo pral rele l Pitit Bondye ki Anwo a.", en: "The angel Gabriel was sent by God to a young virgin named Mary, engaged to Joseph. The angel said: Greetings, you who are highly favored. You will conceive and give birth to a son, and you are to call him Jesus." }, verse: "Luc 1:26-38" },
      { title: { fr: "La nuit à Bethléhem", ht: "Nuit nan Betleyèm", en: "The night in Bethlehem" }, content: { fr: "Joseph et Marie durent voyager à Bethléhem pour le recensement. Il n'y avait pas de place dans l'hôtellerie, alors Jésus naquit dans une étable et fut couché dans une crèche.\n\nLe Roi des rois est né dans l'endroit le plus humble. Des bergers furent les premiers avertis — pas des rois ou des prêtres, mais des travailleurs ordinaires. Dieu choisit les humbles. Une étoile guida des mages venus d'Orient qui apportèrent de l'or, de l'encens et de la myrrhe.", ht: "Jozèf ak Mari te dwe vwayaje Betleyèm pou resansman an. Pa t gen plas nan otèl la, alò Jezi te fèt nan yon etabl e yo te kouche l nan yon krèch.\n\nWa wa yo te fèt nan kote ki pi enb la. Gadò mouton yo te premye moun ki te konnen — pa wa oswa prèt, men travayè òdinè.", en: "Joseph and Mary had to travel to Bethlehem for the census. There was no room in the inn, so Jesus was born in a stable and laid in a manger.\n\nThe King of kings was born in the humblest place." }, verse: "Luc 2:6-7" },
    ],
    keyVerses: ["Luc 1:35", "Luc 2:6-7", "Matthieu 2:1-2", "Jean 1:14"],
  },
  {
    slug: "miracles-jesus",
    title: { fr: "Les Miracles de Jésus", ht: "Mirak Jezi yo", en: "The Miracles of Jesus" },
    description: { fr: "Les œuvres surnaturelles qui prouvent sa divinité", ht: "Zèv sinatirèl ki pwouve divinite l", en: "Supernatural works proving his divinity" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-teal-500 to-cyan-600",
    duration: "8 min",
    difficulty: { fr: "Débutant", ht: "Debitan", en: "Beginner" },
    youtubeId: "",
    sections: [
      { title: { fr: "Guérisons et délivrances", ht: "Gerizon ak delivrans", en: "Healings and deliverances" }, content: { fr: "Jésus guérit des aveugles, des lépreux, des paralytiques, des sourds. Il chassa des démons et ressuscita des morts. Chaque miracle avait un but : montrer la compassion de Dieu et prouver que Jésus est le Fils de Dieu.\n\nLa femme atteinte d'une perte de sang depuis 12 ans toucha le bord de son vêtement et fut guérie instantanément. Jésus dit : Ma fille, ta foi t'a sauvée. La foi est la clé qui active la puissance de Dieu.", ht: "Jezi te geri avèg, lepre, paralize, soud. Li te chase demon e li te resisite moun mouri. Chak mirak te gen yon bi : montre konpasyon Bondye e pwouve Jezi se Pitit Bondye.", en: "Jesus healed the blind, lepers, paralytics, deaf. He cast out demons and raised the dead. Each miracle had a purpose: showing God's compassion and proving Jesus is the Son of God." }, verse: "Marc 5:34" },
      { title: { fr: "La multiplication et la tempête", ht: "Miltiplikasyon ak tanpèt la", en: "The multiplication and the storm" }, content: { fr: "Jésus nourrit 5,000 hommes (plus les femmes et enfants) avec 5 pains et 2 poissons. Il reste 12 paniers de restes. Dieu peut multiplier le peu que nous avons.\n\nSur la mer de Galilée, une tempête violente menaçait de faire couler le bateau. Les disciples paniquaient. Jésus se leva et dit : Silence, tais-toi ! Et le vent et la mer obéirent. Même les forces de la nature sont soumises à sa parole.", ht: "Jezi te nouri 5,000 gason (plis fanm ak timoun) ak 5 pen ak 2 pwason. Te gen 12 panye ki rete. Bondye ka miltipliye ti kras nou genyen.\n\nSou lanmè Galile, yon gwo tanpèt te menase koule bato a. Disip yo te panike. Jezi te leve e di : Silans, pe la ! E van an ak lanmè a te obeyí.", en: "Jesus fed 5,000 men with 5 loaves and 2 fish. On the Sea of Galilee, a violent storm threatened to sink the boat. Jesus stood up and said: Peace, be still! And the wind and sea obeyed." }, verse: "Marc 4:39" },
    ],
    keyVerses: ["Marc 5:34", "Marc 4:39", "Jean 11:25-26", "Matthieu 14:21"],
  },
  {
    slug: "croix-resurrection",
    title: { fr: "La Croix et la Résurrection", ht: "Kwa a ak Rezireksyon an", en: "The Cross and Resurrection" },
    description: { fr: "Le cœur de l'Évangile — la mort et la victoire de Jésus", ht: "Kè Levanjil la — lanmò ak viktwa Jezi", en: "The heart of the Gospel — Jesus' death and victory" },
    icon: "https://cdn-icons-png.flaticon.com/512/1216/1216575.png",
    color: "from-rose-600 to-red-700",
    duration: "10 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced" },
    youtubeId: "",
    sections: [
      { title: { fr: "La crucifixion", ht: "Krisifiksyon an", en: "The crucifixion" }, content: { fr: "Jésus fut trahi par Judas, arrêté, jugé injustement, flagellé et crucifié. Sur la croix, il dit : Père, pardonne-leur, car ils ne savent ce qu'ils font. Même dans sa souffrance la plus extrême, Jésus pardonnait.\n\nÀ la 9ème heure, il cria : Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ? Puis il dit : Tout est accompli. Et il rendit l'esprit. Le voile du temple se déchira de haut en bas — l'accès à Dieu était ouvert pour tous.", ht: "Jezi te trayi pa Jida, arete, jije enjistman, bat ak kout fwèt e krisifye. Sou kwa a, li di : Papa, padonnen yo, paske yo pa konnen sa y ap fè.\n\nNan 9èm lè a, li rele : Bondye mwen, Bondye mwen, poukisa ou abandone m ? Apre li di : Tout bagay fini. E li te bay lespri l.", en: "Jesus was betrayed by Judas, arrested, unjustly tried, scourged and crucified. On the cross, he said: Father, forgive them, for they know not what they do.\n\nAt the 9th hour, he cried: My God, my God, why have you forsaken me? Then he said: It is finished." }, verse: "Jean 19:30" },
      { title: { fr: "Il est ressuscité !", ht: "Li resisite !", en: "He is risen!" }, content: { fr: "Le 3ème jour, des femmes allèrent au tombeau et le trouvèrent vide. Un ange dit : Il n'est point ici, il est ressuscité ! La résurrection est le fondement de notre foi. Si Christ n'est pas ressuscité, notre foi est vaine (1 Corinthiens 15:17).\n\nJésus apparut à ses disciples pendant 40 jours. Il mangea avec eux, leur parla, et leur donna la Grande Commission : Allez, faites de toutes les nations des disciples. Puis il monta au ciel avec la promesse de revenir.", ht: "3èm jou a, kèk fanm te ale nan tonbo a e yo te jwenn li vid. Yon zanj di : Li pa la, li resisite ! Rezireksyon an se fondasyon lafwa nou. Si Kris pa resisite, lafwa nou initil (1 Korentyen 15:17).\n\nJezi te parèt bay disip li yo pandan 40 jou.", en: "On the 3rd day, women went to the tomb and found it empty. An angel said: He is not here, he is risen! The resurrection is the foundation of our faith.\n\nJesus appeared to his disciples for 40 days, then ascended to heaven with the promise to return." }, verse: "Matthieu 28:6" },
    ],
    keyVerses: ["Jean 19:30", "Matthieu 28:6", "1 Corinthiens 15:17", "Romains 6:9"],
  },
  {
    slug: "saint-esprit-pentecote",
    title: { fr: "Le Saint-Esprit et la Pentecôte", ht: "Sentespri a ak Lapannkòt", en: "The Holy Spirit and Pentecost" },
    description: { fr: "La puissance de Dieu pour l'Église aujourd'hui", ht: "Pisans Bondye pou Legliz jodi a", en: "God's power for the Church today" },
    icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-orange-500 to-red-500",
    duration: "8 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced" },
    youtubeId: "",
    sections: [
      { title: { fr: "La promesse du Père", ht: "Pwomès Papa a", en: "The Father's promise" }, content: { fr: "Avant de monter au ciel, Jésus dit à ses disciples : Vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins jusqu'aux extrémités de la terre.\n\nLes 120 disciples attendirent dans la chambre haute pendant 10 jours, priant d'un commun accord. Le jour de la Pentecôte, un bruit comme un vent violent remplit la maison. Des langues de feu apparurent et se posèrent sur chacun d'eux. Ils furent tous remplis du Saint-Esprit.", ht: "Anvan li te monte nan syèl, Jezi te di disip li yo : Nou pral resevwa yon pisans, Sentespri a ap vin sou nou, e nou pral temwen m jiska bout tè a.\n\n120 disip yo te tann nan chanm anwo a pandan 10 jou, yo t ap priye ansanm. Jou Lapannkòt la, yon bri tankou yon gwo van te ranpli kay la.", en: "Before ascending to heaven, Jesus told his disciples: You will receive power when the Holy Spirit comes on you, and you will be my witnesses to the ends of the earth.\n\nThe 120 disciples waited in the upper room for 10 days. On the day of Pentecost, a sound like a mighty wind filled the house." }, verse: "Actes 1:8" },
      { title: { fr: "Les dons de l'Esprit", ht: "Don Lespri a", en: "Gifts of the Spirit" }, content: { fr: "Le Saint-Esprit accorde des dons spirituels aux croyants pour édifier l'Église : parole de sagesse, parole de connaissance, foi, guérison, miracles, prophétie, discernement des esprits, diversité des langues, interprétation.\n\nChaque croyant a au moins un don. Ces dons ne sont pas pour notre gloire personnelle, mais pour servir les autres et glorifier Dieu. Le plus grand de tous les dons reste l'amour (1 Corinthiens 13).", ht: "Sentespri a bay kwayan yo don espirityèl pou edifye Legliz la : pawòl sajès, pawòl konesans, lafwa, gerizon, mirak, pwofesi, disèneman lespri, divèsite lang, entèpretasyon.\n\nChak kwayan gen omwen yon don. Don sa yo pa pou glwa pèsonèl nou, men pou sèvi lòt moun e glorifye Bondye.", en: "The Holy Spirit gives spiritual gifts to believers to build up the Church: wisdom, knowledge, faith, healing, miracles, prophecy, discernment, tongues, interpretation.\n\nEvery believer has at least one gift. These gifts are not for personal glory, but to serve others and glorify God." }, verse: "1 Corinthiens 12:7-11" },
    ],
    keyVerses: ["Actes 1:8", "Actes 2:1-4", "1 Corinthiens 12:7-11", "Galates 5:22-23"],
  },
  {
    slug: "lettres-paul",
    title: { fr: "Les Lettres de Paul", ht: "Lèt Pòl yo", en: "Paul's Letters" },
    description: { fr: "Les fondements doctrinaux de la foi chrétienne", ht: "Fondasyon doktrin lafwa kretyen an", en: "The doctrinal foundations of Christian faith" },
    icon: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-indigo-500 to-blue-600",
    duration: "9 min",
    difficulty: { fr: "Avancé", ht: "Avanse", en: "Advanced" },
    youtubeId: "",
    sections: [
      { title: { fr: "Qui était Paul ?", ht: "Ki moun Pòl te ye ?", en: "Who was Paul?" }, content: { fr: "Saul de Tarse était un pharisien zélé qui persécutait les chrétiens. Sur le chemin de Damas, Jésus lui apparut dans une lumière éblouissante : Saul, Saul, pourquoi me persécutes-tu ? Ce persécuteur devint le plus grand apôtre de l'histoire.\n\nPaul écrivit 13 des 27 livres du Nouveau Testament. Il fonda des églises dans tout le monde romain, souffrit la prison, les naufrages, les coups — tout pour l'Évangile. Sa conversion prouve que personne n'est trop loin pour Dieu.", ht: "Sol de Tars te yon farizyen zele ki t ap pèsekite kretyen yo. Sou chemen Damas, Jezi te parèt ba li nan yon limyè eblwiyan : Sol, Sol, poukisa w ap pèsekite m ? Pèsekitè sa a te vin pi gwo apot nan istwa a.\n\nPòl te ekri 13 nan 27 liv Nouvo Testaman an.", en: "Saul of Tarsus was a zealous Pharisee who persecuted Christians. On the road to Damascus, Jesus appeared to him in a blinding light: Saul, Saul, why do you persecute me? This persecutor became the greatest apostle in history.\n\nPaul wrote 13 of the 27 books of the New Testament." }, verse: "Actes 9:3-6" },
      { title: { fr: "L'Épître aux Romains — Le salut", ht: "Lèt bay Women yo — Delivrans", en: "Romans — Salvation" }, content: { fr: "L'Épître aux Romains est considérée comme le document le plus important du christianisme après les Évangiles. Paul y explique :\n\nTous ont péché et sont privés de la gloire de Dieu (3:23). Le salaire du péché, c'est la mort ; mais le don gratuit de Dieu, c'est la vie éternelle en Jésus-Christ (6:23). Il n'y a maintenant aucune condamnation pour ceux qui sont en Jésus-Christ (8:1).\n\nC'est le résumé complet de l'Évangile en un livre.", ht: "Lèt bay Women yo konsidere kòm dokiman ki pi enpòtan nan krisyanis apre Evanjil yo. Pòl eksplike :\n\nTout moun peche e yo pa gen glwa Bondye (3:23). Salè peche a se lanmò ; men kado gratis Bondye a se lavi etènèl nan Jezi Kris (6:23).", en: "The Epistle to the Romans is considered the most important document of Christianity after the Gospels. Paul explains:\n\nAll have sinned and fall short of the glory of God (3:23). The wages of sin is death, but the gift of God is eternal life in Christ Jesus (6:23)." }, verse: "Romains 8:1" },
    ],
    keyVerses: ["Actes 9:3-6", "Romains 3:23", "Romains 6:23", "Romains 8:1", "Romains 8:28"],
  },
  {
    slug: "eglise-primitive",
    title: { fr: "L'Église Primitive", ht: "Legliz Primitif la", en: "The Early Church" },
    description: { fr: "Comment les premiers chrétiens vivaient et servaient Dieu", ht: "Kijan premye kretyen yo te viv e sèvi Bondye", en: "How the first Christians lived and served God" },
    icon: "https://cdn-icons-png.flaticon.com/512/1533/1533908.png",
    color: "from-lime-500 to-green-600",
    duration: "7 min",
    difficulty: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate" },
    youtubeId: "",
    sections: [
      { title: { fr: "La vie communautaire", ht: "Lavi kominotè", en: "Community life" }, content: { fr: "Les premiers chrétiens persévéraient dans l'enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain et dans les prières. Tous ceux qui croyaient étaient ensemble et avaient tout en commun.\n\nIls vendaient leurs propriétés pour aider ceux qui étaient dans le besoin. Ils se réunissaient chaque jour dans le temple et rompaient le pain dans les maisons. Le Seigneur ajoutait chaque jour à l'Église ceux qui étaient sauvés. C'est le modèle de l'Église que Dieu désire.", ht: "Premye kretyen yo te pèsevere nan ansèyman apot yo, nan kominyon fratènèl, nan kase pen an ak nan lapriyè. Tout moun ki te kwè te ansanm e te gen tout bagay an komen.\n\nYo te vann pwopriyete yo pou ede moun ki nan bezwen.", en: "The first Christians devoted themselves to the apostles' teaching, fellowship, breaking of bread and prayer. All the believers were together and had everything in common.\n\nThey sold their possessions to help those in need." }, verse: "Actes 2:42-47" },
    ],
    keyVerses: ["Actes 2:42-47", "Actes 4:32-35"],
  },
];
