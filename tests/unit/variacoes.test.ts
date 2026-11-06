import { describe, expect, it } from "vitest";
import { coresDisponiveis, corInicial, tamanhosDaCor } from "@/lib/catalogo/variacoes";

const v = (id: string, tamanho: string, cor: string, estoque: number) => ({ id, tamanho, cor, estoque });

describe("variações do produto", () => {
  const lista = [v("1", "38/44", "Roxo", 0), v("2", "38/44", "Vermelho", 3), v("3", "44/50", "Vermelho", 1)];
  it("lista cores sem repetir", () => {
    expect(coresDisponiveis(lista)).toEqual(["Roxo", "Vermelho"]);
    expect(coresDisponiveis([v("1", "M", "", 1)])).toEqual([]);
  });
  it("filtra tamanhos pela cor", () => {
    expect(tamanhosDaCor(lista, "Vermelho")).toHaveLength(2);
    expect(tamanhosDaCor([v("1", "M", "", 1)], "")).toHaveLength(1);
  });
  it("abre na primeira cor com estoque", () => {
    expect(corInicial(lista)).toBe("Vermelho");
    expect(corInicial([v("1", "M", "Azul", 0)])).toBe("Azul");
    expect(corInicial([])).toBe("");
  });
});
