-- ─────────────────────────────────────────────────────────────────────────────
-- Migration Phase 3 : Champs éducatifs sur kp_questions + banque de questions
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ajouter les colonnes éducatives à kp_questions
ALTER TABLE kp_questions
  ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'bible'
    CHECK (subject IN ('bible','maths','sciences','histoire','langues','arts','tech','sante'));

ALTER TABLE kp_questions
  ADD COLUMN IF NOT EXISTS school_level TEXT
    CHECK (school_level IS NULL OR school_level IN ('primaire-1','primaire-2','secondaire-1','secondaire-2'));

ALTER TABLE kp_questions
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_kp_questions_subject      ON kp_questions(subject);
CREATE INDEX IF NOT EXISTS idx_kp_questions_school_level ON kp_questions(school_level);
CREATE INDEX IF NOT EXISTS idx_kp_questions_status       ON kp_questions(status);

-- Mettre à jour les questions bibliques existantes
UPDATE kp_questions SET subject = 'bible' WHERE subject IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MATHÉMATIQUES — Primaire 1 (6-8 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','easy','published','maths','primaire-1',
  '{"fr":"Combien font 3 + 4 ?","ht":"Konbyen 3 + 4 fè ?","en":"What is 3 + 4?","es":"¿Cuánto es 3 + 4?"}',
  '{"fr":"5","ht":"5","en":"5","es":"5"}','{"fr":"6","ht":"6","en":"6","es":"6"}','{"fr":"7","ht":"7","en":"7","es":"7"}','{"fr":"8","ht":"8","en":"8","es":"8"}', 2),

('mcq','easy','published','maths','primaire-1',
  '{"fr":"Quel nombre vient juste après 9 ?","ht":"Ki nimewo ki vini apre 9 ?","en":"What number comes right after 9?","es":"¿Qué número viene justo después del 9?"}',
  '{"fr":"8","ht":"8","en":"8","es":"8"}','{"fr":"10","ht":"10","en":"10","es":"10"}','{"fr":"11","ht":"11","en":"11","es":"11"}','{"fr":"12","ht":"12","en":"12","es":"12"}', 1),

('mcq','easy','published','maths','primaire-1',
  '{"fr":"Combien de côtés a un triangle ?","ht":"Konbyen bò yon triyang genyen ?","en":"How many sides does a triangle have?","es":"¿Cuántos lados tiene un triángulo?"}',
  '{"fr":"2","ht":"2","en":"2","es":"2"}','{"fr":"3","ht":"3","en":"3","es":"3"}','{"fr":"4","ht":"4","en":"4","es":"4"}','{"fr":"5","ht":"5","en":"5","es":"5"}', 1),

('mcq','easy','published','maths','primaire-1',
  '{"fr":"Combien font 10 − 3 ?","ht":"Konbyen 10 − 3 fè ?","en":"What is 10 − 3?","es":"¿Cuánto es 10 − 3?"}',
  '{"fr":"5","ht":"5","en":"5","es":"5"}','{"fr":"6","ht":"6","en":"6","es":"6"}','{"fr":"7","ht":"7","en":"7","es":"7"}','{"fr":"8","ht":"8","en":"8","es":"8"}', 2),

('mcq','easy','published','maths','primaire-1',
  '{"fr":"Quel est le double de 5 ?","ht":"Ki sa doub 5 a ye ?","en":"What is double 5?","es":"¿Cuál es el doble de 5?"}',
  '{"fr":"8","ht":"8","en":"8","es":"8"}','{"fr":"9","ht":"9","en":"9","es":"9"}','{"fr":"10","ht":"10","en":"10","es":"10"}','{"fr":"12","ht":"12","en":"12","es":"12"}', 2),

