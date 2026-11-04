import { criarClienteServidor } from "@/lib/supabase/servidor";

export type UsuarioAtual = { id: string; email: string; nome: string | null; admin: boolean };

/** Quem está logado agora (validado no Supabase) ou null. É a única porta de leitura do usuário. */
export async function obterUsuarioAtual(): Promise<UsuarioAtual | null> {
  const supabase = await criarClienteServidor();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: perfil } = await supabase.from("perfis").select("nome, role").eq("id", data.user.id).maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    nome: perfil?.nome ?? null,
    admin: perfil?.role === "admin",
  };
}

export type ResumoUsuario = { email: string; nome: string | null };

/** Só para mostrar "quem está logado" no cabeçalho: não consulta o banco, apenas valida a sessão. */
export async function obterResumoUsuario(): Promise<ResumoUsuario | null> {
  const supabase = await criarClienteServidor();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const nome = data.user.user_metadata?.nome;
  return { email: data.user.email ?? "", nome: typeof nome === "string" && nome.trim() ? nome.trim() : null };
}
