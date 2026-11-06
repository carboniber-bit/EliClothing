type Linha = Record<string, unknown> | null;

const IGNORAR = new Set(["atualizado_em", "criado_em"]);

/** Nomes dos campos que mudaram entre "antes" e "depois" (ignora datas automáticas). */
export function camposAlterados(antes: Linha, depois: Linha): string[] {
  if (!antes || !depois) return [];
  const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)]);
  return [...chaves].filter((c) => !IGNORAR.has(c) && JSON.stringify(antes[c]) !== JSON.stringify(depois[c])).sort();
}

/** Nome mais humano para mostrar na lista (nome do produto, número do pedido...). */
export function tituloDoRegistro(tabela: string, antes: Linha, depois: Linha): string {
  const base = depois ?? antes;
  if (!base) return "";
  if (tabela === "pedidos") return base.numero ? `#${String(base.numero)}` : "";
  if (tabela === "perfis") return typeof base.email === "string" ? base.email : "";
  if (tabela === "variacoes") return [base.tamanho, base.cor].filter((v) => typeof v === "string" && v).join(" · ");
  if (tabela === "config_loja") return typeof base.chave === "string" ? base.chave : "";
  return typeof base.nome === "string" ? base.nome : "";
}
