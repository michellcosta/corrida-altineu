-- Admins podem deletar inscrições (SITE_ADMIN)
create policy "Admins podem deletar inscrições"
  on public.registrations for delete
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

-- Admins podem atualizar dados de atletas (para edição no painel SITE_ADMIN)
create policy "Admins podem atualizar atletas"
  on public.athletes for update
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );
