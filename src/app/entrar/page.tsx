import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartaoAuth, EsqueletoFormulario } from "@/components/auth/CartaoAuth";
import { FormularioAuth } from "@/components/auth/FormularioAuth";
import { entrar } from "@/lib/auth/acoes";
import { caminhoInternoSeguro } from "@/lib/auth/redirecionamento";

export const metadata: Metadata = { title: "Entrar" };

async function Conteudo({ buscas }: { buscas: PageProps<"/entrar">["searchParams"] }) {
  const parametros = await buscas;
  const proximo = caminhoInternoSeguro(typeof parametros.proximo === "string" ? parametros.proximo : undefined);
  return (
    <>
      {parametros.erro === "link" ? (
        <p role="alert" className="mb-4 rounded-2xl border border-erro p-3 text-sm font-semibold text-erro">
          Esse link expirou ou já foi usado. Entre com sua senha ou peça um novo link.
        </p>
      ) : null}
      <FormularioAuth
        acao={entrar}
        botao="Entrar"
        ocultos={{ proximo }}
        campos={[
          { nome: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email" },
          { nome: "senha", rotulo: "Senha", tipo: "password", autoComplete: "current-password" },
        ]}
      />
    </>
  );
}

export default function Entrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <CartaoAuth
      titulo="Entrar"
      intro="Acesse sua conta para acompanhar seus pedidos."
      rodape={
        <>
          <p>
            <Link href="/recuperar-senha" className="font-semibold underline">
              Esqueci minha senha
            </Link>
          </p>
          <p>
            Ainda não tem conta?{" "}
            <Link href="/cadastrar" className="font-semibold underline">
              Criar conta
            </Link>
          </p>
        </>
      }
    >
      <Suspense fallback={<EsqueletoFormulario />}>
        <Conteudo buscas={searchParams} />
      </Suspense>
    </CartaoAuth>
  );
}
