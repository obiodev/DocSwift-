# Emails DocSwift — qui envoie quoi

## État au 11/11/2026

| Élément | État |
|---|---|
| Table Supabase `newsletter_subscribers` | ✅ créée (RLS active) |
| Resend : domaine `getdocswift.com` (eu-west-1) | ✅ partiellement vérifié (DKIM + CNAME ✓, MX/TXT en propagation) |
| Resend : domaine `news.getdocswift.com` (eu-west-1) | ✅ partiellement vérifié (DKIM + CNAME ✓, MX/TXT en propagation) |
| Namecheap Mail Settings | ✅ Custom MX ; les 11 enregistrements sont en place (l'ancienne redirection d'emails est désactivée) |
| Railway (projet attractive-learning) | ✅ `EMAIL_FROM`, `RESEND_NEWSLETTER_SEGMENT_ID` ajoutés (sans redéploiement) |
| Railway : `EMAIL_REPLY_TO` | ⏳ à choisir |
| Stripe : prix HR Solo 49 € / Cabinet 129 € / Volume 290 € | ✅ (anciens 149 € et 349 € archivés) |
| Stripe : code promo `FONDATEUR` (-50 % 12 mois, 20 utilisations) | ✅ |
| Stripe : webhook HR `/api/webhooks/stripe` (6 événements dont `invoice.paid`, `trial_will_end`) | ✅ |
| Railway : `STRIPE_PRICE_HR_*`, `STRIPE_HR_WEBHOOK_SECRET`, `GEMINI_MODEL` | ✅ ajoutés (sans redéploiement) |
| Alertes prospects de l'assistant | envoyées à `ADMIN_EMAIL` (ou `SALES_ALERT_EMAIL` si défini) |
| Resend : segment « DocSwift Newsletter » | ✅ `f467b52d-24d3-4f5e-b68e-fcee50b2a253` |
| Suivi d'ouverture / de clics | désactivé (RGPD) |

### Enregistrements DNS à ajouter chez Namecheap (Advanced DNS)

Les deux enregistrements existants (CNAME `@` → Railway, TXT `_railway-verify`) ne changent pas.

| Type | Hôte | Valeur | Priorité |
|---|---|---|---|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJ3ig6uSpov5zzR1RoDEpl9w4P+448BVrSG215lOFurIwMtpIO3nbI8tUaUfm5duZdQVmU209hTAbzc5DtrkEfaLQvO+9UPg+IMkHJupFOYpfgZBAP1GeJutg0wFxMdcbFDqRAT9tqFU8m6YkpQSEFGWvVuWJTUCfuBjtyq0MMVwIDAQAB` | |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | |
| CNAME | `rsend` | `send.forge.rmta.net` | |
| TXT | `resend._domainkey.news` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7ZIU+yLHIb+sR/oEc/GjUAkpoAUk3oJJKi5E2KaS7OfSOEYMbawmDUQNULWqkbRm0V5mpN1Zf+lKnyD61URlK5D5JCKlKs1VBy40sbBirjXyrNtfN2TD1wEr7Y7vhEwSF/Qv/qoh+a8SLTgWrYWNpwEFvbkf2WswYtfmRIB9BLQIDAQAB` | |
| MX | `send.news` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
| TXT | `send.news` | `v=spf1 include:amazonses.com ~all` | |
| CNAME | `rsend.news` | `send.forge.rmta.net` | |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | |

Les MX ne sont acceptés par Namecheap que si **Mail Settings = Custom MX** (Domain → Advanced DNS).
Puis, dans Resend : Domains → chaque domaine → **Verify**.

### Boîte de réponse

Le domaine racine pointe vers Railway par un CNAME sur `@`, ce qui empêche d'y ajouter des MX : `contact@getdocswift.com` ne peut donc pas recevoir d'emails tel quel.
En attendant, mettre dans Railway `EMAIL_REPLY_TO` = une adresse que vous lisez déjà.
Solution propre plus tard : remplacer le CNAME `@` par l'enregistrement ALIAS/A recommandé par Railway, puis activer Email Forwarding chez Namecheap.

