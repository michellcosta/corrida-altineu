import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321', // Use actual env vars via dotenv if needed, or I'll run it in the project env
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
)

async function testQuery() {
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('year', 2026)
        .single()

    if (!event) {
        console.log('Event not found')
        return
    }

    // Try finding by full_name matching 'MICHELL COSTA DE OLIVEIRA'
    const { data: athletes } = await supabase
        .from('athletes')
        .select('id, full_name, document_number')
        .ilike('full_name', '%MICHELL%')

    console.log('Found Athletes:', athletes)

    if (athletes && athletes.length > 0) {
        const athleteIds = athletes.map(a => a.id)
        const { data: regByAthlete } = await supabase
            .from('registrations')
            .select('id, status, confirmation_code, registration_number, categories(name), athletes(full_name, document_number)')
            .eq('event_id', event.id)
            .in('athlete_id', athleteIds)

        console.log('Found Registrations:', JSON.stringify(regByAthlete, null, 2))
    }
}

testQuery()
