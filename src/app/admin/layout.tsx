import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { MenuAdmin } from "@/components/admin/MenuAdmin";
import { EsqueletoFormulario } from "@/components/auth/CartaoAuth";
import { obterUsuarioAtual } from "@/lib/auth/usuario";

// Guarda do painel inteiro: só entra quem é administrador (o banco também confere em cada operação).
async function Guarda({ children }: { children: ReactNode }) {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/entrar?proximo=/admin");
  if (!usuario.admin) {
    return (
      <>
        <h1 className="text-4xl">Painel da loja</h1>
        <p className="mt-6 rounded-2xl border border-borda bg-superficie p-5">
          Esta área é só para a equipe da loja.{" "}
          <Link href="/" className="font-semibold underline">
            Voltar para o início
          </Link>
        </p>
      </>
    );
  }
  return (
    <>
      <MenuAdmin />
      {children}
    </>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Suspense fallback={<EsqueletoFormulario />}>
        <Guarda>{children}</Guarda>
      </Suspense>
    </div>
  );
}
