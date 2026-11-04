/** "Vestido Floral Rosé!" → "vestido-floral-rose" (endereço amigável do produto). */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

const MAXIMO_CENTAVOS = 100_000_000; // R$ 1.000.000,00

/**
 * Converte o que a dona digita ("89,90", "R$ 1.234,56", "80") em centavos inteiros.
 * Devolve null se não for um valor válido (negativo, letras, mais de 2 casas...).
 */
export function reaisParaCentavos(texto: string): number | null {
  let t = texto.replace(/R\$/gi, "").replace(/\s/g, "");
  if (t === "") return null;
  if (t.includes(",")) {
    t = t.replace(/\./g, "").replace(",", "."); // 1.234,56 → 1234.56
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, ""); // 1.234 → 1234
  }
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  if (!m) return null;
  const centavos = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0") || "0");
  if (!Number.isSafeInteger(centavos) || centavos > MAXIMO_CENTAVOS) return null;
  return centavos;
}

/** 8990 → "89,90" (para preencher o campo do formulário). */
export function centavosParaReais(centavos: number): string {
  const total = Math.round(centavos);
  return `${Math.floor(total / 100)},${(total % 100).toString().padStart(2, "0")}`;
}
