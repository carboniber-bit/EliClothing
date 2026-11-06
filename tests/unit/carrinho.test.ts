import { describe, expect, it } from "vitest";
import { adicionarItem, alterarQuantidade, lerCarrinho, quantidadeTotal, removerItem, subtotalCentavos, type ItemCarrinho } from "@/lib/carrinho/carrinho";

const ID1 = "11111111-1111-4111-8111-111111111111";
const ID2 = "22222222-2222-4222-8222-222222222222";
const base = { variacaoId: ID1, slug: "vestido", nome: "Vestido", tamanho: "M", cor: "Rosa", precoCentavos: 7900, estoque: 5, foto: null };

describe("carrinho", () => {
  it("adiciona e junta a mesma variação", () => {
    let c: ItemCarrinho[] = adicionarItem([], base);
    c = adicionarItem(c, base, 2);
    expect(c).toHaveLength(1);
    expect(c[0].quantidade).toBe(3);
  });
  it("não passa do estoque", () => {
    let c = adicionarItem([], { ...base, estoque: 2 }, 5);
    expect(c[0].quantidade).toBe(2);
    c = adicionarItem(c, { ...base, estoque: 2 }, 1);
    expect(c[0].quantidade).toBe(2);
  });
  it("altera, remove e calcula totais", () => {
    let c = adicionarItem([], base, 2);
    c = adicionarItem(c, { ...base, variacaoId: ID2, precoCentavos: 8900 });
    expect(quantidadeTotal(c)).toBe(3);
    expect(subtotalCentavos(c)).toBe(7900 * 2 + 8900);
    c = alterarQuantidade(c, ID1, 4);
    expect(c[0].quantidade).toBe(4);
    c = alterarQuantidade(c, ID1, 0);
    expect(c).toHaveLength(1);
    expect(removerItem(c, ID2)).toHaveLength(0);
  });
  it("lê o carrinho guardado e descarta lixo", () => {
    const bom = { ...base, quantidade: 2 };
    expect(lerCarrinho(JSON.stringify([bom]))).toHaveLength(1);
    expect(lerCarrinho("não é json")).toHaveLength(0);
    expect(lerCarrinho(null)).toHaveLength(0);
    expect(lerCarrinho(JSON.stringify([{ ...bom, variacaoId: "x" }]))).toHaveLength(0);
    expect(lerCarrinho(JSON.stringify([{ ...bom, quantidade: -1 }]))).toHaveLength(0);
    expect(lerCarrinho(JSON.stringify([{ ...bom, precoCentavos: "1" }]))).toHaveLength(0);
    expect(lerCarrinho(JSON.stringify([bom, bom]))).toHaveLength(1);
    expect(lerCarrinho(JSON.stringify([{ ...bom, foto: "javascript:alert(1)" }]))[0].foto).toBeNull();
  });
});
