"use client";

import Image from "next/image";
import Link from "next/link";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { formatarPreco } from "@/lib/catalogo/produto";
import { useCarrinho } from "./CarrinhoProvider";

const passo = "inline-flex h-11 w-11 items-center justify-center rounded-full border border-borda text-lg font-semibold hover:bg-acento/30 disabled:opacity-40";

export function ListaCarrinho() {
  const { itens, pronto, subtotalCentavos, alterar, remover } = useCarrinho();

  if (!pronto) return <p className="text-texto-suave">Carregando a sacola…</p>;
  if (itens.length === 0) {
    return <EstadoVazio titulo="Sua sacola está vazia" texto="Escolha as peças que você gostou e elas aparecem aqui." acao={<Botao href="/catalogo">Ver o catálogo</Botao>} />;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <ul className="space-y-4">
        {itens.map((i) => (
          <li key={i.variacaoId} className="flex gap-4 rounded-2xl border border-borda bg-superficie p-3 sm:p-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-fundo">
              {i.foto ? <Image src={i.foto} alt="" fill sizes="80px" className="object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Link href={`/produto/${i.slug}`} className="block font-semibold [overflow-wrap:anywhere] hover:underline">
                {i.nome}
              </Link>
              <p className="text-sm text-texto-suave [overflow-wrap:anywhere]">
                Tamanho {i.tamanho}
                {i.cor ? ` · ${i.cor}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={passo} aria-label={`Diminuir quantidade de ${i.nome}`} onClick={() => alterar(i.variacaoId, i.quantidade - 1)}>
                  −
                </button>
                <span aria-live="polite" className="min-w-8 text-center font-semibold">
                  {i.quantidade}
                </span>
                <button type="button" className={passo} aria-label={`Aumentar quantidade de ${i.nome}`} disabled={i.quantidade >= Math.min(20, i.estoque)} onClick={() => alterar(i.variacaoId, i.quantidade + 1)}>
                  +
                </button>
                <button type="button" onClick={() => remover(i.variacaoId)} className="ml-2 min-h-11 text-sm font-semibold underline">
                  Remover<span className="sr-only"> {i.nome}</span>
                </button>
              </div>
              {i.quantidade >= i.estoque ? <p className="text-xs text-texto-suave">Quantidade máxima disponível.</p> : null}
              <p className="font-titulo text-lg font-semibold">{formatarPreco(i.precoCentavos * i.quantidade)}</p>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-2xl border border-borda bg-superficie p-5">
        <h2 className="text-2xl">Resumo</h2>
        <p className="mt-4 flex justify-between gap-3 text-lg">
          <span>Total das peças</span>
          <strong>{formatarPreco(subtotalCentavos)}</strong>
        </p>
        <p className="mt-2 text-sm text-texto-suave">Frete e forma de pagamento são combinados ao finalizar o pedido.</p>
      </aside>
    </div>
  );
}
