"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import type { ResultadoFoto } from "@/lib/admin/acoes-fotos";
import { TIPOS_FOTO } from "@/lib/admin/imagem";
import { prepararFoto } from "@/lib/admin/preparar-foto";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

type Props = {
  chave: string;
  rotulo: string;
  dica: string;
  /** Foto que a loja mostra agora (a enviada ou a original). */
  urlAtual: string;
  personalizada: boolean;
  registrar: (chave: string, caminho: string) => Promise<ResultadoFoto>;
  remover: (chave: string) => Promise<ResultadoFoto>;
};

const botao =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-primario px-4 text-sm font-semibold transition-colors hover:bg-acento/30 disabled:opacity-60";

export function TrocarFotoSite({ chave, rotulo, dica, urlAtual, personalizada, registrar, remover }: Props) {
  const id = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pendente, iniciar] = useTransition();

  async function aoEscolher(lista: FileList | null) {
    const arquivo = lista?.[0];
    if (!arquivo) return;
    if (!TIPOS_FOTO.includes(arquivo.type)) {
      setMensagem({ tipo: "erro", texto: "Use uma foto JPG, PNG ou WEBP." });
      return;
    }
    const supabase = criarClienteNavegador();
    if (!supabase) {
      setMensagem({ tipo: "erro", texto: "O envio de fotos ainda não está disponível neste ambiente." });
      return;
    }
    setEnviando(true);
    setMensagem({ tipo: "ok", texto: "Enviando foto…" });
    try {
      const blob = await prepararFoto(arquivo);
      const caminho = `site/${chave}-${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("produtos").upload(caminho, blob, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) {
        setMensagem({ tipo: "erro", texto: "Não foi possível enviar a foto. Confira sua conexão e tente de novo." });
      } else {
        const resultado = await registrar(chave, caminho);
        setMensagem(resultado.erro ? { tipo: "erro", texto: resultado.erro } : { tipo: "ok", texto: "Foto trocada. A loja já está atualizada." });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível ler essa foto. Tente outra." });
    }
    setEnviando(false);
    if (entrada.current) entrada.current.value = "";
  }

  return (
    <div className="rounded-2xl border border-borda bg-superficie p-4">
      <h2 className="text-lg font-semibold">{rotulo}</h2>
      <p className="mt-1 text-sm text-texto-suave">{dica}</p>

      <div className="relative mt-3 aspect-[4/3] max-w-xs overflow-hidden rounded-xl bg-fundo">
        <Image src={urlAtual} alt={`Foto atual: ${rotulo}`} fill sizes="320px" className="object-cover" />
      </div>
      <p className="mt-2 text-sm font-semibold">{personalizada ? "Foto enviada por você" : "Foto original da loja"}</p>

      <input ref={entrada} id={id} type="file" accept={TIPOS_FOTO.join(",")} className="sr-only" onChange={(e) => void aoEscolher(e.target.files)} />
      <div className="mt-3 flex flex-wrap gap-2">
        <label htmlFor={id} className={`${botao} bg-primario text-primario-texto hover:bg-primario hover:opacity-90 ${enviando ? "pointer-events-none opacity-60" : ""}`}>
          {enviando ? "Enviando…" : "Trocar foto"}
        </label>
        {personalizada ? (
          <button
            type="button"
            disabled={pendente || enviando}
            className={botao}
            onClick={() => {
              if (!window.confirm("Voltar para a foto original da loja?")) return;
              iniciar(async () => {
                const resultado = await remover(chave);
                setMensagem(resultado.erro ? { tipo: "erro", texto: resultado.erro } : { tipo: "ok", texto: "Voltou para a foto original." });
              });
            }}
          >
            Voltar à foto original
          </button>
        ) : null}
      </div>

      {mensagem ? (
        <p
          role={mensagem.tipo === "erro" ? "alert" : "status"}
          className={`mt-3 rounded-2xl border p-3 text-sm font-semibold ${mensagem.tipo === "erro" ? "border-erro text-erro" : "border-borda bg-fundo"}`}
        >
          {mensagem.texto}
        </p>
      ) : null}
    </div>
  );
}
