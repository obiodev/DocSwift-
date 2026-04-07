import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "DocSwift — Tous les outils PDF dont vous avez besoin",
  description: "Convertissez, compressez, fusionnez et divisez vos PDFs. Créez votre CV professionnel en PDF. Gratuit jusqu'à 5 conversions/jour, illimité en Pro.",
  keywords: "convertir PDF, PDF en Word, compresser PDF, fusionner PDF, diviser PDF, créer CV PDF, outils PDF gratuit",
  robots: { index: true, follow: true },
  openGraph: {
    title: "DocSwift — Tous les outils PDF dont vous avez besoin",
    description: "Convertissez, compressez, fusionnez et divisez vos PDFs. Créez votre CV professionnel. Gratuit et sans inscription.",
    siteName: "DocSwift",
    url: "https://getdocswift.com",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocSwift — Tous les outils PDF dont vous avez besoin",
    description: "Convertissez, compressez, fusionnez vos PDFs. Créez votre CV en PDF. Gratuit.",
  },
  alternates: {
    canonical: "https://getdocswift.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ minHeight: "100vh", background: "#07090F", color: "#F0F4FF", margin: 0 }}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
