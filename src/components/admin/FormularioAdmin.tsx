"use client";

import { useActionState } from "react";
import type { EstadoForm } from "@/lib/auth/estado";

export type CampoAdmin = {
  nome: string;
  rotulo: string;
  tipo: "texto" | "area" | "dinheiro" | "inteiro" | "select" | "checkbox";
  dica?: string;
  opcoes?: { valor: string; rotulo: string }[];
};

type Props = {
  acao: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
  campos: CampoAdmin[];
  iniciais?: Record<string, string>;
  botao: string;
  /** Campos lado a lado em telas largas (usado nas linhas de edição rápida). */
  compacto?: boolean;
};

const entrada = "min-h-11 w-full rounded-xl border border-borda bg-fundo px-4 text-base text-texto";

export function FormularioAdmin({ acao, campos, iniciais, botao, compacto }: Props) {
  const [estado, executar, pendente] = useActionState(acao, {} as EstadoForm);
  const fonte = estado.valores ?? iniciais ?? {};

  return (
    <form action={executar} noValidate className="space-y-4">
      <div className={compacto ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "space-y-4"}>
        {campos.map((campo) => {
          const erro = estado.campos?.[campo.nome];
          const idErro = `${campo.nome}-erro`;
          const idDica = `${campo.nome}-dica`;
          const descricao = [campo.dica ? idDica : null, erro ? idErro : null].filter(Boolean).join(" ") || undefined;
          const valor = fonte[campo.nome] ?? "";

          return (
            <div key={campo.nome}>
              {campo.tipo === "checkbox" ? (
                <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name={campo.nome}
                    defaultChecked={valor === "on"}
                    aria-describedby={descricao}
                    className="h-5 w-5 accent-primario"
                  />
                  {campo.rotulo}
                </label>
              ) : (
                <>
                  <label htmlFor={campo.nome} className="mb-1 block text-sm font-semibold">
                    {campo.rotulo}
                  </label>
                  {campo.tipo === "area" ? (
                    <textarea
                      id={campo.nome}
                      name={campo.nome}
                      rows={4}
                      defaultValue={valor}
                      aria-invalid={erro ? true : undefined}
                      aria-describedby={descricao}
                      className={`${entrada} py-3`}
                    />
                  ) : campo.tipo === "select" ? (
                    <select
                      id={campo.nome}
                      name={campo.nome}
                      defaultValue={valor}
                      aria-invalid={erro ? true : undefined}
                      aria-describedby={descricao}
                      className={entrada}
                    >
                      {(campo.opcoes ?? []).map((o) => (
                        <option key={o.valor} value={o.valor}>
                          {o.rotulo}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={campo.nome}
                      name={campo.nome}
                      type="text"
                      inputMode={campo.tipo === "dinheiro" ? "decimal" : campo.tipo === "inteiro" ? "numeric" : "text"}
                      defaultValue={valor}
                      aria-invalid={erro ? true : undefined}
                      aria-describedby={descricao}
                      className={entrada}
                    />
                  )}
                </>
              )}
              {campo.dica ? (
                <p id={idDica} className="mt-1 text-sm text-texto-suave">
                  {campo.dica}
                </p>
              ) : null}
              {erro ? (
                <p id={idErro} className="mt-1 text-sm font-semibold text-erro">
                  {erro}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {estado.erro ? (
        <p role="alert" className="rounded-2xl border border-erro p-3 text-sm font-semibold text-erro">
          {estado.erro}
        </p>
      ) : null}
      {estado.sucesso ? (
        <p role="status" className="rounded-2xl border border-borda bg-superficie p-3 text-sm font-semibold">
          {estado.sucesso}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pendente}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-primario px-6 py-2.5 text-sm font-semibold text-primario-texto transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pendente ? "Salvando…" : botao}
      </button>
    </form>
  );
}
