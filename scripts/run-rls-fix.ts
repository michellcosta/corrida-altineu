/**
 * Executa a migração de correção RLS no Supabase
 * Requer: DATABASE_URL no .env.local (Supabase > Settings > Database > Connection string)
 */

import { config } from 'dotenv'
import pg from 'pg'

config({ path: '.env.local' })

const sql = `
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

drop policy if exists "Admins podem ver todos os usuários" on public.admin_users;
drop policy if exists "Apenas SITE_ADMIN pode criar usuários" on public.admin_users;
drop policy if exists "Apenas SITE_ADMIN pode atualizar usuários" on public.admin_users;

create policy "admin_users_select_own_or_admin"
  on public.admin_users for select
  using (
    auth.uid() = user_id
    or public.is_site_admin()
  );

create policy "admin_users_insert_site_admin"
  on public.admin_users for insert
  with check (public.is_site_admin());

create policy "admin_users_update_site_admin"
  on public.admin_users for update
  using (public.is_site_admin());
`

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error(
      'Configure DATABASE_URL no .env.local\n' +
        'Obtenha em: Supabase Dashboard > Project Settings > Database > Connection string (URI)'
    )
    process.exit(1)
  }

  const client = new pg.Client({ connectionString: databaseUrl })
  try {
    await client.connect()
    await client.query(sql)
    console.log('Migração RLS aplicada com sucesso!')
  } catch (err: any) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
