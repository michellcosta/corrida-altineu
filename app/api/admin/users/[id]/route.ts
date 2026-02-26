import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/serverClient'
import { createServiceClient } from '@/lib/supabase/serverClient'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      return NextResponse.json({ error: 'Apenas SITE_ADMIN pode deletar usuários' }, { status: 403 })
    }

    const adminClient = createServiceClient()
    const { data: adminUser, error: fetchError } = await adminClient
      .from('admin_users')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !adminUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { error: deleteError } = await adminClient
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    await adminClient.auth.admin.deleteUser(adminUser.user_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Erro ao deletar usuário:', err)
    return NextResponse.json(
      { error: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
