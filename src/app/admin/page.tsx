import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EsqueletoFormulario } from "@/components/auth/CartaoAuth";
import { obterUsuarioAtual } from "@/lib/auth/usuario";

export const metadata: Metadata = { title: "Painel da loja", robots: { index: false } };

async function Conteudo() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/entrar?proximo=/admin");
  if (!usuario.admin) {
    return (
      <p className="rounded-2xl border border-borda bg-superficie p-5">
        Esta área é só para a equipe da loja.{" "}
        <Link href="/" className="font-semibold underline">
          Voltar para o início
        </Link>
      </p>
    );
  }
  return (
    <p className="rounded-2xl border border-borda bg-superficie p-5">
      Olá, {usuario.nome ?? usuario.email}! O painel completo (produtos, fotos, pedidos) chega na próxima etapa.
    </p>
  );
}

export default function Admin() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Painel da loja</h1>
      <div className="mt-6">
        <Suspense fallback={<EsqueletoFormulario />}>
          <Conteudo />
        </Suspense>
      </div>
    </div>
  );
}
