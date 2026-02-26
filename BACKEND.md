# Backend Architecture - Corrida de Macuco

Documentação completa da arquitetura backend para o sistema da Corrida Rústica de Macuco.

## 📋 Stack Tecnológica

### Core
- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Cache/Queue**: Redis 7+
- **Storage**: AWS S3 ou MinIO
- **Email**: SendGrid ou AWS SES
- **SMS/WhatsApp**: Twilio ou 360dialog

### Infraestrutura
- **Container**: Docker + Docker Compose
- **Deploy**: Render, Fly.io ou Railway
- **Monitoring**: Sentry + Winston
- **CI/CD**: GitHub Actions

---

## 🗄️ Modelagem do Banco de Dados

### Schema Principal

```prisma
// prisma/schema.prisma

// ========================================
// ADMINISTRAÇÃO & SEGURANÇA
// ========================================

model AdminUser {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  passwordHash  String
  role          Role     @relation(fields: [roleId], references: [id])
  roleId        String
  mfaSecret     String?
  mfaEnabled    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLogin     DateTime?
  
  auditLogs     AuditLog[]
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique // SITE_ADMIN, CHIP_ADMIN, ORG_ADMIN
  description String?
  createdAt   DateTime @default(now())
  
  permissions RolePermission[]
  users       AdminUser[]
}

model RolePermission {
  id       String @id @default(uuid())
  roleId   String
  resource String // content, registrations, results, etc
  action   String // read, write, delete, *
  
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, resource, action])
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  user       AdminUser @relation(fields: [userId], references: [id])
  action     String   // CREATE, UPDATE, DELETE, EXPORT, etc
  resource   String   // content/pages, registrations, etc
  resourceId String?
  payload    Json?
  ipAddress  String?
  userAgent  String?
  timestamp  DateTime @default(now())
  
  @@index([userId, timestamp])
  @@index([resource, timestamp])
}

// ========================================
// EVENTO & CATEGORIAS
// ========================================

model Event {
  id                  String   @id @default(uuid())
  year                Int      @unique
  edition             Int
  raceDate            DateTime
  ageCutoffDate       DateTime // Último dia do ano
  location            String
  city                String
  state               String
  totalPrize          Decimal  @default(0)
  registrationsOpen   Boolean  @default(false)
  openDate            DateTime?
  closeDate           DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  categories          Category[]
  registrations       Registration[]
}

model Category {
  id          String  @id @default(uuid())
  eventId     String
  event       Event   @relation(fields: [eventId], references: [id])
  slug        String  // geral, morador, sessenta, infantil
  name        String
  distance    String
  price       Decimal @default(0)
  isFree      Boolean @default(false)
  minAge      Int
  maxAge      Int?
  totalSlots  Int
  ageRule     String
  requiresProof Boolean @default(false) // Morador
  requiresGuardian Boolean @default(false) // Infantil
  
  registrations Registration[]
  
  @@unique([eventId, slug])
}

// ========================================
// INSCRIÇÕES & ATLETAS
// ========================================

model Athlete {
  id              String   @id @default(uuid())
  fullName        String
  cpf             String?  @unique
  rg              String?
  passport        String?
  documentType    String   // RG, CPF, PASSAPORTE
  birthDate       DateTime
  gender          String   // M, F
  email           String   @unique
  whatsapp        String
  team            String?
  shirtSize       String
  address         String?
  city            String?
  state           String?
  zipCode         String?
  photoUrl        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  registrations   Registration[]
  guardian        Guardian?
  
  @@index([email])
  @@index([cpf])
}

model Guardian {
  id             String  @id @default(uuid())
  athleteId      String  @unique
  athlete        Athlete @relation(fields: [athleteId], references: [id])
  fullName       String
  cpf            String
  rg             String
  phone          String
  relationship   String  // pai, mãe, responsável legal
  
  documents      Document[]
}

model Registration {
  id                String   @id @default(uuid())
  eventId           String
  event             Event    @relation(fields: [eventId], references: [id])
  categoryId        String
  category          Category @relation(fields: [categoryId], references: [id])
  athleteId         String
  athlete           Athlete  @relation(fields: [athleteId], references: [id])
  bibNumber         Int?     @unique
  status            String   @default("pending") // pending, validating, confirmed, cancelled
  paymentStatus     String?  @default("pending") // pending, paid, free
  paymentId         String?
  amount            Decimal  @default(0)
  kitPickedAt       DateTime?
  qrCode            String?  @unique
  checkInCode       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  confirmedAt       DateTime?
  cancelledAt       DateTime?
  
  documents         Document[]
  result            Result?
  
  @@index([eventId, categoryId])
  @@index([status])
  @@index([qrCode])
}

// ========================================
// DOCUMENTOS
// ========================================

model Document {
  id              String   @id @default(uuid())
  registrationId  String?
  registration    Registration? @relation(fields: [registrationId], references: [id])
  guardianId      String?
  guardian        Guardian? @relation(fields: [guardianId], references: [id])
  type            String   // residencia, documento_foto, autorizacao, medico
  fileName        String
  fileUrl         String
  fileSize        Int
  mimeType        String
  status          String   @default("pending") // pending, approved, rejected
  reviewedBy      String?
  reviewedAt      DateTime?
  reviewNotes     String?
  uploadedAt      DateTime @default(now())
  
  @@index([registrationId, status])
  @@index([status])
}

// ========================================
// RESULTADOS
// ========================================

model Result {
  id              String   @id @default(uuid())
  registrationId  String   @unique
  registration    Registration @relation(fields: [registrationId], references: [id])
  grossTime       Int      // Em segundos
  netTime         Int      // Em segundos
  pace            String   // mm:ss
  overallPosition Int?
  genderPosition  Int?
  categoryPosition Int?
  ageGroupPosition Int?
  ageGroup        String?
  isFinisher      Boolean  @default(true)
  certificateUrl  String?
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([overallPosition])
  @@index([categoryPosition])
}

// ========================================
// COMUNICAÇÃO
// ========================================

model NotificationTemplate {
  id          String   @id @default(uuid())
  name        String   @unique
  type        String   // email, sms, whatsapp
  subject     String?
  body        String   // Template com variáveis
  variables   Json?    // Lista de variáveis disponíveis
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  notifications Notification[]
}

model Notification {
  id         String   @id @default(uuid())
  templateId String
  template   NotificationTemplate @relation(fields: [templateId], references: [id])
  recipientEmail String?
  recipientPhone String?
  category   String   // all, geral, morador, sessenta, infantil
  sentAt     DateTime?
  deliveredAt DateTime?
  openedAt   DateTime?
  clickedAt  DateTime?
  status     String   @default("queued") // queued, sent, delivered, failed
  errorMessage String?
  
  @@index([status])
  @@index([sentAt])
}

// ========================================
// CONTEÚDO (CMS)
// ========================================

model Page {
  id              String   @id @default(uuid())
  slug            String   @unique
  title           String
  metaDescription String?
  sections        Json     // Array de seções com componentes
  publishedVersion Int?
  draftVersion    Json?
  status          String   @default("draft") // draft, published, archived
  publishedAt     DateTime?
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([slug])
  @@index([status])
}

model Post {
  id              String   @id @default(uuid())
  slug            String   @unique
  title           String
  excerpt         String?
  content         String   // Markdown ou HTML
  coverImage      String?
  category        String   // treino, nutricao, turismo, releases
  tags            String[]
  status          String   @default("draft")
  publishedAt     DateTime?
  authorId        String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([slug])
  @@index([category])
  @@index([status])
}

model Media {
  id          String   @id @default(uuid())
  fileName    String
  fileUrl     String
  fileSize    Int
  mimeType    String
  altText     String?
  tags        String[]
  uploadedBy  String
  uploadedAt  DateTime @default(now())
  
  @@index([mimeType])
}
```

