import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { limiteExcedido } from "@/lib/pedidos/limite";
import { montarMensagemPedido } from "@/lib/pedidos/mensagem";
import { pedidoSchema } from "@/lib/validacao/pedido";

const ID = "11111111-1111-4111-8111-111111111111";
const base = { nome: "Maria", telefone: "(11) 97302-9002", tipo_entrega: "retirada", endereco: "", observacao: "", itens: [{ variacaoId: ID, quantidade: 2 }] };

describe("validação do pedido", () => {
  it("aceita um pedido de retirada e guarda só os números do telefone", () => {
    const r = pedidoSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.telefone).toBe("11973029002");
  });
  it("entrega exige endereço", () => {
    expect(pedidoSchema.safeParse({ ...base, tipo_entrega: "entrega" }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, tipo_entrega: "entrega", endereco: "Rua das Flores, 10, Centro" }).success).toBe(true);
  });
  it("rejeita telefone curto, nome vazio, sacola vazia e quantidade absurda", () => {
    expect(pedidoSchema.safeParse({ ...base, telefone: "123" }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, nome: " " }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, itens: [] }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, itens: [{ variacaoId: ID, quantidade: 21 }] }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, itens: [{ variacaoId: "x", quantidade: 1 }] }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, tipo_entrega: "drone" }).success).toBe(false);
  });
  it("o campo-armadilha preenchido invalida", () => {
    expect(pedidoSchema.safeParse({ ...base, site: "http://spam" }).success).toBe(false);
  });
});

describe("mensagem do WhatsApp", () => {
  it("mostra itens, total e retirada", () => {
    const m = montarMensagemPedido({
      loja: "EliClothing", numero: 1001, nome: "Maria", totalCentavos: 15800, tipoEntrega: "retirada", endereco: null, observacao: null,
      itens: [{ nome: "Vestido suplex", tamanho: "38/44", cor: "Vermelho", quantidade: 2, precoUnitarioCentavos: 7900 }],
    });
    expect(m).toContain("pedido #1001");
    expect(m).toContain("2x Vestido suplex (38/44, Vermelho)");
    expect(m).toContain("R$ 158,00");
    expect(m).toContain("Retirada na loja");
  });
  it("inclui endereço e observação quando houver", () => {
    const m = montarMensagemPedido({ loja: "EliClothing", numero: 5, nome: "Ana", totalCentavos: 100, tipoEntrega: "entrega", endereco: "Rua A, 1", observacao: "Tocar a campainha", itens: [] });
    expect(m).toContain("Entrega em: Rua A, 1");
    expect(m).toContain("Observação: Tocar a campainha");
  });
});

describe("limite de tentativas", () => {
  it("bloqueia depois do máximo e libera passada a janela", () => {
    const chave = `teste-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(limiteExcedido(chave, 3, 1000, 0)).toBe(false);
    expect(limiteExcedido(chave, 3, 1000, 10)).toBe(true);
    expect(limiteExcedido(chave, 3, 1000, 5000)).toBe(false);
  });
});

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : /\.(ts|tsx)$/.test(n) ? [p] : [];
  });
}

describe("segurança da chave secreta", () => {
  it("nenhum arquivo de navegador (\"use client\") importa o cliente de serviço", () => {
    const culpados = arquivos("src").filter((f) => {
      const t = readFileSync(f, "utf8");
      return /^\s*["']use client["']/.test(t) && t.includes("supabase/servico");
    });
    expect(culpados).toEqual([]);
  });
  it("a chave secreta só é lida em um lugar e nunca com NEXT_PUBLIC_", () => {
    const usos = arquivos("src").filter((f) => readFileSync(f, "utf8").includes("SERVICE_ROLE"));
    expect(usos).toEqual([join("src", "lib", "supabase", "servico.ts")]);
    expect(readFileSync(join("src", "lib", "supabase", "servico.ts"), "utf8")).not.toContain("NEXT_PUBLIC_SUPABASE_SERVICE");
  });
});
