import { ListaColecoes } from "@/components/catalogo/ListaColecoes";
import { GradeProdutos } from "@/components/catalogo/GradeProdutos";
import { Hero } from "@/components/home/Hero";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { obterRepositorio } from "@/lib/catalogo/repositorio";
import { loja } from "@/lib/loja/config";

export default async function Home() {
  const repositorio = obterRepositorio();
  const [novidades, colecoes] = await Promise.all([repositorio.listarNovidades(8), repositorio.listarColecoes()]);

  return (
    <>
      <Hero />
      {colecoes.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <h2 className="mb-6 text-3xl">Coleções</h2>
          <ListaColecoes colecoes={colecoes} rotulo="Coleções da loja" />
        </section>
      ) : null}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="mb-6 text-3xl">Novidades</h2>
        {novidades.length > 0 ? (
          <GradeProdutos produtos={novidades} />
        ) : (
          <EstadoVazio
            titulo="Novidades em breve"
            texto="Estamos preparando a coleção. Acompanhe os lançamentos no nosso Instagram."
          />
        )}
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-14 text-center">
        <h2 className="text-3xl">Siga a EliClothing no Instagram</h2>
        <p className="mx-auto mt-3 max-w-md text-texto-suave">
          Lançamentos, looks e dicas de estilo direto de {loja.cidade}.
        </p>
        <div className="mt-6 flex justify-center">
          <Botao href={loja.instagramUrl}>Seguir {loja.instagramUsuario}</Botao>
        </div>
      </section>
    </>
  );
}
