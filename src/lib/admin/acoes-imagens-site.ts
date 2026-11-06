"use server";

import { revalidatePath, updateTag } from "next/cache";
import { caminhoImagemSiteValido, chaveImagemValida } from "@/lib/loja/imagens";
import { obterAdmin } from "./guarda";
import type { ResultadoFoto } from "./acoes-fotos";

const SEM_PERMISSAO: ResultadoFoto = { erro: "Você não tem permissão para fazer isso. Entre de novo com a conta da loja." };
const ERRO_GERAL: ResultadoFoto = { erro: "Não foi possível salvar agora. Tente de novo." };

function atualizar() {
  updateTag("textos");
  revalidatePath("/", "layout");
  revalidatePath("/admin/fotos-inicio");
}

/** Chamada depois que o navegador enviou o arquivo ao Storage: passa a usar essa foto na posição. */
export async function registrarImagemSite(chave: string, caminho: string): Promise<ResultadoFoto> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  if (!caminhoImagemSiteValido(chave, caminho)) return { erro: "Foto inválida." };

  const { data: antiga } = await admin.supabase.from("config_loja").select("valor").eq("chave", chave).maybeSingle();
  const { error } = await admin.supabase.from("config_loja").upsert({ chave, valor: caminho, publico: true }, { onConflict: "chave" });
  if (error) {
    await admin.supabase.storage.from("produtos").remove([caminho]);
    return ERRO_GERAL;
  }
  const anterior = antiga?.valor as string | null | undefined;
  if (anterior && anterior !== caminho && caminhoImagemSiteValido(chave, anterior)) {
    await admin.supabase.storage.from("produtos").remove([anterior]);
  }
  atualizar();
  return {};
}

/** Volta a usar a foto original da loja nessa posição. */
export async function removerImagemSite(chave: string): Promise<ResultadoFoto> {
  const admin = await obterAdmin();
  if (!admin) return SEM_PERMISSAO;
  if (!chaveImagemValida(chave)) return { erro: "Posição inválida." };

  const { data: atual } = await admin.supabase.from("config_loja").select("valor").eq("chave", chave).maybeSingle();
  const { error } = await admin.supabase.from("config_loja").delete().eq("chave", chave);
  if (error) return ERRO_GERAL;
  const caminho = atual?.valor as string | null | undefined;
  if (caminho && caminhoImagemSiteValido(chave, caminho)) {
    await admin.supabase.storage.from("produtos").remove([caminho]);
  }
  atualizar();
  return {};
}
