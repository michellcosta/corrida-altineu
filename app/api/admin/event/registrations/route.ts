import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClientFromRequest, createServiceClient } from '@/lib/supabase/serverClient'

export const dynamic = 'force-dynamic'

const PATHS_TO_REVALIDATE = ['/', '/inscricao', '/inscricao/acompanhar']

export async function PATCH(request: Request) {
  try {
    const supabase = createClientFromRequest(request)
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

    const body = await request.json()
    const open = Boolean(body.open)

    const serviceClient = createServiceClient()
    const { error: updateError } = await serviceClient
      .from('events')
      .update({ registrations_open: open })
      .eq('year', 2026)

    if (updateError) {
      console.error('Erro ao alternar inscrições:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    for (const path of PATHS_TO_REVALIDATE) {
      revalidatePath(path)
    }

    return NextResponse.json({ success: true, registrationsOpen: open })
  } catch (err) {
    console.error('Erro ao alternar inscrições:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
