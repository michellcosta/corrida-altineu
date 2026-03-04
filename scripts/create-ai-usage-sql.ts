import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createTableSQL() {
  const supabase = createServiceClient();
  
  console.log('🚀 Attempting to create "ai_usage" table via RPC...');

  const sql = `
    CREATE TABLE IF NOT EXISTS public.ai_usage (
      cpf TEXT PRIMARY KEY,
      full_name TEXT,
      message_count INT DEFAULT 0,
      last_message_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable all for service role" ON public.ai_usage;
    CREATE POLICY "Enable all for service role" ON public.ai_usage USING (true) WITH CHECK (true);
  `;

  // Tentar rodar via uma função RPC genérica se o usuário tiver uma (comum em setups Supabase)
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error creating table via RPC:', error.message);
    console.log('\n⚠️ ACTION REQUIRED:');
    console.log('The table "ai_usage" could not be created automatically.');
    console.log('Please go to your Supabase Dashboard -> SQL Editor and run this:');
    console.log(sql);
  } else {
    console.log('✅ Table "ai_usage" created successfully via RPC!');
  }
}

createTableSQL();
