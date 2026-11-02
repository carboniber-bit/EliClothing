import { describe, expect, it } from "vitest";
import { CHAVE_TEMA, resolverTema, scriptTemaInicial } from "@/lib/tema";

describe("resolverTema", () => {
  it("usa o tema salvo quando é válido", () => {
    expect(resolverTema("dark", false)).toBe("dark");
    expect(resolverTema("light", true)).toBe("light");
  });

  it("segue o sistema quando não há tema salvo", () => {
    expect(resolverTema(null, true)).toBe("dark");
    expect(resolverTema("", false)).toBe("light");
  });

  it("ignora valores inválidos e segue o sistema", () => {
    expect(resolverTema("banana", true)).toBe("dark");
  });
});

type Cenario = { salvo: string | null; escuro: boolean; storageQuebrado?: boolean };

function rodarScript({ salvo, escuro, storageQuebrado }: Cenario): string | undefined {
  const documentFalso = { documentElement: { dataset: {} as Record<string, string> } };
  const localStorageFalso = {
    getItem(chave: string) {
      if (storageQuebrado) throw new Error("bloqueado");
      return chave === CHAVE_TEMA ? salvo : null;
    },
  };
  const windowFalso = {
    matchMedia: () => ({ matches: escuro }),
  };
  new Function("document", "localStorage", "window", scriptTemaInicial)(
    documentFalso,
    localStorageFalso,
    windowFalso,
  );
  return documentFalso.documentElement.dataset.tema;
}

describe("scriptTemaInicial (roda antes da primeira pintura)", () => {
  const cenarios: Cenario[] = [
    { salvo: "dark", escuro: false },
    { salvo: "light", escuro: true },
    { salvo: null, escuro: true },
    { salvo: "banana", escuro: true },
    { salvo: "", escuro: false },
  ];

  for (const c of cenarios) {
    it(`dá o mesmo resultado de resolverTema para salvo=${JSON.stringify(c.salvo)} escuro=${c.escuro}`, () => {
      expect(rodarScript(c)).toBe(resolverTema(c.salvo, c.escuro));
    });
  }

  it("cai no tema do sistema quando o localStorage lança erro", () => {
    expect(rodarScript({ salvo: "light", escuro: true, storageQuebrado: true })).toBe("dark");
  });
});
