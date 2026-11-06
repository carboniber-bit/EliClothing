import { expect, test } from "@playwright/test";
import { semRolagemHorizontal, usarTema } from "./ajudas";

const telas = [
  { nome: "320", largura: 320, altura: 640 },
  { nome: "390", largura: 390, altura: 844 },
  { nome: "768", largura: 768, altura: 1024 },
  { nome: "1280", largura: 1280, altura: 800 },
];
const rotas = ["/", "/catalogo", "/nao-existe", "/entrar", "/cadastrar"];

for (const tela of telas) {
  for (const tema of ["light", "dark"] as const) {
    test.describe(`tela ${tela.nome} px, tema ${tema}`, () => {
      test.use({ viewport: { width: tela.largura, height: tela.altura } });

      for (const rota of rotas) {
        test(`${rota} não tem rolagem horizontal`, async ({ page }) => {
          await usarTema(page, tema);
          await page.goto(rota);
          await semRolagemHorizontal(page);
        });

        test(`${rota} continua sem rolagem horizontal com texto a 200%`, async ({ page }) => {
          await usarTema(page, tema);
          await page.goto(rota);
          await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          await semRolagemHorizontal(page);
          // o cabeçalho continua utilizável: o botão de tema segue visível e clicável
          await expect(page.getByRole("button", { name: "Alternar tema claro/escuro" })).toBeVisible();
        });
      }
    });
  }
}

test.describe("alvos de toque no celular", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("os botões do cabeçalho têm pelo menos 44x44 px", async ({ page }) => {
    await page.goto("/");
    const botoes = page.getByRole("banner").getByRole("button");
    const total = await botoes.count();
    expect(total).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < total; i++) {
      const caixa = await botoes.nth(i).boundingBox();
      expect(caixa?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("teclado", () => {
  test("o Tab percorre cabeçalho, conteúdo e rodapé com foco visível", async ({ page }) => {
    await page.goto("/");
    const regioes = new Set<string>();
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const regiao = el.closest("header") ? "cabecalho" : el.closest("footer") ? "rodape" : "conteudo";
        const estilo = getComputedStyle(el);
        return { regiao, contorno: estilo.outlineStyle !== "none" && parseFloat(estilo.outlineWidth) > 0 };
      });
      if (info) {
        regioes.add(info.regiao);
        expect(info.contorno, `elemento sem foco visível na região ${info.regiao}`).toBe(true);
      }
    }
    expect([...regioes].sort()).toEqual(["cabecalho", "conteudo", "rodape"]);
  });
});
