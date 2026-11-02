export type Tema = "light" | "dark";

export const CHAVE_TEMA = "eli-tema";

const ehTema = (v: unknown): v is Tema => v === "light" || v === "dark";

/** Tema salvo vence; qualquer outro valor segue a preferência do sistema. */
export function resolverTema(salvo: string | null, sistemaEscuro: boolean): Tema {
  if (ehTema(salvo)) return salvo;
  return sistemaEscuro ? "dark" : "light";
}

/**
 * Roda no <head>, durante a leitura do HTML, antes da primeira pintura
 * (evita o "flash" de tema errado). Mantenha a lógica igual à de resolverTema;
 * o teste de paridade em tests/unit/tema.test.ts garante isso.
 */
export const scriptTemaInicial = `(function(){var s=null,e=false;try{s=localStorage.getItem(${JSON.stringify(
  CHAVE_TEMA,
)})}catch(_){}try{e=!!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)}catch(_){}document.documentElement.dataset.tema=(s==="light"||s==="dark")?s:(e?"dark":"light")})()`;

/** Mesma regra do script, para reaplicar o tema no navegador (ex.: remontagem do modo de desenvolvimento). */
export function aplicarTemaSalvo(): Tema {
  let salvo: string | null = null;
  try {
    salvo = localStorage.getItem(CHAVE_TEMA);
  } catch {
    salvo = null;
  }
  let escuro = false;
  try {
    escuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    escuro = false;
  }
  const tema = resolverTema(salvo, escuro);
  document.documentElement.dataset.tema = tema;
  return tema;
}

export function salvarTema(tema: Tema): void {
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* armazenamento bloqueado: o tema vale só nesta visita */
  }
}
