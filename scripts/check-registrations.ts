/**
 * Verifica inscrições no banco de dados.
 * Uso: npx tsx scripts/check-registrations.ts
 */

import { config } from 'dotenv'
import pg from 'pg'

config({ path: '.env.local' })

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL não configurada no .env.local')
    process.exit(1)
  }

  const client = new pg.Client({ connectionString: url })

  try {
    await client.connect()
    console.log('Conectado ao banco.\n')

    // Contar por status
    const countRes = await client.query(`
      SELECT r.status, COUNT(*) as total
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE e.year = 2026
      GROUP BY r.status
      ORDER BY total DESC
    `)
    console.log('=== Inscrições por status (evento 2026) ===')
    console.table(countRes.rows)

    // Listar confirmadas (as que aparecem na lista pública)
    const listRes = await client.query(`
      SELECT r.id, r.registration_number, r.status, a.full_name, c.name as category
      FROM registrations r
      JOIN athletes a ON r.athlete_id = a.id
      JOIN categories c ON r.category_id = c.id
      JOIN events e ON r.event_id = e.id
      WHERE e.year = 2026
      ORDER BY r.registered_at DESC
      LIMIT 50
    `)
    console.log('\n=== Últimas 50 inscrições (todas) ===')
    console.table(listRes.rows)

    const confirmed = listRes.rows.filter(
      (r: any) => ['confirmed', 'confirmado'].includes((r.status || '').toLowerCase())
    )
    console.log(`\nDessas, ${confirmed.length} estão confirmadas (aparecem na lista pública).`)
  } catch (err: any) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
