import Link from "next/link";
import { Suspense } from "react";
import { obterResumoUsuario } from "@/lib/auth/usuario";

async function Interno() {
  const usuario = await obterResumoUsuario();
  if (!usuario) {
    return (
      <Link
        href="/entrar"
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-primario px-5 text-sm font-semibold transition-colors hover:bg-acento/30"
      >
        Entrar
      </Link>
    );
  }
  const inicial = (usuario.nome ?? usuario.email).trim().charAt(0).toUpperCase() || "?";
  return (
    <Link
      href="/conta"
      aria-label="Minha conta"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primario pl-1.5 pr-1.5 text-sm font-semibold transition-colors hover:bg-acento/30 sm:pr-4"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primario text-primario-texto"
      >
        {inicial}
      </span>
      <span className="hidden sm:inline">Minha conta</span>
    </Link>
  );
}

// A página continua carregando na hora; só este botão espera a resposta do login.
export function BotaoConta() {
  return (
    <Suspense fallback={<span aria-hidden="true" className="inline-block h-11 w-11" />}>
      <Interno />
    </Suspense>
  );
}
