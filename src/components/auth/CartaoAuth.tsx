import type { ReactNode } from "react";

export function CartaoAuth({ titulo, intro, children, rodape }: { titulo: string; intro?: string; children: ReactNode; rodape?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-4xl">{titulo}</h1>
      {intro ? <p className="mt-2 text-texto-suave">{intro}</p> : null}
      <div className="mt-6">{children}</div>
      {rodape ? <div className="mt-6 space-y-2 text-sm">{rodape}</div> : null}
    </div>
  );
}

export function EsqueletoFormulario() {
  return <div aria-hidden="true" className="h-64 animate-pulse rounded-2xl bg-superficie" />;
}
