'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ plan: 'starter', plan_status: 'active' })

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function saveClientStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    const supabase = createClient()
    await supabase.from('profiles').update({ plan: form.plan, plan_status: form.plan_status }).eq('id', editId)
    toast.success('Client subscription updated!')
    setEditId(null)
    fetchClients()
  }

  const planColor = (plan: string) => plan === 'growth' ? '#10B981' : plan === 'business' ? '#8b5cf6' : '#2563eb'

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Clients 👥</h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>{clients?.length || 0} registered clients</p>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,.3)' }}>Loading clients...</div> : (
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Business Name</th>
                <th>Phone</th>
                <th>Current Plan</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients?.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, fontWeight: 800, color: '#fff' }}>
                        {c.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 13.5 }}>{c.full_name || 'No Name'}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{c.email || 'Email missing'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.business_name || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${planColor(c.plan)}20`, color: planColor(c.plan), textTransform: 'uppercase' }}>
                      {c.plan || 'starter'}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
                      color: c.plan_status === 'active' ? '#10B981' : c.plan_status === 'trial' ? '#f59e0b' : '#ef4444' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {c.plan_status || 'trial'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)' }}>{new Date(c.created_at).toLocaleDateString('fr-DZ')}</td>
                  <td>
                    <button onClick={() => { setEditId(c.id); setForm({ plan: c.plan || 'starter', plan_status: c.plan_status || 'trial' }) }} style={{ padding: '5px 12px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!clients || clients.length === 0) && (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,.25)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              No clients registered yet
            </div>
          )}
        </div>
      )}

      {/* Subscription Edit Modal */}
      {editId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setEditId(null)}>
          <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Manage Subscription</h3>
            <form onSubmit={saveClientStatus} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Assigned Plan</label>
                <select style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 9, fontSize: 13.5, color: '#fff', outline: 'none', cursor: 'pointer' }} value={form.plan} onChange={e => setForm(x => ({ ...x, plan: e.target.value }))}>
                  <option value="starter" style={{ color: '#000' }}>Starter</option>
                  <option value="growth" style={{ color: '#000' }}>Growth</option>
                  <option value="business" style={{ color: '#000' }}>Business</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Account Status</label>
                <select style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 9, fontSize: 13.5, color: '#fff', outline: 'none', cursor: 'pointer' }} value={form.plan_status} onChange={e => setForm(x => ({ ...x, plan_status: e.target.value }))}>
                  <option value="active" style={{ color: '#000' }}>Active</option>
                  <option value="trial" style={{ color: '#000' }}>On Trial</option>
                  <option value="expired" style={{ color: '#000' }}>Expired / Suspended</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setEditId(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Layout →</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
