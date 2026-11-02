import { expect, test } from "@playwright/test";

const botao = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Alternar tema claro/escuro" });

test("quem prefere o escuro já abre no escuro, antes de o React carregar", async ({ browser }) => {
  const contexto = await browser.newContext({ colorScheme: "dark" });
  const page = await contexto.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-tema", "dark");
  await contexto.close();
});

test("o botão troca o tema e a escolha continua após recarregar", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const inicial = await html.getAttribute("data-tema");
  await botao(page).click();
  const trocado = inicial === "dark" ? "light" : "dark";
  await expect(html).toHaveAttribute("data-tema", trocado);
  await page.reload();
  await expect(html).toHaveAttribute("data-tema", trocado);
});

test("valor inválido guardado não quebra a página e segue o sistema", async ({ browser }) => {
  const contexto = await browser.newContext({ colorScheme: "dark" });
  const page = await contexto.newPage();
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
  await page.addInitScript(() => localStorage.setItem("eli-tema", "lixo"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-tema", "dark");
  expect(erros).toEqual([]);
  await contexto.close();
});
