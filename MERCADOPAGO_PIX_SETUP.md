# Configuração Mercado Pago PIX

Pagamentos da categoria **Prova Geral 10K** são processados via **PIX** usando Mercado Pago.

## 1. Variáveis de ambiente

Adicione ao `.env.local`:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx  # Teste: TEST-xxx | Produção: APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET=            # Assinatura secreta (opcional)
NEXT_PUBLIC_APP_URL=https://corridademacuco.vercel.app
```

Obtenha as credenciais em: https://www.mercadopago.com.br/developers/panel/app

## 2. Webhook

O webhook confirma pagamentos em tempo real.

1. No painel Mercado Pago: **Webhooks** → **Configurar notificações**
2. **URL (modo teste):** `https://corridademacuco.vercel.app/api/payments/webhook`
3. **Eventos:** marque **Pagamentos**
4. Copie a **Assinatura secreta** e adicione em `MERCADOPAGO_WEBHOOK_SECRET` no `.env.local` (opcional)

Para produção, configure a URL com seu domínio final.

## 3. Fluxo

1. Usuário preenche inscrição e clica em **Pagar com PIX**
2. Inscrição é criada com status `pending_payment`
3. API cria cobrança PIX via Mercado Pago
4. Usuário paga via QR Code ou copia e cola
5. Mercado Pago envia webhook → inscrição atualizada para `confirmed` e `paid`
6. Usuário é redirecionado para `/inscricao/sucesso`

## 4. Teste em desenvolvimento

Com credenciais de teste (`TEST-`), use o endpoint de simulação:

```bash
curl -X POST "http://localhost:3000/api/payments/simulate" \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "ID_DO_PAGAMENTO"}'
```

Ou chame `POST /api/payments/simulate` com `payment_id` no body. O endpoint só funciona com token de teste.

## 5. Produção

1. Ative as credenciais de produção no painel Mercado Pago
2. Substitua `MERCADOPAGO_ACCESS_TOKEN` por `APP_USR-xxx`
3. Configure o webhook de produção com a URL do seu domínio
