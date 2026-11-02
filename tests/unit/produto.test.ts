import { describe, expect, it } from "vitest";
import { formatarPreco, precoFinal, temEstoque, type Produto } from "@/lib/catalogo/produto";

const base: Produto = {
  id: "1",
  slug: "blusa",
  nome: "Blusa",
  precoCentavos: 12990,
  precoPromocionalCentavos: null,
  imagemPrincipalUrl: null,
  novidade: false,
  destaque: false,
  variacoes: [],
};

describe("formatarPreco", () => {
  it("formata em reais com vírgula", () => {
    expect(formatarPreco(12990)).toBe("R$ 129,90");
  });

  it("completa os centavos", () => {
    expect(formatarPreco(5)).toBe("R$ 0,05");
    expect(formatarPreco(1000)).toBe("R$ 10,00");
  });

  it("separa milhares com ponto", () => {
    expect(formatarPreco(100000)).toBe("R$ 1.000,00");
    expect(formatarPreco(123456789)).toBe("R$ 1.234.567,89");
  });
});

describe("precoFinal", () => {
  it("usa a promoção quando é menor que o preço", () => {
    expect(precoFinal({ ...base, precoPromocionalCentavos: 9990 })).toBe(9990);
  });

  it("ignora promoção igual ou maior que o preço", () => {
    expect(precoFinal({ ...base, precoPromocionalCentavos: 12990 })).toBe(12990);
    expect(precoFinal({ ...base, precoPromocionalCentavos: 15000 })).toBe(12990);
  });

  it("sem promoção devolve o preço", () => {
    expect(precoFinal(base)).toBe(12990);
  });
});

describe("temEstoque", () => {
  it("é falso sem variações", () => {
    expect(temEstoque(base)).toBe(false);
  });

  it("é falso com todas as variações zeradas", () => {
    expect(
      temEstoque({ ...base, variacoes: [{ id: "a", tamanho: "P", cor: "Rosa", estoque: 0 }] }),
    ).toBe(false);
  });

  it("é verdadeiro se alguma variação tem estoque", () => {
    expect(
      temEstoque({
        ...base,
        variacoes: [
          { id: "a", tamanho: "P", cor: "Rosa", estoque: 0 },
          { id: "b", tamanho: "M", cor: "Rosa", estoque: 2 },
        ],
      }),
    ).toBe(true);
  });
});
