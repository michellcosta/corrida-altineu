# Arquitetura Completa - Sistema Corrida de Macuco

## 📊 Visão Geral

Sistema completo para gerenciamento da 51ª Corrida Rústica de Macuco com:
- Landing page institucional
- Sistema de inscrições online
- Painel administrativo com 3 níveis de acesso
- API REST backend
- Integração com pagamentos e notificações

---

## 🎯 4 Categorias da Corrida

### 1. Geral 10K - R$ 22,00
- **Distância**: 10 km
- **Idade**: Quem completa 15 anos até 31/12/2026
- **Validação**: `ano_nascimento <= 2011`
- **Documentos**: RG ou CPF ou Passaporte
- **Campos**: Equipe, WhatsApp, Sexo, Data Nascimento

### 2. Morador de Macuco 10K - GRATUITO
- **Distância**: 10 km  
- **Idade**: Mesma do Geral (15 anos até 31/12/2026)
- **Documentos**: Documento + Comprovante de Residência
- **Validação**: Upload obrigatório de comprovante

### 3. 60+ 10K - GRATUITO
- **Distância**: 10 km
- **Idade**: 60 anos ou mais até 31/12/2026
- **Validação**: `ano_nascimento <= 1966`
- **Documentos**: Documento com foto obrigatório

### 4. Infantil 2K - GRATUITO
- **Distância**: 2 km
- **Idade**: Até 14 anos completos em 2026
- **BLOQUEIO**: Quem faz 15 anos em 2026 (`ano_nascimento = 2011`)
- **Documentos**: Autorização responsável + RG responsável

---

## 🏛️ Arquitetura de 3 Camadas

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (Next.js 14)              │
├─────────────────────────────────────────────────┤
│  - Landing Page (SSG)                           │
│  - Área do Atleta (SSR)                         │
│  - Painel Admin (3 níveis)                      │
│  - Sistema de Inscrição (Wizard)                │
└─────────────────────────────────────────────────┘
                      ↕ REST API
┌─────────────────────────────────────────────────┐
│              BACKEND (NestJS)                   │
├─────────────────────────────────────────────────┤
│  Módulos:                                       │
│  - Auth (JWT + 2FA)                             │
│  - RBAC (Roles & Permissions)                   │
│  - Registrations (Validação idade)              │
│  - Documents (Upload S3)                        │
│  - Payments (Gateway)                           │
│  - Results (Cronometragem)                      │
│  - CMS (Content)                                │
│  - Notifications (Email/SMS/WhatsApp)           │
│  - Reports (Exportações)                        │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│            INFRAESTRUTURA                       │
├─────────────────────────────────────────────────┤
│  - PostgreSQL (Dados)                           │
│  - Redis (Cache + Filas)                        │
│  - AWS S3 (Arquivos)                            │
│  - SendGrid (Email)                             │
│  - Twilio (SMS/WhatsApp)                        │
│  - Mercado Pago (Pagamento)                     │
└─────────────────────────────────────────────────┘
```

---

## 👥 Painel Administrativo - 3 Níveis

### 🟣 SITE_ADMIN - Controle Total

**Permissões**: `*` (tudo)

**Funcionalidades**:
```
✅ CMS Visual (Editor drag & drop)
✅ Configurações do Evento
   - Editar ano da prova (2026)
   - Configurar vagas (500/200/100/300)
   - Definir valores (R$ 22 Geral)
   - Gerenciar lotes
