'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard', plan: 'starter' },
  { href: '/dashboard/orders', icon: '📦', label: 'Orders', plan: 'starter' },
  { href: '/dashboard/products', icon: '🛍️', label: 'Products', plan: 'starter' },
  { href: '/dashboard/customers', icon: '👥', label: 'Customers', plan: 'growth' },
  { href: '/dashboard/ai-chatbot', icon: '🤖', label: 'AI Chatbot', plan: 'starter' },
  { href: '/dashboard/analytics', icon: '📈', label: 'Analytics', plan: 'growth' },
  { href: '/dashboard/delivery', icon: '🚚', label: 'Delivery', plan: 'starter' },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Settings', plan: 'starter' },
]

const planOrder = { starter: 0, growth: 1, business: 2, none: -1 }

export default function DashboardSidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const userPlan = profile?.plan || 'starter'

  function canAccess(requiredPlan: string) {
    return (planOrder[userPlan as keyof typeof planOrder] ?? 0) >= (planOrder[requiredPlan as keyof typeof planOrder] ?? 0)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-section)', borderRight: '1px solid var(--border-c)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 20,
        display: 'block', marginBottom: 28, paddingLeft: 8, textDecoration: 'none',
      }}>
        <span style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eco</span>
        <span style={{ background: 'linear-gradient(135deg,#2563eb,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
      </Link>

      {/* User Info */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-c)',
        borderRadius: 12, padding: '12px 14px', marginBottom: 20,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg,#2563eb,#10B981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginBottom: 8,
        }}>
          {(profile?.full_name?.[0] || profile?.business_name?.[0] || '👤').toUpperCase()}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-poppins)', marginBottom: 2 }}>
          {profile?.full_name || profile?.business_name || 'Client'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{profile?.business_name || 'My Store'}</div>
        <div style={{
          marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
          background: userPlan === 'growth' ? 'rgba(16,185,129,.1)' : 'rgba(37,99,235,.1)',
          border: `1px solid ${userPlan === 'growth' ? 'rgba(16,185,129,.2)' : 'rgba(37,99,235,.2)'}`,
          borderRadius: 100, padding: '2px 10px', fontSize: 10, fontWeight: 700,
          color: userPlan === 'growth' ? '#10B981' : '#2563eb',
          textTransform: 'uppercase', letterSpacing: '.06em',
        }}>
          {userPlan === 'starter' ? '⏱ Trial' : userPlan === 'growth' ? '⚡ Growth' : '💎 Business'}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = pathname === item.href
          const locked = !canAccess(item.plan)
          return (
            <div key={item.href} style={{ position: 'relative' }}>
              {locked ? (
                <div
                  className="sidebar-item"
                  style={{ opacity: .45, cursor: 'not-allowed' }}
                  onClick={() => toast.error(`Upgrade to ${item.plan} plan to access ${item.label}`)}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 10, background: 'rgba(255,255,255,.08)', borderRadius: 4, padding: '2px 6px' }}>🔒</span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  style={{ background: active ? 'rgba(37,99,235,.12)' : '' }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {active && <span style={{ width: 3, height: 18, background: '#2563eb', borderRadius: 2, marginLeft: 'auto' }} />}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Upgrade CTA */}
      {userPlan === 'starter' && (
        <Link href="/checkout" style={{
          background: 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(37,99,235,.08))',
          border: '1px solid rgba(16,185,129,.2)',
          borderRadius: 12, padding: '14px', marginBottom: 12, display: 'block', textDecoration: 'none',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-poppins)', marginBottom: 4 }}>⚡ Upgrade to Growth</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>Unlock CRM, Analytics & AI Growth Agent</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 6 }}>4,900 DA/month →</div>
        </Link>
      )}

      {/* Logout */}
      <button onClick={handleLogout} style={{
        width: '100%', padding: '10px', borderRadius: 10, border: 'none',
        background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.3)',
        cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
        transition: 'all .2s',
      }}>
        <span>🚪</span> Sign Out
      </button>
    </aside>
  )
}
