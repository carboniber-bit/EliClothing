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