('mcq','easy','published','maths','primaire-1',
  '{"fr":"Combien de côtés a un carré ?","ht":"Konbyen bò yon kare genyen ?","en":"How many sides does a square have?","es":"¿Cuántos lados tiene un cuadrado?"}',
  '{"fr":"3","ht":"3","en":"3","es":"3"}','{"fr":"4","ht":"4","en":"4","es":"4"}','{"fr":"5","ht":"5","en":"5","es":"5"}','{"fr":"6","ht":"6","en":"6","es":"6"}', 1);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. MATHÉMATIQUES — Primaire 2 (9-12 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','medium','published','maths','primaire-2',
  '{"fr":"Combien font 25 × 4 ?","ht":"Konbyen 25 × 4 fè ?","en":"What is 25 × 4?","es":"¿Cuánto es 25 × 4?"}',
  '{"fr":"80","ht":"80","en":"80","es":"80"}','{"fr":"90","ht":"90","en":"90","es":"90"}','{"fr":"100","ht":"100","en":"100","es":"100"}','{"fr":"110","ht":"110","en":"110","es":"110"}', 2),

('mcq','medium','published','maths','primaire-2',
  '{"fr":"Combien font 144 ÷ 12 ?","ht":"Konbyen 144 ÷ 12 fè ?","en":"What is 144 ÷ 12?","es":"¿Cuánto es 144 ÷ 12?"}',
  '{"fr":"10","ht":"10","en":"10","es":"10"}','{"fr":"11","ht":"11","en":"11","es":"11"}','{"fr":"12","ht":"12","en":"12","es":"12"}','{"fr":"13","ht":"13","en":"13","es":"13"}', 2),

('mcq','medium','published','maths','primaire-2',
  '{"fr":"Quel est le périmètre d''un carré de côté 5 cm ?","ht":"Ki pèrimèt yon kare ki gen kote 5 cm ?","en":"What is the perimeter of a square with side 5 cm?","es":"¿Cuál es el perímetro de un cuadrado de lado 5 cm?"}',
  '{"fr":"10 cm","ht":"10 cm","en":"10 cm","es":"10 cm"}','{"fr":"15 cm","ht":"15 cm","en":"15 cm","es":"15 cm"}','{"fr":"20 cm","ht":"20 cm","en":"20 cm","es":"20 cm"}','{"fr":"25 cm","ht":"25 cm","en":"25 cm","es":"25 cm"}', 2),

('mcq','medium','published','maths','primaire-2',
  '{"fr":"Combien font 3/4 + 1/4 ?","ht":"Konbyen 3/4 + 1/4 fè ?","en":"What is 3/4 + 1/4?","es":"¿Cuánto es 3/4 + 1/4?"}',
  '{"fr":"1/2","ht":"1/2","en":"1/2","es":"1/2"}','{"fr":"4/4","ht":"4/4","en":"4/4","es":"4/4"}','{"fr":"1","ht":"1","en":"1","es":"1"}','{"fr":"2","ht":"2","en":"2","es":"2"}', 2),

('mcq','medium','published','maths','primaire-2',
  '{"fr":"Quelle fraction est la plus grande ?","ht":"Ki fraksyon ki pi gran ?","en":"Which fraction is the largest?","es":"¿Qué fracción es la más grande?"}',
  '{"fr":"1/4","ht":"1/4","en":"1/4","es":"1/4"}','{"fr":"1/3","ht":"1/3","en":"1/3","es":"1/3"}','{"fr":"1/2","ht":"1/2","en":"1/2","es":"1/2"}','{"fr":"1/5","ht":"1/5","en":"1/5","es":"1/5"}', 2),

