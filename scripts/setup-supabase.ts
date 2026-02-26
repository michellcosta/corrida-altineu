/**
 * Script de configuração do Supabase
 * - Cria o bucket 'media' se não existir
 * - As migrations SQL devem ser executadas manualmente no Dashboard
 *
 * Uso: npx tsx scripts/setup-supabase.ts
 * Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function main() {
  console.log('Configurando Supabase...\n')

  // 1. Criar bucket media
  const { data: buckets } = await supabase.storage.listBuckets()
  const hasMedia = buckets?.some((b) => b.name === 'media')

  if (!hasMedia) {
    const { error } = await supabase.storage.createBucket('media', {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/*', 'application/pdf'],
    })
    if (error) {
      console.error('Erro ao criar bucket media:', error.message)
      process.exit(1)
    }
    console.log('✓ Bucket "media" criado (público, 10MB, imagens e PDF)')
  } else {
    console.log('✓ Bucket "media" já existe')
  }

  console.log('\n--- Próximos passos ---')
  console.log('1. Execute as migrations SQL no Supabase Dashboard > SQL Editor:')
  console.log('   - supabase/migrations/20250225000000_add_kit_picked_at.sql')
  console.log('   - supabase/migrations/20250225000001_regulations_table.sql')
  console.log('   - supabase/migrations/20250225000002_email_templates.sql')
  console.log('   - supabase/migrations/20250225100000_storage_media_bucket.sql')
  console.log('\n2. As políticas de Storage (última migration) permitem:')
  console.log('   - Admins fazer upload em media')
  console.log('   - Leitura pública para servir arquivos no site')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
