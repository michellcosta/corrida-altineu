# Guia de Deploy - 51ª Corrida de Macuco

Este documento contém instruções detalhadas para fazer o deploy da aplicação em diferentes plataformas.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy na Vercel](#deploy-na-vercel)
- [Deploy na Netlify](#deploy-na-netlify)
- [Deploy no AWS Amplify](#deploy-no-aws-amplify)
- [Deploy no Render](#deploy-no-render)
- [Deploy com Docker](#deploy-com-docker)
- [Configurações Pós-Deploy](#configurações-pós-deploy)

## Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- ✅ Conta na plataforma de hospedagem escolhida
- ✅ Repositório Git configurado (GitHub, GitLab ou Bitbucket)
- ✅ Variáveis de ambiente configuradas
- ✅ Build local funcionando sem erros
- ✅ Domínio personalizado (opcional)

## Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Auth
JWT_SECRET="seu-secret-aqui"
JWT_REFRESH_SECRET="seu-refresh-secret-aqui"

# Email
SENDGRID_API_KEY="sua-key-aqui"
EMAIL_FROM="contato@corridamacuco.com.br"

# SMS/WhatsApp
TWILIO_ACCOUNT_SID="seu-sid-aqui"
TWILIO_AUTH_TOKEN="seu-token-aqui"
TWILIO_PHONE_NUMBER="+5522999999999"

# Storage
AWS_ACCESS_KEY_ID="sua-key-aqui"
AWS_SECRET_ACCESS_KEY="seu-secret-aqui"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="corrida-macuco"

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# App
NEXT_PUBLIC_APP_URL="https://corridamacuco.com.br"
NEXT_PUBLIC_API_URL="https://api.corridamacuco.com.br"
```

## Deploy na Vercel

### Método 1: CLI (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy para produção
vercel --prod
```

### Método 2: GitHub Integration

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente
5. Clique em "Deploy"

### Configuração Vercel

Crie um arquivo `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["gru1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url"
    }
  }
}
```

## Deploy na Netlify

### Via CLI

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Iniciar deploy
netlify init

# 4. Build e deploy
netlify deploy --prod
```

### Via Interface Web

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Add new site" > "Import an existing project"
3. Conecte ao seu repositório
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Adicione variáveis de ambiente
6. Clique em "Deploy site"

### Configuração Netlify

Crie um arquivo `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Deploy no AWS Amplify

### Via Console AWS

1. Acesse [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Clique em "New app" > "Host web app"
3. Conecte seu repositório Git
4. Configure:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
5. Adicione variáveis de ambiente
6. Clique em "Save and deploy"

## Deploy no Render

### Via Interface Web

1. Acesse [render.com](https://render.com)
2. Clique em "New +" > "Web Service"
3. Conecte seu repositório
4. Configure:
   - Name: `corrida-macuco`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Adicione variáveis de ambiente
6. Clique em "Create Web Service"

### render.yaml

```yaml
services:
  - type: web
    name: corrida-macuco
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: DATABASE_URL
        sync: false
```

## Deploy com Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: corrida_macuco
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Build e Run

```bash
# Build
docker build -t corrida-macuco .

# Run
docker run -p 3000:3000 corrida-macuco

# Com Docker Compose
docker-compose up -d
```

## Configurações Pós-Deploy

### 1. Configurar Domínio Personalizado

**Vercel:**
```bash
vercel domains add corridamacuco.com.br
```

**Netlify:**
1. Acesse "Domain settings"
2. Clique em "Add custom domain"
3. Siga as instruções de configuração DNS

### 2. Configurar SSL/HTTPS

Todas as plataformas mencionadas fornecem SSL/HTTPS automaticamente.

### 3. Configurar DNS

Aponte seu domínio para a plataforma de hospedagem:

**Vercel:**
```
CNAME @ cname.vercel-dns.com
```

**Netlify:**
```
A @ 75.2.60.5
CNAME www seu-site.netlify.app
```

### 4. Monitoramento

Instale serviços de monitoramento:

```bash
# New Relic
npm install newrelic

# Sentry
npm install @sentry/nextjs
```

### 5. Analytics

Configure Google Analytics no `.env`:

```bash
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## 🔒 Segurança

### Checklist de Segurança

- [ ] Variáveis de ambiente configuradas corretamente
- [ ] SSL/HTTPS ativado
- [ ] Headers de segurança configurados
- [ ] Rate limiting implementado
- [ ] CORS configurado adequadamente
- [ ] Autenticação JWT implementada
- [ ] Validação de entrada no backend
- [ ] Sanitização de dados
- [ ] Backup automático configurado

### next.config.js - Headers de Segurança

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

## 📊 Performance

### Otimizações

```bash
# Analisar bundle
npm run build
npm run analyze

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

## 🔄 CI/CD

### GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID}}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}}
          vercel-args: '--prod'
```

## 🆘 Troubleshooting

### Problema: Build falha

```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Problema: Variáveis de ambiente não funcionam

Certifique-se de:
1. Usar `NEXT_PUBLIC_` para variáveis do cliente
2. Reiniciar o servidor após mudanças
3. Verificar se estão configuradas na plataforma

### Problema: Imagens não carregam

Configure `next.config.js`:

```javascript
module.exports = {
  images: {
    domains: ['seu-dominio.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}
```

## 📞 Suporte

- **Documentação Next.js**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **Netlify Docs**: https://docs.netlify.com

---

**Desenvolvido para a 51ª Corrida Rústica de Macuco**








