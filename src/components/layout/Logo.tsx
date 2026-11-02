import Link from "next/link";

// Marca em texto. Quando o usuário enviar o logo sem o telefone, ele substitui isto.
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="EliClothing, página inicial"
      className="flex min-h-11 flex-col justify-center leading-none"
    >
      <span className="font-titulo text-2xl tracking-wide">ELI</span>
      <span className="text-[0.6rem] font-semibold tracking-[0.35em]">CLOTHING</span>
    </Link>
  );
}
