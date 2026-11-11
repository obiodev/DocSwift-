# DocSwift — Verdict & plan MRR (11/11/2026)

Synthèse de 4 audits (sécurité, architecture, marché, funnel).

## Verdict

**Bon projet à une condition : ne garder que DocSwift HR.**

| Verticale | Décision | Pourquoi |
|---|---|---|
| **DocSwift HR** (tri de CV par IA) | **Garder, tout miser dessus** | Vend un gain de temps mesurable à un acheteur B2B qui paie |
| Outils PDF | Geler (pages gardées pour le SEO) | Marché saturé ; iLovePDF fait mieux, moins cher (5–9 €) |
| CV Builder | Geler | B2C faible valeur face à Canva/Zety |
| Academic | Arrêter | Pas d'ICP, et classé « haut risque » AI Act lui aussi |

Vrais concurrents : **ChatGPT gratuit** et les fonctions IA des ATS (Flatchr, Manatal, Teamtailor).
Ce qui fait gagner : **conformité RGPD/AI Act intégrée + FR/AR + niche Maghreb/Afrique francophone + prix**.

## Positionnement

- **Cible n°1** : cabinets de recrutement et recruteurs indépendants (1–5 personnes) en France, Maroc, Tunisie, Sénégal, Côte d'Ivoire.
- **Cible n°2** : centres d'appels / BPO qui recrutent en masse.
- **Promesse** : « Votre shortlist argumentée en 10 minutes. L'IA classe et justifie, vous décidez. »

## Grille tarifaire recommandée (à valider — nécessite de nouveaux prix Stripe)

| Offre | Prix HT | Contenu |
|---|---|---|
| À l'annonce | 29 € une fois | 1 poste, 300 CV, 30 jours |
| Solo | 49 €/mois | 300 CV/mois, 1 utilisateur |
| **Cabinet** | 129 €/mois | 1 500 CV/mois, 3 utilisateurs, rapport client à votre marque |
| Volume / BPO | dès 290 €/mois | sur devis |

Annuel -20 %. Coupon Afrique/Maghreb -40 %. Code **FONDATEUR** -50 % à vie pour les 20 premiers.
Grille actuelle (49/149/349 €) : 149 et 349 € coûtent autant qu'un ATS complet.

## Plan 90 jours

**Semaines 1–2**
1. Exécuter `supabase/2026-11_security_billing.sql`, puis déployer le code corrigé.
2. Vérifier en prod qu'une analyse HR aboutit (nouveau modèle Gemini) avec une **clé Gemini payante**.
3. Installer un outil d'analytics (Plausible ou PostHog) avec les événements essai → paiement.
4. Enregistrer une démo vidéo de 90 s ; créer une page « Conformité » (DPA, sous-traitants, durée de conservation).

**Jours 1–45 → 10 clients payants (vente à la main)**
- LinkedIn : 25 messages/jour à des recruteurs indépendants et cabinets (FR, MA, TN, SN).
- Offre concierge : « Envoyez-moi les CV de votre dernière annonce, je vous renvoie la shortlist en 1 h. »
- Message type :
  > Bonjour [Prénom], combien de temps vous a pris le tri de votre dernière annonce ? J'ai construit un outil qui classe 300 CV contre une fiche de poste en 10 minutes, avec la justification critère par critère. Vous gardez la décision. Je vous offre le tri de votre prochaine annonce, ça vous dit ?
- Relance J+4 avec la vidéo : « Si ça ne vous fait pas gagner 3 heures, vous ne payez rien. »

**Jours 45–90 → 50 clients**
- Partenariats : jobboards locaux (Maroc, Afrique de l'Ouest), formateurs RH, experts-comptables (commission 20 %).
- SEO : « trier 200 CV rapidement », « IA recrutement RGPD », « alternative à ChatGPT pour trier les CV ».
- 30 centres d'appels ciblés, avec un pilote gratuit d'un mois.

**Indicateurs hebdo** : messages envoyés, taux de réponse (cible 10–15 %), essais, conversion essai → payant (cible 25 %).

## Objectifs MRR (estimations)

| Horizon | Clients | MRR visé | Fourchette |
|---|---|---|---|
| 3 mois | 10–12 | 600–800 € | 300–1 200 € |
| 6 mois | 25–30 | 1 700–2 000 € | 900–3 500 € |
| 12 mois | 50–70 | 3 500–5 000 € | 1 800–8 000 € |

**Point de décision à 6 mois** : MRR < 1 000 € et churn > 10 % → pivot vers l'offre « à l'annonce » seule, ou arrêt.

## Séquence d'emails d'essai (à brancher sur Resend)

1. **J0** — « Vos 5 CVs sont triés : voici le top 3 » → importer toutes les candidatures.
2. **J2** — « Le réglage qui rend les scores 2× plus pertinents » (fiche de poste précise).
3. **J7** — « [X] CVs triés, environ [Y] h gagnées » → proposer 15 min d'appel.
4. **J12** (`customer.subscription.trial_will_end`) — « Votre essai se termine dans 48 h ».

## Obligations légales (avant de vendre)

- **RGPD art. 22** : jamais de rejet automatique ; le recruteur décide. ✅ Inscrit dans le produit.
- Minimisation : coordonnées masquées avant Gemini. ✅ Fait.
- **Clé Gemini payante** (pas d'entraînement sur les données). ⚠️ À vérifier.
- Contrat de sous-traitance (DPA) + modèle de mention d'information candidat à fournir aux clients. ⚠️ À faire.
- Motoko LLC (US) : probable besoin d'un **représentant dans l'UE** (RGPD art. 27, AI Act art. 22). ⚠️ Avis d'avocat.
- **AI Act haut risque** : obligations applicables au **2 décembre 2027** (journalisation, documentation, tests de biais, marquage CE).

## Reste à faire côté technique

- Stockage des CV en base64 dans Postgres → Supabase Storage.
- Traitement HR lancé en tâche de fond non suivie → file de jobs (un redéploiement interrompt une analyse).
- Pages /en/hr et /ar/hr affichées en français ; JSON-LD HR non lu par Google.
- Outils PDF : la « compression » ne compresse quasiment pas ; Word→PDF perd la mise en forme et plante sur l'arabe.
- Palier Premium (outils protect/unlock) impossible à acheter.
- Aucun test, pas de Sentry, 48 erreurs de lint préexistantes.
