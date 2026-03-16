-- Segurança da busca de inscrição: lockout e rate limiting
-- Proteção contra exposição indevida de dados de atletas

CREATE TABLE IF NOT EXISTS public.buscar_lockout (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  identifier text NOT NULL,
  identifier_type text NOT NULL CHECK (identifier_type IN ('cpf', 'rg', 'email')),
  failed_count int DEFAULT 0,
  locked_until timestamptz,
  wrong_resend_count int DEFAULT 0,
  resend_blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ip_hash, identifier, identifier_type)
);

CREATE INDEX IF NOT EXISTS idx_buscar_lockout_ip ON public.buscar_lockout(ip_hash);
CREATE INDEX IF NOT EXISTS idx_buscar_lockout_updated ON public.buscar_lockout(updated_at);

CREATE TABLE IF NOT EXISTS public.buscar_rate_limit (
  ip_hash text PRIMARY KEY,
  count int DEFAULT 0,
  window_start timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buscar_rate_limit_window ON public.buscar_rate_limit(window_start);
