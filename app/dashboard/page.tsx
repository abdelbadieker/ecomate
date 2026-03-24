import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: orders }, { data: products }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id').eq('user_id', user!.id),
  ])

  const totalRevenue = orders?.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total_da, 0) || 0
  const todayOrders = orders?.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const stats = [
    { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()} DA`, change: '', icon: '💰', color: '#10B981' },
    { label: 'Orders Today', value: todayOrders.toString(), change: 'This month', icon: '📦', color: '#2563eb' },
    { label: 'Products', value: (products?.length || 0).toString(), change: 'In catalog', icon: '🛍️', color: '#2563eb' },
    { label: 'Pending COD', value: pendingOrders.toString(), change: 'Awaiting delivery', icon: '🕐', color: '#f59e0b' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 26, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
          Good morning, {profile?.full_name?.split(' ')[0] || 'Client'} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Here's what's happening with your store today.</p>
      </div>

      {/* Trial Banner */}
      {profile?.plan === 'starter' && trialDaysLeft > 0 && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(37,99,235,.12),rgba(16,185,129,.08))',
          border: '1px solid rgba(37,99,235,.25)', borderRadius: 14,
          padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
              ⏱ {trialDaysLeft} days left in your free trial
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.45)' }}>Upgrade to Growth to unlock CRM, Analytics & AI Growth Agent</div>
          </div>
          <Link href="/checkout" className="btn-primary" style={{ padding: '10px 22px', fontSize: 13 }}>
            Upgrade Now — 4,900 DA/mo →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-c)',
            borderRadius: 14, padding: '20px',
            transition: 'border-color .2s',
          }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-c)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Recent Orders</h3>
          <Link href="/dashboard/orders" style={{ fontSize: 12.5, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>
        {orders && orders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>#{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td style={{ color: '#10B981', fontWeight: 600 }}>{o.total_da.toLocaleString()} DA</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      background: o.status === 'delivered' ? 'rgba(16,185,129,.1)' : o.status === 'pending' ? 'rgba(245,158,11,.1)' : 'rgba(37,99,235,.1)',
                      color: o.status === 'delivered' ? '#10B981' : o.status === 'pending' ? '#f59e0b' : '#2563eb',
                    }}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
            No orders yet. Once your AI chatbot is live, orders appear here automatically.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { href: '/dashboard/products', icon: '➕', title: 'Add Product', desc: 'Add items to your catalog', color: '#2563eb' },
          { href: '/dashboard/ai-chatbot', icon: '🤖', title: 'AI Chatbot', desc: 'Configure your AI assistant', color: '#10B981' },
          { href: '/dashboard/settings', icon: '⚙️', title: 'Settings', desc: 'Manage your account', color: '#f59e0b' },
        ].map((a, i) => (
          <Link key={i} href={a.href} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-c)',
            borderRadius: 14, padding: '20px', textDecoration: 'none',
            transition: 'all .2s', display: 'block',
          }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: a.color, marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
