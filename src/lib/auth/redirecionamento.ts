/**
 * Só aceita caminhos internos do próprio site ("/conta", "/admin/produtos?x=1").
 * Qualquer coisa que possa levar a outro site vira o caminho padrão (evita "open redirect").
 */
export function caminhoInternoSeguro(valor: string | null | undefined, padrao = "/conta"): string {
  if (!valor || valor.length > 200) return padrao;
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) return padrao;
  if (/[\\\u0000-\u001f\u007f]/.test(valor)) return padrao;
  return valor;
}
