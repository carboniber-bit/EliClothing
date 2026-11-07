import { NextResponse, type NextRequest } from "next/server";
import { assinaturaValida, buscarPagamento, pagamentoConfere } from "@/lib/pagamento/mercadopago";
import { criarClienteServico } from "@/lib/supabase/servico";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Aviso do Mercado Pago. O corpo do aviso NUNCA é confiado: só serve para saber qual pagamento consultar.
 * Quem confirma é a consulta direta à API do Mercado Pago (com a nossa chave), conferindo pedido e valor.
 */
export async function POST(request: NextRequest) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const servico = criarClienteServico();
  if (!token || !segredo || !servico) return NextResponse.json({ erro: "não configurado" }, { status: 503 });

  let corpo: { type?: unknown; data?: { id?: unknown } } = {};
  try {
    corpo = await request.json();
  } catch {
    // alguns avisos antigos vêm só pela URL
  }
  const dataId = String(request.nextUrl.searchParams.get("data.id") ?? corpo.data?.id ?? "");
  const tipo = String(request.nextUrl.searchParams.get("type") ?? corpo.type ?? "");
  if (!dataId) return NextResponse.json({ erro: "sem id" }, { status: 400 });

  if (!assinaturaValida({ xSignature: request.headers.get("x-signature"), xRequestId: request.headers.get("x-request-id"), dataId, segredo })) {
    return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
  }
  if (tipo !== "payment") return NextResponse.json({ ok: true, ignorado: tipo }); // outros tipos de aviso não nos interessam

  try {
    const pagamento = await buscarPagamento(dataId, token);
    if (!pagamento || !pagamento.external_reference || !UUID.test(pagamento.external_reference)) return NextResponse.json({ ok: true, ignorado: "sem pedido" });

    const { data: pedido } = await servico.from("pedidos").select("id, total_centavos, status").eq("id", pagamento.external_reference).maybeSingle();
    if (!pedido) return NextResponse.json({ ok: true, ignorado: "pedido desconhecido" });
    if (pagamento.status !== "approved") return NextResponse.json({ ok: true, status: pagamento.status });
    if (!pagamentoConfere(pagamento, { id: pedido.id as string, total_centavos: pedido.total_centavos as number })) {
      console.error("[mercadopago] pagamento aprovado NÃO confere com o pedido", pedido.id);
      return NextResponse.json({ ok: true, ignorado: "não confere" });
    }

    // Aviso repetido (o Mercado Pago reenvia): se a equipe já avançou o pedido, não volta para "pago".
    if (pedido.status !== "novo" && pedido.status !== "aguardando_pagamento") return NextResponse.json({ ok: true, ignorado: "já processado" });

    const { error } = await servico.rpc("alterar_status_pedido", { p_pedido: pedido.id, p_status: "pago", p_origem: "mercadopago" });
    if (error) {
      // Pedido já cancelado/expirado quando o pagamento chegou: precisa de atenção humana (reembolso). Não adianta repetir.
      if (error.message.includes("pedido_encerrado") || error.message.includes("transicao_invalida")) {
        console.error("[mercadopago] pagamento aprovado para pedido encerrado:", pedido.id);
        return NextResponse.json({ ok: true, ignorado: "pedido encerrado" });
      }
      throw new Error(error.message);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[mercadopago] falha ao processar aviso:", e instanceof Error ? e.message : "erro");
    return NextResponse.json({ erro: "falha" }, { status: 500 }); // o Mercado Pago tenta de novo
  }
}
