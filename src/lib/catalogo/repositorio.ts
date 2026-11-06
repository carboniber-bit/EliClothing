import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { configSupabase } from "@/lib/supabase/config";
import { mapearProduto, urlFoto, type LinhaProduto } from "./mapeamento";
import type { Produto, ProdutoDetalhe } from "./produto";

export type Colecao = { id: string; slug: string; nome: string; descricao: string | null };

export interface RepositorioCatalogo {
  listarProdutos(): Promise<Produto[]>;
  listarNovidades(limite: number): Promise<Produto[]>;
  listarColecoes(): Promise<Colecao[]>;
  obterProduto(slug: string): Promise<ProdutoDetalhe | null>;
  obterColecao(slug: string): Promise<{ colecao: Colecao; produtos: Produto[] } | null>;
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

function clientePublico() {
  const config = configSupabase();
  if (!config) return null;
  return { config, supabase: createClient(config.url, config.chave, { auth: { persistSession: false, autoRefreshToken: false } }) };
}

async function buscarColecoes(): Promise<Colecao[]> {
  "use cache";
  cacheTag("catalogo");
  cacheLife("minutes");
  const cliente = clientePublico();
  if (!cliente) return [];
  const { data, error } = await cliente.supabase.from("colecoes").select("id, slug, nome, descricao").order("ordem").order("nome");
  if (error) {
    console.error("[catalogo] falha ao ler coleções:", error.code ?? "sem-codigo");
    return [];
  }
  return (data ?? []) as Colecao[];
}

async function buscarColecao(slug: string): Promise<{ colecao: Colecao; produtos: Produto[] } | null> {
  "use cache";
  cacheTag("catalogo");
  cacheLife("minutes");
  const cliente = clientePublico();
  if (!cliente || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const { supabase, config } = cliente;

  const { data: colecao } = await supabase.from("colecoes").select("id, slug, nome, descricao").eq("slug", slug).maybeSingle();
  if (!colecao) return null;
  const { data: ligacoes } = await supabase.from("produto_colecoes").select("produto_id").eq("colecao_id", colecao.id);
  const ids = (ligacoes ?? []).map((l) => l.produto_id as string);
  if (ids.length === 0) return { colecao: colecao as Colecao, produtos: [] };

  const { data: linhas, error } = await supabase.from("produtos").select(COLUNAS).in("id", ids).order("criado_em", { ascending: false });
  if (error) {
    console.error("[catalogo] falha ao ler produtos da coleção:", error.code ?? "sem-codigo");
    return { colecao: colecao as Colecao, produtos: [] };
  }
  const produtos = ((linhas ?? []) as unknown as LinhaProduto[]).map((l) => mapearProduto(l, config.url));
  return { colecao: colecao as Colecao, produtos };
}

async function buscarProduto(slug: string): Promise<ProdutoDetalhe | null> {
  "use cache";
  cacheTag("catalogo");
  cacheLife("minutes");
  const cliente = clientePublico();
  if (!cliente || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const { data, error } = await cliente.supabase.from("produtos").select(`${COLUNAS}, descricao`).eq("slug", slug).maybeSingle();
  if (error || !data) {
    if (error) console.error("[catalogo] falha ao ler produto:", error.code ?? "sem-codigo");
    return null;
  }
  const linha = data as unknown as LinhaProduto & { descricao: string | null };
  const produto = mapearProduto(linha, cliente.config.url);
  const fotos = [...(linha.imagens ?? [])]
    .sort((a, b) => Number(b.principal) - Number(a.principal) || a.ordem - b.ordem)
    .map((i) => urlFoto(cliente.config.url, i.caminho));
  return { ...produto, descricao: linha.descricao, fotos };
}

const repositorioSupabase: RepositorioCatalogo = {
  obterProduto: (slug) => buscarProduto(slug),
  listarColecoes: () => buscarColecoes(),
  obterColecao: (slug) => buscarColecao(slug),
  listarProdutos: () => buscarProdutos(null, false),
  // Marcados como novidade primeiro; se faltar, completa com os mais recentes.
  listarNovidades: (limite) => buscarProdutos(limite, true),
};

const repositorioVazio: RepositorioCatalogo = {
  async obterProduto() {
    return null;
  },
  async listarColecoes() {
    return [];
  },
  async obterColecao() {
    return null;
  },
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
