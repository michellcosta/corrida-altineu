-- ============================================================
-- CORRIDA RÚSTICA DE MACUCO - SCHEMA SUPABASE
-- ============================================================
-- Este arquivo contém o schema completo para o banco de dados
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- ============================================================
-- 1. AUTENTICAÇÃO E ADMINISTRAÇÃO
-- ============================================================

-- Perfis de usuários administrativos
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  name text not null,
  email text not null unique,
  role text not null check (role in ('SITE_ADMIN','CHIP_ADMIN','ORG_ADMIN')),
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para admin_users
create index if not exists idx_admin_users_user_id on public.admin_users(user_id);
create index if not exists idx_admin_users_role on public.admin_users(role);
create index if not exists idx_admin_users_email on public.admin_users(email);

-- Função auxiliar para RLS (evita recursão infinita)
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

-- RLS para admin_users
alter table public.admin_users enable row level security;

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

-- ============================================================
-- 2. AUDITORIA
-- ============================================================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  admin_user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Índices para audit_logs
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- RLS para audit_logs
alter table public.audit_logs enable row level security;

create policy "Admins podem ver logs"
  on public.audit_logs for select
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

-- ============================================================
-- 3. EVENTOS E CATEGORIAS
-- ============================================================

-- Tabela de eventos (corridas)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  year int unique not null,
  edition int not null,
  race_date date not null,
  age_cutoff_date date not null, -- Data de corte para cálculo de idade (31/12 do ano)
  location text not null,
  city text default 'Macuco',
  state text default 'RJ',
  total_prize numeric default 0,
  registrations_open boolean default false,
  registration_open_date timestamptz,
  registration_close_date timestamptz,
  contact_email text,
  contact_phone text,
  social_instagram text,
  social_facebook text,
  start_time_10k time default '07:00',
  start_time_2k time default '08:30',
  slots_geral int default 500,
  slots_morador int default 200,
  slots_60plus int default 100,
  slots_infantil int default 300,
  price_geral numeric default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para events
create index if not exists idx_events_year on public.events(year);
create index if not exists idx_events_race_date on public.events(race_date);

-- RLS para events
alter table public.events enable row level security;

create policy "Eventos são públicos para leitura"
  on public.events for select
  using (true);

