import { describe, expect, it } from "vitest";
import {
  TEXTOS_PADRAO,
  escalaDoTitulo,
  linhasDoTitulo,
  mesclarTextos,
  normalizarUsuarioInstagram,
  normalizarWhatsapp,
  paragrafos,
  urlInstagram,
} from "@/lib/loja/textos";

describe("mesclarTextos", () => {
  it("sem nada salvo usa os padrões", () => {
    expect(mesclarTextos({})).toEqual(TEXTOS_PADRAO);
  });
  it("campo salvo vence; vazio, nulo ou chave desconhecida são ignorados", () => {
    const r = mesclarTextos({ topo_subtitulo: "  Novo texto  ", sobre_titulo: "   ", instagram_texto: null, intrusa: "x" });
    expect(r.topo_subtitulo).toBe("Novo texto");
    expect(r.sobre_titulo).toBe(TEXTOS_PADRAO.sobre_titulo);
    expect(r.instagram_texto).toBe(TEXTOS_PADRAO.instagram_texto);
    expect(Object.keys(r)).not.toContain("intrusa");
  });
});

describe("título do topo", () => {
  it("separa em linhas, ignora linhas vazias e aceita quebra do Windows", () => {
    expect(linhasDoTitulo("Vista-se\r\n\r\npara\r\nimpressionar")).toEqual(["Vista-se", "para", "impressionar"]);
  });
  it("usa no máximo 4 linhas", () => {
    expect(linhasDoTitulo("a\nb\nc\nd\ne")).toHaveLength(4);
  });
  it("o título padrão tem 4 linhas e cabe sem reduzir a letra", () => {
    const linhas = linhasDoTitulo(TEXTOS_PADRAO.topo_titulo);
    expect(linhas).toEqual(["Vista-se", "para", "impressionar", "(você mesma)."]);
    expect(escalaDoTitulo(linhas)).toBe(1);
  });
  it("linha comprida reduz a letra proporcionalmente, sem passar de um mínimo", () => {
    expect(escalaDoTitulo(["x".repeat(26)])).toBeCloseTo(0.5, 2);
    expect(escalaDoTitulo(["x".repeat(200)])).toBe(0.35);
  });
});

describe("parágrafos", () => {
  it("separa por linha em branco e junta quebras simples", () => {
    expect(paragrafos("um\ndois\n\ntrês")).toEqual(["um dois", "três"]);
  });
});

describe("Instagram", () => {
  it.each([
    ["@eliclothing_", "@eliclothing_"],
    ["eliclothing_", "@eliclothing_"],
    ["https://www.instagram.com/eliclothing_/", "@eliclothing_"],
    ["https://instagram.com/loja.eli?igsh=abc", "@loja.eli"],
  ])("aceita %s", (entrada, esperado) => {
    expect(normalizarUsuarioInstagram(entrada)).toBe(esperado);
  });
  it.each(["", "@", "com espaço", "a/b", "x".repeat(31), "javascript:alert(1)"])("recusa %j", (entrada) => {
    expect(normalizarUsuarioInstagram(entrada)).toBeNull();
  });
  it("monta o endereço do perfil", () => {
    expect(urlInstagram("@eliclothing_")).toBe("https://www.instagram.com/eliclothing_/");
  });
});

describe("WhatsApp", () => {
  it.each([
    ["(11) 97302-9002", "11973029002"],
    ["11973029002", "11973029002"],
    ["+55 11 97302-9002", "11973029002"],
  ])("aceita %s", (entrada, esperado) => {
    expect(normalizarWhatsapp(entrada)).toBe(esperado);
  });
  it.each(["", "123", "abc", "(11) 7302-90"])("recusa %j", (entrada) => {
    expect(normalizarWhatsapp(entrada)).toBeNull();
  });
});
