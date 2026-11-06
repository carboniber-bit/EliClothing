import type { CampoAdmin } from "./FormularioAdmin";

export type CategoriaOpcao = { id: string; nome: string };

export function camposProduto(categorias: CategoriaOpcao[]): CampoAdmin[] {
  return [
    { nome: "nome", rotulo: "Nome do produto", tipo: "texto" },
    { nome: "preco", rotulo: "Preço (R$)", tipo: "dinheiro", dica: "Exemplo: 89,90" },
    { nome: "preco_promocional", rotulo: "Preço promocional (R$)", tipo: "dinheiro", dica: "Deixe em branco se não estiver em promoção." },
    {
      nome: "categoria_id",
      rotulo: "Categoria",
      tipo: "select",
      opcoes: [{ valor: "", rotulo: "Sem categoria" }, ...categorias.map((c) => ({ valor: c.id, rotulo: c.nome }))],
    },
    { nome: "descricao", rotulo: "Descrição", tipo: "area" },
    { nome: "slug", rotulo: "Endereço na loja (opcional)", tipo: "texto", dica: "Se deixar em branco, é criado a partir do nome." },
    { nome: "ativo", rotulo: "Aparece na loja", tipo: "checkbox" },
    { nome: "novidade", rotulo: "Marcar como novidade", tipo: "checkbox" },
    { nome: "destaque", rotulo: "Marcar como destaque", tipo: "checkbox" },
  ];
}

export function camposCategoria(outras: CategoriaOpcao[]): CampoAdmin[] {
  return [
    { nome: "nome", rotulo: "Nome", tipo: "texto" },
    {
      nome: "pai_id",
      rotulo: "Dentro de",
      tipo: "select",
      opcoes: [{ valor: "", rotulo: "Nenhuma (categoria principal)" }, ...outras.map((c) => ({ valor: c.id, rotulo: c.nome }))],
    },
    { nome: "ordem", rotulo: "Ordem", tipo: "inteiro", dica: "Menor número aparece primeiro." },
    { nome: "slug", rotulo: "Endereço (opcional)", tipo: "texto" },
    { nome: "ativo", rotulo: "Aparece na loja", tipo: "checkbox" },
  ];
}

export const camposNovaVariacao: CampoAdmin[] = [
  { nome: "tamanho", rotulo: "Tamanho", tipo: "texto", dica: "Um tamanho (M, 38, Único...) ou vários separados por vírgula: P, M, G. Cada tamanho vira uma caixa na loja." },
  { nome: "cor", rotulo: "Cor (opcional)", tipo: "texto", dica: "Uma cor ou várias separadas por vírgula: Branco, Preto. Cada cor vira uma caixa na loja." },
  { nome: "estoque", rotulo: "Quantidade em estoque", tipo: "inteiro" },
];

export const camposEstoque: CampoAdmin[] = [
  { nome: "estoque", rotulo: "Estoque", tipo: "inteiro" },
  { nome: "ativo", rotulo: "Disponível", tipo: "checkbox" },
];

export const camposColecao: CampoAdmin[] = [
  { nome: "nome", rotulo: "Nome", tipo: "texto", dica: "Exemplo: Verão 2027, Festa, Básicos." },
  { nome: "descricao", rotulo: "Descrição (opcional)", tipo: "area" },
  { nome: "ordem", rotulo: "Ordem", tipo: "inteiro", dica: "Menor número aparece primeiro." },
  { nome: "slug", rotulo: "Endereço (opcional)", tipo: "texto" },
  { nome: "ativo", rotulo: "Aparece na loja", tipo: "checkbox" },
];
