import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { caminhoInternoSeguro } from "@/lib/auth/redirecionamento";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const TIPOS: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

// Destino dos links enviados por e-mail (confirmar cadastro, recuperar senha).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const proximo = caminhoInternoSeguro(searchParams.get("next"), "/conta");
  const supabase = await criarClienteServidor();

  if (supabase) {
    const codigo = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const tipo = searchParams.get("type") as EmailOtpType | null;

    if (codigo) {
      const { error } = await supabase.auth.exchangeCodeForSession(codigo);
      if (!error) return NextResponse.redirect(new URL(proximo, origin));
    } else if (tokenHash && tipo && TIPOS.includes(tipo)) {
      const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(proximo, origin));
    }
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", origin));
}
