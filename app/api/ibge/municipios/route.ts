import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Busca municípios do IBGE por UF.
 * GET /api/ibge/municipios?uf=RJ
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uf = searchParams.get('uf')?.toUpperCase()?.trim()

    if (!uf || uf.length !== 2) {
      return NextResponse.json({ error: 'UF inválida' }, { status: 400 })
    }

    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
      { next: { revalidate: 86400 } } // cache 24h
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao buscar municípios' }, { status: 502 })
    }

    const data = await res.json()
    const municipios = (data as { nome: string }[]).map((m) => m.nome).sort((a: string, b: string) => a.localeCompare(b, 'pt-BR'))

    return NextResponse.json({ data: municipios })
  } catch (err) {
    console.error('Erro IBGE municipios:', err)
    return NextResponse.json({ error: 'Erro ao buscar municípios' }, { status: 500 })
  }
}
