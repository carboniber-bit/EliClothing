import Link from "next/link";
import { GradeProdutos } from "@/components/catalogo/GradeProdutos";
import { ListaColecoes } from "@/components/catalogo/ListaColecoes";
import { BannerMarca } from "@/components/home/BannerMarca";
import { Hero } from "@/components/home/Hero";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeBrilho, IconeCoracao, IconeInstagram, IconeJoia, IconeSeta, IconeSetaCima } from "@/components/ui/Icones";
import { FotoSite } from "@/components/ui/FotoSite";
import { Revelar } from "@/components/ui/Revelar";
import { obterRepositorio } from "@/lib/catalogo/repositorio";
import { obterLoja } from "@/lib/loja/repositorio";
import { paragrafos } from "@/lib/loja/textos";
import telha from "@/assets/conjunto-telha.jpg";

const valores = [
  { Icone: IconeBrilho, titulo: "Curadoria com carinho", texto: "Peças escolhidas para valorizar quem você é." },
  { Icone: IconeCoracao, titulo: "Feito para você", texto: "Conforto e estilo para cada ocasião." },
  { Icone: IconeJoia, titulo: "Detalhes que encantam", texto: "Acabamentos delicados, do básico ao especial." },
];

const fotosInstagram = [
  { chave: "imagem_instagram_1", alt: "Foto de destaque da loja no Instagram" },
  { chave: "imagem_instagram_2", alt: "Foto de destaque da loja no Instagram" },
  { chave: "imagem_instagram_3", alt: "Foto de destaque da loja no Instagram" },
  { chave: "imagem_instagram_4", alt: "Foto de destaque da loja no Instagram" },
] as const;

export default async function Home() {
  const repositorio = obterRepositorio();
  const [novidades, colecoes, loja] = await Promise.all([
    repositorio.listarNovidades(8),
    repositorio.listarColecoes(),
    obterLoja(),
  ]);

  return (
    <>
      <Hero loja={loja} />

      <section aria-label="Nossos valores" className="border-y border-borda bg-superficie">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 md:px-8">
          {valores.map(({ Icone, titulo, texto }, i) => (
            <Revelar key={titulo} atraso={i * 0.1} className="flex min-w-0 items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fundo transition-transform duration-500 hover:rotate-12">
                <Icone className="h-5 w-5" />
              </span>
              <div className="min-w-0 [overflow-wrap:anywhere]">
                <p className="font-titulo text-xl">{titulo}</p>
                <p className="mt-1 text-sm text-texto-suave">{texto}</p>
              </div>
            </Revelar>
          ))}
        </div>
      </section>

      {colecoes.length > 0 ? (
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <Revelar>
            <p className="eyebrow text-texto-suave">Para cada momento</p>
            <h2 className="mb-8 mt-3 text-4xl md:text-5xl">Coleções</h2>
            <ListaColecoes colecoes={colecoes} rotulo="Coleções da loja" />
          </Revelar>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32">
        <Revelar className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-texto-suave">Acabou de chegar</p>
            <h2 className="mt-3 text-5xl md:text-6xl">
              Novidades<span className="italic text-texto-suave">.</span>
            </h2>
          </div>
          {novidades.length > 0 ? (
            <Link href="/catalogo" className="link-elegante inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
              Ver todas as peças <IconeSeta />
            </Link>
          ) : null}
        </Revelar>

        {novidades.length > 0 ? (
          <GradeProdutos produtos={novidades} />
        ) : (
          <EstadoVazio
            titulo="Novidades em breve"
            texto="Estamos preparando tudo com carinho. Acompanhe os lançamentos no nosso Instagram."
            imagem={loja.imagens.imagem_instagram_1 ?? telha}
            acao={
              <Botao href={loja.instagramUrl}>
                <IconeInstagram />
                Seguir {loja.instagramUsuario}
              </Botao>
            }
          />
        )}
      </section>

      <BannerMarca loja={loja} />

      <section id="sobre" className="scroll-mt-24 pt-24 md:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
          <Revelar className="relative">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-elevada">
              <FotoSite
                chave="imagem_sobre"
                url={loja.imagens.imagem_sobre}
                alt="Foto da coleção da EliClothing"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 right-0 w-40 overflow-hidden rounded-2xl border-4 border-fundo shadow-suave sm:w-52 md:-right-8">
              <div className="relative aspect-square">
                <FotoSite chave="imagem_sobre_detalhe" url={loja.imagens.imagem_sobre_detalhe} alt="" sizes="208px" className="object-cover" />
              </div>
            </div>
          </Revelar>

          <div className="min-w-0">
            <Revelar>
              <p className="eyebrow text-texto-suave">Sobre a marca</p>
              <h2 className="mt-4 text-4xl leading-tight md:text-6xl">
                {loja.textos.sobre_titulo}
              </h2>
            </Revelar>
            <Revelar atraso={0.1}>
              {paragrafos(loja.textos.sobre_texto).map((p, i) => (
                <p key={i} className={`${i === 0 ? "mt-8" : "mt-5"} text-lg leading-relaxed text-texto-suave`}>
                  {p}
                </p>
              ))}
            </Revelar>
            <Revelar atraso={0.2} className="mt-10 flex flex-wrap gap-3">
              <Botao href="/catalogo">Conhecer o catálogo</Botao>
              <Botao href={loja.instagramUrl} variante="secundario">
                Conversar no Instagram
              </Botao>
            </Revelar>
          </div>
        </div>
      </section>

      <section className="pt-24 md:pt-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="overflow-hidden rounded-[2.5rem] bg-superficie">
            <div className="grid items-center gap-10 p-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:p-14">
              <Revelar className="min-w-0">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-fundo">
                  <IconeInstagram className="h-5 w-5" />
                </span>
                <p className="eyebrow mt-6 text-texto-suave">{loja.instagramUsuario}</p>
                <h2 className="mt-3 text-4xl leading-tight md:text-5xl">
                  {loja.textos.instagram_titulo}
                </h2>
                <p className="mt-5 max-w-sm text-texto-suave">
                  {loja.textos.instagram_texto}
                </p>
                <Botao href={loja.instagramUrl} className="mt-8">
                  Seguir {loja.instagramUsuario}
                  <span className="transition-transform duration-300 group-hover/botao:-translate-y-0.5 group-hover/botao:translate-x-0.5">
                    <IconeSetaCima />
                  </span>
                </Botao>
              </Revelar>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {fotosInstagram.map((f, i) => (
                  <Revelar key={f.chave} atraso={i * 0.08} className={i % 2 === 1 ? "translate-y-6" : ""}>
                    <a
                      href={loja.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir o Instagram ${loja.instagramUsuario}`}
                      className="group relative block aspect-square overflow-hidden rounded-2xl"
                    >
                      <FotoSite
                        chave={f.chave}
                        url={loja.imagens[f.chave]}
                        alt={f.alt}
                        sizes="(min-width: 768px) 25vw, 45vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-[#6b1f2e]/0 text-[#fff8f5] opacity-0 transition-all duration-500 group-hover:bg-[#6b1f2e]/40 group-hover:opacity-100">
                        <IconeInstagram className="h-7 w-7" />
                      </span>
                    </a>
                  </Revelar>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
