"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type InputHTMLAttributes } from "react";
import { Botao } from "@/components/ui/Botao";
import { formatarPreco } from "@/lib/catalogo/produto";
import { finalizarPedido, type ResultadoPedido } from "@/lib/pedidos/acoes";
import { useCarrinho } from "./CarrinhoProvider";

const entrada = "min-h-12 w-full rounded-xl border border-borda bg-fundo px-4 text-base text-texto";

export function FormularioPedido() {
  const { itens, pronto, subtotalCentavos, limpar } = useCarrinho();
  const [pendente, iniciar] = useTransition();
  const [entrega, setEntrega] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPedido | null>(null);
  const [concluido, setConcluido] = useState<{ numero: number; total: number; whatsappUrl: string | null; pagarUrl: string | null } | null>(null);

  if (concluido?.pagarUrl) {
    return (
      <div role="status" className="max-w-xl space-y-5 rounded-2xl border border-borda bg-superficie p-6">
        <h2 className="text-3xl">Pedido #{concluido.numero} criado</h2>
        <p>Levando você para o pagamento seguro do Mercado Pago… Suas peças ficam guardadas por 30 minutos.</p>
        <Botao href={concluido.pagarUrl}>Ir para o pagamento</Botao>
      </div>
    );
  }

  if (concluido) {
    return (
      <div role="status" className="max-w-xl space-y-5 rounded-2xl border border-borda bg-superficie p-6">
        <h2 className="text-3xl">Pedido #{concluido.numero} recebido!</h2>
        <p>Total: <strong>{formatarPreco(concluido.total)}</strong>. Guardamos as suas peças. Falta só combinar o pagamento e a entrega com a gente pelo WhatsApp.</p>
        {concluido.whatsappUrl ? <Botao href={concluido.whatsappUrl}>Enviar pelo WhatsApp</Botao> : <p className="text-sm text-texto-suave">Entraremos em contato pelo telefone que você informou.</p>}
        <p><Link href="/catalogo" className="font-semibold underline">Continuar comprando</Link></p>
      </div>
    );
  }

  if (!pronto) return <p className="text-texto-suave">Carregando…</p>;
  if (itens.length === 0) {
    return (
      <div className="space-y-4">
        <p>Sua sacola está vazia.</p>
        <Botao href="/catalogo">Ver o catálogo</Botao>
      </div>
    );
  }

  const campos = resultado && !resultado.ok ? (resultado.campos ?? {}) : {};
  const erro = resultado && !resultado.ok ? resultado.erro : undefined;

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const texto = (n: string) => String(f.get(n) ?? "");
    iniciar(async () => {
      const r = await finalizarPedido({
        nome: texto("nome"),
        telefone: texto("telefone"),
        tipo_entrega: texto("tipo_entrega"),
        forma_pagamento: texto("forma_pagamento"),
        endereco: texto("endereco"),
        observacao: texto("observacao"),
        site: texto("site"),
        itens: itens.map((i) => ({ variacaoId: i.variacaoId, quantidade: i.quantidade })),
      });
      setResultado(r);
      if (r.ok) {
        limpar();
        setConcluido({ numero: r.numero, total: r.totalCentavos, whatsappUrl: r.whatsappUrl, pagarUrl: r.pagarUrl });
        if (r.pagarUrl) window.location.assign(r.pagarUrl);
      }
    });
  }

  const campo = (nome: string, rotulo: string, props: InputHTMLAttributes<HTMLInputElement>, dica?: string) => (
    <div>
      <label htmlFor={nome} className="mb-1 block text-sm font-semibold">{rotulo}</label>
      <input id={nome} name={nome} className={entrada} aria-invalid={campos[nome] ? true : undefined} aria-describedby={campos[nome] ? `${nome}-erro` : dica ? `${nome}-dica` : undefined} {...props} />
      {dica && !campos[nome] ? <p id={`${nome}-dica`} className="mt-1 text-sm text-texto-suave">{dica}</p> : null}
      {campos[nome] ? <p id={`${nome}-erro`} className="mt-1 text-sm text-erro">{campos[nome]}</p> : null}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <form onSubmit={enviar} noValidate className="space-y-5">
        {campo("nome", "Seu nome", { type: "text", autoComplete: "name", required: true })}
        {campo("telefone", "WhatsApp / telefone com DDD", { type: "tel", autoComplete: "tel", inputMode: "tel", required: true }, "Exemplo: (11) 97302-9002")}
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Como quer receber?</legend>
          <div className="flex flex-wrap gap-3">
            {[["retirada", "Retirar na loja"], ["entrega", "Receber em casa"]].map(([valor, rotulo]) => (
              <label key={valor} className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-borda bg-superficie px-5 text-sm font-semibold has-[:checked]:border-primario has-[:checked]:bg-primario has-[:checked]:text-primario-texto has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
                <input type="radio" name="tipo_entrega" value={valor} defaultChecked={valor === "retirada"} onChange={() => setEntrega(valor === "entrega")} className="sr-only" />
                {rotulo}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Como quer pagar?</legend>
          <div className="flex flex-wrap gap-3">
            {[["pix", "Pix"], ["cartao", "Cartão"], ["whatsapp", "Combinar pelo WhatsApp"]].map(([valor, rotulo]) => (
              <label key={valor} className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-borda bg-superficie px-5 text-sm font-semibold has-[:checked]:border-primario has-[:checked]:bg-primario has-[:checked]:text-primario-texto has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
                <input type="radio" name="forma_pagamento" value={valor} defaultChecked={valor === "whatsapp"} className="sr-only" />
                {rotulo}
              </label>
            ))}
          </div>
          {campos.forma_pagamento ? <p className="mt-1 text-sm text-erro">{campos.forma_pagamento}</p> : null}
        </fieldset>
        {entrega ? campo("endereco", "Endereço completo", { type: "text", autoComplete: "street-address" }, "Rua, número, bairro e complemento. O frete é combinado pelo WhatsApp.") : null}
        <div>
          <label htmlFor="observacao" className="mb-1 block text-sm font-semibold">Observação (opcional)</label>
          <textarea id="observacao" name="observacao" rows={3} maxLength={500} className={`${entrada} py-3`} />
          {campos.observacao ? <p className="mt-1 text-sm text-erro">{campos.observacao}</p> : null}
        </div>
        {/* Armadilha para robôs: invisível e fora da navegação por teclado. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Não preencha<input type="text" name="site" tabIndex={-1} autoComplete="off" /></label>
        </div>
        {campos.itens ? <p className="text-sm text-erro">{campos.itens}</p> : null}
        <p role="alert" className="min-h-6 text-sm text-erro">{erro ?? ""}</p>
        <button type="submit" disabled={pendente} className="inline-flex min-h-12 items-center justify-center rounded-full bg-primario px-8 text-sm font-semibold text-primario-texto shadow-suave disabled:opacity-60">
          {pendente ? "Enviando…" : "Enviar pedido"}
        </button>
        <p className="text-sm text-texto-suave">Pix e cartão são pagos na página segura do Mercado Pago (as peças ficam guardadas por 30 minutos). Se preferir, combine o pagamento pelo WhatsApp.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-borda bg-superficie p-5">
        <h2 className="text-2xl">Seu pedido</h2>
        <ul className="mt-3 divide-y divide-borda text-sm">
          {itens.map((i) => (
            <li key={i.variacaoId} className="flex justify-between gap-3 py-2 [overflow-wrap:anywhere]">
              <span>{i.quantidade}× {i.nome} ({i.tamanho}{i.cor ? `, ${i.cor}` : ""})</span>
              <span>{formatarPreco(i.precoCentavos * i.quantidade)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between gap-3 text-lg"><span>Total</span><strong>{formatarPreco(subtotalCentavos)}</strong></p>
        <p className="mt-3 text-sm"><Link href="/carrinho" className="font-semibold underline">Voltar para a sacola</Link></p>
      </aside>
    </div>
  );
}
