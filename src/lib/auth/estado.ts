import type { ErrosCampos } from "@/lib/validacao/auth";

/** Resultado de uma ação de formulário (login, cadastro...). */
export type EstadoForm = {
  erro?: string;
  sucesso?: string;
  campos?: ErrosCampos;
  valores?: Record<string, string>;
};
