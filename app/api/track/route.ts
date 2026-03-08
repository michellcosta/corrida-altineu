import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/serverClient'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const { path } = await request.json()

        if (!path || typeof path !== 'string') {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 })
        }

        const supabaseService = createServiceClient()

        // Usar a RPC function recém criada para inserir rapidamente sem restrições
        // ou inserir diretamente se o RLS permitir a anon account (mas createServiceClient bypassa RLS anyway).
        const { error } = await supabaseService.from('page_views').insert({ path })

        // Se a tabela ainda não existir (o admin não rodou o SQL), não queremos quebrar o site
        if (error && error.code !== '42P01') { // 42P01 = undefined_table
            console.error('Falha ao registrar view:', error)
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        // Falhas silenciosas no tracking são preferíveis a travar o usuário
        console.error('Erro no tracking:', err)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
