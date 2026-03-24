import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-xm9k2/login')

  const { data: adminData } = await supabase.from('admin_users').select('role').eq('user_id', user.id).single()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  
  const isAdmin = adminData?.role === 'admin' || user.email === 'abdelbadie.kertimi1212@gmail.com'
  if (!isAdmin) redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050a14' }}>
      <AdminSidebar adminName={profile?.full_name || 'Admin'} />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
        {children}
      </main>
    </div>
  )
}
