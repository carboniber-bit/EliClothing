import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoConfirmar } from "@/components/admin/BotaoConfirmar";
import { camposEstoque, camposNovaVariacao, camposProduto } from "@/components/admin/campos";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { atualizarProduto, atualizarVariacao, criarVariacao, excluirProduto, excluirVariacao } from "@/lib/admin/acoes";
import { centavosParaReais } from "@/lib/admin/formatacao";
import { exigirAdmin } from "@/lib/admin/guarda";

export const metadata: Metadata = { title: "Editar produto · Painel", robots: { index: false } };

type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco_centavos: number;
  preco_promocional_centavos: number | null;
  categoria_id: string | null;
  ativo: boolean;
  destaque: boolean;
  novidade: boolean;
};
type Variacao = { id: string; tamanho: string; cor: string; estoque: number; ativo: boolean };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditarProduto({ params, searchParams }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const buscas = await searchParams;
  if (!UUID.test(id)) notFound();
  const { supabase } = await exigirAdmin();

  const [{ data: produtoBruto }, { data: variacoesBrutas }, { data: categoriasBrutas }] = await Promise.all([
    supabase.from("produtos").select("*").eq("id", id).maybeSingle(),
    supabase.from("variacoes").select("id, tamanho, cor, estoque, ativo").eq("produto_id", id).order("tamanho").order("cor"),
    supabase.from("categorias").select("id, nome").order("ordem").order("nome"),
  ]);
  if (!produtoBruto) notFound();
  const produto = produtoBruto as Produto;
  const variacoes = (variacoesBrutas ?? []) as Variacao[];
  const categorias = (categoriasBrutas ?? []) as { id: string; nome: string }[];

  const iniciais: Record<string, string> = {
    nome: produto.nome,
    slug: produto.slug,
    descricao: produto.descricao ?? "",
    preco: centavosParaReais(produto.preco_centavos),
    preco_promocional: produto.preco_promocional_centavos === null ? "" : centavosParaReais(produto.preco_promocional_centavos),
    categoria_id: produto.categoria_id ?? "",
    ativo: produto.ativo ? "on" : "",
    novidade: produto.novidade ? "on" : "",
    destaque: produto.destaque ? "on" : "",
  };

  return (
    <div className="max-w-xl">
      <p className="mb-2 text-sm">
        <Link href="/admin/produtos" className="font-semibold underline">
          ← Voltar para produtos
        </Link>
      </p>
      <h1 className="break-words text-4xl">{produto.nome}</h1>
      {buscas.novo === "1" ? (
        <p role="status" className="mt-4 rounded-2xl border border-borda bg-superficie p-3 text-sm font-semibold">
          Produto criado! Agora adicione os tamanhos, as cores e o estoque abaixo.
        </p>
      ) : null}

      <section aria-labelledby="dados" className="mt-8">
        <h2 id="dados" className="mb-4 text-2xl">
          Dados do produto
        </h2>
        <FormularioAdmin
          acao={atualizarProduto.bind(null, produto.id)}
          campos={camposProduto(categorias)}
          iniciais={iniciais}
          botao="Salvar alterações"
        />
      </section>

      <section aria-labelledby="variacoes" className="mt-12">
        <h2 id="variacoes" className="mb-1 text-2xl">
          Tamanhos, cores e estoque
        </h2>
        <p className="mb-4 text-texto-suave">Cada combinação de tamanho e cor tem o seu estoque.</p>
        {variacoes.length === 0 ? (
          <p className="mb-4 rounded-2xl border border-borda bg-superficie p-4 text-sm">
            Nenhuma variação ainda. Sem estoque cadastrado, o produto aparece como indisponível.
          </p>
        ) : (
          <ul className="mb-6 space-y-4">
            {variacoes.map((v) => (
              <li key={v.id} className="rounded-2xl border border-borda bg-superficie p-4">
                <p className="mb-3 font-semibold">
                  {v.tamanho}
                  {v.cor ? ` · ${v.cor}` : ""}
                </p>
                <FormularioAdmin
                  acao={atualizarVariacao.bind(null, v.id, produto.id)}
                  campos={camposEstoque}
                  iniciais={{ estoque: String(v.estoque), ativo: v.ativo ? "on" : "" }}
                  botao="Salvar"
                />
                <div className="mt-3">
                  <BotaoConfirmar acao={excluirVariacao.bind(null, v.id, produto.id)} pergunta={`Excluir a variação ${v.tamanho}${v.cor ? ` ${v.cor}` : ""}?`}>
                    Excluir variação
                  </BotaoConfirmar>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="rounded-2xl border border-borda p-4">
          <h3 className="mb-3 text-xl">Adicionar variação</h3>
          <FormularioAdmin acao={criarVariacao.bind(null, produto.id)} campos={camposNovaVariacao} botao="Adicionar" />
        </div>
      </section>

      <section aria-labelledby="excluir" className="mt-12">
        <h2 id="excluir" className="mb-3 text-2xl">
          Excluir produto
        </h2>
        <p className="mb-3 text-sm text-texto-suave">
          Se só quer tirar da loja por um tempo, desmarque “Aparece na loja” acima. Excluir apaga o produto e seus estoques; pedidos antigos continuam guardados.
        </p>
        <BotaoConfirmar acao={excluirProduto.bind(null, produto.id)} pergunta={`Excluir o produto “${produto.nome}”? Isso não pode ser desfeito.`}>
          Excluir produto
        </BotaoConfirmar>
      </section>
    </div>
  );
}
