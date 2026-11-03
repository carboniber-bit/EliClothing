-- EliClothing — 0001: tabelas, restrições e índices.
-- Valores em centavos (inteiros). Nada aqui libera acesso: isso é feito em 0002 (RLS).

create extension if not exists pgcrypto;

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nome text,
  telefone text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  criado_em timestamptz not null default now()
);

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(btrim(nome)) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  pai_id uuid references public.categorias (id) on delete set null,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  check (pai_id is distinct from id)
);

create table public.colecoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(btrim(nome)) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descricao text,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(btrim(nome)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descricao text,
  preco_centavos int not null check (preco_centavos >= 0),
  preco_promocional_centavos int check (preco_promocional_centavos >= 0),
  categoria_id uuid references public.categorias (id) on delete set null,
  ativo boolean not null default true,
  destaque boolean not null default false,
  novidade boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (preco_promocional_centavos is null or preco_promocional_centavos < preco_centavos)
);
create index produtos_categoria_idx on public.produtos (categoria_id);
create index produtos_ativo_idx on public.produtos (ativo, criado_em desc);

create table public.produto_colecoes (
  produto_id uuid not null references public.produtos (id) on delete cascade,
  colecao_id uuid not null references public.colecoes (id) on delete cascade,
  primary key (produto_id, colecao_id)
);

create table public.variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  tamanho text not null default 'Único' check (length(btrim(tamanho)) between 1 and 20),
  cor text not null default '' check (length(cor) <= 40),
  estoque int not null default 0 check (estoque >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (produto_id, tamanho, cor)
);

create table public.imagens (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  caminho text not null check (length(caminho) between 1 and 300),
  ordem int not null default 0,
  principal boolean not null default false,
  criado_em timestamptz not null default now()
);
create unique index imagens_uma_principal_idx on public.imagens (produto_id) where principal;

create table public.secoes_home (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('banner', 'novidades', 'destaques', 'colecao', 'texto')),
  titulo text,
  ordem int not null default 0,
  ativo boolean not null default true,
  config jsonb not null default '{}'::jsonb
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  imagem_caminho text,
  link text,
  ordem int not null default 0,
  ativo boolean not null default true
);

-- Textos e contatos editáveis. Segredos NUNCA entram aqui (ficam em variáveis de ambiente).
create table public.config_loja (
  chave text primary key check (chave ~ '^[a-z0-9_]+$'),
  valor text,
  publico boolean not null default true
);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity (start with 1001) unique,
  user_id uuid references auth.users (id) on delete set null,
  nome text not null check (length(btrim(nome)) between 1 and 120),
  telefone text not null check (length(btrim(telefone)) between 8 and 20),
  tipo_entrega text not null check (tipo_entrega in ('retirada', 'entrega')),
  endereco text,
  observacao text check (length(observacao) <= 500),
  subtotal_centavos int not null check (subtotal_centavos >= 0),
  total_centavos int not null check (total_centavos >= 0),
  forma_pagamento text not null check (forma_pagamento in ('whatsapp', 'pix', 'cartao')),
  status text not null default 'novo'
    check (status in ('novo', 'aguardando_pagamento', 'pago', 'confirmado', 'pronto', 'entregue', 'cancelado', 'expirado')),
  pagamento_id text,
  expira_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (tipo_entrega = 'retirada' or length(btrim(coalesce(endereco, ''))) > 0)
);
create index pedidos_user_idx on public.pedidos (user_id);
create index pedidos_status_idx on public.pedidos (status, criado_em desc);

-- Cópia do que foi comprado: continua certo mesmo se o produto mudar de preço ou sumir.
create table public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  variacao_id uuid references public.variacoes (id) on delete set null,
  produto_id uuid references public.produtos (id) on delete set null,
  nome text not null,
  tamanho text not null,
  cor text not null default '',
  preco_unitario_centavos int not null check (preco_unitario_centavos >= 0),
  quantidade int not null check (quantidade between 1 and 20)
);
create index itens_pedido_pedido_idx on public.itens_pedido (pedido_id);

create table public.auditoria (
  id bigint generated always as identity primary key,
  quando timestamptz not null default now(),
  usuario_id uuid,
  origem text not null,
  tabela text not null,
  registro_id text,
  operacao text not null,
  antes jsonb,
  depois jsonb
);
create index auditoria_quando_idx on public.auditoria (quando desc);
create index auditoria_tabela_idx on public.auditoria (tabela, registro_id);

-- Mantém atualizado_em em dia.
create function public.tocar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

create trigger produtos_atualizado before update on public.produtos
  for each row execute function public.tocar_atualizado_em();
create trigger pedidos_atualizado before update on public.pedidos
  for each row execute function public.tocar_atualizado_em();
