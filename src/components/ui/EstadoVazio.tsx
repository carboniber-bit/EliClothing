import type { ReactNode } from "react";

type Props = { titulo: string; texto: string; acao?: ReactNode };

export function EstadoVazio({ titulo, texto, acao }: Props) {
  return (
    <div className="rounded-3xl border border-borda bg-superficie px-6 py-12 text-center">
      <p className="font-titulo text-2xl">{titulo}</p>
      <p className="mx-auto mt-3 max-w-md text-texto-suave">{texto}</p>
      {acao ? <div className="mt-6 flex justify-center">{acao}</div> : null}
    </div>
  );
}
