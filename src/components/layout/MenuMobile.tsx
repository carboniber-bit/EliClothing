"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export type LinkMenu = { rotulo: string; href: string; externo?: boolean };

export function MenuMobile({ links }: { links: LinkMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  function fechar(devolverFoco: boolean) {
    setAberto(false);
    if (devolverFoco) botao.current?.focus();
  }

  // Esc fecha o menu de qualquer lugar da página; ao passar para a tela larga o menu fecha sozinho.
  useEffect(() => {
    if (!aberto) return;
    const aoEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAberto(false);
        botao.current?.focus();
      }
    };
    const larga = window.matchMedia("(min-width: 768px)");
    const aoMudarTela = () => {
      if (larga.matches) setAberto(false);
    };
    document.addEventListener("keydown", aoEsc);
    larga.addEventListener("change", aoMudarTela);
    return () => {
      document.removeEventListener("keydown", aoEsc);
      larga.removeEventListener("change", aoMudarTela);
    };
  }, [aberto]);

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (!aberto) return;
    if (e.key !== "Tab" || !raiz.current) return;
    // O foco circula só entre o botão e os links do menu enquanto ele está aberto.
    const itens = Array.from(raiz.current.querySelectorAll<HTMLElement>("button, a[href]"));
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }

  return (
    <div ref={raiz} data-menu onKeyDown={aoTeclar} className="md:hidden">
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-controls="menu-mobile"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        onClick={() => setAberto((v) => !v)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-borda bg-superficie text-texto"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {aberto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <nav
        id="menu-mobile"
        aria-label="Menu"
        hidden={!aberto}
        className="absolute inset-x-0 top-full border-b border-borda bg-fundo px-4 py-2 shadow-lg"
      >
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              {l.externo ? (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => fechar(true)}
                  className="flex min-h-12 items-center text-base font-semibold"
                >
                  {l.rotulo}
                </a>
              ) : (
                <Link
                  href={l.href}
                  onClick={() => fechar(true)}
                  className="flex min-h-12 items-center text-base font-semibold"
                >
                  {l.rotulo}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
