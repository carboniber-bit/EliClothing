import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

type Props = { titulo: string; texto: string; acao?: ReactNode; imagem?: StaticImageData };

export function EstadoVazio({ titulo, texto, acao, imagem }: Props) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-borda bg-superficie">
      <div className={imagem ? "grid items-center md:grid-cols-2" : ""}>
        {imagem ? (
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-72">
            <Image src={imagem} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
        <div className="px-6 py-12 text-center md:px-10">
          <p className="font-titulo text-3xl">{titulo}</p>
          <p className="mx-auto mt-3 max-w-md text-texto-suave">{texto}</p>
          {acao ? <div className="mt-6 flex justify-center">{acao}</div> : null}
        </div>
      </div>
    </div>
  );
}
