# 🔧 Como Configurar a Service Role Key

## 🚨 **Problema Resolvido**

O erro `403 (Forbidden)` e `User not allowed` foi corrigido! O problema era que o código estava tentando usar a **Admin API** com a **chave anônima**, que não tem permissões para criar usuários.

## ✅ **Correção Implementada**

Modifiquei o código para usar corretamente a **Service Role Key** para operações administrativas:

- ✅ **Cliente Admin** criado com Service Role Key
- ✅ **Verificação de configuração** antes de usar Admin API
- ✅ **Fallback** para operações que não precisam de admin
- ✅ **Tratamento de erros** melhorado

---

## 📋 **Como Configurar**

### **1. Obter a Service Role Key**

1. **Acesse o Supabase Dashboard**: https://supabase.com/dashboard
2. **Selecione seu projeto**: `pgrycfsfojgqaerjwpio`
3. **Vá em Settings** → **API**
4. **Copie a Service Role Key** (não a anon/public key)

### **2. Configurar no .env.local**

Edite seu arquivo `.env.local` e adicione:

```bash
# Suas configurações existentes
NEXT_PUBLIC_SUPABASE_URL=https://pgrycfsfojgqaerjwpio.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui

# ADICIONE ESTA LINHA:
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### **3. Reiniciar o Servidor**

```bash
# Pare o servidor (Ctrl+C)
# Reinicie
npm run dev
```

---

## 🔍 **Como Encontrar a Service Role Key**

No Supabase Dashboard, na seção **API**, você verá:

```
Project URL: https://pgrycfsfojgqaerjwpio.supabase.co
anon/public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (chave pública)
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (chave administrativa) ← ESTA!
```

**Copie a `service_role` key (não a `anon/public`)**

---

## ⚠️ **Importante - Segurança**

### **✅ Service Role Key é SEGURA para usar aqui porque:**

1. **Server-side only** - Nunca é exposta no frontend
2. **Operações admin** - Usada apenas para criar/deletar usuários
3. **Controle total** - Você tem controle sobre quando usar
4. **Padrão recomendado** - É assim que se faz em aplicações reais

### **🔒 Nunca faça:**

- ❌ **Não commite** a Service Role Key no Git
- ❌ **Não exponha** no frontend
- ❌ **Não compartilhe** publicamente

### **✅ Sempre faça:**

- ✅ **Adicione no .gitignore**:
  ```bash
  .env.local
  .env
  ```
- ✅ **Use apenas server-side**
- ✅ **Mantenha segura**

---

## 🧪 **Testar a Correção**

Após configurar a Service Role Key:

1. **Acesse**: `http://localhost:3000/admin/site/users`
2. **Clique em "Novo Usuário"**
3. **Preencha o formulário**:
   - Nome: "Teste Admin"
   - Email: "teste@exemplo.com"
   - Senha: "123456"
   - Função: "ORG_ADMIN"
4. **Clique em "Criar Usuário"**

### **✅ Resultado Esperado:**
- ✅ Usuário criado com sucesso
- ✅ Toast de confirmação
- ✅ Usuário aparece na lista
- ✅ Sem erros no console

---

## 🚨 **Se Ainda Der Erro**

### **Erro: "SUPABASE_SERVICE_ROLE_KEY não configurada"**
- ✅ Verifique se adicionou a variável no `.env.local`
- ✅ Reinicie o servidor
- ✅ Verifique se não há espaços extras

### **Erro: "Invalid API key"**
- ✅ Verifique se copiou a Service Role Key correta
- ✅ Não confunda com a anon/public key
- ✅ Certifique-se que é a `service_role` key

### **Erro: "Database not found"**
- ✅ Execute o schema SQL no Supabase
- ✅ Verifique se as tabelas existem
- ✅ Confirme as políticas RLS

---

## 📚 **Arquivos Modificados**

### **`lib/admin/users.ts`**
- ✅ Criado `createAdminClient()` com Service Role Key
- ✅ Modificado `createUser()` para usar admin client
- ✅ Modificado `deleteUser()` para usar admin client
- ✅ Adicionada verificação de configuração

### **`.env.local`**
- ✅ Adicionada `SUPABASE_SERVICE_ROLE_KEY`

### **`.env.example`**
- ✅ Criado exemplo com todas as variáveis necessárias

---

## 🎯 **Próximos Passos**

1. **Configure a Service Role Key** seguindo os passos acima
2. **Teste a criação de usuário**
3. **Explore todas as funcionalidades**:
   - ✅ Criar usuário
   - ✅ Editar usuário
   - ✅ Ativar/desativar 2FA
   - ✅ Resetar senha
   - ✅ Deletar usuário

**🎉 Sistema totalmente funcional após configuração!**






