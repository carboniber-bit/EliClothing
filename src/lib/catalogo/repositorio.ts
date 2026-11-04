import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { configSupabase } from "@/lib/supabase/config";
import { mapearProduto, type LinhaProduto } from "./mapeamento";
import type { Produto } from "./produto";

export interface RepositorioCatalogo {
  listarProdutos(): Promise<Produto[]>;
  listarNovidades(limite: number): Promise<Produto[]>;
}

const COLUNAS =
  "id, slug, nome, preco_centavos, preco_promocional_centavos, novidade, destaque, imagens(caminho, principal, ordem), variacoes(id, tamanho, cor, estoque)";

/**
 * Lê a vitrine direto do banco com a chave pública: quem protege o que é visível é a RLS
 * (só produtos ativos, só variações ativas). O resultado fica em cache e o painel o renova
 * ao salvar (tag "catalogo").
 */
async function buscarProdutos(limite: number | null, novidadesPrimeiro: boolean): Promise<Produto[]> {
  "use cache";
  cacheTag("catalogo");
  cacheLife("minutes");

  const config = configSupabase();
  if (!config) return [];
  const supabase = createClient(config.url, config.chave, { auth: { persistSession: false, autoRefreshToken: false } });

  let consulta = supabase.from("produtos").select(COLUNAS);
  if (novidadesPrimeiro) consulta = consulta.order("novidade", { ascending: false });
  consulta = consulta.order("criado_em", { ascending: false });
  if (limite !== null) consulta = consulta.limit(limite);

  const { data, error } = await consulta;
  if (error) {
    console.error("[catalogo] falha ao ler produtos:", error.code ?? "sem-codigo");
    return [];
  }
  return ((data ?? []) as unknown as LinhaProduto[]).map((linha) => mapearProduto(linha, config.url));
}

const repositorioSupabase: RepositorioCatalogo = {
  listarProdutos: () => buscarProdutos(null, false),
  // Marcados como novidade primeiro; se faltar, completa com os mais recentes.
  listarNovidades: (limite) => buscarProdutos(limite, true),
};

const repositorioVazio: RepositorioCatalogo = {
  async listarProdutos() {
    return [];
  },
  async listarNovidades() {
    return [];
  },
};

/** Único ponto de troca do catálogo: banco quando configurado, vazio caso contrário. */
export function obterRepositorio(): RepositorioCatalogo {
  return configSupabase() ? repositorioSupabase : repositorioVazio;
}
