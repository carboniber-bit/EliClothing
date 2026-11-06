import type { Metadata } from "next";
import { Botao } from "@/components/ui/Botao";
import { exigirAdmin } from "@/lib/admin/guarda";

export const metadata: Metadata = { title: "Painel da loja", robots: { index: false } };

export default async function Painel() {
  const { supabase, usuario } = await exigirAdmin();
  const contar = (consulta: PromiseLike<{ count: number | null }>) => consulta.then((r) => r.count ?? 0);
  const [total, ativos, semEstoque, novos, aguardando] = await Promise.all([
    contar(supabase.from("produtos").select("id", { count: "exact", head: true })),
    contar(supabase.from("produtos").select("id", { count: "exact", head: true }).eq("ativo", true)),
    contar(supabase.from("variacoes").select("id", { count: "exact", head: true }).eq("ativo", true).eq("estoque", 0)),
    contar(supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("status", "novo")),
    contar(supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("status", "aguardando_pagamento")),
  ]);

  const cartoes = [
    { rotulo: "Produtos cadastrados", valor: total },
    { rotulo: "Aparecendo na loja", valor: ativos },
    { rotulo: "Variações sem estoque", valor: semEstoque },
    { rotulo: "Pedidos novos", valor: novos },
    { rotulo: "Aguardando pagamento", valor: aguardando },
  ];

  return (
    <>
      <h1 className="text-4xl">Painel da loja</h1>
      <p className="mt-2 text-texto-suave">Olá, {usuario.nome ?? usuario.email}!</p>
      <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cartoes.map((c) => (
          <div key={c.rotulo} className="rounded-2xl border border-borda bg-superficie p-4">
            <dt className="text-sm text-texto-suave">{c.rotulo}</dt>
            <dd className="mt-1 font-titulo text-3xl">{c.valor}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <Botao href="/admin/pedidos">Ver pedidos</Botao>
        <Botao href="/admin/produtos/novo" variante="secundario">
          Cadastrar produto
        </Botao>
        <Botao href="/admin/categorias" variante="secundario">
          Categorias
        </Botao>
        <Botao href="/catalogo" variante="secundario">
          Ver a loja
        </Botao>
      </div>
    </>
  );
}
