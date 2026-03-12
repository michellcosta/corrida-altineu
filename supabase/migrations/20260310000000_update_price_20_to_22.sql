-- Migration: Atualizar preço padrão de R$ 20 para R$ 22
-- events.price_geral, categories.price, registrations.payment_amount

-- 1. Atualizar events
UPDATE events SET price_geral = 22 WHERE price_geral = 20;

-- 2. Atualizar categories
UPDATE categories SET price = 22 WHERE price = 20;

-- 3. Atualizar registrations (inscrições com valor pago de R$ 20)
UPDATE registrations SET payment_amount = 22 WHERE payment_amount = 20;
