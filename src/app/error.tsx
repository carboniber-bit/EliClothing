"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Só o código de rastreio vai para o console; a mensagem técnica nunca aparece para a cliente.
    console.error("[erro de página]", error.digest ?? "sem-codigo");
  }, [error]);
  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 md:pt-24">
      <h1 className="text-4xl md:text-5xl">Algo deu errado</h1>
      <p className="mt-4 max-w-xl text-texto-suave">Não foi possível carregar esta página agora. Tente de novo; se continuar, fale com a gente pelo WhatsApp.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-12 items-center justify-center rounded-full bg-primario px-8 text-sm font-semibold text-primario-texto shadow-suave">
          Tentar de novo
        </button>
        <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-primario px-8 text-sm font-semibold">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
