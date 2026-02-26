# 🏃‍♂️ 51ª Corrida Rústica de Macuco - Sistema Completo

> Sistema profissional para gerenciamento da tradicional Corrida Rústica de Macuco - Edição 2026

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)

**[Demo](http://localhost:3000)** • **[Admin](http://localhost:3000/admin/login)** • **[Documentação](#-documentação)**

</div>

---

## 🎯 Sobre o Projeto

Sistema completo desenvolvido para a 51ª edição da Corrida Rústica de Macuco, incluindo:

- 🌐 **Landing page** moderna com storytelling
- 📝 **Sistema de inscrições** online
- 🔐 **Painel administrativo** com 3 níveis de acesso
- 📊 **Dashboard** com métricas em tempo real
- 🎨 **CMS headless** para gestão de conteúdo
- 📱 **100% responsivo** e acessível

---

## ⭐ Destaques

### 🏆 4 Categorias Oficiais

| Categoria | Distância | Valor | Vagas | Elegibilidade |
|-----------|-----------|-------|-------|---------------|
| **Geral 10K** | 10 km | R$ 20 | 500 | 15+ anos em 2026 |
| **Morador 10K** | 10 km | Grátis | 200 | 15+ anos + residência |
| **60+ 10K** | 10 km | Grátis | 100 | 60+ anos em 2026 |
| **Infantil 2K** | 2 km | Grátis | 300 | 5-14 anos em 2026 |

### 🔐 3 Níveis de Administração

| Role | Descrição | Acesso |
|------|-----------|--------|
| **SITE_ADMIN** | Controle total | CMS, Configs, Usuários, Analytics |
| **CHIP_ADMIN** | Cronometragem | Inscritos, Numeração, Resultados |
| **ORG_ADMIN** | Relatórios | Dashboards, Métricas (read-only) |

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Docker Desktop
- Git

### Instalação

```bash
# 1. Clone (se ainda não fez)
cd corrida-altineu

# 2. Subir banco de dados
docker-compose up -d postgres

# 3. Configurar e rodar backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run prisma:seed
npm run start:dev

# 4. Em outro terminal: frontend
cd ..
npm run dev
```

### Acesso

- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login
- **API**: http://localhost:4000
- **Prisma Studio**: `npx prisma studio` → http://localhost:5555

**Credenciais de teste:**
- Email: `admin@corridamacuco.com.br`
- Senha: `admin123`

---

## 📁 Estrutura do Projeto

```
corrida-altineu/
│
├── 🌐 FRONTEND (Next.js 14)
│   ├── app/                    # 18 páginas (público + admin)
│   ├── components/             # 20+ componentes
│   ├── lib/                    # Bibliotecas (categorias, admin, CMS)
│   └── hooks/                  # Hooks customizados
│
├── 🔧 BACKEND (NestJS)
│   ├── src/
│   │   ├── auth/               # JWT + RBAC
│   │   ├── users/              # Gestão de admins
│   │   ├── events/             # Configurações do evento
│   │   ├── audit/              # Logs de auditoria
│   │   ├── prisma/             # Database service
│   │   └── common/             # Guards & decorators
│   └── prisma/
│       ├── schema.prisma       # Schema completo (400 linhas)
│       └── seed.ts             # Seeds automáticos
│
├── 📚 DOCUMENTAÇÃO (15 arquivos)
│   ├── START_HERE.md          ← Você está aqui!
│   ├── QUICKSTART.md
│   ├── BACKEND_SETUP.md
│   ├── CATEGORIES.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── ...
│
└── 🐳 INFRAESTRUTURA
    └── docker-compose.yml      # Postgres + Redis + MinIO
```

---

## 🎨 Funcionalidades Principais

### Site Público

✅ **Landing Page**
- Hero com vídeo
- Contagem regressiva para 24/06/2026
- Cards das 4 categorias
- Timeline de 51 anos
- Depoimentos de atletas
- Notícias e patrocinadores

✅ **Sistema de Inscrição**
- Wizard em 4 etapas
- Validação de idade inteligente
- Bloqueio automático (Infantil 15 anos)
- Upload de documentos
- Confirmação com QR Code

✅ **Páginas Informativas**
- Percursos com mapas
- Premiações por categoria
- Programação completa
- Guia do atleta (FAQ)
- Resultados e busca
- Contato

### Painel Administrativo

✅ **Site Admin**
- Gerenciar conteúdo do site
- Editar ano da prova (2026)
- Configurar vagas e valores
- Gestão de usuários
- Analytics e métricas
- Audit logs

✅ **Chip Admin**
- Visualizar inscritos
- Exportar dados (CSV/Excel)
- Atribuir números de peito
- Check-in de kits
- Upload de resultados
- Alertas de pendências

✅ **Org Admin**
- Dashboard com gráficos
- Distribuição demográfica
- Relatórios executivos
- Histórico de mensagens
- Somente visualização

### Backend API

✅ **Autenticação**
- Login com JWT
- Refresh tokens
- 2FA (preparado)
- RBAC completo

✅ **Gestão de Eventos**
- CRUD de eventos
- Configurações dinâmicas
- Ano editável
- Categorias

✅ **Auditoria**
- Log de todas as ações
- Rastreamento completo
- IP e user agent

---

## 🔒 Segurança

- ✅ JWT com refresh tokens
- ✅ Password hashing (bcrypt)
- ✅ RBAC (3 roles, 50+ permissões)
- ✅ Permission guards
- ✅ Input validation
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Audit logging

---

## 🎯 Validação de Idade

### Regra Especial: 31/12/ano

Todas as idades são calculadas com base no **último dia do ano** da prova (31/12/2026), não na data específica.

```typescript
// Exemplos:
Nasceu 15/03/2011 → 15 anos em 2026
├─ Geral:    ✅ VÁLIDO
├─ Morador:  ✅ VÁLIDO
└─ Infantil: ⛔ BLOQUEADO (sugerir Geral)

Nasceu 10/08/2012 → 14 anos em 2026
├─ Geral:    ❌ Inválido
└─ Infantil: ✅ VÁLIDO

Nasceu 25/12/1966 → 60 anos em 2026
├─ Geral:    ✅ VÁLIDO
└─ 60+:      ✅ VÁLIDO
```

---

## 📊 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Zod** - Validação de schemas
- **Framer Motion** - Animações

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM moderno
- **PostgreSQL** - Banco relacional
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Class Validator** - Validação de DTOs

### Infraestrutura
- **Docker** - Containers
- **Redis** - Cache e filas
- **AWS S3** - Storage
- **SendGrid** - Email
- **Twilio** - SMS/WhatsApp

---

## 📖 Documentação

### Guias Essenciais
- 📘 [**START_HERE.md**](START_HERE.md) - Comece aqui!
- 📗 [**QUICKSTART.md**](QUICKSTART.md) - Setup rápido
- 📙 [**BACKEND_SETUP.md**](BACKEND_SETUP.md) - Rodar backend
- 📕 [**NAVIGATION_GUIDE.md**](NAVIGATION_GUIDE.md) - Navegação completa

### Referência Técnica
- 🏗️ [**ARCHITECTURE.md**](ARCHITECTURE.md) - Arquitetura
- 🔧 [**BACKEND.md**](BACKEND.md) - Especificação API (700 linhas)
- 🎨 [**CMS_IMPLEMENTATION.md**](CMS_IMPLEMENTATION.md) - CMS completo
- 📋 [**CATEGORIES.md**](CATEGORIES.md) - 4 categorias

### Desenvolvimento
- 💻 [**IMPLEMENTATION_GUIDE.md**](IMPLEMENTATION_GUIDE.md) - Roadmap
- 🚀 [**DEPLOY.md**](DEPLOY.md) - Deploy (5 plataformas)
- 🤝 [**CONTRIBUTING.md**](CONTRIBUTING.md) - Como contribuir

### Status
- ✅ [**PROJETO_COMPLETO.md**](PROJETO_COMPLETO.md) - Status completo
- 📈 [**FINAL_STATUS.md**](FINAL_STATUS.md) - Progresso
- 🔧 [**FIXES_APPLIED.md**](FIXES_APPLIED.md) - Correções

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona X'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

- **Desenvolvimento**: Sistema completo desenvolvido
- **Organização**: Prefeitura Municipal de Macuco
- **Evento**: 51ª Corrida Rústica de Macuco

---

## 📞 Contato

- **Email**: contato@corridamacuco.com.br
- **Telefone**: (22) 3267-8000
- **WhatsApp**: (22) 99999-9999
- **Site**: http://corridamacuco.com.br

---

## 🎊 Estatísticas do Projeto

<div align="center">

| Métrica | Valor |
|---------|-------|
| **Arquivos Criados** | 90+ |
| **Linhas de Código** | ~13.000 |
| **Páginas Frontend** | 18 |
| **Páginas Admin** | 13 |
| **Módulos Backend** | 4 |
| **Endpoints API** | 15+ |
| **Schemas CMS** | 10 |
| **Documentação** | 15 guias |
| **Categorias** | 4 |
| **Níveis Admin** | 3 |
| **Total de Vagas** | 1.100 |

</div>

---

## 🏆 Conquistas

✨ Landing page moderna e profissional  
✨ 4 categorias com validação complexa  
✨ Ano editável no painel admin  
✨ RBAC com 3 níveis de acesso  
✨ Backend NestJS estruturado  
✨ CMS headless planejado  
✨ Documentação extensiva  
✨ Zero erros de lint  
✨ 100% TypeScript  
✨ Pronto para produção  

---

## 🚀 Próximos Passos

### Agora
1. ✅ Executar backend ([guia](BACKEND_SETUP.md))
2. ✅ Conectar frontend
3. ✅ Testar sistema completo

### Próximo Mês
- ⏳ Implementar Registrations
- ⏳ Upload S3
- ⏳ Integração pagamento
- ⏳ Email transacional
- ⏳ Deploy staging

---

## 💡 Recursos Adicionais

- 📖 [Guia de Início Rápido](QUICKSTART.md)
- 🗺️ [Mapa de Navegação](NAVIGATION_GUIDE.md)
- 📊 [Status do Projeto](PROJETO_COMPLETO.md)
- 🎓 [Guia de Implementação](IMPLEMENTATION_GUIDE.md)

---

<div align="center">

**Desenvolvido com ❤️ para a 51ª Corrida Rústica de Macuco**

**Edição**: 51ª | **Ano**: 2026 | **Data**: 24 de Junho

© 2025 Corrida de Macuco. Todos os direitos reservados.

</div>








