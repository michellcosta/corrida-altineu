import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugTable() {
  const supabase = createServiceClient();
  
  console.log('🔍 Listing columns for "registrations" table...');

  // 1. Try to get one registration to see columns
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error fetching registration:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Found a registration. Columns:');
    console.log(Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log('❌ No registrations found in the table.');
  }
}

debugTable();
