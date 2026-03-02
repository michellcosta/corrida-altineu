# Análise do Banco de Dados - Corrida de Macuco

## Estrutura Principal

### Fluxo de Inscrição

```
events (evento 2026)
    └── categories (geral-10k, morador-10k, 60-mais-10k, infantil-2k)
            └── registrations (inscrições)
                    ├── athlete_id → athletes (dados do atleta)
                    └── guardian_id → guardians (responsável, só Infantil)
```

### Tabelas Envolvidas na Lista de Inscritos

| Tabela | Uso na lista |
|--------|---------------|
| **registrations** | Fonte principal – a lista consulta esta tabela |
| **athletes** | JOIN para obter nome, data nascimento, etc. |
| **categories** | JOIN para agrupar por categoria |

### Relacionamentos e CASCADE

```
registrations.athlete_id → athletes(id) ON DELETE CASCADE
registrations.category_id → categories(id) ON DELETE CASCADE
registrations.event_id → events(id) ON DELETE CASCADE
registrations.guardian_id → guardians(id) ON DELETE SET NULL
```

**Importante:** Se você excluir um **athlete**, as **registrations** vinculadas são excluídas em cascata. O inverso não ocorre: excluir uma registration não exclui o athlete.

---

## Por que inscritos excluídos ainda aparecem?

### 1. Onde a exclusão foi feita

- **Supabase Dashboard (SQL Editor ou Table Editor):** A exclusão é direta no banco. A API usa `createServiceClient()` (service role) e lê direto do banco, então deveria refletir de imediato.
- **Painel Admin (/admin/site/inscritos):** A exclusão usa `createClient()` (anon + cookies) e a policy "Admins podem deletar inscrições". A exclusão é feita na tabela `registrations`.

### 2. Tabela correta para exclusão

Para remover alguém da lista pública, é preciso excluir o registro em **`registrations`**.

- Excluir só em **`athletes`** → as **registrations** são removidas em cascata.
- Excluir só em **`registrations`** → o atleta continua em **athletes**, mas some da lista.

### 3. Possíveis causas de dados “antigos”

| Causa | Solução |
|-------|---------|
| **Replicação do Supabase** | Aguardar alguns segundos e recarregar a página |
| **Cache do navegador** | Hard refresh (Ctrl+Shift+R) ou aba anônima |
| **Projeto Supabase diferente** | Conferir `.env.local` e o projeto usado no Dashboard |
| **Exclusão em tabela errada** | Excluir em `registrations` (ou em `athletes` para cascata) |

---

## Verificação no Supabase

Execute no SQL Editor:

```sql
-- Contar inscrições por status (evento 2026)
SELECT r.status, COUNT(*) 
FROM registrations r
JOIN events e ON r.event_id = e.id
WHERE e.year = 2026
GROUP BY r.status;

-- Listar inscrições confirmadas (as que aparecem na lista pública)
SELECT r.id, r.registration_number, r.status, a.full_name
FROM registrations r
JOIN athletes a ON r.athlete_id = a.id
JOIN events e ON r.event_id = e.id
WHERE e.year = 2026
  AND LOWER(r.status) IN ('confirmed', 'confirmado')
ORDER BY r.registered_at;
```

---

## API da Lista (`/api/inscricao/lista`)

- Usa `createServiceClient()` (service role) – ignora RLS
- Consulta `registrations` para o evento do ano 2026
- Filtra apenas status `confirmed` para a lista pública
- Headers: `Cache-Control: no-store, no-cache, must-revalidate`
- Rota: `dynamic = 'force-dynamic'`

Não há cache de API configurado para essa rota.

---

## Recomendações

1. Confirmar no Supabase se os registros foram removidos da tabela `registrations`.
2. Fazer hard refresh (Ctrl+Shift+R) na página da lista.
3. Se ainda aparecerem, adicionar cache-busting na requisição:  
   `fetch('/api/inscricao/lista?t=' + Date.now())`
