-- =============================================
-- CONCOURS PRÉ-REMPLIS — Koneksyon Pam
-- =============================================

-- CONCOURS 1 : La Création et les Origines
WITH c1 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'La Création et les Origines',
    'Un défi biblique sur les premiers chapitres de la Genèse — la création du monde, Adam et Ève, et les récits fondateurs.',
    'upcoming', 10, 0
  ) RETURNING id
)
INSERT INTO contest_questions (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'En combien de jours Dieu a-t-il créé les cieux et la terre ?',
  'Nan konbyen jou Bondye te kreye syèl la ak tè a ?',
  'In how many days did God create the heavens and the earth?',
  '["3 jours","5 jours","6 jours","7 jours"]',
  '["3 jou","5 jou","6 jou","7 jou"]',
  '["3 days","5 days","6 days","7 days"]',
  2, 'Genèse 1', 0, 30
FROM c1
UNION ALL SELECT id,
  'Quel fruit Dieu avait-il interdit à Adam et Ève de manger ?',
  'Ki fwi Bondye te entèdi Adam ak Èv manje ?',
  'What fruit did God forbid Adam and Eve to eat?',
  '["Le figuier","La pomme de discorde","Le fruit de la connaissance","La grenade"]',
  '["Fig la","Pòm diskò a","Fwi konesans la","Grenad la"]',
  '["The fig","The apple of discord","The fruit of knowledge","The pomegranate"]',
  2, 'Genèse 2:17', 1, 30
FROM c1
UNION ALL SELECT id,
  'Quel est le nom du premier fils de Adam et Ève ?',
  'Ki non premye pitit gason Adam ak Èv la ?',
  'What is the name of the first son of Adam and Eve?',
  '["Abel","Seth","Caïn","Énoch"]',
  '["Abel","Set","Kayen","Enòk"]',
  '["Abel","Seth","Cain","Enoch"]',
  2, 'Genèse 4:1', 2, 30
FROM c1
UNION ALL SELECT id,
  'Combien de personnes Noé a-t-il embarqué dans l''arche avec lui ?',
  'Konbyen moun Noé te pote nan bato a avèk li ?',
  'How many people did Noah bring into the ark with him?',
  '["5 personnes","7 personnes","8 personnes","12 personnes"]',
  '["5 moun","7 moun","8 moun","12 moun"]',
  '["5 people","7 people","8 people","12 people"]',
  2, 'Genèse 7:13', 3, 30
FROM c1
UNION ALL SELECT id,
  'Quelle est la durée de la pluie lors du déluge ?',
  'Konbyen tan lapli a te tonbe pandan delij la ?',
  'How long did it rain during the flood?',
  '["20 jours et 20 nuits","30 jours et 30 nuits","40 jours et 40 nuits","50 jours et 50 nuits"]',
  '["20 jou ak 20 nwit","30 jou ak 30 nwit","40 jou ak 40 nwit","50 jou ak 50 nwit"]',
  '["20 days and 20 nights","30 days and 30 nights","40 days and 40 nights","50 days and 50 nights"]',
  2, 'Genèse 7:12', 4, 30
FROM c1;

-- CONCOURS 2 : La Vie de Jésus
WITH c2 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'La Vie de Jésus',
    'Des questions sur la vie, les miracles, les enseignements et la résurrection de Jésus-Christ à travers les quatre Évangiles.',
    'upcoming', 10, 0
  ) RETURNING id
)
INSERT INTO contest_questions (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'Dans quelle ville Jésus est-il né ?',
  'Nan ki vil Jezi te fèt ?',
  'In which city was Jesus born?',
  '["Nazareth","Jérusalem","Bethléem","Hébron"]',
  '["Nazarèt","Jerizalèm","Betleyèm","Ebwon"]',
  '["Nazareth","Jerusalem","Bethlehem","Hebron"]',
  2, 'Luc 2:4-7', 0, 30
FROM c2
UNION ALL SELECT id,
  'Quel a été le premier miracle de Jésus ?',
  'Ki te premye mirak Jezi a ?',
  'What was the first miracle of Jesus?',
  '["Guérir un aveugle","Marcher sur l''eau","Transformer l''eau en vin","Multiplier les pains"]',
  '["Geri yon avèg","Mache sou dlo","Chanje dlo an diven","Miltipliye pen yo"]',
  '["Heal a blind man","Walk on water","Turn water into wine","Multiply the bread"]',
  2, 'Jean 2:1-11', 1, 30
FROM c2
UNION ALL SELECT id,
  'Combien de disciples Jésus a-t-il choisis ?',
  'Konbyen disip Jezi te chwazi ?',
  'How many disciples did Jesus choose?',
  '["7 disciples","10 disciples","12 disciples","70 disciples"]',
  '["7 disip","10 disip","12 disip","70 disip"]',
  '["7 disciples","10 disciples","12 disciples","70 disciples"]',
  2, 'Marc 3:14', 2, 30
FROM c2
UNION ALL SELECT id,
  'Combien de jours Jésus a-t-il jeûné dans le désert ?',
  'Konbyen jou Jezi te jene nan dezè a ?',
  'How many days did Jesus fast in the desert?',
  '["20 jours","30 jours","40 jours","7 jours"]',
  '["20 jou","30 jou","40 jou","7 jou"]',
  '["20 days","30 days","40 days","7 days"]',
  2, 'Matthieu 4:2', 3, 30
FROM c2
UNION ALL SELECT id,
  'Après sa résurrection, combien de jours Jésus est-il resté sur terre avant de monter au ciel ?',
  'Apre rezireksyon li, konbyen jou Jezi te rete sou tè a anvan li te monte nan syèl la ?',
  'After his resurrection, how many days did Jesus remain on earth before ascending to heaven?',
  '["3 jours","7 jours","30 jours","40 jours"]',
  '["3 jou","7 jou","30 jou","40 jou"]',
  '["3 days","7 days","30 days","40 days"]',
  3, 'Actes 1:3', 4, 30
FROM c2;

-- CONCOURS 3 : Les Psaumes et la Prière
WITH c3 AS (
  INSERT INTO contests (title, description, status, max_participants, current_question)
  VALUES (
    'Les Psaumes et la Prière',
    'Un voyage dans le livre des Psaumes — le plus grand recueil de prières de la Bible. Qui a écrit quoi ? Quels versets cachent quels secrets ?',
    'upcoming', 10, 0
  ) RETURNING id
)
INSERT INTO contest_questions (contest_id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, correct_answer, reference, order_num, time_limit)
SELECT id,
  'Qui est le principal auteur du livre des Psaumes ?',
  'Ki moun ki prensipal otè liv Sòm yo ?',
  'Who is the main author of the book of Psalms?',
  '["Salomon","Moïse","David","Ésaïe"]',
  '["Salomon","Moyiz","David","Ezayi"]',
  '["Solomon","Moses","David","Isaiah"]',
  2, 'Psaumes 72:20', 0, 30
FROM c3
UNION ALL SELECT id,
  'Quel est le verset le plus connu du Psaume 23 ?',
  'Ki vèsè ki pi konnen nan Sòm 23 la ?',
  'What is the most famous verse of Psalm 23?',
  '["Dieu est amour","L''Éternel est mon berger","Ne crains rien","Louez l''Éternel"]',
  '["Bondye se renmen","Seyè a se gadò mwen","Pa pè","Louye Seyè a"]',
  '["God is love","The Lord is my shepherd","Fear not","Praise the Lord"]',
  1, 'Psaumes 23:1', 1, 30
FROM c3
UNION ALL SELECT id,
  'Combien de Psaumes compte le livre des Psaumes ?',
  'Konbyen Sòm ki genyen nan liv Sòm yo ?',
  'How many Psalms are in the book of Psalms?',
  '["100 Psaumes","120 Psaumes","150 Psaumes","180 Psaumes"]',
  '["100 Sòm","120 Sòm","150 Sòm","180 Sòm"]',
  '["100 Psalms","120 Psalms","150 Psalms","180 Psalms"]',
  2, 'Psaumes 150', 2, 30
FROM c3
UNION ALL SELECT id,
  'Quel est le Psaume le plus court de la Bible ?',
  'Ki Sòm ki pi kout nan Bib la ?',
  'What is the shortest Psalm in the Bible?',
  '["Psaume 1","Psaume 23","Psaume 100","Psaume 117"]',
  '["Sòm 1","Sòm 23","Sòm 100","Sòm 117"]',
  '["Psalm 1","Psalm 23","Psalm 100","Psalm 117"]',
  3, 'Psaumes 117', 3, 30
FROM c3
UNION ALL SELECT id,
  'Le Psaume 119 est le plus long chapitre de la Bible. Combien a-t-il de versets ?',
  'Sòm 119 se chapit ki pi long nan Bib la. Konbyen vèsè li genyen ?',
  'Psalm 119 is the longest chapter in the Bible. How many verses does it have?',
  '["120 versets","150 versets","176 versets","200 versets"]',
  '["120 vèsè","150 vèsè","176 vèsè","200 vèsè"]',
  '["120 verses","150 verses","176 verses","200 verses"]',
  2, 'Psaumes 119', 4, 30
FROM c3;
