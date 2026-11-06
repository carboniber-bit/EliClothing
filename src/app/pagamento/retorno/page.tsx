import type { Metadata } from "next";
import { Suspense } from "react";
import { Botao } from "@/components/ui/Botao";

export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };

const TEXTOS: Record<string, { titulo: string; texto: string }> = {
  sucesso: { titulo: "Pagamento aprovado!", texto: "Recebemos o seu pagamento. Em instantes o pedido aparece como pago para a nossa equipe e entramos em contato para combinar a entrega." },
  pendente: { titulo: "Pagamento em análise", texto: "Assim que o pagamento for confirmado, avisamos a nossa equipe. Se você gerou um Pix, pague dentro do prazo mostrado na tela." },
  falha: { titulo: "Pagamento não concluído", texto: "O pagamento não foi concluído. Suas peças ficam guardadas por 30 minutos: volte à sacola e tente de novo, ou fale com a gente pelo WhatsApp." },
};

async function Conteudo({ buscas }: { buscas: PageProps<"/pagamento/retorno">["searchParams"] }) {
  const { status } = await buscas;
  const chave = typeof status === "string" && status in TEXTOS ? status : "pendente";
  const t = TEXTOS[chave];
  return (
    <>
      <h1 className="text-4xl md:text-5xl">{t.titulo}</h1>
      <p className="mt-4 max-w-xl text-texto-suave">{t.texto}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Botao href="/catalogo">Continuar comprando</Botao>
        {chave === "falha" ? <Botao href="/carrinho" variante="secundario">Voltar à sacola</Botao> : null}
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
