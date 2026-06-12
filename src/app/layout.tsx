import type { Metadata } from "next";
import { Inter, DM_Mono, Geist } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Startzy",
  description:
    "Startzy — Plataforma de IA para agências digitais. Crie sites profissionais em minutos, faça prospecção automática e gere receita recorrente. Comece grátis.",
  keywords: [
    "startzy",
    "plataforma de ia para agencias",
    "criar site com ia",
    "prospeccao automatica",
    "agencia digital",
    "site profissional com ia",
    "faturamento recorrente",
    "ia para marketing",
    "criacao de sites automatica",
    "gestao de clientes",
  ],
  authors: [{ name: "Startzy" }],
  creator: "Startzy",
  publisher: "Startzy",
  metadataBase: new URL("https://startzy.com.br"),
  alternates: {
    canonical: "https://startzy.com.br",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://startzy.com.br",
    siteName: "Startzy",
    title: "Startzy — Plataforma de IA para Agências Digitais",
    description:
      "Crie sites profissionais em minutos com IA. Prospecção automática, gestão de clientes e faturamento recorrente — tudo em uma plataforma.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Startzy — Plataforma de IA para Agências Digitais",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Startzy — Plataforma de IA para Agências Digitais",
    description:
      "Crie sites profissionais em minutos com IA. Prospecção automática e gestão de clientes.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", inter.variable, dmMono.variable, "font-sans", geist.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Startzy",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Plataforma de IA para agências digitais. Crie sites profissionais em minutos, faça prospecção automática e gere receita recorrente.",
              url: "https://startzy.com.br",
              author: {
                "@type": "Organization",
                name: "Startzy",
                url: "https://startzy.com.br",
              },
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "BRL",
                lowPrice: "0",
                highPrice: "297",
                offerCount: "3",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "847",
                bestRating: "5",
                worstRating: "1",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-vms-fundo font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
