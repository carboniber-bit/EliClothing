"use client";

import { useActionState } from "react";
import type { EstadoForm } from "@/lib/auth/estado";
import { proximosStatus, ROTULO_STATUS, type StatusPedido } from "@/lib/pedidos/status";

type Props = {
  acao: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
  atual: StatusPedido;
};

/** Botões com as próximas situações permitidas. Cancelar pede confirmação (devolve o estoque). */
export function MudarStatus({ acao, atual }: Props) {
  const [estado, executar, pendente] = useActionState(acao, {} as EstadoForm);
  const opcoes = proximosStatus(atual);
  if (opcoes.length === 0) return <p className="text-sm text-texto-suave">Este pedido está encerrado e não muda mais.</p>;

  return (
    <form action={executar} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {opcoes.map((s) => {
          const perigoso = s === "cancelado" || s === "expirado";
          return (
            <button
              key={s}
              type="submit"
              name="status"
              value={s}
              disabled={pendente}
              onClick={(e) => {
                if (perigoso && !window.confirm(`Marcar como “${ROTULO_STATUS[s]}”? O estoque dos itens volta para a loja e isso não pode ser desfeito.`)) e.preventDefault();
              }}
              className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold disabled:opacity-60 ${
                perigoso ? "border-erro text-erro hover:bg-acento/20" : "border-primario bg-primario text-primario-texto"
              }`}
            >
              {ROTULO_STATUS[s]}
            </button>
          );
        })}
      </div>
      <p role="status" aria-live="polite" className={`text-sm ${estado.erro ? "text-erro" : "text-texto-suave"}`}>
        {pendente ? "Salvando…" : (estado.erro ?? estado.sucesso ?? "")}
      </p>
    </form>
  );
}
