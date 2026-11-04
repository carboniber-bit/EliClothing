import type { Metadata } from "next";
import Link from "next/link";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { alternarAtivoProduto } from "@/lib/admin/acoes";
import { exigirAdmin } from "@/lib/admin/guarda";
import { formatarPreco } from "@/lib/catalogo/produto";

export const metadata: Metadata = { title: "Produtos · Painel", robots: { index: false } };

type Linha = {
  id: string;
  nome: string;
  preco_centavos: number;
  preco_promocional_centavos: number | null;
  ativo: boolean;
  destaque: boolean;
  novidade: boolean;
  categorias: { nome: string } | { nome: string }[] | null;
  variacoes: { estoque: number; ativo: boolean }[] | null;
};

const etiqueta = "rounded-full border border-borda px-2.5 py-0.5 text-xs font-semibold";

export default async function Produtos() {
  const { supabase } = await exigirAdmin();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, preco_centavos, preco_promocional_centavos, ativo, destaque, novidade, categorias(nome), variacoes(estoque, ativo)")
    .order("criado_em", { ascending: false });
  const produtos = (data ?? []) as unknown as Linha[];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Produtos</h1>
        <Botao href="/admin/produtos/novo">Cadastrar produto</Botao>
      </div>
      {error ? (
        <p role="alert" className="mt-6 rounded-2xl border border-erro p-3 text-sm font-semibold text-erro">
          Não foi possível carregar os produtos agora.
        </p>
      ) : null}
      <div className="mt-6">
        {produtos.length === 0 && !error ? (
          <EstadoVazio
            titulo="Nenhum produto ainda"
            texto="Cadastre o primeiro produto da loja. Depois você adiciona tamanhos, cores e estoque."
            acao={<Botao href="/admin/produtos/novo">Cadastrar produto</Botao>}
          />
        ) : (
          <ul className="space-y-3">
            {produtos.map((p) => {
              const categoria = Array.isArray(p.categorias) ? p.categorias[0] : p.categorias;
              const estoque = (p.variacoes ?? []).filter((v) => v.ativo).reduce((soma, v) => soma + v.estoque, 0);
              return (
                <li key={p.id} className="rounded-2xl border border-borda bg-superficie p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{p.nome}</p>
                      <p className="text-sm text-texto-suave">
                        {p.preco_promocional_centavos !== null
                          ? `${formatarPreco(p.preco_promocional_centavos)} (de ${formatarPreco(p.preco_centavos)})`
                          : formatarPreco(p.preco_centavos)}
                        {categoria ? ` · ${categoria.nome}` : ""} · estoque: {estoque}
                      </p>
                      <p className="mt-2 flex flex-wrap gap-2">
                        <span className={etiqueta}>{p.ativo ? "Na loja" : "Escondido"}</span>
                        {p.novidade ? <span className={etiqueta}>Novidade</span> : null}
                        {p.destaque ? <span className={etiqueta}>Destaque</span> : null}
                        {estoque === 0 ? <span className={etiqueta}>Sem estoque</span> : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="inline-flex min-h-11 items-center rounded-full bg-primario px-5 text-sm font-semibold text-primario-texto transition-opacity hover:opacity-90"
                      >
                        Editar
                      </Link>
                      <form action={alternarAtivoProduto.bind(null, p.id, p.ativo)}>
                        <button
                          type="submit"
                          className="inline-flex min-h-11 items-center rounded-full border border-primario px-5 text-sm font-semibold transition-colors hover:bg-acento/30"
                        >
                          {p.ativo ? "Esconder" : "Mostrar"}
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
