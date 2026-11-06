import { describe, expect, it } from "vitest";
import { camposAlterados, tituloDoRegistro } from "@/lib/admin/historico";
import { ehStatusPedido, pedidoEncerrado, proximosStatus, STATUS_PEDIDO } from "@/lib/pedidos/status";

describe("situação do pedido", () => {
  it("reconhece só situações válidas", () => {
    expect(ehStatusPedido("pago")).toBe(true);
    expect(ehStatusPedido("hackeado")).toBe(false);
    expect(ehStatusPedido(undefined)).toBe(false);
  });
  it("pedidos encerrados não têm próximos passos", () => {
    for (const s of ["entregue", "cancelado", "expirado"] as const) {
      expect(pedidoEncerrado(s)).toBe(true);
      expect(proximosStatus(s)).toHaveLength(0);
    }
  });
  it("nenhuma situação aponta para si mesma e todas as destinações existem", () => {
    for (const s of STATUS_PEDIDO) {
      expect(proximosStatus(s)).not.toContain(s);
      for (const p of proximosStatus(s)) expect(STATUS_PEDIDO).toContain(p);
    }
  });
  it("aguardando pagamento só vai para pago, cancelado ou expirado", () => {
    expect([...proximosStatus("aguardando_pagamento")]).toEqual(["pago", "cancelado", "expirado"]);
  });
});

describe("histórico", () => {
  it("lista só os campos que mudaram, sem datas automáticas", () => {
    expect(camposAlterados({ nome: "A", preco: 1, atualizado_em: "x" }, { nome: "A", preco: 2, atualizado_em: "y" })).toEqual(["preco"]);
    expect(camposAlterados(null, { nome: "A" })).toEqual([]);
  });
  it("dá um título legível para cada tipo de registro", () => {
    expect(tituloDoRegistro("pedidos", null, { numero: 1001 })).toBe("#1001");
    expect(tituloDoRegistro("produtos", { nome: "Vestido" }, null)).toBe("Vestido");
    expect(tituloDoRegistro("variacoes", null, { tamanho: "M", cor: "Rosa" })).toBe("M · Rosa");
    expect(tituloDoRegistro("config_loja", null, { chave: "banner_titulo" })).toBe("banner_titulo");
  });
});
