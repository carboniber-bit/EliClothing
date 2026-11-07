import type { Metadata } from "next";
import { PaginaTexto } from "@/components/layout/PaginaTexto";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function Privacidade() {
  return (
    <PaginaTexto titulo="Política de privacidade" atualizado="novembro de 2026">
      <p>Esta página explica quais dados a EliClothing recebe quando você compra ou cria uma conta, para que usamos e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (LGPD).</p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>Para pedidos: nome, telefone/WhatsApp, forma de entrega, endereço (só quando você escolhe receber em casa), observações e as peças escolhidas.</li>
        <li>Para a conta: e-mail, nome e a senha, que fica guardada de forma criptografada e nunca é vista por nós.</li>
        <li>Pagamento: Pix e cartão são feitos na página do Mercado Pago. Nós <strong>não recebemos nem guardamos</strong> número de cartão; só sabemos se o pagamento foi aprovado.</li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Separar, combinar e entregar o seu pedido e falar com você sobre ele.</li>
        <li>Confirmar pagamentos e manter o histórico dos seus pedidos na sua conta.</li>
        <li>Proteger a loja contra fraudes e uso indevido.</li>
      </ul>

      <h2>Com quem compartilhamos</h2>
      <p>Só com quem é necessário para a loja funcionar: Mercado Pago (pagamentos), Supabase (banco de dados e login), Vercel (hospedagem) e WhatsApp/Telegram (contato e avisos de pedidos). Não vendemos os seus dados.</p>

      <h2>Cookies e armazenamento no navegador</h2>
      <p>Usamos apenas o essencial: a sessão de login, a sacola de compras e a escolha de tema claro ou escuro. Não usamos cookies de publicidade.</p>

      <h2>Por quanto tempo guardamos</h2>
      <p>Guardamos os pedidos pelo tempo necessário para atendimento, garantia e obrigações legais e fiscais. Você pode pedir a exclusão da sua conta quando quiser.</p>

      <h2>Seus direitos</h2>
      <p>Você pode pedir a confirmação de que tratamos seus dados, acesso, correção, anonimização ou exclusão, e informações sobre compartilhamento, conforme o art. 18 da LGPD. Para isso, fale com a gente pelo WhatsApp que está no rodapé do site.</p>
    </PaginaTexto>
  );
}
