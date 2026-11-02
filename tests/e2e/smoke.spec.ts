import { expect, test } from "@playwright/test";

test("a página inicial tem o título da loja", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/EliClothing/);
});
