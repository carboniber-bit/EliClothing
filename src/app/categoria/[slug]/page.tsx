import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GradeProdutos } from "@/components/catalogo/GradeProdutos";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Revelar } from "@/components/ui/Revelar";
import { montarArvore } from "@/lib/catalogo/categorias";
import { obterRepositorio } from "@/lib/catalogo/repositorio";

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await obterRepositorio().obterCategoria(slug);
  return { title: r ? r.categoria.nome : "Categoria" };
}

async function Conteudo({ params }: { params: PageProps<"/categoria/[slug]">["params"] }) {
  const { slug } = await params;
  const resultado = await obterRepositorio().obterCategoria(slug);
  if (!resultado) notFound();
  const { categoria, todas, produtos } = resultado;
  const filhos = montarArvore(todas).find((c) => c.id === categoria.id)?.filhos ?? [];

  return (
    <>
      <Revelar className="border-b border-borda pb-10">
        <p className="eyebrow text-texto-suave">Categoria</p>
        <h1 className="mt-3 text-5xl [overflow-wrap:anywhere] md:text-7xl">
          {categoria.nome}
          <span className="italic text-texto-suave">.</span>
        </h1>
      </Revelar>
      {filhos.length > 0 ? (
        <nav aria-label="Subcategorias" className="mt-8 flex flex-wrap gap-2">
          {filhos.map((f) => (
            <Link key={f.id} href={`/categoria/${f.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-borda bg-superficie px-5 text-sm font-semibold hover:bg-acento/30">
              {f.nome}
            </Link>
          ))}
        </nav>
      ) : null}
      <div className="mt-8">
        {produtos.length > 0 ? (
          <>
            <h2 className="sr-only">Peças</h2>
            <GradeProdutos produtos={produtos} />
          </>
        ) : (
          <EstadoVazio titulo="Nada por aqui ainda" texto="As peças desta categoria chegam em breve." acao={<Botao href="/catalogo">Ver o catálogo</Botao>} />
        )}
      </div>
    </>
  );
}

export default function PaginaCategoria({ params }: PageProps<"/categoria/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <Suspense fallback={<p className="text-texto-suave">Carregando…</p>}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