✅ Templates de Comunicação
✅ Regulamentos (Upload PDF versionado)
✅ Gerenciar Usuários & Roles
✅ Analytics Completo
✅ Audit Logs
```

**Rotas**: `/admin/site/*`

---

### 🔵 CHIP_ADMIN - Cronometragem

**Permissões**: Leitura + Escrita limitada

**Funcionalidades**:
```
✅ Visualizar Inscritos
   - Filtros por categoria/status/cidade
   - Tabela configurável
✅ Exportações
   - CSV para sistema de chip
   - Excel com múltiplas abas
   - PDF lista de largada
   - Fila de processamento
✅ Numeração
   - Algoritmo de blocos
   - Campo bib_number editável
   - Drag & drop reordenação
✅ Check-in de Kits
   - Scan QR code
   - Registro kit_picked_at
   - Log de faltantes
✅ Gestão de Resultados
   - Upload CSV
   - Validação de dados
   - Publicação (published=true)
   - Histórico com rollback
✅ Alertas
   - Sem chip atribuído
   - Pagamentos pendentes
```

**Rotas**: `/admin/chip/*`

---

### 🟢 ORG_ADMIN - Somente Leitura

**Permissões**: Apenas GET

**Funcionalidades**:
```
📊 Dashboard com Métricas
   - Inscrições por categoria
   - Timeline por dia/hora
   - Distribuição idade/gênero
   - Mapa geográfico (heatmap)
   - Status pagamentos
   - Status documentos
📄 Relatórios Prontos
   - Resumo executivo (PDF)
   - Distribuição demográfica
   - Status documentação
📧 Histórico de Mensagens
   - Campanhas enviadas
   - Métricas de abertura/clique
```

**Rotas**: `/admin/org/*`  
**Restrição**: Nenhuma ação de edição/reenvio

---

## 📋 Fluxo de Inscrição Completo

### 1. Escolha de Categoria

```typescript
// Validação no frontend
if (categorySlug === 'infantil') {
  const birthYear = new Date(birthDate).getFullYear()
  const ageInYear = RACE_YEAR - birthYear
  
  if (ageInYear === 15) {
    alert('Você completa 15 anos em 2026. Inscreva-se no Geral 10K.')
    suggestCategory('geral')
    return false
  }
}

// POST /api/registrations/start
{
  "categorySlug": "geral",
  "eventYear": 2026
}

Response:
{
  "registrationId": "uuid",
  "category": { ... },
  "price": 22.00,
  "isFree": false
}
```

### 2. Dados Pessoais

```typescript
// Formulário com validação
{
  fullName: string,
  birthDate: Date,           // Validado no backend
  gender: 'M' | 'F',
  document: string,          // RG, CPF ou Passaporte
  documentType: 'RG' | 'CPF' | 'PASSAPORTE',
  email: string,
  whatsapp: string,          // Formato (XX) 9XXXX-XXXX
  team?: string,
  shirtSize: 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG',
  
  // Se Morador
  address?: string,
  city?: 'Macuco',
  state?: 'RJ',
  zipCode?: string,
  
  // Se Infantil
  guardianName?: string,
  guardianCPF?: string,
  guardianRG?: string,
  guardianPhone?: string,
}
```

### 3. Upload de Documentos

```typescript
// Documentos por categoria

// Geral 10K: Nenhum upload necessário

// Morador 10K:
- comprovante_residencia.pdf (obrigatório)
- documento_foto.jpg (obrigatório)

// 60+ 10K:
- documento_foto.jpg (obrigatório)
- atestado_medico.pdf (opcional)

// Infantil 2K:
- autorizacao_responsavel.pdf (obrigatório)
- rg_responsavel.jpg (obrigatório)

// POST /api/documents/upload
FormData: {
  file: File,
  type: 'residencia' | 'documento_foto' | 'autorizacao',
  registrationId: string
}
```

### 4. Pagamento (apenas Geral)

```typescript
// Somente categoria Geral tem pagamento
if (category === 'geral') {
  // POST /api/payments/create
  {
    registrationId: string,
    method: 'pix' | 'credit_card' | 'boleto'
  }
  
  Response:
  {
    paymentId: string,
    pixQrCode?: string,
    boletoUrl?: string,
    checkoutUrl?: string
  }
}

// Demais categorias: Status → "free"
```

### 5. Confirmação

```typescript
// Após validação de docs e pagamento
{
  status: 'confirmed',
  qrCode: 'QR_CODE_BASE64',
  registrationNumber: 1247,
  kitInfo: {
    pickupDate: '2026-06-20',
    location: 'Ginásio Municipal',
    requirements: ['RG', 'QR Code']
  }
}

// Email automático enviado via fila
```

---

## 🔄 Validação de Idade - Regras Detalhadas

### Função Backend

```typescript
function validateAge(birthDate: Date, categorySlug: string, eventYear: number) {
  const birthYear = birthDate.getFullYear()
  const ageAtYearEnd = eventYear - birthYear
  
  switch (categorySlug) {
    case 'geral':
    case 'morador':
      // Deve completar 15 anos até 31/12/eventYear
      if (ageAtYearEnd < 15) {
        throw new BadRequestException({
          message: `Você precisa completar 15 anos até 31/12/${eventYear}`,
          suggestedCategory: 'infantil',
          code: 'AGE_TOO_YOUNG'
        })
      }
      break
      
    case 'sessenta':
      // Deve ter 60+ até 31/12/eventYear
      if (ageAtYearEnd < 60) {
        throw new BadRequestException({
          message: `Você precisa ter 60 anos ou mais até 31/12/${eventYear}`,
          suggestedCategory: 'geral',
          code: 'AGE_TOO_YOUNG_FOR_SENIOR'
        })
      }
      break
      
    case 'infantil':
      // BLOQUEAR quem faz 15 no ano
      if (ageAtYearEnd === 15) {
        throw new BadRequestException({
          message: `Você completa 15 anos em ${eventYear}. Inscreva-se na Geral 10K.`,
          suggestedCategory: 'geral',
          code: 'TURNS_15_THIS_YEAR'
        })
      }
      
      // Acima de 14 (faz 15+ no ano)
      if (ageAtYearEnd > 14) {
        throw new BadRequestException({
          message: 'Idade acima do permitido para Infantil.',
          suggestedCategory: 'geral',
          code: 'AGE_TOO_OLD'
        })
      }
      
      // Menor que 5
      if (ageAtYearEnd < 5) {
        throw new BadRequestException({
          message: 'Idade mínima é 5 anos.',
          code: 'AGE_TOO_YOUNG'
        })
      }
      break
  }
  
  return { valid: true }
}
```

### Exemplos de Casos

| Nascimento | Idade em 2026 | Geral | Morador | 60+ | Infantil |
|------------|---------------|-------|---------|-----|----------|
| 2011-01-01 | 15 | ✅ | ✅ | ❌ | ❌ BLOQUEADO |
| 2012-06-15 | 14 | ❌ | ❌ | ❌ | ✅ |
| 2005-12-31 | 21 | ✅ | ✅ | ❌ | ❌ |
| 1966-12-31 | 60 | ✅ | ✅ | ✅ | ❌ |
| 1950-06-01 | 76 | ✅ | ✅ | ✅ | ❌ |

---

## 📱 Páginas Implementadas

### Frontend Institucional
✅ **Home** - Landing page completa  
✅ **Prova 10K** - Detalhes Geral e categorias  
✅ **Prova Kids** - Infantil 2K  
✅ **Percursos** - Mapas e altimetria  
✅ **Premiações** - Tabelas por categoria  
✅ **Programação** - Cronograma completo  
✅ **Guia do Atleta** - FAQ e informações  
✅ **Resultados** - Busca e filtros  
✅ **Contato** - Formulário  
✅ **Inscrição** - Wizard 4 etapas  

### Painel Admin
✅ **Login** - Autenticação com 3 roles  
✅ **Site Admin Dashboard** - Visão geral  
✅ **Chip Admin Dashboard** - Cronometragem  
✅ **Org Admin Dashboard** - Relatórios  
✅ **Configurações de Evento** - Ano editável  

---

## 🔐 Sistema RBAC

### Tabela de Permissões

| Recurso | SITE_ADMIN | CHIP_ADMIN | ORG_ADMIN |
|---------|------------|------------|-----------|
| Content (CMS) | ✅ Full | ❌ | ❌ |
| Event Settings | ✅ Full | ❌ | ❌ |
| Users & Roles | ✅ Full | ❌ | ❌ |
| Registrations | ✅ Full | 📖 Read + Edit bibNumber | 📖 Read Only |
| Documents | ✅ Full | 📖 Read | ❌ |
| Payments | ✅ Full | 📖 Read | 📖 Read Only |
| Results | ✅ Full | ✅ Full | ❌ |
| Exports | ✅ Full | ✅ Full | 📖 Download Only |
| Insights | ✅ Full | ✅ Full | 📖 Read Only |
| Notifications | ✅ Full | 📖 Read | 📖 Read Only |

---

## 🗄️ Modelo de Dados

### Entidades Principais

```
Event (Evento 2026)
├── year: 2026
├── edition: 51
├── raceDate: 2026-06-24
├── ageCutoffDate: 2026-12-31
└── Categories (4)
    ├── Geral 10K (R$ 22, 500 vagas)
    ├── Morador 10K (Grátis, 200 vagas)
    ├── 60+ 10K (Grátis, 100 vagas)
    └── Infantil 2K (Grátis, 300 vagas)

Athlete
├── Personal Data (nome, CPF, RG, passaporte, nascimento, sexo)
├── Contact (email, whatsapp)
├── Racing (equipe, tamanho camiseta)
└── Address (para Morador)

Registration
├── eventId
├── categoryId
├── athleteId
├── bibNumber (editável por Chip Admin)
├── status (pending, validating, confirmed, cancelled)
├── paymentStatus (pending, paid, free)
├── kitPickedAt (check-in)
├── qrCode
└── Documents[] (uploads)

Document
├── type (residencia, documento_foto, autorizacao, medico)
├── fileUrl (S3)
├── status (pending, approved, rejected)
└── reviewNotes

Result
├── registrationId
├── grossTime, netTime
├── positions (overall, gender, category, ageGroup)
└── certificateUrl (gerado automaticamente)
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Inscrição Geral 10K (Paga)
```
1. Atleta escolhe "Geral 10K"
2. Preenche dados pessoais
3. Valida idade (>= 15 em 2026) ✅
4. Seleciona método de pagamento
5. Paga R$ 22 via PIX/Cartão/Boleto
6. Recebe QR Code por email
7. Status: confirmed
```

### Fluxo 2: Inscrição Morador (Gratuita)
```
1. Atleta escolhe "Morador 10K"
2. Preenche dados + endereço em Macuco
3. Valida idade (>= 15 em 2026) ✅
4. Upload comprovante residência
5. Upload documento com foto
6. Status: validating
7. Admin analisa documentos
8. Se aprovado → confirmed + QR Code
9. Se rejeitado → notification com motivo
```

### Fluxo 3: Inscrição 60+ (Gratuita)
```
1. Atleta escolhe "60+ 10K"
2. Preenche dados pessoais
3. Valida idade (>= 60 em 2026) ✅
4. Upload documento com foto
5. Status: validating
6. Admin aprova
7. Status: confirmed + QR Code
```

### Fluxo 4: Inscrição Infantil (Gratuita com Bloqueio)
```
1. Responsável escolhe "Infantil 2K"
2. Preenche dados da criança
3. Valida idade:
   - Se faz 15 em 2026 → BLOQUEADO ❌
   - Se <= 14 em 2026 → Continua ✅
4. Preenche dados do responsável
5. Upload autorização assinada
6. Upload RG responsável
7. Status: validating
8. Admin aprova
9. Status: confirmed + QR Code
```

---

## 📊 Métricas & Insights

### Dashboard ORG_ADMIN

**Inscrições por Categoria**:
```
Geral 10K:    487 (39%) [R$ 9.740]
Morador 10K:  178 (14%) [Grátis]
60+ 10K:       92 (7%)  [Grátis]
Infantil 2K:  490 (40%) [Grátis]
───────────────────────────────
Total:       1.247 inscritos
Arrecadação: R$ 9.740
```

**Distribuição por Sexo**:
```
Masculino: 653 (52.4%)
Feminino:  594 (47.6%)
```

**Top 5 Cidades**:
```
1. Macuco       - 412 (33%)
2. Cantagalo    - 187 (15%)
3. Rio          - 156 (12.5%)
4. Cordeiro     -  98 (7.9%)
5. Outras       - 394 (31.6%)
```

**Status de Documentos** (Morador + 60+ + Infantil):
```
Aprovados:   198 (76%)
Em Análise:   45 (17%)
Pendentes:    17 (7%)
```

---

## 🚀 Deploy & CI/CD

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  # Frontend (Vercel)
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20

  # Backend (Render)
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - uses: johnbeynon/render-deploy-action@v0.0.8
```

---

## 📞 Próximos Passos

### Curto Prazo (1-2 semanas)
- [ ] Implementar backend com NestJS
- [ ] Configurar PostgreSQL + Prisma
- [ ] Criar seeds de desenvolvimento
- [ ] Integrar frontend com API
- [ ] Sistema de autenticação real (JWT)

### Médio Prazo (3-4 semanas)
- [ ] Upload de documentos para S3
- [ ] Integração com Mercado Pago
- [ ] Sistema de notificações (SendGrid)
- [ ] Geração de certificados (PDF)
- [ ] Painel de validação de documentos

### Longo Prazo (1-2 meses)
- [ ] Resultados em tempo real
- [ ] App mobile (React Native)
- [ ] Gamificação e rankings
- [ ] Marketplace de parceiros
- [ ] Sistema de equipes

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025  
**Desenvolvido para**: 51ª Corrida Rústica de Macuco - 2026








