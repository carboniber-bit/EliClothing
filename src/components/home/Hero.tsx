import { Botao } from "@/components/ui/Botao";
import { loja } from "@/lib/loja/config";

export function Hero() {
  return (
    <section className="bg-superficie">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
        <p className="text-sm font-semibold tracking-[0.3em]">MODA FEMININA · {loja.cidade.toUpperCase()}</p>
        <h1 className="mt-4 text-4xl md:text-6xl">{loja.slogan}</h1>
        <p className="mx-auto mt-5 max-w-xl text-texto-suave">
          Peças pensadas para você se sentir bem em cada ocasião. Conheça a {loja.nome}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Botao href="/catalogo">Ver catálogo</Botao>
          <Botao href={loja.instagramUrl} variante="secundario">
            Ver no Instagram
          </Botao>
        </div>
      </div>
    </section>
  );
}
