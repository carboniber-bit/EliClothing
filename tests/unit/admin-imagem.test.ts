import { describe, expect, it } from "vitest";
import { calcularTamanho, caminhoFotoValido, reordenar } from "@/lib/admin/imagem";

describe("calcularTamanho", () => {
  it("reduz fotos grandes mantendo a proporção", () => {
    expect(calcularTamanho(4000, 3000)).toEqual({ largura: 1600, altura: 1200 });
    expect(calcularTamanho(3000, 4000)).toEqual({ largura: 1200, altura: 1600 });
  });
  it("não aumenta fotos pequenas", () => {
    expect(calcularTamanho(800, 600)).toEqual({ largura: 800, altura: 600 });
  });
  it("nunca devolve zero", () => {
    expect(calcularTamanho(100000, 10).altura).toBeGreaterThanOrEqual(1);
  });
});

describe("caminhoFotoValido", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  it("aceita só a pasta do produto e o formato esperado", () => {
    expect(caminhoFotoValido(id, `${id}/22222222-2222-4222-8222-222222222222.jpg`)).toBe(true);
  });
  it.each([
    "../outra/22222222-2222-4222-8222-222222222222.jpg",
    "99999999-9999-4999-8999-999999999999/22222222-2222-4222-8222-222222222222.jpg",
    `${id}/foto.jpg`,
    `${id}/22222222-2222-4222-8222-222222222222.php`,
    "",
  ])("recusa %j", (caminho) => {
    expect(caminhoFotoValido(id, caminho)).toBe(false);
  });
});

describe("reordenar", () => {
  it("sobe e desce uma posição", () => {
    expect(reordenar(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
    expect(reordenar(["a", "b", "c"], "b", 1)).toEqual(["a", "c", "b"]);
  });
  it("nos extremos ou com id desconhecido, não muda nada", () => {
    expect(reordenar(["a", "b"], "a", -1)).toEqual(["a", "b"]);
    expect(reordenar(["a", "b"], "b", 1)).toEqual(["a", "b"]);
    expect(reordenar(["a", "b"], "z", 1)).toEqual(["a", "b"]);
  });
  it("não altera a lista original", () => {
    const original = ["a", "b"];
    reordenar(original, "a", 1);
    expect(original).toEqual(["a", "b"]);
  });
});
