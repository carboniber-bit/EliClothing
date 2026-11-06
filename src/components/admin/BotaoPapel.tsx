"use client";

import { useActionState } from "react";
import type { EstadoForm } from "@/lib/auth/estado";

export function BotaoPapel({ acao, rotulo, pergunta }: { acao: (estado: EstadoForm) => Promise<EstadoForm>; rotulo: string; pergunta: string }) {
  const [estado, executar, pendente] = useActionState(acao, {} as EstadoForm);
  return (
    <form
      action={executar}
      onSubmit={(e) => {
        if (!window.confirm(pergunta)) e.preventDefault();
      }}
      className="space-y-1"
    >
      <button
        type="submit"
        disabled={pendente}
        className="inline-flex min-h-11 items-center rounded-full border border-borda px-5 text-sm font-semibold transition-colors hover:bg-acento/30 disabled:opacity-60"
      >
        {pendente ? "Salvando…" : rotulo}
      </button>
      <p role="status" aria-live="polite" className={`text-sm ${estado.erro ? "text-erro" : "text-texto-suave"}`}>
        {estado.erro ?? estado.sucesso ?? ""}
      </p>
    </form>
  );
}
