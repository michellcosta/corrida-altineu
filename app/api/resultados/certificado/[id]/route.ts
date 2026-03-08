import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/serverClient'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'certificados', 'template-macuco.png')

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

function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(String(dateStr).slice(0, 10))
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getFaixaEtaria(age: number | null): string {
  if (age == null) return '-'
  if (age >= 60) return '60+ anos'
  if (age >= 50) return '50-59 anos'
  if (age >= 40) return '40-49 anos'
  if (age >= 30) return '30-39 anos'
  if (age >= 20) return '20-29 anos'
  return '-'
}

function getAge(birthDate: string | null | undefined, cutoffYear: number): number | null {
  if (!birthDate) return null
  const str = String(birthDate).slice(0, 10)
  const match = str.match(/^(\d{4})-\d{2}-\d{2}$/)
  if (!match) return null
  return cutoffYear - parseInt(match[1], 10)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 })
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
          category:categories(name, slug)
        )
      `
      )
      .eq('id', id)
      .eq('disqualified', false)
      .single()

    if (error || !result) {
      return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 404 })
    }

    type EventRow = { year?: number; edition?: number; race_date?: string; city?: string; state?: string }
    type RegRow = {
      athlete?: { full_name?: string; birth_date?: string; gender?: string }
      category?: { name?: string; slug?: string }
    }

    const event = (result as { events?: EventRow }).events
    const reg = (result as { registration?: RegRow }).registration
    const athlete = reg?.athlete
    const category = reg?.category

    const year = event?.year ?? new Date().getFullYear()
    const age = getAge(athlete?.birth_date, year)
    const faixa = getFaixaEtaria(age)
    const seconds = parseNetTimeToSeconds((result as { net_time?: string }).net_time)
    const tempoStr = seconds != null ? formatNetTime(seconds) : '-'
    const dataStr = formatDateBR(event?.race_date)
    const city = event?.city ?? 'Macuco'
    const state = event?.state ?? 'RJ'
    const nome = athlete?.full_name ?? 'Atleta'
    const categoria = category?.name ?? 'Geral 10K'
    const posicao = (result as { position_overall?: number }).position_overall ?? 0

    const headersList = await headers()
    const host = headersList.get('host') || ''
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : 'https://corridamacuco.com.br')
    const validationUrl = `${baseUrl}/resultados/validar?id=${id}`

    const qrDataUrl = await QRCode.toDataURL(validationUrl, {
      width: 120,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    })

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const w = doc.internal.pageSize.getWidth()
    const h = doc.internal.pageSize.getHeight()

    const hasTemplate = fs.existsSync(TEMPLATE_PATH)

    // Imagem de fundo (template)
    if (hasTemplate) {
      const imgBase64 = fs.readFileSync(TEMPLATE_PATH, { encoding: 'base64' })
      doc.addImage(imgBase64, 'PNG', 0, 0, w, h)
    } else {
      // Fallback: fundo simples se template não existir
      doc.setFillColor(250, 250, 250)
      doc.rect(0, 0, w, h, 'F')
    }

    // Textos sobrepostos na área central
    doc.setTextColor(0, 0, 0)

    // Título
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('CORRIDA RÚSTICA DE MACUCO', w / 2, 48, { align: 'center' })
    doc.setFontSize(16)
    doc.text('CERTIFICADO DE PARTICIPAÇÃO', w / 2, 56, { align: 'center' })

    // Nome do atleta
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(nome.toUpperCase(), w / 2, 72, { align: 'center' })

    // Texto do certificado
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const texto1 = `Certificamos que ${nome} participou da Corrida Rústica de Macuco, realizada em ${dataStr}, na cidade de ${city} - ${state}, concluindo o percurso de 10 km, demonstrando espírito esportivo, superação e dedicação.`
    const texto2 = 'Parabenizamos pela conquista e desejamos sucesso em seus próximos desafios.'
    doc.text(texto1, 30, 88, { maxWidth: w - 100, align: 'center' })
    doc.text(texto2, w / 2, 98, { align: 'center' })

    // Barra de desempenho (na área branca)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Distância', 45, 118)
    doc.text('Tempo', 95, 118)
    doc.text('Colocação', 145, 118)
    doc.text('Categoria', 195, 118)

    doc.setFont('helvetica', 'normal')
    doc.text('10 km', 45, 124)
    doc.text(tempoStr, 95, 124)
    doc.text(`${posicao}º Lugar`, 145, 124)
    doc.text(categoria, 195, 124)

    // QR Code (canto direito da área branca)
    doc.addImage(qrDataUrl, 'PNG', w - 50, 75, 40, 40)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('VALIDAÇÃO', w - 30, 120)
    doc.text('ONLINE', w - 30, 125)

    // Rodapé (data e local)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`${city} - ${state}, ${dataStr}`, w / 2, h - 15, { align: 'center' })

    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="certificado-${nome.replace(/\s+/g, '-')}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Erro ao gerar certificado:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao gerar certificado' },
      { status: 500 }
    )
  }
}
