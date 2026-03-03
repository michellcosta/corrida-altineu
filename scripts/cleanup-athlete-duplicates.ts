import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function cleanupDuplicates() {
  const supabase = createServiceClient();
  const targetDoc = '13017905756';
  
  console.log(`🧹 Cleaning up duplicates for document: ${targetDoc}`);

  // 1. Find all athletes with this document
  const { data: athletes, error: athleteErr } = await supabase
    .from('athletes')
    .select('id, created_at')
    .eq('document_number', targetDoc);

  if (athleteErr) {
    console.error('Error fetching athletes:', athleteErr);
    return;
  }

  if (!athletes || athletes.length <= 1) {
    console.log('No duplicates found or only one record exists.');
    return;
  }

  console.log(`Found ${athletes.length} athlete records.`);

  // 2. Identify which ones have registrations
  const athleteIds = athletes.map(a => a.id);
  const { data: regs, error: regErr } = await supabase
    .from('registrations')
    .select('athlete_id, event_id, events(year)')
    .in('athlete_id', athleteIds);

  if (regErr) {
    console.error('Error fetching registrations:', regErr);
    return;
  }

  const athleteIdsWithRegs = new Set(regs?.map(r => r.athlete_id));
  console.log(`Athletes with registrations: ${athleteIdsWithRegs.size}`);

  // 3. Decide which one to keep
  // Priority: 
  // a) The one with a 2026 registration
  // b) The one with any registration
  // c) The most recently created one
  
  let idToKeep: string | null = null;
  
  // Try to find the one with a 2026 registration
  const reg2026 = regs?.find(r => (r.events as any)?.year === 2026);
  if (reg2026) {
    idToKeep = reg2026.athlete_id;
    console.log(`Keeping athlete ID ${idToKeep} (has 2026 registration)`);
  } else if (athleteIdsWithRegs.size > 0) {
    idToKeep = Array.from(athleteIdsWithRegs)[0];
    console.log(`Keeping athlete ID ${idToKeep} (has some registration)`);
  } else {
    // Keep the most recent one
    const sorted = [...athletes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    idToKeep = sorted[0].id;
    console.log(`Keeping athlete ID ${idToKeep} (most recent)`);
  }

  // 4. Delete the others
  const idsToDelete = athleteIds.filter(id => id !== idToKeep);
  
  if (idsToDelete.length > 0) {
    console.log(`Deleting ${idsToDelete.length} duplicate records...`);
    
    // Note: This might fail if there are foreign key constraints in other tables (like old registrations)
    // We'll try to delete them one by one or in bulk
    const { error: deleteErr } = await supabase
      .from('athletes')
      .delete()
      .in('id', idsToDelete);

    if (deleteErr) {
      console.error('❌ Error during deletion:', deleteErr.message);
      console.log('Hint: Some records might be linked to old registrations from other years.');
    } else {
      console.log('✅ Successfully removed duplicates.');
    }
  }
}

cleanupDuplicates();
