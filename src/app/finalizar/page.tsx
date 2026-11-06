import type { Metadata } from "next";
import { FormularioPedido } from "@/components/carrinho/FormularioPedido";

export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false } };

export default function Finalizar() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <h1 className="mb-8 text-5xl md:text-6xl">Finalizar pedido</h1>
      <FormularioPedido />
    </div>
  );
}
