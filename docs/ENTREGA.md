# Entrega da loja ao cliente

Lista para transferir tudo para a dona da loja sem perder o controle por engano.

## Contas que a loja precisa ter (no nome dela)
| Serviço | Para quê | O que fazer |
|---|---|---|
| GitHub | código do site | transferir o repositório (Settings > Transfer) ou adicionar como dona |
| Vercel | hospedagem (plano Pro para vender) | criar a conta da loja, importar o repositório, colocar as variáveis |
| Supabase | banco, login e fotos | transferir o projeto para a organização da loja (Settings > General > Transfer) |
| Mercado Pago | Pix e cartão | conta da loja; criar a aplicação (Checkout Pro) e usar as credenciais de **produção** |
| Domínio | endereço próprio | registrar no nome da loja e apontar para a Vercel |

## Variáveis de ambiente (Vercel > Settings > Environment Variables)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave secreta do Supabase (só servidor).
- `NEXT_PUBLIC_SITE_URL`: endereço final com https, sem barra no final.
- `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`: credenciais de produção da conta da loja.
- Webhook no Mercado Pago: `<NEXT_PUBLIC_SITE_URL>/api/mercadopago/webhook`, evento **Pagamentos**.

## Roteiro de troca
1. Criar as contas da loja e transferir GitHub/Supabase.
2. Na Vercel da loja, importar o repositório e cadastrar as variáveis acima.
3. No Supabase: Authentication > URL Configuration com o domínio final; ligar "Confirm email" com SMTP próprio.
4. No Mercado Pago da loja: criar a aplicação, pegar as credenciais de produção, cadastrar o webhook.
5. Fazer um pedido real de valor baixo (Pix e cartão), conferir que virou **Pago** e reembolsar.
6. Criar a conta de administradora da dona da loja e dar o papel (aba **Equipe**); remover o acesso de quem não precisa mais.
7. Trocar senhas e ativar 2FA em todas as contas.

## Uso do dia a dia (para a dona da loja)
- **Produtos:** Painel > Produtos > Novo produto (fotos, categoria, tamanhos e cores separados por vírgula, estoque).
- **Pedidos:** Painel > Pedidos. Pix/cartão viram **Pago** sozinhos; depois use Confirmado, Pronto e Entregue. Cancelar devolve o estoque.
- **Textos e fotos da página inicial:** abas Textos da loja e Fotos da página inicial.
- **Equipe e histórico:** abas Equipe e Histórico.
