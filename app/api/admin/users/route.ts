import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/serverClient'
import { createServiceClient } from '@/lib/supabase/serverClient'

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
      .maybeSingle()
    if (!profile || profile.role !== 'SITE_ADMIN') {
      return NextResponse.json({ error: 'Apenas SITE_ADMIN pode criar usuários' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, role } = body
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'name, email, password e role são obrigatórios' },
        { status: 400 }
      )
    }

    const adminClient = createServiceClient()
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }
    if (!authData.user) {
      return NextResponse.json({ error: 'Usuário não foi criado' }, { status: 500 })
    }

    const { data: adminUser, error: insertError } = await adminClient
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        name,
        email,
        role,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id)
      } catch {
        /* ignore */
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json(adminUser)
  } catch (err: any) {
    console.error('Erro ao criar usuário:', err)
    return NextResponse.json(
      { error: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
