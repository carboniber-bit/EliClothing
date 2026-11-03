import type { Metadata } from "next";
import Link from "next/link";
import { CartaoAuth } from "@/components/auth/CartaoAuth";
import { FormularioAuth } from "@/components/auth/FormularioAuth";
import { cadastrar } from "@/lib/auth/acoes";

export const metadata: Metadata = { title: "Criar conta" };

export default function Cadastrar() {
  return (
    <CartaoAuth
      titulo="Criar conta"
      intro="Crie sua conta para acompanhar seus pedidos. Você também pode comprar sem conta."
      rodape={
        <p>
          Já tem conta?{" "}
          <Link href="/entrar" className="font-semibold underline">
            Entrar
          </Link>
        </p>
      }
    >
      <FormularioAuth
        acao={cadastrar}
        botao="Criar conta"
        campos={[
          { nome: "nome", rotulo: "Nome", tipo: "text", autoComplete: "name" },
          { nome: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email" },
          { nome: "senha", rotulo: "Senha", tipo: "password", autoComplete: "new-password", dica: "Pelo menos 8 caracteres." },
          { nome: "confirmar", rotulo: "Repita a senha", tipo: "password", autoComplete: "new-password" },
        ]}
      />
    </CartaoAuth>
  );
}
