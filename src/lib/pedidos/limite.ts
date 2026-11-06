const registros = new Map<string, number[]>();

/**
 * Limite simples em memória (por instância do servidor): conta tentativas na janela e diz se passou do máximo.
 * É uma barreira extra; o limite que vale entre instâncias é o feito no banco (por telefone).
 */
export function limiteExcedido(chave: string, maximo: number, janelaMs: number, agora = Date.now()): boolean {
  const recentes = (registros.get(chave) ?? []).filter((t) => agora - t < janelaMs);
  recentes.push(agora);
  registros.set(chave, recentes);
  if (registros.size > 5000) for (const [k, v] of registros) if (v.every((t) => agora - t >= janelaMs)) registros.delete(k);
  return recentes.length > maximo;
}
