import { urlFoto } from "@/lib/catalogo/mapeamento";

/** Fotos da página inicial que a dona da loja pode trocar pelo painel. */
export const SLOTS_IMAGEM = [
  { chave: "imagem_topo", rotulo: "Foto do topo da página inicial", dica: "Foto em pé (retrato). Aparece dentro de um arco." },
  { chave: "imagem_sobre", rotulo: "Foto grande de “Sobre a marca”", dica: "Foto em pé (retrato)." },
  { chave: "imagem_sobre_detalhe", rotulo: "Foto pequena de “Sobre a marca”", dica: "É cortada em quadrado; deixe o assunto no centro." },
  { chave: "imagem_instagram_1", rotulo: "Instagram: foto 1", dica: "É cortada em quadrado; deixe o assunto no centro." },
  { chave: "imagem_instagram_2", rotulo: "Instagram: foto 2", dica: "É cortada em quadrado; deixe o assunto no centro." },
  { chave: "imagem_instagram_3", rotulo: "Instagram: foto 3", dica: "É cortada em quadrado; deixe o assunto no centro." },
  { chave: "imagem_instagram_4", rotulo: "Instagram: foto 4", dica: "É cortada em quadrado; deixe o assunto no centro." },
] as const;

export type ChaveImagem = (typeof SLOTS_IMAGEM)[number]["chave"];
export const CHAVES_IMAGEM: ChaveImagem[] = SLOTS_IMAGEM.map((s) => s.chave);

export function chaveImagemValida(chave: string): chave is ChaveImagem {
  return (CHAVES_IMAGEM as string[]).includes(chave);
}

/** O arquivo da foto do site fica na pasta "site/", com o nome da posição e um código único. */
export function caminhoImagemSiteValido(chave: string, caminho: string): boolean {
  return (
    chaveImagemValida(chave) &&
    new RegExp(`^site/${chave}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.jpg$`, "i").test(caminho)
  );
}

/** Endereço público da foto salva, ou null (usa a foto original) se não houver ou for inválida. */
export function urlImagemSite(base: string | null, chave: string, caminho: string | null | undefined): string | null {
  if (!base || !caminho || !caminhoImagemSiteValido(chave, caminho)) return null;
  return urlFoto(base, caminho);
}