---

## 🏗️ Módulos NestJS

### 1. Auth Module
```typescript
@Module({
  imports: [JwtModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}

// Controllers
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### 2. Users Module (RBAC)
```typescript
@Module({
  controllers: [UsersController, RolesController],
  providers: [UsersService, RolesService],
  exports: [UsersService],
})
export class UsersModule {}

// Controllers
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id

GET    /api/admin/roles
POST   /api/admin/roles
PATCH  /api/admin/roles/:id
```

### 3. Events Module
```typescript
@Module({
  controllers: [EventsController, CategoriesController],
  providers: [EventsService, CategoriesService],
})
export class EventsModule {}

// Controllers
GET    /api/events
GET    /api/events/:year
POST   /api/admin/events
PATCH  /api/admin/events/:id
GET    /api/events/:eventId/categories
```

### 4. Registrations Module
```typescript
@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, AgeValidationService],
})
export class RegistrationsModule {}

// Public
POST   /api/registrations/start
POST   /api/registrations/:id/complete
GET    /api/registrations/:id/status

// Admin (Chip)
GET    /api/admin/chip/registrations
PATCH  /api/admin/chip/registrations/:id/bib-number
POST   /api/admin/chip/registrations/export
POST   /api/admin/chip/registrations/:id/check-in

