import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GradeProdutos } from "@/components/catalogo/GradeProdutos";
import { Botao } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { obterRepositorio } from "@/lib/catalogo/repositorio";
import { loja } from "@/lib/loja/config";

export const metadata: Metadata = {
  title: "Coleção",
  description: `Coleções de moda feminina da ${loja.nome}.`,
};

async function Conteudo({ params }: { params: PageProps<"/colecoes/[slug]">["params"] }) {
  const { slug } = await params;
  const resultado = await obterRepositorio().obterColecao(slug);
  if (!resultado) notFound();
  const { colecao, produtos } = resultado;

  return (
    <>
      <Revelar className="border-b border-borda pb-10">
        <p className="eyebrow text-texto-suave">Coleção</p>
        <h1 className="mt-3 text-5xl md:text-7xl">
          {colecao.nome}
          <span className="italic text-texto-suave">.</span>
        </h1>
        {colecao.descricao ? <p className="mt-4 max-w-2xl text-texto-suave">{colecao.descricao}</p> : null}
      </Revelar>
      <div className="mt-10">
        {produtos.length > 0 ? (
          <>
            <h2 className="sr-only">Peças da coleção</h2>
            <GradeProdutos produtos={produtos} />
          </>
        ) : (
          <EstadoVazio
            titulo="Coleção em preparação"
            texto="As peças desta coleção chegam em breve."
            acao={<Botao href="/catalogo">Ver o catálogo</Botao>}
          />
        )}
      </div>
    </>
  );
}

export default function PaginaColecao({ params }: PageProps<"/colecoes/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <Suspense fallback={<p className="text-texto-suave">Carregando…</p>}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
