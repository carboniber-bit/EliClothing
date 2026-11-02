import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const INSTAGRAM = "https://www.instagram.com/eliclothing_/";
export const WHATSAPP = "https://wa.me/5511973029002";

/** Define o tema antes de a página carregar (valor salvo vence o do sistema). */
export async function usarTema(page: Page, tema: "light" | "dark") {
  await page.addInitScript((t) => localStorage.setItem("eli-tema", t), tema);
}

/** Falha se o axe achar problemas graves ou críticos de acessibilidade. */
export async function semProblemasGravesDeAcessibilidade(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const graves = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    graves.map((v) => `${v.id}: ${v.help} (${v.nodes.length} elemento(s))`),
    "violações graves de acessibilidade",
  ).toEqual([]);
}

export async function semRolagemHorizontal(page: Page) {
  const largura = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(largura.scroll).toBeLessThanOrEqual(largura.client);
}
