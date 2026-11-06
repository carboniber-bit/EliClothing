import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { configSupabase } from "@/lib/supabase/config";
import { loja } from "./config";
import { CHAVES_IMAGEM, urlImagemSite, type ChaveImagem } from "./imagens";
import { CHAVES_TEXTO, mesclarTextos, normalizarUsuarioInstagram, normalizarWhatsapp, urlInstagram, type TextosLoja } from "./textos";

export type DadosLoja = {
  nome: string;
  cidade: string;
  slogan: string;
  textos: TextosLoja;
  whatsappNumero: string | null;
  instagramUsuario: string;
  instagramUrl: string;
  /** Endereço das fotos enviadas pelo painel (null = usar a foto original). */
  imagens: Record<ChaveImagem, string | null>;
};

/** Monta os dados da loja a partir dos textos salvos (valores inválidos voltam ao padrão). */
export function montarDadosLoja(salvos: Record<string, string | null | undefined>, baseStorage: string | null = null): DadosLoja {
  const textos = mesclarTextos(salvos);
  const usuario = normalizarUsuarioInstagram(textos.instagram_usuario) ?? loja.instagramUsuario;
  const whatsapp = normalizarWhatsapp(textos.whatsapp) ?? loja.whatsappNumero;
  return {
    nome: loja.nome,
    cidade: loja.cidade,
    slogan: loja.slogan,
    textos: { ...textos, instagram_usuario: usuario, whatsapp: whatsapp ?? "" },
    whatsappNumero: whatsapp,
    instagramUsuario: usuario,
    instagramUrl: usuario === loja.instagramUsuario ? loja.instagramUrl : urlInstagram(usuario),
    imagens: Object.fromEntries(CHAVES_IMAGEM.map((c) => [c, urlImagemSite(baseStorage, c, salvos[c])])) as Record<ChaveImagem, string | null>,
  };
}

/** Dados da loja (textos editáveis no painel). Guardados em cache; o painel renova ao salvar. */
export async function obterLoja(): Promise<DadosLoja> {
  "use cache";
  cacheTag("textos");
  cacheLife("minutes");

  const config = configSupabase();
  if (!config) return montarDadosLoja({});
  const supabase = createClient(config.url, config.chave, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.from("config_loja").select("chave, valor").in("chave", [...CHAVES_TEXTO, ...CHAVES_IMAGEM]);
  if (error) {
    console.error("[loja] falha ao ler os textos:", error.code ?? "sem-codigo");
    return montarDadosLoja({});
  }
  const salvos: Record<string, string | null> = {};
  for (const linha of data ?? []) salvos[linha.chave as string] = linha.valor as string | null;
  return montarDadosLoja(salvos, config.url);
}
