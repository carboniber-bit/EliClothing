import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configSupabase } from "./config";

/** Cliente do Supabase para Server Components, Server Actions e rotas. Devolve null se o site ainda não foi configurado. */
export async function criarClienteServidor() {
  const config = configSupabase();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.chave, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) jar.set(name, value, options);
        } catch {
          // Em Server Components não dá para gravar cookies; o proxy renova a sessão.
        }
      },
    },
  });
}
