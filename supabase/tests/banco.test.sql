\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = notice;

-- ===== ajudas =====
create schema t;
grant usage on schema t to public;
create function t.como(papel text, uid uuid default null) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(uid::text, ''), true);
  perform set_config('request.jwt.claim.role', papel, true);
  if papel <> 'postgres' then execute format('set local role %I', papel); end if;
end $$;
create function t.voltar() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);
end $$;
create function t.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'FALHOU: %', msg; end if;
  raise notice 'ok - %', msg;
end $$;
create function t.conta(consulta text) returns bigint language plpgsql as $$
declare n bigint;
begin execute 'select count(*) from (' || consulta || ') x' into n; return n; end $$;
create function t.erro(cmd text, estado text, msg text) returns void language plpgsql as $$
begin
  begin
    execute cmd;
  exception when others then
    if sqlstate = estado then raise notice 'ok - %', msg; return; end if;
    raise exception 'FALHOU (esperava %, veio % %): %', estado, sqlstate, sqlerrm, msg;
  end;
  raise exception 'FALHOU (não deu erro): %', msg;
end $$;

-- ===== dados de teste (como dono do banco) =====
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'dona@exemplo.com', '{"nome":"Dona"}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'bia@exemplo.com', '{}'),
  ('cccccccc-0000-0000-0000-000000000003', 'carla@exemplo.com', '{}');
-- primeiro admin: a linha de SQL que a dona roda uma vez
update public.perfis set role = 'admin' where email = 'dona@exemplo.com';

insert into public.produtos (id, nome, slug, preco_centavos, preco_promocional_centavos, ativo) values
  ('11111111-0000-0000-0000-000000000001', 'Vestido Floral', 'vestido-floral', 10000, 8000, true),
  ('11111111-0000-0000-0000-000000000002', 'Blusa Rascunho', 'blusa-rascunho', 5000, null, false);
insert into public.variacoes (id, produto_id, tamanho, cor, estoque) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'M', 'Rosa', 5),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'G', 'Rosa', 1),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'M', 'Preto', 3);
insert into public.config_loja (chave, valor, publico) values
  ('whatsapp', '11973029002', true), ('nota_interna', 'segredo', false);

-- ===== perfis =====
do $$ begin
  perform t.ok((select count(*) from public.perfis) = 3, 'todo usuário novo ganhou um perfil');
  perform t.ok((select role from public.perfis where email = 'bia@exemplo.com') = 'cliente', 'perfil novo é sempre cliente');
  perform t.ok((select nome from public.perfis where email = 'dona@exemplo.com') = 'Dona', 'nome do cadastro vai para o perfil');
end $$;

-- ===== visitante (anon) =====
do $$ begin
  perform t.como('anon');
  perform t.ok(t.conta('select 1 from public.produtos') = 1, 'visitante vê só produto ativo');
  perform t.ok(t.conta('select 1 from public.variacoes') = 2, 'visitante vê só variações de produto ativo');
  perform t.ok(t.conta('select 1 from public.config_loja') = 1, 'visitante vê só config pública');
  perform t.erro('select * from public.pedidos', '42501', 'visitante não lê pedidos');
  perform t.erro('select * from public.perfis', '42501', 'visitante não lê perfis');
  perform t.erro('select * from public.auditoria', '42501', 'visitante não lê auditoria');
  perform t.erro($q$insert into public.produtos (nome, slug, preco_centavos) values ('x','x',1)$q$, '42501', 'visitante não cria produto');
  perform t.erro($q$update public.produtos set preco_centavos = 1$q$, '42501', 'visitante não altera produto');
  perform t.erro($q$select * from public.criar_pedido('A','11999999999','retirada',null,null,'whatsapp',null,'[]'::jsonb)$q$, '42501', 'visitante não chama criar_pedido');
  perform t.voltar();
end $$;

