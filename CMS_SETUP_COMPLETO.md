# 🎨 Setup Completo do CMS - Sistema de Gerenciamento de Conteúdo

## 📋 **Resumo da Implementação**

Sistema CMS totalmente funcional para gerenciar:
- ✅ **15 páginas institucionais** (home, sobre, percursos, etc.)
- ✅ **3 posts do blog** (notícias hardcoded migradas para o CMS)
- ✅ **Seções dinâmicas** para cada página
- ✅ **API completa** para posts do blog
- ✅ **Hooks React** para integração

---

## 🚀 **Como Configurar (Passo a Passo)**

### **Passo 1: Corrigir Schema do Banco**

Execute no **Supabase SQL Editor**:

```sql
-- 1. Adicionar coluna mfa_enabled
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
```

### **Passo 2: Popular CMS Completo**

Execute o arquivo `seed-cms-complete.sql` no **Supabase SQL Editor**.

Este script irá:
- ✅ Criar **15 páginas** (incluindo regulamento que estava faltando)
- ✅ Adicionar **seções** para cada página
- ✅ Migrar **3 posts do blog** para o CMS
- ✅ Configurar **status published** para tudo

**Conteúdo criado:**
```
Páginas: 15 (todas publicadas)
Seções: 19 (todas visíveis)
Posts: 3 (todos publicados)
```

### **Passo 3: Verificar Configuração**

Execute `test-cms-setup.sql` para verificar se tudo foi criado corretamente.

Deve retornar:
```
✅ Coluna mfa_enabled existe
✅ 15 páginas criadas
✅ 19 seções criadas
✅ 3 posts do blog
```

### **Passo 4: Testar no Painel Admin**

1. **Acesse**: `http://localhost:3000/admin/site/content/pages`
2. **Verifique**: Lista com 15 páginas
3. **Teste**: Editar qualquer página

---

## 📁 **Estrutura do CMS**

### **Páginas Institucionais (15):**

#### **Principais:**
1. **home** - Página inicial (8 seções)
2. **sobre** - Sobre a corrida
3. **percursos** - Trajetos e mapas
4. **premiacoes** - Valores e regras
5. **programacao** - Cronograma

#### **Categorias:**
6. **prova-10k** - Categoria 10K Geral
7. **morador-10k** - Morador 10K Gratuito
8. **60-mais-10k** - Categoria 60+ Gratuito
9. **prova-kids** - Infantil 2K Gratuito

#### **Conteúdo:**
10. **resultados** - Classificações
11. **noticias** - Lista de posts
12. **guia-atleta** - Informações práticas
13. **politicas** - Privacidade
14. **regulamento** - Regras oficiais
15. **contato** - Fale conosco

### **Posts do Blog (3):**

1. **inscricoes-abertas-51-edicao** - Anúncio de inscrições
2. **novo-percurso-10k** - Percurso certificado
3. **dicas-preparacao** - Guia de treino

---

## 🎨 **Seções Disponíveis**

### **Tipos de Seções:**
- **hero** - Cabeçalho principal
- **countdown** - Contagem regressiva
- **cards** - Grid de categorias/features
- **timeline** - História/marcos temporais
- **testimonials** - Depoimentos
- **news** - Últimas notícias
- **sponsors** - Patrocinadores
- **cta** - Call-to-action
- **faq** - Perguntas frequentes
- **stats** - Estatísticas

### **Exemplo: Página Home (8 seções):**
```
1. Hero - Título + CTAs + Stats
2. Countdown - Timer até o evento
3. Cards - 4 categorias de corrida
4. Timeline - História da corrida
5. Testimonials - 2 depoimentos
6. News - Últimos 3 posts
7. Sponsors - Logos de patrocinadores
8. CTA - Conversão final
```

---

## 🔧 **Arquivos Criados/Modificados**

### **Scripts SQL:**
- ✅ `fix-admin-users-schema.sql` - Corrige tabela admin_users
- ✅ `seed-cms-complete.sql` - Popula TUDO (páginas + posts)
- ✅ `test-cms-setup.sql` - Verifica configuração

### **API e Hooks:**
- ✅ `lib/admin/posts.ts` - API client para posts
- ✅ `hooks/usePosts.ts` - React hooks para posts
- ✅ `lib/admin/users.ts` - Corrigido (mfa_enabled)

### **Documentação:**
- ✅ `CMS_SETUP_COMPLETO.md` - Este arquivo
- ✅ `CONFIGURAR_CMS.md` - Guia anterior
- ✅ `CONFIGURAR_SERVICE_ROLE.md` - Service Role Key

---

## 🎯 **Como Usar o CMS**

### **1. Gerenciar Páginas:**

#### **Acessar:**
```
http://localhost:3000/admin/site/content/pages
```

