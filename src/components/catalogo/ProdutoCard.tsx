import Image from "next/image";
import { formatarPreco, precoFinal, temEstoque, type Produto } from "@/lib/catalogo/produto";

// Nesta etapa o cartão não é um link: a página do produto só existe na Etapa 5a.
export function ProdutoCard({ produto }: { produto: Produto }) {
  const final = precoFinal(produto);
  const emPromocao = final < produto.precoCentavos;
  const disponivel = temEstoque(produto);

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-borda bg-superficie">
      <div className="relative aspect-[3/4] bg-fundo">
        {produto.imagemPrincipalUrl ? (
          <Image
            src={produto.imagemPrincipalUrl}
            alt={produto.nome}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            data-testid="produto-sem-imagem"
            aria-hidden="true"
            className="flex h-full items-center justify-center font-titulo text-4xl text-texto-suave"
          >
            ELI
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 break-words font-sans text-sm font-semibold">{produto.nome}</h3>
        <p className="text-sm">
          {emPromocao ? (
            <>
              <span className="sr-only">
                de {formatarPreco(produto.precoCentavos)} por {formatarPreco(final)}
              </span>
              <s aria-hidden="true" className="mr-2 text-texto-suave">
                {formatarPreco(produto.precoCentavos)}
              </s>
              <span aria-hidden="true" className="font-semibold">
                {formatarPreco(final)}
              </span>
            </>
          ) : (
            <span className="font-semibold">{formatarPreco(final)}</span>
          )}
        </p>
        {!disponivel ? <p className="text-xs font-semibold text-texto-suave">Indisponível</p> : null}
      </div>
    </article>
  );
}
