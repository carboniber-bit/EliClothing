import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variante?: "primario" | "secundario";
  href?: string;
  onClick?: () => void;
  className?: string;
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]";

const variantes = {
  primario: "bg-primario text-primario-texto hover:opacity-90",
  secundario: "border border-primario bg-transparent text-texto hover:bg-superficie",
};

export function Botao({ children, variante = "primario", href, onClick, className = "" }: Props) {
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
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
