'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AgencyCRM() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error(error.message)
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  const handleEdit = (client: any) => {
    setEditingId(client.id)
    setEditForm({
      meta_partner_id: client.meta_partner_id || '',
      telegram_token: client.telegram_token || '',
      google_drive_folder_url: client.google_drive_folder_url || '',
      plan: client.plan || 'starter'
    })
  }

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .update(editForm)
      .eq('id', id)

    if (error) {
      toast.error('Failed to update client')
    } else {
      toast.success('Client updated successfully')
      setEditingId(null)
      fetchClients()
    }
  }

  const filtered = clients.filter(c => 
    c.agency_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>👥 Agency CRM</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Manage merchant configurations and growth settings.</p>
        </div>
        <input 
          type="text" 
          placeholder="Search clients..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ 
            padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', width: 300
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)' }}>Loading clients...</div>
        ) : filtered.map(client => (
          <div key={client.id} style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 20,
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 12, 
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 20, fontWeight: 800 
                }}>
                  {client.agency_name?.[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{client.agency_name}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.4)', margin: '4px 0 0' }}>{client.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ 
                  padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                  background: client.plan === 'growth' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: client.plan === 'growth' ? '#10b981' : 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase', border: '1px solid currentColor'
                }}>
                  {client.plan} Plan
                </span>
                <button 
                  onClick={() => editingId === client.id ? handleSave(client.id) : handleEdit(client)}
                  style={{
                    background: editingId === client.id ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                    color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {editingId === client.id ? '💾 Save Changes' : '⚙️ Configure'}
                </button>
              </div>
            </div>

            {editingId === client.id ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>Meta Partner ID</label>
                  <input 
                    value={editForm.meta_partner_id}
                    onChange={e => setEditForm({...editForm, meta_partner_id: e.target.value})}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>Telegram Token</label>
                  <input 
                    value={editForm.telegram_token}
                    onChange={e => setEditForm({...editForm, telegram_token: e.target.value})}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>Plan Tier</label>
                  <select 
                    value={editForm.plan}
                    onChange={e => setEditForm({...editForm, plan: e.target.value})}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: '#fff' }}
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>Creative Studio URL</label>
                  <input 
                    value={editForm.google_drive_folder_url}
                    onChange={e => setEditForm({...editForm, google_drive_folder_url: e.target.value})}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: '#fff' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(255, 255, 255, 0.3)' }}>
                <span>Meta: <span style={{ color: client.meta_partner_id ? '#fff' : 'inherit' }}>{client.meta_partner_id || 'Not Set'}</span></span>
                <span>Telegram: <span style={{ color: client.telegram_token ? '#fff' : 'inherit' }}>{client.telegram_token ? '••••••••' : 'Not Set'}</span></span>
                <span>Studio: <span style={{ color: client.google_drive_folder_url ? '#fff' : 'inherit' }}>{client.google_drive_folder_url ? 'Linked' : 'Not Set'}</span></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
