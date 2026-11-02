import { expect, test } from "@playwright/test";
import { INSTAGRAM, semProblemasGravesDeAcessibilidade, usarTema } from "./ajudas";

test("a página inicial apresenta a loja", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Vista-se para impressionar (você mesma)" }),
  ).toBeVisible();
  await expect(page.getByText("Osasco-SP").first()).toBeVisible();
});

test("o botão 'Ver catálogo' leva ao catálogo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ver catálogo" }).click();
  await expect(page).toHaveURL(/\/catalogo$/);
});

test("sem produtos, as novidades mostram 'em breve' e nada inventado", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Novidades em breve")).toBeVisible();
  const texto = await page.locator("body").innerText();
  expect(texto).not.toContain("R$");
  expect(texto).not.toContain("[DEMO]");
});

test("a chamada para o Instagram aponta para o endereço exato", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: "Siga a EliClothing no Instagram" })).toBeVisible();
  const links = page.locator("main").getByRole("link", { name: /Instagram|@eliclothing_/ });
  expect(await links.count()).toBeGreaterThan(0);
  for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
    expect(href).toBe(INSTAGRAM);
  }
});

test("há um único h1 e os títulos não pulam de nível", async ({ page }) => {
  await page.goto("/");
  const niveis = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((els) =>
    els.map((e) => Number(e.tagName.slice(1))),
  );
  expect(niveis.filter((n) => n === 1)).toHaveLength(1);
  for (let i = 1; i < niveis.length; i++) {
    expect(niveis[i] - niveis[i - 1], `salto de h${niveis[i - 1]} para h${niveis[i]}`).toBeLessThanOrEqual(1);
  }
});

for (const tema of ["light", "dark"] as const) {
  test(`acessibilidade da página inicial no tema ${tema}`, async ({ page }) => {
    await usarTema(page, tema);
    await page.goto("/");
    await semProblemasGravesDeAcessibilidade(page);
  });
}
