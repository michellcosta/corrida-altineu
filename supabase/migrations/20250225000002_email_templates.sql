-- Tabela de templates de email/notificação
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
