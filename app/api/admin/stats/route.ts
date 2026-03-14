import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/serverClient'
import { unstable_noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    unstable_noStore()

    try {
        const supabaseAuth = createClient()
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { data: profile } = await supabaseAuth
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle()

        if (!profile || profile.role !== 'SITE_ADMIN') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const supabaseService = createServiceClient()

        // 1. Health Checks
        const { error: dbError } = await supabaseService.from('events').select('id').limit(1)
        const dbHealth = !dbError

        const paymentHealth = !!process.env.MERCADOPAGO_ACCESS_TOKEN
        const emailHealth = !!process.env.RESEND_API_KEY

        // 2. Analytics Básico (Últimos 7 dias)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const isoDate = sevenDaysAgo.toISOString()

        const [viewsData, regsData] = await Promise.all([
            // Apenas contar o total das ultimas views
            supabaseService
                .from('page_views')
                .select('path', { count: 'exact' })
                .gte('created_at', isoDate),
            supabaseService
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', isoDate)
        ])

        const totalViews = viewsData.count || 0
        const totalRegs = regsData.count || 0
        let conversionRate = 0

        // Simplifed conversion = Registrations / Unique views on /inscricao? Let's just do Regs / Total Views for simplicity
        if (totalViews > 0) {
            conversionRate = (totalRegs / totalViews) * 100
        }

        // 3. Top Páginas - Agrupando manualmetne já que o postgrest padrão não agrupa bem sem RPC
        const pathCounts: Record<string, number> = {}
        if (viewsData.data) {
            viewsData.data.forEach((row: { path: string }) => {
                if (!pathCounts[row.path]) pathCounts[row.path] = 0
                pathCounts[row.path]++
            })
        }

        const topPages = Object.entries(pathCounts)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        return NextResponse.json({
            health: {
                database: dbHealth,
                payment: paymentHealth,
                email: emailHealth
            },
            analytics: {
                views: totalViews,
                conversionRate: conversionRate.toFixed(1),
                topPages,
                period: '7d'
            }
        })

    } catch (error) {
        console.error('Erro na API de stats:', error)
        return NextResponse.json({ error: 'Erro interno ao buscar estatísticas' }, { status: 500 })
    }
}
