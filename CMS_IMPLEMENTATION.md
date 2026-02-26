# 🎨 Implementação do CMS Completo - Guia Definitivo

## 📋 O Que Falta Hoje (Gap Analysis)

### ❌ Problemas Atuais

1. **Conteúdo Hardcoded**: Todas as páginas públicas têm textos fixos no código
2. **Dashboard Estático**: `app/admin/site/page.tsx` não traz dados reais
3. **Rotas Sem Implementação**: Links do menu levam a páginas vazias ou 404
4. **Save Sem Persistência**: Configurações não salvam no backend
5. **Sem CMS**: Impossível editar textos/imagens/botões sem mexer no código

### ✅ O Que Foi Criado

- ✅ `lib/cms/schemas.ts` - Schemas completos de todas as seções
- ✅ `lib/cms/sample-data.ts` - Dados da home convertidos para JSON
- ✅ `backend/prisma/schema.prisma` - Schema completo do CMS
- ✅ `lib/admin/api.ts` - Cliente HTTP pronto
- ✅ `hooks/useAdmin.ts` - Hooks reutilizáveis
- ✅ Páginas de navegação admin (placeholders)

---

## 🏗️ Arquitetura do CMS

```
┌──────────────────────────────────────────────┐
│  FRONTEND PÚBLICO (Next.js)                  │
│  - Renderiza dinamicamente                   │
│  - Lê dados da API                           │
│  - Cache/Revalidation                        │
└──────────────────────────────────────────────┘
              ↕ GET /api/site/pages/:slug
┌──────────────────────────────────────────────┐
│  BACKEND CMS (NestJS)                        │
│  - CRUD de páginas/seções                    │
│  - Versionamento (draft/published)           │
│  - Upload de mídia (S3)                      │
│  - Preview temporário                        │
└──────────────────────────────────────────────┘
              ↕
┌──────────────────────────────────────────────┐
│  PAINEL ADMIN (/admin/site)                  │
│  - Page Builder visual                       │
│  - Editor de seções                          │
│  - Biblioteca de mídia                       │
│  - Publish/Draft                             │
└──────────────────────────────────────────────┘
```

---

## 📝 Fase 1: Modelagem de Conteúdo ✅

### 1.1 Schemas Criados

**Arquivo**: `lib/cms/schemas.ts`

**10 tipos de seção:**
1. Hero - Cabeçalho principal
2. Countdown - Contagem regressiva
3. Cards - Grid de cards (categorias, features)
4. Timeline - Linha do tempo
5. Testimonials - Depoimentos
6. News - Últimas notícias
7. Sponsors - Patrocinadores
8. CTA - Call to action
9. FAQ - Perguntas frequentes
10. Stats - Estatísticas

**Exemplo de uso:**
```typescript
import { HeroSectionSchema } from '@/lib/cms/schemas'

const heroData = {
  type: 'hero',
  headline: '51ª Corrida',
  ctaPrimary: { label: 'Inscrever', href: '/inscricao' },
  stats: [...]
}

// Valida
const validated = HeroSectionSchema.parse(heroData)
```

### 1.2 Dados de Exemplo

**Arquivo**: `lib/cms/sample-data.ts`

Home atual convertida para JSON data-driven:
- ✅ Hero completo
- ✅ Countdown
- ✅ Cards das 4 categorias
- ✅ Timeline com milestones
- ✅ CTA final

---

## 🗄️ Fase 2: Backend CMS (NestJS)

### 2.1 Schema Prisma ✅

**Arquivo**: `backend/prisma/schema.prisma`

**Modelos criados:**
```prisma
Page          - Páginas do site
Section       - Armazenado como JSON em Page.sections
Post          - Posts do blog
Media         - Biblioteca de mídia
GlobalBlock   - Header, Footer, CTAs globais
Navigation    - Menus
SiteConfig    - Configurações globais
SeoSetting    - Meta tags por página
Redirect      - Redirecionamentos 301/302
```

### 2.2 Implementar Backend

**Passo a passo:**

