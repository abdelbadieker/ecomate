'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/admin-xm9k2/dashboard', icon: '📊', label: 'Overview' },
  { href: '/admin-xm9k2/dashboard/clients', icon: '👥', label: 'Clients' },
  { href: '/admin-xm9k2/dashboard/reviews', icon: '⭐', label: 'Reviews' },
  { href: '/admin-xm9k2/dashboard/partners', icon: '🤝', label: 'Partners' },
  { href: '/admin-xm9k2/dashboard/services', icon: '⚙️', label: 'Services' },
  { href: '/admin-xm9k2/dashboard/plans', icon: '💳', label: 'Pricing Plans' },
  { href: '/admin-xm9k2/dashboard/contact', icon: '☎️', label: 'Contact Details' },
  { href: '/admin-xm9k2/dashboard/settings', icon: '🔧', label: 'Settings' },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/admin-xm9k2/login')
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: '#0a1628',
      borderRight: '1px solid rgba(255,255,255,.06)',
      display: 'flex', flexDirection: 'column', padding: '20px 12px',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      <div style={{ paddingLeft: 8, marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 20 }}>
          <span style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eco</span>
          <span style={{ background: 'linear-gradient(135deg,#2563eb,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 100, padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#ef4444', marginTop: 6 }}>
          🔐 Admin Center
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '10px 12px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{adminName}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>Administrator</div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`sidebar-item ${active ? 'active' : ''}`}
              style={{ background: active ? 'rgba(37,99,235,.12)' : '' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <span style={{ width: 3, height: 18, background: '#2563eb', borderRadius: 2, marginLeft: 'auto' }} />}
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12, marginTop: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 9, fontSize: 13, color: 'rgba(255,255,255,.3)', textDecoration: 'none', marginBottom: 4 }}>
          🌐 View Website
        </Link>
        <button onClick={logout} style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: 'none', background: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
