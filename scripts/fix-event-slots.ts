/**
 * Script para corrigir slots do evento diretamente no Supabase.
 * Use se a API não estiver persistindo as alterações.
 *
 * Uso: npx tsx scripts/fix-event-slots.ts
 * Requer: SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no .env.local
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

async function main() {
  const year = 2026
  const { data: before, error: errBefore } = await supabase
    .from('events')
    .select('id, year, slots_geral, slots_morador, slots_60plus, slots_infantil')
    .eq('year', year)
    .single()

  if (errBefore || !before) {
    console.error('Evento não encontrado:', errBefore?.message)
    process.exit(1)
  }

  console.log('Valores atuais:', before)

  const { data: updated, error: errUpdate } = await supabase
    .from('events')
    .update({
      slots_geral: 1000,
      slots_morador: 300,
      slots_60plus: 300,
      slots_infantil: 200,
    })
    .eq('year', year)
    .select('id, year, slots_geral, slots_morador, slots_60plus, slots_infantil')
    .single()

  if (errUpdate) {
    console.error('Erro ao atualizar:', errUpdate.message)
    process.exit(1)
  }

  console.log('Valores após update:', updated)
  console.log('OK - slots atualizados.')
}

main()
