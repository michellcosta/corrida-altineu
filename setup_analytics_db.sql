/**
 * Instrução:
 * Como não temos acesso direto à porta do banco via psql e a CLI não está linkada,
 * por favor, abra o painel do Supabase (SQL Editor) e rode este script:
 */

-- 1. Criar a tabela page_views
create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  created_at timestamptz default now() not null
);

-- 2. Habilitar RLS
alter table public.page_views enable row level security;

-- 3. Permitir inserção anônima de page_views
create policy "Permitir inserção anônima de page_views"
  on public.page_views
  for insert
  with check (true);

-- 4. Apenas admins podem ler page_views
create policy "Apenas admins podem ler page_views"
  on public.page_views
  for select
  using (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN'
    )
  );

-- 5. Índices para performance do Analytics
create index if not exists idx_page_views_path on public.page_views(path);
create index if not exists idx_page_views_created_at on public.page_views(created_at desc);

-- 6. RPC function para inserir views (Bypass de cache/auth mais enxuto, opcional mas ajuda no Next.js)
create or replace function public.track_page_view(p_path text)
returns void as $$
begin
  insert into public.page_views (path) values (p_path);
end;
$$ language plpgsql security definer;
