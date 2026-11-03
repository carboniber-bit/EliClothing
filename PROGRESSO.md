# PROGRESSO — EliClothing

_Última atualização: 2026-11-02 (noite)_

## Objetivo geral
Loja virtual completa da EliClothing (moda feminina, loja física e online em Osasco-SP): vitrine, carrinho, pedidos (WhatsApp, Pix e cartão), login, painel administrativo e bot do Telegram, com Supabase e Vercel, priorizando planos gratuitos.

## Decisões do usuário (2026-11-01)
- Catálogo nasce **vazio e editável**; itens, fotos e preços entram depois (pelo painel ou enviados ao Claude).
- Vercel **gratuita (Hobby) só para testes**; para vender será preciso Pro (decisão na Etapa 7).
- Finalização: **WhatsApp + Pix + cartão online** (Mercado Pago) desde o início.
- **Bot do Telegram** para avisar e confirmar pedidos.
- Visual com bastante rosa, público feminino.

## Estado real do projeto
- Repositório `carboniber-bit/EliClothing` estava vazio; agora tem a branch `main` com 1 commit (somente documentação). **Push para o GitHub testado e funcionando.**
- Nenhum código do site foi escrito. Nenhuma configuração externa foi feita.
- Etapa atual: **Etapa 1 — Análise e planejamento** (especificação escrita; aguardando revisão do usuário).

## Concluído
- Análise do repositório EliClothing (vazio) e do Dogão do Adriano.
- Identidade visual levantada dos prints/logo enviados.
- Termos conferidos: Vercel Hobby = uso pessoal/não comercial; Supabase gratuito pausa por inatividade.
- Especificação: `docs/superpowers/specs/2026-11-01-eliclothing-design.md`.

## Arquivos alterados
- `TODO.md`, `PROGRESSO.md`, `docs/superpowers/specs/2026-11-01-eliclothing-design.md` (commit `docs: especificação de design...`).

## O que está funcionando
- Apenas o repositório e a documentação (não há código de aplicação).

## BLOQUEIO ATUAL (2026-11-01) — Etapa 2, Tarefa 1
- Esta sessão **não consegue instalar pacotes**: o proxy nega o acesso ao registro do npm (`registry.npmjs.org`, erro 403 de política) e o GitHub Actions também não é acessível por aqui. Sem isso não dá para criar o projeto Next.js, rodar testes nem fazer build neste ambiente.
- Nenhum código de aplicação foi escrito. Branch de trabalho criada: `etapa-2-base-visual` (a `main` só recebe merge com aprovação do usuário).
- Decisão pendente do usuário: como seguir (ver a última mensagem da conversa). Opção recomendada: o usuário roda o comando de criação do projeto no próprio computador, envia para a branch, e o Claude continua daí; os testes passam a ser rodados no computador do usuário (ou no CI do GitHub) e os resultados colados na conversa.
- Atualização: WhatsApp oficial confirmado — (11) 97302-9002; plano da Etapa 2 ajustado (o botão do rodapé aparece).

## Atualização (2026-11-01 noite)
- Projeto base Next.js (16.4.3, React 19.3.0, Tailwind 4.3.3, Vitest 5.0.5) está na branch `etapa-2-base-visual`; `package.json` e `package-lock.json` com as dependências de teste e fontes foram recuperados do pacote do usuário.
- Ainda falta ler a documentação embutida do Next 16.4.3 (`node_modules/next/dist/docs`), exigida pelo `AGENTS.md`, antes de escrever código de aplicação. O zip enviado chegou cortado; pedir só a pasta de docs, em arquivo separado.
- Docs do Next 16.4.3 lidos (tema sem flash, testes com Vitest/Playwright, páginas estáticas).
- Rodada 1 (PC do usuário): Vitest 22/22, build OK, e2e 4/4, lint com 1 erro no ThemeToggle (corrigido).
- Rodada 2 (PC do usuário, 01/11 22:43): Vitest 42/42, lint limpo, build OK, e2e 64/74. Tarefas 3, 4 e 5 verificadas. As 10 falhas são o teste de texto a 200% em telas de 320 e 390 px: títulos com palavras longas estouravam a largura. Corrigido no CSS (`overflow-wrap`/`hyphens`); a correção foi conferida num Chromium aqui com uma página de teste, mas **reconfirmado na rodada 3.**
- Rodada 3 (PC do usuário, 01/11 22:48, commit 5d5e8a6): Vitest 42/42, ESLint limpo, build OK, Playwright 74/74. Tarefas 1–6 da Etapa 2 verificadas. O CI do GitHub ainda não foi observado (Actions inacessível desta sessão).

