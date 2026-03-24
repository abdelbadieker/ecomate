'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('crm_customers').select('*').eq('user_id', data.user.id).order('total_spent_da', { ascending: false }),
      ])
      setProfile(p)
      setCustomers(c || [])
      setLoading(false)
    })
  }, [])

  if (!profile) return null

  const isLocked = profile.plan === 'starter' || profile.plan === 'none'

  if (isLocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>CRM is a Growth Feature</h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 420, marginBottom: 32 }}>
          Upgrade to the Growth plan to access your full CRM — track customer history, spending, and build lasting relationships.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {['Full customer database with purchase history', 'Customer segmentation by wilaya & spend', 'Repeat buyer tracking & loyalty insights', 'Export customer data to Google Sheets'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-sub)' }}>
              <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>{f}
            </div>
          ))}
        </div>
        <Link href="/checkout" className="btn-primary" style={{ padding: '14px 36px', fontSize: 15, textDecoration: 'none' }}>
          ⚡ Upgrade to Growth — 4,900 DA/mo →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Customers 👥</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{customers.length} customers in your CRM</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading CRM...</div>
      ) : customers.length > 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-table">
            <thead>
              <tr><th>Customer</th><th>Phone</th><th>Wilaya</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                        {c.full_name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.full_name}</span>
                    </div>
                  </td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.wilaya || '—'}</td>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{c.total_orders}</td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>{c.total_spent_da?.toLocaleString()} DA</td>
                  <td style={{ fontSize: 12.5 }}>{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('fr-DZ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>No customers yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Customers are added automatically when they place orders through your AI chatbot</div>
        </div>
      )}
    </div>
  )
}
