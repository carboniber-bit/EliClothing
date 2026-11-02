import { loja } from "@/lib/loja/config";
import { linkWhatsapp } from "@/lib/loja/whatsapp";
import { Botao } from "@/components/ui/Botao";

export function Footer() {
  const whatsapp = linkWhatsapp(loja.whatsappNumero);

  return (
    <footer className="mt-16 border-t border-borda bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-titulo text-2xl">{loja.nome}</p>
          <p className="mt-1 text-sm text-texto-suave">{loja.slogan}</p>
          <p className="mt-1 text-sm text-texto-suave">{loja.cidade}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Botao href={loja.instagramUrl} variante="secundario">
            Instagram {loja.instagramUsuario}
          </Botao>
          {whatsapp ? <Botao href={whatsapp}>Falar no WhatsApp</Botao> : null}
        </div>
      </div>
    </footer>
  );
}
