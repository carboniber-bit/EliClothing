/** Chaves PÚBLICAS do Supabase (URL e chave "anon"/"publishable"). Nunca coloque a chave de serviço aqui. */
export function configSupabase(): { url: string; chave: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return null;
  return { url, chave };
}
