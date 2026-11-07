# EliClothing

Loja virtual da EliClothing (moda feminina, Osasco-SP). Next.js + TypeScript + Tailwind, com Supabase (banco, login e fotos) e hospedagem na Vercel nas próximas etapas.

## Estado atual
Loja completa: catálogo, produtos, categorias e coleções, sacola, pedidos por WhatsApp e por Pix/cartão (Mercado Pago), login de clientes e painel administrativo. Falta o bot do Telegram (etapa 5c) e a publicação final.

Documentação: `docs/SEGURANCA.md` (o que protege a loja e pendências) e `docs/ENTREGA.md` (transferência para o cliente, variáveis e uso diário).

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
