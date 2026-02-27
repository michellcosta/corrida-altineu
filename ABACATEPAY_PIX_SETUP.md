# Configuração AbacatePay PIX

Pagamentos da categoria **Prova Geral 10K** são processados via **PIX** usando AbacatePay.

## 1. Conta AbacatePay

1. Crie uma conta em [abacatepay.com](https://abacatepay.com)
2. Acesse o painel e gere suas chaves de API
3. Use o modo de desenvolvimento para testar antes de produção

## 2. Variáveis de ambiente

Adicione ao `.env.local`:

```env
ABACATEPAY_API_KEY=sua_api_key_aqui
ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret_aqui
NEXT_PUBLIC_APP_URL=https://seu-dominio.com  # ex: https://corrida-macuco.vercel.app
```

## 3. Webhook (importante)

O webhook é o canal principal para confirmar pagamentos. Quando o AbacatePay confirma um PIX, ele envia um POST para nossa URL e atualizamos o banco. O polling (checagem de status) consulta o banco primeiro – se o webhook já atualizou, retornamos PAID imediatamente.

1. No painel AbacatePay, configure um novo webhook
2. **URL**: `https://seu-dominio.com/api/payments/webhook`
3. **Eventos**: `billing.paid` (pagamento PIX confirmado)
4. **Secret**: Defina um secret único e adicione em `ABACATEPAY_WEBHOOK_SECRET`
5. O AbacatePay envia o secret como `?webhookSecret=xxx` na URL

**Verifique:** A URL deve ser acessível (não localhost). Use o domínio de produção (ex: corridademacuco.vercel.app).

## 4. Fluxo

1. Usuário preenche inscrição e clica em **Pagar com PIX**
2. Inscrição é criada com status `pending_payment`
3. API cria cobrança PIX via AbacatePay
4. Usuário paga via QR Code ou copia e cola
5. AbacatePay envia webhook → inscrição atualizada para `confirmed` e `paid`
6. Usuário é redirecionado para `/inscricao/sucesso`

## 5. Teste em desenvolvimento

No modo de desenvolvimento (chave `abc_dev_...`), use o endpoint de simulação para testar pagamentos sem pagar de verdade.

**Importante:** O `id` do PIX deve ser passado como parâmetro de query na URL:

```bash
curl --request POST \
  --url "https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=SEU_PIX_ID" \
  --header "Authorization: Bearer SUA_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{"metadata": {}}'
```

Substitua:
- `SEU_PIX_ID` pelo ID retornado ao criar o PIX (ex: `pix_char_ApCfnDeqDdTHm0s4XTdtZPuX`)
- `SUA_API_KEY` pela sua chave de API (ex: `abc_dev_...`)

**Ou use o botão na tela:** Na etapa de pagamento PIX, clique em "Simular pagamento (teste)" para simular sem usar o curl. O botão só funciona com chave `abc_dev_`.

- [Simular Pagamento PIX](https://docs.abacatepay.com/api-reference/simular-pagamento)

## 6. Documentação

- [Documentação AbacatePay](https://docs.abacatepay.com/)
- [Criar cobrança PIX](https://docs.abacatepay.com/api-reference/criar-qrcode-pix)
- [Checar status](https://docs.abacatepay.com/api-reference/checar-status)
- [Webhooks](https://docs.abacatepay.com/pages/webhooks)
- [SDKs disponíveis](https://docs.abacatepay.com/pages/sdks)
- Suporte: ajuda@abacatepay.com
