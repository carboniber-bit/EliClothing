import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { assinaturaValida, montarPreferencia, pagamentoConfere } from "@/lib/pagamento/mercadopago";

const itens = [{ nome: "Vestido", tamanho: "M", cor: "Rosa", quantidade: 2, precoUnitarioCentavos: 7990 }];
const pedido = { pedidoId: "11111111-1111-4111-8111-111111111111", numero: 1001, itens, nome: "Maria", siteUrl: "https://loja.exemplo.com.br/", expiraEm: "2026-11-06T22:00:00.000Z" };

describe("preferência do Mercado Pago", () => {
  it("converte centavos em reais e aponta para o pedido e o aviso", () => {
    const p = montarPreferencia({ ...pedido, forma: "pix" });
    expect(p.items[0].unit_price).toBe(79.9);
    expect(p.items[0].quantity).toBe(2);
    expect(p.external_reference).toBe(pedido.pedidoId);
    expect(p.notification_url).toBe("https://loja.exemplo.com.br/api/mercadopago/webhook");
    expect(p.back_urls.success).toBe("https://loja.exemplo.com.br/pagamento/retorno?status=sucesso");
    expect(p.expires).toBe(true);
    expect(p).not.toHaveProperty("expiration_date_from");
  });
  it("Pix bloqueia cartão e cartão bloqueia Pix", () => {
    const ids = (f: "pix" | "cartao") => montarPreferencia({ ...pedido, forma: f }).payment_methods.excluded_payment_types.map((t) => t.id);
    expect(ids("pix")).toContain("credit_card");
    expect(ids("pix")).not.toContain("bank_transfer");
    expect(ids("cartao")).toContain("bank_transfer");
    expect(ids("cartao")).not.toContain("credit_card");
  });
  it("a expiração sai com milissegundos, mesmo vindo do banco com microssegundos", () => {
    const p = montarPreferencia({ ...pedido, forma: "pix", expiraEm: "2026-11-07T02:15:30.123456+00:00" });
    expect((p as { expiration_date_to: string }).expiration_date_to).toBe("2026-11-07T02:15:30.123Z");
  });
  it("sem prazo não manda expiração", () => {
    expect("expires" in montarPreferencia({ ...pedido, forma: "pix", expiraEm: null })).toBe(false);
  });
});

describe("conferência do pagamento", () => {
  const ped = { id: pedido.pedidoId, total_centavos: 15980 };
  const ok = { id: 1, status: "approved", transaction_amount: 159.8, currency_id: "BRL", external_reference: pedido.pedidoId };
  it("aprova só se pedido, moeda, status e valor batem", () => {
    expect(pagamentoConfere(ok, ped)).toBe(true);
    expect(pagamentoConfere({ ...ok, status: "pending" }, ped)).toBe(false);
    expect(pagamentoConfere({ ...ok, transaction_amount: 10 }, ped)).toBe(false);
    expect(pagamentoConfere({ ...ok, currency_id: "USD" }, ped)).toBe(false);
    expect(pagamentoConfere({ ...ok, external_reference: "outro" }, ped)).toBe(false);
  });
});

describe("assinatura do aviso", () => {
  const segredo = "segredo-de-teste";
  const agora = 1_800_000_000_000;
  const assinar = (id: string, req: string, ts: number) => `ts=${ts},v1=${createHmac("sha256", segredo).update(`id:${id.toLowerCase()};request-id:${req};ts:${ts};`).digest("hex")}`;
  it("aceita a assinatura correta", () => {
    expect(assinaturaValida({ xSignature: assinar("123", "abc", agora), xRequestId: "abc", dataId: "123", segredo, agoraMs: agora })).toBe(true);
  });
  it("recusa id trocado, segredo errado, cabeçalho ausente ou lixo", () => {
    const sig = assinar("123", "abc", agora);
    expect(assinaturaValida({ xSignature: sig, xRequestId: "abc", dataId: "999", segredo, agoraMs: agora })).toBe(false);
    expect(assinaturaValida({ xSignature: sig, xRequestId: "abc", dataId: "123", segredo: "outro", agoraMs: agora })).toBe(false);
    expect(assinaturaValida({ xSignature: null, xRequestId: "abc", dataId: "123", segredo, agoraMs: agora })).toBe(false);
    expect(assinaturaValida({ xSignature: "lixo", xRequestId: "abc", dataId: "123", segredo, agoraMs: agora })).toBe(false);
  });
  it("recusa aviso antigo demais", () => {
    expect(assinaturaValida({ xSignature: assinar("123", "abc", agora - 3_600_000), xRequestId: "abc", dataId: "123", segredo, agoraMs: agora })).toBe(false);
  });
});
