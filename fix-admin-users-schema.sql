-- ============================================================
-- CORREÇÃO DO SCHEMA - TABELA ADMIN_USERS
-- ============================================================
-- Execute este SQL no Supabase SQL Editor para corrigir
-- a tabela admin_users e adicionar a coluna mfa_enabled
-- ============================================================

-- Adicionar coluna mfa_enabled na tabela admin_users
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
AND table_schema = 'public'
ORDER BY ordinal_position;