// Admin (Org - Read Only)
GET    /api/admin/org/registrations/stats
```

### 5. Documents Module
```typescript
@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, S3Service],
})
export class DocumentsModule {}

// Athletes
POST   /api/documents/upload
GET    /api/documents/:id

// Admin
GET    /api/admin/documents
PATCH  /api/admin/documents/:id/review
```

### 6. Payments Module
```typescript
@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
})
export class PaymentsModule {}

// Public
POST   /api/payments/create
POST   /api/payments/webhook

// Admin
GET    /api/admin/payments
GET    /api/admin/payments/:id
```

### 7. Results Module
```typescript
@Module({
  controllers: [ResultsController],
  providers: [ResultsService, CertificateService],
})
export class ResultsModule {}

// Public
GET    /api/results
GET    /api/results/search?name=&bib=
GET    /api/results/:id/certificate

// Admin (Chip)
POST   /api/admin/chip/results/upload
PATCH  /api/admin/chip/results/publish
GET    /api/admin/chip/results/history
```

### 8. Notifications Module
```typescript
@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    SMSService,
    WhatsAppService,
  ],
})
export class NotificationsModule {}

// Admin (Site)
GET    /api/admin/site/notifications/templates
POST   /api/admin/site/notifications/templates
POST   /api/admin/site/notifications/send

// Admin (Org - Read Only)
GET    /api/admin/org/notifications/history
GET    /api/admin/org/notifications/stats
```

### 9. Content Module (CMS)
```typescript
@Module({
  controllers: [PagesController, PostsController, MediaController],
  providers: [ContentService, MediaService],
})
export class ContentModule {}

// Public
GET    /api/content/pages/:slug
GET    /api/content/posts
GET    /api/content/posts/:slug

// Admin (Site)
GET    /api/admin/site/content/pages
POST   /api/admin/site/content/pages
PATCH  /api/admin/site/content/pages/:id
DELETE /api/admin/site/content/pages/:id
POST   /api/admin/site/content/media
```

### 10. Reports Module
```typescript
@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ExportService],
})
export class ReportsModule {}

// Admin (Chip)
POST   /api/admin/chip/reports/generate
GET    /api/admin/chip/reports/:id/download

// Admin (Org - Read Only)
GET    /api/admin/org/reports
GET    /api/admin/org/reports/:id/download
GET    /api/admin/org/insights
```

---

## 🔐 Sistema RBAC Detalhado

### Seeds Iniciais

```typescript
// prisma/seeds/roles.seed.ts

const roles = [
  {
    name: 'SITE_ADMIN',
    description: 'Administrador total do sistema',
    permissions: [
      { resource: '*', action: '*' },
    ],
  },
  {
    name: 'CHIP_ADMIN',
    description: 'Administrador de cronometragem',
    permissions: [
      { resource: 'registrations', action: 'read' },
      { resource: 'registrations', action: 'write' },
      { resource: 'results', action: '*' },
      { resource: 'exports', action: '*' },
      { resource: 'check-in', action: '*' },
      { resource: 'numbering', action: '*' },
      { resource: 'documents', action: 'read' },
    ],
  },
  {
    name: 'ORG_ADMIN',
    description: 'Administrador organizacional (read-only)',
    permissions: [
      { resource: 'insights', action: 'read' },
      { resource: 'reports', action: 'read' },
      { resource: 'notifications', action: 'read' },
      { resource: 'registrations', action: 'read' },
    ],
  },
]
```

### Middleware de Permissões

```typescript
// src/common/guards/permissions.guard.ts

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<{resource: string, action: string}>(
      'permission',
      context.getHandler()
    )

    if (!requiredPermission) {
      return true // Rota não protegida
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    return this.hasPermission(
      user.rolePermissions,
      requiredPermission.resource,
      requiredPermission.action
    )
  }

  private hasPermission(
    permissions: RolePermission[],
    resource: string,
    action: string
  ): boolean {
    return permissions.some(
      (p) =>
        (p.resource === resource || p.resource === '*') &&
        (p.action === action || p.action === '*')
    )
  }
}

