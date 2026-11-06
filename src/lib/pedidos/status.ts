/** Situações de um pedido e o que pode vir depois de cada uma (espelha a função alterar_status_pedido do banco). */
export const STATUS_PEDIDO = ["novo", "aguardando_pagamento", "pago", "confirmado", "pronto", "entregue", "cancelado", "expirado"] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  novo: "Novo",
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  confirmado: "Confirmado",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

const PROXIMOS: Record<StatusPedido, readonly StatusPedido[]> = {
  novo: ["confirmado", "pago", "pronto", "entregue", "cancelado", "expirado"],
  aguardando_pagamento: ["pago", "cancelado", "expirado"],
  pago: ["confirmado", "pronto", "entregue", "cancelado"],
  confirmado: ["pago", "pronto", "entregue", "cancelado"],
  pronto: ["entregue", "cancelado"],
  entregue: [],
  cancelado: [],
  expirado: [],
};

export function ehStatusPedido(valor: unknown): valor is StatusPedido {
  return typeof valor === "string" && (STATUS_PEDIDO as readonly string[]).includes(valor);
}

export function proximosStatus(atual: StatusPedido): readonly StatusPedido[] {
  return PROXIMOS[atual];
}

export function pedidoEncerrado(status: StatusPedido): boolean {
  return PROXIMOS[status].length === 0;
}

export const FORMA_PAGAMENTO: Record<string, string> = { whatsapp: "WhatsApp (combinar)", pix: "Pix", cartao: "Cartão" };

/** Nomes amigáveis para o histórico de alterações. */
export const ROTULO_TABELA: Record<string, string> = {
  produtos: "Produto",
  variacoes: "Variação/estoque",
  categorias: "Categoria",
  colecoes: "Coleção",
  config_loja: "Texto/foto da loja",
  pedidos: "Pedido",
  perfis: "Equipe",
};
export const ROTULO_OPERACAO: Record<string, string> = { INSERT: "Criou", UPDATE: "Alterou", DELETE: "Excluiu" };
