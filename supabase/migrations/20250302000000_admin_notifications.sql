-- Tabela de notificações para admins (SITE_ADMIN e CHIP_ADMIN)
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete cascade not null,
  type text not null check (type in ('athlete_data_updated', 'new_registration', 'payment_received')),
  title text not null,
  message text not null,
  link text,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_admin_notifications_admin_user_id on public.admin_notifications(admin_user_id);
create index if not exists idx_admin_notifications_read_at on public.admin_notifications(read_at);
create index if not exists idx_admin_notifications_created_at on public.admin_notifications(created_at desc);

alter table public.admin_notifications enable row level security;

create policy "Admins podem ver suas próprias notificações"
  on public.admin_notifications for select
  using (
    admin_user_id in (
      select id from public.admin_users where user_id = auth.uid()
    )
  );

create policy "Admins podem marcar suas notificações como lidas"
  on public.admin_notifications for update
  using (
    admin_user_id in (
      select id from public.admin_users where user_id = auth.uid()
    )
  )
  with check (
    admin_user_id in (
      select id from public.admin_users where user_id = auth.uid()
    )
  );

-- Inserção via service role (API server-side) - sem policy de insert para anon
-- A API usa createServiceClient que bypassa RLS
