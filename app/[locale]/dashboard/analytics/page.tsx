'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ revenue: 0, orders: 0, delivered: 0, topProduct: '—' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const [{ data: p }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('orders').select('*').eq('user_id', data.user.id),
      ])
      setProfile(p)
      if (orders) {
        setStats({
          revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total_da, 0),
          orders: orders.length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          topProduct: '—',
        })
      }
    })
  }, [])

  if (!profile) return null
  const isLocked = profile.plan === 'starter' || profile.plan === 'none'

  if (isLocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>Analytics is a Growth Feature</h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>
          Upgrade to unlock real-time revenue charts, conversion rates, and AI-powered business insights.
        </p>
        <Link href="/checkout" className="btn-primary" style={{ padding: '14px 36px', fontSize: 15, textDecoration: 'none' }}>
          ⚡ Upgrade to Growth — 4,900 DA/mo →
        </Link>
      </div>
    )
  }

  const barData = [45, 62, 78, 55, 90, 82, 100]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Analytics 📈</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Real-time business performance overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `${stats.revenue.toLocaleString()} DA`, color: '#10B981', icon: '💰' },
          { label: 'Total Orders', value: stats.orders.toString(), color: '#2563eb', icon: '📦' },
          { label: 'Delivered', value: stats.delivered.toString(), color: '#10B981', icon: '✅' },
          { label: 'Delivery Rate', value: stats.orders ? `${Math.round(stats.delivered / stats.orders * 100)}%` : '—', color: '#f59e0b', icon: '🚚' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '24px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 20 }}>Weekly Revenue Performance — دج</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
          {barData.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%', borderRadius: '6px 6px 0 0',
                height: `${h}%`,
                background: h === 100 ? 'linear-gradient(180deg,#10B981,rgba(16,185,129,.3))' : h > 75 ? 'linear-gradient(180deg,#2563eb,rgba(37,99,235,.3))' : 'rgba(37,99,235,.15)',
                transition: 'background .3s',
                minHeight: 4,
              }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(37,99,235,.06)', border: '1px solid rgba(37,99,235,.15)', borderRadius: 12, padding: '16px 20px', fontSize: 13.5, color: 'rgba(255,255,255,.55)' }}>
        💡 <strong style={{ color: 'var(--text-main)' }}>Tip:</strong> Connect your AI chatbot to automatically track orders and revenue in real time. Every order placed through the chatbot appears in your analytics instantly.
      </div>
    </div>
  )
}
