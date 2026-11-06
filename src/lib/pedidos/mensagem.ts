import { formatarPreco } from "@/lib/catalogo/produto";

export type ItemMensagem = { nome: string; tamanho: string; cor: string; quantidade: number; precoUnitarioCentavos: number };

type Dados = {
  loja: string;
  numero: number;
  nome: string;
  itens: ItemMensagem[];
  totalCentavos: number;
  tipoEntrega: "retirada" | "entrega";
  endereco: string | null;
  observacao: string | null;
};

/** Texto que a cliente envia pelo WhatsApp. Montado a partir do que o servidor gravou, nunca do que o navegador mandou. */
export function montarMensagemPedido(d: Dados): string {
  const linhas = [`Olá! Acabei de fazer o pedido #${d.numero} na ${d.loja}.`, "", `Nome: ${d.nome}`, "", "Itens:"];
  for (const i of d.itens) {
    const detalhe = [i.tamanho, i.cor].filter(Boolean).join(", ");
    linhas.push(`• ${i.quantidade}x ${i.nome}${detalhe ? ` (${detalhe})` : ""} — ${formatarPreco(i.precoUnitarioCentavos * i.quantidade)}`);
  }
  linhas.push("", `Total: ${formatarPreco(d.totalCentavos)}`, d.tipoEntrega === "entrega" ? `Entrega em: ${d.endereco ?? ""}` : "Retirada na loja");
  if (d.observacao) linhas.push(`Observação: ${d.observacao}`);
  linhas.push("", "Como combinamos o pagamento e a entrega?");
  return linhas.join("\n");
}
