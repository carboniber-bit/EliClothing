import type { Produto } from "./produto";

export type LinhaImagem = { caminho: string; principal: boolean; ordem: number };
export type LinhaProduto = {
  id: string;
  slug: string;
  nome: string;
  preco_centavos: number;
  preco_promocional_centavos: number | null;
  novidade: boolean;
  destaque: boolean;
  imagens: LinhaImagem[] | null;
  variacoes: { id: string; tamanho: string; cor: string; estoque: number }[] | null;
};

/** Endereço público de uma foto guardada no Storage (bucket "produtos"). */
export function urlFoto(baseSupabase: string, caminho: string): string {
  return `${baseSupabase.replace(/\/+$/, "")}/storage/v1/object/public/produtos/${caminho
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/** A foto marcada como principal; se não houver, a primeira na ordem. */
export function escolherImagemPrincipal(imagens: LinhaImagem[] | null): LinhaImagem | null {
  if (!imagens || imagens.length === 0) return null;
  return imagens.find((i) => i.principal) ?? [...imagens].sort((a, b) => a.ordem - b.ordem)[0];
}

export function mapearProduto(linha: LinhaProduto, baseSupabase: string | null): Produto {
  const imagem = escolherImagemPrincipal(linha.imagens);
  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.nome,
    precoCentavos: linha.preco_centavos,
    precoPromocionalCentavos: linha.preco_promocional_centavos,
    imagemPrincipalUrl: imagem && baseSupabase ? urlFoto(baseSupabase, imagem.caminho) : null,
    novidade: linha.novidade,
    destaque: linha.destaque,
    variacoes: (linha.variacoes ?? []).map((v) => ({ id: v.id, tamanho: v.tamanho, cor: v.cor, estoque: v.estoque })),
  };
}
