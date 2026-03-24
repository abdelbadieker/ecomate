'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', icon: '⚡', image_url: '', is_active: true })

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    const supabase = createClient()
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    setServices(data || [])
    setLoading(false)
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = { ...form }
    
    if (editId) {
      await supabase.from('services').update(payload).eq('id', editId)
      toast.success('Service updated!')
    } else {
      await supabase.from('services').insert(payload)
      toast.success('Service added!')
    }
    fetchServices()
    setShowAdd(false); setEditId(null)
    setForm({ title: '', description: '', icon: '⚡', image_url: '', is_active: true })
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('services').update({ is_active: !current }).eq('id', id)
    setServices(s => s.map(x => x.id === id ? { ...x, is_active: !current } : x))
    toast.success(`Service ${!current ? 'activated' : 'deactivated'}`)
  }

  async function deleteService(id: string) {
    if (!confirm('Are you absolutely sure you want to delete this service? It will vanish from the landing page.')) return
    const supabase = createClient()
    await supabase.from('services').delete().eq('id', id)
    setServices(s => s.filter(x => x.id !== id))
    toast.success('Service deleted')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 9, fontSize: 13.5, color: '#fff', outline: 'none', fontFamily: 'var(--font-inter)' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Services ⚙️</h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>Manage the core features displayed on the EcoMate Landing Page.</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ title: '', description: '', icon: '⚡', image_url: '', is_active: true }) }} className="btn-primary" style={{ padding: '11px 22px' }}>+ New Service</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,.3)' }}>Loading Features...</div> : (
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-table">
            <thead>
              <tr><th>Icon</th><th>Title</th><th>Description</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {s.image_url ? <img src={s.image_url} style={{ width: 28, height: 28, objectFit: 'contain' }} alt="" /> : s.icon}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{s.title}</td>
                  <td style={{ maxWidth: 300, color: 'rgba(255,255,255,.5)', fontSize: 12, lineHeight: 1.5 }}>
                    {s.description.length > 80 ? s.description.substring(0, 80) + '...' : s.description}
                  </td>
                  <td>
                    <button onClick={() => toggleActive(s.id, s.is_active)} style={{
                      padding: '5px 12px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      background: s.is_active ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.08)',
                      borderColor: s.is_active ? 'rgba(16,185,129,.25)' : 'rgba(245,158,11,.2)',
                      color: s.is_active ? '#10B981' : '#f59e0b',
                    }}>
                      {s.is_active ? '✅ Active' : '⏸️ Hidden'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditId(s.id); setForm({ title: s.title, description: s.description || '', icon: s.icon || '⚡', image_url: s.image_url || '', is_active: s.is_active }); setShowAdd(true) }} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.2)', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => deleteService(s.id)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,.3)' }}>No services built yet! Click "New Service" to add features to your landing page.</td>
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
          <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440 }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 20 }}>{editId ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={saveService} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Service Title *</label>
                <input style={inputStyle} type="text" required placeholder="Full AI Sales Chatbot" value={form.title} onChange={e => setForm(x => ({ ...x, title: e.target.value }))} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Description *</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} required placeholder="Describe what this service does for the client..." value={form.description} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Emoji Icon</label>
                  <input style={inputStyle} type="text" placeholder="🤖" value={form.icon} onChange={e => setForm(x => ({ ...x, icon: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Or Image Link</label>
                  <input style={inputStyle} type="url" placeholder="https://..." value={form.image_url} onChange={e => setForm(x => ({ ...x, image_url: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <div onClick={() => setForm(x => ({ ...x, is_active: !x.is_active }))} style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${form.is_active ? '#10B981' : 'rgba(255,255,255,.14)'}`, background: form.is_active ? '#10B981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 800 }}>
                  {form.is_active ? '✓' : ''}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Show on Landing Page</span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'Saving...' : editId ? 'Update Service' : 'Add Service →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
