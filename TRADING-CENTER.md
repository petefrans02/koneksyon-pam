# KONEKSYON PAM TRADING CENTER

Plateforme de signaux de trading à haute probabilité. Premier marché : **XAU/USD** (or).

> **Ce que ce système fait :** il analyse, il note, il filtre, il prévient.
> **Ce qu'il ne fait jamais :** passer un ordre. Aucune ligne de ce module ne touche à un compte de courtage, et c'est volontaire.

---

## 1. Le principe en une page

```
   TradingView (serveurs)              KONEKSYON PAM (Vercel)
  ┌────────────────────┐              ┌──────────────────────────────────┐
  │  Script Pine       │              │  1. Secret vérifié               │
  │  · 7 échelles      │   webhook    │  2. Charge utile validée         │
  │  · EMA/VWAP/ATR    │─────────────▶│  3. Marché en service ?          │
  │  · RSI/MACD/ADX    │    JSON      │  4. Anti-doublon (90 min)        │
  │  · BOS/CHOCH/FVG   │              │  5. Quota du jour                │
  │  · Order blocks    │              │  6. Score déterministe /100      │
  │  · Balayages       │              │  7. Filtre IA (Claude, ±15 pts)  │
  └────────────────────┘              │  8. Seuil ≥ 90 % ?               │
                                      └──────────────┬───────────────────┘
                                                     │ publié
                                      ┌──────────────▼───────────────────┐
                                      │  Base · Tableau de bord          │
                                      │  Cloche · Email · Push · Telegram│
                                      └──────────────────────────────────┘
```

**TradingView calcule, KONEKSYON PAM décide.** Aucun indicateur n'est recalculé côté site : ce serait refaire, moins bien, un travail déjà fait par un moteur qui voit le carnet complet.

Rien ne tourne sur ton ordinateur. Tu peux l'éteindre, les signaux continuent d'arriver.

---

## 2. Installation — 6 étapes

### Étape 1 — La base de données

Supabase → **SQL Editor** → colle et exécute :

```
supabase/trading-center.sql
```

Crée 8 tables préfixées `tc_`, une vue de performance, et insère les 9 marchés (seul `XAUUSD` est actif).

### Étape 2 — Les variables d'environnement

Dans **Vercel → Settings → Environment Variables** :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `TRADINGVIEW_WEBHOOK_SECRET` | **Oui** | Sans lui, le webhook refuse tout. Génère-le avec `openssl rand -hex 32`. |
| `CLAUDE_API_KEY` | Recommandé | Le filtre IA. Absent → le score déterministe décide seul. |
| `CRON_SECRET` | Oui | Protège le cron d'entretien. Existe déjà sur ce projet. |
| `GMAIL_APP_PASSWORD` | Pour l'email | Existe déjà. |
| `VAPID_PRIVATE_KEY` + `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Pour le push | Existent déjà. |
| `TELEGRAM_BOT_TOKEN` | Optionnel | Canal Telegram. |
| `PAYPAL_SECRET_KEY` | Pour les paiements | Existe déjà. Absent → abonnements accordés à la main dans l'admin. |

> ⚠️ Ne mets jamais ces valeurs dans le code ni dans un fichier versionné.

### Étape 3 — Le script Pine

1. TradingView → graphique **XAU/USD**, unité **15 minutes**
   *(l'unité du graphique EST l'unité d'entrée des signaux)*
2. Éditeur Pine → Ouvrir → Nouvel indicateur
3. Colle `pine/koneksyon-pam-trading-center.pine`
4. Enregistrer → **Ajouter au graphique**
5. Roue dentée de l'indicateur → renseigne le **Secret du webhook** (identique à l'étape 2)

Le tableau en haut à droite du graphique doit afficher **Secret : configuré** en vert.

### Étape 4 — L'alerte

Icône ⏰ → **Créer une alerte** :

| Champ | Valeur |
|---|---|
| Condition | `KP Trading Center` → **Any alert() function call** |
| Expiration | ☑️ **Open-ended** — *sans date de fin* |
| Nom | `KP Trading Center — XAUUSD` |
| Notifications → Webhook URL | `https://koneksyonpam.com/api/trading-center/webhook` |

