import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function finalDebug() {
  const supabase = createServiceClient();
  const testDoc = '13017905756';
  const testCode = 'V567Z5CX';
  
  console.log('--- STEP 1: Check Event ---');
  const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single();
  console.log('Event 2026 ID:', event?.id);

  if (!event) return;

  console.log('\n--- STEP 2: Search Athlete by Document ---');
  const { data: athlete, error: authErr } = await supabase
    .from('athletes')
    .select('id, full_name, document_number')
    .eq('document_number', testDoc)
    .maybeSingle();
  
  console.log('Athlete search result:', athlete || 'NOT FOUND');
  if (authErr) console.error('Error:', authErr);

  if (athlete) {
    console.log('\n--- STEP 3: Search Registration for this Athlete ---');
    const { data: reg, error: regErr } = await supabase
      .from('registrations')
      .select('id, status, confirmation_code, registration_number')
      .eq('event_id', event.id)
      .eq('athlete_id', athlete.id)
      .maybeSingle();
    
    console.log('Registration search result:', reg || 'NOT FOUND');
    if (regErr) console.error('Error:', regErr);
  }

  console.log('\n--- STEP 4: Search Registration by Code Directly ---');
  const { data: regByCode, error: codeErr } = await supabase
    .from('registrations')
    .select('id, status, confirmation_code, registration_number')
    .eq('event_id', event.id)
    .or(`confirmation_code.eq.${testCode},registration_number.eq.${testCode}`)
    .maybeSingle();

  console.log('Registration by code result:', regByCode || 'NOT FOUND');
  if (codeErr) console.error('Error:', codeErr);
}

finalDebug();
