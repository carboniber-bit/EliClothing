import Link from "next/link";

// Marca em texto. Quando o usuário enviar o logo sem o telefone, ele substitui isto.
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="EliClothing, página inicial"
      className="group flex min-h-11 flex-col justify-center leading-none"
    >
      <span className="font-titulo text-[1.7rem] font-medium tracking-[0.08em] transition-transform duration-500 group-hover:scale-[1.03]">ELI</span>
      <span className="mt-0.5 text-[0.55rem] font-bold tracking-[0.5em]">CLOTHING</span>
    </Link>
  );
}
