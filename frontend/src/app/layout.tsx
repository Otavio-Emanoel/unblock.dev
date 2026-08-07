import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unblock.dev | Pair Programming SOS & Mentoria Sob Demanda em Tempo Real",
  description: "Desbloqueie bugs complexos em minutos com mentores sêniores. Sala de pair programming ao vivo com Vídeo HD, Editor Monaco simultâneo via CRDT e cobrança por minuto.",
  keywords: ["pair programming", "mentoria dev", "sos bugs", "livekit", "monaco editor", "yjs", "pair programming ao vivo", "react", "golang"],
  openGraph: {
    title: "Unblock.dev — Pair Programming Sob Demanda",
    description: "SOS para Desenvolvedores: Resolva bugs complexos com mentores especialistas em tempo real com cobrança por minuto.",
    type: "website",
    url: "https://unblock.dev",
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
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
