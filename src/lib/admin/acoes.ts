"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoForm } from "@/lib/auth/estado";
import { categoriaSchema, estoqueSchema, produtoSchema, variacaoSchema } from "@/lib/validacao/admin";
import { errosDoZod } from "@/lib/validacao/auth";
import { obterAdmin } from "./guarda";

const SEM_PERMISSAO: EstadoForm = { erro: "Você não tem permissão para fazer isso. Entre de novo com a conta da loja." };
const ERRO_GERAL = "Não foi possível salvar agora. Tente de novo em instantes.";

function textos(dados: FormData): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const [chave, valor] of dados.entries()) if (typeof valor === "string") saida[chave] = valor;
  return saida;
}

function atualizarVitrine() {
  revalidatePath("/");
  revalidatePath("/catalogo");
}

function eEnderecoRepetido(erro: { code?: string }) {
  return erro.code === "23505";
}

// ---------- produtos ----------
export async function criarProduto(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const bruto = textos(dados);
  const r = produtoSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  const { data, error } = await admin.supabase
    .from("produtos")
    .insert({
      nome: r.data.nome,
      slug: r.data.slug,
      descricao: r.data.descricao || null,
      preco_centavos: r.data.preco,
      preco_promocional_centavos: r.data.preco_promocional,
      categoria_id: r.data.categoria_id,
      ativo: r.data.ativo,
      destaque: r.data.destaque,
      novidade: r.data.novidade,
    })
    .select("id")
    .single();
  if (error || !data) {
    if (error && eEnderecoRepetido(error)) {
      return { campos: { slug: "Já existe um produto com esse endereço. Mude o nome ou o endereço." }, valores: bruto };
    }
    return { erro: ERRO_GERAL, valores: bruto };
  }
  atualizarVitrine();
  redirect(`/admin/produtos/${data.id}?novo=1`);
}

export async function atualizarProduto(id: string, _anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const bruto = textos(dados);
  const r = produtoSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  const { error } = await admin.supabase
    .from("produtos")
    .update({
      nome: r.data.nome,
      slug: r.data.slug,
      descricao: r.data.descricao || null,
      preco_centavos: r.data.preco,
      preco_promocional_centavos: r.data.preco_promocional,
      categoria_id: r.data.categoria_id,
      ativo: r.data.ativo,
      destaque: r.data.destaque,
      novidade: r.data.novidade,
    })
    .eq("id", id);
  if (error) {
    if (eEnderecoRepetido(error)) {
      return { campos: { slug: "Já existe um produto com esse endereço. Mude o nome ou o endereço." }, valores: bruto };
    }
    return { erro: ERRO_GERAL, valores: bruto };
  }
  atualizarVitrine();
  revalidatePath("/admin/produtos");
  return { sucesso: "Produto salvo.", valores: bruto };
}

export async function alternarAtivoProduto(id: string, ativoAtual: boolean): Promise<void> {
  const admin = await obterAdmin();
  if (!admin) return;
  await admin.supabase.from("produtos").update({ ativo: !ativoAtual }).eq("id", id);
  atualizarVitrine();
  revalidatePath("/admin/produtos");
}

export async function excluirProduto(id: string): Promise<void> {
  const admin = await obterAdmin();
  if (!admin) return;
  const { error } = await admin.supabase.from("produtos").delete().eq("id", id);
  if (error) return;
  atualizarVitrine();
  redirect("/admin/produtos");
}

// ---------- variações (tamanho/cor/estoque) ----------
export async function criarVariacao(produtoId: string, _anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const bruto = textos(dados);
  const r = variacaoSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  const { error } = await admin.supabase
    .from("variacoes")
    .insert({ produto_id: produtoId, tamanho: r.data.tamanho, cor: r.data.cor, estoque: r.data.estoque });
  if (error) {
    if (eEnderecoRepetido(error)) {
      return { campos: { tamanho: "Esse tamanho com essa cor já existe neste produto." }, valores: bruto };
    }
    return { erro: ERRO_GERAL, valores: bruto };
  }
  atualizarVitrine();
  revalidatePath(`/admin/produtos/${produtoId}`);
  return { sucesso: "Variação adicionada." };
}

export async function atualizarVariacao(variacaoId: string, produtoId: string, _anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const bruto = textos(dados);
  const r = estoqueSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  const { error } = await admin.supabase
    .from("variacoes")
    .update({ estoque: r.data.estoque, ativo: r.data.ativo })
    .eq("id", variacaoId);
  if (error) return { erro: ERRO_GERAL, valores: bruto };
  atualizarVitrine();
  revalidatePath(`/admin/produtos/${produtoId}`);
  return { sucesso: "Salvo.", valores: bruto };
}

export async function excluirVariacao(variacaoId: string, produtoId: string): Promise<void> {
  const admin = await obterAdmin();
  if (!admin) return;
  await admin.supabase.from("variacoes").delete().eq("id", variacaoId);
  atualizarVitrine();
  revalidatePath(`/admin/produtos/${produtoId}`);
}

// ---------- categorias ----------
export async function criarCategoria(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const bruto = textos(dados);
  const r = categoriaSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  const { error } = await admin.supabase
    .from("categorias")
    .insert({ nome: r.data.nome, slug: r.data.slug, pai_id: r.data.pai_id, ordem: r.data.ordem, ativo: r.data.ativo });
  if (error) {
    if (eEnderecoRepetido(error)) {
      return { campos: { slug: "Já existe uma categoria com esse endereço." }, valores: bruto };
    }
    return { erro: ERRO_GERAL, valores: bruto };
  }
  atualizarVitrine();
  revalidatePath("/admin/categorias");
  return { sucesso: "Categoria criada." };
}

export async function atualizarCategoria(id: string, _anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const bruto = textos(dados);
  const r = categoriaSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };
  if (r.data.pai_id === id) {
    return { campos: { pai_id: "Uma categoria não pode ser filha dela mesma." }, valores: bruto };
  }

  const { error } = await admin.supabase
    .from("categorias")
    .update({ nome: r.data.nome, slug: r.data.slug, pai_id: r.data.pai_id, ordem: r.data.ordem, ativo: r.data.ativo })
    .eq("id", id);
  if (error) {
    if (eEnderecoRepetido(error)) {
      return { campos: { slug: "Já existe uma categoria com esse endereço." }, valores: bruto };
    }
    return { erro: ERRO_GERAL, valores: bruto };
  }
  atualizarVitrine();
  revalidatePath("/admin/categorias");
  return { sucesso: "Salvo.", valores: bruto };
}

export async function excluirCategoria(id: string): Promise<void> {
  const admin = await obterAdmin();
  if (!admin) return;
  await admin.supabase.from("categorias").delete().eq("id", id);
  atualizarVitrine();
  revalidatePath("/admin/categorias");
}
