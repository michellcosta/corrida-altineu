import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/** Campos editáveis pelo atleta na página Acompanhar Inscrição.
 * Travados: registration_number, confirmation_code, document_type, document_number */
const EDITABLE_FIELDS = [
  'full_name',
  'birth_date',
  'gender',
  'city',
  'state',
  'country',
  'email',
  'phone',
  'whatsapp',
  'team_name',
  'emergency_contact_name',
  'emergency_contact_phone',
  'tshirt_size',
  'address',
  'zip_code',
] as const

function formatDocumentNumber(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Atualiza dados do atleta após validação por CPF, RG ou código de confirmação.
 * Usa service role pois atletas não autenticados não passam no RLS.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, rg, codigo, registration_id, ...updates } = body as Record<string, unknown>

    const searchCodigo = codigo?.toString().trim()
    const searchDoc = (cpf?.toString().trim() || rg?.toString().trim() || '').replace(/\D/g, '')

    if (!searchCodigo && !searchDoc) {
      return NextResponse.json({ error: 'Informe CPF, RG ou código' }, { status: 400 })
    }

    const regId = registration_id?.toString()
    if (!regId) {
      return NextResponse.json({ error: 'ID da inscrição obrigatório' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    let regQuery = supabase
      .from('registrations')
      .select('id, athlete_id, confirmation_code, athlete:athletes(id, document_number)')
      .eq('event_id', event.id)
      .eq('id', regId)

    const { data: reg, error: regError } = await regQuery.single()

    if (regError || !reg) {
      return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 })
    }

    const athlete = Array.isArray((reg as any).athlete) ? (reg as any).athlete[0] : (reg as any).athlete
    const athleteId = athlete?.id
    const docNumber = athlete?.document_number?.replace(/\D/g, '')

    const isValidByCode = searchCodigo && (reg as any).confirmation_code === searchCodigo
    const isValidByDoc = searchDoc && docNumber === searchDoc

    if (!isValidByCode && !isValidByDoc) {
      return NextResponse.json({ error: 'Não autorizado a alterar esta inscrição' }, { status: 403 })
    }

    const athleteUpdate: Record<string, unknown> = {}
    const requiredFields = ['full_name', 'birth_date']
    for (const key of EDITABLE_FIELDS) {
      if (key in updates && updates[key] !== undefined) {
        let val = updates[key]
        if (typeof val === 'string') val = val.trim() || null
        if (requiredFields.includes(key) && (val === null || val === '')) continue
        athleteUpdate[key] = val
      }
    }

    if (Object.keys(athleteUpdate).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo editável enviado' }, { status: 400 })
    }

    if (athleteUpdate.email && typeof athleteUpdate.email === 'string') {
      athleteUpdate.email = athleteUpdate.email.toLowerCase()
    }
    if (athleteUpdate.zip_code && typeof athleteUpdate.zip_code === 'string') {
      athleteUpdate.zip_code = formatDocumentNumber(athleteUpdate.zip_code as string) || null
    }

    const { error: updateError } = await supabase
      .from('athletes')
      .update({ ...athleteUpdate, updated_at: new Date().toISOString() })
      .eq('id', athleteId)

    if (updateError) {
      console.error('Erro ao atualizar atleta:', updateError)
      return NextResponse.json({ error: 'Erro ao salvar alterações' }, { status: 500 })
    }

    // Notificar admins (SITE_ADMIN e CHIP_ADMIN) sobre a alteração
    const athleteName = (athleteUpdate.full_name as string) || 'Atleta'
    const { data: admins } = await supabase
      .from('admin_users')
      .select('id')
      .in('role', ['SITE_ADMIN', 'CHIP_ADMIN'])
      .eq('is_active', true)

    if (admins && admins.length > 0) {
      const notifications = admins.map((a) => ({
        admin_user_id: a.id,
        type: 'athlete_data_updated',
        title: 'Dados atualizados',
        message: `${athleteName} atualizou seus dados na inscrição.`,
        link: '/admin/site/inscritos',
        metadata: { athlete_id: athleteId, registration_id: regId },
      }))
      await supabase.from('admin_notifications').insert(notifications)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Erro:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
