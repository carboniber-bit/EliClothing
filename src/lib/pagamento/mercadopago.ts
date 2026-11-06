import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.mercadopago.com";

export type FormaOnline = "pix" | "cartao";
export type ItemPreferencia = { nome: string; tamanho: string; cor: string; quantidade: number; precoUnitarioCentavos: number };

const centavosParaReais = (c: number) => Math.round(c) / 100;

/** Corpo da preferência do Checkout Pro. Pix = só Pix; cartão = só cartão (crédito e débito). */
export function montarPreferencia(d: {
  pedidoId: string;
  numero: number;
  itens: ItemPreferencia[];
  forma: FormaOnline;
  nome: string;
  siteUrl: string;
  expiraEm: string | null;
}) {
  const base = d.siteUrl.replace(/\/+$/, "");
  const volta = (status: string) => `${base}/pagamento/retorno?status=${status}`;
  // Tipos de pagamento que NÃO queremos em cada forma escolhida.
  const excluidos =
    d.forma === "pix"
      ? ["credit_card", "debit_card", "prepaid_card", "ticket", "atm", "digital_currency", "digital_wallet"]
      : ["bank_transfer", "ticket", "atm", "digital_currency", "digital_wallet"];
  return {
    items: d.itens.map((i, n) => ({
      id: `${d.numero}-${n + 1}`,
      title: `${i.nome} (${[i.tamanho, i.cor].filter(Boolean).join(", ")})`.slice(0, 250),
      quantity: i.quantidade,
      unit_price: centavosParaReais(i.precoUnitarioCentavos),
      currency_id: "BRL",
    })),
    external_reference: d.pedidoId,
    statement_descriptor: "ELICLOTHING",
    payer: { name: d.nome.slice(0, 60) },
    back_urls: { success: volta("sucesso"), pending: volta("pendente"), failure: volta("falha") },
    auto_return: "approved",
    notification_url: `${base}/api/mercadopago/webhook`,
    payment_methods: { excluded_payment_types: excluidos.map((id) => ({ id })), installments: d.forma === "cartao" ? 6 : 1 },
    ...(d.expiraEm ? { expires: true, expiration_date_from: new Date().toISOString(), expiration_date_to: d.expiraEm } : {}),
  };
}

/** Cria a preferência e devolve o endereço da página de pagamento. */
export async function criarPreferencia(corpo: ReturnType<typeof montarPreferencia>, token: string): Promise<string | null> {
  try {
    const r = await fetch(`${API}/checkout/preferences`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      console.error("[mercadopago] preferência recusada:", r.status);
      return null;
    }
    const json = (await r.json()) as { init_point?: string; sandbox_init_point?: string };
    // Com credenciais de teste o Mercado Pago devolve também um endereço de sandbox.
    const usarSandbox = token.startsWith("TEST-") && json.sandbox_init_point;
    const url = usarSandbox ? json.sandbox_init_point : json.init_point;
    return typeof url === "string" && url.startsWith("https://") ? url : null;
  } catch (e) {
    console.error("[mercadopago] falha ao criar preferência:", e instanceof Error ? e.message : "erro");
    return null;
  }
}

export type PagamentoMP = { id: number; status: string; transaction_amount: number; currency_id: string; external_reference: string | null };

export async function buscarPagamento(id: string, token: string): Promise<PagamentoMP | null> {
  if (!/^\d{1,20}$/.test(id)) return null;
  const r = await fetch(`${API}/v1/payments/${id}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`mercadopago ${r.status}`);
  return (await r.json()) as PagamentoMP;
}

/** O pagamento aprovado só vale se for deste pedido, em reais e com o valor exato do pedido. */
export function pagamentoConfere(p: PagamentoMP, pedido: { id: string; total_centavos: number }): boolean {
  return (
    p.status === "approved" &&
    p.external_reference === pedido.id &&
    p.currency_id === "BRL" &&
    Math.round(p.transaction_amount * 100) === pedido.total_centavos
  );
}

/**
 * Confere a assinatura do aviso (cabeçalho x-signature: "ts=...,v1=..."): HMAC-SHA256 de
 * "id:<id em minúsculas>;request-id:<x-request-id>;ts:<ts>;" com a chave secreta do webhook.
 * Aceita avisos de até 10 minutos atrás.
 */
export function assinaturaValida(d: { xSignature: string | null; xRequestId: string | null; dataId: string; segredo: string; agoraMs?: number }): boolean {
  if (!d.xSignature) return false;
  const partes = Object.fromEntries(d.xSignature.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1 || !/^\d+$/.test(ts) || !/^[0-9a-f]{64}$/i.test(v1)) return false;
  const agora = d.agoraMs ?? Date.now();
  const tsMs = ts.length <= 10 ? Number(ts) * 1000 : Number(ts);
  if (Math.abs(agora - tsMs) > 10 * 60_000) return false;
  const manifesto = `id:${d.dataId.toLowerCase()};${d.xRequestId ? `request-id:${d.xRequestId};` : ""}ts:${ts};`;
  const esperado = createHmac("sha256", d.segredo).update(manifesto).digest();
  const recebido = Buffer.from(v1, "hex");
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}
