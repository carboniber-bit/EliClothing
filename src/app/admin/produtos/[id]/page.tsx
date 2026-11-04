import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoConfirmar } from "@/components/admin/BotaoConfirmar";
import { camposEstoque, camposNovaVariacao, camposProduto } from "@/components/admin/campos";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { GaleriaFotos } from "@/components/admin/GaleriaFotos";
import { atualizarProduto, atualizarVariacao, criarVariacao, excluirProduto, excluirVariacao } from "@/lib/admin/acoes";
import { centavosParaReais } from "@/lib/admin/formatacao";
import { definirColecoesDoProduto } from "@/lib/admin/acoes-colecoes";
import { definirFotoPrincipal, excluirFoto, moverFoto, registrarFoto } from "@/lib/admin/acoes-fotos";
import { exigirAdmin } from "@/lib/admin/guarda";
import { urlFoto } from "@/lib/catalogo/mapeamento";
import { configSupabase } from "@/lib/supabase/config";

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
type Foto = { id: string; caminho: string; principal: boolean };
type Variacao = { id: string; tamanho: string; cor: string; estoque: number; ativo: boolean };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditarProduto({ params, searchParams }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const buscas = await searchParams;
  if (!UUID.test(id)) notFound();
  const { supabase } = await exigirAdmin();

  const [{ data: produtoBruto }, { data: variacoesBrutas }, { data: categoriasBrutas }, { data: fotosBrutas }, { data: colecoesBrutas }, { data: ligacoesBrutas }] = await Promise.all([
    supabase.from("produtos").select("*").eq("id", id).maybeSingle(),
    supabase.from("variacoes").select("id, tamanho, cor, estoque, ativo").eq("produto_id", id).order("tamanho").order("cor"),
    supabase.from("categorias").select("id, nome").order("ordem").order("nome"),
    supabase.from("imagens").select("id, caminho, principal").eq("produto_id", id).order("ordem").order("criado_em"),
    supabase.from("colecoes").select("id, nome").order("ordem").order("nome"),
    supabase.from("produto_colecoes").select("colecao_id").eq("produto_id", id),
  ]);
  if (!produtoBruto) notFound();
  const produto = produtoBruto as Produto;
  const variacoes = (variacoesBrutas ?? []) as Variacao[];
  const categorias = (categoriasBrutas ?? []) as { id: string; nome: string }[];
  const colecoes = (colecoesBrutas ?? []) as { id: string; nome: string }[];
  const marcadas = new Set(((ligacoesBrutas ?? []) as { colecao_id: string }[]).map((l) => l.colecao_id));
  const base = configSupabase()?.url ?? "";
  const fotos = ((fotosBrutas ?? []) as Foto[]).map((f) => ({ id: f.id, url: urlFoto(base, f.caminho), principal: f.principal }));

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

      <section aria-labelledby="fotos-titulo" className="mt-12">
        <h2 id="fotos-titulo" className="mb-1 text-2xl">
          Fotos
        </h2>
        <p className="mb-4 text-texto-suave">A foto principal aparece na loja. Você pode enviar várias de uma vez.</p>
        <GaleriaFotos
          produtoId={produto.id}
          nomeProduto={produto.nome}
          fotos={fotos}
          registrar={registrarFoto}
          tornarPrincipal={definirFotoPrincipal}
          mover={moverFoto}
          excluir={excluirFoto}
        />
      </section>

      <section aria-labelledby="colecoes-titulo" className="mt-12">
        <h2 id="colecoes-titulo" className="mb-1 text-2xl">
          Coleções
        </h2>
        {colecoes.length === 0 ? (
          <p className="text-texto-suave">Você ainda não criou coleções. Crie na aba Coleções do painel.</p>
        ) : (
          <form action={definirColecoesDoProduto.bind(null, produto.id)} className="space-y-2">
            <p className="mb-2 text-texto-suave">Marque as coleções em que esta peça aparece.</p>
            {colecoes.map((c) => (
              <label key={c.id} className="flex min-h-11 items-center gap-3 text-sm font-semibold">
                <input type="checkbox" name="colecao" value={c.id} defaultChecked={marcadas.has(c.id)} className="h-5 w-5 accent-primario" />
                {c.nome}
              </label>
            ))}
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primario px-6 text-sm font-semibold text-primario-texto transition-opacity hover:opacity-90"
            >
              Salvar coleções
            </button>
          </form>
        )}
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
