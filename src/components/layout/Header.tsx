import Link from "next/link";
import { loja } from "@/lib/loja/config";
import { BotaoConta } from "./BotaoConta";
import { Logo } from "./Logo";
import { MenuMobile, type LinkMenu } from "./MenuMobile";
import { ThemeToggle } from "./ThemeToggle";

const links: LinkMenu[] = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Catálogo", href: "/catalogo" },
  { rotulo: "Instagram", href: loja.instagramUrl, externo: true },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-borda bg-fundo">
      <div className="relative mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.externo ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:underline"
              >
                {l.rotulo}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="text-sm font-semibold hover:underline">
                {l.rotulo}
              </Link>
            ),
          )}
        </nav>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
          <BotaoConta />
          <ThemeToggle />
          <MenuMobile links={links} />
        </div>
      </div>
    </header>
  );
}
