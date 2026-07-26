# KONEKSYON PAM — Architecture Technique

> Documentation pour développeurs. Dernière mise à jour : 2026-06-26.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Structure des dossiers](#3-structure-des-dossiers)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Base de données](#5-base-de-données)
6. [Système d'authentification](#6-système-dauthentification)
7. [API — Endpoints](#7-api--endpoints)
8. [Système de paiement PayPal](#8-système-de-paiement-paypal)
9. [Système d'emails](#9-système-demails)
10. [Traductions (i18n)](#10-traductions-i18n)
11. [Administration](#11-administration)
12. [Analytics](#12-analytics)
13. [Sécurité](#13-sécurité)
14. [Déploiement](#14-déploiement)
15. [Scalabilité](#15-scalabilité)
16. [Procédures de maintenance](#16-procédures-de-maintenance)

---

## 1. Vue d'ensemble

KONEKSYON PAM est une plateforme chrétienne internationale 100 % gratuite.
Elle offre : Bible complète, prières, témoignages, études bibliques, concours, groupes d'église, quiz, IA biblique.

**Principe architectural fondamental** : Server-first. La logique sensible (paiement, base de données, email) vit côté serveur. Le client (React) s'occupe uniquement de l'affichage et de l'interactivité.

---

## 2. Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js App Router | 16.2.9 |
| UI | React | 19.2.4 |
| Types | TypeScript | 5.x |
| Styles | Tailwind CSS | v4 |
| Base de données | Supabase (PostgreSQL) | 2.x |
| Auth | Supabase Auth (Google OAuth) | — |
| Paiement | PayPal React SDK + API v2 | 10.1.0 |
| Email | Nodemailer + Hostinger SMTP | 9.x |
| IA | Anthropic Claude API | 0.106.x |
| Hosting | Vercel (Fluid Compute) | — |
| Analytics | Google Analytics 4 | — |

---

## 3. Structure des dossiers

```
koneksyon-pam/
├── app/
│   ├── admin/                  # Back-office (protégé par middleware)
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── dons/page.tsx       # Gestion des dons
│   │   └── analytiques/page.tsx # Analytics
│   ├── api/                    # API Routes (server-side only)
│   │   ├── admin/              # Routes admin (auth vérifiée)
│   │   ├── paypal/             # PayPal create-order / capture / webhook
│   │   ├── prayers/            # CRUD demandes de prière
│   │   ├── testimonies/        # CRUD témoignages
│   │   ├── churches/           # Groupes d'église
│   │   ├── contests/           # Concours bibliques
│   │   ├── stripe/             # Stripe (legacy — désactivé)
│   │   └── ...
│   ├── components/             # Composants React partagés
│   │   ├── Analytics.tsx       # Google Analytics 4
│   │   ├── NavBar.tsx          # Navigation principale
│   │   ├── PayPalDonateButton.tsx # Bouton de don PayPal
│   │   └── ...
│   ├── don/                    # Page de dons
│   ├── bible/                  # Lecteur Bible
│   ├── prieres/                # Mur de prières
│   ├── temoignages/            # Témoignages
│   ├── etude/                  # Études bibliques
│   ├── concours/               # Concours
│   ├── eglise/                 # Groupes d'église
│   ├── layout.tsx              # Layout racine (metadata, Analytics)
│   ├── sitemap.ts              # Sitemap automatique
│   ├── robots.ts               # robots.txt
│   ├── loading.tsx             # Loading UI global
│   └── error.tsx               # Error boundary global
├── lib/
│   ├── admin.ts                # isAdmin(), isModerator(), getRole()
│   ├── emails.ts               # Système d'emails centralisé (7 templates)
│   ├── email-donations.ts      # Alias → lib/emails.ts (legacy)
│   ├── env.ts                  # Validation env vars + cfg object
│   ├── paypal-server.ts        # OAuth token PayPal + vérification webhook
│   ├── payment.ts              # Abstraction couche paiement
│   ├── rate-limit.ts           # Rate limiting in-process
│   ├── supabase.ts             # Client Supabase (browser)
│   ├── LangContext.tsx         # Contexte i18n (fr/ht/en)
│   ├── translations.ts         # Clés de traduction globales
│   └── demo-data.ts            # Données de démonstration
├── supabase/
│   └── donations-table.sql     # Migration table donations
├── public/                     # Fichiers statiques
├── middleware.ts               # Protection routes /admin
├── next.config.ts              # Config Next.js + CSP + cache
└── ARCHITECTURE.md             # Ce fichier
```

---

## 4. Variables d'environnement

### Requises (production crash si manquantes)

| Variable | Rôle | Côté |
|----------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase | Client + Serveur |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Client + Serveur |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin Supabase (bypass RLS) | Serveur uniquement |

### PayPal (paiements)

| Variable | Rôle | Côté |
|----------|------|------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Client ID PayPal Live | Client (SDK) |
| `PAYPAL_CLIENT_ID` | Copie serveur du Client ID | Serveur |
| `PAYPAL_SECRET_KEY` | Secret PayPal ⚠️ JAMAIS côté client | Serveur uniquement |
| `PAYPAL_WEBHOOK_ID` | ID webhook pour vérification signature | Serveur uniquement |

> **Sécurité** : Ne jamais préfixer `PAYPAL_SECRET_KEY` avec `NEXT_PUBLIC_`.

### Email (SMTP Hostinger)

| Variable | Défaut | Rôle |
|----------|--------|------|
| `GMAIL_USER` | `contact@koneksyonpam.com` | Adresse expéditeur |
| `GMAIL_APP_PASSWORD` | — | Mot de passe SMTP |
| `SMTP_HOST` | `smtp.hostinger.com` | Serveur SMTP |
| `SMTP_PORT` | `465` | Port SMTP |

### Administration

| Variable | Défaut | Rôle |
|----------|--------|------|
| `ADMIN_EMAILS` | `""` | Admins supplémentaires (CSV) |
| `MODERATOR_EMAILS` | `""` | Modérateurs (CSV) |

L'email `petefrans03@gmail.com` est toujours admin — failsafe hardcodé.

### Analytics

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (G-XXXXXXXXXX) |

### IA

| Variable | Rôle |
|----------|------|
| `CLAUDE_API_KEY` | Clé API Anthropic pour l'assistant IA |

---

## 5. Base de données

### Schéma Supabase (PostgreSQL)

Tables principales (extraites de l'usage dans le code) :

```sql
-- Profils utilisateurs (créés par Supabase Auth)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Demandes de prière
prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL DEFAULT 'Anonyme',
  text TEXT NOT NULL,
  country TEXT DEFAULT '🌍',
  pray_count INT DEFAULT 0,
  user_id UUID REFERENCES auth.users
)

-- Témoignages
testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  text TEXT NOT NULL,
  category TEXT,
  verse TEXT,
  likes INT DEFAULT 0,
  approved BOOL DEFAULT false
)

-- Groupes d'église
churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  founder_id UUID REFERENCES auth.users,
  member_count INT DEFAULT 1
)

-- Concours bibliques
contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('upcoming','active','voting','completed')),
  max_participants INT,
  current_question INT DEFAULT 0,
  created_at TIMESTAMPTZ
)

-- Dons PayPal
donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  paypal_order_id TEXT UNIQUE,
  paypal_capture_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending','completed','denied','refunded','webhook_confirmed')),
  donor_email TEXT,
  donor_name TEXT,
  webhook_confirmed_at TIMESTAMPTZ,
  raw_response JSONB
)

-- Messages de contact
contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  email TEXT,
  message TEXT
)
```

### Row Level Security (RLS)

- `donations` : RLS activé, aucune politique publique → accessible uniquement via `SUPABASE_SERVICE_ROLE_KEY` dans les API routes serveur.
- Les autres tables : RLS configuré selon les besoins (lecture publique pour prières/témoignages, écriture authentifiée).

### Indexes recommandés (scalabilité 100K+)

```sql
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonies_approved ON testimonies(approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_churches_founder ON churches(founder_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status, created_at DESC);
```

---

## 6. Système d'authentification

**Provider** : Supabase Auth avec Google OAuth uniquement.

**Flux** :
1. L'utilisateur clique "Se connecter avec Google"
2. Supabase redirige vers Google
3. Callback sur `/auth/callback/route.ts`
4. Supabase crée/met à jour la session dans un cookie sécurisé
5. Le middleware `/admin` vérifie la session à chaque requête

**Rôles** :
- `user` : tout utilisateur authentifié
- `moderator` : emails dans `MODERATOR_EMAILS` env var
- `admin` : `petefrans03@gmail.com` + emails dans `ADMIN_EMAILS` env var

**Fonctions** (`lib/admin.ts`) :
```typescript
isAdmin(user)      // true si admin
isModerator(user)  // true si admin ou modérateur
getRole(user)      // "admin" | "moderator" | "user"
```

---

## 7. API — Endpoints

### Format de réponse standard
```typescript
// Succès
{ data: T }
// Erreur
{ error: string }  // avec status HTTP approprié
```

### Endpoints publics

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/prayers` | Lister les prières (20 dernières) |
| POST | `/api/prayers` | Soumettre une prière |
| GET | `/api/testimonies` | Lister les témoignages |
| POST | `/api/testimonies` | Soumettre un témoignage |
| GET | `/api/churches` | Lister les groupes |
| POST | `/api/churches` | Créer un groupe |
| POST | `/api/contact` | Envoyer un message de contact |
| GET | `/api/platform-stats` | Stats publiques de la plateforme |
| POST | `/api/paypal/create-order` | Créer un ordre PayPal (serveur) |
| POST | `/api/paypal/capture-order` | Capturer un paiement PayPal (serveur) |
| POST | `/api/paypal/webhook` | Webhook PayPal (signature vérifiée) |

### Endpoints admin (auth requise)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/stats` | Statistiques complètes |
| GET | `/api/admin/data?table=X` | Lire une table |
| DELETE | `/api/admin/data` | Supprimer un enregistrement |
| GET | `/api/admin/donations` | Liste et stats des dons |
| GET | `/api/admin/donations?format=csv` | Export CSV des dons |

### Rate Limiting

- `/api/contact` : 5 req / 10 min par IP
- `/api/prayers` POST : 10 req / heure par IP
- `/api/paypal/create-order` : 20 req / heure par IP
- Note : rate limiter in-process. Pour 100K+ users → migrer vers Upstash Redis.

---

## 8. Système de paiement PayPal

### Architecture

```
Navigateur                 Serveur Next.js           PayPal API
    │                           │                         │
    │──PayPalScriptProvider──►  │                         │
    │                           │                         │
    │──createOrder──────────►  /api/paypal/create-order   │
    │                           │──POST /v2/orders────►   │
    │◄──────────────orderID─────│◄──────────────────────  │
    │                           │                         │
    │──PayPal popup─────────────────────────────────────► │
    │◄──────────────────────────────────────────approval──│
    │                           │                         │
    │──capture──────────────►  /api/paypal/capture-order  │
    │                           │──POST /v2/orders/X/cap─►│
    │                           │◄──COMPLETED─────────────│
    │                           │──INSERT donations────►Supabase
    │                           │──sendEmail──────────►SMTP
    │◄──────────success─────────│
    │──redirect /don/merci
```

### Fichiers clés

- `lib/paypal-server.ts` — OAuth token + webhook signature verification
- `app/components/PayPalDonateButton.tsx` — Composant React SDK
- `app/api/paypal/create-order/route.ts` — Création d'ordre (serveur)
- `app/api/paypal/capture-order/route.ts` — Capture + DB + email
- `app/api/paypal/webhook/route.ts` — Confirmation asynchrone PayPal

### Sécurité

- `PAYPAL_SECRET_KEY` jamais exposé au client
- Montants validés côté serveur (min $1, max $10 000)
- Idempotence : `PayPal-Request-Id` unique sur chaque ordre
- Webhook : signature cryptographique vérifiée via l'API PayPal officielle

---

## 9. Système d'emails

**Infrastructure** : Nodemailer + Hostinger SMTP (`smtp.hostinger.com:465`)

**Module central** : `lib/emails.ts`

**Templates disponibles** :

| Fonction | Déclencheur |
|----------|------------|
| `sendWelcomeEmail()` | Inscription nouvel utilisateur |
| `sendDonationThankYou()` | Paiement PayPal capturé |
| `sendContestConfirmation()` | Inscription à un concours |
| `sendPrayerNotification()` | Prières reçues pour une demande |
| `sendTestimonyPublished()` | Témoignage approuvé |
| `sendPasswordReset()` | Réinitialisation mot de passe |
| `sendNewsletter()` | Newsletter manuelle |

**Dégradation gracieuse** : si `GMAIL_APP_PASSWORD` n'est pas configuré, les emails sont ignorés silencieusement (log d'avertissement uniquement).

---

## 10. Traductions (i18n)

**Pattern** : 3 langues — `fr` (français), `ht` (haïtien créole), `en` (anglais).

**Contexte** : `lib/LangContext.tsx` — fournit `{ lang, setLang }` à tous les composants.

**Utilisation dans les composants** :
```typescript
const { lang } = useLang();
const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;

const txt = {
  title: { fr: "Bonjour", ht: "Bonjou", en: "Hello" }
};
const t = (k: keyof typeof txt): string => txt[k][l];
```

**Ajout d'une langue** :
1. Ajouter le code à `type Lang` dans `lib/LangContext.tsx`
2. Ajouter la traduction dans `lib/translations.ts` (clés globales)
3. Ajouter au switch dans `LangSwitch.tsx`
4. Tester page par page (les traductions inline par page sont indépendantes)

---

## 11. Administration

**Accès** : `/admin` — protégé par middleware Edge.

**Pages disponibles** :
- `/admin` — Vue d'ensemble, gestion de toutes les tables
- `/admin/dons` — Tableau de bord des dons avec export CSV
- `/admin/analytiques` — Analytics platform + intégration GA4

**Ajouter un admin** :
```
# Dans Vercel Dashboard → Settings → Environment Variables
ADMIN_EMAILS=email1@exemple.com,email2@exemple.com
```

**Ajouter un modérateur** :
```
MODERATOR_EMAILS=moderateur@exemple.com
```

---

## 12. Analytics

**Google Analytics 4** : s'active automatiquement si `NEXT_PUBLIC_GA_MEASUREMENT_ID` est configuré.

**Événements personnalisés** (à implémenter dans les composants) :
```typescript
import { trackEvent } from "@/app/components/Analytics";

// Exemple : tracker un don
trackEvent("donation", "PayPal", "completed", amount);

// Exemple : tracker une prière
trackEvent("prayer_submitted", "Community");
```

---

## 13. Sécurité

### Headers HTTP (next.config.ts)
- `Content-Security-Policy` : whitelist stricte (script, style, img, connect, frame)
- `Strict-Transport-Security` : HTTPS forcé, 2 ans, preload
- `X-Frame-Options: DENY` : protège contre le clickjacking
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy` : désactive caméra, micro, géolocalisation non-autorisée
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` : requis pour PayPal popup

### Rate Limiting
- In-process via `lib/rate-limit.ts`
- Appliqué sur : contact, prières, PayPal create-order
- **À migrer vers Upstash Redis** pour 100K+ users

### Supabase
- Service Role Key : jamais dans le client, jamais dans `NEXT_PUBLIC_`
- RLS activé sur la table `donations`
- Middleware Edge vérifie l'auth avant chaque accès `/admin`

### PayPal
- Secret Key : serveur uniquement, jamais loggé
- Webhook : signature cryptographique vérifiée
- Montants : validés côté serveur (jamais faire confiance au client)

---

## 14. Déploiement

### Prérequis
```bash
npm install -g vercel
vercel login
vercel link  # dans le dossier du projet
```

### Déploiement preview
```bash
vercel
```

### Déploiement production
```bash
vercel --prod
```

### Variables d'environnement (Vercel)
```bash
# Ajouter une variable (interactif)
vercel env add NOM_VARIABLE production

# Ou depuis le Dashboard : Settings → Environment Variables
```

### Build local
```bash
npm run build   # vérifie TypeScript + build Next.js
npm run dev     # développement local
```

---

## 15. Scalabilité

### Architecture actuelle (0 → 50K users)
- Vercel Fluid Compute : auto-scale illimité
- Supabase : jusqu'à 100K connexions simultanées (Pro plan)
- Stateless API routes : chaque requête est indépendante

### Pour 100K+ users simultanés
1. **Rate limiting** : migrer de in-process vers Upstash Redis
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```
2. **Caching API** : ajouter Redis cache sur `/api/prayers`, `/api/testimonies`
3. **CDN images** : utiliser Supabase Storage + CDN Vercel
4. **DB** : activer Supabase connection pooling (PgBouncer)
5. **Sessions** : activer Supabase Auth connection pooling

### Multi-admin / Multi-modérateur
- Déjà implémenté via `ADMIN_EMAILS` et `MODERATOR_EMAILS` env vars
- `lib/admin.ts` expose `isAdmin()`, `isModerator()`, `getRole()`

### Internationalisation supplémentaire
- Ajouter `pt` (portugais), `es` (espagnol) : modifier `type Lang` + `LangSwitch`
- Les traductions sont page par page → pas de régression

---

## 16. Procédures de maintenance

### Sauvegardes
- Supabase : backups automatiques quotidiens (Pro plan)
- Point-in-time recovery disponible sur Pro plan
- Pour sauvegardes manuelles : `supabase db dump` via CLI

### Surveillance des erreurs
- Vercel Logs : `vercel logs` en CLI ou Dashboard → Logs
- Pour monitoring avancé (recommandé) : installer Sentry
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- Variables requises : `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`

### Mise à jour des dépendances
```bash
npx npm-check-updates -u  # voir les mises à jour disponibles
npm install               # après validation
npm run build             # vérifier que tout compile
```

### Rotation du Secret PayPal
1. PayPal Dashboard → Your App → Secret → Rotate Secret
2. Copier le nouveau secret
3. Vercel Dashboard → Settings → Environment Variables → mettre à jour `PAYPAL_SECRET_KEY`
4. Redéployer : `vercel --prod`

### Checklist de release
- [ ] `npm run build` passe sans erreur
- [ ] TypeScript : 0 erreur (`npx tsc --noEmit`)
- [ ] Variables d'environnement à jour dans Vercel
- [ ] Table `donations` créée dans Supabase (si nouveau projet)
- [ ] Webhook PayPal configuré avec la bonne URL
- [ ] GA4 configuré si suivi analytics souhaité
- [ ] Domaine custom vérifié dans Vercel

---

*Pour toute question : contact@koneksyonpam.com*
