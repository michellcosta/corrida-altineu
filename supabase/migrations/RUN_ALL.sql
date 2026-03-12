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

-- 6. Coluna is_macuco_resident em athletes (categoria Infantil)
alter table public.athletes add column if not exists is_macuco_resident boolean;
comment on column public.athletes.is_macuco_resident is 'Se o atleta (criança) é morador de Macuco - usado na categoria Infantil';

-- 7. Configuração da IA
CREATE TABLE IF NOT EXISTS public.ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  system_prompt TEXT,
  regulation_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Adicionar coluna ai_provider se não existir
ALTER TABLE public.ai_config ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'gemini';

-- Verificar se a constraint existe ou apenas rodar o check separadamente
-- Nota: IF NOT EXISTS no checkout constraint não é padrão, mas aqui vamos manter simples.
-- Se falhar porque já existe o campo sem check, o próximo passo resolve.

UPDATE public.ai_config SET ai_provider = 'gemini' WHERE ai_provider IS NULL;

-- 8. Garantir unicidade da configuração por evento
DELETE FROM public.ai_config a USING public.ai_config b WHERE a.id < b.id AND a.event_id = b.event_id;
ALTER TABLE public.ai_config DROP CONSTRAINT IF EXISTS ai_config_event_id_key;
ALTER TABLE public.ai_config ADD CONSTRAINT ai_config_event_id_key UNIQUE (event_id);

-- Inserir configuração inicial se não existir
INSERT INTO public.ai_config (event_id, system_prompt, regulation_text, ai_provider)
SELECT id, 'Você é o assistente virtual da Corrida de Macuco 2026. Responda dúvidas baseando-se no regulamento abaixo. Seja amigável e conciso.', 'Regulamento inicial...', 'gemini'
FROM public.events
WHERE year = 2026
ON CONFLICT DO NOTHING;

-- 9. Hardening de segurança (RLS e policies)
ALTER TABLE IF EXISTS public.ai_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SITE_ADMIN gerencia ai_config" ON public.ai_config;
CREATE POLICY "SITE_ADMIN gerencia ai_config"
  ON public.ai_config FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
      WHERE role = 'SITE_ADMIN' AND is_active = true
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
      WHERE role = 'SITE_ADMIN' AND is_active = true
    )
  );
DROP POLICY IF EXISTS "Service role gerencia ai_config" ON public.ai_config;
CREATE POLICY "Service role gerencia ai_config"
  ON public.ai_config FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins podem ver histórico de notificações" ON public.notifications;
CREATE POLICY "Admins podem ver histórico de notificações"
  ON public.notifications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users WHERE is_active = true
    )
  );
DROP POLICY IF EXISTS "Service role gerencia notifications" ON public.notifications;
CREATE POLICY "Service role gerencia notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
