"use client";

import Image from "next/image";
import { useState } from "react";

export function GaleriaProduto({ fotos, nome }: { fotos: string[]; nome: string }) {
  const [atual, setAtual] = useState(0);
  if (fotos.length === 0) {
    return (
      <div aria-hidden="true" className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl bg-superficie text-texto-suave">
        <span className="font-titulo text-6xl tracking-[0.08em]">ELI</span>
        <span className="text-xs font-bold tracking-[0.5em]">CLOTHING</span>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-superficie shadow-suave">
        <Image src={fotos[atual]} alt={`${nome} — foto ${atual + 1} de ${fotos.length}`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
      {fotos.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Fotos do produto">
          {fotos.map((url, i) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setAtual(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === atual ? "true" : undefined}
                className={`relative block h-20 w-16 overflow-hidden rounded-xl border-2 ${i === atual ? "border-primario" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                <Image src={url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
