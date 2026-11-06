import { createClient } from "@supabase/supabase-js";
import { configSupabase } from "./config";

/**
 * Cliente com a chave SECRETA (service_role): ignora as regras de acesso do banco.
 * Use SOMENTE em ações/rotas do servidor e nunca importe este arquivo em componentes "use client"
 * (um teste automático confere isso). A chave vem de SUPABASE_SERVICE_ROLE_KEY, sem NEXT_PUBLIC_.
 */
export function criarClienteServico() {
  const config = configSupabase();
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !chave) return null;
  return createClient(config.url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
