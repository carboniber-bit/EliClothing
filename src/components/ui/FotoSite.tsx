import Image from "next/image";
import { PADROES_IMAGEM } from "@/lib/loja/imagens-padrao";
import type { ChaveImagem } from "@/lib/loja/imagens";

/** Foto da página inicial: a enviada pelo painel ou, se não houver, a original da loja. O pai precisa ser `relative` e ter proporção definida. */
export function FotoSite({
  chave,
  url,
  alt,
  sizes,
  className,
  priority,
}: {
  chave: ChaveImagem;
  url: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return <Image src={url ?? PADROES_IMAGEM[chave]} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}
