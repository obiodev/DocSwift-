# DocSwift

> Every PDF tool you'll ever need.

Plateforme web B2B d'outils PDF et d'analyse de documents par IA. Convertissez, compressez, fusionnez vos PDFs, générez des CVs professionnels et analysez 100 candidatures en 2 minutes grâce à l'IA.

🌐 **[getdocswift.com](https://getdocswift.com)** — Disponible en FR / EN / AR

---

## Fonctionnalités

### Outils PDF
| Outil | Plan |
|-------|------|
| PDF → Word | Gratuit |
| Word → PDF | Gratuit |
| Compresser PDF | Gratuit |
| Fusionner PDFs | Gratuit |
| Diviser PDF | Gratuit |
| Image → PDF | Gratuit |
| Protéger PDF (mot de passe) | Premium |
| Déverrouiller PDF | Premium |
| Compresser image | Premium |

### CV Builder
- 3 templates (Classique, Moderne, Minimaliste)
- 10 couleurs personnalisables
- Photo intégrée
- Preview live
- Export PDF
- Multilingue (FR/EN/AR)

### DocSwift HR *(Pro)*
- Upload de 100 CVs en masse
- Scoring et classement automatique par IA (Gemini)
- Export des résultats

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16.2.2 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Auth | NextAuth 4 (Google OAuth + Email/Password) |
| Base de données | Supabase (PostgreSQL + RLS) |
| Paiement | Stripe 21 |
| IA | Google Gemini |
| PDF | pdf-lib + pdfjs-dist |
| Word | mammoth + docx |
| Emails | Resend |
| i18n | next-intl 4 (FR/EN/AR) |
| Déploiement | Railway (nixpacks) |

---

## Installation locale

### Prérequis
- Node.js >= 18.17.0
- Un projet Supabase
- Un compte Stripe (mode test)
- Une clé API Google Gemini
- Un compte Resend (emails)

### 1. Cloner le repo

```bash
git clone https://github.com/obiodev/DocSwift-
cd DocSwift-
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplissez `.env.local` avec vos valeurs (voir section [Variables d'environnement](#variables-denvironnement)).

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Variables d'environnement

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                        # openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=              # Ne jamais exposer côté client

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (emails transactionnels)
RESEND_API_KEY=re_...
EMAIL_FROM=DocSwift <noreply@getdocswift.com>

# Google Gemini (analyse HR)
GEMINI_API_KEY=

# Admin
ADMIN_EMAIL=                            # Email avec accès /admin

# Google Search Console (optionnel)
GOOGLE_SITE_VERIFICATION=
```

---

## Structure du projet

```
DocSwift/
├── app/
│   ├── layout.js                    # Root layout, métadonnées SEO, JSON-LD
│   ├── [locale]/                    # Routes i18n (fr / en / ar)
│   │   ├── page.js                  # Landing page
│   │   ├── tools/page.js            # Outils PDF
│   │   ├── cv/page.js               # CV Builder
│   │   ├── dashboard/               # Dashboards utilisateur
│   │   └── terms/page.js            # CGU
│   ├── admin/                       # Back-office admin
│   └── api/
│       ├── convert/route.js         # Conversions PDF/Word/Image
│       ├── cv/route.js              # Génération PDF CV
│       ├── usage/route.js           # Quota quotidien
│       ├── hr/                      # Analyse RH par IA
│       ├── stripe/                  # Checkout, portail, webhook
│       └── admin/                   # API admin (users, pubs, affiliés)
├── components/
│   └── LanguageSwitcher.js
├── lib/
│   ├── auth.js                      # Config NextAuth
│   ├── supabase.js                  # Client + helpers usage/plans
│   ├── plans.js                     # Source unique des plans (free/pro/premium/business)
│   ├── email.js                     # Templates emails Resend
│   └── pdfToDocx.js                 # Extraction texte PDF → DOCX
├── messages/
│   ├── fr.json                      # Traductions françaises
│   ├── en.json                      # Traductions anglaises
│   └── ar.json                      # Traductions arabes
├── proxy.js                         # Middleware i18n (Next.js 16)
└── next.config.mjs                  # Config Next.js + headers sécurité
```

---

## Base de données

Tables Supabase à créer manuellement :

| Table | Colonnes principales | Rôle |
|-------|---------------------|------|
| `users` | id, email, name, password_hash, avatar_url, provider | Comptes utilisateurs |
| `subscriptions` | user_email, status, stripe_subscription_id | Plans (free/pro/premium/business) |
| `usage_logs` | identifier, date, count | Quota quotidien par email ou IP |
| `settings` | key, value | Config admin (free_limit, prix promo…) |
| `hr_jobs` | id, user_email, title, description, status, cv_count | Sessions d'analyse RH |
| `hr_cv_analyses` | id, job_id, filename, score, status, summary | Résultats par CV |
| `affiliates` | code, commission_rate, status | Codes affiliés |
| `referrals` | affiliate_code, referred_email, commission_cents | Conversions affiliés |

Fonctions RPC requises :
- `increment_usage(p_identifier, p_date)` — incrémentation atomique du quota
- `hr_increment_analyzed(p_job_id)` — incrémentation du compteur RH

---

## Modèle économique

| Plan | Prix | Limites |
|------|------|---------|
| Gratuit | 0€ | 5 conversions/jour |
| Pro | 9,99€/mois | Conversions illimitées + outils premium |
| Business | Sur devis | Tout Pro + fonctionnalités RH avancées |

Les utilisateurs gratuits peuvent regarder une publicité (30s) pour débloquer +3 conversions bonus.

---

## Déploiement Railway

Le projet est préconfiguré pour Railway via `railway.toml` et `nixpacks.toml`.

1. Créez un service Railway depuis ce repo GitHub
2. Ajoutez toutes les variables d'environnement de production
3. Railway build et démarre automatiquement avec `npm start`

Variables supplémentaires en production :
```env
NEXTAUTH_URL=https://getdocswift.com
NODE_ENV=production
```

---

## Sécurité

- **Content-Security-Policy** configurée dans `next.config.mjs`
- **HSTS** (Strict-Transport-Security) activé
- Publicités rendues dans une **iframe sandboxée** (protection XSS)
- Quota protégé par incrémentation atomique côté base de données
- Rate limiting sur l'inscription (5 tentatives/h par IP)
- Variables sensibles exclusivement côté serveur (`SUPABASE_SERVICE_ROLE_KEY`, etc.)

---

## Commandes

```bash
npm run dev      # Développement (http://localhost:3000)
npm run build    # Build production
npm run start    # Démarrage production
npm run lint     # Vérification ESLint
```

---

## Licence

Propriétaire — © 2026 Mokoto LLC. Tous droits réservés.
