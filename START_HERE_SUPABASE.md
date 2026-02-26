# 🚀 Como Começar - Arquitetura Supabase

Este é o guia de início rápido para rodar o projeto localmente e fazer deploy.

---

## 🎯 Arquitetura Simplificada

```
┌─────────────────────────────────────────────────┐
│          VERCEL (Frontend - Next.js)            │
│  - Site público                                 │
│  - Painel administrativo                        │
│  - Inscrições                                   │
└────────────────────┬────────────────────────────┘
                     │
                     │ (Supabase JS Client)
                     ↓
┌─────────────────────────────────────────────────┐
│           SUPABASE (Backend Completo)           │
│  - PostgreSQL (banco de dados)                  │
│  - Auth (JWT, sessões, recuperação de senha)    │
│  - Storage (fotos, documentos)                  │
│  - API REST (gerada automaticamente)            │
│  - Realtime (opcional)                          │
└─────────────────────────────────────────────────┘
```

**Vantagens**:
- ✅ **Zero configuração de servidor**
- ✅ **100% gratuito** (até 500 MB de banco + 1 GB de storage)
- ✅ **Deploy em minutos**
- ✅ **Menos código para manter** (Supabase cuida de auth, API, backup)

---

## ⚡ Quick Start (5 minutos)

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/corrida-altineu.git
cd corrida-altineu
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

### 3️⃣ Configurar Supabase

**Opção A: Usar Supabase Cloud (Recomendado)**

1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto: **"corrida-macuco"**
3. Copie as credenciais (URL + anon key)
4. No dashboard, vá em **SQL Editor** e execute o arquivo `supabase/schema.sql`

**Opção B: Usar Supabase Local** (requer Docker)

```bash
npx supabase init
npx supabase start
```

Isso vai:
- ✅ Baixar e rodar PostgreSQL local
- ✅ Configurar Auth local
- ✅ Configurar Storage local
- ✅ Dar as credenciais locais

### 4️⃣ Configurar Variáveis de Ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### 5️⃣ Rodar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🎨 Estrutura do Projeto

```
corrida-altineu/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Páginas públicas
│   │   ├── page.tsx              # Home
│   │   ├── prova-10k/            # Página 10K
│   │   ├── prova-kids/           # Página Infantil
│   │   └── ...
│   ├── admin/                    # Painel administrativo
│   │   ├── login/                # Login
│   │   ├── site/                 # Dashboard Site Admin
│   │   ├── chip/                 # Dashboard Chip Admin
│   │   └── org/                  # Dashboard Org Admin
│   └── api/                      # API Routes (opcional)
│
├── components/                   # Componentes React
│   ├── sections/                 # Seções da home
│   ├── admin/                    # Componentes do admin
│   └── ui/                       # UI components
│
├── lib/                          # Utilitários
│   ├── supabase/                 # Clientes Supabase
│   │   ├── browserClient.ts      # Cliente do navegador
│   │   └── serverClient.ts       # Cliente do servidor
│   ├── constants.ts              # Configurações (categorias, datas)
│   └── cms/                      # Schemas CMS
│
├── hooks/                        # Custom React hooks
│   └── useAdmin.ts               # Hooks para admin
│
├── supabase/                     # Arquivos Supabase
│   └── schema.sql                # Schema do banco
│
├── legacy/                       # Backend antigo (NestJS)
│   └── ...                       # Arquivado, não usado
│
└── public/                       # Assets estáticos
```

---

## 📖 Funcionalidades Implementadas

### ✅ Frontend Público
- [x] Landing page responsiva
- [x] 4 categorias de corrida (Geral, Morador, 60+, Infantil)
- [x] Contador regressivo
- [x] Seções: Hero, Categorias, Timeline, Depoimentos
- [x] Páginas individuais por categoria
- [x] Página de Programação
- [x] Guia do Atleta
- [x] Design System completo

### ✅ Painel Administrativo
- [x] Sistema de login (Supabase Auth)
- [x] RBAC - 3 níveis de acesso (SITE_ADMIN, CHIP_ADMIN, ORG_ADMIN)
- [x] Dashboard por role
- [x] Configurações de evento
- [x] Estrutura para CMS
- [x] Audit logs

### ✅ Backend (Supabase)
- [x] Schema completo (15 tabelas)
- [x] Row Level Security (RLS)
- [x] Funções SQL úteis
- [x] Triggers automáticos
- [x] Dados iniciais (seed)

### 🔄 Em Desenvolvimento
- [ ] Formulário de inscrição funcional
- [ ] Dashboard de atletas
- [ ] Upload de documentos (Storage)
- [ ] Processamento de pagamentos
- [ ] Gestão de resultados
- [ ] CMS dinâmico completo

---

## 🧪 Testar o Projeto

### Teste 1: Site Público

```bash
npm run dev
# Acesse: http://localhost:3000
```

Navegue por:
- ✅ Home
- ✅ /prova-10k
- ✅ /prova-kids
- ✅ /programacao

### Teste 2: Admin Panel

**Primeiro, crie um usuário admin no Supabase:**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute:

```sql
-- Criar usuário auth
insert into auth.users (email, encrypted_password, email_confirmed_at)
values (
  'admin@corrida.com',
  crypt('senha123', gen_salt('bf')),
  now()
)
returning id;

-- Anotar o ID retornado e criar perfil admin
insert into public.admin_users (user_id, name, email, role, is_active)
values (
  'COLE_O_ID_AQUI',
  'Admin Teste',
  'admin@corrida.com',
  'SITE_ADMIN',
  true
);
```

4. Acesse: http://localhost:3000/admin/login
5. Faça login com: `admin@corrida.com` / `senha123`

---

## 🚀 Deploy para Produção

Siga o guia completo em: **[DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md)**

**Resumo**:
1. Criar projeto Supabase (cloud)
2. Executar `supabase/schema.sql`
3. Criar usuário admin
4. Deploy no Vercel (conectar GitHub)
5. Configurar env vars no Vercel

**Custo total**: R$ 0,00 🎉

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md) | Guia completo de deploy (Supabase + Vercel) |
| [MIGRATE_TO_SUPABASE.md](./MIGRATE_TO_SUPABASE.md) | Como migrar código existente para Supabase |
| [CATEGORIES.md](./CATEGORIES.md) | Detalhes das 4 categorias de corrida |
| [CMS_IMPLEMENTATION.md](./CMS_IMPLEMENTATION.md) | Arquitetura do CMS headless |
| [QUICKSTART.md](./QUICKSTART.md) | Guia rápido de navegação |

---

## 🆘 Problemas Comuns

### "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solução**: Configure `.env.local` com as credenciais do Supabase

### "Invalid login credentials"

**Solução**: Verifique se criou o usuário admin no Supabase Auth + admin_users

### "npm run dev" falha

**Solução**:
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Supabase local não inicia

**Solução**: Certifique-se de que o Docker está rodando

---

## 💡 Próximos Passos

1. **Testar localmente** - Rode `npm run dev` e explore o site
2. **Criar conta Supabase** - https://supabase.com
3. **Executar schema** - Rodar `supabase/schema.sql` no SQL Editor
4. **Criar admin** - Criar primeiro usuário administrativo
5. **Implementar inscrições** - Conectar formulário ao banco
6. **Deploy** - Publicar no Vercel

---

## 📞 Suporte

- **Documentação Supabase**: https://supabase.com/docs
- **Documentação Next.js**: https://nextjs.org/docs
- **Issues GitHub**: [Abrir issue](https://github.com/seu-usuario/corrida-altineu/issues)

---

**🎉 Bom desenvolvimento! 🏃‍♂️**








