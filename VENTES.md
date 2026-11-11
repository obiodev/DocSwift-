# DocSwift HR — Playbook commercial (v1, 11/11/2026)

> Objectif : signer les **20 premiers clients FONDATEUR en 6 semaines**, puis industrialiser.
> Règle d'or : on ne contacte personne sans une raison datée (une annonce, une ouverture de site, un pic de recrutement). Pas de raison = pas de message.
> Le fondateur envoie lui-même tous les messages. Ce document ne contient aucune donnée personnelle : uniquement des entreprises et des rôles.

---

## 0. Ce qu'on vend (faits stricts — ne rien promettre d'autre)

| Élément | Fait produit |
|---|---|
| Promesse | Votre shortlist argumentée en 10 minutes. L'IA classe et justifie, le recruteur décide. |
| Sortie | Pour chaque CV : score /100, statut (Recommandé / À considérer / Non retenu), 2 à 4 points forts, 2 à 4 points faibles, résumé d'une phrase. Tri par score, export CSV/Excel. |
| Capacité | Jusqu'à 100 CV PDF par analyse, 5 Mo max par CV. PDF texte uniquement (un scan image n'est pas lu). |
| Langues | Français, anglais, arabe. |
| Conformité | Aucune décision automatique (RGPD art. 22). Coordonnées (email, téléphone, liens) masquées avant l'IA. Critères discriminants ignorés (âge, genre, origine, photo, adresse, religion, handicap...). PDF effacé après analyse. Base de données dans l'UE (Irlande). Les CV n'entraînent pas de modèle. |
| Essai | 5 CV gratuits **sans compte** sur https://getdocswift.com/hr/essai-gratuit, puis **14 jours d'essai** (carte demandée, 0 € débité avant J14, résiliable en 1 clic, rappel 3 jours avant la fin). |
| Prix HT/mois, sans engagement | **Solo 49 €** (300 CV, 1 utilisateur) · **Cabinet 129 €** (1 500 CV, 3 recruteurs, support prioritaire) · **Volume 290 €** (5 000 CV, utilisateurs illimités, interlocuteur dédié). Au-delà : devis. |
| Offre de lancement | Code **FONDATEUR** : -50 % pendant 12 mois, 20 premiers clients → Solo 24,50 €, Cabinet 64,50 €, Volume 145 € /mois. |
| Ce qu'on n'a PAS | Pas d'intégration ATS, pas d'API, pas d'application mobile. Ne jamais laisser croire le contraire. |

N'utilisez pas l'offre « à l'annonce 29 € » ni un coupon Afrique -40 % : ils sont recommandés dans STRATEGIE_MRR.md mais **n'existent pas** dans le produit. Le seul code de réduction, c'est FONDATEUR.

### Prérequis avant le 1er message (bloquants)
1. Une analyse HR de bout en bout fonctionne en production (STRATEGIE_MRR.md, semaines 1–2).
2. La clé Gemini est bien **payante**. C'est la condition pour dire « les CV n'entraînent pas de modèle ».
3. Le DPA (contrat de sous-traitance) et un modèle de mention d'information candidat sont prêts à envoyer en PDF. On vous les demandera dès le premier BPO.
4. La démo vidéo de 90 s est en ligne (lien non répertorié).
5. Une adresse email d'envoi dédiée (sous-domaine, SPF/DKIM/DMARC configurés), à 20–30 envois manuels/jour maximum.

### Valeur économique à citer (calcul, pas promesse)
- Tri manuel : 1 à 2 min par CV en lecture rapide. 300 CV, c'est 5 à 10 h de recruteur par annonce.
- DocSwift : 300 CV en 3 analyses de 100, le recruteur relit seulement le top 20–30.
- Pour un cabinet, 3 h économisées par annonce valent plus que les 64,50 € du plan Cabinet FONDATEUR, dès la première annonce du mois.

---

## 1. ICP priorisés et déclencheurs d'achat

Classement par **vitesse de signature × valeur** pour un fondateur seul.

| Rang | ICP | Plan cible | Pourquoi maintenant | Déclencheur d'achat (signal à surveiller) | Disqualifiants |
|---|---|---|---|---|---|
| **1** | **Cabinets de recrutement 1–10 pers.** (Maroc, Tunisie, Sénégal, Côte d'Ivoire, France) | Solo / Cabinet | Le décideur est aussi l'utilisateur et paie lui-même. Cycle de quelques jours. | Une annonce publiée avec beaucoup de candidatures (« 200+ candidats » sur LinkedIn), un nouveau mandat volume, l'arrivée d'un nouveau consultant, un post qui se plaint du tri. | Chasse de têtes pure (moins de 30 CV par poste) ; cabinet déjà équipé d'un ATS avec IA et satisfait. |
| **2** | **Centres d'appels / BPO offshore** (Maroc d'abord, puis Tunisie, Sénégal, Côte d'Ivoire) | Volume (pilote sur un site ou une campagne) | Recrutement continu et massif de conseillers, turnover élevé, CV en FR/EN/AR. Plus gros panier. | Ouverture de plateau ou de campagne, offres multiples sur moncallcenter.ma / Rekrute, « job days ». Autre signal : réorganisation après la fin du démarchage téléphonique non consenti vers la France (août 2026), qui change les profils à recruter. | Groupes dont le recrutement est centralisé à l'étranger sur un ATS imposé : passez par un directeur de site, pas par le siège. |
| **3** | **Agences d'intérim** (Maroc, Tunisie) | Cabinet / Volume | Gros volumes de CV sur des profils répétitifs, avec des délais de quelques heures. | Pic saisonnier (été, fin d'année, logistique, industrie automobile à Tanger et Kénitra), gain d'un gros client, ouverture d'agence. | Agence qui ne reçoit pas de CV PDF (candidature uniquement par formulaire ou WhatsApp vocal). |
| **4** | **PME qui recrutent en volume** (retail, logistique, santé, hôtellerie, centres de formation) | Solo / Cabinet | Pas de recruteur dédié : c'est le dirigeant ou un RRH seul qui trie. | Plus de 5 offres ouvertes en même temps, ouverture d'un site ou d'une agence, levée de fonds, saison. | Moins de 3 recrutements par an. |

**Où ça se joue dans les 6 semaines** : ICP 1 et ICP 2 représentent 80 % de l'effort. L'ICP 1 apporte les premières signatures rapides (Solo/Cabinet), l'ICP 2 les gros paniers (Volume).

Mix réaliste des 20 FONDATEUR : 12 Solo + 6 Cabinet + 2 Volume, soit 294 + 387 + 290 = **971 € de MRR** à -50 %, puis environ 1 940 € à la fin de la remise.

---