('mcq','medium','published','maths','primaire-2',
  '{"fr":"Quel est l''aire d''un rectangle de 6 cm × 4 cm ?","ht":"Ki sifas yon rektang 6 cm × 4 cm ?","en":"What is the area of a 6 cm × 4 cm rectangle?","es":"¿Cuál es el área de un rectángulo de 6 cm × 4 cm?"}',
  '{"fr":"10 cm²","ht":"10 cm²","en":"10 cm²","es":"10 cm²"}','{"fr":"20 cm²","ht":"20 cm²","en":"20 cm²","es":"20 cm²"}','{"fr":"24 cm²","ht":"24 cm²","en":"24 cm²","es":"24 cm²"}','{"fr":"28 cm²","ht":"28 cm²","en":"28 cm²","es":"28 cm²"}', 2);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MATHÉMATIQUES — Secondaire 1 (12-15 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','hard','published','maths','secondaire-1',
  '{"fr":"Si 2x + 6 = 14, quelle est la valeur de x ?","ht":"Si 2x + 6 = 14, ki valè x ?","en":"If 2x + 6 = 14, what is x?","es":"Si 2x + 6 = 14, ¿cuál es el valor de x?"}',
  '{"fr":"3","ht":"3","en":"3","es":"3"}','{"fr":"4","ht":"4","en":"4","es":"4"}','{"fr":"5","ht":"5","en":"5","es":"5"}','{"fr":"7","ht":"7","en":"7","es":"7"}', 1),

('mcq','hard','published','maths','secondaire-1',
  '{"fr":"Quel est le résultat de 3² + 4² ?","ht":"Ki rezilta 3² + 4² ?","en":"What is 3² + 4²?","es":"¿Cuál es el resultado de 3² + 4²?"}',
  '{"fr":"14","ht":"14","en":"14","es":"14"}','{"fr":"25","ht":"25","en":"25","es":"25"}','{"fr":"49","ht":"49","en":"49","es":"49"}','{"fr":"7","ht":"7","en":"7","es":"7"}', 1),

('mcq','hard','published','maths','secondaire-1',
  '{"fr":"Combien y a-t-il de degrés dans un triangle ?","ht":"Konbyen degre yon triyang genyen ?","en":"How many degrees are in a triangle?","es":"¿Cuántos grados tiene un triángulo?"}',
  '{"fr":"90°","ht":"90°","en":"90°","es":"90°"}','{"fr":"180°","ht":"180°","en":"180°","es":"180°"}','{"fr":"270°","ht":"270°","en":"270°","es":"270°"}','{"fr":"360°","ht":"360°","en":"360°","es":"360°"}', 1);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SCIENCES — Primaire 1 (6-8 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','easy','published','sciences','primaire-1',
  '{"fr":"De quoi les plantes ont-elles besoin pour pousser ?","ht":"Ki sa plant yo bezwen pou yo grandi ?","en":"What do plants need to grow?","es":"¿Qué necesitan las plantas para crecer?"}',
  '{"fr":"Obscurité et froid","ht":"Fènwa ak frèt","en":"Darkness and cold","es":"Oscuridad y frío"}','{"fr":"Soleil, eau et terre","ht":"Solèy, dlo ak tè","en":"Sun, water and soil","es":"Sol, agua y tierra"}','{"fr":"Seulement de l''eau","ht":"Dlo sèlman","en":"Only water","es":"Solo agua"}','{"fr":"Air uniquement","ht":"Lè sèlman","en":"Air only","es":"Solo aire"}', 1),

('mcq','easy','published','sciences','primaire-1',
  '{"fr":"Combien de pattes a un insecte ?","ht":"Konbyen pat yon ensèk genyen ?","en":"How many legs does an insect have?","es":"¿Cuántas patas tiene un insecto?"}',
  '{"fr":"4","ht":"4","en":"4","es":"4"}','{"fr":"6","ht":"6","en":"6","es":"6"}','{"fr":"8","ht":"8","en":"8","es":"8"}','{"fr":"10","ht":"10","en":"10","es":"10"}', 1),

('mcq','easy','published','sciences','primaire-1',
  '{"fr":"Quel organe pompe le sang dans notre corps ?","ht":"Ki ògan ki ponpe san nan kò nou ?","en":"Which organ pumps blood in our body?","es":"¿Qué órgano bombea la sangre en nuestro cuerpo?"}',
  '{"fr":"Le poumon","ht":"Poumon an","en":"The lung","es":"El pulmón"}','{"fr":"Le foie","ht":"Fwa a","en":"The liver","es":"El hígado"}','{"fr":"Le cœur","ht":"Kè a","en":"The heart","es":"El corazón"}','{"fr":"Le cerveau","ht":"Sèvo a","en":"The brain","es":"El cerebro"}', 2),

