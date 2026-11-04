import { z } from "zod";

export type ErrosCampos = Record<string, string>;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Digite um e-mail válido."));

const senhaNova = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.");

export const entrarSchema = z.object({
  email,
  senha: z.string().min(1, "Digite sua senha.").max(72, "Senha inválida."),
});

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, "Digite seu nome.").max(80, "O nome pode ter no máximo 80 letras."),
    email,
    senha: senhaNova,
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, { path: ["confirmar"], message: "As senhas não são iguais." });

export const recuperarSchema = z.object({ email });

export const novaSenhaSchema = z
  .object({ senha: senhaNova, confirmar: z.string() })
  .refine((d) => d.senha === d.confirmar, { path: ["confirmar"], message: "As senhas não são iguais." });

/** Primeira mensagem de erro de cada campo. */
export function errosDoZod(erro: z.ZodError): ErrosCampos {
  const saida: ErrosCampos = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? "formulario");
    if (!(campo in saida)) saida[campo] = problema.message;
  }
  return saida;
}
