"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { linkWhatsapp } from "@/lib/loja/whatsapp";
import { obterLoja } from "@/lib/loja/repositorio";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { criarClienteServico } from "@/lib/supabase/servico";
import { errosDoZod, type ErrosCampos } from "@/lib/validacao/auth";
import { pedidoSchema } from "@/lib/validacao/pedido";
import { criarPreferencia, montarPreferencia } from "@/lib/pagamento/mercadopago";
import { limiteExcedido } from "./limite";
import { montarMensagemPedido, type ItemMensagem } from "./mensagem";

export type ResultadoPedido =
  | { ok: true; numero: number; totalCentavos: number; whatsappUrl: string | null; pagarUrl: string | null }
  | { ok: false; erro?: string; campos?: ErrosCampos };

const ERROS_DO_BANCO: Record<string, string> = {
  estoque_insuficiente: "Uma das peças acabou de ficar sem estoque suficiente. Volte à sacola, ajuste a quantidade e tente de novo.",
  variacao_indisponivel: "Uma das peças não está mais disponível. Volte à sacola e remova-a para continuar.",
  quantidade_invalida: "Quantidade inválida em um dos itens.",
};

function traduzir(mensagem: string | undefined): string {
  for (const [codigo, texto] of Object.entries(ERROS_DO_BANCO)) if (mensagem?.includes(codigo)) return texto;
  return "Não foi possível enviar o pedido agora. Tente de novo em instantes.";
}

/** Fecha o pedido: valida, reserva o estoque no banco e devolve o link do WhatsApp com o resumo. */
export async function finalizarPedido(entrada: unknown): Promise<ResultadoPedido> {
  const r = pedidoSchema.safeParse(entrada);
  if (!r.success) return { ok: false, campos: errosDoZod(r.error) };
  const d = r.data;
  const servico = criarClienteServico();
  const online = d.forma_pagamento !== "whatsapp";
  const tokenMP = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (online && (!tokenMP || !siteUrl?.startsWith("https://"))) {
    return { ok: false, erro: "O pagamento online ainda não está ativado. Escolha “Combinar pelo WhatsApp” ou fale com a loja." };
  }
  if (!servico) return { ok: false, erro: "Os pedidos online ainda não estão ativados. Fale com a loja pelo WhatsApp." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  if (limiteExcedido(`ip:${ip}`, 8, 10 * 60_000)) {
    return { ok: false, erro: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." };
  }
  // Limite por telefone no próprio banco (vale entre todas as instâncias do servidor).
  const desde = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await servico.from("pedidos").select("id", { count: "exact", head: true }).eq("telefone", d.telefone).gte("criado_em", desde);
  if ((count ?? 0) >= 3) {
    return { ok: false, erro: "Já recebemos vários pedidos com esse telefone agora há pouco. Aguarde alguns minutos ou fale com a loja pelo WhatsApp." };
  }

  // Devolve ao estoque os pedidos de Pix/cartão que não foram pagos a tempo (não há agendador, então fazemos aqui).
  await servico.rpc("expirar_pedidos_vencidos");

  const sessao = await criarClienteServidor();
  const usuario = sessao ? (await sessao.auth.getUser()).data.user : null;

  const { data, error } = await servico.rpc("criar_pedido", {
    p_nome: d.nome,
    p_telefone: d.telefone,
    p_tipo_entrega: d.tipo_entrega,
    p_endereco: d.tipo_entrega === "entrega" ? d.endereco : null,
    p_observacao: d.observacao || null,
    p_forma_pagamento: d.forma_pagamento,
    p_user_id: usuario?.id ?? null,
    p_itens: d.itens.map((i) => ({ variacao_id: i.variacaoId, quantidade: i.quantidade })),
  });
  const criado = Array.isArray(data) ? data[0] : data;
  if (error || !criado) return { ok: false, erro: traduzir(error?.message) };

  // O resumo vem do que o banco gravou (preços e nomes reais), não do que o navegador enviou.
  const { data: linhas } = await servico
    .from("itens_pedido")
    .select("nome, tamanho, cor, quantidade, preco_unitario_centavos")
    .eq("pedido_id", criado.id);
  const itens: ItemMensagem[] = (linhas ?? []).map((l) => ({
    nome: l.nome as string,
    tamanho: l.tamanho as string,
    cor: l.cor as string,
    quantidade: l.quantidade as number,
    precoUnitarioCentavos: l.preco_unitario_centavos as number,
  }));

  if (online && tokenMP && siteUrl) {
    const corpo = montarPreferencia({
      pedidoId: criado.id as string,
      numero: Number(criado.numero),
      itens,
      forma: d.forma_pagamento === "pix" ? "pix" : "cartao",
      nome: d.nome,
      siteUrl,
      expiraEm: (criado.expira_em as string | null) ?? null,
    });
    const pagarUrl = await criarPreferencia(corpo, tokenMP);
    if (!pagarUrl) {
      // Sem página de pagamento o pedido não serve: cancela e devolve o estoque.
      await servico.rpc("alterar_status_pedido", { p_pedido: criado.id, p_status: "cancelado", p_origem: "loja" });
      updateTag("catalogo");
      return { ok: false, erro: "Não foi possível abrir o pagamento agora. Tente de novo em instantes ou escolha “Combinar pelo WhatsApp”." };
    }
    updateTag("catalogo");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return { ok: true, numero: Number(criado.numero), totalCentavos: criado.total_centavos as number, whatsappUrl: null, pagarUrl };
  }

  const loja = await obterLoja();
  const mensagem = montarMensagemPedido({
    loja: loja.nome,
    numero: Number(criado.numero),
    nome: d.nome,
    itens,
    totalCentavos: criado.total_centavos as number,
    tipoEntrega: d.tipo_entrega,
    endereco: d.tipo_entrega === "entrega" ? d.endereco : null,
    observacao: d.observacao || null,
  });

  updateTag("catalogo"); // o estoque mudou
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { ok: true, numero: Number(criado.numero), totalCentavos: criado.total_centavos as number, whatsappUrl: linkWhatsapp(loja.whatsappNumero, mensagem), pagarUrl: null };
}
