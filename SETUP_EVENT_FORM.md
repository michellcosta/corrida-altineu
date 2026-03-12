# 🔧 Setup do Formulário de Configurações do Evento

## 📋 **Passos para implementar a persistência real no Supabase:**

### **1. Executar SQL no Supabase Dashboard**

Acesse: https://supabase.com/dashboard/project/pgrycfsfojgqaerjwpio/sql

#### **A. Adicionar campos faltantes na tabela events:**
```sql
-- Adicionar campos de horários
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS start_time_10k time DEFAULT '07:00';

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS start_time_2k time DEFAULT '08:30';

-- Adicionar campos de vagas por categoria
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_geral int DEFAULT 500;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_morador int DEFAULT 200;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_60plus int DEFAULT 100;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS slots_infantil int DEFAULT 300;

-- Adicionar campo de preço da categoria geral
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS price_geral numeric DEFAULT 22.00;
```

#### **B. Criar/atualizar registro do evento 2026:**
```sql
-- Inserir evento do ano 2026
INSERT INTO events (
  year, 
  edition, 
  race_date, 
  age_cutoff_date, 
  location, 
  city, 
  state, 
  total_prize, 
  registrations_open,
  registration_open_date,
  registration_close_date,
  contact_email,
  contact_phone,
  social_instagram,
  social_facebook,
  start_time_10k,
  start_time_2k,
  slots_geral,
  slots_morador,
  slots_60plus,
  slots_infantil,
  price_geral
) VALUES (
  2026, 
  51, 
  '2026-06-24', 
  '2026-12-31', 
  'Praça da Matriz', 
  'Macuco', 
  'RJ', 
  15000, 
  true,
  '2025-12-01',
  '2026-06-20',
  'contato@corridamacuco.com.br',
  '(22) 99999-9999',
  '@corridamacuco',
  'corridamacuco',
  '07:00',
  '08:30',
  500,
  200,
  100,
  300,
  22.00
) ON CONFLICT (year) DO UPDATE SET
  edition = EXCLUDED.edition,
  race_date = EXCLUDED.race_date,
  age_cutoff_date = EXCLUDED.age_cutoff_date,
  location = EXCLUDED.location,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  total_prize = EXCLUDED.total_prize,
  registrations_open = EXCLUDED.registrations_open,
  registration_open_date = EXCLUDED.registration_open_date,
  registration_close_date = EXCLUDED.registration_close_date,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  social_instagram = EXCLUDED.social_instagram,
  social_facebook = EXCLUDED.social_facebook,
  start_time_10k = EXCLUDED.start_time_10k,
  start_time_2k = EXCLUDED.start_time_2k,
  slots_geral = EXCLUDED.slots_geral,
  slots_morador = EXCLUDED.slots_morador,
  slots_60plus = EXCLUDED.slots_60plus,
  slots_infantil = EXCLUDED.slots_infantil,
  price_geral = EXCLUDED.price_geral;

-- Verificar se foi criado
SELECT * FROM events WHERE year = 2026;
```

### **2. Testar o formulário**

1. **Acesse:** `http://localhost:3000/admin/site/settings/event`
2. **Verifique se os dados carregam** do Supabase (não mais hardcoded)
3. **Teste editar alguns campos** e clicar em "Salvar"
4. **Recarregue a página** para verificar se as alterações persistem

### **3. O que deve acontecer:**

- ✅ **Carregamento:** Dados vêm do Supabase (não mais mock)
- ✅ **Edição:** Campos são editáveis
- ✅ **Salvamento:** Dados são salvos no Supabase
- ✅ **Persistência:** Alterações permanecem após recarregar

### **4. Debug (se necessário):**

#### **Verificar se o evento existe:**
```sql
SELECT * FROM events WHERE year = 2026;
```

#### **Verificar estrutura da tabela:**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

#### **Verificar logs no console do navegador:**
- Abra F12 → Console
- Procure por logs como `[auth.ts]` e `[browserClient]`

---

## 🎯 **Resultado esperado:**

Após executar esses passos, o formulário de configurações do evento estará **100% conectado ao Supabase**, permitindo:

- ✅ **Leitura real** dos dados do banco
- ✅ **Escrita real** das alterações
- ✅ **Persistência** entre sessões
- ✅ **Sincronização** com outras partes do sistema

**Execute os SQLs e teste o formulário!** 🚀







