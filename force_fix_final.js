const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function forceUpdate() {
  console.log('--- FORCING PRICE UPDATE TO 22.00 ---')
  
  // 1. Get Event ID
  const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
  if (!event) { console.error('Event 2026 not found'); process.exit(1); }
  const eventId = event.id
  console.log(`Event ID: ${eventId}`)

  // 2. Update Categories (Specifically 'geral-10k')
  console.log('Updating category geral-10k price to 22...')
  const { error: catError } = await supabase
    .from('categories')
    .update({ price: 22 })
    .eq('event_id', eventId)
    .eq('slug', 'geral-10k')
  if (catError) console.error('Error updating category:', catError)

  // 3. Update ALL Registrations for 2026 that have amount = 20 or null (for Geral/Paid)
  console.log('Updating all paid registrations for event 2026 to 22...')
  const { data: regsToFix } = await supabase
    .from('registrations')
    .select('id, category_id')
    .eq('event_id', eventId)
  
  // Only update those that are not free categories (we'll filter in JS to be safe)
  const { data: categories } = await supabase.from('categories').select('id, is_free')
  const freeCatIds = new Set(categories.filter(c => c.is_free).map(c => c.id))

  const idsToUpdate = regsToFix
    .filter(r => !freeCatIds.has(r.category_id))
    .map(r => r.id)

  if (idsToUpdate.length > 0) {
    const { error: regUpdateError } = await supabase
      .from('registrations')
      .update({ payment_amount: 22 })
      .in('id', idsToUpdate)
    
    if (regUpdateError) {
      console.error('Error updating registrations:', regUpdateError)
    } else {
      console.log(`Successfully updated ${idsToUpdate.length} registrations to 22.00.`)
    }
  } else {
    console.log('No registrations found to update.')
  }

  console.log('DONE.')
}

forceUpdate()
