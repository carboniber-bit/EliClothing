import { LADO_MAXIMO, calcularTamanho } from "./imagem";

/** Reduz a foto (celular tira fotos enormes) e converte para JPEG antes de enviar. */
export async function prepararFoto(arquivo: File): Promise<Blob> {
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