- Revisão final independente (2026-11-02): sem itens críticos. Corrigidos: teste de tema sem JavaScript, menu mobile (Esc global, foco, fecha ao alargar), h2 no catálogo, hover do botão secundário, CI (concurrency, artefatos). Verificação no PC do usuário no commit b0f0916: Vitest 42/42, lint limpo, Playwright 78/78. Merge na `main` aprovado pelo usuário.
- Backlog (menores): cartão de produto sem e2e com produtos reais (Etapa 5a), `images.remotePatterns` e Suspense/`use cache` ao ligar o Supabase, favicon/SVGs não usados, contraste do marcador ELI.

## Etapa 3 (em andamento, branch `etapa-3-banco-auth`)
- Projeto Supabase criado pelo usuário (região São Paulo).
- Migrações 0001–0004 escritas (tabelas, RLS, auditoria, pedido com reserva atômica de estoque, bucket de fotos) e **testadas aqui** num PostgreSQL 16 temporário com 64 verificações (visitante, cliente, admin, estoque, Pix expirado, fotos). Testei também sabotando a segurança de propósito: os testes falharam como deveriam.
- Banco instalado no Supabase real pelo usuário (2026-11-02). Telas de entrar/cadastrar/recuperar senha/nova senha/conta e área /admin protegida (proxy + checagem no servidor) escritas.
- Verificado no PC do usuário (sem Supabase configurado): Vitest 59/59, ESLint limpo, Playwright 122/122. Teste manual contra o Supabase real: cadastro, login, conta promovida a administradora por SQL e acesso a /admin OK.
- Achado no teste real: desligar o provedor Email no Supabase bloqueia cadastros (`email_provider_disabled`); "Confirm email" ficou LIGADO — confirmar por SQL em teste. Antes de vender: configurar SMTP próprio (o envio padrão é muito limitado).
- Falta: revisão final, deploy de teste na Vercel (variáveis NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL), URLs de redirecionamento no Supabase, testar recuperação de senha por e-mail.

## Erros conhecidos / pendências
- Aviso do GitHub: o repositório "mudou de local" (`EliClothing`, maiúsculas); o envio funcionou mesmo assim.
- Cores aproximadas; confirmar com o logo original (o logo recebido traz o telefone embutido; é preciso uma versão sem o telefone).

## Testes executados
- `git push` de teste: OK. Demais testes: nenhum ainda (não há código).

## Aprovações
- 2026-11-01: usuário **aprovou a especificação**. Regra nova: sem login, o checkout pede só o essencial para o pagamento (registrada na seção 5 da especificação).
- Plano da Etapa 2 escrito: `docs/superpowers/plans/2026-11-01-etapa-2-base-visual.md` (6 tarefas). **Aguardando o usuário revisar e escolher o método de execução.**

## Próxima ação exata
Etapa 3: Supabase (banco, RLS, login, primeiro admin) e deploy de teste na Vercel; usuário cria o projeto no Supabase com passo a passo.

## Configurações externas que dependem do usuário (nada agora)
- Etapa 3: criar projeto no Supabase e conectar a Vercel (passo a passo será dado).
- Etapa 5a: WhatsApp oficial da loja. 5b: conta Mercado Pago com chave Pix e credenciais de teste. 5c: criar o bot no BotFather e obter o chat ID.
- Quando houver: logo sem telefone, produtos, fotos e preços.
