import Image from "next/image";
import { formatarPreco, poucasUnidades, precoFinal, temEstoque, type Produto } from "@/lib/catalogo/produto";

// Nesta etapa o cartão não é um link: a página do produto só existe na Etapa 5a.
export function ProdutoCard({ produto }: { produto: Produto }) {
  const final = precoFinal(produto);
  const emPromocao = final < produto.precoCentavos;
  const desconto = emPromocao ? Math.round(((produto.precoCentavos - final) / produto.precoCentavos) * 100) : 0;
  const disponivel = temEstoque(produto);
  const poucas = poucasUnidades(produto);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-superficie shadow-suave transition-[box-shadow,transform] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-elevada">
        {produto.imagemPrincipalUrl ? (
          <Image
            src={produto.imagemPrincipalUrl}
            alt={produto.nome}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div
            data-testid="produto-sem-imagem"
            aria-hidden="true"
            className="flex h-full flex-col items-center justify-center text-texto-suave"
          >
            <span className="font-titulo text-5xl tracking-[0.08em]">ELI</span>
            <span className="text-[0.55rem] font-bold tracking-[0.5em]">CLOTHING</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {produto.novidade ? (
            <span className="rounded-full bg-fundo px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-texto">Novidade</span>
          ) : null}
          {desconto > 0 ? (
            <span className="rounded-full bg-acento px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#6b1f2e]">
              −{desconto}%
            </span>
          ) : null}
        </div>

        {poucas ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-acento px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#6b1f2e]">
            Poucas unidades
          </span>
        ) : null}

        {!disponivel ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-fundo px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-texto">
            Indisponível
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-1 px-1">
        <h3 className="line-clamp-2 break-words font-sans text-sm font-semibold leading-snug md:text-[0.95rem]">{produto.nome}</h3>
        <p className="text-sm">
          {emPromocao ? (
            <>
              <span className="sr-only">
                de {formatarPreco(produto.precoCentavos)} por {formatarPreco(final)}
              </span>
              <s aria-hidden="true" className="mr-2 text-texto-suave">
                {formatarPreco(produto.precoCentavos)}
              </s>
              <span aria-hidden="true" className="font-titulo text-base font-semibold">
                {formatarPreco(final)}
              </span>
            </>
          ) : (
            <span className="font-titulo text-base font-semibold">{formatarPreco(final)}</span>
          )}
        </p>
      </div>
    </article>
  );
}
