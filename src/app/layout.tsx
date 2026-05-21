import type { Metadata } from "next";
import { Outfit, DM_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Startzy — Crie sites com IA e fature como agência",
    template: "%s | Startzy",
  },
  description:
    "Crie sites profissionais em minutos com IA. Prospecção, criação e gestão — tudo em uma plataforma para agências digitais.",
  metadataBase: new URL("https://startzy.com.br"),
  alternates: {
    canonical: "https://startzy.com.br",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://startzy.com.br",
    siteName: "Startzy",
    title: "Startzy — Crie sites com IA e fature como agência",
    description:
      "Crie sites profissionais em minutos com IA. Prospecção, criação e gestão — tudo em uma plataforma.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Startzy — Crie sites com IA e fature como agência",
    description:
      "Crie sites profissionais em minutos com IA. Prospecção, criação e gestão — tudo em uma plataforma.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${dmMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-vms-fundo font-sans">{children}</body>
    </html>
  );
}
