# EliClothing

Loja virtual da EliClothing (moda feminina, Osasco-SP). Next.js + TypeScript + Tailwind, com Supabase (banco, login e fotos) e hospedagem na Vercel nas próximas etapas.

## Estado atual
Etapa 2 em andamento: estrutura, identidade visual (rosa/bordô), tema claro/escuro, página inicial e catálogo (vazio). O catálogo ainda não tem banco de dados; os produtos serão cadastrados depois pelo painel administrativo.

## Como rodar
```
npm install
npm run dev        # site em http://localhost:3000
npm test           # testes unitários (Vitest)
npm run lint       # ESLint
npm run build      # build de produção
npx playwright install chromium   # só na primeira vez
npm run test:e2e   # testes no navegador (Playwright)
```

## Acompanhamento
- `TODO.md`: tarefas pendentes e concluídas.
- `PROGRESSO.md`: estado real do projeto, testes executados e próxima ação.
- `docs/superpowers/specs/`: especificação. `docs/superpowers/plans/`: planos de implementação.

Nunca coloque senhas, tokens ou chaves neste repositório. Use `.env.local` (ignorado pelo git); veja `.env.example`.
