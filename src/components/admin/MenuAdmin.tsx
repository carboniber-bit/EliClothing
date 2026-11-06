"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { rotulo: "Painel", href: "/admin" },
  { rotulo: "Pedidos", href: "/admin/pedidos" },
  { rotulo: "Produtos", href: "/admin/produtos" },
  { rotulo: "Categorias", href: "/admin/categorias" },
  { rotulo: "Coleções", href: "/admin/colecoes" },
  { rotulo: "Textos da loja", href: "/admin/textos" },
  { rotulo: "Fotos da página inicial", href: "/admin/fotos-inicio" },
  { rotulo: "Equipe", href: "/admin/equipe" },
  { rotulo: "Histórico", href: "/admin/historico" },
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
