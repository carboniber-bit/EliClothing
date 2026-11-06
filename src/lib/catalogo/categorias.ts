export type Categoria = { id: string; slug: string; nome: string; paiId: string | null };
export type CategoriaComFilhos = Categoria & { filhos: Categoria[] };

/**
 * Agrupa em dois níveis: categorias principais com suas subcategorias.
 * Quem aponta para um pai que não existe (ou está escondido) aparece como principal.
 * A ordem recebida é mantida.
 */
export function montarArvore(lista: Categoria[]): CategoriaComFilhos[] {
  const ids = new Set(lista.map((c) => c.id));
  const raizes = lista.filter((c) => c.paiId === null || !ids.has(c.paiId) || c.paiId === c.id);
  return raizes.map((r) => ({ ...r, filhos: lista.filter((c) => c.paiId === r.id && c.id !== r.id) }));
}

/** A categoria e suas subcategorias (para listar tudo o que pertence a ela). */
export function idsDaCategoria(lista: Categoria[], id: string): string[] {
  return [id, ...lista.filter((c) => c.paiId === id && c.id !== id).map((c) => c.id)];
}
