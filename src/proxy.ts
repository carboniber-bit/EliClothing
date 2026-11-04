import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configSupabase } from "@/lib/supabase/config";

// Roda em todas as páginas (não em arquivos estáticos) para renovar a sessão de quem está logado e
// gravar os cookies novos. Sem cookie de login não faz nenhuma chamada de rede.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};

export async function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;
  const exigeLogin = caminho.startsWith("/conta") || caminho.startsWith("/admin");
  let resposta = NextResponse.next({ request });
  let logado = false;

  const supabaseConfig = configSupabase();
  const temSessao = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (supabaseConfig && temSessao) {
    const supabase = createServerClient(supabaseConfig.url, supabaseConfig.chave, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(lista) {
          for (const { name, value } of lista) request.cookies.set(name, value);
          resposta = NextResponse.next({ request });
          for (const { name, value, options } of lista) resposta.cookies.set(name, value, options);
        },
      },
    });
    // getUser() confere a sessão no servidor do Supabase (não confia só no cookie).
    const { data } = await supabase.auth.getUser();
    logado = Boolean(data.user);
  }

  if (exigeLogin && !logado) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    destino.searchParams.set("proximo", caminho);
    const redirecionamento = NextResponse.redirect(destino);
    for (const c of resposta.cookies.getAll()) redirecionamento.cookies.set(c);
    return redirecionamento;
  }
  return resposta;
}
