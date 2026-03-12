# 🛠️ Guia de Implementação - Próximos Passos

Guia detalhado para implementar as funcionalidades que estão como placeholder/mock.

---

## ✅ O Que Está Pronto (Frontend MVP)

- ✅ Toda a landing page e páginas institucionais
- ✅ Design system completo
- ✅ Layout admin com 3 níveis
- ✅ Páginas de navegação do admin
- ✅ Sistema de configurações (com persistência local)
- ✅ Hooks reutilizáveis
- ✅ Validação de idade completa
- ✅ Constantes das 4 categorias

---

## 🚧 O Que Precisa Ser Implementado

### Prioridade 1: Backend Essencial (2-3 semanas)

#### 1.1 Setup Inicial
```bash
# Criar estrutura backend
mkdir backend
cd backend
npm init -y
npm install @nestjs/cli

# Inicializar NestJS
npx nest new .
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install prisma @prisma/client
npm install bcrypt class-validator class-transformer
npm install redis ioredis
```

#### 1.2 Configurar Prisma
```bash
npx prisma init

# Copiar schema de BACKEND.md para prisma/schema.prisma
# Editar DATABASE_URL no .env

# Rodar migrações
npx prisma migrate dev --name init

# Gerar client
npx prisma generate
```

#### 1.3 Criar Seeds
```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. Criar Roles
  const siteAdminRole = await prisma.role.create({
    data: {
      name: 'SITE_ADMIN',
      description: 'Administrador total do sistema',
      permissions: {
        create: [
          { resource: '*', action: '*' },
        ],
      },
    },
  })

  const chipAdminRole = await prisma.role.create({
    data: {
      name: 'CHIP_ADMIN',
      description: 'Administrador de cronometragem',
      permissions: {
        create: [
          { resource: 'registrations', action: 'read' },
          { resource: 'registrations', action: 'write' },
          { resource: 'results', action: '*' },
          { resource: 'exports', action: '*' },
        ],
      },
    },
  })

  const orgAdminRole = await prisma.role.create({
    data: {
      name: 'ORG_ADMIN',
      description: 'Visualização apenas',
      permissions: {
        create: [
          { resource: 'insights', action: 'read' },
          { resource: 'reports', action: 'read' },
        ],
      },
    },
  })

  // 2. Criar Usuários Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.adminUser.create({
    data: {
      name: 'Admin do Site',
      email: 'admin@corridamacuco.com.br',
      passwordHash: hashedPassword,
      roleId: siteAdminRole.id,
      mfaEnabled: false,
    },
  })

  await prisma.adminUser.create({
    data: {
      name: 'João Cronometrista',
      email: 'chip@corridamacuco.com.br',
      passwordHash: hashedPassword,
      roleId: chipAdminRole.id,
    },
  })

  await prisma.adminUser.create({
    data: {
      name: 'Maria Organizadora',
      email: 'org@corridamacuco.com.br',
      passwordHash: hashedPassword,
      roleId: orgAdminRole.id,
    },
  })

  // 3. Criar Evento 2026
  const event = await prisma.event.create({
    data: {
      year: 2026,
      edition: 51,
      raceDate: new Date('2026-06-24T07:00:00'),
      ageCutoffDate: new Date('2026-12-31T23:59:59'),
      location: 'Praça da Matriz, Centro',
      city: 'Macuco',
      state: 'RJ',
      totalPrize: 15000,
      registrationsOpen: true,
      openDate: new Date('2025-12-01'),
      closeDate: new Date('2026-06-20'),
    },
  })

  // 4. Criar Categorias
  await prisma.category.createMany({
    data: [
      {
        eventId: event.id,
        slug: 'geral',
        name: 'Geral 10K',
        distance: '10km',
        price: 22,
        isFree: false,
        minAge: 15,
        totalSlots: 500,
        ageRule: 'Quem completa 15 anos até 31/12/2026',
      },
      {
        eventId: event.id,
        slug: 'morador',
        name: 'Morador de Macuco 10K',
        distance: '10km',
        price: 0,
        isFree: true,
        minAge: 15,
        totalSlots: 200,
        ageRule: 'Quem completa 15 anos até 31/12/2026',
        requiresProof: true,
      },
      {
        eventId: event.id,
        slug: 'sessenta',
        name: '60+ 10K',
        distance: '10km',
        price: 0,
        isFree: true,
        minAge: 60,
        totalSlots: 100,
        ageRule: '60 anos ou mais até 31/12/2026',
      },
      {
        eventId: event.id,
        slug: 'infantil',
        name: 'Infantil 2K',
        distance: '2km',
        price: 0,
        isFree: true,
        minAge: 5,
        maxAge: 14,
        totalSlots: 300,
        ageRule: 'Até 14 anos completos em 2026',
        requiresGuardian: true,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

#### 1.4 Módulos Prioritários

**Auth Module** (1 semana)
```bash
nest g module auth
nest g service auth
nest g controller auth