-- ===== cliente logado =====
do $$ begin
  perform t.como('authenticated', 'bbbbbbbb-0000-0000-0000-000000000002');
  perform t.ok(t.conta('select 1 from public.perfis') = 1, 'cliente vê só o próprio perfil');
  perform t.erro($q$insert into public.produtos (nome, slug, preco_centavos) values ('x','x',1)$q$, '42501', 'cliente não cria produto (RLS)');
  perform t.erro($q$update public.perfis set role = 'admin' where id = 'bbbbbbbb-0000-0000-0000-000000000002'$q$, '42501', 'cliente não vira admin');
  update public.perfis set nome = 'Bia' where id = 'bbbbbbbb-0000-0000-0000-000000000002';
  perform t.ok((select nome from public.perfis where id = auth.uid()) = 'Bia', 'cliente edita o próprio nome');
  update public.perfis set nome = 'Hack' where id = 'cccccccc-0000-0000-0000-000000000003';
  perform t.voltar();
  perform t.ok((select nome from public.perfis where email = 'carla@exemplo.com') is null, 'cliente não edita perfil de outra pessoa');
  perform t.como('authenticated', 'bbbbbbbb-0000-0000-0000-000000000002');
  perform t.erro($q$select public.definir_papel('bbbbbbbb-0000-0000-0000-000000000002', 'admin')$q$, '42501', 'cliente não usa definir_papel');
  perform t.erro($q$select public.alterar_status_pedido(gen_random_uuid(), 'pago')$q$, '42501', 'cliente não altera status de pedido');
  perform t.ok(t.conta('select 1 from public.auditoria') = 0, 'cliente não enxerga a auditoria (RLS filtra tudo)');
  perform t.voltar();
end $$;

-- ===== administradora =====
do $$ begin
  perform t.como('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001');
  perform t.ok(t.conta('select 1 from public.produtos') = 2, 'admin vê também produto inativo');
  perform t.ok(t.conta('select 1 from public.perfis') = 3, 'admin vê todos os perfis');
  perform t.ok(t.conta('select 1 from public.config_loja') = 2, 'admin vê config privada');
  insert into public.produtos (id, nome, slug, preco_centavos) values ('11111111-0000-0000-0000-000000000009', 'Saia', 'saia', 9000);
  perform t.ok(t.conta($q$select 1 from public.produtos where slug = 'saia'$q$) = 1, 'admin cria produto');
  perform t.erro($q$insert into public.produtos (nome, slug, preco_centavos, preco_promocional_centavos) values ('Y','y',100,100)$q$, '23514', 'promoção precisa ser menor que o preço');
  perform t.erro($q$insert into public.produtos (nome, slug, preco_centavos) values ('Z','Slug Ruim',100)$q$, '23514', 'slug inválido é recusado');
  perform t.erro($q$update public.variacoes set estoque = -1$q$, '23514', 'estoque negativo é recusado');
  perform t.ok(t.conta('select 1 from public.auditoria') >= 1, 'admin lê a auditoria');
  perform public.definir_papel('cccccccc-0000-0000-0000-000000000003', 'admin');
  perform t.ok((select role from public.perfis where id = 'cccccccc-0000-0000-0000-000000000003') = 'admin', 'admin promove outra pessoa');
  perform public.definir_papel('cccccccc-0000-0000-0000-000000000003', 'cliente');
  perform t.erro($q$select public.definir_papel('aaaaaaaa-0000-0000-0000-000000000001', 'cliente')$q$, '22023', 'admin não remove o próprio acesso');
  perform t.erro($q$select public.definir_papel('cccccccc-0000-0000-0000-000000000003', 'dono')$q$, '22023', 'papel inválido é recusado');
  perform t.voltar();
  perform t.ok((select count(*) from public.auditoria where tabela = 'produtos' and origem = 'painel' and operacao = 'INSERT') >= 1, 'auditoria registra criação feita no painel');
  perform t.ok((select count(*) from public.auditoria where tabela = 'perfis') >= 2, 'auditoria registra mudança de papel');
end $$;

