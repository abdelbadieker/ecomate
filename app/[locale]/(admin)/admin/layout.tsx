import { redirect } from '@/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await (params instanceof Promise ? params : Promise.resolve(params));
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Strict Admin Email Check for Phase 6 MVP
  const isAdmin = user.email === 'abdelbadie.kertimi1212@gmail.com'

  if (!isAdmin) {
    redirect({ href: '/dashboard', locale: locale as any })
  }

  // Still fetch profile for the display name
  const { data: profile } = await supabase
    .from('clients')
    .select('agency_name')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#050a14',
      fontFamily: 'var(--font-inter)'
    }}>
      <Sidebar adminName={profile?.agency_name || 'Admin'} />
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
