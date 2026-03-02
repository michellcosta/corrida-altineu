-- ============================================================
-- SEED COMPLETO DO CMS - PÁGINAS E POSTS
-- ============================================================
-- Execute este SQL no Supabase SQL Editor para popular
-- TODAS as páginas e posts do site
-- ============================================================

-- ============================================================
-- PARTE 1: PÁGINAS INSTITUCIONAIS
-- ============================================================

-- Inserir todas as páginas do site
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
  ('politicas', 'Políticas de Privacidade', 'published', now()),
  ('regulamento', 'Regulamento', 'published', now()),
  ('contato', 'Contato', 'published', now())
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- ============================================================
-- PARTE 2: SEÇÕES DAS PÁGINAS
-- ============================================================

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
  regulamento_id uuid;
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
  SELECT id INTO regulamento_id FROM public.pages WHERE slug = 'regulamento';
  SELECT id INTO contato_id FROM public.pages WHERE slug = 'contato';

  -- Limpar seções existentes (para permitir re-execução do script)
  DELETE FROM public.sections WHERE page_id IN (
    home_id, sobre_id, percursos_id, premiacoes_id, programacao_id,
    prova_10k_id, morador_10k_id, sessenta_mais_id, prova_kids_id,
    resultados_id, noticias_id, guia_atleta_id, politicas_id, regulamento_id, contato_id
  );

  -- ============================================================
  -- PÁGINA HOME
  -- ============================================================
  
  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible) VALUES
  (home_id, 'hero', 1, '{
    "type": "hero",
    "headline": "51ª Corrida Rústica de Macuco",
    "subheadline": "24 de junho de 2026",
    "description": "A maior tradição esportiva da região. Participe da corrida mais esperada do ano!",
    "ctaPrimary": {"label": "Inscrever-se", "href": "/inscricao", "variant": "primary"},
    "ctaSecondary": {"label": "Ver Percursos", "href": "/percursos", "variant": "secondary"},
    "stats": [
      {"value": "51", "label": "Anos de Tradição"},
      {"value": "1000+", "label": "Atletas"},
      {"value": "R$ 15.000", "label": "Em Premiação"}
    ]
  }'::jsonb, true),
  
  (home_id, 'countdown', 2, '{
    "type": "countdown",
    "title": "Contagem Regressiva",
    "subtitle": "Para a 51ª Corrida de Macuco",
    "targetDate": "2026-06-24T08:00:00.000Z"
  }'::jsonb, true),
  
  (home_id, 'cards', 3, '{
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
        "price": "R$ 20,00",
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
  }'::jsonb, true),
  
  (home_id, 'timeline', 4, '{
    "type": "timeline",
    "title": "Nossa História",
    "subtitle": "Mais de 50 anos de tradição",
    "milestones": [
      {"year": "1975", "title": "Primeira Edição", "description": "Início da tradição esportiva em Macuco", "highlight": false},
      {"year": "1990", "title": "Consolidação", "description": "Evento se torna referência na região", "highlight": false},
      {"year": "2010", "title": "Modernização", "description": "Introdução da cronometragem eletrônica", "highlight": true},
      {"year": "2026", "title": "51ª Edição", "description": "Maior premiação da história: R$ 15.000", "highlight": true}
    ]
  }'::jsonb, true),
  
  (home_id, 'testimonials', 5, '{
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
  }'::jsonb, true),
  
  (home_id, 'news', 6, '{
    "type": "news",
    "title": "Últimas Notícias",
    "subtitle": "Fique por dentro das novidades",
    "showCount": 3,
    "viewAllLink": "/noticias"
  }'::jsonb, true),
  
  (home_id, 'sponsors', 7, '{
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
  }'::jsonb, true),
  
  (home_id, 'cta', 8, '{
    "type": "cta",
    "title": "Pronto para Participar?",
    "subtitle": "Garanta sua vaga na maior corrida da região",
    "ctaPrimary": {"label": "Inscrever-se Agora", "href": "/inscricao", "variant": "primary"},
    "ctaSecondary": {"label": "Ver Programação", "href": "/programacao", "variant": "secondary"},
    "features": [
      {"icon": "🏆", "text": "R$ 15.000 em premiação"},
      {"icon": "📅", "text": "Programação completa"},
      {"icon": "🎁", "text": "Kit premium"},
      {"icon": "⚡", "text": "Cronometragem eletrônica"}
    ]
  }'::jsonb, true);

  -- ============================================================
  -- PÁGINAS DE CATEGORIAS
  -- ============================================================

  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible) VALUES
  (prova_10k_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Prova 10K Geral",
    "subheadline": "Categoria Principal",
    "description": "A categoria principal da 51ª Corrida de Macuco. Para atletas a partir de 15 anos que completam idade até 31/12/2026.",
    "ctaPrimary": {"label": "Inscrever-se", "href": "/inscricao?categoria=geral-10k", "variant": "primary"},
    "ctaSecondary": {"label": "Ver Regulamento", "href": "/regulamento", "variant": "secondary"}
  }'::jsonb, true),
  
  (morador_10k_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Morador 10K",
    "subheadline": "Gratuito para Moradores",
    "description": "Categoria especial e gratuita para moradores de Macuco. Comprove sua residência e participe!",
    "ctaPrimary": {"label": "Inscrever-se", "href": "/inscricao?categoria=morador-10k", "variant": "primary"},
    "ctaSecondary": {"label": "Ver Regulamento", "href": "/regulamento", "variant": "secondary"}
  }'::jsonb, true),
  
  (sessenta_mais_id, 'hero', 1, '{
    "type": "hero",
    "headline": "60+ 10K",
    "subheadline": "Categoria Sênior",
    "description": "Categoria gratuita para atletas acima de 60 anos. Prova que a idade não é limite!",
    "ctaPrimary": {"label": "Inscrever-se", "href": "/inscricao?categoria=60-mais-10k", "variant": "primary"},
    "ctaSecondary": {"label": "Ver Regulamento", "href": "/regulamento", "variant": "secondary"}
  }'::jsonb, true),
  
  (prova_kids_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Prova Kids",
    "subheadline": "Para as Crianças",
    "description": "Categoria infantil gratuita para crianças de 5 a 14 anos. Diversão garantida para toda família!",
    "ctaPrimary": {"label": "Inscrever-se", "href": "/inscricao?categoria=infantil-2k", "variant": "primary"},
    "ctaSecondary": {"label": "Ver Regulamento", "href": "/regulamento", "variant": "secondary"}
  }'::jsonb, true);

  -- ============================================================
  -- OUTRAS PÁGINAS INSTITUCIONAIS
  -- ============================================================

  INSERT INTO public.sections (page_id, component_type, order_index, content, is_visible) VALUES
  (sobre_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Sobre a Corrida",
    "subheadline": "51 Anos de Tradição",
    "description": "A Corrida Rústica de Macuco é um dos eventos esportivos mais tradicionais da região, reunindo atletas de diversas cidades."
  }'::jsonb, true),
  
  (percursos_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Percursos",
    "subheadline": "Conheça os Trajetos",
    "description": "Percursos certificados e medidos oficialmente para garantir a precisão dos seus tempos."
  }'::jsonb, true),
  
  (premiacoes_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Premiações",
    "subheadline": "R$ 15.000 em Prêmios",
    "description": "A maior premiação da história da Corrida de Macuco. Confira os valores por categoria."
  }'::jsonb, true),
  
  (programacao_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Programação",
    "subheadline": "Cronograma Completo",
    "description": "Tudo que você precisa saber sobre o dia da prova e os eventos relacionados."
  }'::jsonb, true),
  
  (resultados_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Resultados",
    "subheadline": "Classificações e Tempos",
    "description": "Consulte os resultados oficiais das edições anteriores e acompanhe a classificação em tempo real."
  }'::jsonb, true),
  
  (noticias_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Notícias",
    "subheadline": "Fique Por Dentro",
    "description": "Acompanhe as últimas novidades sobre a Corrida Rústica de Macuco."
  }'::jsonb, true),
  
  (guia_atleta_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Guia do Atleta",
    "subheadline": "Informações Importantes",
    "description": "Tudo que você precisa saber para participar da corrida: retirada de kit, horários, local e mais."
  }'::jsonb, true),
  
  (politicas_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Políticas de Privacidade",
    "subheadline": "Seus Dados Protegidos",
    "description": "Conheça como tratamos e protegemos seus dados pessoais."
  }'::jsonb, true),
  
  (regulamento_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Regulamento",
    "subheadline": "Regras e Normas",
    "description": "Leia o regulamento completo da 51ª Corrida Rústica de Macuco."
  }'::jsonb, true),
  
  (contato_id, 'hero', 1, '{
    "type": "hero",
    "headline": "Contato",
    "subheadline": "Fale Conosco",
    "description": "Entre em contato com a organização da Corrida Rústica de Macuco."
  }'::jsonb, true);

