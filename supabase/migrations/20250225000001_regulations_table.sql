-- Tabela de regulamentos
create table if not exists public.regulations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text,
  file_url text,
  version text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.regulations enable row level security;

create policy "Regulamentos são públicos para leitura"
  on public.regulations for select
  using (is_active = true);

create policy "Apenas SITE_ADMIN pode gerenciar regulamentos"
  on public.regulations for all
  using (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN' and is_active = true
    )
  );
