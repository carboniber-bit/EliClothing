import type { Metadata } from "next";
import { GradeProdutos } from "@/components/catalogo/GradeProdutos";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { obterRepositorio } from "@/lib/catalogo/repositorio";
import { loja } from "@/lib/loja/config";

export const metadata: Metadata = {
  title: "Catálogo",
  description: `Catálogo de moda feminina da ${loja.nome}.`,
};

export default async function Catalogo() {
  const produtos = await obterRepositorio().listarProdutos();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="text-4xl">Catálogo</h1>
      <p className="mt-2 text-texto-suave">Todas as peças da {loja.nome} em um só lugar.</p>
      <div className="mt-8">
        {produtos.length > 0 ? (
          <GradeProdutos produtos={produtos} />
        ) : (
          <EstadoVazio
            titulo="Catálogo em preparação"
            texto="Estamos preparando a coleção. Enquanto isso, acompanhe as novidades no Instagram."
            acao={<Botao href={loja.instagramUrl}>Ver no Instagram</Botao>}
          />
        )}
      </div>
    </div>
  );
}
