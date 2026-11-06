"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
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

function lerBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

// Sem armazenamento (janela privada) o carrinho vale só até recarregar a página.
let reserva: string | null = null;
const ouvintes = new Set<() => void>();

function lerAtual(): string | null {
  return lerBruto() ?? reserva;
}

function gravar(itens: ItemCarrinho[]) {
  const texto = JSON.stringify(itens);
  reserva = texto;
  try {
    window.localStorage.setItem(CHAVE, texto);
  } catch {
    // segue só com a reserva em memória
  }
  ouvintes.forEach((f) => f());
}

function assinar(aviso: () => void) {
  ouvintes.add(aviso);
  // Mantém abas abertas ao mesmo tempo em sincronia.
  const aoMudar = (e: StorageEvent) => {
    if (e.key === CHAVE) aviso();
  };
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(aviso);
    window.removeEventListener("storage", aoMudar);
  };
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  // No servidor o retorno é undefined ("ainda não li"); no navegador é o texto guardado (ou null se vazio).
  const bruto = useSyncExternalStore(assinar, lerAtual, () => undefined);
  const pronto = bruto !== undefined;
  const itens = useMemo(() => lerCarrinho(bruto ?? null), [bruto]);

  const atualizar = useCallback((fn: (atual: ItemCarrinho[]) => ItemCarrinho[]) => {
    // Parte sempre do que está guardado, para não apagar mudanças feitas em outra aba.
    gravar(fn(lerCarrinho(lerAtual())));
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
