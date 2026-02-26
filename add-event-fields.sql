-- Adicionar campos faltantes na tabela events
-- Execute este SQL no Supabase SQL Editor

-- Adicionar campos de horários
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS start_time_10k time DEFAULT '07:00';

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS start_time_2k time DEFAULT '08:30';

-- Adicionar campos de vagas por categoria
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_geral int DEFAULT 500;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_morador int DEFAULT 200;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_60plus int DEFAULT 100;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_infantil int DEFAULT 300;

-- Adicionar campo de preço da categoria geral
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS price_geral numeric DEFAULT 20.00;

-- Verificar se os campos foram adicionados
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND table_schema = 'public'
ORDER BY ordinal_position;







