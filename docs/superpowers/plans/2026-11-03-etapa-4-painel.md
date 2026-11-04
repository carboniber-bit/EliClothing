# Etapa 4 — Painel administrativo (plano)

**Meta:** a dona da loja cadastra e edita tudo sem código. Spec: seção 7 de `docs/superpowers/specs/2026-11-01-eliclothing-design.md`.

**Regras que valem para tudo:**
- Escrita com a **sessão do próprio usuário** (RLS confere `is_admin()`); nunca a chave de serviço no painel.
- Toda ação do servidor chama `exigirAdmin()` antes de qualquer coisa (defesa em dobro: o banco também recusa).
- Dinheiro em centavos inteiros; o formulário aceita "89,90".
- Textos de clientes são escapados (React já faz); nada de `dangerouslySetInnerHTML` com dados do banco.
- Mobile primeiro (a dona usa o celular), alvos de toque ≥ 44 px, claro/escuro.
- Lógica pura com teste unitário (Vitest); telas com e2e (Playwright) onde não dependem de login real.

## Fatias (cada uma termina testada e com aprovação antes da próxima)
**4A — Base + Produtos + Categorias.** Layout do painel (menu, guarda), painel inicial com números, produtos (criar/editar/excluir/ativar, preço, promoção, destaque/novidade), variações com estoque (tamanho, cor), categorias (com subcategoria e ordem). Lógica pura: `slugify`, `reaisParaCentavos`, schemas Zod.
**4B — Fotos, coleções, home, conteúdo e vitrine ligada ao banco.** Upload ao Storage (jpeg/png/webp, 5 MB, prévia, principal, ordem), coleções, seções da home e banners, `config_loja` (WhatsApp, redes, textos), e a loja (home e catálogo) passa a ler produtos do banco com cache invalidado ao salvar.
**4C — Pedidos, equipe e histórico.** Lista de pedidos e mudança de status (função `alterar_status_pedido`), equipe (`definir_papel`), histórico de alterações (auditoria) e destaque de pedidos novos.

## Fora desta etapa
Carrinho e pedido pelo WhatsApp (5a), Pix/cartão (5b), Telegram (5c).
