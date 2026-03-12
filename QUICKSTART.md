# 🚀 Quick Start - Corrida de Macuco

Guia rápido para começar a trabalhar no projeto.

## ✅ Instalação Completa (5 minutos)

### 1. Clone e Instale

```bash
# Clone o repositório
cd "c:\Users\Michell Oliveira\Documents\GitHub\corrida-altineu"

# Dependências já instaladas
# Se precisar reinstalar:
npm install
```

### 2. Execute o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Acesse em:
# http://localhost:3000
```

### 3. Acesse o Painel Admin

```
URL: http://localhost:3000/admin/login

Credenciais de teste:
├─ Site Admin:  admin@corridamacuco.com.br / admin123
├─ Chip Admin:  chip@corridamacuco.com.br / admin123
└─ Org Admin:   org@corridamacuco.com.br / admin123
```

---

## 📋 O Que Foi Implementado

### ✅ Frontend (100% Completo)

#### Landing Page
- [x] Hero com vídeo e contagem regressiva
- [x] Cards das 4 categorias (Geral, Morador, 60+, Infantil)
- [x] Timeline de 51 anos de história
- [x] Depoimentos de atletas
- [x] Seção de notícias
- [x] Patrocinadores
- [x] CTAs estratégicos

#### Páginas Institucionais
- [x] Prova 10K (Geral, Morador, 60+)
- [x] Prova Kids (Infantil 2K)
- [x] Percursos (10K e 2K)
- [x] Premiações (por categoria)
- [x] Programação (sexta e sábado)
- [x] Guia do Atleta (FAQ completo)
- [x] Resultados (busca e filtros)
- [x] Contato (formulário)

#### Sistema de Inscrição
- [x] Wizard em 4 etapas
- [x] Validação de categoria
- [x] Formulário de dados
- [x] Simulação de pagamento
- [x] Confirmação com QR Code

#### Painel Administrativo
- [x] Sistema de login (3 roles)
- [x] Layout administrativo com sidebar
- [x] Dashboard Site Admin (controle total)
- [x] Dashboard Chip Admin (cronometragem)
- [x] Dashboard Org Admin (relatórios)
- [x] Configurações de Evento (ano editável)
- [x] Sistema RBAC (roles e permissões)

---

## 🎨 Design System

### Cores Principais
```css
Primary:  #0284c7 (Blue)
Accent:   #ef4444 (Red)
Success:  #10b981 (Green)
Warning:  #f59e0b (Yellow)
```

### Tipografia
```css
Font Sans:    Inter
Font Display: Montserrat
```

### Componentes Base
- `btn-primary` - Botão azul com hover
- `btn-secondary` - Botão outline
- `card` - Card com sombra
- `admin-card` - Card administrativo
- `section-title` - Título de seção

---

## 📂 Estrutura de Arquivos

```
corrida-altineu/
├── app/                       ← Páginas Next.js
│   ├── page.tsx              ← Home
│   ├── prova-10k/            ← Categoria Geral
│   ├── prova-kids/           ← Categoria Infantil
│   ├── percursos/
│   ├── premiacoes/
│   ├── programacao/
│   ├── guia-atleta/
│   ├── resultados/
│   ├── contato/
│   ├── inscricao/            ← Wizard de inscrição
│   └── admin/                ← Painel administrativo
│       ├── login/
│       ├── site/             ← Site Admin
│       ├── chip/             ← Chip Admin
│       └── org/              ← Org Admin
│
├── components/
│   ├── layout/               ← Header e Footer
│   ├── sections/             ← Seções da home
│   └── admin/                ← Componentes admin
│
├── lib/
│   ├── constants.ts          ← Config das 4 categorias
│   └── admin/
│       ├── types.ts          ← Tipos do RBAC
│       └── auth.ts           ← Auth mock
│
├── backend/                   ← Backend (estrutura documentada)
│   └── README.md
│
└── Documentação
    ├── README.md             ← Guia principal
    ├── CATEGORIES.md         ← Detalhes das 4 categorias
    ├── ARCHITECTURE.md       ← Arquitetura completa
    ├── BACKEND.md            ← Backend detalhado
    ├── DEPLOY.md             ← Guia de deploy
    ├── CONTRIBUTING.md       ← Como contribuir
    └── CHANGELOG.md          ← Histórico de mudanças
