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
