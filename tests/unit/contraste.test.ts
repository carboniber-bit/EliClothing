import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { razaoContraste } from "@/lib/design/contraste";

describe("razaoContraste", () => {
  it("preto sobre branco é 21", () => {
    expect(razaoContraste("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });

  it("é simétrica", () => {
    expect(razaoContraste("#6B1F2E", "#FFF8F5")).toBeCloseTo(razaoContraste("#FFF8F5", "#6B1F2E"), 5);
  });
});

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function variaveis(bloco: RegExp): Record<string, string> {
  const m = css.match(bloco);
  if (!m) throw new Error("bloco de tokens não encontrado em globals.css");
  const saida: Record<string, string> = {};
  for (const [, nome, valor] of m[1].matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    saida[nome] = valor;
  }
  return saida;
}

const temas = {
  claro: variaveis(/:root\s*\{([^}]*)\}/),
  escuro: variaveis(/\[data-tema="dark"\]\s*\{([^}]*)\}/),
};

describe.each(Object.entries(temas))("contraste WCAG AA no tema %s", (_nome, t) => {
  const pares: [string, string][] = [
    ["texto", "fundo"],
    ["texto", "superficie"],
    ["texto-suave", "fundo"],
    ["texto-suave", "superficie"],
    ["primario-texto", "primario"],
  ];
  for (const [a, b] of pares) {
    it(`${a} sobre ${b} tem pelo menos 4,5:1`, () => {
      expect(t[a], `token --${a} ausente`).toBeDefined();
      expect(t[b], `token --${b} ausente`).toBeDefined();
      expect(razaoContraste(t[a], t[b])).toBeGreaterThanOrEqual(4.5);
    });
  }
});
