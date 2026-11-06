"use server";

import { revalidatePath, updateTag } from "next/cache";
import type { EstadoForm } from "@/lib/auth/estado";
import { CHAVES_TEXTO } from "@/lib/loja/textos";
import { textosLojaSchema } from "@/lib/validacao/admin";
import { errosDoZod } from "@/lib/validacao/auth";
import { obterAdmin } from "./guarda";

export async function salvarTextosLoja(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return { erro: "Você não tem permissão para fazer isso. Entre de novo com a conta da loja." };

  const bruto: Record<string, string> = {};
  for (const chave of CHAVES_TEXTO) {
    const v = dados.get(chave);
    bruto[chave] = typeof v === "string" ? v : "";
  }
  const r = textosLojaSchema.safeParse(bruto);
  if (!r.success) return { campos: errosDoZod(r.error), valores: bruto };

  // Campo preenchido grava; campo vazio apaga (a loja volta a usar o texto padrão).
  const gravar = CHAVES_TEXTO.filter((c) => r.data[c] !== "").map((chave) => ({ chave, valor: r.data[chave], publico: true }));
  const apagar = CHAVES_TEXTO.filter((c) => r.data[c] === "");

  if (gravar.length > 0) {
    const { error } = await admin.supabase.from("config_loja").upsert(gravar, { onConflict: "chave" });
    if (error) return { erro: "Não foi possível salvar agora. Tente de novo em instantes.", valores: bruto };
  }
  if (apagar.length > 0) {
    const { error } = await admin.supabase.from("config_loja").delete().in("chave", apagar);
    if (error) return { erro: "Não foi possível salvar agora. Tente de novo em instantes.", valores: bruto };
  }

  updateTag("textos");
  revalidatePath("/", "layout");
  return { sucesso: "Textos salvos. A loja já está atualizada.", valores: r.data };
}
