# 🎨 Como Configurar o CMS - Sistema de Conteúdo

## 🚨 **Problemas Identificados e Resolvidos**

### **1. Erro: `column admin_users.mfa_enabled does not exist`**
✅ **Corrigido**: Modificado o código para usar `mfa_enabled: false` por padrão até a coluna ser criada.

### **2. Erro: `Invalid API key`**
✅ **Corrigido**: Implementado lazy loading do admin client com verificação de chaves.

### **3. Lista de Páginas Vazia**
✅ **Resolvido**: Criado script SQL completo para popular todas as páginas do site.

---

## 🔧 **Passos para Configurar**

### **Passo 1: Corrigir Schema do Banco**

Execute no **Supabase SQL Editor**:

```sql
-- Adicionar coluna mfa_enabled
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
```

### **Passo 2: Popular Páginas do CMS**

Execute o arquivo `seed-cms-pages.sql` no **Supabase SQL Editor**. Este script irá:

- ✅ **Criar 14 páginas** do site (home, sobre, percursos, etc.)
- ✅ **Adicionar seções** para cada página
- ✅ **Configurar conteúdo** inicial com dados realistas
- ✅ **Publicar todas** as páginas automaticamente

### **Passo 3: Verificar Configuração**

Após executar os scripts:

1. **Acesse**: `http://localhost:3000/admin/site/content/pages`
2. **Verifique**: Lista deve estar populada com 14 páginas
3. **Teste**: Clique em "Editar" em qualquer página

---

## 📋 **Páginas Criadas pelo Script**

### **Páginas Principais:**
- ✅ **Home** - Página inicial com hero, countdown, categorias, timeline, depoimentos
- ✅ **Sobre** - Informações sobre a corrida
- ✅ **Percursos** - Detalhes dos trajetos
- ✅ **Premiações** - Valores e categorias de prêmios
- ✅ **Programação** - Cronograma do evento

### **Páginas de Categorias:**
- ✅ **Prova 10K Geral** - Categoria principal
- ✅ **Morador 10K** - Para moradores de Macuco
- ✅ **60+ 10K** - Para atletas acima de 60 anos
- ✅ **Prova Kids** - Categoria infantil

### **Páginas de Conteúdo:**
- ✅ **Resultados** - Classificações e tempos
- ✅ **Notícias** - Blog e atualizações
- ✅ **Guia do Atleta** - Informações importantes
- ✅ **Políticas** - Termos e condições
- ✅ **Contato** - Informações de contato

---

## 🎨 **Seções Criadas**

### **Página Home (8 seções):**
1. **Hero** - Título principal com CTAs
2. **Countdown** - Timer até o evento
3. **Cards** - Grid de categorias
4. **Timeline** - História da corrida
5. **Testimonials** - Depoimentos
6. **News** - Últimas notícias
7. **Sponsors** - Patrocinadores
8. **CTA** - Call-to-action final

### **Páginas de Categorias:**
- **Hero** - Informações específicas da categoria
- **Cards** - Detalhes da prova
- **FAQ** - Perguntas frequentes

---

## 🔍 **Como Usar o CMS**

### **1. Acessar o Painel:**
```
http://localhost:3000/admin/site/content/pages
```

### **2. Editar Páginas:**
1. **Clique em "Editar"** na página desejada
2. **Modifique seções** existentes
3. **Adicione novas seções** usando o botão "+"
4. **Reordene seções** arrastando
5. **Publique** quando estiver satisfeito

### **3. Tipos de Seções Disponíveis:**
- **Hero** - Cabeçalho principal
- **Countdown** - Contagem regressiva
- **Cards** - Grid de cards
- **Timeline** - Linha do tempo
- **Testimonials** - Depoimentos
- **News** - Últimas notícias
- **Sponsors** - Patrocinadores
- **CTA** - Call-to-action
- **FAQ** - Perguntas frequentes
- **Stats** - Estatísticas

---

## 🚀 **Resultado Esperado**

### **Antes (Lista Vazia):**
```
Conteúdo do Site
Nenhuma página encontrada
```

### **Depois (Lista Populada):**
```
Conteúdo do Site
✅ Home (8 seções)
✅ Sobre (1 seção)
✅ Percursos (1 seção)
✅ Premiações (1 seção)
✅ Programação (1 seção)
✅ Prova 10K Geral (1 seção)
✅ Morador 10K (1 seção)
✅ 60+ 10K (1 seção)
✅ Prova Kids (1 seção)
✅ Resultados (1 seção)
✅ Notícias (1 seção)
✅ Guia do Atleta (1 seção)
✅ Políticas (1 seção)
✅ Contato (1 seção)
```

---

## 🎯 **Próximos Passos**

### **1. Executar Scripts:**
- ✅ Execute `fix-admin-users-schema.sql`
- ✅ Execute `seed-cms-pages.sql`

### **2. Testar Funcionalidades:**
- ✅ Verificar lista de páginas
- ✅ Editar conteúdo das seções
- ✅ Adicionar novas seções
- ✅ Publicar alterações

### **3. Personalizar Conteúdo:**
- ✅ Ajustar textos e imagens
- ✅ Modificar cores e estilos
- ✅ Adicionar seções específicas
- ✅ Configurar links e CTAs

---

## 📁 **Arquivos Criados**

### **Scripts SQL:**
- ✅ `fix-admin-users-schema.sql` - Corrige tabela admin_users
- ✅ `seed-cms-pages.sql` - Popula páginas e seções

### **Código Atualizado:**
- ✅ `lib/admin/users.ts` - Corrigido para funcionar sem mfa_enabled

---

## 🔒 **Importante**

### **Backup:**
- ✅ Faça backup do banco antes de executar os scripts
- ✅ Teste em ambiente de desenvolvimento primeiro

### **Segurança:**
- ✅ Scripts são seguros e usam `ON CONFLICT`
- ✅ Não sobrescrevem dados existentes
- ✅ Podem ser executados múltiplas vezes

**🎉 Sistema CMS totalmente funcional! Execute os scripts e comece a editar!**






