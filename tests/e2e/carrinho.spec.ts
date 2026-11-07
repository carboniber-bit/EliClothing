import { expect, test } from "@playwright/test";
import { semProblemasGravesDeAcessibilidade, usarTema } from "./ajudas";

const item = {
  variacaoId: "11111111-1111-4111-8111-111111111111",
  slug: "vestido-teste",
  nome: "Vestido de teste",
  tamanho: "38/44",
  cor: "Vermelho",
  precoCentavos: 7900,
  quantidade: 2,
  estoque: 3,
  foto: null,
};

test("sacola vazia mostra o aviso e o caminho para o catálogo", async ({ page }) => {
  await page.goto("/carrinho");
  await expect(page.getByRole("heading", { level: 1, name: "Sua sacola" })).toBeVisible();
  await expect(page.getByText("Sua sacola está vazia")).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Ver o catálogo" })).toBeVisible();
});

test("o cabeçalho tem o botão da sacola e ele abre a sacola", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: /Sacola/ }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
});

test("sacola com itens guardados mostra total e controla a quantidade", async ({ page }) => {
  await page.addInitScript((i) => localStorage.setItem("eliclothing-carrinho-v1", JSON.stringify([i])), item);
  await page.goto("/carrinho");
  await expect(page.getByRole("link", { name: "Vestido de teste" })).toBeVisible();
  await expect(page.getByText("Tamanho 38/44 · Vermelho")).toBeVisible();
  await expect(page.getByRole("complementary").getByText("R$ 158,00")).toBeVisible();
  await expect(page.getByRole("banner").getByRole("link", { name: "Sacola, 2 itens" })).toBeVisible();

  await page.getByRole("button", { name: "Aumentar quantidade de Vestido de teste" }).click();
  await expect(page.getByRole("complementary").getByText("R$ 237,00")).toBeVisible();
  await expect(page.getByRole("button", { name: "Aumentar quantidade de Vestido de teste" })).toBeDisabled(); // estoque 3

  await page.getByRole("button", { name: /Remover/ }).click();
  await expect(page.getByText("Sua sacola está vazia")).toBeVisible();
});

test("dados estranhos guardados no navegador são ignorados", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("eliclothing-carrinho-v1", '[{"nome":"<img src=x onerror=alert(1)>"}]'));
  await page.goto("/carrinho");
  await expect(page.getByText("Sua sacola está vazia")).toBeVisible();
});

test("produto que não existe mostra a página de não encontrado", async ({ page }) => {
  await page.goto("/produto/nao-existe");
  await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
});

for (const tema of ["light", "dark"] as const) {
  test(`acessibilidade da sacola com itens no tema ${tema}`, async ({ page }) => {
    await usarTema(page, tema);
    await page.addInitScript((i) => localStorage.setItem("eliclothing-carrinho-v1", JSON.stringify([i])), item);
    await page.goto("/carrinho");
    await expect(page.getByRole("link", { name: "Vestido de teste" })).toBeVisible();
    await semProblemasGravesDeAcessibilidade(page);
  });
}

test("a gaveta de categorias abre, mostra o atalho para todos os produtos e fecha com Esc", async ({ page }) => {
  await page.goto("/");
  const botao = page.getByRole("banner").getByRole("button", { name: "Categorias" });
  await botao.click();
  const gaveta = page.getByRole("dialog", { name: "Categorias" });
  await expect(gaveta).toBeVisible();
  await expect(gaveta.getByRole("link", { name: "Todos os produtos" })).toHaveAttribute("href", "/catalogo");
  await page.keyboard.press("Escape");
  await expect(gaveta).toBeHidden();
  await expect(botao).toBeFocused();
});

test("categoria que não existe mostra a página de não encontrado", async ({ page }) => {
  await page.goto("/categoria/nao-existe");
  await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
});

for (const tema of ["light", "dark"] as const) {
  test(`acessibilidade da gaveta de categorias aberta no tema ${tema}`, async ({ page }) => {
    await usarTema(page, tema);
    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: "Categorias" }).click();
    await expect(page.getByRole("dialog", { name: "Categorias" })).toBeVisible();
    await semProblemasGravesDeAcessibilidade(page);
  });
}

const guardarItem = (page: import("@playwright/test").Page) =>
  page.addInitScript((i) => localStorage.setItem("eliclothing-carrinho-v1", JSON.stringify([i])), item);

test("finalizar com sacola vazia leva de volta ao catálogo", async ({ page }) => {
  await page.goto("/finalizar");
  await expect(page.getByText("Sua sacola está vazia")).toBeVisible();
});

test("finalizar: erros aparecem junto dos campos e o endereço só aparece na entrega", async ({ page }) => {
  await guardarItem(page);
  await page.goto("/finalizar");
  await expect(page.getByLabel("Endereço completo")).toHaveCount(0);
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByText("Digite seu nome.")).toBeVisible();
  await expect(page.getByText(/Digite o telefone com DDD/)).toBeVisible();
  await page.getByText("Receber em casa").click();
  await expect(page.getByLabel("Endereço completo")).toBeVisible();
});

test("finalizar sem o servidor configurado avisa com clareza e mantém a sacola", async ({ page }) => {
  await guardarItem(page);
  await page.goto("/finalizar");
  await page.getByLabel("Seu nome").fill("Maria Teste");
  await page.getByLabel(/WhatsApp \/ telefone/).fill("(11) 97302-9002");
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "ainda não estão ativados" })).toBeVisible();
  await page.goto("/carrinho");
  await expect(page.getByRole("link", { name: "Vestido de teste" })).toBeVisible();
});

for (const tema of ["light", "dark"] as const) {
  test(`acessibilidade do finalizar no tema ${tema}`, async ({ page }) => {
    await usarTema(page, tema);
    await guardarItem(page);
    await page.goto("/finalizar");
    await expect(page.getByRole("button", { name: "Enviar pedido" })).toBeVisible();
    await semProblemasGravesDeAcessibilidade(page);
  });
}

test("escolher Pix sem o pagamento online ativado avisa e oferece o WhatsApp", async ({ page }) => {
  await guardarItem(page);
  await page.goto("/finalizar");
  await page.getByLabel("Seu nome").fill("Maria Teste");
  await page.getByLabel(/WhatsApp \/ telefone/).fill("(11) 97302-9002");
  await page.getByText("Pix", { exact: true }).click();
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "pagamento online ainda não está ativado" })).toBeVisible();
});

test("a página de retorno do pagamento mostra a mensagem de cada situação", async ({ page }) => {
  for (const [situacao, titulo] of [["sucesso", "Pagamento aprovado!"], ["pendente", "Pagamento em análise"], ["falha", "Pagamento não concluído"], ["qualquer", "Pagamento em análise"]]) {
    await page.goto(`/pagamento/retorno?situacao=${situacao}`);
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
  }
});

test("o retorno aprovado continua certo quando o Mercado Pago repete o parâmetro status", async ({ page }) => {
  await page.goto("/pagamento/retorno?situacao=sucesso&collection_status=approved&status=approved&status=approved&external_reference=nao-e-um-pedido");
  await expect(page.getByRole("heading", { level: 1, name: "Pagamento aprovado!" })).toBeVisible();
});

test("o aviso do Mercado Pago sem configuração é recusado", async ({ request }) => {
  const r = await request.post("/api/mercadopago/webhook?data.id=1&type=payment", { data: {} });
  expect(r.status()).toBe(503);
});
