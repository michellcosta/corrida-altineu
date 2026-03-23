import { NextRequest, NextResponse } from 'next/server'
import municipiosData from '@/data/municipios-ibge.json'

const data = municipiosData as Record<string, string[]>

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const uf = searchParams.get('uf')?.toUpperCase()?.trim()

  if (!uf || uf.length !== 2) {
    return NextResponse.json({ error: 'UF inválida' }, { status: 400 })
  }

  const municipios = data[uf]
  if (!municipios) {
    return NextResponse.json({ error: 'UF não encontrada' }, { status: 404 })
  }

  return NextResponse.json({ data: municipios })
}
