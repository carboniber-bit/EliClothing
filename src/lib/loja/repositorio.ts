import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { configSupabase } from "@/lib/supabase/config";
import { loja } from "./config";
import { CHAVES_TEXTO, mesclarTextos, normalizarUsuarioInstagram, normalizarWhatsapp, urlInstagram, type TextosLoja } from "./textos";

export type DadosLoja = {
  nome: string;
  cidade: string;
  slogan: string;
  textos: TextosLoja;
  whatsappNumero: string | null;
  instagramUsuario: string;
  instagramUrl: string;
};

/** Monta os dados da loja a partir dos textos salvos (valores inválidos voltam ao padrão). */
export function montarDadosLoja(salvos: Record<string, string | null | undefined>): DadosLoja {
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
  const { data, error } = await supabase.from("config_loja").select("chave, valor").in("chave", [...CHAVES_TEXTO]);
  if (error) {
    console.error("[loja] falha ao ler os textos:", error.code ?? "sem-codigo");
    return montarDadosLoja({});
  }
  const salvos: Record<string, string | null> = {};
  for (const linha of data ?? []) salvos[linha.chave as string] = linha.valor as string | null;
  return montarDadosLoja(salvos);
}
