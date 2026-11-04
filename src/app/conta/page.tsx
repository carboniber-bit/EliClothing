import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EsqueletoFormulario } from "@/components/auth/CartaoAuth";
import { Botao } from "@/components/ui/Botao";
import { sair } from "@/lib/auth/acoes";
import { obterUsuarioAtual } from "@/lib/auth/usuario";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

async function Dados() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/entrar?proximo=/conta");
  return (
    <div className="space-y-6">
      <dl className="space-y-3 rounded-2xl border border-borda bg-superficie p-5">
        <div>
          <dt className="text-sm text-texto-suave">Nome</dt>
          <dd className="font-semibold">{usuario.nome ?? "Não informado"}</dd>
        </div>
        <div>
          <dt className="text-sm text-texto-suave">E-mail</dt>
          <dd className="break-all font-semibold">{usuario.email}</dd>
        </div>
      </dl>
      {usuario.admin ? (
        <p>
          <Link href="/admin" className="font-semibold underline">
            Ir para o painel da loja
          </Link>
        </p>
      ) : null}
      <form action={sair}>
        <Botao variante="secundario" type="submit">
          Sair da conta
        </Botao>
      </form>
    </div>
  );
}

export default function Conta() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-4xl">Minha conta</h1>
      <div className="mt-6">
        <Suspense fallback={<EsqueletoFormulario />}>
          <Dados />
        </Suspense>
      </div>
    </div>
  );
}