Une seule plateforme, **Resend** (déjà intégrée), plus les emails natifs de **Stripe** pour les factures.

| Type | Envoyé par | Expéditeur | Exemples |
|---|---|---|---|
| Compte | Resend (code) | `hello@getdocswift.com` | confirmation d'email, bienvenue |
| Abonnement HR | Resend (code, webhook Stripe) | `hello@getdocswift.com` | essai démarré, fin d'essai J-3, paiement échoué, résiliation |
| Factures et reçus | **Stripe** | `hello@getdocswift.com` (via Stripe) | facture PDF, reçu de paiement, carte expirée |
| Newsletter | **Resend Broadcasts** (tableau de bord) | `news@news.getdocswift.com` | conseils, nouveautés |

Pourquoi un sous-domaine pour la newsletter : si des lecteurs la marquent comme spam, la réputation des emails de compte et de facturation n'est pas touchée.

## 1. Resend — domaine d'envoi (≈ 15 min)

1. resend.com → **Domains → Add domain** → `getdocswift.com`, région **eu-west-1** (Irlande, données dans l'UE).
2. Copier dans le DNS du domaine les enregistrements affichés (MX + TXT SPF sur `send.`, TXT DKIM `resend._domainkey`).
3. Ajouter un DMARC si absent : `TXT _dmarc` → `v=DMARC1; p=none; rua=mailto:contact@getdocswift.com`
4. Refaire l'étape 1 pour `news.getdocswift.com`.
5. Attendre « Verified ».

## 2. Resend — newsletter

1. **Contacts → Segments → Create** « Newsletter » → copier l'ID.
2. Pour envoyer : **Broadcasts → New**, choisir le segment, expéditeur `DocSwift <news@news.getdocswift.com>`.
   Resend ajoute automatiquement le lien de désinscription et l'en-tête `List-Unsubscribe`.

Les inscrits arrivent par le formulaire de `/hr` → email de confirmation → `/api/newsletter/confirm` → ajout au segment.
La preuve du consentement (date, IP, texte accepté) est gardée dans la table `newsletter_subscribers`.

## 3. Variables d'environnement (Railway)

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=DocSwift <hello@getdocswift.com>
EMAIL_REPLY_TO=contact@getdocswift.com      # une vraie boîte que vous lisez
RESEND_NEWSLETTER_SEGMENT_ID=f467b52d-24d3-4f5e-b68e-fcee50b2a253
```

`contact@getdocswift.com` doit exister : redirection gratuite via le registrar, Cloudflare Email Routing ou ImprovMX.

## 4. Stripe — factures et relances

**Settings → Customer emails** :
- ✅ Successful payments (reçus)
- ✅ Finalized invoices (factures PDF, obligatoires en B2B)
- ✅ Expiring cards
- ✅ Failed payments (Smart Retries)
- Domaine d'envoi personnalisé : **Settings → Emails → Add domain** `getdocswift.com`

**Settings → Public details / Branding** : nom légal Motoko LLC, adresse, logo, email `contact@getdocswift.com`.
**Settings → Invoice template** : mentions légales et numéro de TVA si applicable.

**Webhook HR** (`/api/webhooks/stripe`), événements à cocher :
`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`,
`customer.subscription.trial_will_end`, `invoice.paid`, `invoice.payment_failed`.

## 5. Coût

| Service | Gratuit | Ensuite |
|---|---|---|
| Resend transactionnel | 3 000 emails/mois | ~20 $/mois (50 000) |
| Resend newsletter | jusqu'à 1 000 contacts | ~40 $/mois (5 000 contacts) |
| Stripe emails | inclus | inclus |

Tarifs à revérifier sur resend.com/pricing au moment de souscrire.
