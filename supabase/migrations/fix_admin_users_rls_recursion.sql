-- ============================================================
-- FIX: Recursão infinita nas políticas RLS de admin_users
-- ============================================================
-- O problema: as políticas antigas consultavam admin_users para
-- verificar permissão, causando recursão infinita.
--
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Função auxiliar que bypassa RLS (evita recursão)
create or replace function public.is_site_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role = 'SITE_ADMIN' and is_active = true
  )
$$;

-- 2. Remover políticas antigas
drop policy if exists "Admins podem ver todos os usuários" on public.admin_users;
drop policy if exists "Apenas SITE_ADMIN pode criar usuários" on public.admin_users;
drop policy if exists "Apenas SITE_ADMIN pode atualizar usuários" on public.admin_users;

-- 3. Novas políticas (sem recursão)
-- SELECT: usuário pode ler o próprio perfil OU ser SITE_ADMIN para ver todos
create policy "admin_users_select_own_or_admin"
  on public.admin_users for select
  using (
    auth.uid() = user_id
    or public.is_site_admin()
  );

-- INSERT: apenas SITE_ADMIN
create policy "admin_users_insert_site_admin"
  on public.admin_users for insert
  with check (public.is_site_admin());

-- UPDATE: apenas SITE_ADMIN
create policy "admin_users_update_site_admin"
  on public.admin_users for update
  using (public.is_site_admin());
