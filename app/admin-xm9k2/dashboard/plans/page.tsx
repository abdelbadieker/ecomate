'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', price: '', description: '', features: '', is_popular: false, sort_order: 1 })

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    const supabase = createClient()
    const { data } = await supabase.from('plans').select('*').order('sort_order', { ascending: true })
    setPlans(data || [])
    setLoading(false)
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    
    // Parse features from newline-separated string to JSON array
    const featuresArray = form.features.split('\n').map(f => f.trim()).filter(f => f.length > 0)
    
    const payload = { 
      name: form.name, 
      price: form.price,
      description: form.description,
      features: featuresArray,
      is_popular: form.is_popular,
      sort_order: form.sort_order
    }
    
    if (editId) {
      await supabase.from('plans').update(payload).eq('id', editId)
      toast.success('Plan updated!')
    } else {
      await supabase.from('plans').insert(payload)
      toast.success('Plan added!')
    }
    fetchPlans()
    setShowAdd(false); setEditId(null)
    setForm({ name: '', price: '', description: '', features: '', is_popular: false, sort_order: 1 })
    setSaving(false)
  }

  async function togglePopular(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('plans').update({ is_popular: !current }).eq('id', id)
    setPlans(p => p.map(x => x.id === id ? { ...x, is_popular: !current } : x))
    toast.success(`Plan marked as ${!current ? 'Popular' : 'Standard'}`)
  }

  async function deletePlan(id: string) {
    if (!confirm('Are you absolutely sure you want to delete this pricing plan?')) return
    const supabase = createClient()
    await supabase.from('plans').delete().eq('id', id)
    setPlans(p => p.filter(x => x.id !== id))
    toast.success('Plan deleted')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 9, fontSize: 13.5, color: '#fff', outline: 'none', fontFamily: 'var(--font-inter)' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Pricing Plans 💳</h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>Manage the subscription tiers and features offered to users.</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', price: '', description: '', features: '', is_popular: false, sort_order: plans.length + 1 }) }} className="btn-primary" style={{ padding: '11px 22px' }}>+ New Plan</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,.3)' }}>Loading Plans...</div> : (
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-table">
            <thead>
              <tr><th>Order</th><th>Plan Name</th><th>Price</th><th>Features</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id}>
                  <td style={{ color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{p.sort_order}</td>
                  <td style={{ fontWeight: 700, color: p.is_popular ? '#3b82f6' : '#fff', fontSize: 16 }}>{p.name}</td>
                  <td style={{ fontWeight: 800, color: '#10B981' }}>{p.price}</td>
                  <td style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>
                    {p.features?.length || 0} features listed
                  </td>
                  <td>
                    <button onClick={() => togglePopular(p.id, p.is_popular)} style={{
                      padding: '5px 12px', borderRadius: 8, border: '1px solid', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: p.is_popular ? 'rgba(59,130,246,.12)' : 'rgba(255,255,255,.05)',
                      borderColor: p.is_popular ? 'rgba(59,130,246,.25)' : 'rgba(255,255,255,.1)',
                      color: p.is_popular ? '#3b82f6' : 'rgba(255,255,255,.6)',
                    }}>
                      {p.is_popular ? '🔥 Popular (Highlight)' : 'Standard'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { 
                        setEditId(p.id); 
                        setForm({ 
                          name: p.name, price: p.price, description: p.description || '', 
                          features: (p.features || []).join('\n'), is_popular: p.is_popular, sort_order: p.sort_order 
                        }); 
                        setShowAdd(true) 
                      }} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.2)', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => deletePlan(p.id)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,.3)' }}>No pricing plans created yet!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 20 }}>{editId ? 'Edit Plan' : 'Add New Plan'}</h3>
            <form onSubmit={savePlan} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Plan Name *</label>
                  <input style={inputStyle} type="text" required placeholder="Pro Tier" value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Price *</label>
                  <input style={inputStyle} type="text" required placeholder="15.000 DZD" value={form.price} onChange={e => setForm(x => ({ ...x, price: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Short Description</label>
                <input style={inputStyle} type="text" placeholder="Best for growing businesses..." value={form.description} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Features (One per line) *</label>
                <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} required placeholder="Priority Support&#10;Unlimited Access&#10;Custom Domain" value={form.features} onChange={e => setForm(x => ({ ...x, features: e.target.value }))} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>Press Enter to separate feature bullet points.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div onClick={() => setForm(x => ({ ...x, is_popular: !x.is_popular }))} style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${form.is_popular ? '#3b82f6' : 'rgba(255,255,255,.14)'}`, background: form.is_popular ? '#3b82f6' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 800 }}>
                    {form.is_popular ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>🌟 Highlight as Popular</span>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Sort Position:</span>
                    <input style={{ ...inputStyle, width: 60, padding: '5px 10px' }} type="number" min="1" value={form.sort_order} onChange={e => setForm(x => ({ ...x, sort_order: parseInt(e.target.value) || 1 }))} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'Saving...' : editId ? 'Update Plan' : 'Add Plan →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
