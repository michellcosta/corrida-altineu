import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/serverClient'

export const dynamic = 'force-dynamic'

function parseNetTimeToSeconds(netTime: string | null | undefined): number | null {
  if (!netTime) return null
  const s = String(netTime).trim()
  const m = s.match(/^(\d+):(\d{2}):(\d{2})$/)
  if (m) return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10)
  const m2 = s.match(/^(\d+):(\d{2})$/)
  if (m2) return parseInt(m2[1], 10) * 60 + parseInt(m2[2], 10)
  return null
}

function formatNetTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()

    if (!id) {
      return NextResponse.json({ error: 'ID não informado', valid: false }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: result, error } = await supabase
      .from('results')
      .select(
        `
        id, bib_number, net_time, position_overall, position_category, position_gender,
        events(year, edition, race_date, city, state),
        registration:registrations(
          athlete:athletes(full_name, birth_date, gender),
          category:categories(name)
        )
      `
      )
      .eq('id', id)
      .eq('disqualified', false)
      .single()

    if (error || !result) {
      return NextResponse.json({ error: 'Certificado não encontrado', valid: false }, { status: 404 })
    }

    type EventRow = { year?: number; edition?: number; race_date?: string; city?: string; state?: string }
    type RegRow = {
      athlete?: { full_name?: string; birth_date?: string; gender?: string }
      category?: { name?: string }
    }

    const event = (result as { events?: EventRow }).events
    const reg = (result as { registration?: RegRow }).registration
    const athlete = reg?.athlete
    const category = reg?.category

    const seconds = parseNetTimeToSeconds((result as { net_time?: string }).net_time)
    const tempoStr = seconds != null ? formatNetTime(seconds) : '-'

    return NextResponse.json({
      valid: true,
      data: {
        nome: athlete?.full_name ?? '-',
        bib: (result as { bib_number?: number }).bib_number,
        tempo: tempoStr,
        posicao: (result as { position_overall?: number }).position_overall,
        categoria: category?.name ?? '-',
        ano: event?.year,
        edicao: event?.edition,
        data: event?.race_date,
        cidade: event?.city ?? 'Macuco',
        estado: event?.state ?? 'RJ',
      },
    })
  } catch (err) {
    console.error('Erro ao validar certificado:', err)
    return NextResponse.json(
      { error: 'Erro ao validar', valid: false },
      { status: 500 }
    )
  }
}
