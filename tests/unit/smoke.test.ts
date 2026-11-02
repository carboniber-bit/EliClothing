import { describe, expect, it } from "vitest";

describe("ambiente de testes", () => {
  it("roda o Vitest com o alias @ apontando para src", async () => {
    const { loja } = await import("@/lib/loja/config");
    expect(loja.nome).toBe("EliClothing");
  });
});
