-- EliClothing: instalação completa do banco (migrações 0001 a 0005 juntas).
-- Para um projeto NOVO. Cole TUDO no SQL Editor do Supabase e clique em Run. Rode uma única vez.

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
-- EliClothing — 0002: perfis, administradores, RLS, permissões e auditoria.

-- ---------- quem é administrador ----------
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis where id = auth.uid() and role = 'admin');
$$;

-- Todo usuário novo do Supabase Auth ganha um perfil de CLIENTE. O papel nunca vem do navegador.
create function public.criar_perfil_do_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, email, nome)
  values (new.id, new.email, nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nome', '')), ''));
  return new;
end $$;

create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil_do_usuario();

-- Administrador promove/rebaixa pela função (o próprio usuário não consegue mexer em "role").
create function public.definir_papel(p_usuario uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'apenas administradores' using errcode = '42501';
  end if;
  if p_role not in ('cliente', 'admin') then
    raise exception 'papel inválido' using errcode = '22023';
  end if;
  if p_usuario = auth.uid() and p_role <> 'admin' then
    raise exception 'você não pode remover o próprio acesso de administrador' using errcode = '22023';
  end if;
  update public.perfis set role = p_role where id = p_usuario;
end $$;

-- ---------- auditoria ----------
create function public.auditar() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  antigo jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  novo jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  base jsonb := coalesce(novo, antigo);
  origem text := coalesce(nullif(current_setting('app.origem', true), ''),
                          case when auth.uid() is null then 'sistema' else 'painel' end);
begin
  if tg_op = 'UPDATE' and antigo = novo then
    return new;
  end if;
  insert into public.auditoria (usuario_id, origem, tabela, registro_id, operacao, antes, depois)
  values (auth.uid(), origem, tg_table_name, coalesce(base ->> 'id', base ->> 'chave'), tg_op, antigo, novo);
  return coalesce(new, old);
end $$;

create trigger auditar_produtos after insert or update or delete on public.produtos
  for each row execute function public.auditar();
create trigger auditar_variacoes after insert or update or delete on public.variacoes
  for each row execute function public.auditar();
create trigger auditar_categorias after insert or update or delete on public.categorias
  for each row execute function public.auditar();
create trigger auditar_colecoes after insert or update or delete on public.colecoes
  for each row execute function public.auditar();
create trigger auditar_config after insert or update or delete on public.config_loja
  for each row execute function public.auditar();
create trigger auditar_pedidos after insert or update or delete on public.pedidos
  for each row execute function public.auditar();
create trigger auditar_perfis after update of role on public.perfis
  for each row execute function public.auditar();

-- ---------- permissões de tabela (primeira camada; a RLS é a segunda) ----------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- Vitrine pública (somente leitura; a RLS filtra o que está ativo)
grant select on public.categorias, public.colecoes, public.produtos, public.produto_colecoes,
  public.variacoes, public.imagens, public.secoes_home, public.banners, public.config_loja
  to anon, authenticated;

-- Painel: o banco confere is_admin() em cada operação
grant insert, update, delete on public.categorias, public.colecoes, public.produtos,
  public.produto_colecoes, public.variacoes, public.imagens, public.secoes_home,
  public.banners, public.config_loja to authenticated;

-- Dados privados
grant select on public.perfis, public.pedidos, public.itens_pedido, public.auditoria to authenticated;
grant update (nome, telefone) on public.perfis to authenticated;  -- "role" fica de fora de propósito

-- ---------- RLS ----------
alter table public.perfis enable row level security;
alter table public.categorias enable row level security;
alter table public.colecoes enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_colecoes enable row level security;
alter table public.variacoes enable row level security;
alter table public.imagens enable row level security;
alter table public.secoes_home enable row level security;
alter table public.banners enable row level security;
alter table public.config_loja enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.auditoria enable row level security;

-- Leitura pública apenas do que está ativo. As subconsultas também passam pela RLS.
create policy publico_le_categorias on public.categorias for select using (ativo);
create policy publico_le_colecoes on public.colecoes for select using (ativo);
create policy publico_le_produtos on public.produtos for select using (ativo);
create policy publico_le_variacoes on public.variacoes for select
  using (ativo and exists (select 1 from public.produtos p where p.id = produto_id));
create policy publico_le_imagens on public.imagens for select
  using (exists (select 1 from public.produtos p where p.id = produto_id));
create policy publico_le_produto_colecoes on public.produto_colecoes for select
  using (exists (select 1 from public.produtos p where p.id = produto_id)
         and exists (select 1 from public.colecoes c where c.id = colecao_id));
create policy publico_le_secoes on public.secoes_home for select using (ativo);
create policy publico_le_banners on public.banners for select using (ativo);
create policy publico_le_config on public.config_loja for select using (publico);

-- Administração (inclui ler o que está inativo/privado)
create policy admin_categorias on public.categorias for all using (public.is_admin()) with check (public.is_admin());
create policy admin_colecoes on public.colecoes for all using (public.is_admin()) with check (public.is_admin());
create policy admin_produtos on public.produtos for all using (public.is_admin()) with check (public.is_admin());
create policy admin_produto_colecoes on public.produto_colecoes for all using (public.is_admin()) with check (public.is_admin());
create policy admin_variacoes on public.variacoes for all using (public.is_admin()) with check (public.is_admin());
create policy admin_imagens on public.imagens for all using (public.is_admin()) with check (public.is_admin());
create policy admin_secoes on public.secoes_home for all using (public.is_admin()) with check (public.is_admin());
create policy admin_banners on public.banners for all using (public.is_admin()) with check (public.is_admin());
create policy admin_config on public.config_loja for all using (public.is_admin()) with check (public.is_admin());

-- Perfis: cada um vê e edita o seu (nome/telefone); admin vê todos
create policy perfil_proprio_le on public.perfis for select using (id = auth.uid() or public.is_admin());
create policy perfil_proprio_edita on public.perfis for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Pedidos: cliente vê só os seus; admin vê todos. Quem cria/altera é o servidor (funções do 0003).
create policy pedidos_le on public.pedidos for select using (user_id = auth.uid() or public.is_admin());
create policy itens_le on public.itens_pedido for select
  using (exists (select 1 from public.pedidos p where p.id = pedido_id));

create policy auditoria_admin_le on public.auditoria for select using (public.is_admin());
-- EliClothing — 0003: criação de pedido com reserva atômica de estoque e mudança de status.
-- Preço, nome e total vêm SEMPRE do banco; o navegador só informa variação e quantidade.

create function public.criar_pedido(
  p_nome text,
  p_telefone text,
  p_tipo_entrega text,
  p_endereco text,
  p_observacao text,
  p_forma_pagamento text,
  p_user_id uuid,
  p_itens jsonb
) returns table (id uuid, numero bigint, total_centavos int, status text, expira_em timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  v_pedido public.pedidos;
  v_item record;
  v_var public.variacoes;
  v_prod public.produtos;
  v_preco int;
  v_subtotal int := 0;
begin
  perform set_config('app.origem', 'loja', true);

  if jsonb_typeof(p_itens) is distinct from 'array' or jsonb_array_length(p_itens) not between 1 and 50 then
    raise exception 'itens_invalidos' using errcode = '22023';
  end if;

  insert into public.pedidos (user_id, nome, telefone, tipo_entrega, endereco, observacao,
                              subtotal_centavos, total_centavos, forma_pagamento, status, expira_em)
  values (p_user_id, btrim(p_nome), btrim(p_telefone), p_tipo_entrega,
          nullif(btrim(coalesce(p_endereco, '')), ''), nullif(btrim(coalesce(p_observacao, '')), ''),
          0, 0, p_forma_pagamento,
          case when p_forma_pagamento = 'whatsapp' then 'novo' else 'aguardando_pagamento' end,
          case when p_forma_pagamento = 'whatsapp' then null else now() + interval '30 minutes' end)
  returning * into v_pedido;

  -- Soma quantidades repetidas e trava as linhas em ordem fixa (evita deadlock e venda dupla).
  for v_item in
    select (e ->> 'variacao_id')::uuid as variacao_id, sum((e ->> 'quantidade')::int) as quantidade
    from jsonb_array_elements(p_itens) e
    group by 1
    order by 1
  loop
    if v_item.quantidade not between 1 and 20 then
      raise exception 'quantidade_invalida' using errcode = '22023';
    end if;

    select * into v_var from public.variacoes where variacoes.id = v_item.variacao_id for update;
    if not found or not v_var.ativo then
      raise exception 'variacao_indisponivel' using errcode = 'P0001';
    end if;
    select * into v_prod from public.produtos where produtos.id = v_var.produto_id;
    if not v_prod.ativo then
      raise exception 'variacao_indisponivel' using errcode = 'P0001';
    end if;
    if v_var.estoque < v_item.quantidade then
      raise exception 'estoque_insuficiente' using errcode = 'P0001';
    end if;

    v_preco := coalesce(v_prod.preco_promocional_centavos, v_prod.preco_centavos);
    update public.variacoes set estoque = estoque - v_item.quantidade where variacoes.id = v_var.id;
    insert into public.itens_pedido (pedido_id, variacao_id, produto_id, nome, tamanho, cor,
                                     preco_unitario_centavos, quantidade)
    values (v_pedido.id, v_var.id, v_prod.id, v_prod.nome, v_var.tamanho, v_var.cor,
            v_preco, v_item.quantidade);
    v_subtotal := v_subtotal + v_preco * v_item.quantidade;
  end loop;

  update public.pedidos set subtotal_centavos = v_subtotal, total_centavos = v_subtotal
  where pedidos.id = v_pedido.id
  returning * into v_pedido;

  return query select v_pedido.id, v_pedido.numero, v_pedido.total_centavos, v_pedido.status, v_pedido.expira_em;
end $$;

-- Muda o status. Cancelar/expirar devolve o estoque (uma única vez).
-- Pode ser chamada pelo servidor (service_role) ou por um administrador logado.
create function public.alterar_status_pedido(p_pedido uuid, p_status text, p_origem text default 'painel')
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_atual text;
begin
  if auth.role() is distinct from 'service_role' and not public.is_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_status not in ('novo', 'aguardando_pagamento', 'pago', 'confirmado', 'pronto', 'entregue', 'cancelado', 'expirado') then
    raise exception 'status_invalido' using errcode = '22023';
  end if;
  perform set_config('app.origem', left(coalesce(p_origem, 'painel'), 30), true);

  select status into v_atual from public.pedidos where id = p_pedido for update;
  if not found then
    raise exception 'pedido_inexistente' using errcode = 'P0002';
  end if;
  if v_atual in ('cancelado', 'expirado', 'entregue') then
    if v_atual = p_status then
      return;  -- repetir o mesmo status não faz nada (webhooks repetidos)
    end if;
    raise exception 'pedido_encerrado' using errcode = 'P0001';
  end if;

  if p_status in ('cancelado', 'expirado') then
    update public.variacoes v set estoque = v.estoque + i.quantidade
    from public.itens_pedido i
    where i.pedido_id = p_pedido and i.variacao_id = v.id;
  end if;

  update public.pedidos set status = p_status where id = p_pedido;
end $$;

-- Expira pedidos de Pix/cartão não pagos e devolve o estoque (sem cron: chamada pelo servidor/painel).
create function public.expirar_pedidos_vencidos() returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_total int := 0;
begin
  if auth.role() is distinct from 'service_role' and not public.is_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  for v_id in
    select id from public.pedidos
    where status = 'aguardando_pagamento' and expira_em is not null and expira_em < now()
    order by id
  loop
    perform public.alterar_status_pedido(v_id, 'expirado', 'sistema');
    v_total := v_total + 1;
  end loop;
  return v_total;
end $$;

-- criar_pedido: só o servidor (chave de serviço). Nunca o navegador.
revoke all on function public.criar_pedido(text, text, text, text, text, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.criar_pedido(text, text, text, text, text, text, uuid, jsonb) to service_role;

revoke all on function public.alterar_status_pedido(uuid, text, text) from public, anon;
grant execute on function public.alterar_status_pedido(uuid, text, text) to authenticated, service_role;

revoke all on function public.expirar_pedidos_vencidos() from public, anon;
grant execute on function public.expirar_pedidos_vencidos() to authenticated, service_role;

revoke all on function public.definir_papel(uuid, text) from public, anon;
grant execute on function public.definir_papel(uuid, text) to authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
-- EliClothing — 0004: bucket público de fotos dos produtos (leitura pública; envio só admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "fotos_leitura_publica" on storage.objects for select
  using (bucket_id = 'produtos');
create policy "fotos_admin_envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'produtos' and public.is_admin());
create policy "fotos_admin_altera" on storage.objects for update to authenticated
  using (bucket_id = 'produtos' and public.is_admin())
  with check (bucket_id = 'produtos' and public.is_admin());
create policy "fotos_admin_remove" on storage.objects for delete to authenticated
  using (bucket_id = 'produtos' and public.is_admin());
-- EliClothing — 0005: ajustes da revisão de segurança (rodar DEPOIS das migrações 0001–0004).
-- 1) Máquina de estados dos pedidos (pago nunca vira "expirado"; sem voltar atrás).
-- 2) Pedido por WhatsApp não confirmado expira em 48 h e devolve o estoque.
-- 3) Expiração sem corrida (trava as linhas) e cancelamentos sem deadlock.
-- 4) Origem da auditoria não é forjável por quem usa o painel.
-- 5) Limites de tamanho em perfis; Storage não lista fotos para o público.