#### **Editar Página:**
1. Clique em **"Editar"** na página desejada
2. Modifique seções existentes
3. Adicione novas seções com **"+ Adicionar Seção"**
4. Reordene arrastando
5. **Publique** quando pronto

#### **Criar Nova Página:**
1. Clique em **"Nova Página"**
2. Preencha slug e título
3. Adicione seções
4. Publique

### **2. Gerenciar Posts do Blog:**

#### **Via API (por enquanto):**
```typescript
import { postsApi } from '@/lib/admin/posts'

// Criar post
await postsApi.createPost({
  slug: 'meu-post',
  title: 'Meu Post',
  content: '<p>Conteúdo...</p>',
  status: 'published'
})

// Atualizar post
await postsApi.updatePost('id', {
  title: 'Novo Título'
})

// Publicar post
await postsApi.publishPost('id')

// Deletar post
await postsApi.deletePost('id')
```

#### **Com Hook:**
```typescript
import { usePosts } from '@/hooks/usePosts'

function MyComponent() {
  const { posts, loading, createPost, updatePost, deletePost } = usePosts()
  
  // Use posts aqui
}
```

### **3. Integrar Posts nas Páginas:**

#### **Lista de Posts:**
```typescript
import { usePublishedPosts } from '@/hooks/usePosts'

function BlogList() {
  const { posts, loading } = usePublishedPosts(10) // Limitar a 10
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <Link href={`/noticias/${post.slug}`}>Ler mais</Link>
        </article>
      ))}
    </div>
  )
}
```

#### **Post Individual:**
```typescript
import { usePost } from '@/hooks/usePosts'

function BlogPost({ slug }) {
  const { post, loading } = usePost(slug)
  
  if (!post) return <div>Post não encontrado</div>
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

---

## 🚧 **Próximos Passos (Opcional)**

### **1. Interface Admin para Posts:**
- Criar página `/admin/site/content/posts`
- Editor rich-text (TinyMCE, Tiptap, etc.)
- Upload de imagens
- Preview antes de publicar

### **2. Migrar Rotas de Notícias:**
Atualizar `app/(public)/noticias/[slug]/page.tsx`:

```typescript
import { postsApi } from '@/lib/admin/posts'

export default async function PostPage({ params }) {
  const post = await postsApi.getPostBySlug(params.slug)
  
  if (!post) notFound()
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

### **3. SEO e Meta Tags:**
- Adicionar `meta_description` aos posts
- Configurar Open Graph images
- Gerar sitemap dinâmico

### **4. Comentários:**
- Integrar Disqus ou sistema próprio
- Moderação de comentários

---

## ✅ **Checklist de Configuração**

- [ ] Executar `fix-admin-users-schema.sql`
- [ ] Executar `seed-cms-complete.sql`
- [ ] Executar `test-cms-setup.sql` (verificação)
- [ ] Acessar `/admin/site/content/pages`
- [ ] Verificar 15 páginas na lista
- [ ] Testar edição de uma página
- [ ] Verificar posts do blog no banco
- [ ] (Opcional) Criar interface admin para posts

---

## 🎉 **Resultado Final**

Após executar todos os scripts, você terá:

### **CMS Completo:**
- ✅ **15 páginas** totalmente editáveis
- ✅ **19 seções** distribuídas
- ✅ **3 posts** migrados para o banco
- ✅ **API completa** para posts
- ✅ **Hooks React** prontos para uso

### **Sistema Funcionando:**
- ✅ Todas as rotas institucionais dinâmicas
- ✅ Blog gerenciável via API
- ✅ Painel admin funcional
- ✅ Pronto para produção

### **Capacidades:**
- ✅ Criar/editar páginas sem código
- ✅ Adicionar/remover seções
- ✅ Publicar/despublicar conteúdo
- ✅ Gerenciar posts via API
- ✅ Sistema totalmente type-safe

**🎨 Execute os scripts e comece a editar seu conteúdo!**

---

## 📚 **Recursos Adicionais**

### **Schemas CMS:**
- `lib/cms/schemas.ts` - Definições TypeScript/Zod

### **Schema do Banco:**
- `supabase/schema.sql` - Schema completo

### **Exemplos de Uso:**
- `app/(public)/page.tsx` - Página home usando CMS
- Outras páginas em `app/(public)/*` - Wrappers CMS

### **Documentação:**
- `CONFIGURAR_CMS.md` - Guia de configuração
- `CONFIGURAR_SERVICE_ROLE.md` - Service Role Key
- `CORRECAO_SERVICE_ROLE.md` - Troubleshooting

**💡 Dica:** Explore os schemas em `lib/cms/schemas.ts` para ver todas as opções de seções e suas propriedades!







