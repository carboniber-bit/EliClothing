export type Situacao = "sucesso" | "pendente" | "falha";

const PAGOS = ["pago", "confirmado", "pronto", "entregue"];

export function situacaoValida(valor: unknown): Situacao {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v === "sucesso" || v === "falha" || v === "pendente" ? v : "pendente";
}

export type TelaRetorno = { tipo: "confirmado" | "aprovado" | "pendente" | "falha"; titulo: string; texto: string };

/**
 * O que mostrar quando a cliente volta do Mercado Pago.
 * A situação vem da rota de retorno que o Mercado Pago escolheu; o status do pedido (lido no banco, se achado)
 * tem prioridade, porque é o que o servidor realmente confirmou.
 */
export function telaDeRetorno(situacao: Situacao, statusPedido: string | null): TelaRetorno {
  if (statusPedido && PAGOS.includes(statusPedido)) {
    return { tipo: "confirmado", titulo: "Pagamento confirmado!", texto: "Recebemos o seu pagamento e o seu pedido está garantido. Em breve entramos em contato para combinar a retirada ou a entrega." };
  }
  if (statusPedido === "cancelado" || statusPedido === "expirado") {
    return { tipo: "falha", titulo: "Pedido não está mais reservado", texto: "O tempo para pagar acabou e as peças voltaram para a loja. Você pode escolher de novo ou falar com a gente pelo WhatsApp." };
  }
  if (situacao === "sucesso") {
    return { tipo: "aprovado", titulo: "Pagamento aprovado!", texto: "O Mercado Pago aprovou o seu pagamento. Estamos confirmando o seu pedido, e isso leva só alguns instantes." };
  }
  if (situacao === "falha") {
    return { tipo: "falha", titulo: "Pagamento não concluído", texto: "O pagamento não foi concluído. Suas peças ficam guardadas por 30 minutos: volte à sacola e tente de novo, ou fale com a gente pelo WhatsApp." };
  }
  return { tipo: "pendente", titulo: "Pagamento em análise", texto: "Assim que o pagamento for confirmado, avisamos a nossa equipe. Se você gerou um Pix, pague dentro do prazo mostrado na tela." };
}
