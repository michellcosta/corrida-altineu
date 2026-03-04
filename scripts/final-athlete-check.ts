import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function finalAthleteCheck() {
  const supabase = createServiceClient();
  const testCpf = '13017905756';
  
  console.log(`🔍 Checking EXACT document_number in athletes table for: "${testCpf}"`);

  // 1. Buscar com filtro exato
  const { data: athletes, error } = await supabase
    .from('athletes')
    .select('full_name, document_number')
    .eq('document_number', testCpf);

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log(`Found ${athletes?.length || 0} matches.`);
    athletes?.forEach((a, i) => {
      console.log(`${i+1}. Name: "${a.full_name}", Doc: "${a.document_number}"`);
    });
  }

  // 2. Buscar com LIKE para ver se há espaços ou caracteres invisíveis
  console.log(`\n🔍 Checking with LIKE for: "%${testCpf}%"`);
  const { data: athletesLike } = await supabase
    .from('athletes')
    .select('full_name, document_number')
    .ilike('document_number', `%${testCpf}%`);
  
  athletesLike?.forEach((a, i) => {
    console.log(`${i+1}. Name: "${a.full_name}", Doc: "${a.document_number}"`);
  });
}

finalAthleteCheck();
