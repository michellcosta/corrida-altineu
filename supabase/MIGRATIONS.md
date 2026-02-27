# Migrations - Corrida Rústica de Macuco

Execute as migrations na ordem abaixo no **Supabase Dashboard → SQL Editor**.

## Ordem de execução

1. **20250225000000_add_kit_picked_at.sql** – Coluna `kit_picked_at` em `registrations`
2. **20250225000001_regulations_table.sql** – Tabela `regulations` (se ainda não existir)
3. **20250225000002_email_templates.sql** – Tabela `email_templates` (se ainda não existir)
4. **20250225100000_storage_media_bucket.sql** – Políticas de Storage para o bucket `media`
5. **20250226000000_add_country_to_athletes.sql** – Coluna `country` em `athletes` (origem do atleta)

> **Bucket media:** Execute `npx tsx scripts/setup-supabase.ts` para criar o bucket via API. As políticas são aplicadas pela migration 4.

## Como executar

### Opção A: Tudo de uma vez (recomendado)

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto
2. Vá em **SQL Editor** → **New query**
3. Copie o conteúdo de `supabase/migrations/RUN_ALL.sql`
4. Cole no editor e clique em **Run**

### Opção B: Arquivo por arquivo

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto
2. Vá em **SQL Editor**
3. Copie o conteúdo de cada arquivo em `supabase/migrations/` (na ordem acima)
4. Cole no editor e clique em **Run**

## Verificação

Após executar, confira:

- `registrations` tem a coluna `kit_picked_at`
- Existe a tabela `regulations`
- Existe a tabela `email_templates`
- Políticas de Storage em `storage.objects` para o bucket `media`
- `athletes` tem a coluna `country`

## Supabase CLI (alternativa)

Se tiver o Supabase CLI instalado:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```
