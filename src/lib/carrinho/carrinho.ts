/** Carrinho guardado no navegador. Preços aqui são só para mostrar: o servidor recalcula tudo ao fechar o pedido. */
export const MAX_POR_ITEM = 20;
export const MAX_ITENS = 50;

export type ItemCarrinho = {
  variacaoId: string;
  slug: string;
  nome: string;
  tamanho: string;
  cor: string;
  precoCentavos: number;
  quantidade: number;
  /** Estoque conhecido quando a peça entrou no carrinho (limita a quantidade na tela). */
  estoque: number;
  foto: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function limite(item: Pick<ItemCarrinho, "estoque">): number {
  return Math.max(1, Math.min(MAX_POR_ITEM, item.estoque));
}

/** Soma a peça ao carrinho (junta se a variação já estiver nele), respeitando estoque e limites. */
export function adicionarItem(itens: ItemCarrinho[], novo: Omit<ItemCarrinho, "quantidade">, quantidade = 1): ItemCarrinho[] {
  const existente = itens.find((i) => i.variacaoId === novo.variacaoId);
  if (existente) {
    return itens.map((i) =>
      i.variacaoId === novo.variacaoId ? { ...i, ...novo, quantidade: Math.min(limite(novo), i.quantidade + quantidade) } : i,
    );
  }
  if (itens.length >= MAX_ITENS) return itens;
  return [...itens, { ...novo, quantidade: Math.min(limite(novo), Math.max(1, quantidade)) }];
}

export function alterarQuantidade(itens: ItemCarrinho[], variacaoId: string, quantidade: number): ItemCarrinho[] {
  if (quantidade <= 0) return removerItem(itens, variacaoId);
  return itens.map((i) => (i.variacaoId === variacaoId ? { ...i, quantidade: Math.min(limite(i), Math.floor(quantidade)) } : i));
}

export function removerItem(itens: ItemCarrinho[], variacaoId: string): ItemCarrinho[] {
  return itens.filter((i) => i.variacaoId !== variacaoId);
}

export function quantidadeTotal(itens: ItemCarrinho[]): number {
  return itens.reduce((s, i) => s + i.quantidade, 0);
}

export function subtotalCentavos(itens: ItemCarrinho[]): number {
  return itens.reduce((s, i) => s + i.precoCentavos * i.quantidade, 0);
}

const texto = (v: unknown, max: number): string | null => (typeof v === "string" && v.length <= max ? v : null);
const inteiro = (v: unknown, min: number, max: number): number | null =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : null;

/** Lê o que estava guardado no navegador. Qualquer coisa estranha é descartada (o dado vem de fora, não é de confiança). */
export function lerCarrinho(bruto: string | null): ItemCarrinho[] {
  if (!bruto || bruto.length > 100_000) return [];
  let dados: unknown;
  try {
    dados = JSON.parse(bruto);
  } catch {
    return [];
  }
  if (!Array.isArray(dados)) return [];
  const itens: ItemCarrinho[] = [];
  for (const d of dados.slice(0, MAX_ITENS)) {
    if (!d || typeof d !== "object") continue;
    const o = d as Record<string, unknown>;
    const variacaoId = texto(o.variacaoId, 36);
    const slug = texto(o.slug, 100);
    const nome = texto(o.nome, 200);
    const tamanho = texto(o.tamanho, 40);
    const cor = texto(o.cor, 60);
    const preco = inteiro(o.precoCentavos, 0, 100_000_000);
    const estoque = inteiro(o.estoque, 0, 100_000);
    const quantidade = inteiro(o.quantidade, 1, MAX_POR_ITEM);
    const foto = o.foto === null ? null : texto(o.foto, 500);
    if (!variacaoId || !UUID.test(variacaoId) || !slug || !nome || tamanho === null || cor === null || preco === null || estoque === null || quantidade === null) continue;
    if (itens.some((i) => i.variacaoId === variacaoId)) continue;
    itens.push({ variacaoId, slug, nome, tamanho, cor, precoCentavos: preco, quantidade: Math.min(quantidade, limite({ estoque })), estoque, foto: foto && /^https?:\/\//.test(foto) ? foto : null });
  }
  return itens;
}
