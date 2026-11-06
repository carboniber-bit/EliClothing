import { describe, expect, it } from "vitest";
import { separarCores } from "@/lib/admin/formatacao";
import { idsDaCategoria, montarArvore, type Categoria } from "@/lib/catalogo/categorias";

const c = (id: string, paiId: string | null = null): Categoria => ({ id, slug: id, nome: id.toUpperCase(), paiId });

describe("categorias", () => {
  const lista = [c("a"), c("b"), c("a1", "a"), c("a2", "a"), c("orfa", "sumiu")];
  it("agrupa subcategorias dentro da principal", () => {
    const arvore = montarArvore(lista);
    expect(arvore.map((x) => x.id)).toEqual(["a", "b", "orfa"]);
    expect(arvore[0].filhos.map((f) => f.id)).toEqual(["a1", "a2"]);
    expect(arvore[1].filhos).toHaveLength(0);
  });
  it("categoria que aponta para si mesma não some nem se repete", () => {
    expect(montarArvore([c("x", "x")]).map((x) => x.id)).toEqual(["x"]);
    expect(montarArvore([c("x", "x")])[0].filhos).toHaveLength(0);
  });
  it("a principal inclui as subcategorias; subcategoria só ela", () => {
    expect(idsDaCategoria(lista, "a")).toEqual(["a", "a1", "a2"]);
    expect(idsDaCategoria(lista, "a1")).toEqual(["a1"]);
  });
});

describe("cores digitadas", () => {
  it("separa por vírgula, tira repetidas e põe maiúscula inicial", () => {
    expect(separarCores("branco, Preto ;  BRANCO")).toEqual(["Branco", "Preto"]);
    expect(separarCores(" ")).toEqual([]);
    expect(separarCores("verde água")).toEqual(["Verde água"]);
  });
});
