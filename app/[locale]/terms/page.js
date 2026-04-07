"use client";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

const LAST_UPDATE = "6 avril 2026";

// Sections remain in French as legal text — only UI chrome is translated
const sections = [
  {
    title: "1. Présentation et éditeur",
    content: `DocSwift est un service en ligne proposant des outils de traitement de documents PDF et de création de CV professionnel, accessible à l'adresse getdocswift.com.

Éditeur du service : DocSwift
Contact : support@getdocswift.com
Hébergement : Railway (Railway Corp., San Francisco, CA, États-Unis)`,
  },
  {
    title: "2. Objet",
    content: `Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions dans lesquelles DocSwift met à disposition ses services, ainsi que les droits et obligations des parties.

L'utilisation du service implique l'acceptation pleine et entière des présentes CGU. DocSwift se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs sont invités à les consulter régulièrement.`,
  },
  {
    title: "3. Description du service",
    content: `DocSwift propose les fonctionnalités suivantes :

• Conversion PDF vers Word (.docx)
• Conversion Word vers PDF
• Compression de fichiers PDF
• Fusion de plusieurs PDFs en un seul document
• Division d'un PDF (extraction de pages)
• Conversion d'images (JPG, PNG) en PDF
• Création et téléchargement de CV professionnel en PDF

Le service est accessible sans inscription dans la limite d'un quota gratuit de 5 opérations par jour par utilisateur. Au-delà, l'utilisateur peut débloquer des utilisations supplémentaires en regardant une publicité vidéo, ou souscrire à un abonnement Pro.`,
  },
  {
    title: "4. Accès au service",
    content: `4.1 Offre gratuite
Tout visiteur peut utiliser DocSwift sans créer de compte, dans la limite de 5 opérations par jour. Cette limite est suivie par adresse IP ou par compte utilisateur si l'utilisateur est connecté.

4.2 Offre Pro
L'abonnement Pro permet un accès illimité à l'ensemble des outils, sans publicité, avec des fichiers jusqu'à 50 MB. L'abonnement est mensuel, sans engagement, et peut être résilié à tout moment depuis le portail client Stripe accessible via le compte utilisateur.

4.3 Compte utilisateur
La création d'un compte (via Google OAuth) permet de bénéficier d'un suivi personnalisé du quota d'utilisation. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses accès.`,
  },
  {
    title: "5. Conditions financières",
    content: `5.1 Prix
Les prix sont indiqués en euros TTC. DocSwift se réserve le droit de modifier ses tarifs à tout moment, avec notification préalable aux abonnés actifs.

Offre de lancement : 4,99 €/mois pendant les 3 premiers mois, puis 9,99 €/mois.
Prix standard : 9,99 €/mois.

5.2 Paiement
Le paiement est effectué via Stripe, prestataire de paiement sécurisé. DocSwift ne stocke aucune donnée bancaire. L'abonnement est renouvelé automatiquement chaque mois.

5.3 Remboursement
Tout abonnement souscrit peut être résilié à tout moment. Aucun remboursement prorata n'est accordé pour la période en cours, sauf en cas de défaillance technique avérée de notre part.`,
  },
  {
    title: "6. Traitement des fichiers",
    content: `6.1 Confidentialité des fichiers
Les fichiers uploadés sur DocSwift sont traités uniquement dans le cadre de l'opération demandée. Ils ne sont pas stockés de manière permanente sur nos serveurs.

6.2 Suppression automatique
Tous les fichiers téléchargés sur la plateforme sont automatiquement supprimés après traitement, sans conservation.

6.3 Responsabilité des contenus
L'utilisateur est seul responsable des fichiers qu'il soumet. Il garantit disposer des droits nécessaires sur les documents traités. Il est interdit d'utiliser DocSwift pour traiter des contenus illicites, pornographiques, diffamatoires ou portant atteinte aux droits de tiers.`,
  },
  {
    title: "7. Propriété intellectuelle",
    content: `L'ensemble des éléments constitutifs de DocSwift (interface, logo, code source, textes, outils) sont protégés par le droit de la propriété intellectuelle et sont la propriété exclusive de DocSwift.

Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du service est strictement interdite.

Les documents générés par l'utilisateur (notamment les CV créés via l'outil DocSwift) lui appartiennent intégralement.`,
  },
  {
    title: "8. Protection des données personnelles",
    content: `8.1 Données collectées
DocSwift collecte les données suivantes :
• Adresse email et nom (si connexion via Google)
• Adresse IP (pour le suivi du quota gratuit)
• Historique d'utilisation (nombre de conversions quotidiennes)

8.2 Finalité
Ces données sont utilisées uniquement pour :
• Gérer votre compte et votre abonnement
• Assurer le bon fonctionnement du service
• Prévenir les abus du quota gratuit

8.3 Conservation
Les données de compte sont conservées tant que le compte est actif. Elles peuvent être supprimées sur simple demande à support@getdocswift.com.

8.4 Droits
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant vos données. Exercez ces droits en nous contactant à support@getdocswift.com.

8.5 Cookies
DocSwift utilise des cookies techniques indispensables au fonctionnement du service (session, authentification) et des cookies publicitaires pour les utilisateurs du plan gratuit. Aucun cookie publicitaire n'est déposé pour les abonnés Pro.`,
  },
  {
    title: "9. Limitation de responsabilité",
    content: `DocSwift met tout en œuvre pour assurer la disponibilité et la fiabilité du service, mais ne peut garantir une disponibilité ininterrompue.

DocSwift ne saurait être tenu responsable :
• Des pertes de données résultant d'un dysfonctionnement technique
• Des dommages indirects liés à l'utilisation du service
• De l'utilisation faite par l'utilisateur des documents générés

La responsabilité de DocSwift est limitée au montant des sommes versées par l'utilisateur au cours des 3 derniers mois.`,
  },
  {
    title: "10. Résiliation",
    content: `10.1 Par l'utilisateur
L'utilisateur peut résilier son abonnement à tout moment depuis le portail client accessible dans son espace compte, ou en contactant support@getdocswift.com. La résiliation prend effet à la fin de la période de facturation en cours.

10.2 Par DocSwift
DocSwift se réserve le droit de suspendre ou résilier l'accès d'un utilisateur en cas de violation des présentes CGU, sans préavis ni remboursement.`,
  },
  {
    title: "11. Loi applicable et juridiction",
    content: `Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.

Pour tout litige relatif à un contrat de consommation, l'utilisateur peut également recourir à la plateforme européenne de résolution en ligne des litiges : https://ec.europa.eu/consumers/odr`,
  },
  {
    title: "12. Contact",
    content: `Pour toute question relative aux présentes CGU ou au service :

Email : support@getdocswift.com
Site web : getdocswift.com

DocSwift s'engage à répondre à toute demande dans un délai de 5 jours ouvrés.`,
  },
];

