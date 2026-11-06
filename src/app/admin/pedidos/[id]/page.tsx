import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EtiquetaStatus } from "@/components/admin/EtiquetaStatus";
import { MudarStatus } from "@/components/admin/MudarStatus";
import { alterarStatusPedido } from "@/lib/admin/acoes-pedidos";
import { exigirAdmin } from "@/lib/admin/guarda";
import { formatarPreco } from "@/lib/catalogo/produto";
import { FORMA_PAGAMENTO, ROTULO_STATUS, type StatusPedido } from "@/lib/pedidos/status";
import { linkWhatsapp } from "@/lib/loja/whatsapp";

export const metadata: Metadata = { title: "Pedido · Painel", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

type Pedido = {
  id: string; numero: number; nome: string; telefone: string; tipo_entrega: string; endereco: string | null; observacao: string | null;
  subtotal_centavos: number; total_centavos: number; forma_pagamento: string; status: StatusPedido; criado_em: string;
};
type Item = { id: string; nome: string; tamanho: string; cor: string; preco_unitario_centavos: number; quantidade: number };
type Evento = { id: number; quando: string; origem: string; antes: { status?: string } | null; depois: { status?: string } | null };

export default async function DetalhePedido({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await exigirAdmin();

  const [{ data: pedidoBruto }, { data: itensBrutos }, { data: eventosBrutos }] = await Promise.all([
    supabase.from("pedidos").select("*").eq("id", id).maybeSingle(),
    supabase.from("itens_pedido").select("id, nome, tamanho, cor, preco_unitario_centavos, quantidade").eq("pedido_id", id),
    supabase.from("auditoria").select("id, quando, origem, antes, depois").eq("tabela", "pedidos").eq("registro_id", id).order("quando", { ascending: false }),
  ]);
  if (!pedidoBruto) notFound();
  const pedido = pedidoBruto as Pedido;
  const itens = (itensBrutos ?? []) as Item[];
  const eventos = ((eventosBrutos ?? []) as Evento[]).filter((e) => e.antes?.status !== e.depois?.status);
  const zap = linkWhatsapp(pedido.telefone.replace(/\D/g, ""), `Olá, ${pedido.nome}! Sobre o seu pedido #${pedido.numero} na EliClothing:`);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/pedidos" className="text-sm font-semibold underline">
        ← Voltar para os pedidos
      </Link>
      <h1 className="mt-4 text-4xl">Pedido #{pedido.numero}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-3 text-texto-suave">
        {data.format(new Date(pedido.criado_em))} · <EtiquetaStatus status={pedido.status} />
      </p>

      <section className="mt-6 rounded-2xl border border-borda bg-superficie p-4">
        <h2 className="text-2xl">Mudar situação</h2>
        <div className="mt-3">
          <MudarStatus acao={alterarStatusPedido.bind(null, pedido.id)} atual={pedido.status} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-borda bg-superficie p-4 [overflow-wrap:anywhere]">
        <h2 className="text-2xl">Cliente</h2>
        <p className="mt-2 font-semibold">{pedido.nome}</p>
        <p>
          {pedido.telefone}
          {zap ? (
            <>
              {" · "}
              <a href={zap} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                Chamar no WhatsApp
              </a>
            </>
          ) : null}
        </p>
        <p className="mt-2 text-sm">
          {pedido.tipo_entrega === "entrega" ? `Entrega: ${pedido.endereco ?? ""}` : "Retirada na loja"} · {FORMA_PAGAMENTO[pedido.forma_pagamento] ?? pedido.forma_pagamento}
        </p>
        {pedido.observacao ? <p className="mt-2 text-sm">Observação: {pedido.observacao}</p> : null}
      </section>

      <section className="mt-6 rounded-2xl border border-borda bg-superficie p-4">
        <h2 className="text-2xl">Itens</h2>
        <ul className="mt-3 divide-y divide-borda">
          {itens.map((i) => (
            <li key={i.id} className="flex flex-wrap justify-between gap-2 py-2 [overflow-wrap:anywhere]">
              <span>
                {i.quantidade}× {i.nome} <span className="text-sm text-texto-suave">({i.tamanho}{i.cor ? `, ${i.cor}` : ""})</span>
              </span>
              <span>{formatarPreco(i.preco_unitario_centavos * i.quantidade)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-lg font-semibold">Total: {formatarPreco(pedido.total_centavos)}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-2xl">Histórico da situação</h2>
        {eventos.length === 0 ? (
          <p className="mt-2 text-sm text-texto-suave">Nenhuma mudança registrada.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {eventos.map((e) => (
              <li key={e.id}>
                {data.format(new Date(e.quando))} — {e.antes?.status ? `${ROTULO_STATUS[e.antes.status as StatusPedido] ?? e.antes.status} → ` : ""}
                <strong>{ROTULO_STATUS[e.depois?.status as StatusPedido] ?? e.depois?.status}</strong> <span className="text-texto-suave">({e.origem})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
