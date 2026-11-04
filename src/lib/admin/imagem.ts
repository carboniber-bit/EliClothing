export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
export const LADO_MAXIMO = 1600;

/** Reduz mantendo a proporção; nunca aumenta. */
export function calcularTamanho(largura: number, altura: number, maximo = LADO_MAXIMO): { largura: number; altura: number } {
  const maior = Math.max(largura, altura);
  if (maior <= maximo) return { largura, altura };
  const fator = maximo / maior;
  return { largura: Math.max(1, Math.round(largura * fator)), altura: Math.max(1, Math.round(altura * fator)) };
}

/** O caminho gravado no banco precisa estar na pasta do próprio produto e ter o formato esperado. */
export function caminhoFotoValido(produtoId: string, caminho: string): boolean {
  return new RegExp(`^${produtoId}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.jpg$`, "i").test(caminho);
}

/** Troca a foto de lugar com a vizinha (-1 sobe, +1 desce). Devolve a nova ordem dos ids. */
export function reordenar(ids: string[], id: string, direcao: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + direcao;
  if (i === -1 || j < 0 || j >= ids.length) return ids;
  const novo = [...ids];
  [novo[i], novo[j]] = [novo[j], novo[i]];
  return novo;
}
