# EliClothing — Especificação de design

_Data: 2026-11-01 · Status: **aguardando revisão do usuário** (nenhum código escrito)_

## 1. Objetivo e decisões já tomadas
Loja virtual da EliClothing (moda feminina, loja física e online em Osasco-SP) com vitrine, carrinho, pedidos, login e painel administrativo simples para a dona da loja.

Decisões do usuário:
- O **catálogo nasce vazio e editável**: itens, fotos e preços serão cadastrados depois pelo painel (ou enviados ao Claude para cadastrar). Nada fictício aparece como real: sem produtos, a loja mostra "Novidades em breve". Dados de demonstração só existem num script opcional, marcados "[DEMO]", nunca no banco de produção.
- **Vercel gratuita (Hobby) só para testes.** Os termos oficiais limitam o plano Hobby a uso pessoal e não comercial; para vender de verdade será preciso o plano Pro (a documentação lista US$ 20 por usuário/mês). Decisão adiada para a Etapa 7. Supabase gratuito pausa projetos após cerca de uma semana sem uso (informação de fonte não oficial; conferir no painel).
- **Três formas de finalizar:** WhatsApp, Pix e cartão online (Mercado Pago).
- **Bot do Telegram** para avisar e confirmar pedidos.
- Estilo: muito rosa, público feminino, elegante e romântico.

Padrões por omissão (mudam se o usuário pedir): compra **sem exigir login** (login opcional para histórico e perfil); **sem cálculo automático de frete** (retirada na loja ou entrega combinada pelo WhatsApp); **favoritos e cupons ficam fora do primeiro lançamento**.

## 2. Aproveitado do Dogão do Adriano × diferente aqui
| Aproveitado (conceito) | Diferente na EliClothing |
|---|---|
| Servidor recalcula preço e total; navegador nunca decide valor | Next.js + TypeScript em vez de HTML único gigante |
| Admin conferido no servidor, nunca só escondendo botão | RLS com políticas reais (`is_admin()`); o admin escreve com a própria sessão, não com chave mestra |
| Auditoria de mudanças | Auditoria por **gatilhos no banco** (não depende do código lembrar) |
| Tabela `config` editável | Produtos com variações (tamanho/cor/estoque), fotos e coleções |
| Webhook idempotente do Mercado Pago; Pix dentro do site | Sessão por cookie seguro (não `localStorage`); webhook confere o pagamento na API antes de marcar pago |
| README, `TODO.md`, `PROGRESSO.md`, testes com simuladores | Fora: horário de funcionamento, bairros, pães, adicionais |

## 3. Arquitetura
- **Stack:** Next.js (App Router) + TypeScript + Tailwind; Supabase (Postgres, Auth, Storage); Vercel. Validação com Zod. Testes: Vitest (regras) e Playwright (telas).
- **Estrutura:** `src/app/(loja)` (público), `src/app/admin`, `src/app/api/webhooks/{mercadopago,telegram}`, `src/lib/{supabase,pedidos,pagamentos,telegram,validacao}`, `src/components`, `supabase/migrations/*.sql`, `tests/`, `docs/`.
- **Quem escreve o quê:**
  - Público lê só dados ativos, direto pelo Supabase, protegido por RLS.
  - **Admin** grava com a sessão do próprio usuário; o banco confere `is_admin()` em cada operação.
  - **Pedidos e webhooks** passam por rotas do servidor com a chave de serviço (variável de ambiente, nunca no navegador); preço, estoque e total são sempre recalculados lá.
- **Segredos:** só em variáveis de ambiente (Vercel e `.env.local` ignorado pelo git). O repositório inclui `.env.example` sem valores.

## 4. Banco de dados (resumo)
- `perfis` (id, email, nome, telefone, `role` cliente|admin). O usuário não consegue alterar o próprio `role`.
- `categorias` (com `pai_id` para subcategorias, ordem, ativo) e `colecoes` + ligação com produtos.
- `produtos` (nome, slug, descrição, preço, preço promocional, ativo, destaque, novidade) e `variacoes` (produto, tamanho, cor, **estoque**, ativo).
- `imagens` (produto, caminho no Storage, ordem, principal).
- `secoes_home` (blocos da página inicial: tipo, título, ordem, ativo) e `banners` — assim o dono cria e liga/desliga seções sem código.
- `config_loja` (chave/valor: contatos, WhatsApp, redes, textos, informações da loja).
- `pedidos` (número curto, user_id opcional, nome, telefone, retirada|entrega, endereço, obs, subtotal, total, forma de pagamento whatsapp|pix|cartao, status, id do pagamento) e `itens_pedido` (**cópia** do nome, tamanho, cor e preço na hora da compra).
- `auditoria` (quem, quando, tabela, antes/depois), preenchida por gatilhos em produtos, variações, preços, estoque e configurações.
- **RLS:** público lê apenas produtos, variações, imagens, categorias, seções e config marcados como públicos/ativos; pedidos e perfis são privados (cliente vê só os seus); escrita administrativa exige `is_admin()`. Storage: leitura pública do bucket `produtos`; envio/remoção só admin; limite de 5 MB e tipos jpeg/png/webp.
- **Estoque:** uma função SQL cria o pedido e **reserva** o estoque numa única transação (impede vender o que acabou). Cancelado/expirado devolve o estoque. Sem cron (o plano gratuito é limitado): a expiração do Pix é aplicada pelo webhook, ao abrir o pedido e por botão no painel.
- **Primeiro admin:** cria-se a conta pelo site e roda-se uma linha de SQL com o e-mail do dono (mesma ideia do Dogão), explicada passo a passo.

