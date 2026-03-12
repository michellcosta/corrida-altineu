/**
 * Importa resultados da 50ª Corrida Rústica de Macuco do Esporte Corrida
 *
 * Uso: npx tsx scripts/import-resultados-50a.ts
 * Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 *
 * - Busca dados das URLs M e F
 * - Exclui idade 0
 * - Categorias: Geral 10K (idade < 60), 60+ 10K (idade >= 60)
 * - Armazena URL do certificado do Esporte Corrida
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

config({ path: '.env.local' })

const URL_M = 'https://esportecorrida.com.br/v1/ver_resultado.php?a=MTBLIE1BU0NVTElOTw==&b=MTc4Mw=='
const URL_F = 'https://esportecorrida.com.br/v1/ver_resultado.php?a=MTBLIEZFTUlOSU5P&b=MTc4Mw=='

const RACE_DATE = '2025-06-24'
const CUTOFF_YEAR = 2025

type RawRow = {
  certificateUrl: string
  coloc: number
  bib: number
  name: string
  gender: 'M' | 'F'
  age: number
  team: string
  netTime: string
}

function parseTime(s: string): string {
  const t = String(s).trim()
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(t)) return t
  if (/^\d{1,2}:\d{2}$/.test(t)) return `0:${t}`
  return t
}

const CERT_BASE = 'https://esportecorrida.com.br/v1/'

async function fetchAndParse(url: string, gender: 'M' | 'F'): Promise<RawRow[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CorridaMacuco/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  const html = await res.text()
  const $ = cheerio.load(html)
  const rows: RawRow[] = []

  $('table tr').each((_, el) => {
    const $row = $(el)
    const tds = $row.find('td')
    if (tds.length < 10) return
    const certLink = $row.find('a[href*="certificado"]').first().attr('href')
    const certUrl = certLink
      ? certLink.startsWith('http')
        ? certLink
        : `${CERT_BASE}${certLink.startsWith('/') ? certLink.slice(1) : certLink}`
      : ''
    const texts = tds.map((_, t) => $(t).text().trim()).get()
    const coloc = parseInt(texts[1] || '0', 10)
    const bib = parseInt(texts[2] || '0', 10)
    const name = (texts[3] || '').trim()
    const age = parseInt(texts[5] || '0', 10)
    const team = (texts[8] || '').trim()
    const netTime = parseTime(texts[12] || texts[11] || texts[texts.length - 1] || '')
    if (!name || !netTime || isNaN(bib)) return
    rows.push({ certificateUrl: certUrl, coloc, bib, name, gender, age, team, netTime })
  })

  return rows
}

function netTimeToSeconds(t: string): number {
  const parts = t.split(':').map((p) => parseInt(p, 10))
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

function formatNetTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  console.log('Buscando dados do Esporte Corrida...')
  const [rowsM, rowsF] = await Promise.all([
    fetchAndParse(URL_M, 'M'),
    fetchAndParse(URL_F, 'F'),
  ])

  const allRaw = [...rowsM, ...rowsF]
  const filtered = allRaw.filter((r) => r.age > 0)
  const excluded = allRaw.length - filtered.length
  if (excluded > 0) {
    console.log(`Excluídos ${excluded} registros com idade 0`)
  }

  const geral = filtered.filter((r) => r.age < 60).sort((a, b) => netTimeToSeconds(a.netTime) - netTimeToSeconds(b.netTime))
  const sessenta = filtered.filter((r) => r.age >= 60).sort((a, b) => netTimeToSeconds(a.netTime) - netTimeToSeconds(b.netTime))

  console.log(`Geral 10K: ${geral.length} | 60+ 10K: ${sessenta.length}`)

  const eventPayload = {
    year: 2025,
    edition: 50,
    race_date: RACE_DATE,
    age_cutoff_date: '2025-12-31',
    location: 'Praça da Matriz',
    city: 'Macuco',
    state: 'RJ',
    registrations_open: false,
    slots_geral: 500,
    slots_morador: 0,
    slots_60plus: 100,
    slots_infantil: 300,
    price_geral: 22,
  }

  const { data: existingEvent } = await supabase.from('events').select('id').eq('year', 2025).single()
  let eventId: string

  if (existingEvent) {
    eventId = existingEvent.id
    console.log('Evento 2025 já existe, usando existente')
  } else {
    const { data: newEvent, error: evErr } = await supabase.from('events').insert(eventPayload).select('id').single()
    if (evErr) {
      console.error('Erro ao criar evento:', evErr)
      process.exit(1)
    }
    eventId = newEvent!.id
    console.log('Evento 2025 criado')
  }

  const catPayloads = [
    { slug: 'geral-10k', name: 'Geral 10K', distance: '10km', min_age: 15, max_age: 59, age_rule: '15 a 59 anos' },
    { slug: '60-mais-10k', name: '60+ 10K', distance: '10km', min_age: 60, max_age: null, age_rule: '60 anos ou mais' },
  ]

  const categoryIds: Record<string, string> = {}
  for (const c of catPayloads) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('event_id', eventId)
      .eq('slug', c.slug)
      .single()
    if (existing) {
      categoryIds[c.slug] = existing.id
    } else {
      const { data: inserted, error } = await supabase
        .from('categories')
        .insert({ event_id: eventId, ...c })
        .select('id')
        .single()
      if (error) {
        console.error('Erro ao criar categoria:', c.slug, error)
        process.exit(1)
      }
      categoryIds[c.slug] = inserted!.id
    }
  }

  const athleteCache = new Map<string, string>()
  const insertAthlete = async (row: RawRow): Promise<string> => {
    const key = `${row.name}|${row.bib}|${row.gender}`
    if (athleteCache.has(key)) return athleteCache.get(key)!
    const birthYear = CUTOFF_YEAR - row.age
    const birthDate = `${birthYear}-01-01`
    const { data: existing } = await supabase
      .from('athletes')
      .select('id')
      .eq('full_name', row.name)
      .eq('birth_date', birthDate)
      .eq('gender', row.gender)
      .limit(1)
      .single()
    if (existing) {
      athleteCache.set(key, existing.id)
      return existing.id
    }
    const { data: inserted, error } = await supabase
      .from('athletes')
      .insert({
        full_name: row.name,
        email: `import-50a-${row.bib}@macuco.local`,
        birth_date: birthDate,
        gender: row.gender,
        team_name: row.team || null,
      })
      .select('id')
      .single()
    if (error) {
      console.error('Erro ao criar atleta:', row.name, error)
      throw error
    }
    athleteCache.set(key, inserted!.id)
    return inserted!.id
  }

  const BATCH_SIZE = 50
  const processCategory = async (slug: string, rows: RawRow[]) => {
    const catId = categoryIds[slug]
    let posCat = 0
    const byGender: Record<string, number> = { M: 0, F: 0 }
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE)
      const regs: { athleteId: string; row: RawRow; regNum: string; posCat: number; posGen: number }[] = []
      for (const row of batch) {
        posCat++
        byGender[row.gender]++
        const athleteId = await insertAthlete(row)
        regs.push({
          athleteId,
          row,
          regNum: `2025-${slug === 'geral-10k' ? 'GERAL' : '60+'}-${String(posCat).padStart(4, '0')}`,
          posCat,
          posGen: byGender[row.gender],
        })
      }
      const { data: insertedRegs, error: regErr } = await supabase
        .from('registrations')
        .insert(
          regs.map((r) => ({
            event_id: eventId,
            category_id: catId,
            athlete_id: r.athleteId,
            bib_number: r.row.bib,
            status: 'confirmed',
            payment_status: 'free',
            registration_number: r.regNum,
          }))
        )
        .select('id')
      if (regErr) {
        console.error('Erro ao criar inscrições:', regErr)
        continue
      }
      const resultsData = (insertedRegs || []).map((reg, idx) => {
        const r = regs[idx]
        const netSeconds = netTimeToSeconds(r.row.netTime)
        return {
          registration_id: reg.id,
          event_id: eventId,
          category_id: catId,
          bib_number: r.row.bib,
          net_time: formatNetTime(netSeconds),
          position_overall: r.posCat,
          position_category: r.posCat,
          position_gender: r.posGen,
          certificate_url: r.row.certificateUrl || null,
        }
      })
      const { error: resErr } = await supabase.from('results').insert(resultsData)
      if (resErr) console.error('Erro ao criar resultados:', resErr)
    }
  }

  const { data: existingResults } = await supabase
    .from('results')
    .select('id')
    .eq('event_id', eventId)
    .limit(1)
  if (existingResults && existingResults.length > 0) {
    console.log('Resultados já existem para 2025. Para reimportar, delete os registros manualmente.')
    process.exit(0)
  }

  console.log('Inserindo Geral 10K...')
  await processCategory('geral-10k', geral)
  console.log('Inserindo 60+ 10K...')
  await processCategory('60-mais-10k', sessenta)

  console.log('\nImportação concluída.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