-- ===== pedido: criação e reserva de estoque =====
do $$
declare r record; est int;
begin
  perform t.como('authenticated', 'bbbbbbbb-0000-0000-0000-000000000002');
  perform t.erro($q$select * from public.criar_pedido('Bia','11988887777','retirada',null,null,'whatsapp',null,'[{"variacao_id":"22222222-0000-0000-0000-000000000001","quantidade":1}]'::jsonb)$q$, '42501', 'cliente logado também não chama criar_pedido direto');
  perform t.voltar();

  perform t.como('service_role');
  select * into r from public.criar_pedido('  Bia  ', '11988887777', 'retirada', null, 'tocar a campainha', 'whatsapp',
    'bbbbbbbb-0000-0000-0000-000000000002',
    '[{"variacao_id":"22222222-0000-0000-0000-000000000001","quantidade":1},{"variacao_id":"22222222-0000-0000-0000-000000000001","quantidade":1}]'::jsonb);
  perform t.voltar();
  perform t.ok(r.total_centavos = 16000, 'total vem do preço promocional do banco (2 x 80,00), itens repetidos somados');
  perform t.ok(r.status = 'novo', 'pedido por WhatsApp nasce como "novo"');
  perform t.ok(r.numero >= 1001, 'pedido recebe número curto');
  perform t.ok((select estoque from public.variacoes where id = '22222222-0000-0000-0000-000000000001') = 3, 'estoque foi reservado (5 → 3)');
  perform t.ok((select nome from public.pedidos where id = r.id) = 'Bia', 'nome do cliente é aparado');
  perform t.ok((select preco_unitario_centavos from public.itens_pedido where pedido_id = r.id) = 8000, 'item guarda cópia do preço pago');
  perform t.ok((select count(*) from public.auditoria where tabela = 'variacoes' and origem = 'loja') >= 1, 'baixa de estoque aparece na auditoria como "loja"');
end $$;

do $$
declare antes int; depois int; npedidos_antes bigint;
begin
  select estoque into antes from public.variacoes where id = '22222222-0000-0000-0000-000000000002';
  select count(*) into npedidos_antes from public.pedidos;
  perform t.como('service_role');
  perform t.erro($q$select * from public.criar_pedido('Ana','11977776666','retirada',null,null,'whatsapp',null,'[{"variacao_id":"22222222-0000-0000-0000-000000000002","quantidade":2}]'::jsonb)$q$, 'P0001', 'sem estoque suficiente o pedido é recusado');
  perform t.erro($q$select * from public.criar_pedido('Ana','11977776666','retirada',null,null,'whatsapp',null,'[{"variacao_id":"22222222-0000-0000-0000-000000000003","quantidade":1}]'::jsonb)$q$, 'P0001', 'produto inativo não pode ser comprado');
  perform t.erro($q$select * from public.criar_pedido('Ana','11977776666','entrega',null,null,'whatsapp',null,'[{"variacao_id":"22222222-0000-0000-0000-000000000002","quantidade":1}]'::jsonb)$q$, '23514', 'entrega exige endereço');
  perform t.erro($q$select * from public.criar_pedido('Ana','11977776666','retirada',null,null,'whatsapp',null,'[{"variacao_id":"22222222-0000-0000-0000-000000000002","quantidade":99}]'::jsonb)$q$, '22023', 'quantidade absurda é recusada');
  perform t.erro($q$select * from public.criar_pedido('Ana','11977776666','retirada',null,null,'whatsapp',null,'[]'::jsonb)$q$, '22023', 'pedido sem itens é recusado');
  perform t.voltar();
  select estoque into depois from public.variacoes where id = '22222222-0000-0000-0000-000000000002';
  perform t.ok(antes = depois, 'pedido recusado não mexe no estoque');
  perform t.ok((select count(*) from public.pedidos) = npedidos_antes, 'pedido recusado não deixa pedido pela metade');
end $$;

