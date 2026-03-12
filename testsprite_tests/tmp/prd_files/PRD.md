# Product Requirements Document (PRD)
## 51ª Corrida Rústica de Macuco

**Versão:** 1.0  
**Data:** Março 2026  
**Produto:** Sistema de Gestão de Corrida com Inscrições Online

---

## 1. Visão Geral do Produto

O sistema é uma plataforma web completa para a **51ª edição da Corrida Rústica de Macuco**, evento esportivo que ocorre em **24 de junho de 2026** em Macuco, RJ. O produto combina uma landing page pública para divulgação e inscrições com um painel administrativo para gestão do evento.

**Objetivo principal:** Permitir que atletas se inscrevam online, que visitantes obtenham informações sobre o evento e que organizadores gerenciem toda a operação da corrida.

---

## 2. Características e Funcionalidades

### 2.1 Área Pública (Frontend)

**Landing Page**
- Hero com chamada principal e contador regressivo até o dia da prova
- Seção de categorias com cards e regras específicas
- Timeline com história da corrida
- Depoimentos de atletas
- Notícias e novidades do evento
- Design responsivo e moderno

**Categorias de Corrida**
- **Geral 10K** – R$ 20,00 (a partir de 15 anos)
- **Morador de Macuco 10K** – Gratuita (moradores locais)
- **60+ 10K** – Gratuita (60 anos ou mais)
- **Infantil 2K** – Gratuita (5 a 14 anos)

**Páginas Informativas**
- Programação do evento
- Guia do Atleta
- Percursos e mapas
- Premiações
- Regulamento
- FAQ e Ajuda
- Políticas (privacidade, termos, cookies)
- Sobre o evento
- Contato

**Inscrição**
- Formulário de inscrição online
- Acompanhamento de inscrição
- Lista de inscritos
- Página de sucesso pós-inscrição

**Resultados**
- Consulta de resultados
- Validação de resultados

**Notícias**
- Listagem de notícias
- Páginas individuais (ex.: inscrições abertas, novos patrocinadores, percurso 2026)

### 2.2 Painel Administrativo

**Autenticação**
- Login via Supabase Auth
- Proteção de rotas por middleware
- Sessão e refresh de token

**Sistema de Roles (RBAC)**
- **SITE_ADMIN** – Controle total (conteúdo, usuários, configurações)
- **CHIP_ADMIN** – Cronometragem, resultados e gestão de chip
- **ORG_ADMIN** – Relatórios e visualização (somente leitura)

**Módulos Administrativos**
- Dashboard por role
- Gestão de inscritos
- Chip: alertas, exports, numeração, registros, resultados
- Comunicação
- Financeiro
- Configurações de evento (datas, categorias, preços)
- Estrutura CMS para gestão de conteúdo
- Audit logs de ações administrativas
- Área de IA (admin)

---

## 3. Finalidade e Objetivos

### 3.1 Objetivos de Negócio
- Centralizar informações da corrida em um único site
- Automatizar inscrições e reduzir trabalho manual
- Oferecer transparência em resultados e premiações
- Facilitar gestão para organizadores

### 3.2 Público-Alvo
- **Atletas** – Inscrição e consulta de resultados
- **Visitantes** – Informações sobre o evento
- **Organizadores** – Gestão via painel admin

---

## 4. Funcionamento e Fluxos

### 4.1 Fluxo do Visitante
1. Acessa a landing page
2. Navega pelas categorias e informações
3. Consulta programação, percursos e regulamento
4. Pode realizar inscrição (quando disponível)
5. Pode acompanhar inscrição e consultar resultados

### 4.2 Fluxo do Atleta (Inscrição)
1. Acessa página de inscrição
2. Seleciona categoria
3. Preenche dados pessoais
4. Realiza pagamento (quando aplicável)
5. Recebe confirmação e pode acompanhar status

### 4.3 Fluxo do Administrador
1. Acessa /admin
2. Faz login com credenciais
3. É redirecionado para dashboard conforme role
4. Executa ações permitidas (gestão de inscritos, chip, conteúdo, etc.)
5. Ações são registradas em audit log

### 4.4 Fluxo de Resultados
1. Atleta acessa página de resultados
2. Busca por nome, número ou chip
3. Visualiza tempo e posição
4. Pode validar resultado quando disponível

---

## 5. Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React Server Components
- **Backend:** Supabase (PostgreSQL, Auth, Storage, API REST)
- **Deploy:** Vercel (frontend), Supabase Cloud (backend)

---

## 6. Critérios de Aceite (Resumo)

- Landing page carrega corretamente e é responsiva
- Todas as categorias exibem informações corretas
- Navegação entre páginas funciona
- Login no admin funciona e redireciona conforme role
- Rotas protegidas bloqueiam usuários não autenticados
- Formulários exibem validação adequada
- Contador regressivo exibe data correta
- Links e menus funcionam em todas as páginas

---

## 7. Segurança

- Row Level Security (RLS) em todas as tabelas
- Autenticação via JWT (Supabase Auth)
- Middleware protegendo rotas /admin
- Políticas de acesso por role
- Chaves de serviço nunca expostas no frontend