export default function TermsPage() {
  const router = useRouter();
  const t = useTranslations('terms');
  const locale = useLocale();
  const summaryItems = t.raw('summary.items');

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", color:"#F0F4FF", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Nav */}
      <nav style={{ position:"sticky",top:0,zIndex:100,padding:"14px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1E2733" }}>
        <div style={{ fontWeight:900,fontSize:20,letterSpacing:-1,cursor:"pointer" }} onClick={()=>router.push(locale === 'fr' ? '/' : `/${locale}`)}>
          Doc<span style={{ color:"#3B82F6" }}>Swift</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <LanguageSwitcher />
          <button onClick={()=>router.back()} style={{ background:"none",border:"1px solid #1E2733",color:"#8892AA",padding:"7px 14px",borderRadius:8,fontSize:13,cursor:"pointer" }}>
            {t('back')}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:760,margin:"0 auto",padding:"60px 24px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom:48 }}>
          <div style={{ display:"inline-block",background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.15)",color:"#93C5FD",padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:16 }}>
            {t('legalBadge')}
          </div>
          <h1 style={{ fontSize:"clamp(28px,4vw,44px)",fontWeight:900,letterSpacing:-1.5,marginBottom:12 }}>
            {t('title')}
          </h1>
          <p style={{ color:"#6B7A99",fontSize:15,lineHeight:1.6,marginBottom:8 }}>
            {t('intro')}
          </p>
          <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
            <span style={{ color:"#4B5563",fontSize:13 }}>{t('lastUpdate', { date: LAST_UPDATE })}</span>
            <span style={{ color:"#4B5563",fontSize:13 }}>·</span>
            <span style={{ color:"#4B5563",fontSize:13 }}>{t('applicableSince', { date: LAST_UPDATE })}</span>
          </div>
        </div>

        {/* Summary box */}
        <div style={{ background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.15)",borderRadius:16,padding:"20px 24px",marginBottom:48 }}>
          <div style={{ fontWeight:700,fontSize:14,color:"#10B981",marginBottom:10 }}>{t('summary.title')}</div>
          <ul style={{ listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:8 }}>
            {(Array.isArray(summaryItems) ? summaryItems : []).map((item, i) => (
              <li key={i} style={{ display:"flex",alignItems:"flex-start",gap:10,fontSize:14,color:"#8892AA",lineHeight:1.6 }}>
                <span style={{ color:"#10B981",flexShrink:0,marginTop:1 }}>✓</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
          {sections.map((section, i) => (
            <div key={i} style={{ borderTop:"1px solid #1E2733",padding:"32px 0" }}>
              <h2 style={{ fontSize:18,fontWeight:800,letterSpacing:-0.3,marginBottom:16,color:"#F0F4FF" }}>
                {section.title}
              </h2>
              <div style={{ color:"#8892AA",fontSize:14,lineHeight:1.85,whiteSpace:"pre-line" }}>
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop:"1px solid #1E2733",paddingTop:32,marginTop:16,textAlign:"center" }}>
          <p style={{ color:"#4B5563",fontSize:13,marginBottom:16 }}>
            {t('footer.question')}
          </p>
          <a href="mailto:support@getdocswift.com"
            style={{ background:"#3B82F6",color:"#fff",padding:"11px 24px",borderRadius:10,fontSize:14,fontWeight:600,textDecoration:"none",display:"inline-block" }}>
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </div>
  );
}
