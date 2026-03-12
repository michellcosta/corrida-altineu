-- ============================================================
-- SEED DO CMS - PÁGINAS DO SITE
-- ============================================================
-- Execute este SQL no Supabase SQL Editor para popular
-- as páginas do site no CMS
-- ============================================================

-- Inserir páginas do site
INSERT INTO public.pages (slug, title, status, published_at)
VALUES
  ('home', 'Página Inicial', 'published', now()),
  ('sobre', 'Sobre a Corrida', 'published', now()),
  ('percursos', 'Percursos', 'published', now()),
  ('premiacoes', 'Premiações', 'published', now()),
  ('programacao', 'Programação', 'published', now()),
  ('prova-10k', 'Prova 10K Geral', 'published', now()),
  ('morador-10k', 'Morador 10K', 'published', now()),
  ('60-mais-10k', '60+ 10K', 'published', now()),
  ('prova-kids', 'Prova Kids', 'published', now()),
  ('resultados', 'Resultados', 'published', now()),
  ('noticias', 'Notícias', 'published', now()),
  ('guia-atleta', 'Guia do Atleta', 'published', now()),
  ('politicas', 'Políticas', 'published', now()),
  ('contato', 'Contato', 'published', now())
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- Buscar IDs das páginas criadas para inserir seções
DO $$
DECLARE
  home_id uuid;
  sobre_id uuid;
  percursos_id uuid;
  premiacoes_id uuid;
  programacao_id uuid;
  prova_10k_id uuid;
  morador_10k_id uuid;
  sessenta_mais_id uuid;
  prova_kids_id uuid;
  resultados_id uuid;
  noticias_id uuid;
  guia_atleta_id uuid;
  politicas_id uuid;
  contato_id uuid;
