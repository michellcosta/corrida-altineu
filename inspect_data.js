const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectData() {
  console.log('Searching for event 2026...')
  const { data: event } = await supabase
    .from('events')
    .select('id, price_geral')
    .eq('year', 2026)
    .single()

  console.log('Event Info:', event)

  console.log('--- Categories ---')
  const { data: cats } = await supabase
    .from('categories')
    .select('id, name, slug, price, is_free')
    .eq('event_id', event.id)
  
  console.table(cats)

  console.log('--- Registrations (Confirmed) ---')
  const { data: regs } = await supabase
    .from('registrations')
    .select('id, registration_number, payment_amount, status, payment_status, category_id')
    .eq('event_id', event.id)
    .in('status', ['confirmed', 'paid'])

  console.table(regs)
}

inspectData()
