"use client";

import Link from "next/link";
import { useCarrinho } from "./CarrinhoProvider";

export function BotaoCarrinho() {
  const { quantidade, pronto } = useCarrinho();
  const n = pronto ? quantidade : 0;
  return (
    <Link
      href="/carrinho"
      aria-label={n > 0 ? `Sacola, ${n} ${n === 1 ? "item" : "itens"}` : "Sacola"}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-primario transition-colors hover:bg-acento/30"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {n > 0 ? (
        <span aria-hidden="true" className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primario px-1 text-[0.7rem] font-bold text-primario-texto">
          {n}
        </span>
      ) : null}
    </Link>
  );
}