## 2. Liste de 60 entreprises cibles (réelles, vérifiées sur le web le 11/11/2026)

Règles d'usage :
- **Priorité A** : signal de recrutement visible et décideur joignable. **B** : bonne cible, signal à confirmer. **C** : grand groupe, cycle long ; viser un site ou une campagne précise, jamais le siège.
- La colonne « Site / fiche » donne le site officiel s'il est certain. Sinon, elle renvoie à la fiche publique de l'annuaire source : **vérifiez le site officiel avant tout contact**.
- Certaines listes de cabinets datent de 2020 (source e-grh). Vérifiez que l'entreprise est toujours active (site en ligne, offres récentes).
- Fusions récentes : Majorel fait partie de Teleperformance (TP), Webhelp de Concentrix, et Sitel s'appelle désormais Foundever.

Sources (abréviations utilisées dans le tableau) :
- [S1] jobsquare.ma : « Emploi en centre d'appel au Maroc 2026 »
- [S2] moncallcenter.ma : liste des centres d'appels (moncallcenter.ma/centres-appels.php)
- [S3] emploidakar.com : recrutement centres d'appels Sénégal
- [S4] emploidakar.com : recrutement centres d'appels Côte d'Ivoire
- [S5] e-grh.com : liste des cabinets de recrutement au Maroc (2020)
- [S6] jobsquare.ma : agences d'intérim au Maroc 2026
- [S7] miepeec.gov.ma : liste des agences de recrutement privées autorisées
- [S8] recherche web directe sur le site de l'entreprise
- [S9] callofsuccess.com : fiches pays Tunisie et Maroc
- [S10] invest-for-jobs.com : projet Way2Call Sénégal

### 2.1 BPO / centres d'appels — Maroc (en premier)

| # | Entreprise | Pays | Ville | Type | Site / fiche | Pourquoi c'est une cible | Prio | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | Intelcia Group | Maroc | Casablanca (+ Rabat, Fès, Marrakech, Tanger) | BPO | intelcia.com | Plus de 30 000 collaborateurs, premier employeur BPO du Maroc. Recrutement continu sur plusieurs sites. Visez un pilote Volume sur un seul plateau (Fès). | C | S1 |
| 2 | Teleperformance (TP) Maroc | Maroc | Casablanca, Rabat... | BPO | teleperformance.com · moncallcenter.ma/teleperformance | Recrutement permanent de conseillers (« Rejoignez TP ! »). Après l'intégration de Majorel, les volumes sont énormes. | C | S2 |
| 3 | Foundever Maroc | Maroc | Casablanca, Rabat, Fès | BPO | foundever.com | Recrute des conseillers francophones et bilingues FR/EN sur 3 villes. | C | S1, S8 |
| 4 | Konecta (Tanger, Atlas, Marina) | Maroc | Tanger, Casablanca | BPO | moncallcenter.ma/konecta-tanger | 3 fiches recruteur actives, donc plusieurs plateaux qui recrutent. | B | S2 |
| 5 | Atento Maroc | Maroc | voir fiche | BPO | atento.com · moncallcenter.ma/atento | BPO international avec des recrutements multilingues (ES/FR). Le tri en arabe et en français est un argument. | C | S2 |
| 6 | Eastvantage Morocco | Maroc | Casablanca | BPO | moncallcenter.ma/eastvantage-morocco | Annonce active : agents confirmés pour une campagne énergies renouvelables à Casablanca. | A | S2 |
| 7 | Yource Maroc | Maroc | voir fiche | BPO | moncallcenter.ma/yource-maroc | Offshore néerlandais et francophone, recrutement régulier. | B | S2 |
| 8 | Akkodis Maroc | Maroc | voir fiche | Services / centre de services | moncallcenter.ma/akkodis-maroc | Fiche créée en 2025, donc site en croissance qui recrute. | B | S2 |
| 9 | Selectra (Maroc) | Maroc | voir fiche | Centre de vente / courtage énergie | moncallcenter.ma/selectra | Gros recruteur de conseillers commerciaux francophones. | B | S2 |
| 10 | Wengage | Maroc / Belgique | voir fiche | BPO multilingue | moncallcenter.ma/wengage | Présenté comme « le plus grand centre de contact en Belgique », recrute au Maroc des profils multilingues. | B | S2 |
| 11 | ARIA (Tenor Group : Accolade Center, Isosell) | Maroc | Casablanca, Rabat | BPO / vente | fiche ARIA sur moncallcenter.ma | Deux plateaux regroupés dans une même entité, avec probablement un recrutement mutualisé. | A | S2 |
| 12 | France Rénovation | Maroc | voir fiche | Centre d'appels (rénovation) | moncallcenter.ma/france-renovation | **62 offres actives**, le signal de volume le plus fort de l'annuaire. | A | S2 |
| 13 | Infinity Business Group | Maroc | voir fiche | Centre d'appels / école de vente | moncallcenter.ma/infinity-buisness-group | 19 offres actives. | A | S2 |
| 14 | Net Courtage Assurances | Maroc / France | Rabat, Casablanca | Courtage assurance | moncallcenter.ma/net-courtage-assurances | 9 offres actives sur plusieurs villes. | A | S2 |
| 15 | Call Ma – Groupe Callson | Maroc | voir fiche | Centre d'appels | fiche sur moncallcenter.ma | Recrute des téléconseillers débutants et expérimentés, en volume. | A | S2 |
| 16 | Seza Shore | Maroc | Fès | Télévente / externalisation | fiche sur moncallcenter.ma | Centre de taille moyenne à Fès, deuxième pôle BPO du pays. Décideur proche du terrain. | A | S2 |
| 17 | H2MW Groupe | Maroc | Fès | Centre d'appels | moncallcenter.ma/h2mw-groupe | Taille moyenne, accessible. | A | S2 |
| 18 | Saphir Direct | Maroc | voir fiche | Centre d'appels | moncallcenter.ma/saphir-direct | Recruteur actif sur l'annuaire. | B | S2 |
| 19 | Oceancall | Maroc | voir fiche | Centre d'appels | moncallcenter.ma/oceancall | Recruteur actif sur l'annuaire. | B | S2 |
| 20 | Ribatis | Maroc | voir fiche | Centre d'appels | moncallcenter.ma/ribatis | Recruteur actif sur l'annuaire. | B | S2 |
| 21 | Allianz Services Maroc | Maroc | voir fiche | Centre de services captif | moncallcenter.ma/allianz-services-maroc | Captif d'assurance qui recrute de façon continue des profils qualifiés. Le RGPD est un argument fort. | C | S2 |
| 22 | AXA Services Maroc | Maroc | voir fiche | Centre de services captif | moncallcenter.ma/axa-services-maroc | Même logique qu'Allianz : sensibilité forte à la conformité. | C | S2 |
| 23 | Leyton (Maroc) | Maroc | voir fiche | Conseil / centre de services | moncallcenter.ma/leyton | Recrute en continu des profils juniors. | B | S2 |

