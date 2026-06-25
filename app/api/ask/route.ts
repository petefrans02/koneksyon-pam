import { NextRequest } from "next/server";

const BIBLE_KNOWLEDGE: Record<string, string> = {
  trinite: "La Trinité enseigne qu'il y a un seul Dieu en trois personnes : le Père, le Fils (Jésus), et le Saint-Esprit. Chaque personne est pleinement Dieu, mais il n'y a qu'un seul Dieu. Références : Matthieu 28:19, 2 Corinthiens 13:13, Jean 1:1.",
  grace: "La grâce est le don gratuit de Dieu. Nous sommes sauvés par la grâce, par le moyen de la foi, et non par les œuvres (Éphésiens 2:8-9). La Loi nous montre notre péché, la grâce nous en libère.",
  pardon: "Dieu nous pardonne gratuitement en Christ. Jésus a dit de pardonner 70 fois 7 fois (Matthieu 18:22). Le pardon est une décision, pas un sentiment. Il nous libère de l'amertume.",
  priere: "La prière est une conversation avec Dieu. Jésus nous a donné le modèle du Notre Père (Matthieu 6:9-13). Priez sans cesse (1 Thessaloniciens 5:17). La prière fervente du juste a une grande efficacité (Jacques 5:16).",
  apocalypse: "L'Apocalypse signifie 'révélation'. C'est un livre de victoire, pas de terreur. Le message central : Jésus gagne à la fin. Dieu créera un nouveau ciel et une nouvelle terre (Apocalypse 21:1-4).",
  saint_esprit: "Le Saint-Esprit est la troisième personne de la Trinité. Il guide, console, enseigne et donne la puissance aux croyants (Actes 1:8). Il produit des fruits : amour, joie, paix, patience, bonté (Galates 5:22-23).",
  foi: "La foi est l'assurance des choses qu'on espère et la démonstration de celles qu'on ne voit pas (Hébreux 11:1). Sans la foi, il est impossible d'être agréable à Dieu (Hébreux 11:6).",
  salut: "Le salut est un don gratuit de Dieu par la foi en Jésus-Christ. 'Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle' (Jean 3:16).",
  bapteme: "Le baptême est un acte d'obéissance qui symbolise la mort et la résurrection avec Christ (Romains 6:4). C'est un témoignage public de la foi.",
  peche: "Le péché est la transgression de la loi de Dieu. Tous ont péché (Romains 3:23). Mais le sang de Jésus purifie de tout péché (1 Jean 1:7). La repentance ouvre la porte du pardon.",
};

function findAnswer(question: string, studyContent: string, lang: string): string {
  const q = question.toLowerCase();

  for (const [key, answer] of Object.entries(BIBLE_KNOWLEDGE)) {
    if (q.includes(key) || q.includes(key.replace("_", " "))) {
      return answer;
    }
  }

  if (q.includes("pourquoi") || q.includes("poukisa") || q.includes("why")) {
    return lang === "fr"
      ? `C'est une excellente question ! Voici ce que l'étude nous enseigne à ce sujet :\n\n${studyContent.slice(0, 300)}...\n\nLa Bible nous rappelle que les voies de Dieu sont au-dessus de nos voies (Ésaïe 55:8-9). Continuez à chercher dans la Parole pour approfondir votre compréhension.`
      : lang === "ht"
      ? `Se yon ekselan kesyon ! Men sa etid la anseye nou sou sa :\n\n${studyContent.slice(0, 300)}...\n\nBib la raple nou ke chemen Bondye pi wo pase chemen nou (Ezayi 55:8-9). Kontinye chèche nan Pawòl la pou apwofondi konpreyansyon ou.`
      : `That's an excellent question! Here's what the study teaches us about this:\n\n${studyContent.slice(0, 300)}...\n\nThe Bible reminds us that God's ways are higher than our ways (Isaiah 55:8-9). Keep searching the Word to deepen your understanding.`;
  }

  if (q.includes("comment") || q.includes("kijan") || q.includes("how")) {
    return lang === "fr"
      ? `Bonne question pratique ! La Bible nous guide :\n\n1. Commencez par la prière — demandez à Dieu de vous éclairer\n2. Lisez les versets clés mentionnés dans cette étude\n3. Méditez sur ce que le texte signifie pour votre vie\n4. Mettez en pratique ce que vous avez appris\n\n'Mettez en pratique la parole, et ne vous bornez pas à l'écouter' (Jacques 1:22)`
      : lang === "ht"
      ? `Bon kesyon pratik ! Bib la gide nou :\n\n1. Kòmanse pa lapriyè — mande Bondye klere ou\n2. Li vèsè kle ki mansyone nan etid sa a\n3. Medite sou sa tèks la vle di pou lavi ou\n4. Mete an pratik sa ou aprann\n\n'Mete pawòl la an pratik, pa sèlman koute l' (Jak 1:22)`
      : `Good practical question! The Bible guides us:\n\n1. Start with prayer — ask God to enlighten you\n2. Read the key verses mentioned in this study\n3. Meditate on what the text means for your life\n4. Put into practice what you've learned\n\n'Be doers of the word, and not hearers only' (James 1:22)`;
  }

  return lang === "fr"
    ? `Merci pour votre question ! Voici ce que je peux partager :\n\nCette question touche au cœur de notre étude sur "${question}". La Bible nous invite à chercher la vérité avec un cœur humble.\n\n'Demandez et l'on vous donnera, cherchez et vous trouverez, frappez et l'on vous ouvrira.' (Matthieu 7:7)\n\nJe vous encourage à relire les sections de cette étude et à prier pour que Dieu vous éclaire davantage.`
    : lang === "ht"
    ? `Mèsi pou kesyon ou ! Men sa mwen ka pataje :\n\nKesyon sa a touche kè etid nou an. Bib la envite nou chèche verite ak yon kè enb.\n\n'Mande e y ap ba ou, chèche e w ap jwenn, frape e y ap ouvri pou ou.' (Matye 7:7)\n\nMwen ankouraje ou reli seksyon etid sa a epi priye pou Bondye klere ou plis.`
    : `Thank you for your question! Here's what I can share:\n\nThis question touches the heart of our study. The Bible invites us to seek truth with a humble heart.\n\n'Ask and it will be given to you, seek and you will find, knock and it will be opened to you.' (Matthew 7:7)\n\nI encourage you to re-read the sections of this study and pray for God to enlighten you further.`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, studyTitle, studyContent, lang } = body;

  if (!question) {
    return Response.json({ error: "Missing question" }, { status: 400 });
  }

  const answer = findAnswer(question, studyContent || "", lang || "fr");
  return Response.json({ answer });
}