```bash
# 1. Criar projeto NestJS
cd backend
npx @nestjs/cli new .

# 2. Instalar dependências
npm install @prisma/client prisma
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install @aws-sdk/client-s3 multer
npm install zod

# 3. Configurar Prisma
npx prisma init
# Copiar schema.prisma já criado
npx prisma migrate dev --name init
npx prisma generate

# 4. Criar módulos
nest g module content
nest g service content
nest g controller content

nest g module media
nest g service media
nest g controller media

# 5. Executar
npm run start:dev
```

### 2.3 Content Controller

```typescript
// backend/src/content/content.controller.ts

@Controller('api/site')
export class ContentController {
  constructor(private contentService: ContentService) {}

  // Public endpoint (frontend consome)
  @Get('pages/:slug')
  async getPageBySlug(@Param('slug') slug: string) {
    const page = await this.contentService.findPublishedBySlug(slug)
    return {
      ...page,
      sections: JSON.parse(page.sections),
    }
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission({ resource: 'content', action: 'read' })
  @Get('admin/pages')
  async getAllPages() {
    return this.contentService.findAll()
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission({ resource: 'content', action: 'write' })
  @Post('admin/pages')
  async createPage(@Body() dto: CreatePageDto, @User() user) {
    return this.contentService.create(dto, user.id)
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission({ resource: 'content', action: 'write' })
  @Patch('admin/pages/:id')
  async updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.contentService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission({ resource: 'content', action: 'write' })
  @Post('admin/pages/:id/publish')
  async publishPage(@Param('id') id: string) {
    return this.contentService.publish(id)
  }
}
```

### 2.4 Content Service

```typescript
// backend/src/content/content.service.ts

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findPublishedBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug, status: 'published' },
    })

    if (!page) {
      throw new NotFoundException('Página não encontrada')
    }

    return page
  }

  async update(id: string, dto: UpdatePageDto) {
    // Salva em draftSections
    const page = await this.prisma.page.update({
      where: { id },
      data: {
        title: dto.title,
        metaDescription: dto.metaDescription,
        draftSections: dto.sections,
        updatedAt: new Date(),
      },
    })

    // Log de auditoria
    await this.auditService.log({
      action: 'UPDATE',
      resource: 'pages',
      resourceId: id,
      payload: { title: dto.title },
    })

    return page
  }

  async publish(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } })

    if (!page.draftSections) {
      throw new BadRequestException('Nenhuma alteração para publicar')
    }

    // Move draft para published
    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        sections: page.draftSections,
        draftSections: null,
        status: 'published',
        publishedAt: new Date(),
      },
    })

    // Invalida cache do Next.js
    await this.revalidateTag(`page-${page.slug}`)

    // Audit log
    await this.auditService.log({
      action: 'PUBLISH',
      resource: 'pages',
      resourceId: id,
    })

    return updated
  }

  private async revalidateTag(tag: string) {
    // Chama endpoint do Next.js para revalidate
    const frontendUrl = process.env.FRONTEND_URL
    await fetch(`${frontendUrl}/api/revalidate?tag=${tag}`, {
      headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET },
    })
  }
}
```

---

## 🎨 Fase 3: Frontend Dinâmico

### 3.1 Componente Data-Driven

**Antes (Hardcoded):**
```typescript
// components/sections/HeroSection.tsx
export default function HeroSection() {
  return <h1>51ª Corrida Rústica de Macuco</h1>
}
```

**Depois (Data-Driven):**
```typescript
// components/sections/HeroSection.tsx
import { HeroSection as HeroData } from '@/lib/cms/schemas'

interface Props {
  data: HeroData
}

export default function HeroSection({ data }: Props) {
  return (
    <section>
      <h1>{data.headline}</h1>
      <p>{data.description}</p>
      {data.ctaPrimary && (
        <Link href={data.ctaPrimary.href}>
          {data.ctaPrimary.label}
        </Link>
      )}
      {data.stats?.map((stat, i) => (
        <div key={i}>
          <p>{stat.value}</p>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  )
}
```

