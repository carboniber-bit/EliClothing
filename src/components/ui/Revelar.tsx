"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Faz o conteúdo surgir suavemente (some e sobe um pouco) quando a pessoa rola até ele.
 * O que já está na tela ao abrir a página não some; sem JavaScript, ou para quem pediu
 * menos movimento no aparelho, tudo fica visível desde o início.
 */
export function Revelar({ children, className = "", atraso = 0 }: { children: ReactNode; className?: string; atraso?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;

    el.dataset.estado = "oculto";
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          el.dataset.estado = "visivel";
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={ref} className={`revelar ${className}`} style={atraso ? { transitionDelay: `${atraso}s` } : undefined}>
      {children}
    </div>
  );
}
