import { createBrowserClient } from "@supabase/ssr";
import { configSupabase } from "./config";

/** Cliente do Supabase no navegador (usa a sessão de quem está logado). Usado para enviar fotos. */
export function criarClienteNavegador() {
  const config = configSupabase();
  if (!config) return null;
  return createBrowserClient(config.url, config.chave);
}