### 3.2 Section Renderer

```typescript
// components/cms/SectionRenderer.tsx

import HeroSection from '@/components/sections/HeroSection'
import CountdownSection from '@/components/sections/CountdownSection'
import CardsSection from '@/components/sections/CardsSection'
// ... imports

interface Props {
  section: Section
}

export default function SectionRenderer({ section }: Props) {
  switch (section.type) {
    case 'hero':
      return <HeroSection data={section} />
    case 'countdown':
      return <CountdownSection data={section} />
    case 'cards':
      return <CardsSection data={section} />
    case 'timeline':
      return <TimelineSection data={section} />
    case 'testimonials':
      return <TestimonialsSection data={section} />
    case 'news':
      return <NewsSection data={section} />
    case 'sponsors':
      return <SponsorsSection data={section} />
    case 'cta':
      return <CTASection data={section} />
    case 'faq':
      return <FAQSection data={section} />
    case 'stats':
      return <StatsSection data={section} />
    default:
      return null
  }
}
```

### 3.3 Página Dinâmica

```typescript
// app/page.tsx (versão data-driven)

import { SectionRenderer } from '@/components/cms/SectionRenderer'

async function getPageData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/pages/`, {
    next: { revalidate: 60, tags: ['page-home'] }
  })
  return res.json()
}

export default async function HomePage() {
  const page = await getPageData()

  return (
    <>
      {page.sections.map((section: any, index: number) => (
        <SectionRenderer key={index} section={section} />
      ))}
    </>
  )
}
```

---

## 🖼️ Fase 4: Page Builder Admin

### 4.1 Editor de Página

```typescript
// app/admin/site/content/pages/[id]/page.tsx

'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import SectionEditor from '@/components/admin/SectionEditor'
import SectionPicker from '@/components/admin/SectionPicker'

