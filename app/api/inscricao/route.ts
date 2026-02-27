import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'geral-10k': 'geral-10k',
  'morador-10k': 'morador-10k',
  'sessenta-10k': '60-mais-10k',
  'infantil-2k': 'infantil-2k',
}

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function formatDocumentNumber(value: string): string {
  return value.replace(/\D/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      categoryId,
      fullName,
      birthDate,
      gender,
      email,
      phone,
      teamName,
      originType,
      city,
      state,
      country,
      documentType,
      documentNumber,
      // Morador
      addressStreet,
      addressNumber,
      addressComplement,
      addressNeighborhood,
      addressZipCode,
      // Infantil
      childCpf,
      guardianName,
      guardianCpf,
      guardianPhone,
      guardianRelationship,
      // Estrangeiro
      guardianDocumentType,
      guardianDocumentNumber,
    } = body

    if (!categoryId || !fullName?.trim() || !birthDate || !email?.trim()) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios' },
        { status: 400 }
      )
    }

    const isBrazilian = originType === 'brazilian' || country === 'BRA'
    if (isBrazilian && (!city?.trim() || !state)) {
      return NextResponse.json(
        { error: 'Informe o estado e o município' },
        { status: 400 }
      )
    }
    if (!isBrazilian && !country) {
      return NextResponse.json(
        { error: 'Informe a nacionalidade' },
        { status: 400 }
      )
    }

    const slug = CATEGORY_SLUG_MAP[categoryId] || categoryId
    const isInfant = categoryId === 'infantil-2k'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, race_date')
      .eq('year', 2026)
      .single()

    if (eventError || !event) {
      console.error('Evento não encontrado:', eventError)
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name, is_free')
      .eq('event_id', event.id)
      .eq('slug', slug)
      .single()

    if (catError || !category) {
      console.error('Categoria não encontrada:', catError)
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    let athleteDocType = documentType || 'CPF'
    let athleteDocNumber = documentNumber ? formatDocumentNumber(documentNumber) : null

    if (isInfant) {
      athleteDocType = 'CPF'
      athleteDocNumber = childCpf ? formatDocumentNumber(childCpf) : null
    } else if (country !== 'BRA') {
      athleteDocType = (guardianDocumentType as string) || 'CPF'
      athleteDocNumber = guardianDocumentNumber ? formatDocumentNumber(guardianDocumentNumber) : null
    }

    // Bloquear inscrição duplicada por documento (CPF/RG) em qualquer categoria
    if (athleteDocNumber) {
      const { data: athletesByDoc } = await supabase
        .from('athletes')
        .select('id')
        .eq('document_number', athleteDocNumber)
        .limit(20)
      const docAthleteIds = (athletesByDoc || []).map((a) => a.id)
      if (docAthleteIds.length > 0) {
        const { data: existingByDoc } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', event.id)
          .in('athlete_id', docAthleteIds)
          .limit(1)
          .maybeSingle()
        if (existingByDoc) {
          return NextResponse.json(
            {
              error: 'Você já possui uma inscrição neste evento. Consulte em Acompanhar Inscrição para editar ou concluir o pagamento.',
              already_registered: true,
              document_hint: athleteDocNumber.length === 11 ? 'cpf' : 'rg',
            },
            { status: 409 }
          )
        }
      }
    }

    const athleteData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      whatsapp: phone?.trim() || null,
      document_type: athleteDocType,
      document_number: athleteDocNumber,
      birth_date: birthDate,
      gender: gender || null,
      team_name: teamName?.trim() || null,
      city: isBrazilian && city ? city.trim() : null,
      state: isBrazilian && state ? state : null,
      country: country || (isBrazilian ? 'BRA' : null),
      address: addressStreet
        ? [addressStreet, addressNumber, addressComplement, addressNeighborhood]
            .filter(Boolean)
            .join(', ')
        : null,
      zip_code: addressZipCode?.replace(/\D/g, '') || null,
    }

    const { data: existingAthlete } = await supabase
      .from('athletes')
      .select('id')
      .ilike('email', email.trim())
      .limit(1)
      .single()

    let athleteId: string

    if (existingAthlete) {
      const { error: updateErr } = await supabase
        .from('athletes')
        .update({
          ...athleteData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAthlete.id)
      if (updateErr) {
        console.error('Erro ao atualizar atleta:', updateErr)
        return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 })
      }
      athleteId = existingAthlete.id
    } else {
      const { data: newAthlete, error: insertErr } = await supabase
        .from('athletes')
        .insert(athleteData)
        .select('id')
        .single()
      if (insertErr) {
        console.error('Erro ao criar atleta:', insertErr)
        return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 })
      }
      athleteId = newAthlete!.id
    }

    let guardianId: string | null = null
    if (isInfant && guardianName?.trim() && guardianCpf) {
      const { data: newGuardian, error: guardErr } = await supabase
        .from('guardians')
        .insert({
          athlete_id: athleteId,
          full_name: guardianName.trim(),
          document_type: 'CPF',
          document_number: formatDocumentNumber(guardianCpf),
          phone: guardianPhone?.trim() || '',
          relationship: guardianRelationship || 'Responsável Legal',
        })
        .select('id')
        .single()
      if (!guardErr && newGuardian) guardianId = newGuardian.id
    }

    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', event.id)
      .eq('category_id', category.id)
      .eq('athlete_id', athleteId)
      .limit(1)
      .maybeSingle()

    if (existingReg) {
      return NextResponse.json(
        { error: 'Você já possui uma inscrição nesta categoria' },
        { status: 409 }
      )
    }

    const confirmationCode = generateConfirmationCode()

    const { count: regCount } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('category_id', category.id)

    const seq = (regCount || 0) + 1
    const prefix = slug.replace(/-10k|-2k/g, '').toUpperCase().replace('-', '')
    const registrationNumber = `2026-${prefix}-${String(seq).padStart(4, '0')}`

    const { data: registration, error: regErr } = await supabase
      .from('registrations')
      .insert({
        event_id: event.id,
        category_id: category.id,
        athlete_id: athleteId,
        guardian_id: guardianId,
        registration_number: registrationNumber,
        confirmation_code: confirmationCode,
        status: category.is_free ? 'confirmed' : 'pending_payment',
        payment_status: category.is_free ? 'free' : 'pending',
        payment_amount: category.is_free ? 0 : 20,
      })
      .select('id')
      .single()

    if (regErr) {
      if (regErr.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma inscrição com este e-mail para esta categoria' },
          { status: 409 }
        )
      }
      console.error('Erro ao criar inscrição:', regErr)
      return NextResponse.json({ error: 'Erro ao finalizar inscrição' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      registration: {
        id: registration!.id,
        registration_number: registrationNumber,
        confirmation_code: confirmationCode,
        status: category.is_free ? 'confirmed' : 'pending_payment',
        category_name: category.name,
      },
    })
  } catch (err: unknown) {
    console.error('Erro na inscrição:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
