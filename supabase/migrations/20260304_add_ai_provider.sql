-- Migração para adicionar suporte a múltiplos provedores de IA
ALTER TABLE ai_config 
ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'gemini' 
CHECK (ai_provider IN ('gemini', 'deepseek'));

-- Garantir que a configuração existente tenha o valor padrão
UPDATE ai_config SET ai_provider = 'gemini' WHERE ai_provider IS NULL;
