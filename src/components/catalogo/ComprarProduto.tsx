"use client";

import Link from "next/link";
import { useState } from "react";
import { useCarrinho } from "@/components/carrinho/CarrinhoProvider";
import { Botao } from "@/components/ui/Botao";
import { coresDisponiveis, corInicial, opcoesDeTamanho, tamanhosDaCor } from "@/lib/catalogo/variacoes";
import { LIMITE_POUCAS_UNIDADES, precoFinal, type Produto } from "@/lib/catalogo/produto";

const opcao = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-semibold [overflow-wrap:anywhere]";

export function ComprarProduto({ produto, foto }: { produto: Produto; foto: string | null }) {
  const { adicionar } = useCarrinho();
  const cores = coresDisponiveis(produto.variacoes);
  const [cor, setCor] = useState(() => corInicial(produto.variacoes));
  const [variacaoId, setVariacaoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [adicionado, setAdicionado] = useState(false);

  const tamanhos = tamanhosDaCor(produto.variacoes, cor);
  const opcoes = opcoesDeTamanho(tamanhos);
  const escolhida = tamanhos.find((v) => v.id === variacaoId) ?? null;

  if (produto.variacoes.every((v) => v.estoque <= 0)) {
    return <p className="rounded-2xl border border-borda bg-superficie p-4 text-sm font-semibold">Indisponível no momento.</p>;
  }

  function adicionarAoCarrinho() {
    if (!escolhida) {
      setAviso(tamanhos.length > 1 || cores.length > 0 ? "Escolha o tamanho antes de adicionar." : "Escolha uma opção.");
      return;
    }
    adicionar({
      variacaoId: escolhida.id,
      slug: produto.slug,
      nome: produto.nome,
      tamanho: escolhida.tamanho,
      cor: escolhida.cor,
      precoCentavos: precoFinal(produto),
      estoque: escolhida.estoque,
      foto,
    });
    setAviso(null);
    setAdicionado(true);
  }

  return (
    <div className="space-y-6">
      {cores.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {cores.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={c === cor}
                onClick={() => {
                  setCor(c);
                  setVariacaoId(null);
                  setAdicionado(false);
                }}
                className={`${opcao} ${c === cor ? "border-primario bg-primario text-primario-texto" : "border-borda bg-superficie hover:bg-acento/30"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Tamanho</legend>
        <div className="flex flex-wrap gap-2">
          {opcoes.map(({ tamanho, variacao: v }) => {
            const indisponivel = !v || v.estoque <= 0;
            const marcado = !!v && v.id === variacaoId;
            return (
              <button
                key={tamanho}
                type="button"
                disabled={indisponivel}
                aria-pressed={marcado}
                onClick={() => {
                  if (!v) return;
                  setVariacaoId(v.id);
                  setAviso(null);
                  setAdicionado(false);
                }}
                className={`${opcao} ${
                  marcado ? "border-primario bg-primario text-primario-texto" : "border-borda bg-superficie hover:bg-acento/30"
                } disabled:cursor-not-allowed disabled:border-borda disabled:bg-borda/40 disabled:text-texto-suave disabled:opacity-60 ${v ? "disabled:line-through" : ""}`}
              >
                {tamanho}
                {indisponivel ? <span className="sr-only"> ({v ? "esgotado" : "não disponível neste produto"})</span> : null}
              </button>
            );
          })}
        </div>
        {escolhida && escolhida.estoque < LIMITE_POUCAS_UNIDADES ? (
          <p className="mt-2 text-sm font-semibold text-texto-suave">Poucas unidades disponíveis.</p>
        ) : null}
      </fieldset>

      <div>
        <Botao type="button" onClick={adicionarAoCarrinho} className="w-full sm:w-auto">
          Adicionar à sacola
        </Botao>
        <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm">
          {aviso ? <span className="text-erro">{aviso}</span> : adicionado ? (
            <>
              Adicionado!{" "}
              <Link href="/carrinho" className="font-semibold underline">
                Ver a sacola
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
