import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugAthlete() {
  const supabase = createServiceClient();
  
  console.log('🔍 Listing columns for "athletes" table...');

  // 1. Try to get one athlete to see columns
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error fetching athlete:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Found an athlete. Columns:');
    console.log(Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log('❌ No athletes found in the table.');
  }
}

debugAthlete();
