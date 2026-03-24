'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', logo: '🤝', category: '', website_url: '', row_num: '1', is_live: false })

  useEffect(() => { fetchPartners() }, [])

  async function fetchPartners() {
    const supabase = createClient()
    const { data } = await supabase.from('partners').select('*').order('row_num').order('sort_order')
    setPartners(data || [])
    setLoading(false)
  }

  async function savePartner(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = { name: form.name, logo: form.logo, category: form.category, website_url: form.website_url, row_num: parseInt(form.row_num), is_live: form.is_live }
    if (editId) {
      await supabase.from('partners').update(payload).eq('id', editId)
      toast.success('Partner updated!')
    } else {
      await supabase.from('partners').insert(payload)
      toast.success('Partner added!')
    }
    fetchPartners()
    setShowAdd(false); setEditId(null)
    setForm({ name: '', logo: '🤝', category: '', website_url: '', row_num: '1', is_live: false })
    setSaving(false)
  }

  async function toggleLive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('partners').update({ is_live: !current }).eq('id', id)
    setPartners(p => p.map(x => x.id === id ? { ...x, is_live: !current } : x))
    toast.success(`Partner ${!current ? 'activated' : 'deactivated'} on landing page`)
  }

  async function deletePartner(id: string) {
    if (!confirm('Delete this partner?')) return
    const supabase = createClient()
    await supabase.from('partners').delete().eq('id', id)
    setPartners(p => p.filter(x => x.id !== id))
    toast.success('Partner deleted')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 9, fontSize: 13.5, color: '#fff', outline: 'none', fontFamily: 'var(--font-inter)' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Partners 🤝</h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>Manage strategic partners shown on the landing page</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', logo: '🤝', category: '', website_url: '', row_num: '1', is_live: false }) }} className="btn-primary" style={{ padding: '11px 22px' }}>+ Add Partner</button>
      </div>

      {/* Row legend */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.2)', fontSize: 12, color: '#2563eb', fontWeight: 600 }}>← Row 1 scrolls left</div>
        <div style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', fontSize: 12, color: '#10B981', fontWeight: 600 }}>→ Row 2 scrolls right</div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,.3)' }}>Loading...</div> : (
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-table">
            <thead>
              <tr><th>Logo</th><th>Name</th><th>Category</th><th>Row</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {p.logo?.startsWith('http') ? <img src={p.logo} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }} alt="" /> : p.logo}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{p.name}</td>
                  <td>{p.category || '—'}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: p.row_num === 1 ? 'rgba(37,99,235,.12)' : 'rgba(16,185,129,.1)', color: p.row_num === 1 ? '#2563eb' : '#10B981' }}>
                      Row {p.row_num}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => toggleLive(p.id, p.is_live)} style={{
                      padding: '5px 12px', borderRadius: 8, border: '1px solid',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      background: p.is_live ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.08)',
                      borderColor: p.is_live ? 'rgba(16,185,129,.25)' : 'rgba(245,158,11,.2)',
                      color: p.is_live ? '#10B981' : '#f59e0b',
                    }}>
                      {p.is_live ? '✅ Live' : '⏳ Soon'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditId(p.id); setForm({ name: p.name, logo: p.logo, category: p.category || '', website_url: p.website_url || '', row_num: p.row_num.toString(), is_live: p.is_live }); setShowAdd(true) }} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.2)', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => deletePartner(p.id)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440 }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 20 }}>{editId ? 'Edit Partner' : 'Add Partner'}</h3>
            <form onSubmit={savePartner} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Partner Name *', key: 'name', type: 'text', placeholder: 'Yalidine Express', required: true },
                { label: 'Logo (emoji or image URL)', key: 'logo', type: 'text', placeholder: '🚚 or https://...', required: false },
                { label: 'Category', key: 'category', type: 'text', placeholder: 'Logistics', required: false },
                { label: 'Website URL', key: 'website_url', type: 'url', placeholder: 'https://...', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input style={inputStyle} type={f.type} required={f.required} placeholder={f.placeholder} value={form[f.key as keyof typeof form] as string} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Row</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.row_num} onChange={e => setForm(x => ({ ...x, row_num: e.target.value }))}>
                  <option value="1">Row 1 (scrolls left ←)</option>
                  <option value="2">Row 2 (scrolls right →)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div onClick={() => setForm(x => ({ ...x, is_live: !x.is_live }))} style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${form.is_live ? '#10B981' : 'rgba(255,255,255,.14)'}`, background: form.is_live ? '#10B981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 800 }}>
                  {form.is_live ? '✓' : ''}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Show as live partner (not "SOON")</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'Saving...' : editId ? 'Update' : 'Add Partner →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
