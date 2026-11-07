# Segurança da EliClothing

Resumo do que protege a loja e o que precisa ser feito antes de vender.

## O que já está implementado
- **Banco (Supabase) com RLS ligada em todas as tabelas.** Cliente comum só lê produtos/categorias/coleções ativos e os próprios pedidos; só administradoras escrevem no catálogo, nos textos e nas fotos. A coluna `role` do perfil não pode ser alterada pelo próprio usuário.
- **Pedidos só passam pelo servidor.** `criar_pedido` só roda com a chave de serviço; preços e estoque são lidos do banco (nunca do navegador); o estoque é reservado e devolvido em cancelamento/expiração.
- **Chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`) só no servidor.** Um teste automático garante que nenhum arquivo de navegador a importa.
- **Pagamento (Mercado Pago):** nenhum dado de cartão passa pelo site. O aviso de pagamento (webhook) confere a assinatura e consulta o pagamento direto na API do Mercado Pago (pedido, valor e moeda) antes de marcar como pago.
- **Painel `/admin`:** protegido no proxy e de novo em cada página/ação (`exigirAdmin`); toda alteração fica no histórico (auditoria).
- **Cabeçalhos HTTP:** Content-Security-Policy, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS (testados automaticamente).
- **Abuso:** campo-armadilha contra robôs, limite por IP (em memória) e por telefone (no banco) no pedido.
- **Dados do navegador:** a sacola guardada no navegador é revalidada ao ler (nada que vem de lá é confiável).
- **LGPD:** páginas de privacidade e termos (textos-modelo; ver pendências).

## Pendências antes de vender (responsabilidade de quem publica)
1. Revisar os textos de `/privacidade` e `/termos` com a dona da loja e, de preferência, um profissional jurídico; incluir razão social/CNPJ se houver.
2. Trocar as credenciais do Mercado Pago para **produção** (conta do cliente) e testar um pagamento real de valor baixo.
3. Ligar de novo **"Confirm email"** no Supabase e configurar e-mail próprio (SMTP), pois o e-mail padrão do Supabase tem limite baixo.
4. Definir `NEXT_PUBLIC_SITE_URL` com o domínio final (https) e conferir se a Vercel está no plano **Pro** (o plano gratuito não permite uso comercial).
5. Ativar verificação em duas etapas (2FA) nas contas de GitHub, Vercel, Supabase e Mercado Pago de quem administra.
6. Guardar as chaves (Supabase, Mercado Pago) só nas variáveis de ambiente da Vercel e no `.env.local`; nunca no repositório, em chat ou em prints.
7. Limitar o acesso ao painel: dar papel de administradora só a quem precisa (aba **Equipe**).
8. Considerar um captcha (Cloudflare Turnstile, gratuito) no pedido se aparecerem pedidos falsos.

## Limitações conhecidas
- Limite por IP é por instância do servidor (best effort); o limite por telefone no banco vale para todas.
- Pagamento aprovado depois que o pedido expirou fica só no log: o reembolso é manual no painel do Mercado Pago.
- A CSP usa `'unsafe-inline'` em scripts (necessário para o Next.js atual sem nonce).
