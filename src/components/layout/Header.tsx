import Link from "next/link";
import { obterLoja } from "@/lib/loja/repositorio";
import { BotaoCarrinho } from "@/components/carrinho/BotaoCarrinho";
import { BotaoConta } from "./BotaoConta";
import { CabecalhoFixo } from "./CabecalhoFixo";
import { Logo } from "./Logo";
import { MenuMobile, type LinkMenu } from "./MenuMobile";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const loja = await obterLoja();
  const links: LinkMenu[] = [
    { rotulo: "Início", href: "/" },
    { rotulo: "Catálogo", href: "/catalogo" },
    { rotulo: "Instagram", href: loja.instagramUrl, externo: true },
  ];

  return (
    <CabecalhoFixo>
      <div className="relative mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-2 md:px-8">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.externo ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-elegante text-sm font-semibold tracking-wide"
              >
                {l.rotulo}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="link-elegante text-sm font-semibold tracking-wide">
                {l.rotulo}
              </Link>
            ),
          )}
        </nav>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
          <BotaoCarrinho />
          <BotaoConta />
          <ThemeToggle />
          <MenuMobile links={links} />
        </div>
      </div>
    </CabecalhoFixo>
  );
}
