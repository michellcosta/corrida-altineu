# 🚀 Setup do Backend - Passo a Passo

Guia completo para inicializar o backend NestJS com PostgreSQL.

---

## ✅ O Que Foi Criado

### Estrutura Completa
```
backend/
├── src/
│   ├── main.ts                    ← Bootstrap
│   ├── app.module.ts              ← Módulo principal
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── dto/login.dto.ts
│   │   ├── strategies/
│   │   │   ├── local.strategy.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   └── guards/
│   │       ├── local-auth.guard.ts
│   │       ├── jwt-auth.guard.ts
│   │       └── jwt-refresh.guard.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── dto/user.dto.ts
│   ├── events/
│   │   ├── events.module.ts
│   │   ├── events.service.ts
│   │   ├── events.controller.ts
│   │   └── dto/event.dto.ts
│   ├── audit/
│   │   ├── audit.module.ts
│   │   └── audit.service.ts
│   └── common/
│       ├── decorators/permissions.decorator.ts
│       └── guards/permissions.guard.ts
├── prisma/
│   ├── schema.prisma              ← Schema completo
│   └── seed.ts                    ← Seeds iniciais
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

---

## 📦 Passo 1: Instalar Dependências

```bash
cd backend
npm install
```

Isso instalará:
- @nestjs/core, @nestjs/common
- @nestjs/jwt, @nestjs/passport
- @prisma/client
- bcrypt, passport-jwt
- class-validator, class-transformer
- E todas as devDependencies

---

## 🗄️ Passo 2: Configurar Banco de Dados

### 2.1 Subir PostgreSQL via Docker

```bash
# Na raiz do projeto (não em /backend)
docker-compose up -d postgres

# Verificar se subiu
docker ps
```

**Aguarde 10-15 segundos** para o banco inicializar completamente.

### 2.2 Configurar .env

```bash
cd backend
cp .env.example .env
```

Edite o `.env` e ajuste se necessário:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/corrida_macuco?schema=public"
JWT_SECRET="seu-secret-muito-seguro-aqui-min-32-chars"
JWT_REFRESH_SECRET="seu-refresh-secret-min-32-chars"
```

### 2.3 Executar Migrations

```bash
npx prisma migrate dev --name init

# Saída esperada:
# ✔ Generated Prisma Client
# ✔ Migrations ran successfully
```

### 2.4 Executar Seeds

```bash
npm run prisma:seed

# Saída esperada:
# 🌱 Seeding database...
# Creating roles...
# ✅ Roles created
# Creating admin users...
# ✅ Admin users created
# Creating event 2026...
# ✅ Event 2026 created
# Creating categories...
# ✅ Categories created
# 🎉 Database seeding completed!
```

**Credenciais criadas:**
- Site Admin:  `admin@corridamacuco.com.br` / `admin123`
- Chip Admin:  `chip@corridamacuco.com.br` / `admin123`
- Org Admin:   `org@corridamacuco.com.br` / `admin123`

---

## 🚀 Passo 3: Executar Backend

```bash
# Ainda em /backend
npm run start:dev

# Saída esperada:
# ✅ Database connected
# 🚀 Backend running on http://localhost:4000
# 📚 API documentation: http://localhost:4000/api
```

---

## ✅ Passo 4: Testar Endpoints

### 4.1 Teste Login

```bash
# PowerShell
curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@corridamacuco.com.br\",\"password\":\"admin123\"}'

# Resposta esperada:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Admin do Site",
    "email": "admin@corridamacuco.com.br",
    "role": "SITE_ADMIN"
  }
}
```

### 4.2 Teste /me

```bash
# Use o access_token recebido
curl http://localhost:4000/api/auth/me `
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"

# Resposta: dados do usuário
```

### 4.3 Teste Event Settings

```bash
curl http://localhost:4000/api/admin/site/settings/event `
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"

# Resposta: configurações do evento 2026
```

---

## 🔗 Passo 5: Conectar Frontend

### 5.1 Configurar Frontend

Edite `.env.local` na raiz do projeto (frontend):

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 5.2 Atualizar lib/admin/auth.ts

Substitua os mocks por chamadas reais:

```typescript
// lib/admin/auth.ts

import { AdminApiClient } from './api'

export async function login(email: string, password: string) {
  const data = await AdminApiClient.login(email, password)
  return data.user
}

export async function logout() {
  await AdminApiClient.logout()
}

export async function checkSession() {
  try {
    const user = await AdminApiClient.getMe()
    return user
  } catch {
    return null
  }
}
```

### 5.3 Testar Login Real

1. Abra `http://localhost:3000/admin/login`
2. Use: `admin@corridamacuco.com.br` / `admin123`
3. Deve autenticar via backend real!
4. Token armazenado
5. Dashboard carrega

---

## 🎯 Endpoints Implementados

### Autenticação
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

### Usuários (SITE_ADMIN)
```
GET    /api/admin/users
GET    /api/admin/users/roles
POST   /api/admin/users
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Eventos (SITE_ADMIN)
```
GET    /api/events/current
GET    /api/admin/site/settings/event
PUT    /api/admin/site/settings/event
```

### Audit Logs (SITE_ADMIN)
```
GET    /api/admin/site/logs
```

---

## 🛠️ Comandos Úteis

```bash
# Development
npm run start:dev          # Servidor com hot-reload

# Database
npx prisma studio          # UI visual do banco (http://localhost:5555)
npx prisma migrate dev     # Criar nova migration
npx prisma migrate deploy  # Deploy em produção
npx prisma db seed         # Executar seeds
npx prisma generate        # Gerar Prisma Client

# Docker
docker-compose up -d       # Subir serviços
docker-compose down        # Parar serviços
docker-compose logs postgres  # Ver logs do Postgres

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage
```

---

## 🔍 Troubleshooting

### Problema: Erro ao conectar no banco

```bash
# Verificar se Postgres está rodando
docker ps

# Ver logs
docker-compose logs postgres

# Reiniciar container
docker-compose restart postgres
```

### Problema: Migrations falham

```bash
# Reset do banco (⚠️ PERDERÁ DADOS)
npx prisma migrate reset

# Ou criar manualmente
npx prisma db push
```

### Problema: Seeds falham

```bash
# Verificar se migrations rodaram
npx prisma migrate status

# Executar migrations primeiro
npx prisma migrate dev

# Depois seeds
npm run prisma:seed
```

---

## ✅ Checklist de Validação

Após setup completo, verifique:

- [ ] PostgreSQL rodando (docker ps)
- [ ] Backend iniciado sem erros
- [ ] `npx prisma studio` abre UI do banco
- [ ] Tabelas criadas (AdminUser, Role, Event, Category)
- [ ] Seeds executados (3 usuários, 1 evento, 4 categorias)
- [ ] Login funciona via curl
- [ ] Frontend conecta (ao trocar mocks)

---

## 🎉 Próximos Passos

Após backend funcionando:

1. **Conectar frontend** (substituir mocks)
2. **Implementar Registrations Module**
3. **Implementar Documents Module** (upload S3)
4. **Implementar Payments Module**
5. **Deploy staging**

Consulte `IMPLEMENTATION_GUIDE.md` para ordem detalhada.

---

## 📞 Suporte

**Dúvidas?**
- Ver logs: `docker-compose logs -f`
- Prisma Studio: `npx prisma studio`
- Documentação: `BACKEND.md`

---

**Backend estruturado e pronto para rodar! 🚀**

**Próximo**: Executar os comandos acima e testar!








