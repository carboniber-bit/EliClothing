import { expect, test } from "@playwright/test";
import { semProblemasGravesDeAcessibilidade, usarTema } from "./ajudas";

const telas = [
  { rota: "/entrar", titulo: "Entrar" },
  { rota: "/cadastrar", titulo: "Criar conta" },
  { rota: "/recuperar-senha", titulo: "Recuperar senha" },
];

for (const { rota, titulo } of telas) {
  for (const tema of ["light", "dark"] as const) {
    test(`${rota} abre, tem título e passa na acessibilidade (${tema})`, async ({ page }) => {
      await usarTema(page, tema);
      await page.goto(rota);
      await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
      await expect(page.getByRole("button", { name: /Entrar|Criar conta|Enviar link/ }).last()).toBeVisible();
      await semProblemasGravesDeAcessibilidade(page);
    });
  }
}

test("área da conta e painel mandam quem não está logado para a tela de entrar", async ({ page }) => {
  await page.goto("/conta");
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fconta$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fadmin$/);
});

test("entrar com campos vazios mostra erros ao lado de cada campo", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Digite um e-mail válido.")).toBeVisible();
  await expect(page.getByText("Digite sua senha.")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toHaveAttribute("aria-invalid", "true");
});

test("cadastro com senhas diferentes é recusado", async ({ page }) => {
  await page.goto("/cadastrar");
  await page.getByLabel("Nome").fill("Bia");
  await page.getByLabel("E-mail").fill("bia@exemplo.com");
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByLabel("Repita a senha").fill("87654321");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("As senhas não são iguais.")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toHaveValue("bia@exemplo.com");
});

test("dados válidos com login ainda não configurado ou inválido mostram um aviso, sem quebrar", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("ninguem@exemplo.com");
  await page.getByLabel("Senha").fill("senha-qualquer");
  await page.getByRole("button", { name: "Entrar" }).click();
  // O Next também cria um aviso invisível (route announcer); queremos só a mensagem do formulário.
  await expect(page.locator('p[role="alert"]')).toBeVisible();
});

test("o parâmetro 'proximo' aponta só para dentro do site", async ({ page }) => {
  await page.goto("/entrar?proximo=https://site-falso.com");
  await expect(page.locator('#conteudo input[name="proximo"]')).toHaveValue("/conta");
  await page.goto("/entrar?proximo=/admin");
  await expect(page.locator('#conteudo input[name="proximo"]')).toHaveValue("/admin");
});

test("o cabeçalho tem o link Entrar", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/entrar$/);
});

test("todas as páginas do painel mandam visitante para a tela de entrar", async ({ page }) => {
  for (const rota of ["/admin/produtos", "/admin/produtos/novo", "/admin/categorias", "/admin/pedidos", "/admin/pedidos?status=pago", "/admin/pedidos/11111111-1111-4111-8111-111111111111", "/admin/equipe", "/admin/historico", "/admin/produtos/11111111-1111-4111-8111-111111111111"]) {
    await page.goto(rota);
    await expect(page, rota).toHaveURL(/\/entrar\?proximo=/);
  }
});

test("botões mostram a mãozinha do mouse", async ({ page }) => {
  await page.goto("/entrar");
  const botao = page.getByRole("main").getByRole("button", { name: "Entrar" });
  await expect(botao).toHaveCSS("cursor", "pointer");
});

test("visitante vê o botão Entrar no cabeçalho em qualquer página", async ({ page }) => {
  for (const rota of ["/", "/catalogo"]) {
    await page.goto(rota);
    await expect(page.getByRole("banner").getByRole("link", { name: "Entrar" })).toBeVisible();
  }
});
