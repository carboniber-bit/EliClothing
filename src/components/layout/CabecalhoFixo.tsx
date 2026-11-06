"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Cabeçalho fixo: ganha fundo de vidro ao rolar, esconde ao descer rápido e volta ao subir. */
export function CabecalhoFixo({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let ultimo = window.scrollY;
    const aoRolar = () => {
      const el = ref.current;
      if (!el) return;
      const y = window.scrollY;
      el.dataset.rolado = String(y > 24);
      if (y > 400 && y > ultimo + 4) el.dataset.oculto = "true";
      else if (y < ultimo - 4) el.dataset.oculto = "false";
      ultimo = y;
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Quem navega pelo teclado precisa ver o cabeçalho quando o foco entra nele.
  return (
    <header
      ref={ref}
      onFocusCapture={() => {
        if (ref.current) ref.current.dataset.oculto = "false";
      }}
      className="cabecalho-fixo sticky top-0 z-40"
    >
      {children}
    </header>
  );
}
