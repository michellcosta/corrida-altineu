-- Bucket 'media' e políticas de Storage
-- O bucket pode ser criado via Dashboard ou API. Estas políticas permitem:
-- - Admins (SITE_ADMIN) fazer upload
-- - Leitura pública para arquivos no bucket (para imagens e PDFs servidos no site)

-- Nota: O bucket 'media' deve existir. Crie-o no Dashboard: Storage > New bucket > "media" > Public
-- Ou execute no SQL Editor após criar o bucket manualmente:

-- Política: Admins podem fazer upload em media (qualquer pasta)
drop policy if exists "Admins podem fazer upload em media" on storage.objects;
create policy "Admins podem fazer upload em media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and auth.uid() in (
      select user_id from public.admin_users
      where is_active = true
    )
  );

-- Política: Admins podem atualizar/deletar em media
drop policy if exists "Admins podem atualizar em media" on storage.objects;
create policy "Admins podem atualizar em media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and auth.uid() in (
      select user_id from public.admin_users
      where is_active = true
    )
  );

create policy "Admins podem deletar em media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and auth.uid() in (
      select user_id from public.admin_users
      where is_active = true
    )
  );

-- Política: Leitura pública para media (para servir imagens e PDFs no site)
drop policy if exists "Leitura pública de media" on storage.objects;
create policy "Leitura pública de media"
  on storage.objects for select
  to public
  using (bucket_id = 'media');
