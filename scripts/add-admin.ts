/**
 * Script para adicionar um usuário como SITE_ADMIN
 *
 * Uso: npx tsx scripts/add-admin.ts <user_id>
 *
 * Requer: SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const userId = process.argv[2]
if (!userId) {
  console.error('Uso: npx tsx scripts/add-admin.ts <user_id>')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

async function main() {
  const supabase = createClient(url!, serviceKey!, { auth: { persistSession: false } })

  // Buscar email e nome do usuário no Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
  if (authError || !authUser?.user) {
    console.error('Usuário não encontrado no Auth:', authError?.message || 'ID inválido')
    process.exit(1)
  }

  const email = authUser.user.email!
  const name = authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || email.split('@')[0]

  const { error } = await supabase.from('admin_users').insert({
    user_id: userId,
    name,
    email,
    role: 'SITE_ADMIN',
  })

  if (error) {
    console.error('Erro ao inserir admin:', error.message)
    process.exit(1)
  }

  console.log(`Admin criado: ${name} (${email})`)
}

main()