create policy "Apenas SITE_ADMIN pode modificar eventos"
  on public.events for all
  using (
    auth.uid() in (
      select user_id from public.admin_users 
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

-- Categorias de corrida
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  slug text not null,
  name text not null,
  description text,
  distance text not null,
  price numeric default 0,
  is_free boolean default false,
  min_age int not null,
  max_age int,
  age_rule text not null, -- Descrição da regra de idade
  requires_residence_proof boolean default false,
  requires_medical_certificate boolean default false,
  requires_guardian_authorization boolean default false,
  total_slots int default 500,
  available_slots int default 500,
  color_from text, -- Tailwind gradient from-color
  color_to text,   -- Tailwind gradient to-color
  icon text,       -- Emoji icon
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(event_id, slug)
);

-- Índices para categories
create index if not exists idx_categories_event_id on public.categories(event_id);
create index if not exists idx_categories_slug on public.categories(slug);

-- RLS para categories
alter table public.categories enable row level security;

create policy "Categorias são públicas para leitura"
  on public.categories for select
  using (true);

create policy "Apenas SITE_ADMIN pode modificar categorias"
  on public.categories for all
  using (
    auth.uid() in (
      select user_id from public.admin_users 
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

-- ============================================================
-- 4. ATLETAS E INSCRIÇÕES
-- ============================================================

-- Tabela de atletas
create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  document_type text check (document_type in ('CPF', 'RG', 'PASSAPORTE')),
  document_number text,
  birth_date date not null,
  gender text check (gender in ('M', 'F', 'OUTRO')),
  team_name text,
  city text,
  state text,
  address text,
  zip_code text,
  emergency_contact_name text,
  emergency_contact_phone text,
  tshirt_size text check (tshirt_size in ('PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para athletes
create index if not exists idx_athletes_user_id on public.athletes(user_id);
create index if not exists idx_athletes_email on public.athletes(email);
create index if not exists idx_athletes_document on public.athletes(document_number);

-- RLS para athletes
alter table public.athletes enable row level security;

create policy "Atletas podem ver seus próprios dados"
  on public.athletes for select
  using (auth.uid() = user_id);

create policy "Atletas podem atualizar seus próprios dados"
  on public.athletes for update
  using (auth.uid() = user_id);

create policy "Admins podem ver todos os atletas"
  on public.athletes for select
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

-- Tabela de responsáveis (para categoria infantil)
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  full_name text not null,
  document_type text check (document_type in ('CPF', 'RG')),
  document_number text not null,
  phone text not null,
  email text,
  relationship text not null, -- Pai, Mãe, Responsável Legal
  created_at timestamptz default now()
);

-- Índices para guardians
create index if not exists idx_guardians_athlete_id on public.guardians(athlete_id);

-- RLS para guardians
alter table public.guardians enable row level security;

create policy "Responsáveis vinculados ao atleta podem ver"
  on public.guardians for select
  using (
    athlete_id in (
      select id from public.athletes where user_id = auth.uid()
    )
  );

-- Inscrições
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  guardian_id uuid references public.guardians(id) on delete set null,
  registration_number text unique, -- Gerado automaticamente (ex: 2026-GERAL-0001)
  status text not null check (status in ('pending', 'pending_payment', 'pending_documents', 'under_review', 'confirmed', 'rejected', 'cancelled')) default 'pending',
  payment_status text check (payment_status in ('pending', 'processing', 'paid', 'failed', 'refunded', 'free')) default 'free',
  payment_amount numeric default 0,
  payment_method text,
  payment_id text, -- ID da transação no gateway
  bib_number int, -- Número do peito (atribuído depois)
  chip_code text, -- Código do chip de cronometragem
  confirmation_code text unique, -- Código para retirada do kit
  qr_code text, -- URL do QR code gerado
  notes text, -- Observações administrativas
  rejected_reason text,
  registered_at timestamptz default now(),
  confirmed_at timestamptz,
  kit_picked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para registrations
create index if not exists idx_registrations_event_id on public.registrations(event_id);
create index if not exists idx_registrations_category_id on public.registrations(category_id);
create index if not exists idx_registrations_athlete_id on public.registrations(athlete_id);
create index if not exists idx_registrations_status on public.registrations(status);
create index if not exists idx_registrations_number on public.registrations(registration_number);

-- RLS para registrations
alter table public.registrations enable row level security;

create policy "Atletas podem ver suas próprias inscrições"
  on public.registrations for select
  using (
    athlete_id in (
      select id from public.athletes where user_id = auth.uid()
    )
  );

create policy "Admins podem ver todas as inscrições"
  on public.registrations for select
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

create policy "Admins podem atualizar inscrições"
  on public.registrations for update
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

-- ============================================================
-- 5. DOCUMENTOS
-- ============================================================

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete cascade not null,
  document_type text not null check (document_type in ('residence_proof', 'photo_id', 'medical_certificate', 'guardian_authorization', 'guardian_id', 'other')),
  file_path text not null, -- Caminho no Supabase Storage
  file_name text not null,
  file_size int,
  mime_type text,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  reviewed_by uuid references public.admin_users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  uploaded_at timestamptz default now()
);

-- Índices para documents
create index if not exists idx_documents_registration_id on public.documents(registration_id);
create index if not exists idx_documents_status on public.documents(status);

-- RLS para documents
alter table public.documents enable row level security;

create policy "Atletas podem ver seus documentos"
  on public.documents for select
  using (
    registration_id in (
      select r.id from public.registrations r
      inner join public.athletes a on r.athlete_id = a.id
      where a.user_id = auth.uid()
    )
  );

create policy "Admins podem ver todos os documentos"
  on public.documents for all
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

-- ============================================================
-- 6. RESULTADOS E CRONOMETRAGEM
-- ============================================================

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete cascade not null unique,
  event_id uuid references public.events(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  bib_number int not null,
  chip_code text,
  start_time timestamptz,
  finish_time timestamptz,
  net_time interval, -- Tempo líquido (chip)
  gun_time interval, -- Tempo de prova (largada até chegada)
  position_overall int, -- Posição geral
  position_category int, -- Posição na categoria
  position_gender int, -- Posição por gênero
  disqualified boolean default false,
  disqualification_reason text,
  certificate_url text, -- URL do certificado gerado
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para results
create index if not exists idx_results_event_id on public.results(event_id);
create index if not exists idx_results_category_id on public.results(category_id);
create index if not exists idx_results_bib_number on public.results(bib_number);

-- RLS para results
alter table public.results enable row level security;

create policy "Resultados são públicos"
  on public.results for select
  using (true);

create policy "Apenas admins podem modificar resultados"
  on public.results for all
  using (
    auth.uid() in (
      select user_id from public.admin_users 
      where role in ('SITE_ADMIN', 'CHIP_ADMIN') and is_active = true
    )
  );

-- ============================================================
-- 7. CMS - CONTEÚDO DO SITE
-- ============================================================

-- Páginas
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null check (status in ('draft', 'published', 'archived')) default 'draft',
  published_at timestamptz,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seções das páginas
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade not null,
  component_type text not null, -- hero, cards, timeline, testimonials, etc
  order_index int not null default 0,
  content jsonb not null, -- Dados da seção conforme schema CMS
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para sections
create index if not exists idx_sections_page_id on public.sections(page_id);
create index if not exists idx_sections_order on public.sections(page_id, order_index);

-- Posts do blog
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  cover_image text,
  author_id uuid references public.admin_users(id) on delete set null,
  category text,
  tags text[],
  status text not null check (status in ('draft', 'published', 'archived')) default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para posts
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_posts_published_at on public.posts(published_at desc);

-- RLS para pages/sections/posts
alter table public.pages enable row level security;
alter table public.sections enable row level security;
alter table public.posts enable row level security;

create policy "Páginas publicadas são públicas"
  on public.pages for select
  using (status = 'published');

create policy "Seções de páginas publicadas são públicas"
  on public.sections for select
  using (
    page_id in (select id from public.pages where status = 'published')
  );

create policy "Posts publicados são públicos"
  on public.posts for select
  using (status = 'published');

create policy "Admins podem gerenciar conteúdo"
  on public.pages for all
  using (
    auth.uid() in (
      select user_id from public.admin_users 
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

create policy "Admins podem gerenciar seções"
  on public.sections for all
  using (
    auth.uid() in (
      select user_id from public.admin_users 
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

create policy "Admins podem gerenciar posts"
  on public.posts for all
  using (
    auth.uid() in (
      select user_id from public.admin_users 
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

-- ============================================================
-- 7b. REGULAMENTOS
-- ============================================================

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

-- Templates de email/notificação
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

create policy "Admins podem gerenciar templates"
  on public.email_templates for all
  using (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

-- ============================================================
-- 8. CONFIGURAÇÕES GLOBAIS
-- ============================================================

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.admin_users(id) on delete set null,
  updated_at timestamptz default now()
);

-- RLS para settings
alter table public.settings enable row level security;

create policy "Settings são públicas para leitura"
  on public.settings for select
  using (true);

create policy "Apenas SITE_ADMIN pode modificar settings"
  on public.settings for all
  using (
    auth.uid() in (
      select user_id from public.admin_users 
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

-- ============================================================
-- 9. NOTIFICAÇÕES
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete cascade,
  type text not null check (type in ('email', 'sms', 'whatsapp', 'push')),
  template text not null,
  recipient text not null,
  subject text,
  body text not null,
  status text not null check (status in ('pending', 'sent', 'failed', 'bounced')) default 'pending',
  sent_at timestamptz,
  error_message text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Índices para notifications
create index if not exists idx_notifications_athlete_id on public.notifications(athlete_id);
create index if not exists idx_notifications_status on public.notifications(status);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- ============================================================
-- 10. FUNÇÕES ÚTEIS
-- ============================================================

-- Função para gerar número de inscrição automaticamente
create or replace function generate_registration_number(
  p_event_id uuid,
  p_category_id uuid
)
returns text
language plpgsql
as $$
declare
  v_year int;
  v_category_slug text;
  v_count int;
  v_number text;
begin
  -- Buscar ano do evento e slug da categoria
  select e.year, c.slug
  into v_year, v_category_slug
  from events e
  inner join categories c on c.id = p_category_id
  where e.id = p_event_id;

  -- Contar inscrições existentes nesta categoria
  select count(*) + 1
  into v_count
  from registrations
  where event_id = p_event_id and category_id = p_category_id;

  -- Gerar número (ex: 2026-GERAL-0001)
  v_number := v_year::text || '-' || upper(v_category_slug) || '-' || lpad(v_count::text, 4, '0');
  
  return v_number;
end;
$$;

-- Função para calcular idade no ano de corte
create or replace function calculate_age_at_year_end(
  birth_date date,
  year_cutoff int
)
returns int
language plpgsql
as $$
begin
  return year_cutoff - extract(year from birth_date)::int;
end;
$$;

-- Função para validar elegibilidade de categoria
create or replace function validate_category_eligibility(
  p_birth_date date,
  p_category_id uuid
)
returns jsonb
language plpgsql
as $$
declare
  v_category record;
  v_event record;
  v_age int;
  v_result jsonb;
begin
  -- Buscar categoria e evento
  select c.*, e.year, e.age_cutoff_date
  into v_category
  from categories c
  inner join events e on c.event_id = e.id
  where c.id = p_category_id;

  -- Calcular idade no ano de corte
  v_age := extract(year from v_category.age_cutoff_date)::int - extract(year from p_birth_date)::int;

  -- Validar idade mínima
  if v_age < v_category.min_age then
    return jsonb_build_object(
      'valid', false,
      'message', 'Idade mínima não atingida para esta categoria.',
      'age', v_age
    );
  end if;

  -- Validar idade máxima (se houver)
  if v_category.max_age is not null and v_age > v_category.max_age then
    return jsonb_build_object(
      'valid', false,
      'message', 'Idade acima do permitido para esta categoria.',
      'age', v_age
    );
  end if;

  return jsonb_build_object(
    'valid', true,
    'age', v_age
  );
end;
$$;

-- ============================================================
-- 11. TRIGGERS
-- ============================================================

-- Trigger para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Aplicar trigger em todas as tabelas relevantes
create trigger update_admin_users_updated_at before update on public.admin_users
  for each row execute function update_updated_at_column();

create trigger update_events_updated_at before update on public.events
  for each row execute function update_updated_at_column();

create trigger update_categories_updated_at before update on public.categories
  for each row execute function update_updated_at_column();

create trigger update_athletes_updated_at before update on public.athletes
  for each row execute function update_updated_at_column();

create trigger update_registrations_updated_at before update on public.registrations
  for each row execute function update_updated_at_column();

create trigger update_results_updated_at before update on public.results
  for each row execute function update_updated_at_column();

create trigger update_pages_updated_at before update on public.pages
  for each row execute function update_updated_at_column();

create trigger update_sections_updated_at before update on public.sections
  for each row execute function update_updated_at_column();

create trigger update_posts_updated_at before update on public.posts
  for each row execute function update_updated_at_column();

create trigger update_settings_updated_at before update on public.settings
  for each row execute function update_updated_at_column();

-- ============================================================
-- 12. DADOS INICIAIS (SEED)
-- ============================================================

-- Inserir evento de 2026
insert into public.events (year, edition, race_date, age_cutoff_date, location, city, state, registrations_open, contact_email, contact_phone)
values (
  2026,
  51,
  '2026-06-24',
  '2026-12-31',
  'Centro, Macuco - RJ',
  'Macuco',
  'RJ',
  true,
  'contato@corridamacuco.com.br',
  '(22) 99999-9999'
) on conflict (year) do nothing;

-- Buscar o ID do evento criado
do $$
declare
  v_event_id uuid;
begin
  select id into v_event_id from public.events where year = 2026;

  -- Inserir categorias
  insert into public.categories (event_id, slug, name, description, distance, price, is_free, min_age, max_age, age_rule, requires_residence_proof, total_slots, color_from, color_to, icon)
  values
    (v_event_id, 'geral-10k', 'Geral 10K', 'Categoria principal para atletas a partir de 15 anos', '10 quilômetros', 20.00, false, 15, null, 'Quem completa 15 anos até 31/12/2026', false, 500, 'blue-600', 'cyan-600', '🏃'),
    (v_event_id, 'morador-10k', 'Morador de Macuco 10K', 'Categoria gratuita para moradores de Macuco', '10 quilômetros', 0, true, 15, null, 'Quem completa 15 anos até 31/12/2026', true, 200, 'green-600', 'emerald-600', '🏘️'),
    (v_event_id, '60-mais-10k', '60+ 10K', 'Categoria gratuita para atletas acima de 60 anos', '10 quilômetros', 0, true, 60, null, '60 anos ou mais até 31/12/2026', false, 100, 'purple-600', 'pink-600', '👴'),
    (v_event_id, 'infantil-2k', 'Infantil 2K', 'Categoria gratuita para crianças de 5 a 14 anos', '2 quilômetros', 0, true, 5, 14, 'Até 14 anos completos em 2026', false, 300, 'yellow-500', 'orange-500', '👶')
  on conflict (event_id, slug) do nothing;
end $$;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================

-- Para verificar se tudo foi criado corretamente, execute:
-- select tablename from pg_tables where schemaname = 'public' order by tablename;