END $$;

-- ============================================================
-- PARTE 3: POSTS DO BLOG
-- ============================================================

-- Inserir os 3 posts existentes (hardcoded) no CMS
INSERT INTO public.posts (
  slug,
  title,
  excerpt,
  content,
  cover_image,
  category,
  tags,
  status,
  published_at
) VALUES
(
  'inscricoes-abertas-51-edicao',
  'Inscrições Abertas para a 51ª Edição',
  'Garanta sua vaga na maior corrida rústica da região! Inscrições já estão disponíveis para todas as categorias.',
  '<p>É com grande entusiasmo que anunciamos a abertura das inscrições para a <strong>51ª Corrida Rústica de Macuco</strong>, que acontecerá no dia <strong>24 de junho de 2026</strong>.</p>

<h2>Categorias Disponíveis</h2>
<ul>
  <li><strong>Geral 10K</strong> - R$ 20,00</li>
  <li><strong>Morador 10K</strong> - GRATUITO (requer comprovante de residência)</li>
  <li><strong>60+ 10K</strong> - GRATUITO</li>
  <li><strong>Infantil 2.5K</strong> - GRATUITO</li>
</ul>

<h2>Premiação Recorde</h2>
<p>Este ano, estamos oferecendo a <strong>maior premiação da história</strong> do evento: <strong>R$ 15.000,00</strong> distribuídos entre as categorias.</p>

<h2>Como se Inscrever</h2>
<p>As inscrições podem ser realizadas online através do nosso site. Basta acessar a página de inscrição, escolher sua categoria e preencher o formulário.</p>

<p><strong>Não perca tempo!</strong> As vagas são limitadas e costumam esgotar rapidamente.</p>',
  '/images/blog/inscricoes-abertas.jpg',
  'Inscrições',
  ARRAY['inscrições', 'categorias', 'premiação'],
  'published',
  now() - interval '7 days'
),
(
  'novo-percurso-10k',
  'Novo Percurso 10K Certificado',
  'Conheça o novo percurso certificado da categoria 10K, ainda mais desafiador e com vistas incríveis da cidade.',
  '<p>A organização da Corrida Rústica de Macuco tem o prazer de apresentar o <strong>novo percurso certificado</strong> para a categoria 10K da 51ª edição.</p>

<h2>Principais Mudanças</h2>
<ul>
  <li><strong>Percurso Certificado</strong> - Medido oficialmente por equipe técnica especializada</li>
  <li><strong>Mais Desafiador</strong> - Novos trechos com subidas e descidas estratégicas</li>
  <li><strong>Vistas Panorâmicas</strong> - Passa pelos pontos mais bonitos da cidade</li>
  <li><strong>Melhor Sinalização</strong> - Pontos de quilometragem e direção claramente marcados</li>
</ul>

<h2>Segurança em Primeiro Lugar</h2>
<p>Todo o percurso será <strong>totalmente isolado</strong> durante a prova, com apoio da Guarda Municipal e Polícia Militar. Haverá postos de hidratação a cada 2,5km e equipes médicas estrategicamente posicionadas.</p>

<h2>Reconhecimento do Percurso</h2>
<p>Recomendamos que todos os atletas façam o reconhecimento do percurso antes da prova. O mapa detalhado estará disponível em nossa página de Percursos.</p>',
  '/images/blog/novo-percurso.jpg',
  'Percursos',
  ARRAY['percurso', '10k', 'certificação'],
  'published',
  now() - interval '14 days'
),
(
  'dicas-preparacao',
  'Dicas de Preparação para a Corrida',
  'Confira as melhores práticas de treino, alimentação e equipamentos para chegar preparado no dia da prova.',
  '<p>Faltam poucos meses para a 51ª Corrida Rústica de Macuco e preparamos um <strong>guia completo</strong> para você chegar no seu melhor no dia da prova!</p>

<h2>Treinamento</h2>
<h3>8 Semanas Antes</h3>
<ul>
  <li>Comece com corridas leves de 20-30 minutos, 3x por semana</li>
  <li>Aumente gradualmente a distância em 10% por semana</li>
  <li>Inclua treinos de força 2x por semana</li>
</ul>

<h3>4 Semanas Antes</h3>
<ul>
  <li>Aumente a intensidade com treinos intervalados</li>
  <li>Faça pelo menos um longão de 12-15km</li>
  <li>Mantenha dias de descanso ativo</li>
</ul>

<h3>1 Semana Antes</h3>
<ul>
  <li>Reduza o volume de treinos (tapering)</li>
  <li>Foque em corridas leves de recuperação</li>
  <li>Descanse 2 dias antes da prova</li>
</ul>

<h2>Alimentação</h2>
<h3>Semana da Prova</h3>
<ul>
  <li><strong>Hidratação</strong> - Beba pelo menos 2L de água por dia</li>
  <li><strong>Carboidratos</strong> - Aumente a ingestão 3 dias antes</li>
  <li><strong>Proteínas</strong> - Mantenha o consumo regular</li>
</ul>

<h3>Dia da Prova</h3>
<ul>
  <li>Café da manhã leve 2-3h antes (pão, banana, mel)</li>
  <li>Evite alimentos novos ou pesados</li>
  <li>Leve gel energético se for usar (teste antes!)</li>
</ul>

<h2>Equipamentos</h2>
<h3>Essenciais</h3>
<ul>
  <li><strong>Tênis</strong> - Adequado para corrida, já amaciado</li>
  <li><strong>Roupa</strong> - Leve e que absorva suor</li>
  <li><strong>Relógio GPS</strong> - Para controlar o ritmo (opcional)</li>
</ul>

<h3>Recomendados</h3>
<ul>
  <li>Boné ou viseira para proteger do sol</li>
  <li>Óculos de sol</li>
  <li>Protetor solar</li>
  <li>Pochete ou porta-número</li>
</ul>

<h2>Dia da Prova</h2>
<ul>
  <li>Chegue com 1h de antecedência</li>
  <li>Faça aquecimento leve (10-15 min)</li>
  <li>Vá ao banheiro antes da largada</li>
  <li>Posicione-se de acordo com seu ritmo</li>
  <li>Comece devagar, você tem 10km pela frente!</li>
</ul>

<p><strong>Boa sorte!</strong> Nos vemos na linha de largada! 🏃‍♂️💪</p>',
  '/images/blog/dicas-preparacao.jpg',
  'Dicas',
  ARRAY['treinamento', 'preparação', 'dicas'],
  'published',
  now() - interval '21 days'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  cover_image = EXCLUDED.cover_image,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- Contar páginas e seções criadas
SELECT 
  'Páginas' as item,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published
FROM public.pages
UNION ALL
SELECT 
  'Seções' as item,
  COUNT(*) as total,
  COUNT(CASE WHEN is_visible = true THEN 1 END) as visible
FROM public.sections
UNION ALL
SELECT 
  'Posts' as item,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published
FROM public.posts;

-- Listar páginas criadas com contagem de seções
SELECT 
  p.slug,
  p.title,
  p.status,
  COUNT(s.id) as sections_count
FROM public.pages p
LEFT JOIN public.sections s ON p.id = s.page_id AND s.is_visible = true
GROUP BY p.id, p.slug, p.title, p.status
ORDER BY p.slug;






