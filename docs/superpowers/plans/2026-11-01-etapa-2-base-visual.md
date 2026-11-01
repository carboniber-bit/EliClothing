# Etapa 2 — Base do projeto e identidade visual: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o projeto Next.js da EliClothing com identidade visual rosa/bordô, tema claro e escuro, navegação, home e catálogo (ambos com estado vazio honesto), responsivo e acessível, sem banco de dados ainda.

**Architecture:** App Router com componentes pequenos por responsabilidade. Os dados do catálogo passam por uma única interface (`RepositorioCatalogo`) que hoje devolve lista vazia e será trocada pela versão Supabase na Etapa 5a. Cores vivem como variáveis CSS (claro/escuro) e viram utilitários Tailwind.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind (versões que o `create-next-app@latest` instalar; registrar em `PROGRESSO.md`), Vitest + React Testing Library + jsdom, Playwright + `@axe-core/playwright`, fontes self-hosted `@fontsource-variable/playfair-display` e `@fontsource-variable/manrope` (o `next/font/google` baixa do Google no build e o ambiente só alcança registros npm e GitHub).

**Spec:** `docs/superpowers/specs/2026-11-01-eliclothing-design.md` (seções 1, 3, 8, 9-Etapa 2).

## Global Constraints
- Nome da loja `EliClothing`; Instagram `https://www.instagram.com/eliclothing_/`; cidade `Osasco-SP`; lema `Vista-se para impressionar (você mesma)`.
- Cores: rosa-pó `#FCE8E4`, rosa-chiclete `#F2A7B8`, bordô `#6B1F2E`, creme `#FFF8F5`; escuro com fundo `#1E1015`. Rosa-chiclete nunca como fundo de texto branco.
- Fontes: Playfair Display (títulos), Manrope (texto). Idioma `pt-BR`.
- Contraste mínimo WCAG AA (4,5:1) para texto em ambos os temas.
- Nenhum produto, preço ou foto fictícios; nenhum botão sem função; WhatsApp oficial da loja `(11) 97302-9002`, guardado como `'11973029002'` (confirmado pelo usuário em 2026-11-01); o botão só aparece se o número existir.
- Sem segredos no repositório; `.env.example` sem valores; `.env*.local` no `.gitignore`.
- Preços no domínio em **centavos inteiros**.
- Mensagens de commit em português, terminando com as duas linhas `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` e `Claude-Session: https://claude.ai/code/session_01DWnwCHw17ftxi3dtCPmE2w`.
- Ao fim de cada tarefa: atualizar `TODO.md` e `PROGRESSO.md` (só com resultados realmente observados) e dar `git push`.

## Review Focus
1. Usuário com preferência de sistema escura não deve ver flash branco no primeiro carregamento (tarefa 2).
2. `localStorage` bloqueado ou com valor inválido não pode quebrar o tema; cai no do sistema (tarefa 2).
3. Catálogo e home vazios não mostram produto falso nem link/botão morto (tarefas 4 e 5).
4. Telas de 320 px e zoom de texto a 200% sem rolagem horizontal; nome de produto muito longo não estoura o cartão (tarefas 4 e 6).
5. Menu do celular usável só com teclado: abre, `Esc` fecha e devolve o foco ao botão (tarefa 3).

## Estrutura de arquivos
- `src/app/layout.tsx` (html, fontes, script de tema, Header/Footer, metadata) · `src/app/globals.css` (tokens) · `src/app/page.tsx` (home) · `src/app/catalogo/page.tsx` · `src/app/not-found.tsx`
- `src/components/layout/{Logo,Header,MenuMobile,Footer,ThemeToggle}.tsx` · `src/components/ui/{Botao,EstadoVazio}.tsx` · `src/components/catalogo/{ProdutoCard,GradeProdutos}.tsx` · `src/components/home/Hero.tsx`
- `src/lib/tema.ts` · `src/lib/design/contraste.ts` · `src/lib/loja/config.ts` · `src/lib/catalogo/{produto.ts,repositorio.ts}`
- `tests/unit/*.test.ts(x)` · `tests/e2e/*.spec.ts` · `vitest.config.ts` · `playwright.config.ts` · `.github/workflows/ci.yml` · `README.md` · `.env.example`

