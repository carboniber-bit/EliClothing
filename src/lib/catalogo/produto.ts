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

export function formatarPreco(centavos: number): string {
  const total = Math.round(centavos);
  const reais = Math.floor(total / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const resto = (total % 100).toString().padStart(2, "0");
  return `R$ ${reais},${resto}`;
}
