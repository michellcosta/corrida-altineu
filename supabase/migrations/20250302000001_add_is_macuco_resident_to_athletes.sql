-- Adiciona coluna is_macuco_resident em athletes (para categoria Infantil)
alter table public.athletes
  add column if not exists is_macuco_resident boolean;

comment on column public.athletes.is_macuco_resident is 'Se o atleta (criança) é morador de Macuco - usado na categoria Infantil';