// Uso em controllers
@Controller('admin/site/content')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ContentController {
  @Get()
  @RequirePermission({ resource: 'content', action: 'read' })
  async findAll() {}

  @Post()
  @RequirePermission({ resource: 'content', action: 'write' })
  async create() {}
}
```

---

## 🔄 Validação de Idade - Backend

### Service de Validação

```typescript
// src/registrations/services/age-validation.service.ts

@Injectable()
export class AgeValidationService {
  validateAge(
    birthDate: Date,
    categorySlug: string,
    eventYear: number
  ): ValidationResult {
    const birthYear = birthDate.getFullYear()
    const ageAtYearEnd = eventYear - birthYear

    switch (categorySlug) {
      case 'geral':
      case 'morador':
        if (ageAtYearEnd < 15) {
          return {
            valid: false,
            message: `Você precisa completar 15 anos até 31/12/${eventYear}`,
            suggestedCategory: 'infantil',
          }
        }
        break

      case 'sessenta':
        if (ageAtYearEnd < 60) {
          return {
            valid: false,
            message: `Você precisa ter 60 anos ou mais até 31/12/${eventYear}`,
            suggestedCategory: 'geral',
          }
        }
        break

      case 'infantil':
        if (ageAtYearEnd === 15) {
          return {
            valid: false,
            message: `Você completa 15 anos em ${eventYear}. Por favor, inscreva-se na categoria Geral 10K.`,
            suggestedCategory: 'geral',
          }
        }
        if (ageAtYearEnd > 14) {
          return {
            valid: false,
            message: 'Idade acima do permitido para categoria Infantil.',
            suggestedCategory: 'geral',
          }
        }
        if (ageAtYearEnd < 5) {
          return {
            valid: false,
            message: 'Idade mínima para categoria Infantil é 5 anos.',
          }
        }
        break
    }

    return { valid: true }
  }
}
```

---

## 📤 Sistema de Exportação (Chip Admin)

### Export Service

```typescript
// src/exports/exports.service.ts

@Injectable()
export class ExportsService {
  constructor(
    private prisma: PrismaService,
    private queue: Queue,
    private s3: S3Service,
  ) {}

  async generateCSVForChip(filters: ExportFilters): Promise<string> {
    // Buscar dados
    const registrations = await this.prisma.registration.findMany({
      where: { ...filters },
      include: {
        athlete: true,
        category: true,
      },
    })

    // Gerar CSV
    const csvData = registrations.map(r => ({
      bib_number: r.bibNumber,
      name: r.athlete.fullName,
      gender: r.athlete.gender,
      birth_date: format(r.athlete.birthDate, 'yyyy-MM-dd'),
      category: r.category.slug,
      team: r.athlete.team || '',
      chip_code: r.checkInCode || '',
    }))

    const csv = Papa.unparse(csvData)

    // Upload para S3
    const fileName = `export-chip-${Date.now()}.csv`
    const url = await this.s3.upload(fileName, csv)

    // Registrar no audit log
    await this.logExport('registrations-csv', filters)

    return url
  }

  async generateExcelWithSheets(eventId: string): Promise<string> {
    // Cria arquivo Excel com múltiplas abas (categoria)
    const workbook = new ExcelJS.Workbook()

    const categories = ['geral', 'morador', 'sessenta', 'infantil']

    for (const cat of categories) {
      const sheet = workbook.addWorksheet(cat.toUpperCase())
      const data = await this.getDataByCategory(eventId, cat)
      
      sheet.addRows(data)
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const url = await this.s3.upload(`export-${Date.now()}.xlsx`, buffer)

    return url
  }
}
```

---

## 📊 Insights & Analytics (Org Admin)

### Insights Service

```typescript
// src/reports/services/insights.service.ts

@Injectable()
export class InsightsService {
  async getRegistrationInsights(eventId: string): Promise<InsightsDTO> {
    // Query com aggregations
    const byCategory = await this.prisma.registration.groupBy({
      by: ['categoryId'],
      where: { eventId },
      _count: { _all: true },
    })

    const byGender = await this.prisma.registration.groupBy({
      by: ['athlete', 'gender'],
      where: { eventId },
      _count: { _all: true },
    })

    const byCity = await this.prisma.athlete.groupBy({
      by: ['city'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: 10,
    })

    const byAgeGroup = await this.getAgeDistribution(eventId)

    const paymentStats = await this.getPaymentStats(eventId)

    const documentStats = await this.getDocumentStats(eventId)

    return {
      byCategory,
      byGender,
      byCity,
      byAgeGroup,
      paymentStats,
      documentStats,
      timeline: await this.getRegistrationTimeline(eventId),
    }
  }

  private async getAgeDistribution(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    })

