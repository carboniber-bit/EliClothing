import type { Metadata } from "next";
import { BotaoConfirmar } from "@/components/admin/BotaoConfirmar";
import { camposColecao } from "@/components/admin/campos";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { atualizarColecao, criarColecao, excluirColecao } from "@/lib/admin/acoes-colecoes";
import { exigirAdmin } from "@/lib/admin/guarda";

export const metadata: Metadata = { title: "Coleções · Painel", robots: { index: false } };

type Colecao = { id: string; nome: string; slug: string; descricao: string | null; ordem: number; ativo: boolean };

export default async function Colecoes() {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("colecoes").select("id, nome, slug, descricao, ordem, ativo").order("ordem").order("nome");
  const colecoes = (data ?? []) as Colecao[];

  return (
    <div className="max-w-xl">
      <h1 className="text-4xl">Coleções</h1>
      <p className="mb-6 mt-2 text-texto-suave">
        Agrupe peças por tema ou temporada. Para escolher quais produtos entram, abra o produto e use a seção Coleções.
      </p>

      <div className="rounded-2xl border border-borda p-4">
        <h2 className="mb-3 text-2xl">Nova coleção</h2>
        <FormularioAdmin acao={criarColecao} campos={camposColecao} iniciais={{ ativo: "on", ordem: "0" }} botao="Criar coleção" />
      </div>

      <h2 className="mb-3 mt-10 text-2xl">Coleções cadastradas</h2>
      {colecoes.length === 0 ? (
        <p className="rounded-2xl border border-borda bg-superficie p-4 text-sm">Nenhuma coleção ainda.</p>
      ) : (
        <ul className="space-y-3">
          {colecoes.map((c) => (
            <li key={c.id} className="rounded-2xl border border-borda bg-superficie p-4">
              <details>
                <summary className="min-h-11 cursor-pointer py-2 font-semibold">
                  {c.nome}
                  <span className="ml-2 text-sm font-normal text-texto-suave">{c.ativo ? "" : "(escondida)"}</span>
                </summary>
                <div className="mt-4 space-y-4">
                  <FormularioAdmin
                    acao={atualizarColecao.bind(null, c.id)}
                    campos={camposColecao}
                    iniciais={{ nome: c.nome, slug: c.slug, descricao: c.descricao ?? "", ordem: String(c.ordem), ativo: c.ativo ? "on" : "" }}
                    botao="Salvar"
                  />
                  <BotaoConfirmar acao={excluirColecao.bind(null, c.id)} pergunta={`Excluir a coleção “${c.nome}”? Os produtos continuam na loja.`}>
                    Excluir coleção
                  </BotaoConfirmar>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