-- ===== pedido: visibilidade e status =====
do $$
declare id_pedido uuid;
begin
  select id into id_pedido from public.pedidos limit 1;
  perform t.como('authenticated', 'bbbbbbbb-0000-0000-0000-000000000002');
  perform t.ok(t.conta('select 1 from public.pedidos') = 1, 'cliente vê o próprio pedido');
  perform t.ok(t.conta('select 1 from public.itens_pedido') = 1, 'cliente vê os itens do próprio pedido');
  perform t.erro(format($q$update public.pedidos set status = 'pago' where id = %L$q$, id_pedido), '42501', 'cliente não altera pedido direto');
  perform t.voltar();
  perform t.como('authenticated', 'cccccccc-0000-0000-0000-000000000003');
  perform t.ok(t.conta('select 1 from public.pedidos') = 0, 'outra cliente não vê pedido alheio');
  perform t.ok(t.conta('select 1 from public.itens_pedido') = 0, 'outra cliente não vê itens alheios');
  perform t.voltar();
  perform t.como('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001');
  perform t.ok(t.conta('select 1 from public.pedidos') = 1, 'admin vê todos os pedidos');
  perform public.alterar_status_pedido(id_pedido, 'confirmado');
  perform t.ok((select status from public.pedidos where id = id_pedido) = 'confirmado', 'admin muda o status');
  perform public.alterar_status_pedido(id_pedido, 'cancelado');
  perform t.voltar();
  perform t.ok((select estoque from public.variacoes where id = '22222222-0000-0000-0000-000000000001') = 5, 'cancelar devolve o estoque (3 → 5)');
  perform t.como('service_role');
  perform public.alterar_status_pedido(id_pedido, 'cancelado', 'telegram');
  perform t.erro(format($q$select public.alterar_status_pedido(%L, 'pago')$q$, id_pedido), 'P0001', 'pedido cancelado não volta a andar');
  perform t.voltar();
  perform t.ok((select estoque from public.variacoes where id = '22222222-0000-0000-0000-000000000001') = 5, 'cancelar de novo não devolve estoque em dobro');
end $$;

-- ===== Pix: expiração =====
do $$
declare r record; n int;
begin
  perform t.como('service_role');
  select * into r from public.criar_pedido('Dani', '11955554444', 'retirada', null, null, 'pix', null,
    '[{"variacao_id":"22222222-0000-0000-0000-000000000002","quantidade":1}]'::jsonb);
  perform t.voltar();
  perform t.ok(r.status = 'aguardando_pagamento' and r.expira_em > now(), 'Pix nasce aguardando pagamento com prazo');
  perform t.ok((select estoque from public.variacoes where id = '22222222-0000-0000-0000-000000000002') = 0, 'Pix reserva o estoque');
  perform t.como('service_role');
  perform t.ok(public.expirar_pedidos_vencidos() = 0, 'pedido dentro do prazo não expira');
  perform t.voltar();
  update public.pedidos set expira_em = now() - interval '1 minute' where id = r.id;
  perform t.como('service_role');
  n := public.expirar_pedidos_vencidos();
  perform t.voltar();
  perform t.ok(n = 1, 'pedido vencido expira');
  perform t.ok((select estoque from public.variacoes where id = '22222222-0000-0000-0000-000000000002') = 1, 'expirar devolve o estoque');
  perform t.como('authenticated', 'bbbbbbbb-0000-0000-0000-000000000002');
  perform t.erro('select public.expirar_pedidos_vencidos()', '42501', 'cliente não dispara expiração');
  perform t.voltar();
end $$;

-- ===== fotos (Storage) =====
do $$ begin
  perform t.ok((select file_size_limit from storage.buckets where id = 'produtos') = 5242880, 'bucket produtos limita a 5 MB');
  perform t.ok((select public from storage.buckets where id = 'produtos'), 'bucket produtos é público para leitura');
  perform t.como('anon');
  perform t.erro($q$insert into storage.objects (bucket_id, name) values ('produtos', 'a.jpg')$q$, '42501', 'visitante não envia foto');
  perform t.voltar();
  perform t.como('authenticated', 'bbbbbbbb-0000-0000-0000-000000000002');
  perform t.erro($q$insert into storage.objects (bucket_id, name) values ('produtos', 'a.jpg')$q$, '42501', 'cliente não envia foto');
  perform t.voltar();
  perform t.como('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001');
  insert into storage.objects (bucket_id, name) values ('produtos', 'a.jpg');
  perform t.ok(t.conta('select 1 from storage.objects') = 1, 'admin envia foto');
  perform t.voltar();
  perform t.como('anon');
  perform t.ok(t.conta('select 1 from storage.objects') = 1, 'visitante vê as fotos');
  perform t.voltar();
end $$;

\echo
\echo === TODOS OS TESTES DO BANCO PASSARAM ===
