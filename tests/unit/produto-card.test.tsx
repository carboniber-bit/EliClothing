import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProdutoCard } from "@/components/catalogo/ProdutoCard";
import type { Produto } from "@/lib/catalogo/produto";

const comEstoque = [{ id: "v1", tamanho: "M", cor: "Rosa", estoque: 3 }];

const base: Produto = {
  id: "1",
  slug: "blusa-romantica",
  nome: "Blusa romântica",
  precoCentavos: 12990,
  precoPromocionalCentavos: null,
  imagemPrincipalUrl: null,
  novidade: false,
  destaque: false,
  variacoes: comEstoque,
};

describe("ProdutoCard", () => {
  it("mostra nome e preço", () => {
    render(<ProdutoCard produto={base} />);
    expect(screen.getByText("Blusa romântica")).toBeInTheDocument();
    expect(screen.getByText("R$ 129,90")).toBeInTheDocument();
  });

  it("com promoção mostra o preço antigo riscado e texto acessível", () => {
    render(<ProdutoCard produto={{ ...base, precoPromocionalCentavos: 9990 }} />);
    expect(screen.getByText("R$ 99,90")).toBeInTheDocument();
    expect(screen.getByText("R$ 129,90").tagName).toBe("S");
    expect(screen.getByText(/de R\$ 129,90 por R\$ 99,90/)).toBeInTheDocument();
  });

  it("sem estoque mostra Indisponível", () => {
    render(<ProdutoCard produto={{ ...base, variacoes: [] }} />);
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
  });

  it("com 1 ou 2 unidades avisa que restam poucas", () => {
    render(<ProdutoCard produto={{ ...base, variacoes: [{ id: "v1", tamanho: "M", cor: "Rosa", estoque: 2 }] }} />);
    expect(screen.getByText("Poucas unidades")).toBeInTheDocument();
    expect(screen.queryByText("Indisponível")).not.toBeInTheDocument();
  });

  it("com 3 ou mais unidades não avisa", () => {
    render(<ProdutoCard produto={base} />);
    expect(screen.queryByText("Poucas unidades")).not.toBeInTheDocument();
  });

  it("com estoque não mostra Indisponível", () => {
    render(<ProdutoCard produto={base} />);
    expect(screen.queryByText("Indisponível")).not.toBeInTheDocument();
  });

  it("sem imagem mostra um espaço reservado e não quebra", () => {
    render(<ProdutoCard produto={base} />);
    expect(screen.getByTestId("produto-sem-imagem")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("nome muito longo é truncado por CSS e o cartão pode encolher", () => {
    const longo = "Vestido ".repeat(40).trim();
    const { container } = render(<ProdutoCard produto={{ ...base, nome: longo }} />);
    expect(screen.getByText(longo).closest("h3")?.className).toContain("line-clamp-2");
    expect(screen.getByRole("link", { name: longo })).toHaveAttribute("href", "/produto/" + base.slug);
    expect((container.firstElementChild as HTMLElement).className).toContain("min-w-0");
  });
});
