import type { Metadata } from "next";
import Link from "next/link";
import { camposProduto } from "@/components/admin/campos";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { criarProduto } from "@/lib/admin/acoes";
import { exigirAdmin } from "@/lib/admin/guarda";

export const metadata: Metadata = { title: "Novo produto · Painel", robots: { index: false } };

export default async function NovoProduto() {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("categorias").select("id, nome").order("ordem").order("nome");
  const categorias = (data ?? []) as { id: string; nome: string }[];

  return (
    <div className="max-w-xl">
      <p className="mb-2 text-sm">
        <Link href="/admin/produtos" className="font-semibold underline">
          ← Voltar para produtos
        </Link>
      </p>
      <h1 className="text-4xl">Novo produto</h1>
      <p className="mb-6 mt-2 text-texto-suave">Depois de salvar, você adiciona tamanhos, cores e estoque.</p>
      <FormularioAdmin
        acao={criarProduto}
        campos={camposProduto(categorias)}
        iniciais={{ ativo: "on" }}
        botao="Salvar produto"
      />
    </div>
  );
}
