import type { Metadata } from "next";
import Link from "next/link";
import { CartaoAuth } from "@/components/auth/CartaoAuth";
import { FormularioAuth } from "@/components/auth/FormularioAuth";
import { pedirRecuperacao } from "@/lib/auth/acoes";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarSenha() {
  return (
    <CartaoAuth
      titulo="Recuperar senha"
      intro="Digite seu e-mail e enviaremos um link para criar uma nova senha."
      rodape={
        <p>
          <Link href="/entrar" className="font-semibold underline">
            Voltar para entrar
          </Link>
        </p>
      }
    >
      <FormularioAuth
        acao={pedirRecuperacao}
        botao="Enviar link"
        campos={[{ nome: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email" }]}
      />
    </CartaoAuth>
  );
}
