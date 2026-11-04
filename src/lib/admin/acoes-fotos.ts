"use server";

import { revalidatePath, updateTag } from "next/cache";
import { caminhoFotoValido, reordenar } from "./imagem";
import { obterAdmin } from "./guarda";

export type ResultadoFoto = { erro?: string };

const SEM_PERMISSAO: ResultadoFoto = { erro: "Você não tem permissão para fazer isso. Entre de novo com a conta da loja." };
const ERRO_GERAL: ResultadoFoto = { erro: "Não foi possível salvar agora. Tente de novo." };
const LIMITE_FOTOS = 12;

function atualizar(produtoId: string) {
  updateTag("catalogo");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath(`/admin/produtos/${produtoId}`);
}

/** Chamada depois que o navegador enviou o arquivo ao Storage: grava a foto no produto. */
export async function registrarFoto(produtoId: string, caminho: string): Promise<ResultadoFoto> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  if (!caminhoFotoValido(produtoId, caminho)) return { erro: "Foto inválida." };

  const { count } = await admin.supabase.from("imagens").select("id", { count: "exact", head: true }).eq("produto_id", produtoId);
  const total = count ?? 0;
  if (total >= LIMITE_FOTOS) {
    await admin.supabase.storage.from("produtos").remove([caminho]);
    return { erro: `Cada produto pode ter até ${LIMITE_FOTOS} fotos.` };
  }
  const { error } = await admin.supabase
    .from("imagens")
    .insert({ produto_id: produtoId, caminho, ordem: total, principal: total === 0 });
  if (error) {
    await admin.supabase.storage.from("produtos").remove([caminho]);
    return ERRO_GERAL;
  }
  atualizar(produtoId);
  return {};
}

export async function definirFotoPrincipal(imagemId: string, produtoId: string): Promise<ResultadoFoto> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  // A regra do banco só permite uma principal por produto: tira a atual e põe a nova.
  const { error: e1 } = await admin.supabase.from("imagens").update({ principal: false }).eq("produto_id", produtoId);
  if (e1) return ERRO_GERAL;
  const { error: e2 } = await admin.supabase.from("imagens").update({ principal: true }).eq("id", imagemId).eq("produto_id", produtoId);
  if (e2) return ERRO_GERAL;
  atualizar(produtoId);
  return {};
}

export async function moverFoto(imagemId: string, produtoId: string, direcao: -1 | 1): Promise<ResultadoFoto> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const { data } = await admin.supabase
    .from("imagens")
    .select("id, ordem")
    .eq("produto_id", produtoId)
    .order("ordem")
    .order("criado_em");
  const atuais = (data ?? []) as { id: string; ordem: number }[];
  const novaOrdem = reordenar(atuais.map((f) => f.id), imagemId, direcao);
  const mudancas = novaOrdem.flatMap((id, indice) => (atuais.find((f) => f.id === id)?.ordem === indice ? [] : [{ id, indice }]));
  const resultados = await Promise.all(
    mudancas.map((m) => admin.supabase.from("imagens").update({ ordem: m.indice }).eq("id", m.id).eq("produto_id", produtoId)),
  );
  if (resultados.some((r) => r.error)) return ERRO_GERAL;
  atualizar(produtoId);
  return {};
}

export async function excluirFoto(imagemId: string, produtoId: string): Promise<ResultadoFoto> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  const { data: foto } = await admin.supabase
    .from("imagens")
    .select("caminho, principal")
    .eq("id", imagemId)
    .eq("produto_id", produtoId)
    .maybeSingle();
  if (!foto) return {};
  const { error } = await admin.supabase.from("imagens").delete().eq("id", imagemId);
  if (error) return ERRO_GERAL;
  await admin.supabase.storage.from("produtos").remove([(foto as { caminho: string }).caminho]);

  if ((foto as { principal: boolean }).principal) {
    // A primeira que sobrar vira a principal.
    const { data: resto } = await admin.supabase.from("imagens").select("id").eq("produto_id", produtoId).order("ordem").limit(1);
    const proxima = (resto ?? [])[0] as { id: string } | undefined;
    if (proxima) await admin.supabase.from("imagens").update({ principal: true }).eq("id", proxima.id);
  }
  atualizar(produtoId);
  return {};
}
