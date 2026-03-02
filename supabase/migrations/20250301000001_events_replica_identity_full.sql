-- Necessário para Supabase Realtime receber eventos UPDATE com filtros
ALTER TABLE public.events REPLICA IDENTITY FULL;