```

---

## 🎯 Categorias & Validação

### Regras de Idade (Ano 2026)

```typescript
// Data de corte: 31/12/2026

Geral 10K:
  ageAtYearEnd >= 15
  Nasceu em 2011 ou antes ✅

Morador 10K:
  Mesma regra do Geral
  + Comprovante de residência

60+ 10K:
  ageAtYearEnd >= 60
  Nasceu em 1966 ou antes ✅

Infantil 2K:
  ageAtYearEnd <= 14
  Nasceu em 2012 ou depois ✅
  BLOQUEIO: Nasceu em 2011 ❌
```

### Campos do Formulário (Todos)

```typescript
✅ Nome Completo
✅ Data de Nascimento (validação automática)
✅ Sexo (M/F)
✅ Documento: RG OU CPF OU Passaporte
✅ Tipo de Documento
✅ Email
✅ WhatsApp (formato brasileiro)
✅ Equipe (opcional)
✅ Tamanho Camiseta
```

---

## 🔧 Configurações Editáveis (Admin)

No painel `/admin/site/settings/event`:

```typescript
✏️ Ano da Prova: 2026
✏️ Edição: 51ª
✏️ Data da Prova: 24/06/2026
✏️ Vagas por Categoria:
   - Geral: 500
   - Morador: 200
   - 60+: 100
   - Infantil: 300
✏️ Valor Geral 10K: R$ 22,00
✏️ Status Inscrições: Abertas/Fechadas

🔄 Calculado Automaticamente:
   - Data de Corte: 31/12/2026
   - Regras de validação de idade
   - Total de vagas: 1.100
```

---

## 🌐 URLs Principais

### Público
- **Home**: http://localhost:3000
- **Inscrição**: http://localhost:3000/inscricao
- **Categorias**:
  - Geral 10K: http://localhost:3000/prova-10k
  - Infantil 2K: http://localhost:3000/prova-kids
- **Guia**: http://localhost:3000/guia-atleta

### Admin
- **Login**: http://localhost:3000/admin/login
- **Site Admin**: http://localhost:3000/admin/site
- **Chip Admin**: http://localhost:3000/admin/chip
- **Org Admin**: http://localhost:3000/admin/org
- **Config Evento**: http://localhost:3000/admin/site/settings/event

---

## 🐛 Troubleshooting

### Problema: Página não carrega

```bash
# Limpe o cache do Next.js
rm -rf .next
npm run dev
```

### Problema: Erro de compilação

```bash
# Reinstale as dependências
rm -rf node_modules
npm install
```

### Problema: Não consigo fazer login no admin

```
Use as credenciais de teste:
Email: admin@corridamacuco.com.br
Senha: admin123
```

---

## 📚 Documentação Completa

- **README.md** - Visão geral e instalação
- **CATEGORIES.md** - Detalhes das 4 categorias e validações
- **ARCHITECTURE.md** - Arquitetura do sistema completo
- **BACKEND.md** - Especificação do backend (NestJS)
- **DEPLOY.md** - Guias de deploy (Vercel, Netlify, etc)
- **CONTRIBUTING.md** - Como contribuir
- **CHANGELOG.md** - Histórico de versões

---

## ✨ Próximos Passos

### Para Desenvolvedores

1. Explorar o código em `app/` e `components/`
2. Testar todas as páginas navegando pelo site
3. Fazer login no admin e explorar os 3 painéis
4. Ler `CATEGORIES.md` para entender as regras
5. Consultar `BACKEND.md` para implementar a API

### Para Organização

1. Revisar conteúdo e textos das páginas
2. Fornecer imagens e vídeos reais
3. Confirmar valores, vagas e datas
4. Testar o fluxo de inscrição
5. Aprovar design e layout

---

## 🎉 Tudo Pronto!

O projeto está **100% funcional** para desenvolvimento e testes.

**Servidor rodando em**: http://localhost:3000

**Para parar**: `Ctrl + C` no terminal

---

**Dúvidas?** Consulte a documentação ou abra uma issue no GitHub.