export default function PageEditorPage({ params }: { params: { id: string } }) {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<number | null>(null)

  const handleAddSection = (type: string) => {
    // Cria nova seção com valores padrão
    const newSection = createDefaultSection(type)
    setSections([...sections, newSection])
  }

  const handleUpdateSection = (index: number, data: any) => {
    const updated = [...sections]
    updated[index] = data
    setSections(updated)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)

    setSections(items)
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-12 gap-6 h-screen">
        {/* Left: Section List */}
        <div className="col-span-3 overflow-y-auto">
          <h2 className="font-bold mb-4">Seções</h2>
          <SectionPicker onAdd={handleAddSection} />
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sections.map((section, index) => (
                    <Draggable key={index} draggableId={`section-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 mb-2 border rounded cursor-move ${
                            selectedSection === index ? 'border-blue-500' : ''
                          }`}
                          onClick={() => setSelectedSection(index)}
                        >
                          <p className="font-semibold">{section.type}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Middle: Editor */}
        <div className="col-span-5 overflow-y-auto">
          {selectedSection !== null && (
            <SectionEditor
              section={sections[selectedSection]}
              onChange={(data) => handleUpdateSection(selectedSection, data)}
            />
          )}
        </div>

        {/* Right: Preview */}
        <div className="col-span-4 overflow-y-auto bg-gray-50">
          <h2 className="font-bold mb-4 p-4">Preview</h2>
          <div className="scale-75 origin-top">
            {sections.map((section, index) => (
              <SectionRenderer key={index} section={section} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
```

### 4.2 Section Editor

```typescript
// components/admin/SectionEditor.tsx

export default function SectionEditor({ section, onChange }: Props) {
  // Renderiza formulário baseado no tipo
  switch (section.type) {
    case 'hero':
      return <HeroEditor data={section} onChange={onChange} />
    case 'cards':
      return <CardsEditor data={section} onChange={onChange} />
    // ... etc
  }
}

// Hero Editor Example
function HeroEditor({ data, onChange }: EditorProps<HeroSection>) {
  return (
    <div className="space-y-4">
      <div>
        <label>Headline</label>
        <input
          value={data.headline}
          onChange={(e) => onChange({ ...data, headline: e.target.value })}
          className="admin-input"
        />
      </div>

      <div>
        <label>Subheadline</label>
        <input
          value={data.subheadline || ''}
          onChange={(e) => onChange({ ...data, subheadline: e.target.value })}
          className="admin-input"
        />
      </div>

      <div>
        <label>Descrição</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="admin-input"
          rows={3}
        />
      </div>

      <div>
        <label>CTA Primário</label>
        <input
          placeholder="Label do botão"
          value={data.ctaPrimary?.label || ''}
          onChange={(e) => onChange({
            ...data,
            ctaPrimary: { ...data.ctaPrimary, label: e.target.value }
          })}
        />
        <input
          placeholder="Link"
          value={data.ctaPrimary?.href || ''}
          onChange={(e) => onChange({
            ...data,
            ctaPrimary: { ...data.ctaPrimary, href: e.target.value }
          })}
        />
      </div>

      {/* Estatísticas (array) */}
      <div>
        <label>Estatísticas</label>
        {data.stats?.map((stat, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="Valor"
              value={stat.value}
              onChange={(e) => {
                const newStats = [...(data.stats || [])]
                newStats[i] = { ...stat, value: e.target.value }
                onChange({ ...data, stats: newStats })
              }}
            />
            <input
              placeholder="Label"
              value={stat.label}
              onChange={(e) => {
                const newStats = [...(data.stats || [])]
                newStats[i] = { ...stat, label: e.target.value }
                onChange({ ...data, stats: newStats })
              }}
            />
            <button onClick={() => {
              const newStats = data.stats?.filter((_, idx) => idx !== i)
              onChange({ ...data, stats: newStats })
            }}>
              Remover
            </button>
          </div>
        ))}
        <button onClick={() => {
          const newStats = [...(data.stats || []), { value: '', label: '' }]
          onChange({ ...data, stats: newStats })
        }}>
          + Adicionar Estatística
        </button>
      </div>
    </div>
  )
}
```

### 4.3 Section Picker

```typescript
// components/admin/SectionPicker.tsx

import { SECTION_TYPES } from '@/lib/cms/schemas'

export default function SectionPicker({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <div className="space-y-2 mb-6">
      <h3 className="font-semibold mb-2">Adicionar Seção</h3>
      {SECTION_TYPES.map((sectionType) => (
        <button
          key={sectionType.type}
          onClick={() => onAdd(sectionType.type)}
          className="w-full p-3 border rounded hover:border-blue-500 text-left"
        >
          <p className="font-semibold">{sectionType.name}</p>
          <p className="text-xs text-gray-600">{sectionType.description}</p>
        </button>
      ))}
    </div>
  )
}
```

---

## 📤 Fase 5: Upload de Mídia

### 5.1 Backend (S3)

```typescript
// backend/src/media/media.service.ts

@Injectable()
export class MediaService {
  private s3: S3Client

  constructor(private prisma: PrismaService) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async upload(file: Express.Multer.File, uploadedBy: string) {
    // 1. Upload para S3
    const key = `media/${Date.now()}-${file.originalname}`
    
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }))

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    // 2. Salvar metadados no banco
    const media = await this.prisma.media.create({
      data: {
        fileName: file.originalname,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy,
      },
    })

    return media
  }

  async findAll(filters: any = {}) {
    return this.prisma.media.findMany({
      where: filters,
      orderBy: { uploadedAt: 'desc' },
    })
  }
}

// Controller
@Controller('api/admin/media')
export class MediaController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @User() user) {
    return this.mediaService.upload(file, user.id)
  }

  @Get()
  async getAll(@Query() filters) {
    return this.mediaService.findAll(filters)
  }
}
```

### 5.2 Frontend (Biblioteca de Mídia)

```typescript
// components/admin/MediaLibrary.tsx

'use client'