    const registrations = await this.prisma.registration.findMany({
      where: { eventId },
      include: { athlete: true },
    })

    const distribution = {
      '15-19': { M: 0, F: 0 },
      '20-29': { M: 0, F: 0 },
      '30-39': { M: 0, F: 0 },
      '40-49': { M: 0, F: 0 },
      '50-59': { M: 0, F: 0 },
      '60+': { M: 0, F: 0 },
    }

    registrations.forEach(reg => {
      const ageAtYearEnd = event.year - reg.athlete.birthDate.getFullYear()
      const gender = reg.athlete.gender
      
      if (ageAtYearEnd >= 15 && ageAtYearEnd <= 19) distribution['15-19'][gender]++
      else if (ageAtYearEnd >= 20 && ageAtYearEnd <= 29) distribution['20-29'][gender]++
      else if (ageAtYearEnd >= 30 && ageAtYearEnd <= 39) distribution['30-39'][gender]++
      else if (ageAtYearEnd >= 40 && ageAtYearEnd <= 49) distribution['40-49'][gender]++
      else if (ageAtYearEnd >= 50 && ageAtYearEnd <= 59) distribution['50-59'][gender]++
      else if (ageAtYearEnd >= 60) distribution['60+'][gender]++
    })

    return distribution
  }
}
```

---

## 🚀 Deploy & Infraestrutura

### Docker Compose (Desenvolvimento)

```yaml
version: '3.8'

services:
  # Backend
  api:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/corrida_macuco
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./backend:/app
      - /app/node_modules

  # Frontend
  web:
    build: ./
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    volumes:
      - ./:/app
      - /app/node_modules
      - /app/.next

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: corrida_macuco
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Cache/Queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Storage (Dev)
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Variáveis de Ambiente (.env)

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/corrida_macuco"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS S3
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="corrida-macuco"

# Email
SENDGRID_API_KEY="SG.xxxxx"
EMAIL_FROM="contato@corridamacuco.com.br"

# SMS/WhatsApp
TWILIO_ACCOUNT_SID="ACxxxx"
TWILIO_AUTH_TOKEN="xxxxx"
TWILIO_PHONE_NUMBER="+5522999999999"

# Payment
MERCADOPAGO_PUBLIC_KEY="xxxxx"
MERCADOPAGO_ACCESS_TOKEN="xxxxx"

# App
APP_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

## 🔒 Segurança

### 1. Autenticação

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub)
    
    if (!user) {
      throw new UnauthorizedException()
    }

    // Carregar permissões
    const permissions = await this.usersService.getPermissions(user.roleId)

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions,
    }
  }
}
```

### 2. Rate Limiting

```typescript
// app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // 10 requests por minuto para admin
    }),
  ],
})

// Em rotas específicas
@Throttle(3, 60) // 3 requests por minuto
@Post('upload')
async uploadDocument() {}
```

### 3. Validação de Input

```typescript
// DTOs com class-validator

export class CreateRegistrationDto {
  @IsNotEmpty()
  @IsString()
  fullName: string

  @IsNotEmpty()
  @IsDateString()
  birthDate: string

  @IsIn(['M', 'F'])
  gender: string

  @IsEnum(['geral', 'morador', 'sessenta', 'infantil'])
  category: string

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/)
  cpf?: string

  @IsOptional()
  @IsString()
  rg?: string

  @IsOptional()
  @IsString()
  passport?: string

  @IsEnum(['RG', 'CPF', 'PASSAPORTE'])
  documentType: string

  @IsEmail()
  email: string

  @Matches(/^\(\d{2}\)\s9\d{4}-\d{4}$/)
  whatsapp: string

  @IsOptional()
  @IsString()
  team?: string
}
```

---

## 📨 Sistema de Notificações

### Queue de Emails

```typescript
// src/notifications/processors/email.processor.ts

@Processor('email')
export class EmailProcessor {
  constructor(
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  @Process('send')
  async handleSendEmail(job: Job) {
    const { notificationId, recipientEmail, templateId, variables } = job.data

    try {
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      })

      const compiledBody = this.compileTemplate(template.body, variables)

      await this.emailService.send({
        to: recipientEmail,
        subject: template.subject,
        html: compiledBody,
      })

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      })
    } catch (error) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      })

      throw error
    }
  }

  private compileTemplate(template: string, variables: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })
  }
}
```

### Templates de Email

```typescript
// Exemplos de templates