> **Le piège numéro un.** Une alerte avec date d'expiration s'éteint toute seule, en silence, quelques semaines plus tard. Le site se tait, et le silence ressemble exactement à un marché calme. Le battement de cœur horaire du script existe pour détecter ça — mais autant ne pas avoir le problème.

**Les webhooks exigent un abonnement TradingView payant** (Essential minimum, ~15 $/mois). C'est la seule condition matérielle du système.

### Étape 5 — Vérifier

Ouvre dans un navigateur :

```
https://koneksyonpam.com/api/trading-center/webhook
```

Réponse attendue :

```json
{ "secret_configure": true, "ia_configuree": true }
```

Deux `false` = les variables ne sont pas prises en compte : redéploie après les avoir ajoutées.

Puis `/admin/trading-center` → le bloc de santé en haut de page. Au bout d'une heure de marché ouvert, il doit afficher **« Le flux est vivant »**.

### Étape 6 — Régler

`/admin/trading-center` → onglet **Réglages**. Tout est modifiable sans redéploiement.

---

## 3. Combien de signaux, et à quelle heure

### Cadence

À 90 % de seuil, sur l'or : **1 à 4 signaux par semaine**. C'est peu, et c'est le produit.

Baisser le seuil augmente mécaniquement le volume et baisse la qualité moyenne. En dessous de 80, la plateforme devient le canal à spam qu'elle refuse d'être.

### Horaires (heure de Miami / Port-au-Prince, UTC−4)

| Fenêtre | Heure locale | Note |
|---|---|---|
| Londres | 03h00 – 08h00 | Le marché se réveille |
| **Chevauchement Londres × New York** | **08h00 – 12h00** | ⭐ Volume maximal, +6 pts au score |
| New York | 12h00 – 17h00 | Réaction aux données US |
| Nuit + week-end | 17h00 – 03h00 | **Silence total** |

Du lundi au vendredi. Modifiable via la clé `sessions_autorisees`.

---

## 4. Le score de confiance

Le score est une **somme de critères nommés**, pas une impression. Un score de 91 se décompose en onze lignes visibles sur la page du signal.

### Le barème

| Critère | Points |
|---|---|
| Tendance Daily dans le sens | +10 |
| Tendance 4H dans le sens | +9 |
| Tendance 1H dans le sens | +6 |
| EMA 20/50/200 empilées | +12 |
| Prix du bon côté du VWAP | +6 |
| ADX ≥ 25 | +8 |
| RSI en zone d'entrée saine | +6 |
| MACD croisé dans le sens | +6 |
| Volume ≥ 1,5× la moyenne | +6 |
| Cassure de structure (BOS) | +8 |
| Changement de caractère (CHOCH) | +6 |
| Liquidité purgée du côté opposé | +8 |
| Entrée dans un order block / FVG | +6 |
| Figure de confirmation | +5 |
| Chevauchement Londres/NY | +6 |
| Risque/rendement ≥ 3:1 | +8 |
| Stop dimensionné sur l'ATR | +6 |
| **Total possible** | **116** |

Le total dépasse 100 volontairement : il faut réunir environ **quatre cinquièmes** des critères pour franchir 90.

### Les pénalités

Tendance contraire, EMA du mauvais côté, MACD contraire, RSI extrême, volume anémique, balayage du mauvais côté, prix sur-étendu.

### Les disqualifiants — un seul suffit à refuser

- Daily **et** 4H tous deux contre le signal
- ADX < 15 (aucune tendance : les objectifs ne seront pas atteints)
- Risque/rendement sous le minimum configuré
- Stop < 0,5 ATR (le bruit le touchera) ou > 5 ATR (risque démesuré)
- Prix à plus de 3 ATR de l'EMA 20 (sur-extension)
- Séance non autorisée

---

## 5. Le filtre IA

Il passe **après** le score déterministe, et son mandat est étroit :

- **Refuser** un setup que les chiffres trouvent bon
- **Ajuster** la confiance de **±15 points maximum**

Il ne peut pas noter. Un modèle de langage à qui on demande « note ce setup sur 100 » produit des nombres plausibles et instables — 88 aujourd'hui, 93 demain sur les mêmes données. Aucune statistique n'en serait tirable.

Il cherche ce que les règles n'ont pas pu voir : fausse cassure, zone déjà consommée, TP2 de l'autre côté d'une résistance majeure, mauvais moment de séance.

