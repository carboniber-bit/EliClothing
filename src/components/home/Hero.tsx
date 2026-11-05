import Image from "next/image";
import type { CSSProperties } from "react";
import { Botao } from "@/components/ui/Botao";
import { IconeSeta } from "@/components/ui/Icones";
import { loja } from "@/lib/loja/config";
import hero from "@/assets/hero-campanha.jpg";

const palavras = ["Vista-se", "para", "impressionar"];

// Atraso da animação de cada elemento (lido pelo CSS em globals.css).
const atraso = (segundos: number) => ({ "--atraso": `${segundos}s` }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2 md:gap-6 md:px-8 md:pb-24 md:pt-10">
        <div className="relative z-10 order-2 min-w-0 md:order-1">
          <p className="eyebrow surge text-texto-suave">Moda feminina · {loja.cidade}</p>

          <h1 className="mt-6 text-[clamp(2.25rem,8vw,6.5rem)] leading-[0.95]">
            {palavras.map((p, i) => (
              <span key={p}>
                <span className="palavra mr-[0.22em]">
                  <span style={atraso(0.1 + i * 0.09)}>{p}</span>
                </span>{" "}
              </span>
            ))}
            <span className="block">
              <span className="palavra">
                <span className="italic text-texto-suave" style={atraso(0.4)}>
                  (você mesma).
                </span>
              </span>
            </span>
          </h1>

          <p className="surge mt-8 max-w-md text-base leading-relaxed text-texto-suave md:text-lg" style={atraso(0.6)}>
            Moda feminina para mulheres que expressam sua personalidade em cada detalhe.
          </p>

          <div className="surge mt-10 flex flex-wrap gap-3" style={atraso(0.75)}>
            <Botao href="/catalogo">
              Ver catálogo
              <span className="transition-transform duration-300 group-hover/botao:translate-x-1">
                <IconeSeta />
              </span>
            </Botao>
            <a
              href="#sobre"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-primario px-7 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:bg-primario hover:text-primario-texto active:scale-[0.97]"
            >
              Conheça a {loja.nome}
            </a>
          </div>
        </div>

        <div className="relative order-1 md:order-2">
          <div className="entra-imagem relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-superficie shadow-elevada">
            <Image
              src={hero}
              alt="Mulher com blazer bordô e calça creme em campanha da EliClothing"
              priority
              sizes="(min-width: 768px) 560px, 90vw"
              className="zoom-suave h-full w-full object-cover object-[70%_center]"
            />
          </div>

          <div className="surge absolute -left-2 bottom-10 hidden rounded-2xl border border-borda bg-superficie px-5 py-4 shadow-suave md:block lg:-left-10" style={atraso(1)}>
            <p className="eyebrow text-texto-suave">Coleção</p>
            <p className="mt-1 font-titulo text-2xl italic">Romântica & atual</p>
          </div>

          <div
            aria-hidden="true"
            className="surge absolute -right-3 top-8 hidden h-24 w-24 -rotate-12 items-center justify-center rounded-full bg-acento text-center text-[0.6rem] font-bold uppercase leading-tight tracking-[0.2em] text-[#6b1f2e] shadow-suave md:flex"
            style={atraso(1.1)}
          >
            Loja física
            <br />& online
          </div>
        </div>
      </div>
    </section>
  );
}