export default function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })

    const uploaded = await response.json()
    setFiles([uploaded, ...files])
    setUploading(false)
  }

  return (
    <div>
      <div className="mb-4">
        <label className="admin-button-primary cursor-pointer">
          Upload
          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelect?.(file.fileUrl)}
            className="aspect-square bg-cover bg-center rounded cursor-pointer hover:ring-2 ring-blue-500"
            style={{ backgroundImage: `url(${file.fileUrl})` }}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 🔄 Fase 6: Migração de Dados

### 6.1 Seed com Dados Atuais

```typescript
// backend/prisma/seeds/content.seed.ts

import { HOME_PAGE_DATA } from '../../../lib/cms/sample-data'

async function seedContent() {
  const prisma = new PrismaClient()

  // Criar página home
  await prisma.page.create({
    data: {
      slug: HOME_PAGE_DATA.slug,
      title: HOME_PAGE_DATA.title,
      metaDescription: HOME_PAGE_DATA.metaDescription,
      sections: HOME_PAGE_DATA.sections,
      status: 'published',
      publishedAt: new Date(),
      createdBy: 'system',
    },
  })

  // Criar outras páginas...
  console.log('✅ Content seeded!')
}
```

### 6.2 Executar Migration

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

---

## ⚡ Fase 7: Performance & Cache

### 7.1 Next.js Revalidation

```typescript
// app/api/revalidate/route.ts

import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag')
  
  if (tag) {
    revalidateTag(tag)
  }

  return Response.json({ revalidated: true })
}
```

### 7.2 Fallback Estático

```typescript
// app/page.tsx com fallback

async function getPageData() {
  try {
    const res = await fetch(`${API_URL}/api/site/pages/`, {
      next: { revalidate: 60 }
    })
    return res.json()
  } catch (error) {
    // Fallback para dados estáticos
    return HOME_PAGE_DATA
  }
}
```

---

## 🎯 Checklist de Implementação

### Backend
- [x] Schema Prisma criado
- [ ] Migrations executadas
- [ ] Seeds criados
- [ ] Content Module implementado
- [ ] Media Module implementado
- [ ] Endpoints testados

### Frontend Público
- [x] Schemas de seção criados
- [x] Dados de exemplo criados
- [ ] Componentes convertidos para data-driven
- [ ] Section Renderer implementado
- [ ] Páginas consumindo API
- [ ] Fallback estático

### Painel Admin
- [x] Páginas de navegação criadas
- [ ] Page Builder implementado
- [ ] Section Editors criados
- [ ] Media Library implementada
- [ ] Publish/Draft workflow
- [ ] Preview funcionando

---

## 📦 Dependências Necessárias

### Backend
```bash
npm install react-beautiful-dnd
npm install @aws-sdk/client-s3
npm install sharp  # Processamento de imagens
```

### Frontend
```bash
npm install react-beautiful-dnd
npm install @types/react-beautiful-dnd
npm install react-dropzone  # Upload
```

---

## 🚀 Próximos Passos Imediatos

### 1. Implementar Backend (1 semana)
```
Dia 1-2: Setup + Auth
Dia 3-4: Content Module
Dia 5-6: Media Module  
Dia 7: Testes
```

### 2. Converter Frontend (3-4 dias)
```
Dia 1: Section Renderer
Dia 2: Data-driven components
Dia 3: Home consumindo API
Dia 4: Demais páginas
```

### 3. Page Builder (1 semana)
```
Dia 1-2: Layout do editor
Dia 3-4: Section editors
Dia 5-6: Drag & drop
Dia 7: Preview + Publish
```

---

## 💡 Decisões de Design

### Versionamento
- **Draft**: Editável, não visível ao público
- **Published**: Visível ao público, bloqueado para edição
- **Editar Published**: Cria versão draft, publica substituindo

### Permissões
- **SITE_ADMIN**: Acesso total ao CMS
- **CHIP_ADMIN**: Sem acesso
- **ORG_ADMIN**: Sem acesso

### Performance
- Cache de 60s no fetch
- Revalidate on publish
- Fallback estático

---

**Tudo documentado e estruturado para começar! 🎉**

**Próximo passo**: Implementar backend seguindo este guia.








