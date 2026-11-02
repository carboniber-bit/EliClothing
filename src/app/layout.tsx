import type { Metadata } from "next";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/manrope";
import "./globals.css";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
      <body className="min-h-screen">
        {/* Provisório: a Tarefa 3 move o botão para o cabeçalho. */}
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
