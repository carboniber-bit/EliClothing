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
