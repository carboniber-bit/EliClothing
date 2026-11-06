import type { Produto } from "@/lib/catalogo/produto";
import { Revelar } from "@/components/ui/Revelar";
import { ProdutoCard } from "./ProdutoCard";

export function GradeProdutos({ produtos }: { produtos: Produto[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {produtos.map((p, i) => (
        <li key={p.id} className="min-w-0">
          <Revelar atraso={(i % 4) * 0.08}>
            <ProdutoCard produto={p} />
          </Revelar>
        </li>
      ))}
    </ul>
  );
}