('mcq','easy','published','sciences','primaire-1',
  '{"fr":"Quel animal donne du lait ?","ht":"Ki bèt ki bay lèt ?","en":"Which animal gives milk?","es":"¿Qué animal da leche?"}',
  '{"fr":"Le poisson","ht":"Pwason","en":"Fish","es":"El pez"}','{"fr":"Le poulet","ht":"Poul","en":"Chicken","es":"El pollo"}','{"fr":"La vache","ht":"Vach","en":"Cow","es":"La vaca"}','{"fr":"Le serpent","ht":"Sèpan","en":"Snake","es":"La serpiente"}', 2);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SCIENCES — Primaire 2 (9-12 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','medium','published','sciences','primaire-2',
  '{"fr":"Par quel processus les plantes fabriquent-elles leur nourriture ?","ht":"Ki pwosesis plant yo itilize pou fè manje yo ?","en":"What process do plants use to make their food?","es":"¿Qué proceso usan las plantas para hacer su alimento?"}',
  '{"fr":"La respiration","ht":"Respirasyon","en":"Respiration","es":"La respiración"}','{"fr":"La photosynthèse","ht":"Fotosintèz","en":"Photosynthesis","es":"La fotosíntesis"}','{"fr":"La digestion","ht":"Dijèsyon","en":"Digestion","es":"La digestión"}','{"fr":"L''évaporation","ht":"Evaporasyon","en":"Evaporation","es":"La evaporación"}', 1),

('mcq','medium','published','sciences','primaire-2',
  '{"fr":"Quelle planète est la plus proche du Soleil ?","ht":"Ki planèt ki pi prè Solèy la ?","en":"Which planet is closest to the Sun?","es":"¿Qué planeta está más cerca del Sol?"}',
  '{"fr":"Vénus","ht":"Venus","en":"Venus","es":"Venus"}','{"fr":"Mars","ht":"Mas","en":"Mars","es":"Marte"}','{"fr":"Mercure","ht":"Mèki","en":"Mercury","es":"Mercurio"}','{"fr":"Terre","ht":"Latè","en":"Earth","es":"Tierra"}', 2),

('mcq','medium','published','sciences','primaire-2',
  '{"fr":"À quelle température l''eau se transforme-t-elle en glace ?","ht":"A ki tanperati dlo transfòme an glas ?","en":"At what temperature does water turn to ice?","es":"¿A qué temperatura se convierte el agua en hielo?"}',
  '{"fr":"10°C","ht":"10°C","en":"10°C","es":"10°C"}','{"fr":"0°C","ht":"0°C","en":"0°C","es":"0°C"}','{"fr":"-10°C","ht":"-10°C","en":"-10°C","es":"-10°C"}','{"fr":"100°C","ht":"100°C","en":"100°C","es":"100°C"}', 1),

('mcq','medium','published','sciences','primaire-2',
  '{"fr":"L''air que nous respirons est principalement composé de quel gaz ?","ht":"Ak ki gaz lè nou respire a fèt prensipalman ?","en":"What gas mainly makes up the air we breathe?","es":"¿De qué gas está compuesto principalmente el aire que respiramos?"}',
  '{"fr":"Oxygène","ht":"Oksijèn","en":"Oxygen","es":"Oxígeno"}','{"fr":"Dioxyde de carbone","ht":"Dyoksid kabòn","en":"Carbon dioxide","es":"Dióxido de carbono"}','{"fr":"Azote","ht":"Azòt","en":"Nitrogen","es":"Nitrógeno"}','{"fr":"Hydrogène","ht":"Idwojèn","en":"Hydrogen","es":"Hidrógeno"}', 2),

('mcq','medium','published','sciences','primaire-2',
  '{"fr":"Combien d''os le corps humain adulte possède-t-il environ ?","ht":"Konbyen zo kò yon moun granmoun genyen apeprè ?","en":"How many bones does an adult human body have approximately?","es":"¿Aproximadamente cuántos huesos tiene el cuerpo humano adulto?"}',
  '{"fr":"106","ht":"106","en":"106","es":"106"}','{"fr":"206","ht":"206","en":"206","es":"206"}','{"fr":"306","ht":"306","en":"306","es":"306"}','{"fr":"406","ht":"406","en":"406","es":"406"}', 1),

