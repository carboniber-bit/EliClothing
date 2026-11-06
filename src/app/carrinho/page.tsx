import type { Metadata } from "next";
import { ListaCarrinho } from "@/components/carrinho/ListaCarrinho";

export const metadata: Metadata = { title: "Sacola", robots: { index: false } };

export default function Carrinho() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <h1 className="mb-8 text-5xl md:text-6xl">Sua sacola</h1>
      <ListaCarrinho />
    </div>
  );
}
