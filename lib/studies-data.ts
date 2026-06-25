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
    icon: "🔺",
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
    icon: "⚖️",
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
    icon: "🔥",
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
    icon: "💝",
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
    icon: "🙏",
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
];
