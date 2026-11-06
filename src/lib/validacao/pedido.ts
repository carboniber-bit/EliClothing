import { z } from "zod";

/** Só os números do telefone; aceita +55, parênteses, traços e espaços. */
export function soDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

const telefone = z
  .string()
  .transform(soDigitos)
  .pipe(z.string().min(10, "Digite o telefone com DDD, como (11) 97302-9002.").max(13, "Telefone grande demais. Use só DDD e número."));

export const pedidoSchema = z
  .object({
    nome: z.string().trim().min(2, "Digite seu nome.").max(120, "O nome pode ter no máximo 120 letras."),
    telefone,
    tipo_entrega: z.enum(["retirada", "entrega"], "Escolha retirada ou entrega."),
    forma_pagamento: z.enum(["whatsapp", "pix", "cartao"], "Escolha como quer pagar."),
    endereco: z.string().trim().max(300, "No máximo 300 caracteres."),
    observacao: z.string().trim().max(500, "No máximo 500 caracteres."),
    // Campo escondido que gente de verdade não preenche: robôs costumam preencher tudo.
    site: z.string().max(0).optional(),
    itens: z
      .array(z.object({ variacaoId: z.uuid(), quantidade: z.number().int().min(1).max(20) }))
      .min(1, "Sua sacola está vazia.")
      .max(50),
  })
  .refine((d) => d.tipo_entrega === "retirada" || d.endereco.length >= 8, {
    path: ["endereco"],
    message: "Digite o endereço completo para a entrega (rua, número, bairro).",
  });

export type DadosPedido = z.infer<typeof pedidoSchema>;
