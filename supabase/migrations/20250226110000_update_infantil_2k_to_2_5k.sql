-- Atualiza categoria Infantil 2K para 2.5K (distância alterada de 2 km para 2,5 km)
UPDATE public.categories
SET
  name = 'Infantil 2.5K',
  distance = '2,5 quilômetros',
  updated_at = now()
WHERE slug = 'infantil-2k';
