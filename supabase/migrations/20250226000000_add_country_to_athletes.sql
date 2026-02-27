-- Adiciona coluna country para armazenar nacionalidade (código ISO) de atletas estrangeiros
-- Para brasileiros: country = 'BRA', city e state preenchidos
-- Para estrangeiros: country = código do país, city e state nulos

alter table public.athletes add column if not exists country text;

comment on column public.athletes.country is 'Código ISO do país (ex: BRA, ARG). Para brasileiros sempre BRA.';
