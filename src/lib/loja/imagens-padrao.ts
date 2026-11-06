import telha from "@/assets/conjunto-telha.jpg";
import fotoLoja from "@/assets/foto-loja.jpg";
import roxo from "@/assets/vestido-roxo.jpg";
import vermelho from "@/assets/vestido-vermelho.jpg";
import type { ChaveImagem } from "./imagens";

/** Fotos originais da loja, usadas quando nenhuma foto foi enviada pelo painel. */
export const PADROES_IMAGEM = {
  imagem_topo: roxo,
  imagem_sobre: vermelho,
  imagem_sobre_detalhe: fotoLoja,
  imagem_instagram_1: telha,
  imagem_instagram_2: roxo,
  imagem_instagram_3: fotoLoja,
  imagem_instagram_4: vermelho,
} satisfies Record<ChaveImagem, typeof roxo>;
