# TODO — EliClothing

## Prioridade atual
- [ ] **Etapa 1 — Análise e planejamento**
  - [x] Verificar repositório EliClothing (vazio)
  - [x] Analisar Dogão do Adriano
  - [x] Levantar identidade visual
  - [x] Conferir planos gratuitos (Vercel Hobby, Supabase)
  - [x] Escrever especificação (`docs/superpowers/specs/2026-11-01-eliclothing-design.md`)
  - [x] Usuário aprovou a especificação (2026-11-01)
  - [x] Escrever plano de implementação da Etapa 2
  - [x] Usuário revisou o plano e escolheu o modo nativo; WhatsApp confirmado
  - [x] Etapa 2 / Tarefas 1 e 2 testadas no PC do usuário (lint com 1 erro, corrigido)
  - [x] Etapa 2 / Tarefas 3, 4 e 5 testadas no PC do usuário (rodada 2)
  - [x] Etapa 2 / Tarefa 6: CSS corrigido e confirmado na rodada 3 (Playwright 74/74)
  - [x] Etapa 2: revisão final independente feita, correções verificadas (Vitest 42/42, lint, Playwright 78/78) e merge na `main` aprovado pelo usuário

## Concluído: Etapa 2 (estrutura, visual, home e catálogo vazio, claro/escuro, responsivo)

## Concluído: Etapa 3 (banco, RLS, login, recuperação de senha, primeiro admin, deploy de teste na Vercel)

## Pendências antes de vender (guardadas)
- [ ] Ligar "Confirm email" no Supabase e configurar SMTP próprio (o envio padrão é muito limitado)
- [ ] Definir `NEXT_PUBLIC_SITE_URL` na Vercel e revisar Site URL/Redirect URLs no Supabase
- [ ] Decidir plano Vercel Pro (Hobby é só não comercial)
- [ ] Validar o formato de `NEXT_PUBLIC_SUPABASE_URL` no código (alguém colou o endereço do painel)
- [ ] Pedidos: rate limit/captcha na rota que chama criar_pedido
- [ ] Logo sem telefone embutido

## Próximas etapas (não iniciadas)
- [ ] Etapa 4 — Painel administrativo (em andamento, branch etapa-4-painel)
  - [x] 4A Base + produtos + variações/estoque + categorias + botão Minha conta + sessão renovada (testado no PC: Vitest 90/90, lint, Playwright; mesclada na main)
  - [x] Visual: nova interface inspirada no Lovable (branch etapa-visual-lovable, CI verde; aguardando olhar do usuário)
  - [ ] 4B Fotos, coleções, home, conteúdo, vitrine lendo do banco
    - [x] 4B-1 fotos do produto (envio, principal, ordem, exclusão) + loja lendo produtos do banco (testado no PC: Vitest 110/110, lint, Playwright 125/125, teste manual ok)
    - [x] 4B-2a coleções no painel (criar/editar/excluir + marcar no produto) — testado no PC
    - [ ] 4B-2a+ coleções visíveis na loja (home, /catalogo, /colecoes/[slug]) — código pronto, aguardando teste
    - [ ] 4B-2b seções da home, banners, textos/WhatsApp da loja
  - [ ] 4C Pedidos, equipe, histórico
- [ ] Etapa 5a — Catálogo no banco, carrinho, pedido por WhatsApp
- [ ] Etapa 5b — Pix e cartão (Mercado Pago)
- [ ] Etapa 5c — Bot do Telegram
- [ ] Etapa 6 — Testes e melhorias
- [ ] Etapa 7 — Publicação (decidir plano Pro antes de vender)

## Fora do primeiro lançamento (guardado)
- Favoritos, cupons, cálculo automático de frete.

## Concluído
- [x] Repositório verificado, Dogão analisado, visual levantado, especificação escrita, push de teste OK
