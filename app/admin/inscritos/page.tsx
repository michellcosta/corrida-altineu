'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AthletesManagement from '@/components/admin/AthletesManagement'
import { createClient } from '@/lib/supabase/browserClient'
import { UserRole } from '@/lib/admin/types'
import { Loader2 } from 'lucide-react'

export default function UnifiedInscritosPage() {
    const router = useRouter()
    const [role, setRole] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            setLoading(true)
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/admin/login')
                return
            }

            const { data: profile } = await supabase
                .from('admin_users')
                .select('role')
                .eq('user_id', user.id)
                .single()

            if (!profile) {
                router.push('/admin/login')
                return
            }

            setRole(profile.role as UserRole)
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error)
            router.push('/admin/login')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                </div>
            </AdminLayout>
        )
    }

    if (!role) return null

    return (
        <AdminLayout>
            <AthletesManagement userRole={role} />
        </AdminLayout>
    )
}
