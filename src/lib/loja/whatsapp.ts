/** Link wa.me para o número informado (com ou sem máscara/DDI). Devolve null se o número for inválido. */
export function linkWhatsapp(numero: string | null, mensagem?: string): string | null {
  if (!numero) return null;
  let digitos = numero.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) {
    digitos = `55${digitos}`;
  } else if (!((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55"))) {
    return null;
  }
  const base = `https://wa.me/${digitos}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
