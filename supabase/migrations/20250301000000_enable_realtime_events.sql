-- Habilita Supabase Realtime na tabela events para atualização em tempo real
-- quando o admin altera configurações em /admin/site/settings/event.
--
-- Alternativa: no Dashboard do Supabase, vá em Database > Publications,
-- edite supabase_realtime e marque a tabela "events".
--
-- Após aplicar esta migration, o site atualiza automaticamente quando
-- o admin salva em /admin/site/settings/event (Home e Inscrição).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  END IF;
END $$;