BEGIN
  -- Buscar IDs das páginas
  SELECT id INTO home_id FROM public.pages WHERE slug = 'home';
  SELECT id INTO sobre_id FROM public.pages WHERE slug = 'sobre';
  SELECT id INTO percursos_id FROM public.pages WHERE slug = 'percursos';
  SELECT id INTO premiacoes_id FROM public.pages WHERE slug = 'premiacoes';
  SELECT id INTO programacao_id FROM public.pages WHERE slug = 'programacao';
  SELECT id INTO prova_10k_id FROM public.pages WHERE slug = 'prova-10k';
  SELECT id INTO morador_10k_id FROM public.pages WHERE slug = 'morador-10k';
  SELECT id INTO sessenta_mais_id FROM public.pages WHERE slug = '60-mais-10k';
  SELECT id INTO prova_kids_id FROM public.pages WHERE slug = 'prova-kids';
  SELECT id INTO resultados_id FROM public.pages WHERE slug = 'resultados';
  SELECT id INTO noticias_id FROM public.pages WHERE slug = 'noticias';
  SELECT id INTO guia_atleta_id FROM public.pages WHERE slug = 'guia-atleta';
  SELECT id INTO politicas_id FROM public.pages WHERE slug = 'politicas';
  SELECT id INTO contato_id FROM public.pages WHERE slug = 'contato';

  -- ============================================================
  -- SEÇÕES DA PÁGINA HOME
  -- ============================================================
  
  -- Hero Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "51ª Grande Corrida Rústica de São João Batista",
      "subheadline": "51ª edição • Tradição desde 1972",
      "description": "A maior tradição esportiva da região. Participe da corrida mais esperada do ano!",
      "ctaPrimary": {
        "label": "Inscrever-se",
        "href": "/inscricao",
        "variant": "primary"
      },
      "ctaSecondary": {
        "label": "Ver Percursos",
        "href": "/percursos",
        "variant": "secondary"
      },
      "stats": [
        {"value": "51ª", "label": "Edição"},
        {"value": "1000+", "label": "Atletas"},
        {"value": "R$ 15.000", "label": "Em Premiação"}
      ]
    }'::jsonb,
    true
  );

  -- Countdown Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'countdown',
    2,
    '{
      "type": "countdown",
      "title": "Contagem Regressiva",
      "subtitle": "Para a largada da 51ª Grande Corrida Rústica de São João Batista",
      "targetDate": "2026-06-24T11:00:00.000Z"
    }'::jsonb,
    true
  );

  -- Categories/Cards Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'cards',
    3,
    '{
      "type": "cards",
      "title": "Categorias",
      "subtitle": "Escolha sua modalidade",
      "layout": "grid-4",
      "cards": [
        {
          "id": "geral-10k",
          "icon": "🏃",
          "title": "Geral 10K",
          "description": "Categoria principal para atletas a partir de 15 anos",
          "price": "R$ 22,00",
          "isFree": false,
          "details": ["10 quilômetros", "Medalha finisher", "Kit completo"],
          "cta": {"label": "Inscrever-se", "href": "/prova-10k", "variant": "primary"}
        },
        {
          "id": "morador-10k",
          "icon": "🏘️",
          "title": "Morador 10K",
          "description": "Categoria gratuita para moradores de Macuco",
          "price": "GRATUITO",
          "isFree": true,
          "details": ["10 quilômetros", "Medalha finisher", "Kit completo"],
          "cta": {"label": "Inscrever-se", "href": "/morador-10k", "variant": "primary"}
        },
        {
          "id": "60-mais-10k",
          "icon": "👴",
          "title": "60+ 10K",
          "description": "Categoria gratuita para atletas acima de 60 anos",
          "price": "GRATUITO",
          "isFree": true,
          "details": ["10 quilômetros", "Medalha finisher", "Kit completo"],
          "cta": {"label": "Inscrever-se", "href": "/60-mais-10k", "variant": "primary"}
        },
        {
          "id": "infantil-2k",
          "icon": "👶",
          "title": "Infantil 2.5K",
          "description": "Categoria gratuita para crianças de 5 a 14 anos",
          "price": "GRATUITO",
          "isFree": true,
          "details": ["2,5 quilômetros", "Medalha finisher", "Kit completo"],
          "cta": {"label": "Inscrever-se", "href": "/prova-kids", "variant": "primary"}
        }
      ]
    }'::jsonb,
    true
  );

  -- Timeline Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'timeline',
    4,
    '{
      "type": "timeline",
      "title": "Tradição desde 1972",
      "subtitle": "Mais de cinco décadas promovendo saúde, esporte e união em Macuco",
      "milestones": [
        {
          "year": "1972",
          "title": "Primeira Edição",
          "description": "Idealizada pela família do Clube União Maravilha, liderada por Altineu Coutinho, nasceu a tradição que marcaria gerações em Macuco",
          "highlight": false
        },
        {
          "year": "2024",
          "title": "Patrimônio Histórico",
          "description": "Declarada Patrimônio Histórico Cultural Imaterial de Macuco pela Lei 1.158/2024",
          "highlight": false
        },
        {
          "year": "2025",
          "title": "50ª Edição",
          "description": "Ano dourado, maior premiação da história, com R$ 10 mil para o primeiro colocado",
          "highlight": true
        },
        {
          "year": "2026",
          "title": "51ª Edição",
          "description": "Continuando a tradição com inovação e sustentabilidade",
          "highlight": false
        }
      ]
    }'::jsonb,
    true
  );

  -- Testimonials Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'testimonials',
    5,
    '{
      "type": "testimonials",
      "title": "O Que Dizem Nossos Atletas",
      "subtitle": "Depoimentos reais de quem viveu a experiência",
      "testimonials": [
        {
          "name": "Maria Silva",
          "role": "Prova 10K Geral",
          "city": "Macuco - RJ",
          "rating": 5,
          "text": "Melhor corrida que já participei! Organização perfeita, percurso incrível e um clima de festa que só a Corrida do Macuco proporciona.",
          "image": {"url": "/images/testimonials/maria.jpg", "alt": "Maria Silva"}
        },
        {
          "name": "João Santos",
          "role": "Morador 10K",
          "city": "Macuco - RJ",
          "rating": 5,
          "text": "Como morador, é motivo de orgulho ver nossa cidade promovendo um evento desse nível. Já é tradição na minha família!",
          "image": {"url": "/images/testimonials/joao.jpg", "alt": "João Santos"}
        }
      ]
    }'::jsonb,
    true
  );

  -- News Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'news',
    6,
    '{
      "type": "news",
      "title": "Últimas Notícias",
      "subtitle": "Fique por dentro das novidades",
      "showCount": 3,
      "viewAllLink": "/noticias"
    }'::jsonb,
    true
  );

  -- Sponsors Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'sponsors',
    7,
    '{
      "type": "sponsors",
      "title": "Nossos Patrocinadores",
      "subtitle": "Parceiros que tornam este evento possível",
      "tiers": [
        {
          "name": "Patrocinadores Oficiais",
          "sponsors": [
            {
              "name": "Prefeitura de Macuco",
              "logo": {"url": "/images/sponsors/prefeitura.png", "alt": "Prefeitura de Macuco"},
              "website": "https://macuco.rj.gov.br"
            }
          ]
        }
      ]
    }'::jsonb,
    true
  );

  -- CTA Section
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    home_id,
    'cta',
    8,
    '{
      "type": "cta",
      "title": "Pronto para Participar?",
      "subtitle": "Garanta sua vaga na maior corrida da região",
      "ctaPrimary": {
        "label": "Inscrever-se Agora",
        "href": "/inscricao",
        "variant": "primary"
      },
      "ctaSecondary": {
        "label": "Ver Programação",
        "href": "/programacao",
        "variant": "secondary"
      },
      "features": [
        {"icon": "🏆", "text": "R$ 15.000 em premiação"},
        {"icon": "📅", "text": "Programação completa"},
        {"icon": "🎁", "text": "Kit premium"},
        {"icon": "⚡", "text": "Cronometragem eletrônica"}
      ]
    }'::jsonb,
    true
  );

  -- ============================================================
  -- SEÇÕES DAS PÁGINAS DE CATEGORIAS
  -- ============================================================

  -- Prova 10K Geral
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    prova_10k_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "Prova 10K Geral",
      "subheadline": "Categoria Principal",
      "description": "A categoria principal da 51ª Corrida de Macuco. Para atletas a partir de 15 anos.",
      "ctaPrimary": {
        "label": "Inscrever-se",
        "href": "/inscricao?categoria=geral-10k",
        "variant": "primary"
      }
    }'::jsonb,
    true
  );

  -- Morador 10K
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    morador_10k_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "Morador 10K",
      "subheadline": "Gratuito para Moradores",
      "description": "Categoria especial e gratuita para moradores de Macuco. Comprove sua residência e participe!",
      "ctaPrimary": {
        "label": "Inscrever-se",
        "href": "/inscricao?categoria=morador-10k",
        "variant": "primary"
      }
    }'::jsonb,
    true
  );

  -- 60+ 10K
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    sessenta_mais_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "60+ 10K",
      "subheadline": "Categoria Sênior",
      "description": "Categoria gratuita para atletas acima de 60 anos. Prova que a idade não é limite!",
      "ctaPrimary": {
        "label": "Inscrever-se",
        "href": "/inscricao?categoria=60-mais-10k",
        "variant": "primary"
      }
    }'::jsonb,
    true
  );

  -- Prova Kids
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    prova_kids_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "Prova Kids",
      "subheadline": "Para as Crianças",
      "description": "Categoria infantil gratuita para crianças de 5 a 14 anos. Diversão garantida!",
      "ctaPrimary": {
        "label": "Inscrever-se",
        "href": "/inscricao?categoria=infantil-2k",
        "variant": "primary"
      }
    }'::jsonb,
    true
  );

  -- ============================================================
  -- SEÇÕES DAS OUTRAS PÁGINAS
  -- ============================================================

  -- Página de Percursos
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    percursos_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "Percursos",
      "subheadline": "Conheça os Trajetos",
      "description": "Percursos certificados e medidos oficialmente para garantir a precisão dos seus tempos."
    }'::jsonb,
    true
  );

  -- Página de Premiações
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    premiacoes_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "Premiações",
      "subheadline": "R$ 15.000 em Prêmios",
      "description": "A maior premiação da história da Corrida de Macuco. Confira os valores por categoria."
    }'::jsonb,
    true
  );

  -- Página de Programação
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible)
  VALUES (
    programacao_id,
    'hero',
    1,
    '{
      "type": "hero",
      "headline": "Programação",
      "subtitle": "Cronograma Completo",
      "description": "Tudo que você precisa saber sobre o dia da prova e os eventos relacionados."
    }'::jsonb,
    true
  );

END $$;

-- Verificar se as páginas e seções foram criadas
SELECT 
  p.slug,
  p.title,
  p.status,
  COUNT(s.id) as sections_count
FROM public.pages p
LEFT JOIN public.sections s ON p.id = s.page_id AND s.is_visible = true
GROUP BY p.id, p.slug, p.title, p.status
ORDER BY p.slug;






