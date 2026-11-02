import { expect, test } from "@playwright/test";
import { semProblemasGravesDeAcessibilidade, usarTema } from "./ajudas";

test("o catálogo vazio mostra o estado vazio e nada inventado", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { level: 1, name: "Catálogo" })).toBeVisible();
  await expect(page.getByText("Estamos preparando a coleção")).toBeVisible();
  const texto = await page.locator("body").innerText();
  expect(texto).not.toContain("R$");
  expect(texto).not.toContain("[DEMO]");
  await expect(page.locator("article")).toHaveCount(0);
});

test("todos os links da página têm destino", async ({ page }) => {
  await page.goto("/catalogo");
  const hrefs = await page.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href, "link sem href").toBeTruthy();
    expect(href).not.toBe("#");
  }
});

for (const tema of ["light", "dark"] as const) {
  test(`acessibilidade do catálogo no tema ${tema}`, async ({ page }) => {
    await usarTema(page, tema);
    await page.goto("/catalogo");
    await semProblemasGravesDeAcessibilidade(page);
  });
}
