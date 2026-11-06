"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { CategoriaComFilhos } from "@/lib/catalogo/categorias";

const linha = "flex min-h-14 flex-1 items-center py-2 pl-6 pr-2 text-base [overflow-wrap:anywhere] hover:bg-acento/20";
const seta = (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

/** Gaveta lateral com as categorias criadas no painel. */
export function MenuCategorias({ categorias }: { categorias: CategoriaComFilhos[] }) {
  const [aberto, setAberto] = useState(false);
  const [expandida, setExpandida] = useState<string | null>(null);
  const painel = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  function fechar() {
    setAberto(false);
    botao.current?.focus();
  }

  useEffect(() => {
    if (!aberto) return;
    const aoEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener("keydown", aoEsc);
    document.body.style.overflow = "hidden";
    painel.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    return () => {
      document.removeEventListener("keydown", aoEsc);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !painel.current) return;
    const itens = Array.from(painel.current.querySelectorAll<HTMLElement>("button, a[href]"));
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
    <div>
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-controls="gaveta-categorias"
        onClick={() => setAberto(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-borda bg-superficie px-3 text-sm font-semibold text-texto sm:px-4"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
        <span className="hidden sm:inline">Categorias</span>
        <span className="sr-only sm:hidden">Categorias</span>
      </button>

      <div className={`fixed inset-0 z-50 ${aberto ? "" : "pointer-events-none invisible"}`} onKeyDown={aoTeclar}>
        <div aria-hidden="true" onClick={fechar} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${aberto ? "opacity-100" : "opacity-0"}`} />
        <div
          ref={painel}
          id="gaveta-categorias"
          role="dialog"
          aria-modal="true"
          aria-label="Categorias"
          className={`absolute inset-y-0 left-0 flex w-[min(24rem,88vw)] flex-col bg-fundo text-texto shadow-elevada transition-transform duration-300 ease-out ${aberto ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-borda px-6 py-3">
            <p className="font-titulo text-2xl">Categorias</p>
            <button type="button" onClick={fechar} aria-label="Fechar categorias" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-borda">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label="Categorias da loja" className="flex-1 overflow-y-auto">
            <ul>
              <li className="flex items-center border-b border-borda/60">
                <Link href="/catalogo" onClick={() => setAberto(false)} className={`${linha} font-semibold`}>
                  Todos os produtos
                </Link>
                <span className="pr-5 text-texto-suave">{seta}</span>
              </li>
              {categorias.map((c) => {
                const temFilhos = c.filhos.length > 0;
                const aberta = expandida === c.id;
                return (
                  <li key={c.id} className="border-b border-borda/60">
                    <div className="flex items-center">
                      <Link href={`/categoria/${c.slug}`} onClick={() => setAberto(false)} className={linha}>
                        {c.nome}
                      </Link>
                      {temFilhos ? (
                        <button
                          type="button"
                          aria-expanded={aberta}
                          aria-label={`Subcategorias de ${c.nome}`}
                          onClick={() => setExpandida(aberta ? null : c.id)}
                          className="inline-flex h-14 w-14 items-center justify-center text-texto-suave"
                        >
                          <span className={`transition-transform ${aberta ? "rotate-90" : ""}`}>{seta}</span>
                        </button>
                      ) : (
                        <span className="pr-5 text-texto-suave">{seta}</span>
                      )}
                    </div>
                    {temFilhos && aberta ? (
                      <ul className="bg-superficie">
                        {c.filhos.map((f) => (
                          <li key={f.id}>
                            <Link href={`/categoria/${f.slug}`} onClick={() => setAberto(false)} className="flex min-h-12 items-center py-2 pl-10 pr-4 text-sm [overflow-wrap:anywhere] hover:bg-acento/20">
                              {f.nome}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
