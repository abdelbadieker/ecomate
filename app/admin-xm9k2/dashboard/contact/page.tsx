'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AdminContactSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    sales_email: '', support_email: '',
    sales_phone: '', support_phone: '',
    office_address: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('contact_settings').select('*').single()
      if (data) {
        setForm({
          sales_email: data.sales_email,
          support_email: data.support_email,
          sales_phone: data.sales_phone,
          support_phone: data.support_phone,
          office_address: data.office_address
        })
      }
      setFetching(false)
    }
    fetchSettings()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('contact_settings').update(form).eq('id', (await supabase.from('contact_settings').select('id').single()).data?.id)
    if (error) toast.error('Failed to update: ' + error.message)
    else {
      toast.success('Contact settings updated globally!')
      router.refresh()
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,.05)',
    border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 10,
    fontSize: 14, color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font-inter)',
    transition: 'border-color .2s',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', 
    textTransform: 'uppercase', display: 'block', marginBottom: 6
  }

  if (fetching) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>Contact Page Settings ☎️</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Manage the emails and phone numbers displayed on the public /contact page.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}>Sales Email</label>
            <input style={inputStyle} type="email" required value={form.sales_email} onChange={e => setForm(f => ({ ...f, sales_email: e.target.value }))} placeholder="sales@ecomate.dz" />
          </div>
          <div>
            <label style={labelStyle}>Sales Phone Number</label>
            <input style={inputStyle} type="tel" required value={form.sales_phone} onChange={e => setForm(f => ({ ...f, sales_phone: e.target.value }))} placeholder="+213 555..." />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}>Support Team Email</label>
            <input style={inputStyle} type="email" required value={form.support_email} onChange={e => setForm(f => ({ ...f, support_email: e.target.value }))} placeholder="support@ecomate.dz" />
          </div>
          <div>
            <label style={labelStyle}>Support Phone Number</label>
            <input style={inputStyle} type="tel" required value={form.support_phone} onChange={e => setForm(f => ({ ...f, support_phone: e.target.value }))} placeholder="+213 555..." />
          </div>
        </div>

        <div>
          <label style={labelStyle}>HQ Office Address</label>
          <input style={inputStyle} type="text" required value={form.office_address} onChange={e => setForm(f => ({ ...f, office_address: e.target.value }))} placeholder="Algiers, Algeria" />
        </div>

        <div style={{ marginTop: 12, paddingTop: 20, borderTop: '1px solid var(--border-c)' }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 32px' }}>
            {loading ? 'Saving to Database...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
