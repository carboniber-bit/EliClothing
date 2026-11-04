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
