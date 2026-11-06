import type { Variacao } from "./produto";

/** Cores distintas, na ordem em que aparecem. Variações sem cor não geram opção. */
export function coresDisponiveis(variacoes: Variacao[]): string[] {
  return [...new Set(variacoes.map((v) => v.cor).filter((c) => c !== ""))];
}

/** Tamanhos da cor escolhida (ou todos, se o produto não tem cores). */
export function tamanhosDaCor(variacoes: Variacao[], cor: string): Variacao[] {
  return variacoes.filter((v) => v.cor === cor);
}

/** A cor que abre selecionada: a primeira com estoque, senão a primeira. */
export function corInicial(variacoes: Variacao[]): string {
  const comEstoque = variacoes.find((v) => v.estoque > 0);
  return (comEstoque ?? variacoes[0])?.cor ?? "";
}

export const ESCALA_PADRAO = ["PP", "P", "M", "G", "GG", "XG"] as const;

export type OpcaoTamanho = { tamanho: string; variacao: Variacao | null };

/**
 * Tamanhos mostrados na página. Se todos os tamanhos do produto são da escala de letras (PP a XG),
 * mostra a escala inteira e deixa sem variação (cinza) os que o produto não tem.
 * Caso contrário (38/44, Único...), mostra só os tamanhos do produto.
 */
export function opcoesDeTamanho(variacoesDaCor: Variacao[]): OpcaoTamanho[] {
  const escala = ESCALA_PADRAO as readonly string[];
  if (variacoesDaCor.length > 0 && variacoesDaCor.every((v) => escala.includes(v.tamanho))) {
    return ESCALA_PADRAO.map((t) => ({ tamanho: t, variacao: variacoesDaCor.find((v) => v.tamanho === t) ?? null }));
  }
  return variacoesDaCor.map((v) => ({ tamanho: v.tamanho, variacao: v }));
}
