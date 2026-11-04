"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { rotulo: "Painel", href: "/admin" },
  { rotulo: "Produtos", href: "/admin/produtos" },
  { rotulo: "Categorias", href: "/admin/categorias" },
];

export function MenuAdmin() {
  const caminho = usePathname();
  return (
    <nav aria-label="Painel da loja" className="mb-8 flex flex-wrap gap-2">
      {itens.map((item) => {
        const ativo = item.href === "/admin" ? caminho === "/admin" : caminho.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold ${
              ativo ? "border-primario bg-primario text-primario-texto" : "border-borda bg-superficie text-texto transition-colors hover:bg-acento/30"
            }`}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
