import type { Produto } from "@/lib/catalogo/produto";
import { ProdutoCard } from "./ProdutoCard";

export function GradeProdutos({ produtos }: { produtos: Produto[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {produtos.map((p) => (
        <li key={p.id} className="min-w-0">
          <ProdutoCard produto={p} />
        </li>
      ))}
    </ul>
  );
}
