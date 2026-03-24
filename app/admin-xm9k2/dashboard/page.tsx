import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [
    { count: clientsCount },
    { count: ordersCount },
    { count: activePartnersCount },
    { data: pendingReviews },
    { data: recentClients },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('is_live', true),
    supabase.from('reviews').select('*').eq('is_approved', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Clients', value: clientsCount || 0, icon: '👥', color: '#2563eb', href: '/admin-xm9k2/dashboard/clients' },
    { label: 'Total Orders', value: ordersCount || 0, icon: '📦', color: '#10B981', href: '/admin-xm9k2/dashboard' },
    { label: 'Pending Reviews', value: pendingReviews?.length || 0, icon: '⭐', color: '#f59e0b', href: '/admin-xm9k2/dashboard/reviews' },
    { label: 'Active Partners', value: activePartnersCount || 0, icon: '🤝', color: '#8b5cf6', href: '/admin-xm9k2/dashboard/partners' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Admin Overview 🛡️</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.35)' }}>Manage EcoMate — clients, reviews, partners and services.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <Link key={i} href={s.href} style={{
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 14, padding: '20px', textDecoration: 'none', display: 'block',
            transition: 'border-color .2s',
          }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pending Reviews */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: '#fff' }}>Pending Reviews</h3>
            <Link href="/admin-xm9k2/dashboard/reviews" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>View all →</Link>
          </div>
          {pendingReviews && pendingReviews.length > 0 ? (
            <div>
              {pendingReviews.map((r: any) => (
                <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{r.reviewer_name}</span>
                    <span style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)', lineHeight: 1.5, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' as any }}>{r.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13 }}>
              No pending reviews 🎉
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: '#fff' }}>Recent Clients</h3>
            <Link href="/admin-xm9k2/dashboard/clients" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentClients && recentClients.length > 0 ? (
            <div>
              {recentClients.map((c: any) => (
                <div key={c.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                    {c.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{c.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.3)' }}>{c.business_name || '—'}</div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
                    background: c.plan === 'growth' ? 'rgba(16,185,129,.1)' : 'rgba(37,99,235,.1)',
                    color: c.plan === 'growth' ? '#10B981' : '#2563eb',
                    textTransform: 'uppercase',
                  }}>{c.plan}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13 }}>No clients yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
