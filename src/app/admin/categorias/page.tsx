import type { Metadata } from "next";
import Link from "next/link";
import { BotaoConfirmar } from "@/components/admin/BotaoConfirmar";
import { camposCategoria } from "@/components/admin/campos";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { atualizarCategoria, criarCategoria, excluirCategoria } from "@/lib/admin/acoes";
import { exigirAdmin } from "@/lib/admin/guarda";

export const metadata: Metadata = { title: "Categorias · Painel", robots: { index: false } };

type Categoria = { id: string; nome: string; slug: string; pai_id: string | null; ordem: number; ativo: boolean };

export default async function Categorias() {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("categorias").select("id, nome, slug, pai_id, ordem, ativo").order("ordem").order("nome");
  const categorias = (data ?? []) as Categoria[];
  const { data: produtosBrutos } = await supabase.from("produtos").select("id, nome, ativo, categoria_id").not("categoria_id", "is", null).order("nome");
  const produtosPorCategoria = new Map<string, { id: string; nome: string; ativo: boolean }[]>();
  for (const p of (produtosBrutos ?? []) as { id: string; nome: string; ativo: boolean; categoria_id: string }[]) {
    produtosPorCategoria.set(p.categoria_id, [...(produtosPorCategoria.get(p.categoria_id) ?? []), p]);
  }
  const nomePorId = new Map(categorias.map((c) => [c.id, c.nome]));

  return (
    <div className="max-w-xl">
      <h1 className="text-4xl">Categorias</h1>
      <p className="mb-6 mt-2 text-texto-suave">Organize os produtos em grupos, como Vestidos, Blusas ou Calças.</p>

      <div className="rounded-2xl border border-borda p-4">
        <h2 className="mb-3 text-2xl">Nova categoria</h2>
        <FormularioAdmin
          acao={criarCategoria}
          campos={camposCategoria(categorias.filter((c) => c.pai_id === null))}
          iniciais={{ ativo: "on", ordem: "0" }}
          botao="Criar categoria"
        />
      </div>

      <h2 className="mb-3 mt-10 text-2xl">Categorias cadastradas</h2>
      {categorias.length === 0 ? (
        <p className="rounded-2xl border border-borda bg-superficie p-4 text-sm">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="space-y-3">
          {categorias.map((c) => {
            const produtos = produtosPorCategoria.get(c.id) ?? [];
            return (
            <li key={c.id} className="rounded-2xl border border-borda bg-superficie p-4">
              <details>
                <summary className="min-h-11 cursor-pointer py-2 font-semibold">
                  {c.pai_id ? `${nomePorId.get(c.pai_id) ?? "?"} › ` : ""}
                  {c.nome}
                  <span className="ml-2 text-sm font-normal text-texto-suave">
                    {produtos.length} {produtos.length === 1 ? "produto" : "produtos"}
                    {c.ativo ? "" : " · escondida"}
                  </span>
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="mb-2 text-lg">Produtos nesta categoria</h3>
                    {produtos.length === 0 ? (
                      <p className="text-sm text-texto-suave">Nenhum produto ainda. Escolha esta categoria ao editar um produto.</p>
                    ) : (
                      <ul className="space-y-2">
                        {produtos.map((p) => (
                          <li key={p.id}>
                            <Link href={`/admin/produtos/${p.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-borda px-4 py-2 text-sm font-semibold [overflow-wrap:anywhere] hover:bg-acento/20">
                              <span>{p.nome}</span>
                              <span className="shrink-0 font-normal text-texto-suave">{p.ativo ? "Editar" : "Escondido · Editar"}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <FormularioAdmin
                    acao={atualizarCategoria.bind(null, c.id)}
                    campos={camposCategoria(categorias.filter((o) => o.pai_id === null && o.id !== c.id))}
                    iniciais={{ nome: c.nome, slug: c.slug, pai_id: c.pai_id ?? "", ordem: String(c.ordem), ativo: c.ativo ? "on" : "" }}
                    botao="Salvar"
                  />
                  <BotaoConfirmar acao={excluirCategoria.bind(null, c.id)} pergunta={`Excluir a categoria “${c.nome}”? Os produtos dela ficam sem categoria.`}>
                    Excluir categoria
                  </BotaoConfirmar>
                </div>
              </details>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
