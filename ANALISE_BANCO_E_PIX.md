# Análise do Banco de Dados e PIX QR Code

## 1. Banco de Dados – O que precisa estar aplicado

### Migrações obrigatórias

Execute no **Supabase Dashboard > SQL Editor** o arquivo `supabase/migrations/RUN_ALL.sql` ou as migrações individuais na ordem:

| Migração | O que faz |
|----------|-----------|
| `20250225000000_add_kit_picked_at.sql` | Coluna `kit_picked_at` em registrations |
| `20250226000000_add_country_to_athletes.sql` | Coluna `country` em athletes |
| `20250302000001_add_is_macuco_resident_to_athletes.sql` | Coluna `is_macuco_resident` em athletes (Infantil) |

Sem `is_macuco_resident`, a inscrição na categoria Infantil falha ao inserir o atleta.

### Verificação rápida

```sql
-- Verificar se colunas existem
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'athletes' 
AND column_name IN ('is_macuco_resident', 'country');

-- Deve retornar 2 linhas. Se retornar 0, execute RUN_ALL.sql
```

### RLS e Service Role

- A API de inscrição usa `SUPABASE_SERVICE_ROLE_KEY`, que ignora RLS.
- Não é necessário criar políticas extras para INSERT em `athletes`, `guardians` ou `registrations` quando a API usa service role.

---

## 2. PIX QR Code – Checklist

### Variáveis de ambiente (.env.local)

```env
ABACATEPAY_API_KEY=sua_chave_api_aqui
ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret  # opcional, para webhook
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### AbacatePay

1. Criar conta em https://abacatepay.com
2. Obter API Key em Dashboard > Configurações
3. Configurar webhook (opcional): `https://seu-dominio.com/api/payments/webhook?webhookSecret=SEU_SECRET`

### Formato do QR Code

A AbacatePay retorna `brCodeBase64` como `data:image/png;base64,...`.  
Se vier só o base64, o frontend adiciona o prefixo `data:image/png;base64,` automaticamente.

---

## 3. Fluxo do PIX

```
1. Usuário clica "Gerar PIX"
2. POST /api/payments/create-checkout
   - Valida: registrationId, email, amount >= 0.50
   - Chama AbacatePay POST /pixQrCode/create
   - Atualiza registrations.payment_id
   - Retorna: id, brCode, brCodeBase64
3. Frontend exibe QR Code (img src=brCodeBase64) e código copia-e-cola
4. Usuário paga
5. AbacatePay envia webhook OU usuário clica "Já fiz o pagamento"
6. GET /api/payments/status?payment_id=... consulta status
7. Se PAID → atualiza registration (status=confirmed, payment_status=paid)
```

---

## 4. Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| 500 "Pagamento não configurado" | `ABACATEPAY_API_KEY` ausente | Definir em .env.local |
| 400 "Dados incompletos" | Falta email ou amount | Garantir email do atleta/responsável e amount >= 0.50 |
| 500 "Resposta inválida da AbacatePay" | API retornou estrutura diferente | Conferir logs do servidor e documentação AbacatePay |
| QR Code não aparece | `brCodeBase64` sem prefixo data URL | Código já trata isso com fallback |
| Inscrição Infantil falha | Coluna `is_macuco_resident` inexistente | Rodar migração RUN_ALL.sql |

---

## 5. Aplicar migrações

No Supabase Dashboard: **SQL Editor** → New query → colar conteúdo de `supabase/migrations/RUN_ALL.sql` → Run.

## 6. Correções aplicadas no código

- **QR Code PIX**: API e frontend garantem que `brCodeBase64` tenha o prefixo `data:image/png;base64,` quando a AbacatePay retornar só o base64.
- **Logs**: create-checkout registra no console quando a resposta da AbacatePay está incompleta.
