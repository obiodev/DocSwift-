import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const BASE_URL = "https://getdocswift.com";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DocSwift — L'assistant PDF intelligent pour les professionnels",
    template: "%s | DocSwift",
  },
  description: "DocSwift analyse 100 CVs en 2 minutes, extrait les clauses de vos contrats et traite tous vos PDFs. Solution B2B pour PME, cabinets RH et avocats.",
  keywords: [
    "analyse CV IA", "tri CV automatique", "recrutement IA", "DocSwift HR",
    "outils PDF entreprise", "PDF en Word", "compresser PDF", "fusionner PDF",
    "extraction clauses contrat", "assistant PDF", "gestion documents PME",
    "logiciel RH PME", "scoring CV", "matching candidats",
  ],
  authors: [{ name: "DocSwift", url: BASE_URL }],
  creator: "DocSwift",
  publisher: "DocSwift",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "DocSwift — L'assistant PDF intelligent pour les professionnels",
    description: "Analysez 100 CVs en 2 minutes. Extrayez des clauses contractuelles. Gérez tous vos documents PDF. Pour PME, cabinets RH et avocats.",
    siteName: "DocSwift",
    url: BASE_URL,
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US", "ar_SA"],
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "DocSwift — Assistant PDF intelligent B2B",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocSwift — Analysez 100 CVs en 2 minutes",
    description: "L'assistant PDF intelligent pour les professionnels. DocSwift HR, DocSwift AI, PDF Essentials.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@docswift",
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "fr": BASE_URL,
      "en": `${BASE_URL}/en`,
      "ar": `${BASE_URL}/ar`,
    },
  },
  verification: {
    google: "GOOGLE_SITE_VERIFICATION_TOKEN",
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "DocSwift",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`,
        "width": 200,
        "height": 60,
      },
      "description": "L'assistant PDF intelligent pour les professionnels. Analyse de CVs par IA, extraction de clauses et gestion de documents PDF.",
      "sameAs": [],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "url": BASE_URL,
      "name": "DocSwift",
      "description": "Assistant PDF intelligent B2B — Analyse de CVs, extraction de clauses, outils PDF",
      "publisher": { "@id": `${BASE_URL}/#organization` },
      "inLanguage": ["fr-FR", "en-US", "ar-SA"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${BASE_URL}/tools?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#software`,
      "name": "DocSwift",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": BASE_URL,
      "description": "Plateforme B2B d'analyse de CVs par IA et de gestion de documents PDF pour PME, cabinets RH et avocats.",
      "offers": [
        {
          "@type": "Offer",
          "name": "Starter",
          "price": "19",
          "priceCurrency": "EUR",
          "priceSpecification": { "@type": "UnitPriceSpecification", "price": "19", "priceCurrency": "EUR", "unitCode": "MON" },
        },
        {
          "@type": "Offer",
          "name": "Pro",
          "price": "49",
          "priceCurrency": "EUR",
          "priceSpecification": { "@type": "UnitPriceSpecification", "price": "49", "priceCurrency": "EUR", "unitCode": "MON" },
        },
        {
          "@type": "Offer",
          "name": "Business",
          "price": "149",
          "priceCurrency": "EUR",
          "priceSpecification": { "@type": "UnitPriceSpecification", "price": "149", "priceCurrency": "EUR", "unitCode": "MON" },
        },
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "312",
        "bestRating": "5",
        "worstRating": "1",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Combien de CVs peut-on analyser simultanément ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Jusqu'à 100 CVs en parallèle sur les plans Pro et Business. Chaque analyse prend moins de 10 secondes." },
        },
        {
          "@type": "Question",
          "name": "Les données de mes candidats sont-elles sécurisées ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui. Les fichiers sont traités et supprimés immédiatement après analyse. Aucune donnée RH n'est conservée au-delà de votre session." },
        },
        {
          "@type": "Question",
          "name": "Y a-t-il une période d'essai gratuite ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui, 7 jours d'essai gratuit sur le plan Pro, sans carte bancaire requise." },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ minHeight: "100vh", background: "#07090F", color: "#F0F4FF", margin: 0 }}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