('mcq','medium','published','sciences','primaire-2',
  '{"fr":"Quel est le cycle de l''eau dans la nature ?","ht":"Ki sikl dlo nan nati a ?","en":"What is the water cycle in nature?","es":"¿Cuál es el ciclo del agua en la naturaleza?"}',
  '{"fr":"Évaporation → nuages → pluie","ht":"Evaporasyon → nwaj → lapli","en":"Evaporation → clouds → rain","es":"Evaporación → nubes → lluvia"}','{"fr":"Pluie → nuages → soleil","ht":"Lapli → nwaj → solèy","en":"Rain → clouds → sun","es":"Lluvia → nubes → sol"}','{"fr":"Soleil → glace → vapeur","ht":"Solèy → glas → vapè","en":"Sun → ice → vapor","es":"Sol → hielo → vapor"}','{"fr":"Neige → mer → rivière","ht":"Nèj → lanmè → rivyè","en":"Snow → sea → river","es":"Nieve → mar → río"}', 0);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SCIENCES — Secondaire 1 (12-15 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','hard','published','sciences','secondaire-1',
  '{"fr":"Quelle est la formule chimique de l''eau ?","ht":"Ki fòmil chimik dlo a ?","en":"What is the chemical formula of water?","es":"¿Cuál es la fórmula química del agua?"}',
  '{"fr":"CO2","ht":"CO2","en":"CO2","es":"CO2"}','{"fr":"NaCl","ht":"NaCl","en":"NaCl","es":"NaCl"}','{"fr":"H2O","ht":"H2O","en":"H2O","es":"H2O"}','{"fr":"O2","ht":"O2","en":"O2","es":"O2"}', 2),

('mcq','hard','published','sciences','secondaire-1',
  '{"fr":"Quelle est l''unité de mesure de la force en physique ?","ht":"Ki inite mezi fòs nan fizik ?","en":"What is the unit of force in physics?","es":"¿Cuál es la unidad de fuerza en física?"}',
  '{"fr":"Le mètre","ht":"Mèt la","en":"The meter","es":"El metro"}','{"fr":"Le kilogramme","ht":"Kilogram nan","en":"The kilogram","es":"El kilogramo"}','{"fr":"Le Newton","ht":"Newton an","en":"The Newton","es":"El Newton"}','{"fr":"Le Joule","ht":"Joul la","en":"The Joule","es":"El Joule"}', 2),

('mcq','hard','published','sciences','secondaire-1',
  '{"fr":"Qu''est-ce que la cellule dans le corps humain ?","ht":"Kisa selil la ye nan kò imen an ?","en":"What is a cell in the human body?","es":"¿Qué es la célula en el cuerpo humano?"}',
  '{"fr":"La plus petite unité du vivant","ht":"Pi piti inite ki vivan","en":"The smallest unit of life","es":"La unidad más pequeña de vida"}','{"fr":"Un organe du corps","ht":"Yon ògan kò","en":"An organ of the body","es":"Un órgano del cuerpo"}','{"fr":"Un type de sang","ht":"Yon kalite san","en":"A type of blood","es":"Un tipo de sangre"}','{"fr":"Un muscle","ht":"Yon mis","en":"A muscle","es":"Un músculo"}', 0);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. HISTOIRE — Primaire 2 (9-12 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','medium','published','histoire','primaire-2',
  '{"fr":"En quelle année Haïti a-t-elle proclamé son indépendance ?","ht":"An ki ane Ayiti te deklare endepandans li ?","en":"In what year did Haiti declare its independence?","es":"¿En qué año Haití declaró su independencia?"}',
  '{"fr":"1791","ht":"1791","en":"1791","es":"1791"}','{"fr":"1804","ht":"1804","en":"1804","es":"1804"}','{"fr":"1820","ht":"1820","en":"1820","es":"1820"}','{"fr":"1865","ht":"1865","en":"1865","es":"1865"}', 1),

