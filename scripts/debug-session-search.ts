import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugSessionSearch() {
  const supabase = createServiceClient();
  const testCpf = '13017905756';
  
  console.log(`🔍 Debugging session search for CPF: "${testCpf}"`);

  // 1. Buscar o evento de 2026
  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('year', 2026)
    .single();

  if (!event) {
    console.error('❌ Event 2026 not found');
    return;
  }
  console.log(`✅ Event found: ID ${event.id}`);

  // 2. Buscar atletas com esse documento
  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, full_name')
    .eq('document_number', testCpf);

  console.log(`Athletes found: ${athletes?.length || 0}`);
  if (!athletes || athletes.length === 0) return;

  const athleteIds = athletes.map(a => a.id);
  console.log('Athlete IDs:', athleteIds);

  // 3. Buscar inscrições para este evento e estes atletas
  const { data: regs, error: regErr } = await supabase
    .from('registrations')
    .select('id, status, confirmation_code, registration_number, categories(name), athletes(full_name)')
    .eq('event_id', event.id)
    .in('athlete_id', athleteIds);

  if (regErr) {
    console.error('❌ Error in registrations query:', regErr);
  } else {
    console.log(`Registrations found: ${regs?.length || 0}`);
    regs?.forEach((r, i) => {
      console.log(`${i+1}. Status: ${r.status}, Number: ${r.registration_number}, Athlete: ${(r.athletes as any)?.full_name}`);
    });
  }
}

debugSessionSearch();
