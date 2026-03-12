import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/serverClient'

/**
 * POST: Remove registro de ai_usage por CPF (após exclusão de atleta).
 * Apenas SITE_ADMIN. Usado para evitar que a IA continue "reconhecendo" usuários excluídos.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!profile || profile.role !== 'SITE_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const documentNumber = (body.document_number as string)?.toString().trim()
    if (!documentNumber) {
      return NextResponse.json({ error: 'document_number é obrigatório' }, { status: 400 })
    }

    const cpf = documentNumber.replace(/\D/g, '')
    if (cpf.length < 5) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    const serviceClient = createServiceClient()
    const { error } = await serviceClient
      .from('ai_usage')
      .delete()
      .eq('cpf', cpf)

    if (error) {
      console.error('Erro ao limpar ai_usage:', error)
      return NextResponse.json({ error: 'Erro ao limpar histórico da IA' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Erro:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
