import { describe, expect, it } from "vitest";
import { escolherImagemPrincipal, mapearProduto, urlFoto, type LinhaProduto } from "@/lib/catalogo/mapeamento";

const base = "https://abc.supabase.co";
const linha: LinhaProduto = {
  id: "1",
  slug: "vestido",
  nome: "Vestido",
  preco_centavos: 10000,
  preco_promocional_centavos: 8000,
  novidade: true,
  destaque: false,
  imagens: [
    { caminho: "p/b.jpg", principal: false, ordem: 2 },
    { caminho: "p/a.jpg", principal: false, ordem: 1 },
  ],
  variacoes: [{ id: "v", tamanho: "M", cor: "Rosa", estoque: 3 }],
};

describe("urlFoto", () => {
  it("monta o endereço público do Storage", () => {
    expect(urlFoto(base, "p/a.jpg")).toBe("https://abc.supabase.co/storage/v1/object/public/produtos/p/a.jpg");
    expect(urlFoto(base + "/", "p/a.jpg")).toBe("https://abc.supabase.co/storage/v1/object/public/produtos/p/a.jpg");
  });
  it("escapa caracteres especiais do nome do arquivo", () => {
    expect(urlFoto(base, "p/a b#1.jpg")).toBe("https://abc.supabase.co/storage/v1/object/public/produtos/p/a%20b%231.jpg");
  });
});

describe("escolherImagemPrincipal", () => {
  it("usa a marcada como principal", () => {
    const imgs = [
      { caminho: "x", principal: false, ordem: 0 },
      { caminho: "y", principal: true, ordem: 5 },
    ];
    expect(escolherImagemPrincipal(imgs)?.caminho).toBe("y");
  });
  it("sem principal, usa a primeira na ordem", () => {
    expect(escolherImagemPrincipal(linha.imagens)?.caminho).toBe("p/a.jpg");
  });
  it("sem fotos, devolve nulo", () => {
    expect(escolherImagemPrincipal([])).toBeNull();
    expect(escolherImagemPrincipal(null)).toBeNull();
  });
});

describe("mapearProduto", () => {
  it("converte a linha do banco no tipo da loja", () => {
    const p = mapearProduto(linha, base);
    expect(p.precoCentavos).toBe(10000);
    expect(p.precoPromocionalCentavos).toBe(8000);
    expect(p.imagemPrincipalUrl).toBe("https://abc.supabase.co/storage/v1/object/public/produtos/p/a.jpg");
    expect(p.variacoes).toEqual([{ id: "v", tamanho: "M", cor: "Rosa", estoque: 3 }]);
    expect(p.novidade).toBe(true);
  });
  it("sem foto ou sem endereço do Supabase, não inventa imagem", () => {
    expect(mapearProduto({ ...linha, imagens: [] }, base).imagemPrincipalUrl).toBeNull();
    expect(mapearProduto(linha, null).imagemPrincipalUrl).toBeNull();
  });
  it("aceita produto sem variações", () => {
    expect(mapearProduto({ ...linha, variacoes: null }, base).variacoes).toEqual([]);
  });
});