**Liste fermée de drapeaux** — l'IA ne peut pas inventer ses catégories, sans quoi le vocabulaire dériverait de semaine en semaine et plus rien ne serait comptable.

Clé absente ou API en panne → repli **neutre** : score inchangé, aucune explication, incident tracé dans l'admin. Jamais de verdict favorable inventé.

---

## 6. Les plans

| | Gratuit | Premium |
|---|---|---|
| Sens du signal | ✅ | ✅ |
| Score de confiance | ✅ | ✅ |
| Résultat final | ✅ | ✅ |
| Statistiques globales | ✅ | ✅ |
| Historique | 5 derniers | Illimité |
| **Niveaux (entrée/stop/TP)** | **60 min de retard** | **Temps réel** |
| Notifications | ❌ | Push · Email · Telegram |
| Journal de performance | ❌ | ✅ |
| Explication IA | ❌ | ✅ |
| Taille de position | ❌ | ✅ |

Le masquage est fait **au serveur** : les valeurs n'arrivent jamais au navigateur. Un flou CSS se retire avec la touche F12, et le premier utilisateur à s'en apercevoir aurait raison de ne plus jamais payer.

Un signal **clôturé** est visible en entier par tout le monde — c'est ce qui permet à un gratuit de vérifier que le système est honnête, et c'est le meilleur argument de vente de la plateforme.

### Paiement

Paiement PayPal **ponctuel** : 29 $ / 1 mois, 75 $ / 3 mois, 249 $ / 12 mois.

Pas de prélèvement récurrent : cela demanderait de créer un *Product* puis un *Plan* dans le tableau de bord PayPal, dont les identifiants n'existent pas encore. Le passage au récurrent plus tard ne demandera pas de toucher à `accorderPremium()` — seule la source du paiement changera.

Un renouvellement anticipé **prolonge depuis la date de fin**, il n'écrase jamais les jours restants.

---

## 7. Le journal

Tout est compté en **R** — le risque d'un trade. 1 R = distance entre l'entrée et le stop **d'origine**, même après avoir remonté le stop.

Compter en dollars mélangerait deux choses sans rapport : la qualité des signaux et la taille des positions. Un mois à +3 000 $ pris avec un risque triplé est un **moins bon** mois qu'un mois à +1 200 $, et un relevé en dollars montrerait l'inverse.

### Trois refus

1. **Aucun taux de réussite sous 20 trades clôturés.** Sur douze signaux, sept gagnants font 58 % et six en font 50 % : l'écart est du bruit. Le journal affiche ce qui manque.
2. **Un signal expiré compte `neutre`**, ni gain ni perte. On ne sait pas ce qui s'est passé.
3. **Le tableau par tranche de confiance est affiché même quand il dérange.** C'est le seul tableau capable de démontrer que le score ne sert à rien : si les 90–92 gagnent autant que les 96–100, le barème ne discrimine pas et il faut le refaire.

---

## 8. Ajouter un marché

Trois étapes, aucune ligne de code :

1. `/admin/trading-center` → onglet **Réglages** → **Marchés** → basculer sur *Actif*
2. TradingView : poser le script Pine sur le graphique de ce marché, changer le paramètre **Code du marché** (`SPY`, `BTCUSD`…)
3. Créer une alerte identique sur ce graphique

Déjà déclarés et éteints : `SPY`, `QQQ`, `NAS100`, `US30`, `BTCUSD`, `ETHUSD`, `EURUSD`, `GBPUSD`.

Chaque marché consomme une alerte du quota TradingView (Essential ≈ 20, Plus ≈ 100).

---

## 9. Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Aucune alerte reçue | Alerte TradingView jamais créée, ou expirée | Admin → Santé. `heures_silence` élevé en semaine = robinet fermé |
| « Secret invalide » dans le journal | Secret différent entre l'indicateur Pine et Vercel | `GET /api/trading-center/webhook` → `secret_configure` |
| Alertes reçues, aucun signal publié | **Fonctionnement normal.** Le filtre travaille | Admin → onglet Flux → ventilation des rejets |
| Beaucoup de « Format incorrect » | Script Pine modifié ou tronqué | Recopier le fichier `.pine` en entier |
| Signaux publiés, aucune notification | Canal non configuré | Admin → Diffusions. `envoyés = 0` + colonne Erreur |
| Graphique TradingView absent | CSP | `next.config.ts` → la règle `/trading-center/:path*` doit exister |
| Tables introuvables | Migration non exécutée | Rejouer `supabase/trading-center.sql` |

