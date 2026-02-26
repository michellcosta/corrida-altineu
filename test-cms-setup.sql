-- ============================================================
-- SCRIPT DE VERIFICAÇÃO - CMS SETUP
-- ============================================================
-- Execute este SQL no Supabase SQL Editor para verificar
-- se o CMS foi configurado corretamente
-- ============================================================

-- 1. Verificar se a coluna mfa_enabled existe
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
  AND table_schema = 'public'
  AND column_name = 'mfa_enabled';

-- 2. Verificar páginas criadas
SELECT 
  slug,
  title,
  status,
  published_at,
  created_at
FROM public.pages 
ORDER BY created_at DESC;

-- 3. Verificar seções criadas por página
SELECT 
  p.slug,
  p.title,
  COUNT(s.id) as total_sections,
  COUNT(CASE WHEN s.is_visible = true THEN 1 END) as visible_sections
FROM public.pages p
LEFT JOIN public.sections s ON p.id = s.page_id
GROUP BY p.id, p.slug, p.title
ORDER BY p.slug;

-- 4. Verificar tipos de seções criadas
SELECT 
  component_type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_visible = true THEN 1 END) as visible_count
FROM public.sections
GROUP BY component_type
ORDER BY count DESC;

-- 5. Verificar conteúdo das seções (amostra)
SELECT 
  p.slug as page_slug,
  s.component_type,
  s.order_index,
  s.is_visible,
  jsonb_pretty(s.content) as content_preview
FROM public.pages p
JOIN public.sections s ON p.id = s.page_id
WHERE p.slug = 'home'
ORDER BY s.order_index
LIMIT 3;

-- 6. Verificar se há dados de exemplo
SELECT 
  'Páginas' as table_name,
  COUNT(*) as total_records
FROM public.pages
UNION ALL
SELECT 
  'Seções' as table_name,
  COUNT(*) as total_records
FROM public.sections
UNION ALL
SELECT 
  'Usuários Admin' as table_name,
  COUNT(*) as total_records
FROM public.admin_users;

-- 7. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('pages', 'sections', 'admin_users')
ORDER BY tablename, policyname;