('mcq','medium','published','histoire','primaire-2',
  '{"fr":"Qui a découvert l''Amérique en 1492 ?","ht":"Ki moun ki te dekouvri Amerik nan 1492 ?","en":"Who discovered America in 1492?","es":"¿Quién descubrió América en 1492?"}',
  '{"fr":"Vasco de Gama","ht":"Vasco de Gama","en":"Vasco de Gama","es":"Vasco de Gama"}','{"fr":"Christophe Colomb","ht":"Kristòf Kolon","en":"Christopher Columbus","es":"Cristóbal Colón"}','{"fr":"Magellan","ht":"Majelan","en":"Magellan","es":"Magallanes"}','{"fr":"Marco Polo","ht":"Mako Polo","en":"Marco Polo","es":"Marco Polo"}', 1),

('mcq','medium','published','histoire','primaire-2',
  '{"fr":"Quelle est la capitale d''Haïti ?","ht":"Ki kapital Ayiti a ?","en":"What is the capital of Haiti?","es":"¿Cuál es la capital de Haití?"}',
  '{"fr":"Cap-Haïtien","ht":"Okay","en":"Cap-Haïtien","es":"Cabo Haitiano"}','{"fr":"Jacmel","ht":"Jakmèl","en":"Jacmel","es":"Jacmel"}','{"fr":"Port-au-Prince","ht":"Pòtoprens","en":"Port-au-Prince","es":"Puerto Príncipe"}','{"fr":"Les Cayes","ht":"Okay","en":"Les Cayes","es":"Les Cayes"}', 2),

('mcq','medium','published','histoire','primaire-2',
  '{"fr":"Quel est le plus grand continent du monde ?","ht":"Ki pi gwo kontinan nan lemonn ?","en":"What is the largest continent in the world?","es":"¿Cuál es el continente más grande del mundo?"}',
  '{"fr":"Afrique","ht":"Afrik","en":"Africa","es":"África"}','{"fr":"Amérique","ht":"Amerik","en":"America","es":"América"}','{"fr":"Asie","ht":"Azi","en":"Asia","es":"Asia"}','{"fr":"Europe","ht":"Ewòp","en":"Europe","es":"Europa"}', 2),

('mcq','medium','published','histoire','primaire-2',
  '{"fr":"En quelle année a commencé la Révolution française ?","ht":"An ki ane Revolisyon fransè a te kòmanse ?","en":"In what year did the French Revolution begin?","es":"¿En qué año comenzó la Revolución Francesa?"}',
  '{"fr":"1776","ht":"1776","en":"1776","es":"1776"}','{"fr":"1789","ht":"1789","en":"1789","es":"1789"}','{"fr":"1804","ht":"1804","en":"1804","es":"1804"}','{"fr":"1815","ht":"1815","en":"1815","es":"1815"}', 1),

('mcq','medium','published','histoire','primaire-2',
  '{"fr":"Qui était Toussaint Louverture ?","ht":"Ki moun Tousen Louvèti te ye ?","en":"Who was Toussaint Louverture?","es":"¿Quién fue Toussaint Louverture?"}',
  '{"fr":"Un roi d''Afrique","ht":"Yon wa nan Afrik","en":"A king of Africa","es":"Un rey de África"}','{"fr":"Un chef de la révolution haïtienne","ht":"Yon chèf revolisyon ayisyen an","en":"A leader of the Haitian revolution","es":"Un líder de la revolución haitiana"}','{"fr":"Un explorateur espagnol","ht":"Yon eksploratè panyòl","en":"A Spanish explorer","es":"Un explorador español"}','{"fr":"Un général français","ht":"Yon jeneral fransè","en":"A French general","es":"Un general francés"}', 1),

