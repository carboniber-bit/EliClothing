"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EstadoForm } from "@/lib/auth/estado";
import { ehStatusPedido, ROTULO_STATUS } from "@/lib/pedidos/status";
import { obterAdmin } from "./guarda";

const UUID = z.uuid();

const MENSAGENS: Record<string, string> = {
  pedido_encerrado: "Este pedido já foi encerrado e não pode mais mudar.",
  transicao_invalida: "Essa mudança de situação não é permitida a partir da situação atual.",
  pedido_inexistente: "Pedido não encontrado.",
  sem_permissao: "Você não tem permissão para fazer isso. Entre de novo com a conta da loja.",
};

function traduzir(mensagem: string | undefined): string {
  for (const [codigo, texto] of Object.entries(MENSAGENS)) if (mensagem?.includes(codigo)) return texto;
  return "Não foi possível mudar a situação agora. Tente de novo em instantes.";
}

/** Muda a situação do pedido. Cancelar/expirar devolve o estoque (feito pelo banco). */
export async function alterarStatusPedido(id: string, _anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const admin = await obterAdmin();
  if (!admin) return { erro: MENSAGENS.sem_permissao };
  const novo = dados.get("status");
  if (!UUID.safeParse(id).success || !ehStatusPedido(novo)) return { erro: "Pedido ou situação inválidos." };

  const { error } = await admin.supabase.rpc("alterar_status_pedido", { p_pedido: id, p_status: novo, p_origem: "painel" });
  if (error) return { erro: traduzir(error.message) };
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  return { sucesso: `Situação alterada para “${ROTULO_STATUS[novo]}”.` };
}
