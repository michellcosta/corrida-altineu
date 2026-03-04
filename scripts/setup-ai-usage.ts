import { createServiceClient } from '@/lib/supabase/serverClient';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function setupAiUsageTable() {
  const supabase = createServiceClient();
  
  console.log('🚀 Setting up "ai_usage" table...');

  // Como não posso rodar SQL direto via SDK para criar tabelas, 
  // vou verificar se ela existe e, se não, instruir o usuário ou tentar usar RPC se disponível.
  // No Supabase, o ideal é criar via SQL Editor:
  /*
  create table if not exists public.ai_usage (
    cpf text primary key,
    full_name text,
    message_count int default 0,
    last_message_at timestamptz default now(),
    created_at timestamptz default now()
  );
  alter table public.ai_usage enable row level security;
  */

  const { error } = await supabase
    .from('ai_usage')
    .select('cpf')
    .limit(1);

  if (error && error.code === '42P01') {
    console.error('❌ Table "ai_usage" does not exist.');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log(`
      create table public.ai_usage (
        cpf text primary key,
        full_name text,
        message_count int default 0,
        last_message_at timestamptz default now(),
        created_at timestamptz default now()
      );
      alter table public.ai_usage enable row level security;
      create policy "Enable all for service role" on public.ai_usage using (true) with check (true);
    `);
  } else {
    console.log('✅ Table "ai_usage" is ready or accessible.');
  }
}

setupAiUsageTable();
