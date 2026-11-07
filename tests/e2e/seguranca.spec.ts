import { expect, test } from "@playwright/test";
import { semProblemasGravesDeAcessibilidade, usarTema } from "./ajudas";

test("as páginas saem com os cabeçalhos de segurança", async ({ request }) => {
  const r = await request.get("/");
  const h = r.headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["permissions-policy"]).toContain("camera=()");
  const csp = h["content-security-policy"];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).not.toContain("'unsafe-eval'");
});

test("a página carrega e funciona com a política de conteúdo (sem erros no console)", async ({ page }) => {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text());
  });
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: "Categorias" }).click();
  await expect(page.getByRole("dialog", { name: "Categorias" })).toBeVisible();
  expect(erros.filter((e) => /Content Security Policy|Refused to/.test(e))).toEqual([]);
});

test("robots.txt bloqueia as áreas privadas e aponta o sitemap", async ({ request }) => {
  const r = await request.get("/robots.txt");
  expect(r.status()).toBe(200);
  const t = await r.text();
  for (const caminho of ["/admin", "/api", "/conta", "/finalizar"]) expect(t).toContain(`Disallow: ${caminho}`);
  expect(t).toContain("Sitemap:");
});

test("o sitemap lista as páginas principais", async ({ request }) => {
  const r = await request.get("/sitemap.xml");
  expect(r.status()).toBe(200);
  const t = await r.text();
  expect(t).toContain("/catalogo");
  expect(t).toContain("/privacidade");
  expect(t).not.toContain("/admin");
});

for (const [caminho, titulo] of [["/privacidade", "Política de privacidade"], ["/termos", "Termos de compra"]] as const) {
  test(`página ${caminho} abre e tem link no rodapé`, async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: caminho === "/privacidade" ? "Privacidade" : "Termos de compra" })).toBeVisible();
    await page.goto(caminho);
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
  });
  for (const tema of ["light", "dark"] as const) {
    test(`acessibilidade de ${caminho} no tema ${tema}`, async ({ page }) => {
      await usarTema(page, tema);
      await page.goto(caminho);
      await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
      await semProblemasGravesDeAcessibilidade(page);
    });
  }
}

test("rotas de API e áreas privadas não são indexadas", async ({ request }) => {
  const r = await request.get("/carrinho");
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain("noindex");
});