## 5. Pedidos e pagamentos
1. Cliente monta o carrinho (tamanho/cor obrigatórios) e informa nome, telefone e retirada/entrega.
2. O servidor valida, recalcula, reserva estoque e grava o pedido. Daí:
   - **WhatsApp:** abre o WhatsApp da loja com o resumo e o número do pedido; status "a combinar".
   - **Pix:** cria o pagamento no Mercado Pago e mostra QR code e "copia e cola" no próprio site; confere o status a cada poucos segundos.
   - **Cartão:** Checkout Pro do Mercado Pago (o cartão não passa pelo nosso site).
3. **Webhook do Mercado Pago:** valida a assinatura, **consulta o pagamento na API** do Mercado Pago (não confia no que chegou) e marca como pago uma única vez.
4. Exige conta do Mercado Pago da dona da loja, com chave Pix cadastrada. O Mercado Pago cobra taxa por venda (conferir na conta). Nada de pagamento simulado como real: em teste usam-se as credenciais de teste do próprio Mercado Pago.

## 6. Bot do Telegram
- Cada pedido novo (e cada Pix aprovado) gera uma mensagem no chat da loja com resumo e botões **Confirmar**, **Pronto** e **Cancelar**.
- O toque no botão chega a `/api/webhooks/telegram`, que confere o segredo do webhook e se o chat/pessoa está na lista autorizada, atualiza o status, registra na auditoria ("telegram") e edita a mensagem. Falha do Telegram nunca derruba o pedido.
- Gratuito. O token do bot fica só nas variáveis de ambiente.

## 7. Painel administrativo
Dashboard (produtos, disponíveis, sem estoque, pedidos novos, vendas do período) · Produtos (criar/editar/excluir, preço e promoção, variações e estoque, ativar, destaque/novidade) · Fotos (várias por produto, principal, ordem, prévia; funciona no celular) · Categorias, coleções e seções da home · Conteúdo (banners, textos, contato, redes) · Pedidos (status, histórico, destaque de novos) · Equipe · Histórico de alterações. Textos digitados por clientes são escapados.

## 8. Identidade visual (cores estimadas dos prints; ajustar com o logo original)
- **Cores:** rosa-pó `#FCE8E4` (fundo), rosa-chiclete `#F2A7B8` (destaque), bordô `#6B1F2E` (texto e botões principais), creme `#FFF8F5`. Modo escuro: bordô profundo `#1E1015` com rosas de destaque.
- **Tipografia:** Playfair Display (títulos) e Manrope (texto). Botões principais em bordô com texto creme (contraste AA); rosa-chiclete só como acento, não como fundo de texto branco.
- **Interação:** animações curtas e discretas, foco visível, alvos de toque grandes, imagens otimizadas e carregamento rápido; layout pensado primeiro para celular.
- O logo recebido traz o telefone embutido na imagem: para o site é preciso uma versão **sem o telefone** (pedir ao usuário quando chegar a hora).

## 9. Etapas e critérios de conclusão
| Etapa | Entrega | Depende do usuário |
|---|---|---|
| 2 | Projeto base, tokens visuais, home com estado vazio, catálogo (vazio), claro/escuro, responsivo | Nada |
| 3 | Migrações SQL, RLS, login/cadastro/recuperação, perfis, primeiro admin, **deploy de teste na Vercel** | Criar projeto no Supabase e rodar o SQL; conectar Vercel (passo a passo) |
| 4 | Painel completo, fotos, categorias, seções, conteúdo, auditoria | Nada (usar o painel) |
| 5a | Catálogo ligado ao banco, busca/filtros/ordenação, carrinho, pedido por WhatsApp registrado | WhatsApp oficial da loja |
| 5b | Pix e cartão (Mercado Pago) | Conta Mercado Pago, chave Pix, credenciais de teste |
| 5c | Bot do Telegram | Criar o bot no BotFather e pegar o chat ID |
| 6 | Testes completos (login, permissões, upload, estoque, pagamentos simulados, celular), segurança, desempenho | Testar no celular |
| 7 | Produção, domínio, documentação para a dona; decisão do plano Pro antes de vender | Decidir Pro/domínio |

Uma etapa só é marcada concluída depois de testada, com o resultado registrado em `PROGRESSO.md` e `TODO.md`.

## 10. Riscos
- Hobby é só para teste (item 1). Supabase gratuito pode pausar por inatividade.
- Sem cron no plano gratuito: expiração do Pix feita de forma "preguiçosa" (item 4).
- Dados reais (produtos, preços, fotos, WhatsApp) ainda não existem; serão inseridos depois.
- O push para o GitHub ainda não foi testado nesta sessão.
