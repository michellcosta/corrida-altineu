# 🔍 Troubleshooting - Login Admin

## ✅ Checklist de Verificação

### 1. Verificar Variáveis de Ambiente
Certifique-se que o arquivo `.env.local` existe e contém:
```env
NEXT_PUBLIC_SUPABASE_URL=https://pgrycfsfojgqaerjwpio.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBncnljZnNmb2pncWFlcmp3cGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTYzNzcsImV4cCI6MjA3NTg5MjM3N30.XuPzsoxVNZ9H25GV0QxzrJjwJXLDcj_0n6OgvCiaQX4
```

**Depois de criar/editar o `.env.local`, SEMPRE reinicie o servidor:**
```bash
# Parar o servidor (Ctrl+C)
npm run dev
```

### 2. Verificar Schema do Supabase
Acesse o Supabase Dashboard e confirme que:

#### Tabela `admin_users` existe:
```sql
SELECT * FROM admin_users;
```

Deve ter pelo menos este registro:
- email: `admin@corrida.com`
- role: `SITE_ADMIN`
- is_active: `true`
- user_id: (UUID do Supabase Auth)

#### Usuário no Supabase Auth existe:
No Dashboard do Supabase:
1. Vá em **Authentication** → **Users**
2. Procure pelo email `admin@corrida.com`
3. Se não existir, crie manualmente:
   - Email: `admin@corrida.com`
   - Password: `senha123`
   - Confirme o email automaticamente

#### Vincular `admin_users` com Auth:
```sql
-- 1. Buscar o UUID do usuário no Auth
SELECT id FROM auth.users WHERE email = 'admin@corrida.com';

-- 2. Atualizar ou criar o registro em admin_users
INSERT INTO admin_users (user_id, name, email, role, is_active)
VALUES ('UUID_AQUI', 'Admin Master', 'admin@corrida.com', 'SITE_ADMIN', true)
ON CONFLICT (user_id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = true;
```

### 3. Testar Conexão Supabase no Console

Abra o Console do Navegador (F12) e cole:

```javascript
// Verificar se as env vars estão carregando
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')

// Testar conexão direta
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://pgrycfsfojgqaerjwpio.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBncnljZnNmb2pncWFlcmp3cGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTYzNzcsImV4cCI6MjA3NTg5MjM3N30.XuPzsoxVNZ9H25GV0QxzrJjwJXLDcj_0n6OgvCiaQX4'
)

// Testar login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@corrida.com',
  password: 'senha123'
})
console.log('Login result:', { data, error })

// Se login OK, buscar perfil
if (data.user) {
  const { data: profile, error: profileError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', data.user.id)
    .single()
  console.log('Profile:', { profile, profileError })
}
```

### 4. Verificar RLS (Row Level Security)

No Supabase SQL Editor, execute:

```sql
-- Ver políticas RLS da tabela admin_users
SELECT * FROM pg_policies WHERE tablename = 'admin_users';

-- Temporariamente DESABILITAR RLS para teste (NÃO USAR EM PRODUÇÃO)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Depois de testar, REABILITAR:
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

Se funcionar com RLS desabilitado, o problema são as políticas. Ajuste assim:

```sql
-- Política para leitura pública de admin_users (autenticado)
CREATE POLICY "Admins autenticados podem ver perfis"
ON admin_users FOR SELECT
TO authenticated
USING (true);

-- Política para inserir (apenas service role)
CREATE POLICY "Service role pode criar admins"
ON admin_users FOR INSERT
TO service_role
WITH CHECK (true);
```

### 5. Logs de Debug

Com o servidor rodando, tente fazer login e observe:

1. **Console do Navegador (F12)** - veja os logs:
   ```
   [auth.ts] Iniciando login para: admin@corrida.com
   [auth.ts] Cliente Supabase criado
   [auth.ts] Resposta do signInWithPassword: { data, error }
   ```

2. **Terminal do Next.js** - pode mostrar erros de servidor

### 6. Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `Invalid login credentials` | Email/senha incorretos ou usuário não confirmado | Confirme o email no Supabase Dashboard |
| `Perfil administrativo não encontrado` | Registro não existe em `admin_users` | Execute o INSERT acima |
| `Your project's URL and Key are required` | `.env.local` não carregou | Reinicie o servidor |
| `JWT expired` | Token expirado | Faça logout e login novamente |
| `row-level security policy violation` | RLS bloqueando | Ajuste as políticas RLS |

### 7. Reset Completo (última opção)

```bash
# 1. Parar o servidor
Ctrl+C

# 2. Limpar cache do Next.js
rm -rf .next
# No Windows: rmdir /s /q .next

# 3. Reinstalar dependências
rm -rf node_modules package-lock.json
# No Windows: rmdir /s /q node_modules && del package-lock.json
npm install

# 4. Recriar .env.local com as credenciais corretas

# 5. Reiniciar
npm run dev
```

---

## 📞 Próximos Passos

Se nada disso resolver:

1. **Copie a mensagem de erro EXATA** do console
2. **Copie os logs** do terminal (desde a linha `[auth.ts]`)
3. **Tire um print** da tela de erro
4. Me envie para investigar o problema específico

---

**Última atualização:** Agora com logs detalhados em `lib/admin/auth.ts` e `app/admin/login/page.tsx`








