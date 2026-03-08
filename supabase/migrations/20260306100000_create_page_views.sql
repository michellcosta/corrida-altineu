create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  created_at timestamptz default now() not null
);

-- Habilitar RLS (Row Level Security) mas permitir inserções públicas (anônimas)
alter table public.page_views enable row level security;

-- Política para permitir que qualquer pessoa insira uma view (tracking anônimo)
create policy "Permitir inserção anônima de page_views"
  on public.page_views
  for insert
  with check (true);

-- Política para leitura (visível apenas para admins ou service_role - service_role sempre acessa independentemente do RLS)
create policy "Apenas admins podem ler page_views"
  on public.page_views
  for select
  using (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN'
    )
  );

-- Índice para otimizar busca por caminho e ordenação por data (crítico para dash analytics)
create index if not exists idx_page_views_path on public.page_views(path);
create index if not exists idx_page_views_created_at on public.page_views(created_at desc);
