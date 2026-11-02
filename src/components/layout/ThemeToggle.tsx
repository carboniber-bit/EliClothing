"use client";

import { useLayoutEffect, useState } from "react";
import { aplicarTemaSalvo, salvarTema, type Tema } from "@/lib/tema";

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema | null>(null);

  // Reaplica o tema salvo antes da pintura. Em desenvolvimento o React limpa o
  // atributo do <html> ao remontar; em produção isto não muda nada.
  useLayoutEffect(() => {
    setTema(aplicarTemaSalvo());
  }, []);

  function alternar() {
    const proximo: Tema = document.documentElement.dataset.tema === "dark" ? "light" : "dark";
    salvarTema(proximo);
    setTema(proximo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Alternar tema claro/escuro"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-borda bg-superficie text-texto transition-colors hover:bg-acento hover:text-primario-texto"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {tema === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  );
}
