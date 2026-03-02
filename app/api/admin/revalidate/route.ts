import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/serverClient'

export const dynamic = 'force-dynamic'

const PATHS_TO_REVALIDATE = [
  '/',
  '/inscricao',
  '/inscricao/acompanhar',
  '/prova-10k',
  '/morador-10k',
  '/60-mais-10k',
  '/prova-kids',
]

/**
 * POST: Revalida o cache das páginas que usam dados do evento.
 * Chamado após salvar configurações em /admin/site/settings/event.
 * Requer autenticação SITE_ADMIN.
 */
export async function POST() {
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
      .maybeSingle()

    if (!profile || profile.role !== 'SITE_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    for (const path of PATHS_TO_REVALIDATE) {
      revalidatePath(path)
    }

    return NextResponse.json({ revalidated: true, paths: PATHS_TO_REVALIDATE })
  } catch (err) {
    console.error('Erro ao revalidar:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao revalidar' },
      { status: 500 }
    )
  }
}
