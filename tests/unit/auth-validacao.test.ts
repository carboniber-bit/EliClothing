import { describe, expect, it } from "vitest";
import { cadastroSchema, entrarSchema, errosDoZod, novaSenhaSchema, recuperarSchema } from "@/lib/validacao/auth";

describe("validação de login e cadastro", () => {
  it("normaliza o e-mail (espaços e maiúsculas)", () => {
    const r = recuperarSchema.parse({ email: "  Bia@Exemplo.COM " });
    expect(r.email).toBe("bia@exemplo.com");
  });

  it("recusa e-mail inválido com mensagem em português", () => {
    const r = recuperarSchema.safeParse({ email: "bia@" });
    expect(r.success).toBe(false);
    if (!r.success) expect(errosDoZod(r.error).email).toBe("Digite um e-mail válido.");
  });

  it("entrar exige senha preenchida", () => {
    const r = entrarSchema.safeParse({ email: "bia@exemplo.com", senha: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(errosDoZod(r.error).senha).toBe("Digite sua senha.");
  });

  it("cadastro aceita dados corretos", () => {
    const r = cadastroSchema.safeParse({ nome: " Bia ", email: "bia@exemplo.com", senha: "12345678", confirmar: "12345678" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.nome).toBe("Bia");
  });

  it("cadastro recusa senha curta e senhas diferentes", () => {
    const curta = cadastroSchema.safeParse({ nome: "Bia", email: "bia@exemplo.com", senha: "123", confirmar: "123" });
    expect(curta.success).toBe(false);
    if (!curta.success) expect(errosDoZod(curta.error).senha).toMatch(/pelo menos 8/);

    const difere = cadastroSchema.safeParse({ nome: "Bia", email: "bia@exemplo.com", senha: "12345678", confirmar: "87654321" });
    expect(difere.success).toBe(false);
    if (!difere.success) expect(errosDoZod(difere.error).confirmar).toBe("As senhas não são iguais.");
  });

  it("cadastro recusa senha acima de 72 caracteres (limite do bcrypt)", () => {
    const longa = "a".repeat(73);
    expect(novaSenhaSchema.safeParse({ senha: longa, confirmar: longa }).success).toBe(false);
  });

  it("errosDoZod guarda só a primeira mensagem de cada campo", () => {
    const r = cadastroSchema.safeParse({ nome: "", email: "x", senha: "1", confirmar: "2" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const erros = errosDoZod(r.error);
      expect(Object.keys(erros)).toEqual(expect.arrayContaining(["email", "nome", "senha"]));
      for (const mensagem of Object.values(erros)) expect(typeof mensagem).toBe("string");
    }
  });
});