# Implementar:
- POST /api/admin/auth/login
- POST /api/admin/auth/refresh
- GET /api/admin/auth/me
- JWT Strategy
- Guards de permissão
```

**Events Module** (3 dias)
```bash
nest g module events
nest g service events
nest g controller events

# Implementar:
- GET /api/admin/site/settings/event
- PUT /api/admin/site/settings/event
- Validações de configuração
```

**Registrations Module** (1 semana)
```bash
nest g module registrations
nest g service registrations
nest g controller registrations

# Implementar:
- POST /api/registrations/start
- Validação de idade
- GET /api/admin/chip/registrations
```

---

### Prioridade 2: Integrações (1-2 semanas)

#### 2.1 Upload de Arquivos (S3)
```typescript
// Instalar
npm install @aws-sdk/client-s3 multer

// src/storage/s3.service.ts
@Injectable()
export class S3Service {
  private s3: S3Client

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `uploads/${Date.now()}-${file.originalname}`
    
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }))

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  }
}
```

#### 2.2 Pagamentos (Mercado Pago)
```typescript
npm install mercadopago

// src/payments/mercadopago.service.ts
@Injectable()
export class MercadoPagoService {
  private mp: MercadoPago

  constructor() {
    this.mp = new MercadoPago(process.env.MERCADOPAGO_ACCESS_TOKEN)
  }

  async createPayment(amount: number, email: string) {
    const preference = await this.mp.preferences.create({
      items: [{
        title: 'Inscrição Corrida de Macuco 2026',
        quantity: 1,
        unit_price: amount,
      }],
      payer: { email },
      notification_url: `${process.env.APP_URL}/api/payments/webhook`,
    })

    return preference.body
  }
}
```

#### 2.3 Email (SendGrid)
```typescript
npm install @sendgrid/mail

// src/notifications/email.service.ts
@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  }

  async send(to: string, templateId: string, variables: any) {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
      templateId,
      dynamicTemplateData: variables,
    })
  }
}
```

---

### Prioridade 3: Funcionalidades Avançadas (2-3 semanas)

#### 3.1 CMS Visual (Page Builder)
- Biblioteca de blocos (Hero, Cards, Timeline, etc)
- Drag & drop (react-beautiful-dnd)
- Preview em iframe
- Versionamento (draft/published)

#### 3.2 Exportações
- CSV para sistema de chip
- Excel com múltiplas abas
- PDF de lista de largada
- Fila de processamento (BullMQ)

#### 3.3 Validação de Documentos
- Tela de revisão com preview
- Aprovação/rejeição
- Notificação automática
- Audit log

---

## 🔧 Correções Necessárias

### 1. Encoding UTF-8

**Problema**: Arquivos em ANSI causam caracteres quebrados.

**Solução**:
```bash
# No VS Code
1. Abrir arquivo
2. Clicar em "ANSI" (canto inferior direito)
3. Selecionar "Save with Encoding" > "UTF-8"
4. Salvar

