-- Security hardening:
-- 1) Enable RLS for public.notifications and public.ai_config
-- 2) Replace permissive ai_usage policy with restricted policies
-- 3) Fix mutable search_path warnings on functions

-- ------------------------------------------------------------
-- notifications: prevent public data access
-- ------------------------------------------------------------
alter table if exists public.notifications enable row level security;

drop policy if exists "Admins podem ver histórico de notificações" on public.notifications;
create policy "Admins podem ver histórico de notificações"
  on public.notifications for select
  using (
    auth.uid() in (
      select user_id from public.admin_users where is_active = true
    )
  );

drop policy if exists "Service role gerencia notifications" on public.notifications;
create policy "Service role gerencia notifications"
  on public.notifications for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- ai_config: only SITE_ADMIN + service role
-- ------------------------------------------------------------
alter table if exists public.ai_config enable row level security;

drop policy if exists "SITE_ADMIN gerencia ai_config" on public.ai_config;
create policy "SITE_ADMIN gerencia ai_config"
  on public.ai_config for all
  using (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN' and is_active = true
    )
  )
  with check (
    auth.uid() in (
      select user_id from public.admin_users
      where role = 'SITE_ADMIN' and is_active = true
    )
  );

drop policy if exists "Service role gerencia ai_config" on public.ai_config;
create policy "Service role gerencia ai_config"
  on public.ai_config for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- ai_usage: remove permissive policy if table exists
-- ------------------------------------------------------------
do $$
begin
  if to_regclass('public.ai_usage') is not null then
    execute 'alter table public.ai_usage enable row level security';

    execute 'drop policy if exists "Enable all access" on public.ai_usage';
    execute 'drop policy if exists "Enable all for service role" on public.ai_usage';

    execute $policy$
      create policy "Service role gerencia ai_usage"
        on public.ai_usage for all
        using (auth.role() = 'service_role')
        with check (auth.role() = 'service_role')
    $policy$;

    execute $policy$
      create policy "Admins podem ler ai_usage"
        on public.ai_usage for select
        using (
          auth.uid() in (
            select user_id from public.admin_users where is_active = true
          )
        )
    $policy$;
  end if;
end
$$;

-- ------------------------------------------------------------
-- Functions: set fixed search_path to avoid hijacking
-- ------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'track_page_view'
  ) then
    execute 'alter function public.track_page_view(text) set search_path = public';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'generate_registration_number'
  ) then
    execute 'alter function public.generate_registration_number(uuid, uuid) set search_path = public';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'calculate_age_at_year_end'
  ) then
    execute 'alter function public.calculate_age_at_year_end(date, integer) set search_path = public';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'validate_category_eligibility'
  ) then
    execute 'alter function public.validate_category_eligibility(date, uuid) set search_path = public';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'update_updated_at_column'
  ) then
    execute 'alter function public.update_updated_at_column() set search_path = public';
  end if;
end
$$;
