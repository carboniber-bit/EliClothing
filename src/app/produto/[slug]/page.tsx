import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ComprarProduto } from "@/components/catalogo/ComprarProduto";
import { GaleriaProduto } from "@/components/catalogo/GaleriaProduto";
import { Botao } from "@/components/ui/Botao";
import { obterRepositorio } from "@/lib/catalogo/repositorio";
import { formatarPreco, precoFinal } from "@/lib/catalogo/produto";

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const produto = await obterRepositorio().obterProduto(slug);
  return produto ? { title: produto.nome, description: produto.descricao ?? undefined } : { title: "Produto" };
}

async function Conteudo({ params }: { params: PageProps<"/produto/[slug]">["params"] }) {
  const { slug } = await params;
  const produto = await obterRepositorio().obterProduto(slug);
  if (!produto) notFound();
  const final = precoFinal(produto);
  const emPromocao = final < produto.precoCentavos;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
      <GaleriaProduto fotos={produto.fotos} nome={produto.nome} />
      <div className="min-w-0 space-y-6">
        <div>
          <p className="eyebrow text-texto-suave">{produto.novidade ? "Novidade" : "EliClothing"}</p>
          <h1 className="mt-2 text-4xl [overflow-wrap:anywhere] md:text-5xl">{produto.nome}</h1>
          <p className="mt-4 text-2xl">
            {emPromocao ? (
              <>
                <span className="sr-only">de {formatarPreco(produto.precoCentavos)} por {formatarPreco(final)}</span>
                <s aria-hidden="true" className="mr-3 text-base text-texto-suave">{formatarPreco(produto.precoCentavos)}</s>
                <span aria-hidden="true" className="font-titulo font-semibold">{formatarPreco(final)}</span>
              </>
            ) : (
              <span className="font-titulo font-semibold">{formatarPreco(final)}</span>
            )}
          </p>
        </div>
        {produto.descricao ? <p className="whitespace-pre-line text-texto-suave [overflow-wrap:anywhere]">{produto.descricao}</p> : null}
        <ComprarProduto produto={produto} foto={produto.fotos[0] ?? null} />
        <Botao href="/catalogo" variante="secundario">Continuar comprando</Botao>
      </div>
    </div>
  );
}

export default function PaginaProduto({ params }: PageProps<"/produto/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <Suspense fallback={<p className="text-texto-suave">Carregando…</p>}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
