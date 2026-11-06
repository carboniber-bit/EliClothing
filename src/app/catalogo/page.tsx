import type { Metadata } from "next";
import { ListaColecoes } from "@/components/catalogo/ListaColecoes";
import { GradeProdutos } from "@/components/catalogo/GradeProdutos";
import { Botao } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { obterRepositorio } from "@/lib/catalogo/repositorio";
import rua from "@/assets/look-rua.jpg";
import { loja as lojaFixa } from "@/lib/loja/config";
import { obterLoja } from "@/lib/loja/repositorio";

export const metadata: Metadata = {
  title: "Catálogo",
  description: `Catálogo de moda feminina da ${lojaFixa.nome}.`,
};

export default async function Catalogo() {
  const repositorio = obterRepositorio();
  const [produtos, colecoes, loja] = await Promise.all([repositorio.listarProdutos(), repositorio.listarColecoes(), obterLoja()]);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <Revelar className="border-b border-borda pb-10">
        <p className="eyebrow text-texto-suave">Coleção {loja.nome}</p>
        <h1 className="mt-3 text-5xl md:text-7xl">
          Catálogo<span className="italic text-texto-suave">.</span>
        </h1>
        <p className="mt-4 max-w-lg text-texto-suave">Todas as peças da {loja.nome} em um só lugar.</p>
      </Revelar>
      <div className="mt-8">
        <ListaColecoes colecoes={colecoes} rotulo="Coleções" />
      </div>
      <div className="mt-8">
        {produtos.length > 0 ? (
          <>
            <h2 className="sr-only">Peças</h2>
            <GradeProdutos produtos={produtos} />
          </>
        ) : (
          <EstadoVazio
            titulo="Catálogo em preparação"
            imagem={rua}
            texto="Estamos preparando a coleção. Enquanto isso, acompanhe as novidades no Instagram."
            acao={<Botao href={loja.instagramUrl}>Ver no Instagram</Botao>}
          />
        )}
      </div>
    </div>
  );
}
