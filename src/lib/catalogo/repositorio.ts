import type { Produto } from "./produto";

export interface RepositorioCatalogo {
  listarProdutos(): Promise<Produto[]>;
  listarNovidades(limite: number): Promise<Produto[]>;
}

/** Enquanto não há banco de dados (Etapa 3) nem produtos cadastrados, o catálogo é vazio. */
const repositorioVazio: RepositorioCatalogo = {
  async listarProdutos() {
    return [];
  },
  async listarNovidades() {
    return [];
  },
};

/** Único ponto de troca: a Etapa 5a devolve aqui o repositório ligado ao Supabase. */
export function obterRepositorio(): RepositorioCatalogo {
  return repositorioVazio;
}
