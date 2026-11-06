import { describe, expect, it } from "vitest";
import { errosDoZod } from "@/lib/validacao/auth";
import { categoriaSchema, colecaoSchema, estoqueSchema, produtoSchema, variacaoSchema } from "@/lib/validacao/admin";

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
    expect(variacaoSchema.parse({ tamanho: " M ", cor: "Rosa", estoque: "5" })).toEqual({ tamanho: ["M"], cor: ["Rosa"], estoque: 5 });
    expect(variacaoSchema.parse({ tamanho: "p, m, G", cor: "", estoque: "2" }).tamanho).toEqual(["P", "M", "G"]);
    expect(variacaoSchema.parse({ tamanho: "M", cor: "branco, Preto, BRANCO", estoque: "1" }).cor).toEqual(["Branco", "Preto"]);
    expect(variacaoSchema.parse({ tamanho: "M", cor: "", estoque: "1" }).cor).toEqual([]);
    expect(variacaoSchema.safeParse({ tamanho: "a, b, c, d, e, f, g, h, i, j, k, l, m", cor: "", estoque: "1" }).success).toBe(false);
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

describe("colecaoSchema", () => {
  it("gera o endereço do nome, aceita ordem vazia e descrição vazia vira nula", () => {
    const r = colecaoSchema.parse({ nome: "Verão 2027", slug: "", descricao: "", ordem: "", ativo: "on" });
    expect(r.slug).toBe("verao-2027");
    expect(r.ordem).toBe(0);
    expect(r.descricao).toBeNull();
    expect(r.ativo).toBe(true);
  });

  it("recusa nome vazio e ordem que não é número", () => {
    expect(colecaoSchema.safeParse({ nome: "  ", slug: "", descricao: "", ordem: "0" }).success).toBe(false);
    expect(colecaoSchema.safeParse({ nome: "Festa", slug: "", descricao: "", ordem: "abc" }).success).toBe(false);
  });

  it("sem a marcação 'ativo' a coleção fica escondida", () => {
    expect(colecaoSchema.parse({ nome: "Festa", slug: "", descricao: "x", ordem: "2" }).ativo).toBe(false);
  });
});
