import { linkWhatsapp } from "./whatsapp";

/** Textos e contatos que a dona da loja pode editar no painel (guardados em config_loja). */
export const CHAVES_TEXTO = [
  "topo_titulo",
  "topo_subtitulo",
  "sobre_titulo",
  "sobre_texto",
  "instagram_titulo",
  "instagram_texto",
  "instagram_usuario",
  "whatsapp",
] as const;

export type ChaveTexto = (typeof CHAVES_TEXTO)[number];
export type TextosLoja = Record<ChaveTexto, string>;

export const TEXTOS_PADRAO: TextosLoja = {
  topo_titulo: "Vista-se\npara\nimpressionar\n(você mesma).",
  topo_subtitulo: "Moda feminina para mulheres que expressam sua personalidade em cada detalhe.",
  sobre_titulo: "Moda que celebra a mulher que você é.",
  sobre_texto:
    "A EliClothing nasceu em Osasco-SP com um propósito simples: fazer cada mulher se sentir bonita, confiante e do jeito dela. Escolhemos peças femininas, românticas e atuais, pensadas para acompanhar a sua rotina e os seus momentos especiais.\n\nPorque se vestir bem começa por dentro, e a primeira pessoa a se impressionar é você mesma.",
  instagram_titulo: "Siga a EliClothing no Instagram",
  instagram_texto: "Lançamentos, looks e dicas de estilo direto de Osasco-SP. Seja a primeira a ver as peças novas.",
  instagram_usuario: "@eliclothing_",
  whatsapp: "11973029002",
};

export const MAX_LINHAS_TITULO = 4;
export const MAX_LETRAS_LINHA_TITULO = 24;

/** Junta os textos salvos com os padrões: campo vazio ou desconhecido volta ao padrão. */
export function mesclarTextos(salvos: Record<string, string | null | undefined>): TextosLoja {
  const saida = { ...TEXTOS_PADRAO };
  for (const chave of CHAVES_TEXTO) {
    const valor = salvos[chave];
    if (typeof valor === "string" && valor.trim() !== "") saida[chave] = valor.trim();
  }
  return saida;
}

export function linhasDoTitulo(texto: string): string[] {
  return texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "")
    .slice(0, MAX_LINHAS_TITULO);
}

export function paragrafos(texto: string): string[] {
  return texto
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p !== "");
}

/** Quanto reduzir a letra do título para a linha mais comprida caber (1 = tamanho normal). */
export function escalaDoTitulo(linhas: string[]): number {
  const maior = Math.max(0, ...linhas.map((l) => l.length));
  return maior <= 13 ? 1 : Math.max(0.35, Number((13 / maior).toFixed(3)));
}

/** Aceita "@nome", "nome" ou o link do perfil. Devolve "@nome" ou null se for inválido. */
export function normalizarUsuarioInstagram(entrada: string): string | null {
  let v = entrada.trim();
  const link = v.match(/^https?:\/\/(?:www\.)?instagram\.com\/([^/?#]+)/i);
  if (link) v = link[1];
  v = v.replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(v) ? `@${v}` : null;
}

export function urlInstagram(usuario: string): string {
  return `https://www.instagram.com/${usuario.replace(/^@/, "")}/`;
}

/** Devolve só os dígitos (com DDD) se o número for válido, senão null. */
export function normalizarWhatsapp(entrada: string): string | null {
  if (linkWhatsapp(entrada) === null) return null;
  const d = entrada.replace(/\D/g, "");
  return d.length >= 12 ? d.slice(2) : d;
}
