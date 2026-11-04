"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import type { EstadoForm } from "@/lib/auth/estado";
import { colecaoSchema } from "@/lib/validacao/admin";
import { errosDoZod } from "@/lib/validacao/auth";
import { obterAdmin } from "./guarda";

const SEM_PERMISSAO: EstadoForm = { erro: "Você não tem permissão para fazer isso. Entre de novo com a conta da loja." };
const ERRO_GERAL = "Não foi possível salvar agora. Tente de novo em instantes.";
const UUID = z.uuid();

function textos(dados: FormData): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const [chave, valor] of dados.entries()) if (typeof valor === "string") saida[chave] = valor;
  return saida;
}

function atualizarVitrine() {
  updateTag("catalogo");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/colecoes");
}

export async function criarColecao(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const bruto = textos(dados);
  const r = colecaoSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  const { error } = await admin.supabase
    .from("colecoes")
    .insert({ nome: r.data.nome, slug: r.data.slug, descricao: r.data.descricao, ordem: r.data.ordem, ativo: r.data.ativo });
  if (error) {
    if (error.code === "23505") return { campos: { slug: "Já existe uma coleção com esse endereço." }, valores: bruto };
    return { erro: ERRO_GERAL, valores: bruto };
  }
  atualizarVitrine();
  return { sucesso: "Coleção criada." };
}

export async function atualizarColecao(id: string, _anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  if (!UUID.safeParse(id).success) return { erro: ERRO_GERAL };
  const bruto = textos(dados);
  const r = colecaoSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  const { error } = await admin.supabase
    .from("colecoes")
    .update({ nome: r.data.nome, slug: r.data.slug, descricao: r.data.descricao, ordem: r.data.ordem, ativo: r.data.ativo })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { campos: { slug: "Já existe uma coleção com esse endereço." }, valores: bruto };
    return { erro: ERRO_GERAL, valores: bruto };
  }
  atualizarVitrine();
  return { sucesso: "Salvo.", valores: bruto };
}

export async function excluirColecao(id: string): Promise<void> {
  const admin = await obterAdmin();
  if (!admin || !UUID.safeParse(id).success) return;
  await admin.supabase.from("colecoes").delete().eq("id", id);
  atualizarVitrine();
}

/** Marca em quais coleções o produto aparece (compara com o que já existe e só mexe no que mudou). */
export async function definirColecoesDoProduto(produtoId: string, dados: FormData): Promise<void> {
  const admin = await obterAdmin();
  if (!admin || !UUID.safeParse(produtoId).success) return;
  const desejadas = new Set(
    dados
      .getAll("colecao")
      .filter((v): v is string => typeof v === "string" && UUID.safeParse(v).success),
  );

  const { data: atuais, error } = await admin.supabase.from("produto_colecoes").select("colecao_id").eq("produto_id", produtoId);
  if (error) return;
  const existentes = new Set((atuais ?? []).map((l) => l.colecao_id as string));

  const adicionar = [...desejadas].filter((c) => !existentes.has(c)).map((colecao_id) => ({ produto_id: produtoId, colecao_id }));
  const remover = [...existentes].filter((c) => !desejadas.has(c));

  if (adicionar.length > 0) await admin.supabase.from("produto_colecoes").insert(adicionar);
  if (remover.length > 0) await admin.supabase.from("produto_colecoes").delete().eq("produto_id", produtoId).in("colecao_id", remover);
  atualizarVitrine();
  revalidatePath(`/admin/produtos/${produtoId}`);
}
