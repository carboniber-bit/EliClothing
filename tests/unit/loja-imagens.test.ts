import { describe, expect, it } from "vitest";
import { caminhoImagemSiteValido, chaveImagemValida, urlImagemSite } from "@/lib/loja/imagens";

const uuid = "123e4567-e89b-12d3-a456-426614174000";
const BASE = "https://abc.supabase.co";

describe("fotos da página inicial", () => {
  it("só aceita as posições conhecidas", () => {
    expect(chaveImagemValida("imagem_topo")).toBe(true);
    expect(chaveImagemValida("imagem_qualquer")).toBe(false);
  });
  it("aceita só o caminho site/<posição>-<uuid>.jpg da própria posição", () => {
    expect(caminhoImagemSiteValido("imagem_topo", `site/imagem_topo-${uuid}.jpg`)).toBe(true);
    expect(caminhoImagemSiteValido("imagem_topo", `site/imagem_sobre-${uuid}.jpg`)).toBe(false);
    expect(caminhoImagemSiteValido("imagem_topo", `../site/imagem_topo-${uuid}.jpg`)).toBe(false);
    expect(caminhoImagemSiteValido("imagem_topo", `outra/imagem_topo-${uuid}.jpg`)).toBe(false);
    expect(caminhoImagemSiteValido("imagem_topo", `site/imagem_topo-${uuid}.png`)).toBe(false);
  });
  it("monta o endereço público; sem foto salva ou inválida, devolve null", () => {
    expect(urlImagemSite(BASE, "imagem_topo", `site/imagem_topo-${uuid}.jpg`)).toBe(
      `${BASE}/storage/v1/object/public/produtos/site/imagem_topo-${uuid}.jpg`,
    );
    expect(urlImagemSite(BASE, "imagem_topo", null)).toBeNull();
    expect(urlImagemSite(BASE, "imagem_topo", "site/x.jpg")).toBeNull();
    expect(urlImagemSite(null, "imagem_topo", `site/imagem_topo-${uuid}.jpg`)).toBeNull();
  });
});
