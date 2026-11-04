"use client";

import { useActionState } from "react";
import type { EstadoForm } from "@/lib/auth/estado";

type Props = {
  acao: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
  colecoes: { id: string; nome: string }[];
  marcadas: string[];
};

export function ColecoesDoProduto({ acao, colecoes, marcadas }: Props) {
  const [estado, executar, pendente] = useActionState(acao, {} as EstadoForm);
  const marcadasSet = new Set(marcadas);

  return (
    <form action={executar} className="space-y-2">
      <p className="mb-2 text-texto-suave">Marque as coleções em que esta peça aparece.</p>
      {colecoes.map((c) => (
        <label key={c.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="colecao" value={c.id} defaultChecked={marcadasSet.has(c.id)} className="h-5 w-5 accent-primario" />
          {c.nome}
        </label>
      ))}
      <button
        type="submit"
        disabled={pendente}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-primario px-6 text-sm font-semibold text-primario-texto transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {pendente ? "Salvando…" : "Salvar coleções"}
      </button>
      {estado.sucesso ? (
        <p role="status" className="rounded-2xl border border-borda bg-superficie p-3 text-sm font-semibold">
          {estado.sucesso}
        </p>
      ) : null}
      {estado.erro ? (
        <p role="alert" className="rounded-2xl border border-erro p-3 text-sm font-semibold text-erro">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}
