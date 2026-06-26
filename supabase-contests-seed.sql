-- =============================================
-- CONCOURS BIBLIQUES — Koneksyon Pam
-- À coller dans Supabase SQL Editor → Run
-- =============================================

-- Nettoyer les anciens concours de test (optionnel)
-- DELETE FROM contest_questions WHERE contest_id IN (SELECT id FROM contests);
-- DELETE FROM contests;

-- =============================================
-- CONCOURS 1 — ACTIF (inscriptions ouvertes)
-- =============================================
WITH c1 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'Grand Défi Biblique — Édition Afrique',
    'Le premier grand concours biblique ouvert à tous les croyants d''Afrique et de la diaspora. Cinq questions, un seul champion. Le public vote pour son favori.',
    'upcoming', 12, 0
  ) RETURNING id
)
INSERT INTO contest_questions
  (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'Qui est le premier roi d''Israël ?',
  'Ki moun ki te premye wa Izrayèl la ?',
  'Who was the first king of Israel?',
  '["David","Salomon","Saül","Samuel"]',
  '["David","Salomon","Sòl","Samyèl"]',
  '["David","Solomon","Saul","Samuel"]',
  2, '1 Samuel 10:1', 0, 30
FROM c1
UNION ALL SELECT id,
  'Dans quel pays Moïse est-il né ?',
  'Nan ki peyi Moyiz te fèt ?',
  'In which country was Moses born?',
  '["Israël","Éthiopie","Canaan","Égypte"]',
  '["Izrayèl","Etyopi","Kanan","Ejip"]',
  '["Israel","Ethiopia","Canaan","Egypt"]',
  3, 'Exode 2:1-2', 1, 30
FROM c1
UNION ALL SELECT id,
  'Combien de livres compte l''Ancien Testament ?',
  'Konbyen liv ki genyen nan Ansyen Testaman an ?',
  'How many books are in the Old Testament?',
  '["27 livres","36 livres","39 livres","46 livres"]',
  '["27 liv","36 liv","39 liv","46 liv"]',
  '["27 books","36 books","39 books","46 books"]',
  2, 'Canon biblique', 2, 30
FROM c1
UNION ALL SELECT id,
  'Quelle est la rivière dans laquelle Jésus a été baptisé ?',
  'Ki rivyè kote yo te batize Jezi a ?',
  'In which river was Jesus baptized?',
  '["Le Nil","Le Tigre","Le Jourdain","L''Euphrate"]',
  '["Nil la","Tig la","Jouden an","Efrat la"]',
  '["The Nile","The Tigris","The Jordan","The Euphrates"]',
  2, 'Matthieu 3:13', 3, 30
FROM c1
UNION ALL SELECT id,
  'Quel apôtre a renié Jésus trois fois ?',
  'Ki apòt ki te nye Jezi twa fwa ?',
  'Which apostle denied Jesus three times?',
  '["Jean","André","Thomas","Pierre"]',
  '["Jan","Andre","Toma","Pyè"]',
  '["John","Andrew","Thomas","Peter"]',
  3, 'Luc 22:61', 4, 30
FROM c1
UNION ALL SELECT id,
  'Qui a écrit la majorité des épîtres du Nouveau Testament ?',
  'Ki moun ki ekri majorite epît Nouvo Testaman an ?',
  'Who wrote the majority of the New Testament epistles?',
  '["Pierre","Jean","Paul","Jacques"]',
  '["Pyè","Jan","Pòl","Jak"]',
  '["Peter","John","Paul","James"]',
  2, 'Épîtres de Paul', 5, 30
FROM c1
UNION ALL SELECT id,
  'Dans quelle mer Pharaon et son armée se sont-ils noyés ?',
  'Nan ki lanmè Farawon ak lame li a te nwaye ?',
  'In which sea did Pharaoh and his army drown?',
  '["La mer Morte","La mer Rouge","La mer Méditerranée","La mer Noire"]',
  '["Lanmè Mouri a","Lanmè Wouj la","Lanmè Mediterane a","Lanmè Nwa a"]',
  '["The Dead Sea","The Red Sea","The Mediterranean Sea","The Black Sea"]',
  1, 'Exode 14:28', 6, 30
FROM c1;

-- =============================================
-- CONCOURS 2 — À VENIR
-- =============================================
WITH c2 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'Les Prophètes de l''Afrique Biblique',
    'L''Afrique dans la Bible — de l''Égypte à l''Éthiopie, de Cyrène à Carthage. Un concours sur les personnages africains et les nations africaines dans les Écritures.',
    'upcoming', 10, 0
  ) RETURNING id
)
INSERT INTO contest_questions
  (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'Quel personnage biblique était éthiopien et a reçu le baptême de Philippe ?',
  'Ki pèsonaj biblik ki te etopyen epi ki te resevwa batèm Filip la ?',
  'Which biblical figure was Ethiopian and received baptism from Philip?',
  '["Nicodème","L''eunuque éthiopien","Simon de Cyrène","Cornéille"]',
  '["Nikodèm","Ennik etopyen an","Simon Sirenyen","Konèy"]',
  '["Nicodemus","The Ethiopian eunuch","Simon of Cyrene","Cornelius"]',
  1, 'Actes 8:27-38', 0, 30
FROM c2
UNION ALL SELECT id,
  'Quel homme d''Afrique du Nord a aidé Jésus à porter sa croix ?',
  'Ki nonm nan Afrik di Nò ki te ede Jezi pote kwa li a ?',
  'Which man from North Africa helped Jesus carry his cross?',
  '["Barnabas","Simon de Cyrène","Apollos","Lucius"]',
  '["Barnabas","Simon Sirenyen","Apòlos","Lisyis"]',
  '["Barnabas","Simon of Cyrene","Apollos","Lucius"]',
  1, 'Matthieu 27:32', 1, 30
FROM c2
UNION ALL SELECT id,
  'La reine de Saba qui rendit visite à Salomon venait de quel pays africain ?',
  'Renn Seba ki te vizite Salomon an te soti nan ki peyi afiken ?',
  'The Queen of Sheba who visited Solomon came from which African country?',
  '["Le Soudan","La Somalie","L''Éthiopie","L''Égypte"]',
  '["Soudan","Somali","Etyopi","Ejip"]',
  '["Sudan","Somalia","Ethiopia","Egypt"]',
  2, '1 Rois 10:1', 2, 30
FROM c2
UNION ALL SELECT id,
  'Où Joseph, fils de Jacob, a-t-il passé la majorité de sa vie adulte ?',
  'Ki kote Jozèf, pitit Jakòb, te pase majorite lavi adilt li a ?',
  'Where did Joseph, son of Jacob, spend most of his adult life?',
  '["À Canaan","En Babylonie","En Égypte","En Assyrie"]',
  '["Nan Kanan","Nan Babilòn","Nan Ejip","Nan Asiri"]',
  '["In Canaan","In Babylon","In Egypt","In Assyria"]',
  2, 'Genèse 37-50', 3, 30
FROM c2
UNION ALL SELECT id,
  'Quelle église africaine des premiers siècles est mentionnée comme ayant des prophètes et docteurs ?',
  'Ki legliz afiken nan premye syèk yo ki mansyone kòm gen pwofèt ak doktè ?',
  'Which early African church is mentioned as having prophets and teachers?',
  '["L''église de Rome","L''église d''Alexandrie","L''église d''Antioche","L''église de Carthage"]',
  '["Legliz Wòm","Legliz Aleksand","Legliz Antiyòch","Legliz Kartaj"]',
  '["The church of Rome","The church of Alexandria","The church of Antioch","The church of Carthage"]',
  2, 'Actes 13:1', 4, 30
FROM c2;

-- =============================================
-- CONCOURS 3 — À VENIR
-- =============================================
WITH c3 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'Le Livre de Daniel — Foi sous Pression',
    'Daniel et ses amis ont vécu sous la pression d''un empire étranger. Leur foi reste un modèle pour tous les chrétiens qui vivent dans un monde hostile.',
    'upcoming', 10, 0
  ) RETURNING id
)
INSERT INTO contest_questions
  (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'Combien d''amis Daniel avait-il dans la cour de Babylone ?',
  'Konbyen zanmi Daniel te genyen nan lakou Babilon an ?',
  'How many friends did Daniel have in the court of Babylon?',
  '["1","2","3","4"]',
  '["1","2","3","4"]',
  '["1","2","3","4"]',
  2, 'Daniel 1:6', 0, 30
FROM c3
UNION ALL SELECT id,
  'Comment s''appelait le roi qui jeta Daniel dans la fosse aux lions ?',
  'Ki non wa ki te jete Daniel nan fose lyon yo a ?',
  'What was the name of the king who threw Daniel into the lions'' den?',
  '["Nabuchodonosor","Balthazar","Darius","Cyrus"]',
  '["Nabikodonosò","Baltazà","Dariyis","Sirus"]',
  '["Nebuchadnezzar","Belshazzar","Darius","Cyrus"]',
  2, 'Daniel 6:17', 1, 30
FROM c3
UNION ALL SELECT id,
  'Quel était le nom hébreu de l''ami de Daniel connu sous le nom de Shadrak ?',
  'Ki te non ebre zanmi Daniel yo te rele Chadrak la ?',
  'What was the Hebrew name of Daniel''s friend known as Shadrach?',
  '["Hanania","Misaël","Azaria","Éléazar"]',
  '["Ananya","Mizayèl","Azarya","Eleazà"]',
  '["Hananiah","Mishael","Azariah","Eleazar"]',
  0, 'Daniel 1:6-7', 2, 30
FROM c3
UNION ALL SELECT id,
  'Dans la fournaise ardente, combien de personnes les gardes ont-ils vu marcher ?',
  'Nan founo ki te boule a, konbyen moun gadyen yo te wè ap mache ?',
  'In the fiery furnace, how many people did the guards see walking?',
  '["2","3","4","5"]',
  '["2","3","4","5"]',
  '["2","3","4","5"]',
  2, 'Daniel 3:25', 3, 30
FROM c3
UNION ALL SELECT id,
  'Combien de fois par jour Daniel priait-il, même sous la loi qui l''interdisait ?',
  'Konbyen fwa pa jou Daniel te priye, menm anba lwa ki te entèdi li a ?',
  'How many times a day did Daniel pray, even under the law that forbade it?',
  '["1 fois","2 fois","3 fois","7 fois"]',
  '["1 fwa","2 fwa","3 fwa","7 fwa"]',
  '["1 time","2 times","3 times","7 times"]',
  2, 'Daniel 6:11', 4, 30
FROM c3;

-- =============================================
-- CONCOURS 4 — TERMINÉ
-- =============================================
WITH c4 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'La Création et les Origines',
    'Un défi biblique sur les premiers chapitres de la Genèse — la création du monde, Adam et Ève, et les récits fondateurs.',
    'completed', 10, 4
  ) RETURNING id
)
INSERT INTO contest_questions
  (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'En combien de jours Dieu a-t-il créé les cieux et la terre ?',
  'Nan konbyen jou Bondye te kreye syèl la ak tè a ?',
  'In how many days did God create the heavens and the earth?',
  '["3 jours","5 jours","6 jours","7 jours"]',
  '["3 jou","5 jou","6 jou","7 jou"]',
  '["3 days","5 days","6 days","7 days"]',
  2, 'Genèse 1', 0, 30
FROM c4
UNION ALL SELECT id,
  'Quel est le nom du premier fils de Adam et Ève ?',
  'Ki non premye pitit gason Adam ak Èv la ?',
  'What is the name of the first son of Adam and Eve?',
  '["Abel","Seth","Caïn","Énoch"]',
  '["Abel","Set","Kayen","Enòk"]',
  '["Abel","Seth","Cain","Enoch"]',
  2, 'Genèse 4:1', 1, 30
FROM c4
UNION ALL SELECT id,
  'Combien de personnes Noé a-t-il embarqué dans l''arche avec lui ?',
  'Konbyen moun Noé te pote nan bato a avèk li ?',
  'How many people did Noah bring into the ark with him?',
  '["5 personnes","7 personnes","8 personnes","12 personnes"]',
  '["5 moun","7 moun","8 moun","12 moun"]',
  '["5 people","7 people","8 people","12 people"]',
  2, 'Genèse 7:13', 2, 30
FROM c4
UNION ALL SELECT id,
  'Quelle est la durée de la pluie lors du déluge ?',
  'Konbyen tan lapli a te tonbe pandan delij la ?',
  'How long did it rain during the flood?',
  '["20 jours et 20 nuits","30 jours et 30 nuits","40 jours et 40 nuits","50 jours et 50 nuits"]',
  '["20 jou ak 20 nwit","30 jou ak 30 nwit","40 jou ak 40 nwit","50 jou ak 50 nwit"]',
  '["20 days and 20 nights","30 days and 30 nights","40 days and 40 nights","50 days and 50 nights"]',
  2, 'Genèse 7:12', 3, 30
FROM c4
UNION ALL SELECT id,
  'Quel signe Dieu a-t-il donné à Noé comme alliance après le déluge ?',
  'Ki siy Bondye te ba Noe kòm alyans apre delij la ?',
  'What sign did God give to Noah as a covenant after the flood?',
  '["Une étoile","Un arc-en-ciel","Une colombe","Un olivier"]',
  '["Yon zetwal","Yon lakansyèl","Yon pijon","Yon olivye"]',
  '["A star","A rainbow","A dove","An olive tree"]',
  1, 'Genèse 9:13', 4, 30
FROM c4;

-- =============================================
-- CONCOURS 5 — TERMINÉ
-- =============================================
WITH c5 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'La Vie de Jésus',
    'Des questions sur la vie, les miracles, les enseignements et la résurrection de Jésus-Christ à travers les quatre Évangiles.',
    'completed', 10, 4
  ) RETURNING id
)
INSERT INTO contest_questions
  (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'Dans quelle ville Jésus est-il né ?',
  'Nan ki vil Jezi te fèt ?',
  'In which city was Jesus born?',
  '["Nazareth","Jérusalem","Bethléem","Hébron"]',
  '["Nazarèt","Jerizalèm","Betleyèm","Ebwon"]',
  '["Nazareth","Jerusalem","Bethlehem","Hebron"]',
  2, 'Luc 2:4-7', 0, 30
FROM c5
UNION ALL SELECT id,
  'Quel a été le premier miracle de Jésus ?',
  'Ki te premye mirak Jezi a ?',
  'What was the first miracle of Jesus?',
  '["Guérir un aveugle","Marcher sur l''eau","Transformer l''eau en vin","Multiplier les pains"]',
  '["Geri yon avèg","Mache sou dlo","Chanje dlo an diven","Miltipliye pen yo"]',
  '["Heal a blind man","Walk on water","Turn water into wine","Multiply the bread"]',
  2, 'Jean 2:1-11', 1, 30
FROM c5
UNION ALL SELECT id,
  'Combien de disciples Jésus a-t-il choisis ?',
  'Konbyen disip Jezi te chwazi ?',
  'How many disciples did Jesus choose?',
  '["7","10","12","70"]',
  '["7","10","12","70"]',
  '["7","10","12","70"]',
  2, 'Marc 3:14', 2, 30
FROM c5
UNION ALL SELECT id,
  'Combien de jours Jésus a-t-il jeûné dans le désert ?',
  'Konbyen jou Jezi te jene nan dezè a ?',
  'How many days did Jesus fast in the desert?',
  '["7 jours","20 jours","30 jours","40 jours"]',
  '["7 jou","20 jou","30 jou","40 jou"]',
  '["7 days","20 days","30 days","40 days"]',
  3, 'Matthieu 4:2', 3, 30
FROM c5
UNION ALL SELECT id,
  'Quel est le dernier livre du Nouveau Testament ?',
  'Ki dènye liv nan Nouvo Testaman an ?',
  'What is the last book of the New Testament?',
  '["Hébreux","Jude","1 Jean","Apocalypse"]',
  '["Ebre","Jid","1 Jan","Revelasyon"]',
  '["Hebrews","Jude","1 John","Revelation"]',
  3, 'Apocalypse 22', 4, 30
FROM c5;

-- =============================================
-- CONCOURS 6 — TERMINÉ
-- =============================================
WITH c6 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'Les Psaumes et la Prière',
    'Un voyage dans le livre des Psaumes — le plus grand recueil de prières de la Bible.',
    'completed', 10, 4
  ) RETURNING id
)
INSERT INTO contest_questions
  (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'Qui est le principal auteur du livre des Psaumes ?',
  'Ki moun ki prensipal otè liv Sòm yo ?',
  'Who is the main author of the book of Psalms?',
  '["Salomon","Moïse","David","Ésaïe"]',
  '["Salomon","Moyiz","David","Ezayi"]',
  '["Solomon","Moses","David","Isaiah"]',
  2, 'Psaumes 72:20', 0, 30
FROM c6
UNION ALL SELECT id,
  'Combien de Psaumes compte le livre des Psaumes ?',
  'Konbyen Sòm ki genyen nan liv Sòm yo ?',
  'How many Psalms are in the book of Psalms?',
  '["100","120","150","180"]',
  '["100","120","150","180"]',
  '["100","120","150","180"]',
  2, 'Psaumes 150', 1, 30
FROM c6
UNION ALL SELECT id,
  'Quel est le Psaume le plus court de la Bible ?',
  'Ki Sòm ki pi kout nan Bib la ?',
  'What is the shortest Psalm in the Bible?',
  '["Psaume 1","Psaume 23","Psaume 100","Psaume 117"]',
  '["Sòm 1","Sòm 23","Sòm 100","Sòm 117"]',
  '["Psalm 1","Psalm 23","Psalm 100","Psalm 117"]',
  3, 'Psaumes 117', 2, 30
FROM c6
UNION ALL SELECT id,
  'Le Psaume 23 commence par : "L''Éternel est mon..." ?',
  'Sòm 23 kòmanse pa : "Seyè a se..." ?',
  'Psalm 23 begins: "The Lord is my..." ?',
  '["Force","Lumière","Berger","Bouclier"]',
  '["Fòs","Limyè","Gadò","Boucliye"]',
  '["Strength","Light","Shepherd","Shield"]',
  2, 'Psaumes 23:1', 3, 30
FROM c6
UNION ALL SELECT id,
  'Combien de versets a le Psaume 119, le plus long de la Bible ?',
  'Konbyen vèsè Sòm 119, ki pi long nan Bib la, genyen ?',
  'How many verses does Psalm 119, the longest in the Bible, have?',
  '["120 versets","150 versets","176 versets","200 versets"]',
  '["120 vèsè","150 vèsè","176 vèsè","200 vèsè"]',
  '["120 verses","150 verses","176 verses","200 verses"]',
  2, 'Psaumes 119', 4, 30
FROM c6;
