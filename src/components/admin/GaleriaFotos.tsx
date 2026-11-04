"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { ResultadoFoto } from "@/lib/admin/acoes-fotos";
import { LADO_MAXIMO, TIPOS_FOTO, calcularTamanho } from "@/lib/admin/imagem";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

export type FotoLista = { id: string; url: string; principal: boolean };

type Props = {
  produtoId: string;
  nomeProduto: string;
  fotos: FotoLista[];
  registrar: (produtoId: string, caminho: string) => Promise<ResultadoFoto>;
  tornarPrincipal: (imagemId: string, produtoId: string) => Promise<ResultadoFoto>;
  mover: (imagemId: string, produtoId: string, direcao: -1 | 1) => Promise<ResultadoFoto>;
  excluir: (imagemId: string, produtoId: string) => Promise<ResultadoFoto>;
};

/** Reduz a foto (celular tira fotos enormes) e converte para JPEG antes de enviar. */
async function prepararFoto(arquivo: File): Promise<Blob> {
  const imagem = await createImageBitmap(arquivo);
  const { largura, altura } = calcularTamanho(imagem.width, imagem.height, LADO_MAXIMO);
  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;
  const contexto = tela.getContext("2d");
  if (!contexto) throw new Error("sem-canvas");
  contexto.fillStyle = "#ffffff"; // PNG com fundo transparente fica sobre branco
  contexto.fillRect(0, 0, largura, altura);
  contexto.drawImage(imagem, 0, 0, largura, altura);
  imagem.close();
  return new Promise((resolver, rejeitar) =>
    tela.toBlob((b) => (b ? resolver(b) : rejeitar(new Error("sem-blob"))), "image/jpeg", 0.85),
  );
}

const botao =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-primario px-4 text-sm font-semibold transition-colors hover:bg-acento/30 disabled:opacity-60";

export function GaleriaFotos({ produtoId, nomeProduto, fotos, registrar, tornarPrincipal, mover, excluir }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pendente, iniciar] = useTransition();

  async function aoEscolher(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    const arquivos = Array.from(lista).slice(0, 8);
    const supabase = criarClienteNavegador();
    if (!supabase) {
      setMensagem({ tipo: "erro", texto: "O envio de fotos ainda não está disponível neste ambiente." });
      return;
    }
    setEnviando(true);
    setMensagem(null);
    let enviadas = 0;
    let erro: string | null = null;
    for (const [indice, arquivo] of arquivos.entries()) {
      setMensagem({ tipo: "ok", texto: `Enviando foto ${indice + 1} de ${arquivos.length}…` });
      if (!TIPOS_FOTO.includes(arquivo.type)) {
        erro = `“${arquivo.name}” não é JPG, PNG ou WEBP.`;
        break;
      }
      try {
        const blob = await prepararFoto(arquivo);
        const caminho = `${produtoId}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from("produtos").upload(caminho, blob, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: false,
        });
        if (error) {
          erro = "Não foi possível enviar a foto. Confira sua conexão e tente de novo.";
          break;
        }
        const resultado = await registrar(produtoId, caminho);
        if (resultado.erro) {
          erro = resultado.erro;
          break;
        }
        enviadas += 1;
      } catch {
        erro = `Não foi possível ler “${arquivo.name}”. Tente outra foto.`;
        break;
      }
    }
    setEnviando(false);
    if (entrada.current) entrada.current.value = "";
    if (erro) setMensagem({ tipo: "erro", texto: enviadas > 0 ? `${enviadas} enviada(s). ${erro}` : erro });
    else setMensagem({ tipo: "ok", texto: enviadas === 1 ? "Foto enviada." : `${enviadas} fotos enviadas.` });
  }

  function executar(acao: () => Promise<ResultadoFoto>) {
    iniciar(async () => {
      const resultado = await acao();
      setMensagem(resultado.erro ? { tipo: "erro", texto: resultado.erro } : null);
    });
  }

  return (
    <div>
      <input
        ref={entrada}
        id="fotos"
        type="file"
        accept={TIPOS_FOTO.join(",")}
        multiple
        className="sr-only"
        onChange={(e) => void aoEscolher(e.target.files)}
      />
      <label
        htmlFor="fotos"
        className={`${botao} cursor-pointer bg-primario text-primario-texto hover:bg-primario hover:opacity-90 ${enviando ? "pointer-events-none opacity-60" : ""}`}
      >
        {enviando ? "Enviando…" : "Adicionar fotos"}
      </label>
      <p className="mt-2 text-sm text-texto-suave">JPG, PNG ou WEBP. As fotos são reduzidas automaticamente.</p>

      {mensagem ? (
        <p
          role={mensagem.tipo === "erro" ? "alert" : "status"}
          className={`mt-3 rounded-2xl border p-3 text-sm font-semibold ${mensagem.tipo === "erro" ? "border-erro text-erro" : "border-borda bg-superficie"}`}
        >
          {mensagem.texto}
        </p>
      ) : null}

      {fotos.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-borda bg-superficie p-4 text-sm">
          Nenhuma foto ainda. A primeira que você enviar vira a foto principal.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4">
          {fotos.map((foto, indice) => (
            <li key={foto.id} className="rounded-2xl border border-borda bg-superficie p-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-fundo">
                <Image src={foto.url} alt={`Foto ${indice + 1} de ${nomeProduto}`} fill sizes="200px" className="object-cover" />
              </div>
              <p className="mt-2 text-sm font-semibold">{foto.principal ? "Foto principal" : `Foto ${indice + 1}`}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {!foto.principal ? (
                  <button type="button" disabled={pendente} className={botao} onClick={() => executar(() => tornarPrincipal(foto.id, produtoId))}>
                    Tornar principal
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pendente || indice === 0}
                  aria-label={`Mover foto ${indice + 1} para antes`}
                  className={botao}
                  onClick={() => executar(() => mover(foto.id, produtoId, -1))}
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={pendente || indice === fotos.length - 1}
                  aria-label={`Mover foto ${indice + 1} para depois`}
                  className={botao}
                  onClick={() => executar(() => mover(foto.id, produtoId, 1))}
                >
                  →
                </button>
                <button
                  type="button"
                  disabled={pendente}
                  className={`${botao} border-erro text-erro`}
                  onClick={() => {
                    if (window.confirm("Excluir esta foto?")) executar(() => excluir(foto.id, produtoId));
                  }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