---

### Task 1: Projeto base e ferramentas de teste
**Files:** Create: projeto Next.js na raiz, `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `README.md`, `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`. Modify: `.gitignore`, `package.json` (scripts).

**Interfaces:** Produces: scripts `npm run dev|build|lint|test|test:e2e`; alias `@/*` → `src/*`; Playwright em `http://localhost:3100` com `webServer: npm run build && npm run start -- --port 3100`.

- [ ] **Step 1:** Rodar `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm` na raiz (se recusar por arquivos existentes, gerar em subpasta temporária e copiar tudo, preservando `docs/`, `TODO.md`, `PROGRESSO.md`, `.git`). Anotar as versões instaladas.
- [ ] **Step 2:** Instalar dev: `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test @axe-core/playwright`; instalar: `@fontsource-variable/playfair-display @fontsource-variable/manrope`. Scripts `test` = `vitest run`, `test:e2e` = `playwright test`.
- [ ] **Step 3:** Escrever teste que falha: `smoke.test.ts` (`1 + 1` igual a `2`) e `smoke.spec.ts` (`page.goto('/')` e `await expect(page).toHaveTitle(/EliClothing/)`). Rodar ambos. Esperado: unit passa; e2e **falha** (título padrão do Next).
- [ ] **Step 4:** Em `layout.tsx`, `metadata.title = { default: 'EliClothing', template: '%s · EliClothing' }`, `lang="pt-BR"`. Criar `.env.example` com `NEXT_PUBLIC_SITE_URL=` vazio e `README.md` curto (o que é, como rodar, como testar).
- [ ] **Step 5:** Rodar `npx playwright install chromium`. Se o download for bloqueado neste ambiente, registrar em `PROGRESSO.md` que o e2e roda só no CI/máquina do usuário (Task 6) e seguir. Rodar `npm test`, `npm run lint`, `npm run build` e `npm run test:e2e`. Esperado: passam (e2e só se o navegador instalou).
- [ ] **Step 6:** Commit `chore: projeto base Next.js com testes` e push.

### Task 2: Tokens visuais e tema claro/escuro
**Files:** Create: `src/lib/tema.ts`, `src/lib/design/contraste.ts`, `src/components/layout/ThemeToggle.tsx`, `tests/unit/{tema,contraste}.test.ts`, `tests/e2e/tema.spec.ts`. Modify: `src/app/globals.css`, `src/app/layout.tsx`.

**Interfaces:** Produces (`tema.ts`): `type Tema = 'light' | 'dark'`; `const CHAVE_TEMA = 'eli-tema'`; `resolverTema(salvo: string | null, sistemaEscuro: boolean): Tema` (salvo válido vence; qualquer outro valor usa o sistema); `scriptTemaInicial: string` (JS inline que define `document.documentElement.dataset.tema`). Produces (`contraste.ts`): `razaoContraste(hexA: string, hexB: string): number`. CSS: `:root` = claro, `[data-tema="dark"]` = escuro; variáveis `--fundo --superficie --texto --texto-suave --acento --primario --primario-texto --borda`, expostas ao Tailwind como `bg-fundo`, `text-texto`, etc.

- [ ] **Step 1:** Testes que falham: `resolverTema('dark', false) === 'dark'`; `resolverTema('light', true) === 'light'`; `resolverTema(null, true) === 'dark'`; `resolverTema('banana', true) === 'dark'`; `resolverTema('', false) === 'light'`. `razaoContraste('#000000','#FFFFFF') ≈ 21` (precisão 0,01). Teste de **paridade do script**: executar `scriptTemaInicial` com `vm`/`new Function` usando `localStorage` e `matchMedia` falsos e comparar `dataset.tema` com `resolverTema` para as 5 combinações acima, incluindo `localStorage.getItem` que lança erro (deve cair no sistema).
- [ ] **Step 2:** Teste de contraste lendo `src/app/globals.css` (regex nos blocos `:root` e `[data-tema="dark"]`): em cada tema, `texto/fundo`, `texto/superficie`, `texto-suave/fundo` e `primario-texto/primario` ≥ 4,5. Rodar todos; esperado: FALHAM (nada implementado).
- [ ] **Step 3:** Implementar `tema.ts` e `contraste.ts`. Definir os tokens em `globals.css` com os valores das Global Constraints (escolher para `--texto-suave` um tom mais claro que o bordô que ainda passe em 4,5). Carregar as fontes com `import '@fontsource-variable/...'` e declarar `--fonte-titulo`/`--fonte-texto`. Em `layout.tsx`, inserir o `scriptTemaInicial` no `<head>` e `suppressHydrationWarning` no `<html>`. Respeitar `prefers-reduced-motion` (transições zeradas).
- [ ] **Step 4:** `ThemeToggle` (botão com `aria-label` "Alternar tema claro/escuro", ícone sol/lua, grava `CHAVE_TEMA` dentro de `try/catch`, sem erro se o armazenamento falhar).
- [ ] **Step 5:** `tema.spec.ts`: (a) com `emulateMedia({ colorScheme: 'dark' })` e sem valor salvo, `html[data-tema="dark"]` já existe no primeiro `domcontentloaded`, antes da hidratação; (b) clicar no botão troca o tema e recarregar mantém a escolha; (c) com `localStorage.setItem('eli-tema','lixo')` a página abre sem erro de console e segue o sistema.
- [ ] **Step 6:** Rodar unit + e2e. Esperado: passam. Commit `feat: tokens visuais e tema claro/escuro` e push.

### Task 3: Estrutura da página (cabeçalho, rodapé, navegação)
**Files:** Create: `src/lib/loja/config.ts`, `src/components/layout/{Logo,Header,MenuMobile,Footer}.tsx`, `src/components/ui/Botao.tsx`, `src/app/not-found.tsx`, `tests/unit/whatsapp.test.ts`, `tests/e2e/navegacao.spec.ts`. Modify: `src/app/layout.tsx`.

**Interfaces:** Produces: `loja` (`nome`, `slogan`, `cidade`, `instagramUrl`, `instagramUsuario: '@eliclothing_'`, `whatsappNumero: string | null` = `'11973029002'`); `linkWhatsapp(numero: string | null, mensagem?: string): string | null` (retorna `https://wa.me/55DDDNÚMERO` com `?text=` codificado; aceita máscara e remove não dígitos; prefixa `55` se tiver 10 ou 11 dígitos; `null` se inválido ou `null`); `<Botao variante="primario"|"secundario" href? onClick?>`.

- [ ] **Step 1:** Testes que falham em `whatsapp.test.ts`: `linkWhatsapp('(11) 91234-5678') === 'https://wa.me/5511912345678'`; com mensagem `'Olá, quero ver o pedido #12'` anexa `?text=Ol%C3%A1%2C%20quero%20ver%20o%20pedido%20%2312`; `linkWhatsapp(null) === null`; `linkWhatsapp('123') === null`; `linkWhatsapp('5511912345678')` não duplica o `55`. (Números de teste fictícios; o número real da loja só aparece em `config.ts`.)
- [ ] **Step 2:** Implementar `config.ts`. Implementar `Logo` (marca em texto: "ELI" em Playfair e "CLOTHING" em caixa-alta espaçada; trocar pelo arquivo do logo **sem telefone** quando o usuário enviar), `Header` (logo, links Início/Catálogo/Instagram, `ThemeToggle`, `MenuMobile` abaixo de 768 px), `Footer` (nome, cidade, link do Instagram com `rel="noopener noreferrer"`, botão de WhatsApp só se `linkWhatsapp(loja.whatsappNumero)` não for `null`), link "Pular para o conteúdo", `<main id="conteudo">`, `not-found` amigável com botão para a home.
- [ ] **Step 3:** `navegacao.spec.ts`: no desktop os links levam a `/` e `/catalogo`; o Instagram tem `href` exato e `target="_blank"`; o rodapé mostra um botão de WhatsApp com `href` exato `https://wa.me/5511973029002`, `target="_blank"` e `rel="noopener noreferrer"`; a rota `/nao-existe` mostra a página 404 com link para a home. No viewport 390×844: o menu abre pelo botão (`aria-expanded` verdadeiro), `Esc` fecha e o foco volta ao botão; `Tab` não sai do menu aberto para o conteúdo atrás; sem rolagem horizontal (`document.documentElement.scrollWidth <= clientWidth`).
- [ ] **Step 4:** Rodar unit + e2e + `npm run lint`. Esperado: passam. Commit `feat: cabeçalho, rodapé e navegação` e push.

### Task 4: Domínio e páginas do catálogo (vazio)
**Files:** Create: `src/lib/catalogo/{produto.ts,repositorio.ts}`, `src/components/ui/EstadoVazio.tsx`, `src/components/catalogo/{ProdutoCard,GradeProdutos}.tsx`, `src/app/catalogo/page.tsx`, `tests/unit/{produto,produto-card}.test.ts(x)`, `tests/e2e/catalogo.spec.ts`.

**Interfaces:** Produces: tipos `Variacao { id; tamanho; cor; estoque: number }` e `Produto { id; slug; nome; precoCentavos; precoPromocionalCentavos: number | null; imagemPrincipalUrl: string | null; novidade; destaque; variacoes: Variacao[] }`; `precoFinal(p): number` (promocional só se menor que o preço normal); `temEstoque(p): boolean` (alguma variação com `estoque > 0`); `formatarPreco(centavos: number): string` (`12990 → "R$ 129,90"`, com espaço comum, sem NBSP); `interface RepositorioCatalogo { listarProdutos(): Promise<Produto[]>; listarNovidades(limite: number): Promise<Produto[]> }`; `obterRepositorio(): RepositorioCatalogo` (hoje devolve o repositório vazio; **único ponto de troca** para a Etapa 5a); `<ProdutoCard produto>`, `<GradeProdutos produtos>`, `<EstadoVazio titulo texto acao?>`.

- [ ] **Step 1:** Testes que falham: `formatarPreco(12990)`, `formatarPreco(5)` → `"R$ 0,05"`, `formatarPreco(100000)` → `"R$ 1.000,00"`; `precoFinal` ignora promoção maior ou igual ao preço; `temEstoque` falso sem variações e com todas em 0. Teste do `ProdutoCard` (Testing Library): mostra nome e preço; com promoção mostra o preço antigo riscado (com texto acessível "de … por …"); sem estoque mostra "Indisponível" e não oferece compra; sem imagem mostra um espaço reservado (não quebra); nome com 200 caracteres usa truncamento por CSS (classe de `line-clamp`) e o cartão mantém `min-width: 0`.
- [ ] **Step 2:** Rodar; esperado: FALHAM. Implementar `produto.ts`, `repositorio.ts` e os componentes (imagem com `next/image` e `sizes` corretos; layout em grade 2 colunas no celular, 3–4 no desktop; cartão inteiro clicável para `/produto/[slug]` **somente quando a página existir** — nesta etapa, o cartão não é link, para não criar link morto).
- [ ] **Step 3:** `/catalogo`: título, descrição curta e `GradeProdutos` alimentada por `obterRepositorio().listarProdutos()`; se vazia, `EstadoVazio` com texto "Estamos preparando a coleção. Enquanto isso, acompanhe as novidades no Instagram." e botão para o Instagram. Sem busca/filtros ainda (entram na 5a, quando houver dados). Metadata com título e descrição.
- [ ] **Step 4:** `catalogo.spec.ts`: a página mostra o estado vazio, **não** contém "R$", nem "[DEMO]", nem cartão de produto; todos os links têm `href` não vazio; passa no axe sem violações `serious`/`critical` nos dois temas.
- [ ] **Step 5:** Rodar unit + e2e. Commit `feat: domínio e página de catálogo vazio` e push.

### Task 5: Página inicial
**Files:** Create: `src/components/home/Hero.tsx`, `tests/e2e/home.spec.ts`. Modify: `src/app/page.tsx`.

**Interfaces:** Consumes: `loja`, `Botao`, `EstadoVazio`, `obterRepositorio().listarNovidades(limite)`. Produces: `/` renderizando `Hero`, seção "Novidades" e chamada para o Instagram.

- [ ] **Step 1:** `home.spec.ts` (falha primeiro): `<h1>` único contendo o lema `Vista-se para impressionar (você mesma)`; botão "Ver catálogo" leva a `/catalogo`; seção "Novidades" mostra `EstadoVazio` ("Novidades em breve") enquanto não houver produtos, sem "R$" e sem "[DEMO]"; chamada "Siga a EliClothing no Instagram" com o `href` exato do Instagram; mostra a cidade `Osasco-SP`; há apenas um `<h1>` e a ordem dos títulos não pula níveis; axe sem violações `serious`/`critical` nos dois temas.
- [ ] **Step 2:** Implementar `Hero` (título em Playfair, fundo rosa-pó com ornamento sutil em CSS, dois botões: catálogo e Instagram) e `page.tsx` (Hero + Novidades via `listarNovidades(8)`; quando houver produtos, usa `GradeProdutos`; categorias e coleções só aparecem quando existirem — nesta etapa ficam ocultas). `metadata` com `description` e Open Graph básico (nome, lema).
- [ ] **Step 3:** Rodar unit + e2e. Commit `feat: página inicial` e push.

### Task 6: Responsividade, acessibilidade, CI e fechamento
**Files:** Create: `.github/workflows/ci.yml`, `tests/e2e/responsivo.spec.ts`. Modify: `README.md`, `TODO.md`, `PROGRESSO.md`.

**Interfaces:** Consumes: todas as rotas anteriores (`/`, `/catalogo`, `/nao-existe`).

- [ ] **Step 1:** `responsivo.spec.ts`: para viewports 320×640, 390×844, 768×1024 e 1280×800, em `/`, `/catalogo` e `/nao-existe`, e nos dois temas: sem rolagem horizontal; com zoom de texto simulado (`html { font-size: 200% }`) o cabeçalho continua utilizável e sem sobreposição do conteúdo; alvos de toque do cabeçalho com pelo menos 44×44 px no celular.
- [ ] **Step 2:** Corrigir o que falhar (somente ajustes de CSS/markup; sem mudar comportamento). Conferir teclado completo (`Tab` percorre cabeçalho → conteúdo → rodapé, foco sempre visível).
- [ ] **Step 3:** `ci.yml`: em push e pull request, Node LTS, `npm ci`, `npm run lint`, `npm test`, `npx playwright install --with-deps chromium`, `npm run test:e2e`.
- [ ] **Step 4:** Rodar tudo localmente (`lint`, `test`, `build`, `test:e2e` se o navegador instalou). Registrar em `PROGRESSO.md` os números reais (testes passados/falhados), versões instaladas, o que **não** foi possível testar aqui (por exemplo, e2e se o Chromium não instalou) e a próxima ação: Etapa 3 (usuário cria o projeto no Supabase). Marcar a Etapa 2 como concluída em `TODO.md` **somente** se os testes passaram.
- [ ] **Step 5:** Commit `chore: responsividade, CI e documentação da etapa 2` e push; conferir no GitHub se o CI ficou verde e anotar o resultado.

---

## Auto-revisão (feita)
- **Cobertura da spec (Etapa 2):** estrutura (T1), identidade visual e claro/escuro (T2), navegação (T3), catálogo (T4), home (T5), responsividade (T6). Fora da etapa, por decisão: busca/filtros (5a), Supabase (3), WhatsApp real (5a, número ainda não informado).
- **Consistência de tipos:** `Produto`, `RepositorioCatalogo`, `loja`, `linkWhatsapp`, `resolverTema` usam os mesmos nomes em todas as tarefas.
- **Proporção:** o plano traz assinaturas, valores e testes; os corpos ficam a cargo de quem implementa.
