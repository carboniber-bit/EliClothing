import { z } from "zod";
import { reaisParaCentavos, slugify } from "@/lib/admin/formatacao";
import {
  MAX_LETRAS_LINHA_TITULO,
  MAX_LINHAS_TITULO,
  linhasDoTitulo,
  normalizarUsuarioInstagram,
  normalizarWhatsapp,
} from "@/lib/loja/textos";

const textoOpcional = (max: number) => z.string().trim().max(max, `No máximo ${max} caracteres.`);

const dinheiro = z
  .string()
  .trim()
  .transform((valor, ctx) => {
    const centavos = reaisParaCentavos(valor);
    if (centavos === null) {
      ctx.addIssue({ code: "custom", message: "Digite um valor válido, como 89,90." });
      return z.NEVER;
    }
    return centavos;
  });

const dinheiroOpcional = z
  .string()
  .trim()
  .transform((valor, ctx) => {
    if (valor === "") return null;
    const centavos = reaisParaCentavos(valor);
    if (centavos === null) {
      ctx.addIssue({ code: "custom", message: "Digite um valor válido, como 69,90, ou deixe em branco." });
      return z.NEVER;
    }
    return centavos;
  });

const marcado = z
  .string()
  .optional()
  .transform((v) => v === "on");

const idOpcional = z.union([z.literal(""), z.uuid("Escolha uma opção válida.")]).transform((v) => (v === "" ? null : v));

export const produtoSchema = z
  .object({
    nome: z.string().trim().min(1, "Digite o nome do produto.").max(160, "No máximo 160 caracteres."),
    slug: textoOpcional(80),
    descricao: textoOpcional(4000),
    preco: dinheiro,
    preco_promocional: dinheiroOpcional,
    categoria_id: idOpcional,
    ativo: marcado,
    destaque: marcado,
    novidade: marcado,
  })
  .superRefine((d, ctx) => {
    if (d.preco_promocional !== null && d.preco_promocional >= d.preco) {
      ctx.addIssue({ code: "custom", path: ["preco_promocional"], message: "O preço promocional precisa ser menor que o preço." });
    }
    if (slugify(String(d.slug || d.nome || "")) === "") {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "Use letras ou números no endereço." });
    }
  })
  .transform((d) => ({ ...d, slug: slugify(d.slug || d.nome) }));

const inteiro = (maximo: number, rotulo: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `${rotulo}: digite um número inteiro, como 5.`)
    .transform(Number)
    .refine((n) => n <= maximo, `${rotulo}: no máximo ${maximo}.`);

export const variacaoSchema = z.object({
  tamanho: z.string().trim().min(1, "Digite o tamanho (P, M, G, 38, Único...).").max(20, "No máximo 20 caracteres."),
  cor: textoOpcional(40),
  estoque: inteiro(100000, "Estoque"),
});

export const estoqueSchema = z.object({
  estoque: inteiro(100000, "Estoque"),
  ativo: marcado,
});

export const categoriaSchema = z
  .object({
    nome: z.string().trim().min(1, "Digite o nome da categoria.").max(80, "No máximo 80 caracteres."),
    slug: textoOpcional(80),
    pai_id: idOpcional,
    ordem: inteiro(10000, "Ordem").or(z.literal("").transform(() => 0)),
    ativo: marcado,
  })
  .superRefine((d, ctx) => {
    if (slugify(String(d.slug || d.nome || "")) === "") {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "Use letras ou números no endereço." });
    }
  })
  .transform((d) => ({ ...d, slug: slugify(d.slug || d.nome) }));

export const colecaoSchema = z
  .object({
    nome: z.string().trim().min(1, "Digite o nome da coleção.").max(80, "No máximo 80 caracteres."),
    slug: textoOpcional(80),
    descricao: textoOpcional(500),
    ordem: inteiro(10000, "Ordem").or(z.literal("").transform(() => 0)),
    ativo: marcado,
  })
  .superRefine((d, ctx) => {
    if (slugify(String(d.slug || d.nome || "")) === "") {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "Use letras ou números no endereço." });
    }
  })
  .transform((d) => ({ ...d, slug: slugify(d.slug || d.nome), descricao: d.descricao === "" ? null : d.descricao }));

// Textarea do navegador envia quebras de linha do Windows (\r\n); aqui viram \n.
const textoLivre = (max: number) => z.string().transform((v) => v.replace(/\r\n/g, "\n").trim()).pipe(z.string().max(max, `No máximo ${max} caracteres.`));

export const textosLojaSchema = z.object({
  topo_titulo: textoLivre(200).superRefine((v, ctx) => {
    const linhas = v.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
    if (linhas.length > MAX_LINHAS_TITULO) ctx.addIssue({ code: "custom", message: `Use no máximo ${MAX_LINHAS_TITULO} linhas.` });
    if (linhas.some((l) => l.length > MAX_LETRAS_LINHA_TITULO)) {
      ctx.addIssue({ code: "custom", message: `Cada linha pode ter até ${MAX_LETRAS_LINHA_TITULO} letras.` });
    }
  }).transform((v) => linhasDoTitulo(v).join("\n")),
  topo_subtitulo: textoLivre(200),
  sobre_titulo: textoLivre(120),
  sobre_texto: textoLivre(1200),
  instagram_titulo: textoLivre(100),
  instagram_texto: textoLivre(300),
  instagram_usuario: z.string().trim().transform((v, ctx) => {
    if (v === "") return "";
    const usuario = normalizarUsuarioInstagram(v);
    if (!usuario) {
      ctx.addIssue({ code: "custom", message: "Use só letras, números, ponto e _. Exemplo: @eliclothing_" });
      return z.NEVER;
    }
    return usuario;
  }),
  whatsapp: z.string().trim().transform((v, ctx) => {
    if (v === "") return "";
    const numero = normalizarWhatsapp(v);
    if (!numero) {
      ctx.addIssue({ code: "custom", message: "Digite o número com DDD. Exemplo: (11) 97302-9002" });
      return z.NEVER;
    }
    return numero;
  }),
});
