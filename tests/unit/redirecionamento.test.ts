import { describe, expect, it } from "vitest";
import { caminhoInternoSeguro } from "@/lib/auth/redirecionamento";

describe("caminhoInternoSeguro (contra redirecionamento para outro site)", () => {
  it("aceita caminhos internos", () => {
    expect(caminhoInternoSeguro("/admin")).toBe("/admin");
    expect(caminhoInternoSeguro("/catalogo?x=1")).toBe("/catalogo?x=1");
  });

  it.each([
    "https://site-falso.com",
    "//site-falso.com",
    "/\\site-falso.com",
    "javascript:alert(1)",
    "conta",
    "/ok\nhttps://x.com",
    "",
  ])("troca %j pelo padrão", (entrada) => {
    expect(caminhoInternoSeguro(entrada)).toBe("/conta");
  });

  it("usa o padrão quando vem vazio ou nulo", () => {
    expect(caminhoInternoSeguro(null)).toBe("/conta");
    expect(caminhoInternoSeguro(undefined, "/")).toBe("/");
  });

  it("recusa endereços enormes", () => {
    expect(caminhoInternoSeguro("/" + "a".repeat(300))).toBe("/conta");
  });
});
