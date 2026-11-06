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

import { opcoesDeTamanho } from "@/lib/catalogo/variacoes";
import { separarTamanhos } from "@/lib/admin/formatacao";

describe("tamanhos", () => {
  it("mostra a escala PP–XG com os que faltam sem variação", () => {
    const op = opcoesDeTamanho([v("1", "P", "", 2), v("2", "M", "", 0)]);
    expect(op.map((o) => o.tamanho)).toEqual(["PP", "P", "M", "G", "GG", "XG"]);
    expect(op.map((o) => o.variacao !== null)).toEqual([false, true, true, false, false, false]);
  });
  it("tamanhos fora da escala mostram só os do produto", () => {
    expect(opcoesDeTamanho([v("1", "38/44", "", 2)]).map((o) => o.tamanho)).toEqual(["38/44"]);
    expect(opcoesDeTamanho([v("1", "P", "", 1), v("2", "Único", "", 1)]).map((o) => o.tamanho)).toEqual(["P", "Único"]);
    expect(opcoesDeTamanho([])).toEqual([]);
  });
  it("separa vários tamanhos digitados de uma vez", () => {
    expect(separarTamanhos("p, M, g,, gg ; XG, m")).toEqual(["P", "M", "G", "GG", "XG"]);
    expect(separarTamanhos("38/44")).toEqual(["38/44"]);
    expect(separarTamanhos("Único")).toEqual(["Único"]);
    expect(separarTamanhos(" , ")).toEqual([]);
  });
});