create or replace function public.criar_pedido(
  p_nome text,
  p_telefone text,
  p_tipo_entrega text,
  p_endereco text,
  p_observacao text,
  p_forma_pagamento text,
  p_user_id uuid,
  p_itens jsonb
) returns table (id uuid, numero bigint, total_centavos int, status text, expira_em timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  v_pedido public.pedidos;
  v_item record;
  v_var public.variacoes;
  v_prod public.produtos;
  v_preco int;
  v_subtotal int := 0;
begin
  perform set_config('app.origem', 'loja', true);

  if jsonb_typeof(p_itens) is distinct from 'array' or jsonb_array_length(p_itens) not between 1 and 50 then
    raise exception 'itens_invalidos' using errcode = '22023';
  end if;

  insert into public.pedidos (user_id, nome, telefone, tipo_entrega, endereco, observacao,
                              subtotal_centavos, total_centavos, forma_pagamento, status, expira_em)
  values (p_user_id, btrim(p_nome), btrim(p_telefone), p_tipo_entrega,
          nullif(btrim(coalesce(p_endereco, '')), ''), nullif(btrim(coalesce(p_observacao, '')), ''),
          0, 0, p_forma_pagamento,
          case when p_forma_pagamento = 'whatsapp' then 'novo' else 'aguardando_pagamento' end,
          case when p_forma_pagamento = 'whatsapp' then now() + interval '48 hours' else now() + interval '30 minutes' end)
  returning * into v_pedido;

  -- Soma quantidades repetidas e trava as linhas em ordem fixa (evita deadlock e venda dupla).
  for v_item in
    select (e ->> 'variacao_id')::uuid as variacao_id, sum((e ->> 'quantidade')::int) as quantidade
    from jsonb_array_elements(p_itens) e
    group by 1
    order by 1
  loop
    if v_item.quantidade not between 1 and 20 then
      raise exception 'quantidade_invalida' using errcode = '22023';
    end if;

    select * into v_var from public.variacoes where variacoes.id = v_item.variacao_id for update;
    if not found or not v_var.ativo then
      raise exception 'variacao_indisponivel' using errcode = 'P0001';
    end if;
    select * into v_prod from public.produtos where produtos.id = v_var.produto_id;
    if not v_prod.ativo then
      raise exception 'variacao_indisponivel' using errcode = 'P0001';
    end if;
    if v_var.estoque < v_item.quantidade then
      raise exception 'estoque_insuficiente' using errcode = 'P0001';
    end if;

    v_preco := coalesce(v_prod.preco_promocional_centavos, v_prod.preco_centavos);
    update public.variacoes set estoque = estoque - v_item.quantidade where variacoes.id = v_var.id;
    insert into public.itens_pedido (pedido_id, variacao_id, produto_id, nome, tamanho, cor,
                                     preco_unitario_centavos, quantidade)
    values (v_pedido.id, v_var.id, v_prod.id, v_prod.nome, v_var.tamanho, v_var.cor,
            v_preco, v_item.quantidade);
    v_subtotal := v_subtotal + v_preco * v_item.quantidade;
  end loop;

  update public.pedidos set subtotal_centavos = v_subtotal, total_centavos = v_subtotal
  where pedidos.id = v_pedido.id
  returning * into v_pedido;

  return query select v_pedido.id, v_pedido.numero, v_pedido.total_centavos, v_pedido.status, v_pedido.expira_em;
end $$;


create or replace function public.alterar_status_pedido(p_pedido uuid, p_status text, p_origem text default 'painel')
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_atual text;
  v_permitidos text[];
begin
  if auth.role() is distinct from 'service_role' and not public.is_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_status not in ('novo', 'aguardando_pagamento', 'pago', 'confirmado', 'pronto', 'entregue', 'cancelado', 'expirado') then
    raise exception 'status_invalido' using errcode = '22023';
  end if;
  -- Só o servidor pode dizer de onde veio a mudança; quem usa o painel é sempre "painel".
  perform set_config('app.origem',
    case when auth.role() = 'service_role' then left(coalesce(p_origem, 'sistema'), 30) else 'painel' end, true);

  select status into v_atual from public.pedidos where id = p_pedido for update;
  if not found then
    raise exception 'pedido_inexistente' using errcode = 'P0002';
  end if;
  if v_atual = p_status then
    return;  -- repetir o mesmo status não faz nada (webhooks repetidos)
  end if;
  if v_atual in ('cancelado', 'expirado', 'entregue') then
    raise exception 'pedido_encerrado' using errcode = 'P0001';
  end if;

  v_permitidos := case v_atual
    when 'novo' then array['confirmado', 'pago', 'pronto', 'entregue', 'cancelado', 'expirado']
    when 'aguardando_pagamento' then array['pago', 'cancelado', 'expirado']
    when 'pago' then array['confirmado', 'pronto', 'entregue', 'cancelado']
    when 'confirmado' then array['pago', 'pronto', 'entregue', 'cancelado']
    when 'pronto' then array['entregue', 'cancelado']
    else array[]::text[]
  end;
  if not (p_status = any (v_permitidos)) then
    raise exception 'transicao_invalida' using errcode = 'P0001';
  end if;

  if p_status in ('cancelado', 'expirado') then
    -- trava as variações sempre na mesma ordem (evita deadlock entre dois cancelamentos)
    perform 1 from public.variacoes
      where id in (select variacao_id from public.itens_pedido where pedido_id = p_pedido)
      order by id for update;
    update public.variacoes v set estoque = v.estoque + i.quantidade
    from public.itens_pedido i
    where i.pedido_id = p_pedido and i.variacao_id = v.id;
  end if;

  update public.pedidos set status = p_status where id = p_pedido;
end $$;

create or replace function public.expirar_pedidos_vencidos() returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_total int := 0;
begin
  if auth.role() is distinct from 'service_role' and not public.is_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  -- "for update skip locked": um pedido que está sendo pago neste instante é pulado.
  for v_id in
    select id from public.pedidos
    where status in ('aguardando_pagamento', 'novo') and expira_em is not null and expira_em < now()
    order by id
    for update skip locked
  loop
    perform public.alterar_status_pedido(v_id, 'expirado', 'sistema');
    v_total := v_total + 1;
  end loop;
  return v_total;
end $$;

alter table public.perfis
  add constraint perfis_nome_tamanho check (nome is null or length(nome) <= 120),
  add constraint perfis_telefone_tamanho check (telefone is null or length(telefone) <= 20);

-- Fotos: o bucket é público (a URL de cada foto abre sem login), mas ninguém lista a pasta toda.
drop policy if exists "fotos_leitura_publica" on storage.objects;
create policy "fotos_admin_le" on storage.objects for select to authenticated
  using (bucket_id = 'produtos' and public.is_admin());
