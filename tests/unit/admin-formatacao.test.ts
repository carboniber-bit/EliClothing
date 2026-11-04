import { describe, expect, it } from "vitest";
import { centavosParaReais, reaisParaCentavos, slugify } from "@/lib/admin/formatacao";

describe("slugify", () => {
  it("tira acentos, espaços e símbolos", () => {
    expect(slugify("Vestido Floral Rosé!")).toBe("vestido-floral-rose");
    expect(slugify("  Calça  Jeans -- 2ª coleção ")).toBe("calca-jeans-2-colecao");
  });
  it("devolve vazio quando não sobra nada", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });
  it("limita o tamanho sem terminar em hífen", () => {
    const s = slugify("a".repeat(79) + " b");
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });
});

describe("reaisParaCentavos", () => {
  it.each([
    ["89,90", 8990],
    ["89.90", 8990],
    ["80", 8000],
    ["R$ 80", 8000],
    ["R$ 1.234,56", 123456],
    ["1.234", 123400],
    ["0,5", 50],
    ["0,05", 5],
    ["10,", null],
  ])("%j → %j", (entrada, esperado) => {
    expect(reaisParaCentavos(entrada)).toBe(esperado);
  });

  it.each(["", "abc", "-5", "1,234", "12,3,4", "1e3", "99999999999"])("recusa %j", (entrada) => {
    expect(reaisParaCentavos(entrada)).toBeNull();
  });
});

describe("centavosParaReais", () => {
  it("formata para o campo do formulário", () => {
    expect(centavosParaReais(8990)).toBe("89,90");
    expect(centavosParaReais(5)).toBe("0,05");
    expect(centavosParaReais(8000)).toBe("80,00");
  });
  it("ida e volta", () => {
    for (const c of [0, 1, 99, 100, 12345, 999999]) {
      expect(reaisParaCentavos(centavosParaReais(c))).toBe(c);
    }
  });
});
