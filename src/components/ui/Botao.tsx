import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variante?: "primario" | "secundario";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
};

const base =
  "group/botao inline-flex max-w-full min-h-12 text-center [overflow-wrap:anywhere] items-center justify-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

const variantes = {
  primario: "bg-primario text-primario-texto shadow-suave hover:shadow-elevada",
  secundario: "border border-primario bg-transparent text-texto hover:bg-primario hover:text-primario-texto",
};

export function Botao({ children, variante = "primario", href, onClick, type = "button", className = "" }: Props) {
  const classes = `${base} ${variantes[variante]} ${className}`.trim();

  if (href) {
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
