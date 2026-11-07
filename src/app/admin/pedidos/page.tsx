import type { Metadata } from "next";
import Link from "next/link";
import { EtiquetaStatus } from "@/components/admin/EtiquetaStatus";
import { exigirAdmin } from "@/lib/admin/guarda";
import { formatarPreco } from "@/lib/catalogo/produto";
import { ehStatusPedido, FORMA_PAGAMENTO, ROTULO_STATUS, STATUS_PEDIDO, type StatusPedido } from "@/lib/pedidos/status";

export const metadata: Metadata = { title: "Pedidos · Painel", robots: { index: false } };

type Pedido = { id: string; numero: number; nome: string; status: StatusPedido; total_centavos: number; forma_pagamento: string; criado_em: string };

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function Pedidos({ searchParams }: PageProps<"/admin/pedidos">) {
  const buscas = await searchParams;
  const filtroBruto = Array.isArray(buscas.status) ? buscas.status[0] : buscas.status;
  const filtro = ehStatusPedido(filtroBruto) ? filtroBruto : null;
  const { supabase } = await exigirAdmin();

  // Pedidos de Pix/cartão não pagos a tempo voltam ao estoque (não há agendador, então conferimos aqui).
  await supabase.rpc("expirar_pedidos_vencidos");

  let consulta = supabase
    .from("pedidos")
    .select("id, numero, nome, status, total_centavos, forma_pagamento, criado_em")
    .order("criado_em", { ascending: false })
    .limit(100);
  if (filtro) consulta = consulta.eq("status", filtro);
  const { data: bruto } = await consulta;
  const pedidos = (bruto ?? []) as Pedido[];

  return (
    <>
      <h1 className="text-4xl">Pedidos</h1>
      <p className="mb-5 mt-2 text-texto-suave">Os 100 pedidos mais recentes. Toque em um pedido para ver os itens e mudar a situação.</p>

      <nav aria-label="Filtrar por situação" className="mb-6 flex flex-wrap gap-2">
        {[null, ...STATUS_PEDIDO].map((s) => (
          <Link
            key={s ?? "todos"}
            href={s ? `/admin/pedidos?status=${s}` : "/admin/pedidos"}
            aria-current={s === filtro ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
              s === filtro ? "border-primario bg-primario text-primario-texto" : "border-borda bg-superficie hover:bg-acento/30"
            }`}
          >
            {s ? ROTULO_STATUS[s] : "Todos"}
          </Link>
        ))}
      </nav>

      {pedidos.length === 0 ? (
        <p className="rounded-2xl border border-borda bg-superficie p-5 text-sm">Nenhum pedido {filtro ? "com essa situação" : "ainda"}.</p>
      ) : (
        <ul className="space-y-3">
          {pedidos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/pedidos/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-borda bg-superficie p-4 transition-colors hover:bg-acento/20"
              >
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  <span className="font-semibold">Pedido #{p.numero}</span> · {p.nome}
                  <span className="block text-sm text-texto-suave">
                    {data.format(new Date(p.criado_em))} · {FORMA_PAGAMENTO[p.forma_pagamento] ?? p.forma_pagamento}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <strong>{formatarPreco(p.total_centavos)}</strong>
                  <EtiquetaStatus status={p.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
