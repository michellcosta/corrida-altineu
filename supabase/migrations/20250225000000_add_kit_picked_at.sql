-- Adiciona coluna kit_picked_at para rastrear retirada de kits
alter table public.registrations
add column if not exists kit_picked_at timestamptz;

comment on column public.registrations.kit_picked_at is 'Data/hora em que o atleta retirou o kit';
