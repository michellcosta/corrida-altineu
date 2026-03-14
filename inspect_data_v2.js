const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectData() {
  const { data: event } = await supabase
    .from('events')
    .select('id, year, price_geral')
    .eq('year', 2026)
    .single()

  console.log('Event:', JSON.stringify(event, null, 2))

  const { data: cats } = await supabase
    .from('categories')
    .select('id, name, slug, price, is_free')
    .eq('event_id', event.id)
  
  console.log('Categories:', JSON.stringify(cats, null, 2))

  const { data: regs } = await supabase
    .from('registrations')
    .select('id, registration_number, payment_amount, status, payment_status, category_id')
    .eq('event_id', event.id)
    .in('status', ['confirmed', 'paid'])

  console.log('Registrations:', JSON.stringify(regs, null, 2))
}

inspectData()