### Tester le webhook à la main

```bash
curl -X POST https://koneksyonpam.com/api/trading-center/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "TON_SECRET",
    "marche": "XAUUSD",
    "sens": "BUY",
    "prix": 2043.55,
    "unite": "15M",
    "session": "chevauchement",
    "tendance": "haussiere",
    "bougie": "Englobante haussiere",
    "unites": {
      "D":   {"tendance":"haussiere","rsi":58,"adx":27,"ema_position":"au-dessus"},
      "4H":  {"tendance":"haussiere","rsi":61,"adx":31,"ema_position":"au-dessus"},
      "1H":  {"tendance":"haussiere","rsi":57,"adx":26,"ema_position":"au-dessus"},
      "15M": {"tendance":"haussiere","rsi":55,"adx":24,"ema_position":"au-dessus"}
    },
    "indicateurs": {
      "ema20":2041.2,"ema50":2038.4,"ema200":2030.1,"vwap":2040.8,
      "atr":4.2,"rsi":55,"macd":1.2,"macd_signal":0.8,"adx":26,"rvol":1.6
    },
    "smc": {"bos":"haussier","sweep":"bas","order_block_bas":2040.0,"order_block_haut":2044.0},
    "niveaux": {"support":2036.5,"resistance":2052.0},
    "plan": {
      "entree":2043.55,"zone_bas":2042.0,"zone_haut":2045.0,
      "stop":2037.2,"tp1":2049.9,"tp2":2056.2,"tp3":2062.5
    }
  }'
```

La réponse dit exactement pourquoi le signal a été publié ou refusé.

> Le webhook répond **200 même sur un refus**. TradingView désactive une alerte dont le webhook renvoie trop d'erreurs — un rejet légitime ne doit pas éteindre le robinet. Seul un secret invalide renvoie 401.

---

## 10. Carte des fichiers

```
supabase/trading-center.sql                       schéma complet
pine/koneksyon-pam-trading-center.pine            le moteur d'analyse

lib/trading-center/
  types.ts        le contrat de données (à lire en premier)
  config.ts       réglages en base, cache 30 s
  marches.ts      registre des marchés
  webhook.ts      secret + validation (contrôle de cohérence du stop)
  score.ts        le barème déterministe
  ia.ts           filtre Claude, borné à ±15
  signaux.ts      le pipeline en 8 portes + cycle de vie
  diffusion.ts    4 canaux en parallèle, relevé honnête
  email.ts        envoi qui renvoie un booléen VRAI
  journal.ts      statistiques, R cumulé, drawdown
  acces.ts        plans, masquage serveur, taille de position
  sante.ts        surveillance du silence

app/api/trading-center/
  webhook/        ingestion TradingView
  signaux/        liste + détail
  journal/        rapports (Premium)
  reglages/       préférences utilisateur
  abonnement/     PayPal
  admin/          panneau d'administration
app/api/cron/trading-center/                      entretien, toutes les 2 h

app/trading-center/                               tableau de bord, signal, journal, réglages, premium
app/admin/trading-center/                         administration
```

---

## 11. Ce qui reste à faire

- **SMS** — le canal existe en base, aucun fournisseur n'est branché. Il est affiché comme indisponible plutôt qu'activable : cocher une case qui n'enverrait jamais rien serait pire que l'absence de la case.
- **Suivi automatique des TP/SL** — les objectifs se marquent à la main dans l'admin. L'automatisation demande soit un second script Pine dédié au suivi, soit un flux de prix côté serveur.
- **Abonnement récurrent PayPal** — voir §6.
- **Calendrier économique** — le drapeau `news_imminente` existe dans la liste de l'IA mais aucune source n'est branchée : l'IA ne peut donc pas le lever de façon fiable.

---

## 12. Mention de risque

Les signaux publiés sont des **analyses de marché**, pas des conseils en investissement. Le trading comporte un risque de perte en capital pouvant aller jusqu'à la totalité des sommes engagées. Aucun résultat passé ne préjuge des résultats futurs.

**La plateforme n'exécute jamais d'ordre.** Chaque décision reste celle de l'utilisateur.
