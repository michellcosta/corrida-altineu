-- Solução completa para políticas RLS do admin_users
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover todas as políticas existentes problemáticas
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON admin_users;
DROP POLICY IF EXISTS "Service role pode criar admins" ON admin_users;
DROP POLICY IF EXISTS "Admins autenticados podem ver perfis" ON admin_users;

-- 2. Criar política simples que permite acesso ao próprio registro
CREATE POLICY "Admin self access" ON admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Para desenvolvimento, temporariamente permitir acesso total (OPCIONAL)
-- Descomente a linha abaixo se quiser permitir acesso total durante desenvolvimento
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 4. Verificar as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';

-- 5. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admin_users';







