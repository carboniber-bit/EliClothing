export type Variacao = {
  id: string;
  tamanho: string;
  cor: string;
  estoque: number;
};

/** Valores em centavos inteiros, para nunca errar conta com vírgula. */
export type Produto = {
  id: string;
  slug: string;
  nome: string;
  precoCentavos: number;
  precoPromocionalCentavos: number | null;
  imagemPrincipalUrl: string | null;
  novidade: boolean;
  destaque: boolean;
  variacoes: Variacao[];
};

export function precoFinal(p: Produto): number {
  const promo = p.precoPromocionalCentavos;
  return promo !== null && promo < p.precoCentavos ? promo : p.precoCentavos;
}

export function temEstoque(p: Produto): boolean {
  return p.variacoes.some((v) => v.estoque > 0);
}

/** Abaixo desta quantidade (somando todas as variações) a loja avisa que restam poucas unidades. */
export const LIMITE_POUCAS_UNIDADES = 3;

export function estoqueTotal(p: Produto): number {
  return p.variacoes.reduce((soma, v) => soma + Math.max(0, v.estoque), 0);
}

/** Tem estoque, mas menos que o limite (1 ou 2 unidades). Sem estoque não é "poucas": é indisponível. */
export function poucasUnidades(p: Produto): boolean {
  const total = estoqueTotal(p);
  return total > 0 && total < LIMITE_POUCAS_UNIDADES;
}

export function formatarPreco(centavos: number): string {
  const total = Math.round(centavos);
  const reais = Math.floor(total / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const resto = (total % 100).toString().padStart(2, "0");
  return `R$ ${reais},${resto}`;
}
