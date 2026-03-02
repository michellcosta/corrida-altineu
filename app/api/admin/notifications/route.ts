import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/serverClient'

/**
 * GET: Lista notificações do admin logado (não lidas primeiro, limit 20)
 * PATCH: Marca notificações como lidas (body: { ids: string[] } ou { all: true })
 */
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil admin não encontrado' }, { status: 403 })
    }

    const { data: notifications, error } = await supabase
      .from('admin_notifications')
      .select('id, type, title, message, link, read_at, created_at')
      .eq('admin_user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Erro ao listar notificações:', error)
      return NextResponse.json({ error: 'Erro ao carregar notificações' }, { status: 500 })
    }

    const unreadCount = (notifications || []).filter((n) => !n.read_at).length

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    })
  } catch (err: unknown) {
    console.error('Erro:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil admin não encontrado' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { ids, all } = body as { ids?: string[]; all?: boolean }

    let query = supabase
      .from('admin_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('admin_user_id', profile.id)
      .is('read_at', null)

    if (all) {
      // Marca todas como lidas
    } else if (Array.isArray(ids) && ids.length > 0) {
      query = query.in('id', ids)
    } else {
      return NextResponse.json({ error: 'Informe ids ou all: true' }, { status: 400 })
    }

    const { error } = await query

    if (error) {
      console.error('Erro ao marcar notificações:', error)
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
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
