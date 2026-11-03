"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  cadastroSchema,
  entrarSchema,
  errosDoZod,
  novaSenhaSchema,
  recuperarSchema,
} from "@/lib/validacao/auth";
import { caminhoInternoSeguro } from "./redirecionamento";
import type { EstadoForm } from "./estado";

const INDISPONIVEL = "O login ainda não está disponível neste ambiente. Tente novamente mais tarde.";

function textos(dados: FormData): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const [chave, valor] of dados.entries()) if (typeof valor === "string") saida[chave] = valor;
  return saida;
}

async function enderecoDoSite(): Promise<string> {
  const fixo = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fixo) return fixo;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocolo = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

export async function entrar(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const bruto = textos(dados);
  const valores = { email: bruto.email ?? "" };
  const resultado = entrarSchema.safeParse(bruto);
  if (!resultado.success) return { campos: errosDoZod(resultado.error), valores };

  const supabase = await criarClienteServidor();
  if (!supabase) return { erro: INDISPONIVEL, valores };

  const { error } = await supabase.auth.signInWithPassword({
    email: resultado.data.email,
    password: resultado.data.senha,
  });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { erro: "Confirme seu e-mail pelo link que enviamos antes de entrar.", valores };
    }
    return { erro: "E-mail ou senha incorretos.", valores };
  }
  redirect(caminhoInternoSeguro(bruto.proximo));
}

export async function cadastrar(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const bruto = textos(dados);
  const valores = { nome: bruto.nome ?? "", email: bruto.email ?? "" };
  const resultado = cadastroSchema.safeParse(bruto);
  if (!resultado.success) return { campos: errosDoZod(resultado.error), valores };

  const supabase = await criarClienteServidor();
  if (!supabase) return { erro: INDISPONIVEL, valores };

  const { data, error } = await supabase.auth.signUp({
    email: resultado.data.email,
    password: resultado.data.senha,
    options: {
      data: { nome: resultado.data.nome },
      emailRedirectTo: `${await enderecoDoSite()}/auth/confirmar?next=/conta`,
    },
  });
  if (error) {
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { erro: "Muitas tentativas agora. Aguarde alguns minutos e tente de novo.", valores };
    }
    if (error.code === "weak_password") {
      return { erro: "Essa senha é fraca demais. Use uma senha mais difícil de adivinhar.", valores };
    }
    return { erro: "Não foi possível criar a conta agora. Tente novamente.", valores };
  }
  if (data.session) redirect("/conta"); // projeto sem confirmação de e-mail
  return {
    sucesso: "Pronto! Enviamos um e-mail para você confirmar o cadastro. Abra o link e depois entre na sua conta.",
  };
}

export async function pedirRecuperacao(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const bruto = textos(dados);
  const valores = { email: bruto.email ?? "" };
  const resultado = recuperarSchema.safeParse(bruto);
  if (!resultado.success) return { campos: errosDoZod(resultado.error), valores };

  const supabase = await criarClienteServidor();
  if (!supabase) return { erro: INDISPONIVEL, valores };

  await supabase.auth.resetPasswordForEmail(resultado.data.email, {
    redirectTo: `${await enderecoDoSite()}/auth/confirmar?next=/nova-senha`,
  });
  // Mesma resposta exista ou não a conta: ninguém descobre quem é cliente.
  return { sucesso: "Se esse e-mail tiver cadastro, enviamos um link para criar uma nova senha." };
}

export async function definirNovaSenha(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const resultado = novaSenhaSchema.safeParse(textos(dados));
  if (!resultado.success) return { campos: errosDoZod(resultado.error) };

  const supabase = await criarClienteServidor();
  if (!supabase) return { erro: INDISPONIVEL };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { erro: "Esse link expirou. Peça um novo em “Esqueci minha senha”." };

  const { error } = await supabase.auth.updateUser({ password: resultado.data.senha });
  if (error) {
    return { erro: "Não foi possível trocar a senha. Use uma senha diferente da anterior e tente de novo." };
  }
  redirect("/conta");
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase?.auth.signOut();
  redirect("/");
}
