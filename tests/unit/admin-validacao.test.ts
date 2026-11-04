import { describe, expect, it } from "vitest";
import { errosDoZod } from "@/lib/validacao/auth";
import { categoriaSchema, estoqueSchema, produtoSchema, variacaoSchema } from "@/lib/validacao/admin";

const base = { nome: "Vestido Floral", slug: "", descricao: "", preco: "100,00", preco_promocional: "", categoria_id: "" };

describe("produtoSchema", () => {
  it("converte preço em centavos e gera o endereço a partir do nome", () => {
    const r = produtoSchema.parse({ ...base, preco_promocional: "79,90", ativo: "on" });
    expect(r.preco).toBe(10000);
    expect(r.preco_promocional).toBe(7990);
    expect(r.slug).toBe("vestido-floral");
    expect(r.categoria_id).toBeNull();
    expect(r.ativo).toBe(true);
    expect(r.destaque).toBe(false);
  });

  it("promoção em branco vira nulo", () => {
    expect(produtoSchema.parse(base).preco_promocional).toBeNull();
  });

  it("recusa promoção igual ou maior que o preço", () => {
    const r = produtoSchema.safeParse({ ...base, preco_promocional: "100,00" });
    expect(r.success).toBe(false);
    if (!r.success) expect(errosDoZod(r.error).preco_promocional).toMatch(/menor que o preço/);
  });

  it("recusa preço inválido e nome vazio", () => {
    const r = produtoSchema.safeParse({ ...base, nome: "  ", preco: "abc" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = errosDoZod(r.error);
      expect(e.nome).toMatch(/nome/);
      expect(e.preco).toMatch(/valor válido/);
    }
  });

  it("usa o endereço digitado, limpo", () => {
    expect(produtoSchema.parse({ ...base, slug: "Meu Vestido!" }).slug).toBe("meu-vestido");
  });

  it("recusa categoria que não é um identificador", () => {
    expect(produtoSchema.safeParse({ ...base, categoria_id: "qualquer coisa" }).success).toBe(false);
  });
});

describe("variações e estoque", () => {
  it("aceita tamanho, cor e estoque", () => {
    expect(variacaoSchema.parse({ tamanho: " M ", cor: "Rosa", estoque: "5" })).toEqual({ tamanho: "M", cor: "Rosa", estoque: 5 });
  });
  it("recusa estoque negativo, decimal ou texto", () => {
    for (const estoque of ["-1", "1,5", "dois", ""]) {
      expect(variacaoSchema.safeParse({ tamanho: "M", cor: "", estoque }).success).toBe(false);
    }
  });
  it("estoque da variação existente", () => {
    expect(estoqueSchema.parse({ estoque: "0" })).toEqual({ estoque: 0, ativo: false });
    expect(estoqueSchema.parse({ estoque: "3", ativo: "on" }).ativo).toBe(true);
  });
});

describe("categoriaSchema", () => {
  it("gera endereço e aceita ordem vazia", () => {
    const r = categoriaSchema.parse({ nome: "Calças Jeans", slug: "", pai_id: "", ordem: "" });
    expect(r.slug).toBe("calcas-jeans");
    expect(r.ordem).toBe(0);
    expect(r.pai_id).toBeNull();
  });
});
