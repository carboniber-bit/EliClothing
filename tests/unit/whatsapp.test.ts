import { describe, expect, it } from "vitest";
import { linkWhatsapp } from "@/lib/loja/whatsapp";

describe("linkWhatsapp", () => {
  it("monta o link com DDI 55 e remove a máscara", () => {
    expect(linkWhatsapp("(11) 91234-5678")).toBe("https://wa.me/5511912345678");
  });

  it("codifica a mensagem", () => {
    expect(linkWhatsapp("(11) 91234-5678", "Olá, quero ver o pedido #12")).toBe(
      "https://wa.me/5511912345678?text=Ol%C3%A1%2C%20quero%20ver%20o%20pedido%20%2312",
    );
  });

  it("não duplica o 55", () => {
    expect(linkWhatsapp("5511912345678")).toBe("https://wa.me/5511912345678");
  });

  it("aceita número fixo de 10 dígitos", () => {
    expect(linkWhatsapp("1133334444")).toBe("https://wa.me/551133334444");
  });

  it("devolve null para número ausente ou inválido", () => {
    expect(linkWhatsapp(null)).toBeNull();
    expect(linkWhatsapp("")).toBeNull();
    expect(linkWhatsapp("123")).toBeNull();
    expect(linkWhatsapp("abc")).toBeNull();
  });
});