('mcq','medium','published','histoire','primaire-2',
  '{"fr":"Sur quel continent se trouve Haïti ?","ht":"Sou ki kontinan Ayiti ye ?","en":"On which continent is Haiti located?","es":"¿En qué continente se encuentra Haití?"}',
  '{"fr":"Afrique","ht":"Afrik","en":"Africa","es":"África"}','{"fr":"Europe","ht":"Ewòp","en":"Europe","es":"Europa"}','{"fr":"Amérique","ht":"Amerik","en":"America","es":"América"}','{"fr":"Asie","ht":"Azi","en":"Asia","es":"Asia"}', 2);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. HISTOIRE — Secondaire 1 (12-15 ans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kp_questions (type, difficulty, status, subject, school_level, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('mcq','hard','published','histoire','secondaire-1',
  '{"fr":"Quel système économique était basé sur le travail forcé des Africains ?","ht":"Ki sistèm ekonomik ki te baze sou travay fòsé Afriken yo ?","en":"What economic system was based on forced African labor?","es":"¿Qué sistema económico se basaba en el trabajo forzado de africanos?"}',
  '{"fr":"Le féodalisme","ht":"Feyodalis","en":"Feudalism","es":"El feudalismo"}','{"fr":"Le capitalisme","ht":"Kapitalis","en":"Capitalism","es":"El capitalismo"}','{"fr":"L''esclavage","ht":"Esklavaj","en":"Slavery","es":"La esclavitud"}','{"fr":"Le socialisme","ht":"Sosyalis","en":"Socialism","es":"El socialismo"}', 2),

('mcq','hard','published','histoire','secondaire-1',
  '{"fr":"Quelle date marque la fin de la Première Guerre mondiale ?","ht":"Ki dat ki make fen Premye Gè Mondyal la ?","en":"What date marks the end of World War I?","es":"¿Qué fecha marca el fin de la Primera Guerra Mundial?"}',
  '{"fr":"11 novembre 1918","ht":"11 novanm 1918","en":"November 11, 1918","es":"11 de noviembre de 1918"}','{"fr":"8 mai 1945","ht":"8 me 1945","en":"May 8, 1945","es":"8 de mayo de 1945"}','{"fr":"1er janvier 1804","ht":"1yè janvye 1804","en":"January 1, 1804","es":"1 de enero de 1804"}','{"fr":"14 juillet 1789","ht":"14 jiyè 1789","en":"July 14, 1789","es":"14 de julio de 1789"}', 0),

('mcq','hard','published','histoire','secondaire-1',
  '{"fr":"Quelle organisation internationale a été créée après la Seconde Guerre mondiale pour maintenir la paix ?","ht":"Ki òganizasyon entènasyonal ki te kreye apre Dezyèm Gè Mondyal la pou kenbe lapè ?","en":"Which international organization was created after WWII to maintain peace?","es":"¿Qué organización internacional se creó después de la Segunda Guerra Mundial para mantener la paz?"}',
  '{"fr":"L''Union Européenne","ht":"Inyon Ewopeyèn","en":"The European Union","es":"La Unión Europea"}','{"fr":"L''OTAN","ht":"OTAN","en":"NATO","es":"La OTAN"}','{"fr":"Les Nations Unies (ONU)","ht":"Nasyon Zini (ONU)","en":"The United Nations (UN)","es":"Las Naciones Unidas (ONU)"}','{"fr":"La Ligue Arabe","ht":"Lig Arab","en":"The Arab League","es":"La Liga Árabe"}', 2),

('mcq','hard','published','histoire','secondaire-1',
  '{"fr":"En quelle année l''esclavage a-t-il été définitivement aboli en France ?","ht":"An ki ane esklavaj te definitèvman aboli ann Anfrans ?","en":"In what year was slavery definitively abolished in France?","es":"¿En qué año fue definitivamente abolida la esclavitud en Francia?"}',
  '{"fr":"1794","ht":"1794","en":"1794","es":"1794"}','{"fr":"1804","ht":"1804","en":"1804","es":"1804"}','{"fr":"1848","ht":"1848","en":"1848","es":"1848"}','{"fr":"1865","ht":"1865","en":"1865","es":"1865"}', 2);
