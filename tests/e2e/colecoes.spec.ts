import { expect, test } from "@playwright/test";

test("uma coleção que não existe mostra o erro amigável", async ({ page }) => {
  await page.goto("/colecoes/nao-existe");
  await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute("href", "/");
});

test("sem coleções cadastradas, a home e o catálogo não mostram a área de coleções", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Coleções" })).toHaveCount(0);
  await page.goto("/catalogo");
  await expect(page.getByRole("navigation", { name: "Coleções" })).toHaveCount(0);
});
