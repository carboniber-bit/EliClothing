import { defineConfig, devices } from "@playwright/test";

const PORTA = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL: `http://localhost:${PORTA}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    timeout: 300_000,
    reuseExistingServer: false,
    // Os testes de tela vazia não podem depender do banco real do seu .env.local.
    env: { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" },
  },
});