const templates = {
  confirmacao: {
    subject: 'Inscrição Confirmada - {{event_name}}',
    body: `
      <h1>Inscrição Confirmada!</h1>
      <p>Olá {{athlete_name}},</p>
      <p>Sua inscrição na categoria {{category_name}} foi confirmada com sucesso!</p>
      <p><strong>Número de Inscrição:</strong> {{registration_number}}</p>
      <p><strong>Data da Prova:</strong> {{race_date}}</p>
      <img src="{{qr_code}}" alt="QR Code" />
      <p>Próximos passos: [...]</p>
    `,
  },
  
  aprovacao_documento: {
    subject: 'Documento Aprovado - {{event_name}}',
    body: `...`,
  },
  
  rejeicao_documento: {
    subject: 'Documento Rejeitado - Ação Necessária',
    body: `...`,
  },
  
  lembrete_kit: {
    subject: 'Lembrete: Retirada de Kit - {{event_name}}',
    body: `...`,
  },
}
```

---

## 🧪 Testes

### Unit Tests

```typescript
// src/registrations/services/age-validation.service.spec.ts

describe('AgeValidationService', () => {
  let service: AgeValidationService

  beforeEach(() => {
    service = new AgeValidationService()
  })

  describe('Geral 10K', () => {
    it('deve aprovar quem completa 15 anos no ano da prova', () => {
      const birthDate = new Date('2011-12-31') // Completa 15 em 2026
      const result = service.validateAge(birthDate, 'geral', 2026)
      expect(result.valid).toBe(true)
    })

    it('deve rejeitar quem tem menos de 15 no ano', () => {
      const birthDate = new Date('2012-01-01') // Completa 14 em 2026
      const result = service.validateAge(birthDate, 'geral', 2026)
      expect(result.valid).toBe(false)
      expect(result.suggestedCategory).toBe('infantil')
    })
  })

  describe('Infantil 2K', () => {
    it('deve BLOQUEAR quem faz 15 anos no ano da prova', () => {
      const birthDate = new Date('2011-06-01') // Faz 15 em 2026
      const result = service.validateAge(birthDate, 'infantil', 2026)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('completa 15 anos')
      expect(result.suggestedCategory).toBe('geral')
    })

    it('deve aprovar até 14 anos', () => {
      const birthDate = new Date('2012-06-01') // 14 anos em 2026
      const result = service.validateAge(birthDate, 'infantil', 2026)
      expect(result.valid).toBe(true)
    })
  })

  describe('60+ 10K', () => {
    it('deve aprovar 60 anos ou mais no ano', () => {
      const birthDate = new Date('1966-12-31') // 60 em 2026
      const result = service.validateAge(birthDate, 'sessenta', 2026)
      expect(result.valid).toBe(true)
    })

    it('deve rejeitar menos de 60', () => {
      const birthDate = new Date('1967-01-01') // 59 em 2026
      const result = service.validateAge(birthDate, 'sessenta', 2026)
      expect(result.valid).toBe(false)
    })
  })
})
```

---

## 📞 API Endpoints Completos

### Resumo por Módulo

| Módulo | Endpoints | SITE_ADMIN | CHIP_ADMIN | ORG_ADMIN | Public |
|--------|-----------|------------|------------|-----------|--------|
| Auth | /api/auth/* | ✅ | ✅ | ✅ | ✅ |
| Events | /api/admin/events | ✅ | ❌ | ❌ | ❌ |
| Categories | /api/events/:id/categories | ✅ | ✅ | ✅ | ✅ |
| Registrations | /api/registrations | ✅ | ✅ (limited) | 📖 | ✅ (own) |
| Documents | /api/admin/documents | ✅ | 📖 | ❌ | ❌ |
| Payments | /api/admin/payments | ✅ | 📖 | 📖 | ❌ |
| Results | /api/admin/chip/results | ✅ | ✅ | ❌ | ❌ |
| Content | /api/admin/site/content | ✅ | ❌ | ❌ | ❌ |
| Reports | /api/admin/*/reports | ✅ | ✅ | 📖 | ❌ |
| Insights | /api/admin/org/insights | ✅ | ✅ | 📖 | ❌ |
| Notifications | /api/admin/*/notifications | ✅ | 📖 | 📖 | ❌ |

**Legenda:**
- ✅ Full Access (read + write)
- 📖 Read Only
- ❌ No Access

---

**Desenvolvido para a 51ª Corrida Rústica de Macuco - 2026**








