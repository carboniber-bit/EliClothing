import { redirect } from "next/navigation";
import { obterUsuarioAtual, type UsuarioAtual } from "@/lib/auth/usuario";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type ClienteServidor = NonNullable<Awaited<ReturnType<typeof criarClienteServidor>>>;
export type Admin = { supabase: ClienteServidor; usuario: UsuarioAtual };

/** Para ações de formulário: devolve null (em vez de redirecionar) se quem chamou não é administrador. */
export async function obterAdmin(): Promise<Admin | null> {
  const usuario = await obterUsuarioAtual();
  if (!usuario || !usuario.admin) return null;
  const supabase = await criarClienteServidor();
  if (!supabase) return null;
  return { supabase, usuario };
}

/** Para páginas do painel: quem não é administrador sai daqui. */
export async function exigirAdmin(): Promise<Admin> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/entrar?proximo=/admin");
  const admin = await obterAdmin();
  if (!admin) redirect("/admin");
  return admin;
}
