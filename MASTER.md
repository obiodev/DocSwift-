# DocSwift — Master File

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16.2.2 App Router |
| UI | React 19.2.4 + Tailwind CSS 4 |
| i18n | next-intl 4.9 (FR/EN/AR) |
| Auth | NextAuth 4 (Google OAuth) |
| DB | Supabase (PostgreSQL + RLS) |
| Paiement | Stripe 21 |
| PDF | pdf-lib + pdfjs-dist |
| DOCX | mammoth + docx |
| Déploiement | Railway (nixpacks) |

---

## Structure des fichiers

```
docswift/
├── app/
│   ├── layout.js                    # Root layout, fonts, metadata
│   ├── page.js                      # Redirect → /fr
│   ├── error.js                     # Error boundary global
│   ├── not-found.js                 # 404
│   ├── SessionProviderWrapper.js    # NextAuth + capture ref affilié
│   │
│   ├── [locale]/                    # Routes i18n (fr/en/ar)
│   │   ├── layout.js                # RTL pour arabe, NextIntlClientProvider
│   │   ├── page.js                  # Landing page
│   │   ├── tools/page.js            # Interface outils + pub
│   │   ├── cv/page.js               # CV builder live
│   │   ├── admin/page.js            # Redirect admin
│   │   └── terms/page.js            # CGU
│   │
│   ├── admin/page.js                # Dashboard admin
│   │
│   └── api/
│       ├── auth/[...nextauth]/      # OAuth flow
│       ├── convert/route.js         # 6 outils de conversion
│       ├── cv/route.js              # Génération PDF CV
│       ├── usage/route.js           # Stats usage quotidien
│       ├── settings/route.js        # Tarifs publics (cache 5min)
│       ├── ads/route.js             # HTML pub récompensée
│       ├── stripe/
│       │   ├── checkout/route.js    # Créer session paiement
│       │   ├── portal/route.js      # Portail facturation
│       │   └── webhook/route.js     # Événements Stripe
│       └── admin/
│           ├── settings/route.js    # Config prix/promo
│           ├── users/route.js       # Gestion utilisateurs
│           ├── payments/route.js    # Historique paiements
│           ├── ads/route.js         # Gestion HTML pubs
│           ├── affiliates/route.js  # Codes affiliés
│           └── gift/route.js        # Abonnements offerts
│
├── components/
│   └── LanguageSwitcher.js          # Sélecteur FR|EN|AR
│
├── lib/
│   ├── auth.js                      # Config NextAuth
│   ├── supabase.js                  # Clients + getFreeLimit() + usage
│   └── pdfToDocx.js                 # Extraction PDF → DOCX
│
├── i18n/request.js                  # Config next-intl serveur
├── messages/
│   ├── fr.json                      # Français (défaut)
│   ├── en.json                      # Anglais
│   └── ar.json                      # Arabe
│
├── proxy.js                         # Middleware next-intl (Next.js 16)
├── next.config.mjs                  # Config Next.js + sécurité
├── railway.toml                     # Config Railway
├── nixpacks.toml                    # npm install au lieu de npm ci
└── .npmrc                           # engine-strict=false
```

---

## Variables d'environnement

```env
# NextAuth (obligatoire)
NEXTAUTH_URL=https://getdocswift.com
NEXTAUTH_SECRET=<32 chars random>

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx

# Admin
ADMIN_EMAIL=ton@email.com
```

---

## Base de données Supabase

| Table | Colonnes clés | Usage |
|-------|--------------|-------|
| `subscriptions` | user_email, status (free/pro), stripe_subscription_id | Abonnements |
| `usage_logs` | identifier, date, count | Compteur quotidien |
| `settings` | key, value | Config admin (free_limit, promo, etc.) |
| `affiliates` | code, commission_rate, status | Affiliés |
| `referrals` | affiliate_code, referred_email, commission_cents | Conversions affiliés |

---

## Flux de conversion (logique métier)

```
Utilisateur → Upload fichier
  ↓
/api/convert → getUsageToday() + getFreeLimit()
  ↓ (quota ok ?)
  Oui → Conversion → incrementUsage() → base64 retourné
  Non → 429 LIMIT_REACHED → modale pub 30s → +3 bonus
  ↓ (pro ?)
  Oui → illimité, bypass quota
```

