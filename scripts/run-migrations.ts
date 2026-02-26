/**
 * Executa as migrations SQL no Supabase.
 *
 * Uso: npx tsx scripts/run-migrations.ts
 *
 * Requer: DATABASE_URL no .env.local
 * Obtenha em: Supabase Dashboard > Project Settings > Database > Connection string (URI)
 * Use a connection string "Transaction" ou "Session" (modo pooler).
 */

import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

config({ path: '.env.local' })

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations')
const RUN_ALL = 'RUN_ALL.sql'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL não configurada no .env.local')
    console.error('Obtenha em: Supabase Dashboard > Project Settings > Database > Connection string (URI)')
    process.exit(1)
  }

  const client = new pg.Client({ connectionString: url })

  try {
    await client.connect()
    console.log('Conectado ao banco. Executando RUN_ALL.sql...\n')

    const sql = readFileSync(join(MIGRATIONS_DIR, RUN_ALL), 'utf-8')
    await client.query(sql)
    console.log(`✓ ${RUN_ALL}`)
    console.log('\nMigrations concluídas.')
  } catch (err: any) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
