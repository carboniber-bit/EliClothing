import type { Metadata } from "next";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/manrope";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { loja } from "@/lib/loja/config";
import { scriptTemaInicial } from "@/lib/tema";

export const metadata: Metadata = {
  title: { default: loja.nome, template: `%s · ${loja.nome}` },
  description: `${loja.nome}: moda feminina em ${loja.cidade}. ${loja.slogan}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-tema="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTemaInicial }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primario focus:px-4 focus:py-2 focus:text-primario-texto"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