---

## Routes API

| Route | Méthode | Auth | Rôle |
|-------|---------|------|------|
| `/api/convert` | POST | Optionnelle | 6 conversions fichiers |
| `/api/cv` | POST | Optionnelle | Génération PDF CV |
| `/api/usage` | GET | Optionnelle | Stats quota |
| `/api/settings` | GET | Aucune | Prix publics |
| `/api/stripe/checkout` | POST | Session | Paiement Pro |
| `/api/stripe/webhook` | POST | Signature | Mise à jour sub |
| `/api/admin/*` | GET/PUT | ADMIN_EMAIL | Back-office |

---

## Fonctionnalités

### Outils gratuits (5/jour par IP ou email)
- PDF → Word
- Word → PDF
- Compresser PDF
- Fusionner PDFs
- Diviser PDF
- Image → PDF

### CV Builder
- 3 templates : Classique, Moderne, Minimaliste
- 10 couleurs personnalisables
- Photo intégrée (base64)
- Preview live (desktop)
- Labels multilingues (FR/EN/AR)
- Sections : infos, expériences, formations, compétences, langues, projets, certifications, centres d'intérêt

### Monétisation
- Gratuit : 5 conv/jour → pub 30s → +3 bonus
- Pro : 9,99€/mois (promo 4,99€ / 3 mois) → illimité
- Affiliés : code `?ref=CODE` → commission configurable

### Internationalisation
- FR (défaut, URL sans préfixe)
- EN → `/en`
- AR → `/ar` (RTL, police Arabic)
- Cookie `NEXT_LOCALE` persisté 1 an
- Stratégie `as-needed` (next-intl)

---

## Logique d'authentification

```
Google OAuth → NextAuth session
  ↓
session.user.isPro = await isPro(email)   ← Supabase subscriptions table
  ↓
Toutes les routes API lisent la session
  → Pro = quota illimité
  → Free = quota daily depuis usage_logs
```

---

## Logique Stripe

```
Clic "Upgrade" → /api/stripe/checkout
  → Lit affiliateCode depuis localStorage
  → Crée Checkout Session avec metadata { userEmail, affiliateCode }
  → Redirect vers Stripe

Paiement confirmé → Stripe Webhook
  → checkout.session.completed
    → Upsert subscriptions (status = "pro")
    → Si affiliateCode → Insert referrals + calcule commission
  → customer.subscription.updated → Met à jour status
  → customer.subscription.deleted → status = "free"
```

---

## Sécurité

Headers HTTP configurés dans `next.config.mjs` :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Header `X-Powered-By` supprimé

---

## Déploiement Railway

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

```toml
# nixpacks.toml
[phases.install]
cmds = ["npm install --production=false"]
```

```
# .npmrc
engine-strict=false
```

**Node.js** : `>=18.17.0` (défini dans `package.json` → `engines`)

---

## Commits récents

| Hash | Description |
|------|-------------|
| `48cb67c` | fix: utiliser npm install au lieu de npm ci |
| `167c8df` | fix: sync package-lock.json (@swc/helpers) |
| `d2b4405` | fix: engine-strict=false pour Railway |
| `da69df9` | fix: engines Node>=18 + railway.toml |
| `f3f5cf0` | feat: i18n FR/EN/AR avec next-intl |
| `53557b2` | feat: optimisations, 404/erreur, limite dynamique |
| `7b7e149` | feat: CV builder - photo, templates, projets |
| `b86659e` | feat: prix promo 4.99€, paramètres admin, CGU |

---

## Points d'attention

1. `proxy.js` = middleware Next.js 16 (pas `middleware.js` — conflit fatal)
2. `getFreeLimit()` est mis en cache 5 min en mémoire (évite trop de requêtes Supabase)
3. Identifier = email (connecté) ou IP (anonyme) pour le quota
4. Le CV builder masque le preview sur mobile (<900px)
5. `pdfToDocx.js` extrait uniquement le texte — pas les images ni les tableaux complexes
6. `converter.py` est legacy et non utilisé
7. Les tables Supabase sont à créer manuellement (pas de migrations versionnées)
