import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugCpfSearch() {
  const supabase = createServiceClient();
  const testCpf = '13017905756';
  
  console.log(`🔍 Debugging CPF search for: "${testCpf}"`);

  // 1. Buscar na tabela athletes
  const { data: athlete, error: athleteErr } = await supabase
    .from('athletes')
    .select('full_name, document_number')
    .eq('document_number', testCpf)
    .maybeSingle();

  if (athleteErr) {
    console.error('❌ Error in athletes table:', athleteErr);
  } else {
    console.log('Athlete result:', athlete || 'NOT FOUND');
  }

  // 2. Buscar na tabela ai_usage
  const { data: usage, error: usageErr } = await supabase
    .from('ai_usage')
    .select('full_name, cpf')
    .eq('cpf', testCpf)
    .maybeSingle();

  if (usageErr) {
    console.error('❌ Error in ai_usage table:', usageErr);
  } else {
    console.log('AI Usage result:', usage || 'NOT FOUND');
  }
}

debugCpfSearch();
