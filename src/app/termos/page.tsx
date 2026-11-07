import type { Metadata } from "next";
import { PaginaTexto } from "@/components/layout/PaginaTexto";

export const metadata: Metadata = { title: "Termos de compra" };

export default function Termos() {
  return (
    <PaginaTexto titulo="Termos de compra" atualizado="novembro de 2026">
      <h2>Pedidos e estoque</h2>
      <p>As peças têm estoque limitado. Ao enviar o pedido, as peças ficam reservadas para você. Pedidos de Pix ou cartão ficam reservados por 30 minutos; se o pagamento não for feito nesse prazo, o pedido expira e as peças voltam para a loja.</p>

      <h2>Preços e pagamento</h2>
      <p>Os preços estão em reais e podem mudar sem aviso, mas o valor mostrado no momento do pedido é o que vale para ele. Você pode pagar com Pix ou cartão, na página segura do Mercado Pago, ou combinar o pagamento pelo WhatsApp.</p>

      <h2>Entrega e retirada</h2>
      <p>Você pode retirar na loja, em Osasco-SP, ou receber em casa. O frete e o prazo de entrega são combinados pelo WhatsApp depois do pedido.</p>

      <h2>Trocas e devolução</h2>
      <ul>
        <li>Compras feitas pela internet podem ser desfeitas em até 7 dias corridos após o recebimento (direito de arrependimento, art. 49 do Código de Defesa do Consumidor), com a peça sem uso e com etiqueta.</li>
        <li>Peças com defeito têm a troca ou o reembolso garantidos pelo Código de Defesa do Consumidor.</li>
        <li>Para pedir troca ou devolução, fale com a gente pelo WhatsApp que está no rodapé do site.</li>
      </ul>

      <h2>Cores e tamanhos</h2>
      <p>As cores podem ter pequenas diferenças de tom por causa da tela. Confira o tamanho antes de comprar; em dúvida, pergunte pelo WhatsApp.</p>

      <h2>Privacidade</h2>
      <p>Veja como cuidamos dos seus dados na <a href="/privacidade">política de privacidade</a>.</p>
    </PaginaTexto>
  );
}
