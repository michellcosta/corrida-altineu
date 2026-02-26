# Backend - Corrida de Macuco API

> API REST para gerenciamento da Corrida Rústica de Macuco

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recomendado)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/corrida-altineu.git
cd corrida-altineu/backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrações
npx prisma migrate dev

# Seed do banco (roles e admin inicial)
npx prisma db seed

# Execute o servidor
npm run start:dev
```

### Com Docker

```bash
# Na raiz do projeto
docker-compose up -d

# O backend estará disponível em http://localhost:4000
```

---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── auth/                 # Autenticação (JWT, 2FA)
│   ├── users/                # Gerenciamento de usuários admin
│   ├── roles/                # RBAC (roles e permissões)
│   ├── events/               # Configurações de eventos
│   ├── categories/           # Categorias da corrida
│   ├── athletes/             # Dados dos atletas
│   ├── registrations/        # Inscrições
│   ├── documents/            # Upload e validação de docs
│   ├── payments/             # Integração com gateway
│   ├── results/              # Resultados e certificados
│   ├── content/              # CMS (páginas, posts, mídia)
│   ├── notifications/        # Email, SMS, WhatsApp
│   ├── reports/              # Exportações e relatórios
│   ├── common/               # Decorators, guards, pipes
│   └── main.ts               # Bootstrap da aplicação
│
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   ├── migrations/           # Migrações
│   └── seed.ts               # Seeds iniciais
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

---

## 🔐 Autenticação

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@corridamacuco.com.br",
  "password": "senha123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@corridamacuco.com.br",
    "role": "SITE_ADMIN"
  }
}
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2FA Setup

```http
POST /api/auth/2fa/setup
Authorization: Bearer {token}

Response:
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..."
}
```

---

## 📊 Principais Endpoints

### Inscrições (Public)

```http
# Iniciar inscrição
POST /api/registrations/start
{
  "categorySlug": "geral",
  "eventYear": 2026
}

# Completar inscrição
POST /api/registrations/:id/complete
{
  "athlete": { ... },
  "documents": [ ... ]
}

# Buscar inscrição
GET /api/registrations/:id/status
```

### Administração (Chip Admin)

```http
# Listar inscritos
GET /api/admin/chip/registrations?category=geral&status=confirmed

# Atribuir número de peito
PATCH /api/admin/chip/registrations/:id/bib-number
{
  "bibNumber": 1001
}

# Exportar para sistema de chip
POST /api/admin/chip/exports
{
  "format": "csv",
  "categories": ["geral", "morador"]
}

# Check-in de kit
POST /api/admin/chip/check-in
{
  "qrCode": "xxx-xxx-xxx"
}

# Upload de resultados
POST /api/admin/chip/results/upload
FormData: file (CSV)
```

### Insights (Org Admin - Read Only)

```http
# Dashboard de insights
GET /api/admin/org/insights?eventYear=2026

# Relatórios
GET /api/admin/org/reports

# Baixar relatório
GET /api/admin/org/reports/:id/download
```

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Prisma
npx prisma studio              # Interface visual do banco
npx prisma migrate dev         # Criar migração
npx prisma migrate deploy      # Deploy em produção
npx prisma db seed             # Executar seeds
npx prisma generate            # Gerar Prisma Client

# Docker
docker-compose up -d           # Subir serviços
docker-compose down            # Parar serviços
docker-compose logs -f api     # Ver logs
```

---

## 📈 Monitoramento

### Health Check

```http
GET /health

Response:
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime": 3600
}
```

### Métricas

- Prometheus endpoint: `/metrics`
- Grafana dashboard: `http://localhost:3001`
- Sentry: Integrado para error tracking

---

## 🔒 Segurança

### Implementado

- ✅ JWT com refresh tokens
- ✅ RBAC com middleware
- ✅ Rate limiting
- ✅ Helmet (security headers)
- ✅ CORS configurado
- ✅ Input validation (class-validator)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Audit logging
- ✅ Password hashing (bcrypt)
- ✅ 2FA (TOTP)

---

## 📞 Suporte

- **Documentação Completa**: Ver `BACKEND.md`
- **Schema do Banco**: Ver `prisma/schema.prisma`
- **API Docs**: http://localhost:4000/api/docs (Swagger)

---

**Desenvolvido para a 51ª Corrida Rústica de Macuco - 2026**








