-- Limpeza de duplicados e adição de restrição de unicidade
-- Caso existam múltiplas linhas para o mesmo evento, mantemos a mais recente
DELETE FROM ai_config a
USING ai_config b
WHERE a.id < b.id
  AND a.event_id = b.event_id;

-- Adicionar restrição de unicidade para o event_id
-- Isso garante que o upsert funcione corretamente mesmo sem o ID primário
ALTER TABLE ai_config DROP CONSTRAINT IF EXISTS ai_config_event_id_key;
ALTER TABLE ai_config ADD CONSTRAINT ai_config_event_id_key UNIQUE (event_id);
