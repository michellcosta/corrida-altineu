import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugSearch() {
  const supabase = createServiceClient();
  const searchQuery = 'V567Z5CX';
  
  console.log(`🔍 Debugging search for: "${searchQuery}"`);

  // 1. Get event
  const { data: event } = await supabase
    .from('events')
    .select('id, year')
    .eq('year', 2026)
    .single();

  if (!event) {
    console.error('❌ Event 2026 not found');
    return;
  }
  console.log(`✅ Event found: ID ${event.id}`);

  // 2. Try broad search
  console.log('--- Attempting broad search (all registrations for event) ---');
  const { data: allRegs, error: allErr } = await supabase
    .from('registrations')
    .select('id, document_number, registration_code, status')
    .eq('event_id', event.id)
    .limit(5);

  if (allErr) console.error('Error fetching regs:', allErr);
  else {
    console.log(`Found ${allRegs?.length || 0} registrations. Examples:`);
    allRegs?.forEach(r => console.log(`- ID: ${r.id}, Doc: ${r.document_number}, Code: ${r.registration_code}, Status: ${r.status}`));
  }

  // 3. Try specific search
  console.log(`--- Attempting specific search for "${searchQuery}" ---`);
  const { data: specificReg, error: specErr } = await supabase
    .from('registrations')
    .select('id, document_number, registration_code, status')
    .eq('event_id', event.id)
    .or(`document_number.eq.${searchQuery},registration_code.eq.${searchQuery},registration_code.eq.${searchQuery.toUpperCase()}`)
    .maybeSingle();

  if (specErr) console.error('Error in specific search:', specErr);
  else if (specificReg) {
    console.log('✅ Found specific registration:', specificReg);
  } else {
    console.log('❌ No registration found with that code/doc');
  }
}

debugSearch();
