import { Botao } from "@/components/ui/Botao";
import { IconeWhatsapp } from "@/components/ui/Icones";
import { Marca } from "@/components/ui/Marca";
import { Revelar } from "@/components/ui/Revelar";
import type { DadosLoja } from "@/lib/loja/repositorio";
import { linkWhatsapp } from "@/lib/loja/whatsapp";

/** Faixa com a identidade da marca: fundo rosado, ramo e letras em bordô. */
export function BannerMarca({ loja }: { loja: DadosLoja }) {
  const whatsapp = linkWhatsapp(loja.whatsappNumero, `Olá! Vim pelo site da ${loja.nome}.`);

  return (
    <section aria-labelledby="banner-titulo" className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32">
      <Revelar>
        <div className="grid items-center gap-8 overflow-hidden rounded-[2.5rem] bg-[#fce8e1] px-7 py-12 text-[#57111c] md:grid-cols-[auto_minmax(0,1fr)] md:gap-16 md:px-16 md:py-16 dark:bg-superficie dark:text-texto">
          <div className="flex justify-center">
            <Marca className="w-36 md:w-52" />
          </div>
          <div className="min-w-0 text-center md:text-left">
            <p className="eyebrow text-[#7a3a48] dark:text-texto-suave">Loja física & online · {loja.cidade}</p>
            <h2 id="banner-titulo" className="mt-4 text-4xl leading-tight md:text-5xl">
              Moda feminina com personalidade
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#7a3a48] md:mx-0 dark:text-texto-suave">
              Peças femininas, românticas e atuais, para você se vestir do seu jeito. Venha nos visitar ou chame no WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Botao href="/catalogo">Ver peças</Botao>
              {whatsapp ? (
                <Botao href={whatsapp} variante="secundario">
                  <IconeWhatsapp />
                  Falar no WhatsApp
                </Botao>
              ) : null}
            </div>
          </div>
        </div>
      </Revelar>
    </section>
  );
}
