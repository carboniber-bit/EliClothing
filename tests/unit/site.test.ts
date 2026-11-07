import { afterEach, describe, expect, it } from "vitest";
import { urlDoSite } from "@/lib/site";

const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});

describe("urlDoSite", () => {
  it("usa NEXT_PUBLIC_SITE_URL sem barra no final", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://loja.exemplo.com.br/";
    expect(urlDoSite()).toBe("https://loja.exemplo.com.br");
  });
  it("cai para o domínio da Vercel e depois para localhost", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "eli.vercel.app";
    expect(urlDoSite()).toBe("https://eli.vercel.app");
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(urlDoSite()).toBe("http://localhost:3000");
  });
});
