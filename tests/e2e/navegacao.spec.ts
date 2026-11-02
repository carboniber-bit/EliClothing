import { expect, test } from "@playwright/test";
import { INSTAGRAM, WHATSAPP, semRolagemHorizontal } from "./ajudas";

test.describe("computador", () => {
  test("os links do cabeçalho levam às páginas", async ({ page }) => {
    await page.goto("/");
    const cabecalho = page.getByRole("banner");
    await cabecalho.getByRole("link", { name: "Catálogo" }).click();
    await expect(page).toHaveURL(/\/catalogo$/);
    await cabecalho.getByRole("link", { name: "Início" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("o Instagram do cabeçalho tem o endereço exato e abre em nova aba", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("banner").getByRole("link", { name: "Instagram" });
    await expect(link).toHaveAttribute("href", INSTAGRAM);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("o rodapé tem o botão do WhatsApp com o número da loja", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("contentinfo").getByRole("link", { name: /WhatsApp/ });
    await expect(link).toHaveAttribute("href", WHATSAPP);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("uma página que não existe mostra o erro amigável", async ({ page }) => {
    const resposta = await page.goto("/nao-existe");
    expect(resposta?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute("href", "/");
  });

  test("o link 'Pular para o conteúdo' leva ao conteúdo principal", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const pular = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(pular).toBeFocused();
    await pular.press("Enter");
    await expect(page).toHaveURL(/#conteudo$/);
  });
});

test.describe("celular", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("o menu abre pelo botão, Esc fecha e o foco volta ao botão", async ({ page }) => {
    await page.goto("/");
    const botao = page.getByRole("button", { name: "Abrir menu" });
    await botao.click();
    const aberto = page.getByRole("button", { name: "Fechar menu" });
    await expect(aberto).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Menu" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
  });

  test("com o menu aberto o Tab não sai dele", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const dentro = await page.evaluate(() => !!document.activeElement?.closest("[data-menu]"));
      expect(dentro, `Tab nº ${i + 1} saiu do menu`).toBe(true);
    }
  });

  test("escolher um link do menu navega e fecha o menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("navigation", { name: "Menu" }).getByRole("link", { name: "Catálogo" }).click();
    await expect(page).toHaveURL(/\/catalogo$/);
    await expect(page.getByRole("navigation", { name: "Menu" })).toBeHidden();
  });

  test("não há rolagem horizontal", async ({ page }) => {
    await page.goto("/");
    await semRolagemHorizontal(page);
  });
});
