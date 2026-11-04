import type { Metadata } from "next";
import { CartaoAuth } from "@/components/auth/CartaoAuth";
import { FormularioAuth } from "@/components/auth/FormularioAuth";
import { definirNovaSenha } from "@/lib/auth/acoes";

export const metadata: Metadata = { title: "Nova senha" };

export default function NovaSenha() {
  return (
    <CartaoAuth titulo="Nova senha" intro="Escolha uma senha nova para sua conta.">
      <FormularioAuth
        acao={definirNovaSenha}
        botao="Salvar nova senha"
        campos={[
          { nome: "senha", rotulo: "Nova senha", tipo: "password", autoComplete: "new-password", dica: "Pelo menos 8 caracteres." },
          { nome: "confirmar", rotulo: "Repita a nova senha", tipo: "password", autoComplete: "new-password" },
        ]}
      />
    </CartaoAuth>
  );
}