### 2.2 BPO / centres d'appels — Tunisie, Sénégal, Côte d'Ivoire

| # | Entreprise | Pays | Ville | Type | Site / fiche | Pourquoi c'est une cible | Prio | Source |
|---|---|---|---|---|---|---|---|---|
| 24 | Active Contact | Tunisie | Tunis (2 sites) | BPO offshore | activecontact.fr | Plus de 620 positions, donc un recrutement continu à cette échelle. | A | S8 |
| 25 | Tunis Call Center (TCC) | Tunisie | Tunis, Bizerte | BPO offshore | tuniscallcenter.com | ISO 9001, plus de 100 clients. A publié un article « Recrutement centre d'appel » en février 2026 (signal). | A | S8 |
| 26 | PCCI | Sénégal | Dakar | BPO | pcci-group.com | Parmi les 4 plus gros centres du Sénégal, avec une page « Nous rejoindre » active. | A | S3 |
| 27 | Way2Call | Sénégal | Dakar | BPO | voir S10 | Fondé en 2006, en croissance, soutenu par Invest for Jobs. La fonction RH est structurée. | A | S3, S10 |
| 28 | Africatel AVS | Sénégal | Dakar | BPO | africatelavs.com | Centre historique d'environ 100 postes. Taille idéale pour le plan Volume. | B | S3 |
| 29 | Pro'Call Center | Sénégal | Dakar | BPO | procallcenter.sn | Page emploi active. | B | S3 |
| 30 | Ibex Sénégal | Sénégal | Dakar | BPO international | ibex.co | Recrutement anglophone et francophone, donc tri FR/EN. | C | S3 |
| 31 | Intelcia Sénégal | Sénégal | Dakar | BPO | careers.intelcia.com/fr-sn | Filiale qui recrute de façon autonome. | C | S3 |
| 32 | Loquela Business Center | Côte d'Ivoire | Abidjan (Cocody) | Centre d'appels 100 % ivoirien | lbc.ci | Taille PME : décideur accessible, recrutement de téléconseillers. | A | S8 |
| 33 | Din Africa | Côte d'Ivoire | Abidjan | Centre d'appels | din-africa.odoo.com | Offre de téléconseillers en ligne (signal actif). | A | S8 |
| 34 | Concentrix Côte d'Ivoire (ex-Webhelp) | Côte d'Ivoire | Abidjan | BPO | job.webhelp.ci | Portail de recrutement dédié, donc gros volume. | C | S4 |
| 35 | Foundever Côte d'Ivoire (ex-Acticall/Sitel) | Côte d'Ivoire | Abidjan | BPO | foundever.com | Volume continu. | C | S4 |

### 2.3 Cabinets de recrutement et agences d'intérim — Maroc

