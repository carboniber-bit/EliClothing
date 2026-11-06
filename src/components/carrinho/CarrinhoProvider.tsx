"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { adicionarItem, alterarQuantidade, lerCarrinho, quantidadeTotal, removerItem, subtotalCentavos, type ItemCarrinho } from "@/lib/carrinho/carrinho";

const CHAVE = "eliclothing-carrinho-v1";

type Contexto = {
  itens: ItemCarrinho[];
  /** false até o navegador ler o que estava guardado (evita piscar "carrinho vazio"). */
  pronto: boolean;
  quantidade: number;
  subtotalCentavos: number;
  adicionar: (item: Omit<ItemCarrinho, "quantidade">, quantidade?: number) => void;
  alterar: (variacaoId: string, quantidade: number) => void;
  remover: (variacaoId: string) => void;
  limpar: () => void;
};

const CarrinhoContexto = createContext<Contexto | null>(null);

function ler(): ItemCarrinho[] {
  try {
    return lerCarrinho(window.localStorage.getItem(CHAVE));
  } catch {
    return [];
  }
}

function gravar(itens: ItemCarrinho[]) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(itens));
  } catch {
    // Navegador sem armazenamento (janela privada): o carrinho vale só enquanto a página estiver aberta.
  }
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setItens(ler());
    setPronto(true);
    // Mantém abas abertas ao mesmo tempo em sincronia.
    const aoMudar = (e: StorageEvent) => {
      if (e.key === CHAVE) setItens(ler());
    };
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, []);

  const atualizar = useCallback((fn: (atual: ItemCarrinho[]) => ItemCarrinho[]) => {
    // Parte sempre do que está guardado, para não apagar mudanças feitas em outra aba.
    const novo = fn(ler());
    gravar(novo);
    setItens(novo);
  }, []);

  const valor = useMemo<Contexto>(
    () => ({
      itens,
      pronto,
      quantidade: quantidadeTotal(itens),
      subtotalCentavos: subtotalCentavos(itens),
      adicionar: (item, q = 1) => atualizar((a) => adicionarItem(a, item, q)),
      alterar: (id, q) => atualizar((a) => alterarQuantidade(a, id, q)),
      remover: (id) => atualizar((a) => removerItem(a, id)),
      limpar: () => atualizar(() => []),
    }),
    [itens, pronto, atualizar],
  );

  return <CarrinhoContexto.Provider value={valor}>{children}</CarrinhoContexto.Provider>;
}

export function useCarrinho(): Contexto {
  const c = useContext(CarrinhoContexto);
  if (!c) throw new Error("useCarrinho precisa estar dentro de CarrinhoProvider");
  return c;
}
