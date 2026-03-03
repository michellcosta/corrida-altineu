-- Criação da tabela para configuração da IA
CREATE TABLE IF NOT EXISTS ai_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  system_prompt TEXT,
  regulation_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserir configuração inicial se não existir
INSERT INTO ai_config (event_id, system_prompt, regulation_text)
SELECT id, 'Você é o assistente virtual da Corrida de Macuco 2026. Responda dúvidas baseando-se no regulamento abaixo. Seja amigável e conciso.', 'Regulamento inicial...'
FROM events
WHERE year = 2026
ON CONFLICT DO NOTHING;
