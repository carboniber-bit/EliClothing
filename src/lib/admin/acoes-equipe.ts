"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EstadoForm } from "@/lib/auth/estado";
import { obterAdmin } from "./guarda";

const UUID = z.uuid();

/** Promove uma cliente a administradora ou volta para cliente. O banco impede remover o próprio acesso. */
export async function definirPapel(id: string, papel: "admin" | "cliente"): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return { erro: "Você não tem permissão para fazer isso." };
  if (!UUID.safeParse(id).success || (papel !== "admin" && papel !== "cliente")) return { erro: "Dados inválidos." };
  if (id === admin.usuario.id && papel !== "admin") return { erro: "Você não pode remover o seu próprio acesso." };

  const { error } = await admin.supabase.rpc("definir_papel", { p_usuario: id, p_role: papel });
  if (error) return { erro: "Não foi possível alterar agora. Tente de novo em instantes." };
  revalidatePath("/admin/equipe");
  return { sucesso: papel === "admin" ? "Agora é administradora." : "Voltou a ser cliente." };
}
