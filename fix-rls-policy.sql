-- Corrigir política RLS que estava causando recursão infinita
-- Execute este SQL no Supabase SQL Editor

-- Remover a política problemática
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON admin_users;

-- Criar nova política que permite apenas acesso ao próprio registro
CREATE POLICY "Admin self access" ON admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Verificar se a política foi criada corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';