| # | Entreprise | Pays | Ville | Type | Site / fiche | Pourquoi c'est une cible | Prio | Source |
|---|---|---|---|---|---|---|---|---|
| 36 | Cabinet Adéquation | Maroc | Casablanca | Cabinet | adequation.ma | Cabinet généraliste de taille PME, donc plan Cabinet. | A | S5 |
| 37 | Multicibles | Maroc | Casablanca | Cabinet | multicibles.com | Recrutement multi-secteurs. | A | S5 |
| 38 | Pole RH | Maroc | Casablanca | Cabinet RH | polerh.ma | Conseil RH et recrutement. | A | S5 |
| 39 | Invest RH | Maroc | Rabat | Cabinet RH | investrh.ma | À Rabat, une zone moins sollicitée par les éditeurs. | A | S5 |
| 40 | Cercle RH | Maroc | Rabat | Cabinet RH | cerclerh.com | Même logique qu'Invest RH. | A | S5 |
| 41 | Brain Management | Maroc | Casablanca | Cabinet | brainman.ma | Cabinet local. | B | S5 |
| 42 | Recrutement International | Maroc | Casablanca | Cabinet | recrutementinternational.ma | Se présente comme l'un des leaders du recrutement au Maroc. Volume de candidats élevé. | A | S8 |
| 43 | Phéniciafrica (Phénicia Conseil) | Maroc / France | Casablanca | Cabinet | recrutement-phenicia.fr/maroc | Double implantation France et Maroc : argument FR/AR et UE. | A | S8 |
| 44 | Xpertize Africa | Maroc | Casablanca | Cabinet | xpertize.africa | Publie activement sur le recrutement en 2026 : contact « contenu » naturel. | A | S8 |
| 45 | MAK Associates | Maroc | Casablanca | Executive search | makassociates.ma | Postes de direction, donc volume faible. Cible Solo seulement. | B | S8 |
| 46 | Talent2Africa (T2A) | Maroc / Afrique | Casablanca, Tanger, Rabat, Marrakech | Executive search | talent2africa.com | Promet des shortlists sous 10 jours : DocSwift accélère ce délai. | B | S8 |
| 47 | Manpower Maroc | Maroc | Casablanca, Rabat, Tanger | Intérim | manpower-maroc.com | Industrie, BPO, IT : gros volumes. Visez une agence locale (directeur d'agence). | C | S5, S6 |
| 48 | Crit Maroc | Maroc | Casablanca | Intérim | crit-job.com | Intérim multi-secteurs. | B | S5 |
| 49 | Adecco Maroc | Maroc | Casablanca, Rabat, Fès | Intérim | voir joblia.ma/entreprises/adecco-maroc | Industrie, logistique, tertiaire. | C | S6 |
| 50 | Randstad Maroc | Maroc | Casablanca, Tanger, Agadir | Intérim | à vérifier | Ingénierie, services, commerce. | C | S6 |
| 51 | Bestprofil | Maroc | Casablanca (6 agences) | Intérim | bestprofil.ma | Réseau local de 6 agences, avec un décideur au Maroc. | A | S8 |
| 52 | Elite Intérim Maroc | Maroc | Casablanca | Intérim (agence autorisée) | à vérifier | Inscrite sur la liste officielle des agences autorisées. | B | S7 |

### 2.4 Cabinets — Tunisie et France

| # | Entreprise | Pays | Ville | Type | Site / fiche | Pourquoi c'est une cible | Prio | Source |
|---|---|---|---|---|---|---|---|---|
| 53 | Staffing Tunisia | Tunisie | Sfax, Sousse | Cabinet + **RPO / recrutement de masse** | staffing-tunisia.com | Fait du recrutement de masse, c'est exactement le cas d'usage du plan Volume. | A | S8 |
| 54 | HR Extentia | Tunisie | Tunis | Cabinet RH | hrextentia.com | Recrutement, formation et conseil RH. Peut aussi devenir partenaire formateur. | A | S8 |
| 55 | Force Management | Tunisie | Tunis | Cabinet recrutement / coaching | forcemanagement.net | Plus de 20 ans d'expérience, recrutement international. | B | S8 |
| 56 | Artus Tunisie | Tunisie | Tunis | Intérim / recrutement | à vérifier (filiale d'Artus France) | Cité comme l'un des cabinets les plus reconnus du pays. | B | tanitjobs.com (blog) |
| 57 | Elantys | France | voir site | Cabinet recrutement commercial | elantys.fr | Spécialiste des profils commerciaux depuis 2011. Les annonces commerciales attirent beaucoup de CV. | A | S8 |
| 58 | NextGen RH | France | Bordeaux | Cabinet recrutement commerciaux | nextgenrh.fr | Petit cabinet régional : décideur et utilisateur sont la même personne. | A | S8 |
| 59 | Skaelia | France | Paris, Lyon, Nantes | Cabinet | skaelia.com | Consultants seniors, PME et ETI : plan Cabinet (3 recruteurs). | B | S8 |
| 60 | Licorne Society | France | Paris, Lyon, Bordeaux | Cabinet tech / commercial | licornesociety.com | Volume élevé sur des postes tech et sales. | B | S8 |

**Ordre d'attaque conseillé, semaine 1** : les A des sections 2.1 (Maroc, taille moyenne : #6, 11 à 17), puis 2.3 (#36 à 40, 42 à 44, 51), puis 2.2 (#24 à 27, 32, 33). Les C passent en semaine 3 et plus, avec un cas client en main.

**Pour élargir la liste sans scraper** : consultez les fiches entreprises de moncallcenter.ma (le nombre d'offres actives est votre signal de volume), la liste officielle des agences autorisées (miepeec.gov.ma), les annuaires callofsuccess.com et annuaire-externalisation.com, et les pages entreprise de Rekrute, Emploi.ma, Tanitjobs et EmploiSénégal. Relevez **le nom de l'entreprise et le signal**, jamais des données personnelles.

---

## 3. Qui contacter et comment le trouver (sans scraper)

| Type d'entreprise | Rôle à contacter en premier | Deuxième fil | Qui signe |
|---|---|---|---|
| Cabinet 1–10 pers. | Fondateur / gérant / associé | Consultant(e) senior en recrutement | Le fondateur |
| BPO / centre d'appels | Responsable recrutement **du site** / Talent Acquisition Manager / Chargé(e) de recrutement | Directeur de site / Responsable RH de site | Directeur de site ou DRH pays (pilote d'un mois, puis plan Volume) |
| Agence d'intérim | Directeur / responsable d'agence | Chargé(e) de recrutement de l'agence | Directeur d'agence (petit montant) ou direction régionale |
| PME en volume | DRH / RRH | Dirigeant (si moins de 50 pers.) | Dirigeant ou DAF |

### Méthode (manuelle, conforme)
1. **Recherche LinkedIn standard**, sans outil d'extraction. Exemples de requêtes dans la barre de recherche « Personnes » :
   - `"responsable recrutement" OR "talent acquisition" OR "chargée de recrutement"` + filtre **Entreprise actuelle** = [nom de l'entreprise] + filtre **Lieu** = Maroc / Tunisie / Sénégal / Côte d'Ivoire
   - `fondateur OR gérant OR "managing partner"` + `"cabinet de recrutement"` + Lieu
   - `"directeur d'agence" OR "responsable d'agence"` + Entreprise actuelle = Manpower Maroc / Crit / Bestprofil
2. **La page « Personnes » de la page entreprise LinkedIn** : filtrez par mot-clé « recrutement ».
3. **La page « Équipe » / « À propos » du site** de l'entreprise (fréquent chez les cabinets).
4. **L'email** : utilisez uniquement une adresse publiée par l'entreprise (page contact ou adresse « recrutement@ » affichée dans les offres), ou celle que la personne vous donne après une connexion LinkedIn. Ne devinez pas d'adresses nominatives en série et n'utilisez aucun outil d'enrichissement d'emails.
5. **Le téléphone** : seulement le standard publié de l'entreprise. Demandez le service recrutement.
6. **WhatsApp** : seulement un numéro WhatsApp Business publié par l'entreprise, ou après accord explicite de la personne (« je peux vous envoyer l'exemple sur WhatsApp ? »).

**Interdits** : extensions d'automatisation LinkedIn (elles violent les CGU et font bannir le compte), scraping, achat de fichiers, envois en masse.

---

## 4. Séquences prêtes à copier

Variables : `[Prénom]`, `[Entreprise]`, `[ville]`, `[signal]` (une annonce précise, un nombre d'offres, une ouverture de plateau), `[poste]`.
Une seule personnalisation vraie dans la première ligne vaut mieux que trois génériques.

### 4.1 Offre concierge (le cœur du dispositif)
> « Envoyez-moi les CV de votre dernière annonce et la fiche de poste. Je vous renvoie la shortlist classée et justifiée en 1 h. Gratuit, sans engagement. »

Mode opératoire, à respecter pour la conformité :
- **Option préférée** : le prospect importe lui-même les CV dans l'essai gratuit (5 CV sans compte) ou démarre ses 14 jours d'essai, et vous le guidez en partage d'écran de 15 min. Les CV ne transitent alors pas par vous.
- **Option concierge** : le prospect envoie un lien de partage ou un dossier zip. Vous analysez dans votre compte (100 CV maximum par analyse ; coordonnées masquées avant l'IA), vous envoyez l'export CSV et un résumé du top 10, puis **vous supprimez les analyses et les fichiers reçus** et vous le confirmez par écrit. Proposez le DPA dès que le prospect est une entreprise structurée.
- Livrable : le CSV + 3 lignes : « Top 5 à appeler en priorité : ... Pourquoi le n°1 est en tête : ... Ce que l'outil n'a pas pu lire : les PDF scannés. »
- Conclusion : « Vous voulez le faire vous-même sur la prochaine annonce ? Le plan [X] avec le code FONDATEUR revient à [prix] HT/mois, avec 14 jours d'essai sans débit. »

### 4.2 LinkedIn — invitation (≤ 300 caractères) + 3 relances

**Invitation, version cabinet (environ 240 caractères)**
```
Bonjour [Prénom], j'ai vu votre annonce [poste]. Je construis DocSwift HR : il classe les CV d'une annonce contre la fiche de poste, score /100 justifié, et le recruteur décide. J'aimerais avoir l'avis de recruteurs [pays]. Au plaisir d'échanger.
```

**Invitation, version BPO (environ 260 caractères)**
```
Bonjour [Prénom], je vois que [Entreprise] recrute des conseillers à [ville] en ce moment. Je construis DocSwift HR pour trier des centaines de CV en quelques minutes (FR/EN/AR, score justifié, le recruteur décide). Curieux de votre façon de faire le premier tri.
```
Après personnalisation, vérifiez la longueur : la limite de 300 caractères inclut les espaces.

**Relance 1 (le jour de l'acceptation) : une question, pas de pitch**
```
Merci pour la connexion, [Prénom]. Une question rapide : sur votre dernière annonce [poste], combien de CV avez-vous reçus, et combien de temps a pris le premier tri ?
```

**Relance 2 (J+4 ; ou juste après sa réponse) : l'offre concierge**
```
Je vous propose un test concret : envoyez-moi les CV de cette annonce et la fiche de poste, je vous renvoie la shortlist classée en 1 h. Chaque candidat a un score /100 avec ses points forts et ses points faibles. Vous gardez la décision. C'est gratuit, et si ça ne vous fait pas gagner de temps, vous me le dites franchement.
Vous pouvez aussi tester seul avec 5 CV, sans compte : getdocswift.com/hr/essai-gratuit
```

**Relance 3 (J+10) : la preuve, puis la sortie propre**
```
Dernier message de ma part, [Prénom]. Voici 90 secondes de démo sur une vraie annonce : [lien vidéo]. Les 20 premiers cabinets ont -50 % pendant 12 mois (code FONDATEUR). Le plan [Solo/Cabinet] revient alors à [24,50/64,50] € HT/mois. Si le tri de CV n'est pas un sujet pour vous en ce moment, aucun souci, je ne relancerai pas.
```

### 4.3 Email à froid — 4 emails sur 12 jours

Envoi manuel depuis le domaine dédié, en texte brut, sans pièce jointe ni image, avec un seul lien maximum. Chaque email se termine par la ligne d'opposition.

**Email 1 — J1**
Objet : `vos [N] candidatures pour [poste]`
```
Bonjour [Prénom],

J'ai vu que [Entreprise] recrute [poste / des conseillers] à [ville] ([signal]). Sur ce type d'annonce, le premier tri prend souvent plusieurs heures.

DocSwift HR classe jusqu'à 100 CV par analyse contre votre fiche de poste. Chaque candidat reçoit un score sur 100, ses points forts, ses points faibles et une phrase de synthèse. L'outil ne rejette personne : vous décidez.

Je vous propose de trier gratuitement les CV de cette annonce et de vous renvoyer la shortlist en 1 h. Ça vous intéresse ?

[Prénom Nom du fondateur]
DocSwift HR – getdocswift.com/hr

Pas concerné ? Répondez « stop » et je ne vous écrirai plus.
```

**Email 2 — J4**
Objet : `re: tri des cv`
```
Bonjour [Prénom],

Une précision qui revient souvent : les coordonnées des candidats (email, téléphone, liens) sont masquées avant l'analyse par l'IA. Les PDF sont effacés après l'analyse, et les données sont hébergées dans l'UE. L'IA ne tient compte ni de l'âge, ni du genre, ni de l'origine, ni de la photo.

Vous pouvez vérifier vous-même en 2 minutes, sans compte, avec 5 CV : getdocswift.com/hr/essai-gratuit

[Prénom]

Pas concerné ? Répondez « stop » et je ne vous écrirai plus.
```

**Email 3 — J8**
Objet : `300 cv, 10 minutes`
```
Bonjour [Prénom],

Un calcul simple : à 1 ou 2 minutes par CV, 300 candidatures représentent 5 à 10 heures de lecture. Avec DocSwift, vous lancez 3 analyses de 100 CV et vous relisez seulement le haut du classement, avec la justification de chaque score.

Pour les 20 premiers clients, le code FONDATEUR donne -50 % pendant 12 mois. Le plan [Solo/Cabinet/Volume] revient alors à [24,50/64,50/145] € HT/mois, sans engagement, avec 14 jours d'essai sans débit.

Ma proposition de tri gratuit de votre prochaine annonce tient toujours.

[Prénom]

Pas concerné ? Répondez « stop » et je ne vous écrirai plus.
```

**Email 4 — J12 (rupture)**
Objet : `je clos le sujet ?`
```
Bonjour [Prénom],

Je n'ai pas eu de retour, donc je suppose que le tri des CV n'est pas une priorité en ce moment. Je ne relancerai plus.

Si ça le redevient (une annonce qui déborde, une campagne de recrutement), répondez simplement « tri » et je m'en occupe dans l'heure.

Bonne continuation,
[Prénom]

Pas concerné ? Répondez « stop » et je ne vous écrirai plus.
```

### 4.4 Script d'appel — 60 secondes (standard de l'entreprise ou numéro donné par la personne)

```
[0–10 s]  Bonjour [Prénom], [Prénom du fondateur] de DocSwift HR. Je vous appelle à froid, je vous prends 45 secondes et vous me dites si on continue, d'accord ?
[10–25 s] Je vois que vous recrutez [poste / des conseillers à ville]. En général, sur ce volume, c'est le premier tri des CV qui prend le plus de temps. C'est votre cas ?
          -> Si non : « Merci, je ne vous dérange pas plus. » (raccrocher poliment)
[25–45 s] DocSwift classe vos CV contre la fiche de poste : un score sur 100 avec la justification, en français, en anglais ou en arabe, et c'est vous qui décidez. Je vous propose de trier gratuitement les CV de votre annonce actuelle et de vous renvoyer la shortlist dans l'heure.
[45–60 s] Le plus simple : je vous envoie un email avec le lien et vous me transmettez la fiche de poste. Quelle adresse dois-je utiliser ?
```
Messagerie vocale (15 s) : « Bonjour [Prénom], [Prénom] de DocSwift HR. Je vous propose de trier gratuitement les CV de votre annonce [poste] en une heure. Je vous envoie les détails par email. Bonne journée. »

### 4.5 WhatsApp — Maghreb et Afrique de l'Ouest

Uniquement vers un numéro WhatsApp Business publié par l'entreprise, ou après accord de la personne. Un message, une relance maximum.

**Message 1**
```
Bonjour, [Prénom du fondateur] de DocSwift HR. J'ai vu votre offre « [poste] » à [ville]. Notre outil trie les CV par IA en français, en anglais et en arabe : un score sur 100 justifié, et c'est vous qui décidez. Je vous propose de trier gratuitement les CV de cette annonce et de vous renvoyer la shortlist en 1 h. Ça vous intéresse ? (Répondez STOP si vous ne souhaitez pas être recontacté.)
```
**Relance (J+3, une seule)**
```
Je me permets une relance : vous pouvez aussi tester seul avec 5 CV, sans créer de compte : getdocswift.com/hr/essai-gratuit. Bonne journée.
```
Variante darija ou arabe : préparez-la, mais ne l'utilisez que si l'interlocuteur écrit lui-même en arabe.

---

## 5. Les 8 objections : réponses courtes et honnêtes

| Objection | Réponse |
|---|---|
| **« On utilise déjà ChatGPT. »** | « ChatGPT peut le faire CV par CV, en copiant-collant. DocSwift traite jusqu'à 100 CV d'un coup avec la même grille pour tous, masque les coordonnées avant l'IA, n'utilise pas les CV pour entraîner un modèle et sort un classement exportable en CSV. Comparez sur une annonce : je trie vos CV et vous comparez avec votre méthode. » |
| **« Et le RGPD ? »** | « L'outil ne prend aucune décision automatique (article 22) : il classe et justifie, vous décidez. Les coordonnées sont masquées avant l'analyse, le PDF est effacé ensuite, la base est hébergée dans l'UE (Irlande) et vous supprimez une analyse quand vous voulez. Je vous envoie notre contrat de sous-traitance. » (À dire seulement quand le DPA est prêt.) |
| **« L'IA se trompe. »** | « Oui, ça peut arriver, et c'est pour ça que chaque score est justifié par des points forts et faibles que vous pouvez vérifier en 10 secondes. L'outil sert à décider par où commencer, pas qui éliminer. Il ne lit pas non plus les PDF scannés en image : il vous le signale, et ces CV ne consomment pas de quota. » |
| **« C'est trop cher. »** | « Avec le code FONDATEUR, c'est 24,50 € HT par mois en Solo. Si l'outil vous fait gagner 3 heures sur une seule annonce dans le mois, il est rentabilisé. Et vous avez 14 jours d'essai sans débit pour le vérifier. » |
| **« On a déjà un ATS. »** | « On ne le remplace pas, et soyons clairs : il n'y a pas d'intégration ATS ni d'API pour l'instant. Le flux est simple : vous exportez les CV PDF d'une annonce, vous les classez ici, vous réimportez le CSV ou vous traitez le top dans votre ATS. C'est utile surtout sur les annonces qui débordent. » |
| **« Je n'ai pas le temps. »** | « C'est justement le sujet. Ne faites rien : envoyez-moi la fiche de poste et les CV, et je vous renvoie la shortlist en 1 h. » |
| **« Et les données des candidats ? »** | « On masque les email, téléphone et liens avant l'IA. Le fichier PDF est effacé après l'analyse, seuls le score et la synthèse restent dans votre espace, et vous pouvez les supprimer. Les CV n'entraînent pas de modèle et les données sont hébergées dans l'UE. Je peux vous fournir un modèle de mention d'information pour vos candidats. » |
| **« Ça va remplacer le recruteur. »** | « Non : l'outil ne contacte personne, ne rejette personne et ne décide de rien. Il fait la lecture de premier niveau, pour que le recruteur passe son temps au téléphone avec les bons candidats plutôt qu'à ouvrir des PDF. » |

Règle : si une question sort du périmètre de la fiche produit (intégration, API, application, délai d'une fonctionnalité), répondez « pas aujourd'hui », notez la demande dans le tableau de suivi et n'improvisez jamais de promesse.

---

## 6. Programme partenaires et affiliés

### Offre
- **Commission : 20 % du montant HT réellement encaissé, chaque mois, pendant 12 mois**, pour chaque client apporté.
- Exemple : un client Cabinet au prix FONDATEUR (64,50 €) rapporte 12,90 €/mois, soit 154,80 € sur 12 mois. Un client Volume au plein tarif (290 €) rapporte 58 €/mois, soit 696 € sur 12 mois.
- Attribution, phase 1 (manuelle) : le partenaire présente le client par email (en mettant le fondateur en copie) **avant** son inscription. Le client est inscrit dans le tableau de suivi avec la colonne « Partenaire ». Le partenaire est payé chaque mois par virement, sur la base des factures Stripe payées.
- Contrat d'une page : durée, taux, attribution « premier présentateur », pas de commission sur les remboursements, pas de démarchage abusif au nom de DocSwift.
- Phase 2 (au-delà de 5 partenaires actifs) : un outil d'affiliation branché sur Stripe. Pas avant.

### Cibles partenaires
| Type | Exemples (à vérifier) | Ce qu'ils y gagnent |
|---|---|---|
| Jobboards locaux | moncallcenter.ma, jobsquare.ma, Rekrute, Emploi.ma (Maroc) ; Tanitjobs, EmploiTunisie (Tunisie) ; EmploiSénégal, EmploiDakar (Sénégal) ; Africawork (panafricain) | Un service « tri » à proposer aux recruteurs qui publient chez eux, et un revenu récurrent. |
| Formateurs RH et écoles | Organismes de formation au recrutement, centres de formation BPO (par exemple les écoles de formation BPO de Fès) | Un outil concret à montrer en formation, plus la commission. |
| Experts-comptables et cabinets de conseil aux PME | Cabinets qui accompagnent des PME en croissance (France, Maroc) | Un service à valeur ajoutée pour leurs clients qui recrutent. |
| Consultants RH indépendants / RPO | Freelances RH, petits cabinets RPO (par exemple Staffing Tunisia, en client ou en partenaire) | Ils revendent leur productivité, plus la commission. |

### Pitch partenaire (message LinkedIn ou email)
```
Bonjour [Prénom],

Vos [recruteurs / clients / stagiaires] reçoivent des dizaines, voire des centaines de CV par annonce. DocSwift HR les classe contre la fiche de poste en quelques minutes : score /100 justifié, en français, anglais ou arabe, et le recruteur décide.

Je cherche 5 partenaires en [pays]. Le principe : vous présentez DocSwift à ceux qui en ont besoin, et vous touchez 20 % de ce qu'ils paient chaque mois, pendant 12 mois. Vos contacts profitent en plus du code FONDATEUR (-50 % pendant 12 mois) tant qu'il reste des places.

On en parle 15 minutes cette semaine ? Je vous montre l'outil sur une vraie annonce.

[Prénom]
Pas concerné ? Répondez « stop » et je ne vous écrirai plus.
```

Objectif : 3 partenaires signés en semaine 4, et 1 client apporté par partenaire en semaine 6.

---

## 7. Routine quotidienne, suivi et seuils de décision

### Routine (jours ouvrés, heure du Maroc ; 3 h 30 de vente par jour)
| Créneau | Durée | Activité | Volume / jour |
|---|---|---|---|
| 08:30 – 09:00 | 30 min | **Veille des signaux** : nouvelles offres sur moncallcenter.ma, Rekrute et LinkedIn Jobs, posts « on recrute », annonces avec beaucoup de candidats. Ajoutez au tableau 15 comptes avec leur signal. | 15 comptes |
| 09:00 – 10:00 | 60 min | **LinkedIn** : invitations personnalisées et relances 1 à 3. | **20 invitations** (≤ 100/semaine), **20 messages** |
| 10:00 – 10:45 | 45 min | **Emails** : J1 nouveaux, plus J4, J8 et J12 en cours. | **15 à 20 emails** (dont 10 nouveaux maximum) |
| 10:45 – 11:30 | 45 min | **Appels** au standard des BPO, cabinets et agences d'intérim. | **10 appels** |
| 14:00 – 15:00 | 60 min | **Livraisons concierge** et démos de 15 min. La promesse de 1 h est sacrée. | 1 à 3 shortlists |
| 15:00 – 15:30 | 30 min | **WhatsApp** (numéros publiés seulement), réponses, mise à jour du tableau. | 5 messages maximum |
| Vendredi 16:00 | 45 min | **Revue hebdo** : indicateurs, un test A/B, plan de la semaine suivante, post LinkedIn. | — |

Plus 1 post LinkedIn du fondateur le mardi et le jeudi (20 min chacun), et 15 min de commentaires pertinents sous des posts de recruteurs ciblés.

### Tableau de suivi (Google Sheets ou Notion ; pas de CRM lourd au départ)
Colonnes :
`ID | Entreprise | Pays | Ville | ICP (1-4) | Prio (A/B/C) | Signal (texte + date) | Source du signal (URL) | Rôle visé | Canal source (LinkedIn/Email/Tel/WhatsApp/Partenaire) | Partenaire | Date 1er contact | Étape séquence (Inv/R1/R2/R3/E1-E4) | Date prochaine action | Réponse (oui/non/neutre) | Date réponse | Concierge proposé (O/N) | Concierge livré (date) | Essai gratuit 5 CV (O/N) | Essai 14 j démarré (date) | Plan visé | Code FONDATEUR (O/N) | Statut (À contacter / En séquence / Conversation / Concierge / Essai / Client / Perdu / Opt-out) | MRR (€ HT) | Objection principale | Demande produit | Opt-out (date) | Notes`

Règle : un **opt-out** se marque le jour même, et la ligne n'est plus jamais recontactée, quel que soit le canal.

### Objectifs hebdomadaires (à partir de la semaine 2)
| Indicateur | Cible / semaine | Remarque |
|---|---|---|
| Comptes nouveaux avec signal | 75 | 15 par jour |
| Invitations LinkedIn | 100 | Taux d'acceptation visé ≥ 35 % |
| Emails envoyés (toutes étapes) | 80 | |
| Appels | 50 | |
| Taux de réponse (tous canaux) | 10 – 15 % | Cible de STRATEGIE_MRR.md |
| Réponses positives | 12 – 18 | |
| Concierges livrés / démos | 6 – 8 | |
| Essais 14 j démarrés | 5 – 6 | |
| Conversion essai → payant | ≥ 25 % | Cible de STRATEGIE_MRR.md |
| **Nouveaux clients payants** | **3 – 4** | Environ 20 en 6 semaines |

Entonnoir d'hypothèse pour 20 clients : environ 600 comptes contactés, 12 % de réponse (environ 70 réponses), 50 % positives (environ 35), 35 concierges ou démos, 80 % en essai (environ 28), 70 % de signature sur des essais démarrés après concierge (environ 20). Ces taux sont des hypothèses à confirmer dès la semaine 2.

### Seuils de décision (revue du vendredi)
| Si... | Alors... |
|---|---|
| Acceptation LinkedIn < 25 % sur 100 invitations | Réécrire le titre du profil et l'invitation (un seul changement à la fois). |
| Taux de réponse < 5 % après 150 contacts sur un segment | Changer d'abord l'accroche ou le signal. Si c'est toujours < 5 % la semaine suivante, mettre le segment en pause. |
| Taux de réponse ≥ 15 % sur un segment | Lui donner 50 % du volume de la semaine suivante. |
| Concierge → essai < 30 % | La shortlist ne convainc pas : revoir le livrable (top 5 commenté) ou la qualité des fiches de poste reçues. |
| Essai → payant < 15 % | Problème d'activation : appeler chaque essai à J2 et J7 (voir STRATEGIE_MRR.md, emails d'essai). |
| 0 essai sur l'ICP 2 (BPO) à la fin de la semaine 3 | Passer en pilote gratuit d'un mois sur un site, comme prévu dans STRATEGIE_MRR.md. |
| Plus de 3 demandes de la même fonctionnalité absente (par exemple un export vers un ATS donné) | La remonter en priorité produit. Ne pas la promettre. |
| 20 FONDATEUR atteints | Annoncer publiquement la fin de l'offre (preuve sociale), puis vendre au prix plein. |

---

## 8. Contenu : 10 posts LinkedIn du fondateur et 5 articles SEO

### 10 posts LinkedIn (accroche + angle)
1. **« J'ai lu 312 CV pour un seul poste de téléconseiller. Voici ce que j'ai appris. »** Angle : le coût caché du premier tri. Chiffre en heures, sans citer d'entreprise.
2. **« ChatGPT pour trier vos CV ? Je l'ai testé contre mon propre outil. »** Angle : une comparaison honnête (ChatGPT est utile au cas par cas ; ses limites : volume, grille identique pour tous, confidentialité).
3. **« L'IA ne doit jamais rejeter un candidat. Voici pourquoi je l'ai interdit dans mon produit. »** Angle : l'article 22 du RGPD expliqué simplement.
4. **« Ce que l'IA de DocSwift ne regarde PAS sur un CV. »** Angle : la liste des critères ignorés (photo, âge, adresse...) et le masquage des coordonnées.
5. **« Recruter 200 conseillers en un mois au Maroc : le vrai goulot d'étranglement. »** Angle : le BPO, le turnover, le CV trilingue.
6. **« Solo, basé au Maroc, je vends un SaaS RH en Europe et en Afrique. Semaine 1 : les chiffres. »** Angle : construire en public (messages, réponses, essais). Recommencer chaque semaine.
7. **« Votre fiche de poste est le meilleur filtre... ou le pire. »** Angle : comment écrire une fiche qui donne des scores pertinents (critères obligatoires et souhaitables).
8. **« J'ai offert le tri de leur dernière annonce à 10 recruteurs. Voici ce qu'ils ont dit. »** Angle : des verbatims anonymisés, avec les objections et les réponses.
9. **« FR, EN, AR : pourquoi trier des CV en arabe est un vrai sujet au Maghreb. »** Angle : la différenciation, le marché sous-servi par les outils anglo-saxons.
10. **« Il reste [X] places FONDATEUR sur 20. »** Angle : la rareté réelle (le décompte est vrai), plus un témoignage client avec son accord.

Format : 900 à 1 300 caractères, une idée par post, une question en fin de post, aucun lien dans le corps (lien en commentaire).

### 5 sujets d'articles SEO (sur getdocswift.com)
1. **« Comment trier 200 CV rapidement (méthode + modèle de grille) »**. Mots-clés : trier des CV rapidement, tri de CV.
2. **« IA et recrutement : ce que le RGPD et l'AI Act autorisent vraiment (2026) »**. Mots-clés : IA recrutement RGPD, AI Act recrutement.
3. **« Alternative à ChatGPT pour trier les CV : comparatif honnête »**. Mots-clés : ChatGPT tri CV, alternative ChatGPT recrutement.
4. **« Recrutement en centre d'appels : comment présélectionner des centaines de conseillers sans y passer la semaine »**. Mots-clés : recrutement centre d'appel, présélection téléconseiller.
5. **« Rédiger une fiche de poste qui filtre les bons CV (exemples FR/EN) »**. Mots-clés : fiche de poste exemple, critères de recrutement.

Chaque article se termine par le même appel à l'action : « Testez sur 5 CV, sans compte : /hr/essai-gratuit ».

---

## 9. Plan sur 6 semaines : les 20 premiers clients FONDATEUR

| Semaine | Objectif | Actions clés | Résultat attendu (cumul) |
|---|---|---|---|
| **S0 (avant J1, 2–3 jours)** | Être prêt à vendre | Vérifier les prérequis de la section 0 (analyse en production, clé payante, DPA, vidéo 90 s, domaine d'envoi). Profil LinkedIn : titre « J'aide les recruteurs à trier 300 CV en 10 minutes – fondateur de DocSwift HR ». Créer le tableau de suivi et y entrer les 60 comptes de la section 2. | Tout est prêt, 60 comptes qualifiés |
| **S1** | Premières conversations | Prospecter les A du Maroc (BPO de taille moyenne et cabinets) et de Tunisie : 20 invitations, 10 emails et 10 appels par jour. Faire le concierge sur toute réponse positive. Publier les posts 1 et 6. | 8 conversations, 3 concierges, **1 à 2 clients** |
| **S2** | Valider le message | Plein volume (section 7). Faire un test A/B sur l'accroche de l'email 1 (signal précis contre question sur le temps de tri). Ajouter le Sénégal et la Côte d'Ivoire (A). Publier les posts 3 et 7. Contacter 10 partenaires potentiels (jobboards). | 6 concierges en tout, 5 essais, **4 clients** |
| **S3** | Gros paniers | Attaquer les BPO de taille moyenne pour le plan Volume, avec un cas réel anonymisé de S1–S2. Proposer aux C un pilote sur un site. Ajouter les cabinets français (ICP 1). Publier les posts 2 et 5. Premier article SEO (n°1). | 12 essais, **8 clients**, 1 pilote BPO lancé |
| **S4** | Accélérer | Appeler chaque essai à J2 et J7. Signer 3 partenaires. Demander une recommandation à chaque client : « Qui d'autre dans votre réseau trie beaucoup de CV ? ». Publier les posts 4 et 8. Article SEO n°2. | **12 clients**, 3 partenaires |
| **S5** | Convertir le pipeline | Relancer tous les essais en fin de période (J12). Convertir le pilote BPO en plan Volume. Faire passer les segments au-dessus de 15 % de réponse à 50 % du volume. Publier les posts 9 et 10 (« il reste X places »). Article SEO n°3. | **16 clients** |
| **S6** | Fermer les 20 | Rappeler les conversations chaudes non signées. Annoncer les dernières places FONDATEUR. Recueillir 3 témoignages écrits avec accord explicite. Faire le bilan de chaque segment (taux, objections, demandes produit) et décider de la suite (prix plein, segment prioritaire). | **20 clients FONDATEUR**, environ 970 € de MRR |

Plan B si le rythme est en dessous de 50 % de l'objectif à la fin de S3 : concentrer 100 % de l'effort sur le meilleur segment observé, passer à 2 concierges par jour minimum, et ouvrir aux C les pilotes gratuits d'un mois.

---

## 10. Conformité : rappels obligatoires

- **France, emails B2B** : la prospection par email vers un professionnel est possible sans consentement préalable (intérêt légitime) **si le message a un rapport avec sa fonction** (ici, un recruteur ou un responsable RH). Chaque message doit identifier l'expéditeur et proposer un moyen simple de s'opposer (la ligne « Répondez stop »). Gardez une liste d'opposition et respectez-la sur tous les canaux. Vérifiez les recommandations de la CNIL avant le lancement.
- **Ne jamais acheter de fichiers** (emails, téléphones, listes LinkedIn). Construisez la liste à la main à partir de signaux publics, au niveau de l'entreprise.
- **Maroc, loi 09-08** sur la protection des données personnelles : informez la personne (qui vous êtes, pourquoi vous la contactez), offrez un droit d'opposition immédiat, limitez-vous aux données nécessaires (nom, fonction, entreprise, canal), et vérifiez auprès de la **CNDP** si votre fichier de prospection nécessite une déclaration préalable. Pas de messages automatisés en masse (SMS, WhatsApp).
- **Tunisie, Sénégal, Côte d'Ivoire** : ils ont aussi des lois sur les données personnelles (Tunisie : loi organique 2004-63, INPDP ; Sénégal : loi 2008-12, CDP ; Côte d'Ivoire : loi 2013-450, ARTCI). Appliquez les mêmes principes : information, opposition, minimisation. Faites vérifier par un conseil avant de passer à l'échelle.
- **LinkedIn** : aucun outil d'automatisation ni de scraping (interdits par les CGU).
- **WhatsApp** : uniquement les numéros professionnels publiés par l'entreprise, ou après accord. Un message et une relance maximum.
- **Concierge** : les CV reçus sont des données de candidats. Traitez-les uniquement pour la démonstration, supprimez-les ensuite et confirmez la suppression par écrit. Proposez le DPA.
- **Opt-out** : traité le jour même, définitif, sur tous les canaux.
- **Honnêteté produit** : pas d'intégration ATS, pas d'API, pas de décision automatique. Aucun chiffre client ni témoignage sans accord écrit.
