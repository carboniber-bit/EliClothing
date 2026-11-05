import Link from "next/link";
import type { Colecao } from "@/lib/catalogo/repositorio";

/** Atalhos para as coleções ativas da loja (não aparece se não houver nenhuma). */
export function ListaColecoes({ colecoes, rotulo }: { colecoes: Colecao[]; rotulo: string }) {
  if (colecoes.length === 0) return null;
  return (
    <nav aria-label={rotulo}>
      <ul className="flex flex-wrap gap-3">
        {colecoes.map((c) => (
          <li key={c.id}>
            <Link
              href={`/colecoes/${c.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-primario px-5 text-sm font-semibold transition-colors hover:bg-acento/30"
            >
              {c.nome}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
