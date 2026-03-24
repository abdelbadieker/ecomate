'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [pw, setPw] = useState({ newPw: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pw.newPw.length < 8) return toast.error('Password must be at least 8 characters')
    if (pw.newPw !== pw.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pw.newPw })
    if (error) toast.error(error.message)
    else { toast.success('Admin password updated!'); setPw({ newPw: '', confirm: '' }) }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'var(--font-inter)' }

  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Admin Settings 🔧</h1>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>Manage admin account security</p>
      </div>

      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '28px' }}>
        <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Change Admin Password</h3>
        <form onSubmit={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'New Password', key: 'newPw', placeholder: 'Min. 8 characters' },
            { label: 'Confirm New Password', key: 'confirm', placeholder: 'Re-enter password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input style={inputStyle} type="password" value={pw[f.key as keyof typeof pw]} onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 20, background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.1)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>🔐 Security Reminder</div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>
          The admin URL <code style={{ background: 'rgba(255,255,255,.06)', padding: '2px 6px', borderRadius: 4, color: 'rgba(255,255,255,.6)' }}>/admin-xm9k2</code> is confidential. Never share it publicly. Only users with the admin role can access the dashboard even if they know the URL.
        </div>
      </div>
    </div>
  )
}