# Ou configurar globalmente:
.vscode/settings.json:
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}
```

### 2. Persistência de Dados

**Atual**: `localStorage` (temporário)
**Implementar**: Backend real com PostgreSQL

**Ordem de prioridade**:
1. Event settings (GET/PUT)
2. Dashboard stats (GET)
3. Registrations (CRUD)
4. Documents (upload)
5. Payments (webhook)

### 3. Navegação Completa

**Páginas criadas agora**:
- ✅ `/admin/site/content/pages`
- ✅ `/admin/site/content/posts`
- ✅ `/admin/site/content/media`
- ✅ `/admin/site/settings/batches`
- ✅ `/admin/site/settings/templates`
- ✅ `/admin/site/users`
- ✅ `/admin/site/analytics`
- ✅ `/admin/site/logs`
- ✅ `/admin/chip/registrations`

**Ainda faltam**:
- ⏳ `/admin/site/content/sections`
- ⏳ `/admin/site/settings/seo`
- ⏳ `/admin/site/regulations`
- ⏳ `/admin/chip/exports`
- ⏳ `/admin/chip/numbering`
- ⏳ `/admin/chip/checkin`
- ⏳ `/admin/chip/results`
- ⏳ `/admin/chip/alerts`
- ⏳ `/admin/org/reports`
- ⏳ `/admin/org/messages`

---

## 📝 Checklist de Implementação

### Backend (NestJS)

- [ ] **Setup Inicial**
  - [ ] Criar projeto NestJS
  - [ ] Configurar Prisma
  - [ ] Rodar migrações
  - [ ] Executar seeds

- [ ] **Auth Module**
  - [ ] JWT + Refresh tokens
  - [ ] Guards de permissão
  - [ ] 2FA (TOTP)
  - [ ] Password reset

- [ ] **Events Module**
  - [ ] CRUD de eventos
  - [ ] Configurações editáveis
  - [ ] Categorias dinâmicas
  - [ ] Validação de regras

- [ ] **Registrations Module**
  - [ ] Criar inscrição
  - [ ] Validar idade
  - [ ] Processar pagamento
  - [ ] Gerar QR Code
  - [ ] Enviar confirmação

- [ ] **Documents Module**
  - [ ] Upload para S3
  - [ ] Validação de arquivo
  - [ ] Workflow de aprovação
  - [ ] Notificações

- [ ] **Payments Module**
  - [ ] Integração Mercado Pago
  - [ ] Webhook de confirmação
  - [ ] Gestão de status

- [ ] **Results Module**
  - [ ] Upload CSV
  - [ ] Validação de dados
  - [ ] Cálculo de posições
  - [ ] Geração de certificados (PDF)

- [ ] **Notifications Module**
  - [ ] Templates de email
  - [ ] Fila de envio
  - [ ] SendGrid/SES
  - [ ] WhatsApp API

---

### Frontend (Integrações)

- [ ] **Substituir Mocks por API Real**
  - [ ] Login real (JWT em httpOnly cookie)
  - [ ] Dashboard com dados reais
  - [ ] Configurações persistidas
  - [ ] Inscrição funcional

- [ ] **Formulário de Inscrição**
  - [ ] Validação em tempo real
  - [ ] Upload de documentos
  - [ ] Integração com gateway
  - [ ] QR Code real

- [ ] **Área do Atleta**
  - [ ] Dashboard pessoal
  - [ ] Histórico de participações
  - [ ] Download de certificados
  - [ ] Atualização de dados

- [ ] **Painel Admin Completo**
  - [ ] CMS visual (page builder)
  - [ ] Gestão de mídia (S3)
  - [ ] Validação de documentos
  - [ ] Exportações reais
  - [ ] Analytics (GA4)

---

## 📦 Dependências Adicionais

### Backend
```json
{
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@prisma/client": "^5.0.0",
  "bcrypt": "^5.1.0",
  "class-validator": "^0.14.0",
  "ioredis": "^5.3.0",
  "mercadopago": "^1.5.0",
  "@sendgrid/mail": "^7.7.0",
  "twilio": "^4.19.0",
  "@aws-sdk/client-s3": "^3.450.0",
  "bull": "^4.11.0",
  "pdfkit": "^0.13.0",
  "papaparse": "^5.4.0",
  "exceljs": "^4.3.0"
}
```

### Frontend
```json
{
  "swr": "^2.2.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "react-dropzone": "^14.2.0",
  "recharts": "^2.10.0",
  "@tanstack/react-table": "^8.10.0"
}
```

---

## 🔄 Migração de Mock para Real

### Exemplo: Event Settings

**Antes (Mock)**:
```typescript
// app/admin/site/settings/event/page.tsx
const handleSave = () => {
  localStorage.setItem('config', JSON.stringify(config))
  alert('Salvo!')
}
```

**Depois (Real)**:
```typescript
import { AdminApiClient } from '@/lib/admin/api'

const handleSave = async () => {
  try {
    await AdminApiClient.updateEventSettings(config)
    toast.success('Salvo!')
  } catch (error) {
    toast.error('Erro ao salvar')
  }
}
```

---

## 🧪 Testes

### Backend
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Cobertura
npm run test:cov
```

### Frontend
```bash
# Instalar Playwright
npm install -D @playwright/test

# Executar testes
npx playwright test
```

---

## 🚀 Roadmap Sugerido

### Sprint 1 (Semana 1-2): Backend Base
- Auth + RBAC
- Events CRUD
- Registrations básico

### Sprint 2 (Semana 3-4): Integrações
- Upload S3
- Pagamento Mercado Pago
- Email SendGrid

### Sprint 3 (Semana 5-6): Admin Completo
- CMS visual
- Validação de docs
- Exportações

### Sprint 4 (Semana 7-8): Resultados & Deploy
- Upload de resultados
- Certificados PDF
- Deploy produção
- Testes finais

---

## 📞 Suporte

Para implementar qualquer uma dessas funcionalidades:

1. Consulte `BACKEND.md` para especificação completa
2. Use os exemplos de código fornecidos
3. Siga a ordem de prioridade
4. Teste incrementalmente

---

**Status Atual**: MVP Frontend 100% ✅  
**Próximo Passo**: Implementar Backend NestJS  
**ETA Backend**: 2-3 semanas (com equipe dedicada)








