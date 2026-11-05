import { cacheLife } from "next/cache";
import Link from "next/link";
import { IconeInstagram, IconeLocal, IconeWhatsapp } from "@/components/ui/Icones";
import { loja } from "@/lib/loja/config";
import { linkWhatsapp } from "@/lib/loja/whatsapp";

function exibirNumero(numero: string): string {
  const d = numero.replace(/\D/g, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d;
}

// O ano é guardado em cache (renova a cada dia): o Next não aceita ler a data direto ao montar a página.
async function anoAtual(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const whatsapp = linkWhatsapp(loja.whatsappNumero);
  const ano = await anoAtual();

  return (
    <footer className="mt-24 bg-primario text-primario-texto dark:bg-superficie dark:text-texto">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,2fr)_minmax(0,3fr)_minmax(0,2fr)] md:gap-x-8">
          <div className="md:col-span-5">
            <p className="font-titulo text-4xl tracking-[0.08em]">ELI</p>
            <p className="text-[0.6rem] font-bold tracking-[0.5em]">CLOTHING</p>
            <p className="mt-6 max-w-sm font-titulo text-xl italic">{loja.slogan}.</p>
            <p className="mt-3 max-w-sm text-sm opacity-90">Moda feminina com personalidade, de {loja.cidade} para você.</p>
          </div>

          <nav aria-label="Rodapé" className="md:col-span-2">
            <p className="eyebrow opacity-80">Navegue</p>
            <ul className="mt-5 space-y-3 text-sm font-semibold">
              <li>
                <Link href="/" className="link-elegante">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="link-elegante">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/conta" className="link-elegante">
                  Minha conta
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="eyebrow opacity-80">Contato</p>
            <ul className="mt-5 space-y-3 text-sm">
              {whatsapp ? (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="link-elegante inline-flex min-h-8 items-center gap-2 font-semibold">
                    <IconeWhatsapp />
                    WhatsApp {exibirNumero(loja.whatsappNumero ?? "")}
                  </a>
                </li>
              ) : null}
              <li>
                <a href={loja.instagramUrl} target="_blank" rel="noopener noreferrer" className="link-elegante inline-flex min-h-8 items-center gap-2 font-semibold">
                  <IconeInstagram />
                  {loja.instagramUsuario}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow opacity-80">A loja</p>
            <p className="mt-5 inline-flex items-start gap-2 text-sm">
              <span className="mt-0.5 shrink-0">
                <IconeLocal />
              </span>
              <span>Loja física e online em {loja.cidade}</span>
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-current/20 pt-6 text-xs opacity-90 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {loja.nome}. Todos os direitos reservados.
          </p>
          <p>Feito com carinho em {loja.cidade}.</p>
        </div>
      </div>
    </footer>
  );
}
