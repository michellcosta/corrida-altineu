import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/serverClient'

/**
 * Página raiz /admin - redireciona para login ou dashboard.
 * Evita 404 quando o PWA abre em /admin (start_url).
 */
export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  switch (profile?.role) {
    case 'SITE_ADMIN':
      redirect('/admin/site')
    case 'CHIP_ADMIN':
      redirect('/admin/chip')
    case 'ORG_ADMIN':
      redirect('/admin/org')
    default:
      redirect('/admin/site')
  }
}
