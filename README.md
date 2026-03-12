# 🏃‍♂️ 51ª Corrida Rústica de Macuco

Sistema completo de gerenciamento de corrida com inscrições online, painel administrativo e área do atleta.

## 🎯 Sobre o Projeto

Landing page profissional e sistema de gestão para a **51ª edição da Corrida Rústica de Macuco**, que acontece em **24 de junho de 2026**.

### Categorias

- **Geral 10K** - R$ 20,00 (a partir de 15 anos)
- **Morador de Macuco 10K** - Gratuita (moradores locais)
- **60+ 10K** - Gratuita (60 anos ou mais)
- **Infantil 2K** - Gratuita (5 a 14 anos)

---

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Server Components**

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + API REST)

### Deploy
- **Vercel** (Frontend)
- **Supabase Cloud** (Backend)

### Custo de Hospedagem
**R$ 0,00** 🎉 (planos gratuitos)

---

## ⚡ Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

Crie uma conta em https://supabase.com e um novo projeto.

Depois, execute o schema do banco:
1. Vá em **SQL Editor** no dashboard
2. Copie o conteúdo de `supabase/schema.sql`
3. Cole e execute (Run)

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Supabase (encontradas em Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Rodar o Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📖 Documentação

| Arquivo | Descrição |
|---------|-----------|
| **[START_HERE_SUPABASE.md](./START_HERE_SUPABASE.md)** | 👈 **COMECE AQUI** - Guia de início rápido |
| [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md) | Deploy completo (Supabase + Vercel) |
| [ABACATEPAY_PIX_SETUP.md](./ABACATEPAY_PIX_SETUP.md) | Configuração de pagamentos PIX (AbacatePay) |
| [MIGRATE_TO_SUPABASE.md](./MIGRATE_TO_SUPABASE.md) | Migração de código para Supabase |
| [CATEGORIES.md](./CATEGORIES.md) | Detalhes das 4 categorias |
| [CMS_IMPLEMENTATION.md](./CMS_IMPLEMENTATION.md) | Arquitetura do CMS headless |
| [QUICKSTART.md](./QUICKSTART.md) | Navegação do projeto |

---

## 🎨 Funcionalidades

### ✅ Implementado

**Frontend Público**
- [x] Landing page responsiva e moderna
- [x] 4 categorias de corrida com regras específicas
- [x] Contador regressivo até o dia da prova
- [x] Timeline com história da corrida
- [x] Seções: Hero, Categorias, Depoimentos, Notícias
- [x] Páginas individuais por categoria
- [x] Programação do evento
- [x] Guia do Atleta
- [x] Design System completo

**Painel Administrativo**
- [x] Sistema de login (Supabase Auth)
- [x] RBAC - 3 níveis de acesso:
  - **SITE_ADMIN**: Controle total (conteúdo, usuários, configurações)
  - **CHIP_ADMIN**: Cronometragem e resultados
  - **ORG_ADMIN**: Relatórios (somente leitura)
- [x] Dashboard por role
- [x] Configurações de evento (datas, categorias, preços)
- [x] Estrutura para gestão de conteúdo (CMS)
- [x] Audit logs

**Backend (Supabase)**
- [x] Schema completo (15 tabelas)
- [x] Row Level Security (RLS) configurado
- [x] Funções SQL úteis (validação de idade, geração de números)
- [x] Triggers automáticos (updated_at)
- [x] Dados iniciais (seed com evento 2026)

### 🔄 Próximas Implementações

- [ ] Formulário de inscrição funcional
- [ ] Integração com gateway de pagamento (Mercado Pago)
- [ ] Dashboard do atleta (área pessoal)
- [ ] Upload de documentos (comprovantes, autorizações)
- [ ] Gestão de resultados e cronometragem
- [ ] Geração de certificados
- [ ] CMS dinâmico completo
- [ ] Notificações por email/WhatsApp

---

## 🗂️ Estrutura do Projeto

```
corrida-altineu/
├── app/                      # Next.js App Router
│   ├── (public)/             # Rotas públicas
│   ├── admin/                # Painel admin
│   └── api/                  # API Routes
│
├── components/               # Componentes React
│   ├── sections/             # Seções da home
│   ├── admin/                # Componentes admin
│   └── ui/                   # UI components
│
├── lib/                      # Utilitários
│   ├── supabase/             # Clientes Supabase
│   ├── constants.ts          # Configurações
│   └── cms/                  # Schemas CMS
│
├── hooks/                    # Custom hooks
├── supabase/                 # Schema SQL
└── public/                   # Assets estáticos
```

---

## 🔐 Segurança

- ✅ **Row Level Security (RLS)** ativo em todas as tabelas
- ✅ Autenticação via JWT (Supabase Auth)
- ✅ Middleware protegendo rotas administrativas
- ✅ Políticas de acesso baseadas em roles
- ✅ Audit log de todas as ações administrativas
- ✅ Chaves de serviço nunca expostas no frontend

---

## 🚀 Deploy

### Frontend (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/corrida-altineu)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente (Supabase URL + Anon Key)
3. Deploy automático! ✨

### Backend (Supabase)

1. Crie projeto em https://supabase.com
2. Execute `supabase/schema.sql` no SQL Editor
3. Anote as credenciais (URL + Keys)
4. Configure no Vercel

**Guia completo**: [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md)

---

## 🧪 Testes

```bash
# Rodar dev server
npm run dev

# Build de produção
npm run build

# Rodar build localmente
npm run start

# Lint
npm run lint
```

---

## 📊 Limites do Plano Gratuito

| Recurso | Limite Supabase Free | Uso Estimado |
|---------|---------------------|--------------|
| Banco de dados | 500 MB | ~4 MB |
| Storage | 1 GB | ~20 MB |
| Banda | 2 GB/mês | ~500 MB |
| API Requests | 50.000/dia | ~1.000/dia |

**Conclusão**: Plano gratuito é mais que suficiente! 🎉

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é proprietário e confidencial.

---

## 📞 Contato

- **Email**: contato@corridamacuco.com.br
- **Instagram**: [@corridamacuco](https://instagram.com/corridamacuco)
- **Facebook**: [/corridamacuco](https://facebook.com/corridamacuco)

---

## 🙏 Agradecimentos

Obrigado a todos os organizadores e atletas que fazem desta corrida um evento especial há 51 edições!

---

**Feito com ❤️ para a comunidade de Macuco - RJ**
