import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "DocSwift — Tous les outils PDF dont vous avez besoin",
  description: "Convertissez, compressez, signez, fusionnez et divisez vos PDFs. Gratuit jusqu'à 5 conversions/jour, illimité en Pro.",
  keywords: "convertir PDF, PDF en Word, compresser PDF, fusionner PDF, outils PDF",
  openGraph: {
    title: "DocSwift — Tous les outils PDF dont vous avez besoin",
    description: "Convertissez, compressez, signez, fusionnez et divisez vos PDFs.",
    siteName: "DocSwift",
    type: "website",
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
