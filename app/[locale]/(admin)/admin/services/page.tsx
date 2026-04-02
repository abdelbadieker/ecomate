'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/admin/ImageUpload'

export default function ServiceManagement() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '⚙️', plan_required: 'starter', tag: '', tag_color: '', is_active: true, sort_order: 0 })

  const supabase = createClient()

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('sort_order', { ascending: true })
    if (data) setServices(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    if (editingService) {
      const { error } = await supabase.from('services').update(form).eq('id', editingService.id)
      if (error) toast.error(error.message)
      else {
        toast.success('Service updated')
        setModalOpen(false)
        fetchServices()
      }
    } else {
      const { error } = await supabase.from('services').insert([form])
      if (error) toast.error(error.message)
      else {
        toast.success('Service added')
        setModalOpen(false)
        fetchServices()
      }
    }
    setLoading(false)
  }

  async function toggleActive(service: any) {
    const { error } = await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id)
    if (error) toast.error(error.message)
    else fetchServices()
  }

  function openEdit(service: any) {
    setEditingService(service)
    setForm({ 
      name: service.name, 
      description: service.description || '', 
      icon: service.icon || '⚙️', 
      plan_required: service.plan_required || 'starter', 
      tag: service.tag || '',
      tag_color: service.tag_color || '',
      is_active: service.is_active,
      sort_order: service.sort_order || 0
    })
    setModalOpen(true)
  }

  function openAdd() {
    setEditingService(null)
    setForm({ name: '', description: '', icon: '⚙️', plan_required: 'starter', tag: '', tag_color: '', is_active: true, sort_order: 0 })
    setModalOpen(true)
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>🛠️ Platform Services</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>Manage the features and services displayed on the landing page.</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ padding: '12px 24px' }}>
          + Add New Service
        </button>
      </header>

      {loading && services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.2)' }}>Loading services...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
          {services.map(service => (
            <div key={service.id} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 20,
              padding: '24px',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12, 
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {service.icon}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => openEdit(service)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✏️</button>
                  <button onClick={() => toggleActive(service)} style={{ 
                    background: service.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid ' + (service.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                    color: service.is_active ? '#10b981' : '#ef4444',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer'
                   }}>{service.is_active ? 'ACTIVE' : 'INACTIVE'}</button>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{service.name}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.6, marginBottom: 20, minHeight: 44 }}>
                {service.description}
              </p>

              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '4px 12px', 
                background: 'rgba(37, 99, 235, 0.1)', 
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
                color: '#34d399'
              }}>
                🔑 Plan: <span style={{ textTransform: 'uppercase' }}>{service.plan_required}</span>
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
            borderRadius: 24, padding: 32, maxWidth: 520, width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24 }}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Service Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. AI Sales Chatbot"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none' }}
                />
              </div>

              <ImageUpload 
                label="Service Icon / Illustration"
                value={form.icon}
                onChange={url => setForm({...form, icon: url})}
                folder="services"
              />

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Description</label>
                <textarea 
                  required
                  placeholder="Sleek description of the service..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none', minHeight: 100, resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Minimum Plan Required</label>
                <select 
                  value={form.plan_required} onChange={e => setForm({...form, plan_required: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none' }}
                >
                  <option value="starter">Starter / Trial</option>
                  <option value="growth">Growth</option>
                  <option value="business">Business / Custom</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Tag (Optional)</label>
                  <input 
                    type="text" placeholder="e.g. ✓ Arabic · French"
                    value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Sort Order</label>
                  <input 
                    type="number"
                    value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {loading ? 'Processing...' : editingService ? 'Update Service' : 'Create Service'}
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
