import type { ReactNode } from "react";

/** Moldura simples para páginas de texto corrido (privacidade, termos). */
export function PaginaTexto({ titulo, atualizado, children }: { titulo: string; atualizado: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 md:pt-16 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_li]:mb-2 [&_p]:mb-4 [&_p]:text-texto-suave [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-texto-suave [&_a]:font-semibold [&_a]:underline [&_*]:[overflow-wrap:anywhere]">
      <h1 className="text-4xl md:text-5xl">{titulo}</h1>
      <p className="mt-3 text-sm">Atualizado em {atualizado}</p>
      <div className="mt-8">{children}</div>
    </article>
  );
}
