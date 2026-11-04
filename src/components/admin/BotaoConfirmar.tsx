"use client";

import type { ReactNode } from "react";

/** Botão de ação perigosa (excluir): pede confirmação antes de enviar. */
export function BotaoConfirmar({ acao, pergunta, children }: { acao: () => Promise<void>; pergunta: string; children: ReactNode }) {
  return (
    <form
      action={acao}
      onSubmit={(e) => {
        if (!window.confirm(pergunta)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-erro px-5 py-2 text-sm font-semibold text-erro hover:bg-superficie"
      >
        {children}
      </button>
    </form>
  );
}
