-- ============================================================
-- EXECUTE TUDO DE UMA VEZ NO SUPABASE SQL EDITOR
-- Copie e cole este arquivo em: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Coluna kit_picked_at
alter table public.registrations
add column if not exists kit_picked_at timestamptz;
comment on column public.registrations.kit_picked_at is 'Data/hora em que o atleta retirou o kit';

-- 2. Tabela regulations
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
drop policy if exists "Regulamentos são públicos para leitura" on public.regulations;
create policy "Regulamentos são públicos para leitura"
  on public.regulations for select using (is_active = true);
drop policy if exists "Apenas SITE_ADMIN pode gerenciar regulamentos" on public.regulations;
create policy "Apenas SITE_ADMIN pode gerenciar regulamentos"
  on public.regulations for all
  using (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

-- 3. Tabela email_templates
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('email', 'whatsapp', 'sms')) default 'email',
  subject text,
  body text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.email_templates enable row level security;
drop policy if exists "Admins podem gerenciar templates" on public.email_templates;
create policy "Admins podem gerenciar templates"
  on public.email_templates for all
  using (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

-- 4. Políticas de Storage (bucket media)
drop policy if exists "Admins podem fazer upload em media" on storage.objects;
create policy "Admins podem fazer upload em media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

drop policy if exists "Admins podem atualizar em media" on storage.objects;
create policy "Admins podem atualizar em media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

drop policy if exists "Admins podem deletar em media" on storage.objects;
create policy "Admins podem deletar em media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'media'
    and auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

drop policy if exists "Leitura pública de media" on storage.objects;
create policy "Leitura pública de media"
  on storage.objects for select to public
  using (bucket_id = 'media');

-- 5. Coluna country em athletes (origem do atleta)
alter table public.athletes add column if not exists country text;
comment on column public.athletes.country is 'Código ISO do país (ex: BRA, ARG). Para brasileiros sempre BRA.';
