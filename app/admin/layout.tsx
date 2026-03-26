import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Final role check for security using the admin_users table
  const [{ data: profile }, { data: admin }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('admin_users').select('role').eq('user_id', user.id).single()
  ])

  const isAdmin = !!admin

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#050a14',
      fontFamily: 'var(--font-inter)'
    }}>
      <Sidebar adminName={profile?.full_name || 'Admin'} />
      <main style={{ 
        flex: 1, 
        padding: '36px 48px',
        overflow: 'auto',
        position: 'relative',
        background: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
