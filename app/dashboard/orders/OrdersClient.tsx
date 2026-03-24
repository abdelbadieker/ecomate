'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#2563eb', processing: '#8b5cf6',
  shipped: '#06b6d4', delivered: '#10B981', cancelled: '#ef4444', returned: '#94a3b8',
}

export default function OrdersClient({ initialOrders, userId }: { initialOrders: any[], userId: string }) {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer_name: '', customer_phone: '', wilaya: '', address: '',
    total_da: '', notes: '',
  })

  const filtered = orders.filter(o => {
    const matchSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.includes(search)
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) return toast.error(error.message)
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
    toast.success('Order status updated')
  }

  async function addOrder(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    const supabase = createClient()
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    const { data, error } = await supabase.from('orders').insert({
      user_id: userId,
      order_number: orderNumber,
      customer_name: newOrder.customer_name,
      customer_phone: newOrder.customer_phone,
      wilaya: newOrder.wilaya,
      address: newOrder.address,
      total_da: parseInt(newOrder.total_da) || 0,
      notes: newOrder.notes,
      status: 'pending',
    }).select().single()
    if (error) { toast.error(error.message); setAdding(false); return }
    setOrders(o => [data, ...o])
    setShowAdd(false)
    setNewOrder({ customer_name: '', customer_phone: '', wilaya: '', address: '', total_da: '', notes: '' })
    toast.success('Order added!')
    setAdding(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.05)',
    border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 9,
    fontSize: 13.5, color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font-inter)',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Orders 📦</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{orders.length} total orders</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '11px 22px' }}>+ Add Order</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search orders..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 240 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
              background: filter === s ? STATUS_COLORS[s] || '#2563eb' : 'var(--bg-card)',
              borderColor: filter === s ? STATUS_COLORS[s] || '#2563eb' : 'var(--border-c)',
              color: filter === s ? '#fff' : 'var(--text-muted)',
            }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, overflow: 'hidden' }}>
        {filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Wilaya</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, color: 'var(--text-main)' }}>#{o.order_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13.5 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.customer_phone}</div>
                  </td>
                  <td>{o.wilaya || '—'}</td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>{o.total_da.toLocaleString()} DA</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{
                        background: `${STATUS_COLORS[o.status]}20`, border: `1px solid ${STATUS_COLORS[o.status]}40`,
                        borderRadius: 100, padding: '4px 10px', fontSize: 11.5, fontWeight: 700,
                        color: STATUS_COLORS[o.status], cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {['pending','confirmed','processing','shipped','delivered','cancelled','returned'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{new Date(o.created_at).toLocaleDateString('fr-DZ')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {o.status === 'pending' && (
                        <button onClick={() => updateStatus(o.id, 'confirmed')} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: '#10B981', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓ Confirm</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No orders found</div>
            <div style={{ fontSize: 13 }}>Orders from your AI chatbot will appear here automatically</div>
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,16,31,.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Add New Order</h3>
            <form onSubmit={addOrder} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Customer Name *</label>
                  <input style={inputStyle} required value={newOrder.customer_name} onChange={e => setNewOrder(n => ({ ...n, customer_name: e.target.value }))} placeholder="Ahmed Benali" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Phone</label>
                  <input style={inputStyle} value={newOrder.customer_phone} onChange={e => setNewOrder(n => ({ ...n, customer_phone: e.target.value }))} placeholder="+213 555..." />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Wilaya</label>
                  <input style={inputStyle} value={newOrder.wilaya} onChange={e => setNewOrder(n => ({ ...n, wilaya: e.target.value }))} placeholder="Alger" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Total (DA) *</label>
                  <input style={inputStyle} type="number" required value={newOrder.total_da} onChange={e => setNewOrder(n => ({ ...n, total_da: e.target.value }))} placeholder="3500" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Address</label>
                <input style={inputStyle} value={newOrder.address} onChange={e => setNewOrder(n => ({ ...n, address: e.target.value }))} placeholder="Rue Didouche Mourad..." />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Notes</label>
                <textarea style={{ ...inputStyle, resize: 'none' } as any} rows={2} value={newOrder.notes} onChange={e => setNewOrder(n => ({ ...n, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={adding} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {adding ? 'Adding...' : 'Add Order →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
