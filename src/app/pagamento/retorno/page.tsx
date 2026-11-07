import type { Metadata } from "next";
import { Suspense } from "react";
import { Botao } from "@/components/ui/Botao";
import { situacaoValida, telaDeRetorno } from "@/lib/pagamento/retorno";
import { criarClienteServico } from "@/lib/supabase/servico";
import { formatarPreco } from "@/lib/catalogo/produto";

export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function buscarPedido(ref: string | undefined) {
  if (!ref || !UUID.test(ref)) return null;
  const servico = criarClienteServico();
  if (!servico) return null;
  // external_reference é o código secreto (UUID) do pedido; só mostramos número, valor e situação.
  const { data } = await servico.from("pedidos").select("numero, status, total_centavos").eq("id", ref).maybeSingle();
  return data as { numero: number; status: string; total_centavos: number } | null;
}

async function Conteudo({ buscas }: { buscas: PageProps<"/pagamento/retorno">["searchParams"] }) {
  const q = await buscas;
  // O Mercado Pago acrescenta os próprios parâmetros (status, external_reference...) ao endereço de retorno.
  const ref = Array.isArray(q.external_reference) ? q.external_reference[0] : q.external_reference;
  const pedido = await buscarPedido(ref);
  const tela = telaDeRetorno(situacaoValida(q.situacao), pedido?.status ?? null);
  const bom = tela.tipo === "confirmado" || tela.tipo === "aprovado";

  return (
    <>
      <div aria-hidden="true" className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 ${bom ? "border-primario bg-primario text-primario-texto" : "border-borda text-texto-suave"}`}>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {bom ? <path d="m5 12 5 5 9-10" /> : <path d="M12 7v6M12 17h.01" />}
        </svg>
      </div>
      <h1 className="text-4xl md:text-5xl">{tela.titulo}</h1>
      {pedido ? (
        <p className="mt-3 text-lg">
          Pedido <strong>#{pedido.numero}</strong> · {formatarPreco(pedido.total_centavos)}
        </p>
      ) : null}
      <p role="status" className="mt-4 max-w-xl text-texto-suave">{tela.texto}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Botao href="/catalogo">Continuar comprando</Botao>
        {tela.tipo === "falha" ? <Botao href="/carrinho" variante="secundario">Voltar à sacola</Botao> : null}
      </div>
    </>
  );
}

export default function Retorno({ searchParams }: PageProps<"/pagamento/retorno">) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 md:pt-20">
      <Suspense fallback={<p className="text-texto-suave">Carregando…</p>}>
        <Conteudo buscas={searchParams} />
      </Suspense>
    </div>
  );
}
