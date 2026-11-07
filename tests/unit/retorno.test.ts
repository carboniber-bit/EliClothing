import { describe, expect, it } from "vitest";
import { situacaoValida, telaDeRetorno } from "@/lib/pagamento/retorno";

describe("tela de retorno do pagamento", () => {
  it("pedido já pago no banco mostra pagamento confirmado, em qualquer situação", () => {
    for (const s of ["pago", "confirmado", "pronto", "entregue"]) expect(telaDeRetorno("pendente", s).tipo).toBe("confirmado");
  });
  it("aprovado pelo Mercado Pago mas ainda não gravado: aprovado, estamos confirmando", () => {
    expect(telaDeRetorno("sucesso", "aguardando_pagamento").tipo).toBe("aprovado");
    expect(telaDeRetorno("sucesso", null).tipo).toBe("aprovado");
  });
  it("pedido cancelado ou expirado nunca aparece como confirmado", () => {
    expect(telaDeRetorno("sucesso", "expirado").tipo).toBe("falha");
    expect(telaDeRetorno("sucesso", "cancelado").tipo).toBe("falha");
  });
  it("falha e pendente", () => {
    expect(telaDeRetorno("falha", null).tipo).toBe("falha");
    expect(telaDeRetorno("pendente", "aguardando_pagamento").tipo).toBe("pendente");
  });
  it("aceita só as situações conhecidas e usa a primeira se vier repetida", () => {
    expect(situacaoValida("sucesso")).toBe("sucesso");
    expect(situacaoValida(["sucesso", "approved"])).toBe("sucesso");
    expect(situacaoValida("hack")).toBe("pendente");
    expect(situacaoValida(undefined)).toBe("pendente");
  });
});
