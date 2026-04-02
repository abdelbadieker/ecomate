'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/admin/ImageUpload'

export default function PartnerManagement() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<any>(null)
  const [form, setForm] = useState({ name: '', logo: '🤝', category: '', row_num: 1, is_live: true, sort_order: 0 })

  const supabase = createClient()

  useEffect(() => {
    fetchPartners()
  }, [])

  async function fetchPartners() {
    setLoading(true)
    const { data } = await supabase.from('partners').select('*').order('sort_order', { ascending: true })
    if (data) setPartners(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    if (editingPartner) {
      const { error } = await supabase.from('partners').update(form).eq('id', editingPartner.id)
      if (error) toast.error(error.message)
      else {
        toast.success('Partner updated')
        setModalOpen(false)
        fetchPartners()
      }
    } else {
      const { error } = await supabase.from('partners').insert([form])
      if (error) toast.error(error.message)
      else {
        toast.success('Partner added')
        setModalOpen(false)
        fetchPartners()
      }
    }
    setLoading(false)
  }

  async function toggleLive(partner: any) {
    const { error } = await supabase.from('partners').update({ is_live: !partner.is_live }).eq('id', partner.id)
    if (error) toast.error(error.message)
    else fetchPartners()
  }

  async function deletePartner(id: string) {
    if (!confirm('Are you sure you want to remove this partner?')) return
    const { error } = await supabase.from('partners').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Partner removed')
      fetchPartners()
    }
  }

  function openEdit(partner: any) {
    setEditingPartner(partner)
    setForm({ 
      name: partner.name, 
      logo: partner.logo, 
      category: partner.category || '', 
      row_num: partner.row_num || 1, 
      is_live: partner.is_live,
      sort_order: partner.sort_order || 0
    })
    setModalOpen(true)
  }

  function openAdd() {
    setEditingPartner(null)
    setForm({ name: '', logo: '🤝', category: '', row_num: 1, is_live: true, sort_order: partners.length + 1 })
    setModalOpen(true)
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    transition: 'all 0.2s ease'
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>🤝 Partner Ecosystem</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>Manage your trusted partners and logos for the landing page.</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ padding: '12px 24px' }}>
          + Add New Partner
        </button>
      </header>

      {loading && partners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.2)' }}>Loading partners...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {partners.map(partner => (
            <div key={partner.id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ 
                  width: 54, 
                  height: 54, 
                  borderRadius: 12, 
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {partner.logo.startsWith('http') || partner.logo.startsWith('/') ? (
                    <img src={partner.logo} alt={partner.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  ) : partner.logo}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{partner.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>{partner.category || 'Uncategorized'} • Row {partner.row_num}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => toggleLive(partner)}
                  style={{
                    background: partner.is_live ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (partner.is_live ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'),
                    color: partner.is_live ? '#10b981' : 'rgba(255, 255, 255, 0.3)',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {partner.is_live ? 'LIVE' : 'HIDDEN'}
                </button>
                <button onClick={() => openEdit(partner)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                <button onClick={() => deletePartner(partner.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: '#0a1020', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: 32, maxWidth: 480, width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24 }}>
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Partner Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Yalidine Express"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none' }}
                />
              </div>

              <ImageUpload 
                label="Partner Logo"
                value={form.logo}
                onChange={url => setForm({...form, logo: url})}
                folder="partners"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Category</label>
                  <input 
                    type="text"
                    placeholder="e.g. Logistics"
                    value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Display Row (1 or 2)</label>
                <select 
                  value={form.row_num} onChange={e => setForm({...form, row_num: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none' }}
                >
                  <option value={1}>Upper Row (1)</option>
                  <option value={2}>Lower Row (2)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Sort Order</label>
                <input 
                  type="number"
                  value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {loading ? 'Processing...' : editingPartner ? 'Update Partner' : 'Create Partner'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
