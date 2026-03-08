# 🚀 Deploy Completo - Supabase + Vercel

Este guia mostra como colocar sua aplicação no ar **100% gratuitamente** usando Supabase (backend/banco) + Vercel (frontend).

---

## 📋 Pré-requisitos

- [ ] Conta no [Supabase](https://supabase.com) (gratuita)
- [ ] Conta no [Vercel](https://vercel.com) (gratuita)
- [ ] Conta no [GitHub](https://github.com) (se ainda não tiver)
- [ ] Código no repositório GitHub

---

## 🗄️ Parte 1: Configurar Supabase (Backend + Banco)

### Passo 1: Criar Projeto

1. Acesse https://supabase.com e faça login (GitHub ou Google)
2. Clique em **"New project"**
3. Preencha os dados:
   - **Name**: `corrida-macuco` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte e **ANOTE**
   - **Region**: Escolha **South America (São Paulo)** se disponível, ou **US East**
   - **Pricing Plan**: Deixe em **Free**
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos enquanto o projeto é provisionado

### Passo 2: Obter Credenciais

Após o projeto estar pronto:

1. No dashboard, vá em **Settings** (⚙️ no menu lateral esquerdo)
2. Clique em **API**
3. **ANOTE** estas informações (vamos usar depois):

```
Project URL:     https://xxxxxxxxxx.supabase.co
anon public:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
service_role:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M... (não compartilhe!)
```

⚠️ **IMPORTANTE**: 
- A chave `anon public` é segura para usar no frontend
- A chave `service_role` **NUNCA** deve ir para o código frontend (só use em API routes server-side)

### Passo 3: Criar Schema do Banco

1. No dashboard do Supabase, clique em **SQL Editor** no menu lateral
2. Clique em **"New query"**
3. Abra o arquivo `supabase/schema.sql` deste repositório
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no editor SQL do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Aguarde a execução (pode levar 10-20 segundos)
8. Você deve ver: ✅ **"Success. No rows returned"**

Isso criou:
- ✅ 15 tabelas (admin_users, events, categories, registrations, etc.)
- ✅ Índices para performance
- ✅ Políticas RLS (Row Level Security)
- ✅ Funções SQL úteis
- ✅ Dados iniciais (evento 2026 + 4 categorias)

### Passo 4: Criar Usuário Admin (Primeiro Acesso)

Ainda no SQL Editor, execute este comando para criar seu primeiro admin:

```sql
-- Substitua os dados abaixo pelos seus
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
values (
  gen_random_uuid(),
  'seu-email@example.com', -- MUDE AQUI
  crypt('SuaSenha123', gen_salt('bf')), -- MUDE AQUI
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Principal"}',
  false,
  'authenticated'
)
returning id;
```

**Anote o ID retornado** e execute:

```sql
-- Substitua 'ID_RETORNADO_ACIMA' pelo UUID que apareceu
insert into public.admin_users (user_id, name, email, role, is_active)
values (
  'ID_RETORNADO_ACIMA', -- Cole o UUID aqui
  'Admin Principal',
  'seu-email@example.com',
  'SITE_ADMIN',
  true
);
```

Pronto! Agora você tem um usuário administrador.

### Passo 5: Configurar Storage (Opcional)

Se quiser armazenar arquivos (fotos, documentos):

1. Vá em **Storage** no menu lateral
2. Clique em **"Create a new bucket"**
3. Nome: `public-files`
4. **Public bucket**: Marque como ✅ (para imagens do site)
5. Clique em **"Create bucket"**

Para documentos privados (comprovantes), crie outro bucket:
- Nome: `private-documents`
- **Public bucket**: Deixe desmarcado ❌

---

## 🌐 Parte 2: Deploy no Vercel (Frontend)

### Passo 1: Preparar Repositório

1. Certifique-se de que seu código está no GitHub
2. Faça commit de todas as mudanças:

```bash
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### Passo 2: Conectar Vercel ao GitHub

1. Acesse https://vercel.com e faça login com sua conta GitHub
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório `corrida-altineu` (ou o nome do seu repo)
4. Clique em **"Import"**

### Passo 3: Configurar Variáveis de Ambiente

Antes de fazer deploy, precisamos adicionar as credenciais do Supabase:

1. Na tela de configuração do projeto, expanda **"Environment Variables"**
2. Adicione as seguintes variáveis (uma por vez):

| Nome da Variável | Valor | Ambiente |
|------------------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiI...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiI...` (service_role) | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://seu-dominio.vercel.app` | Production |

⚠️ Use os valores que você **anotou no Passo 2 do Supabase**

- **SUPABASE_SERVICE_ROLE_KEY**: Necessária para API routes (certificados, resultados, etc.)
- **NEXT_PUBLIC_SITE_URL**: URL do site em produção (para QR Code dos certificados)

3. Clique em **"Deploy"**

### Passo 4: Aguardar Deploy

O Vercel vai:
1. ✅ Instalar dependências (`npm install`)
2. ✅ Executar build (`npm run build`)
3. ✅ Fazer deploy

Isso leva cerca de 2-5 minutos.

### Passo 5: Acessar o Site

Quando terminar, você verá:

🎉 **"Congratulations! Your project has been deployed."**

Copie a URL (será algo como `https://corrida-altineu.vercel.app`) e acesse!

---

## ✅ Parte 3: Testar a Aplicação

### Teste 1: Site Público

1. Acesse a URL do Vercel
2. Navegue pelas páginas:
   - ✅ Home deve carregar
   - ✅ Categorias devem aparecer
   - ✅ Contador deve funcionar

### Teste 2: Admin Panel

1. Acesse `https://sua-url.vercel.app/admin/login`
2. Faça login com o email/senha que você criou no Supabase
3. Você deve ver o dashboard administrativo

Se der erro:
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o usuário foi criado corretamente no Supabase

---

## 🔧 Parte 4: Configurações Adicionais

### Domínio Personalizado (Opcional)

Se você tem um domínio próprio:

1. No Vercel, vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `corridamacuco.com.br`)
4. Siga as instruções para configurar DNS

### CORS no Supabase

Por padrão, o Supabase aceita requisições apenas de URLs autorizadas:

1. No Supabase, vá em **Settings** → **API**
2. Role até **"API Settings"**
3. Adicione sua URL do Vercel em **"Site URL"**
4. Adicione também em **"Additional Redirect URLs"** se usar autenticação

### Emails Personalizados

Para personalizar os emails enviados pelo Supabase (confirmação, recuperação):

1. Vá em **Authentication** → **Email Templates**
2. Edite os templates:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password
3. Personalize com logo e cores da corrida

---

## 📊 Parte 5: Monitoramento

### Vercel Analytics

Para ver quantas pessoas acessam o site:

1. No Vercel, vá em **Analytics**
2. Ative o plano **Free** (até 100k pageviews/mês)

### Supabase Logs

Para monitorar o banco de dados:

1. No Supabase, vá em **Logs** no menu lateral
2. Escolha o tipo de log:
   - **Postgres Logs**: queries SQL
   - **API**: requisições à API
   - **Auth**: logins e registros

---

## 🆘 Problemas Comuns

### "Failed to fetch" no site

**Causa**: Variáveis de ambiente incorretas

**Solução**:
1. Verifique se copiou corretamente as chaves do Supabase
2. No Vercel, vá em **Settings** → **Environment Variables**
3. Corrija e clique em **"Redeploy"**

### "JWT expired" ao fazer login

**Causa**: Relógio do computador desatualizado ou chave incorreta

**Solução**:
1. Sincronize o relógio do seu computador
2. Verifique se usou a `anon` key (não a `service_role`)

### Páginas dão erro 404

**Causa**: Build do Next.js falhou

**Solução**:
1. No Vercel, vá em **Deployments**
2. Clique no último deploy
3. Veja os logs de build
4. Se houver erros de TypeScript, corrija localmente e faça novo push

### Inscrições não salvam

**Causa**: Políticas RLS (Row Level Security) bloqueando insert

**Solução**:
1. No Supabase, vá em **Authentication** → **Policies**
2. Verifique se as policies estão corretas
3. Se necessário, execute novamente o `schema.sql`

---

## 🎯 Checklist Final

Antes de divulgar o site publicamente, verifique:

- [ ] Site público carrega corretamente
- [ ] Todas as páginas funcionam (Home, 10K, Kids, etc.)
- [ ] Login do admin funciona
- [ ] Dashboard mostra dados corretos
- [ ] Formulário de inscrição funciona (teste com dados fictícios)
- [ ] Emails de confirmação são enviados
- [ ] Imagens carregam (se usar Storage)
- [ ] Site está responsivo (teste no celular)
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] Analytics ativado

---

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs no Vercel (Deployments → Build Logs)
2. Verifique os logs no Supabase (Logs → API/Postgres)
3. Consulte a documentação
4. Abra uma issue no GitHub do projeto

---

**🎉 Parabéns! Seu site está no ar com custo ZERO! 🎉**








