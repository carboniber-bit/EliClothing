"use client";

import { useActionState } from "react";
import type { EstadoForm } from "@/lib/auth/estado";

export type CampoAuth = {
  nome: string;
  rotulo: string;
  tipo: "text" | "email" | "password";
  autoComplete: string;
  dica?: string;
};

type Props = {
  acao: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
  campos: CampoAuth[];
  botao: string;
  ocultos?: Record<string, string>;
};

export function FormularioAuth({ acao, campos, botao, ocultos }: Props) {
  const [estado, executar, pendente] = useActionState(acao, {} as EstadoForm);

  if (estado.sucesso) {
    return (
      <p role="status" className="rounded-2xl border border-borda bg-superficie p-4">
        {estado.sucesso}
      </p>
    );
  }

  return (
    <form action={executar} noValidate className="space-y-4">
      {Object.entries(ocultos ?? {}).map(([nome, valor]) => (
        <input key={nome} type="hidden" name={nome} value={valor} />
      ))}
      {campos.map((campo) => {
        const erro = estado.campos?.[campo.nome];
        const idErro = `${campo.nome}-erro`;
        const idDica = `${campo.nome}-dica`;
        return (
          <div key={campo.nome}>
            <label htmlFor={campo.nome} className="mb-1 block text-sm font-semibold">
              {campo.rotulo}
            </label>
            <input
              id={campo.nome}
              name={campo.nome}
              type={campo.tipo}
              autoComplete={campo.autoComplete}
              defaultValue={campo.tipo === "password" ? undefined : estado.valores?.[campo.nome]}
              aria-invalid={erro ? true : undefined}
              aria-describedby={[campo.dica ? idDica : null, erro ? idErro : null].filter(Boolean).join(" ") || undefined}
              className="min-h-11 w-full rounded-xl border border-borda bg-fundo px-4 text-base text-texto"
            />
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
      {estado.erro ? (
        <p role="alert" className="rounded-2xl border border-erro p-3 text-sm font-semibold text-erro">
          {estado.erro}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pendente}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primario px-6 py-2.5 text-sm font-semibold text-primario-texto transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pendente ? "Aguarde…" : botao}
      </button>
    </form>
  );
}
