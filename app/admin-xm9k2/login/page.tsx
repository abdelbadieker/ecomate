'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Invalid credentials')
      setLoading(false)
      return
    }

    // Check if admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

    const isAdmin = adminData?.role === 'admin' || email === 'abdelbadie.kertimi1212@gmail.com'

    if (!isAdmin) {
      await supabase.auth.signOut()
      toast.error('Access denied — admin only')
      setLoading(false)
      return
    }

    toast.success('Welcome, Admin!')
    router.push('/admin-xm9k2/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050a14',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,.15), transparent 65%)',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 26, marginBottom: 8 }}>
            <span style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eco</span>
            <span style={{ background: 'linear-gradient(135deg,#2563eb,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)',
            borderRadius: 100, padding: '4px 14px', fontSize: 11, fontWeight: 700, color: '#ef4444',
          }}>🔐 Admin Access Only</div>
        </div>

        <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: '36px 32px' }}>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Admin Sign In</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', marginBottom: 24 }}>This area is restricted to authorized administrators.</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: .35, fontSize: 14 }}>✉️</span>
                <input
                  className="auth-input" type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ecomate.dz"
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: .35, fontSize: 14 }}>🔒</span>
                <input
                  className="auth-input" type={showPw ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Admin password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', fontSize: 14 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}>
              {loading ? 'Verifying...' : '🔐 Sign In as Admin'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,.15)' }}>
          This URL is confidential. Do not share it.
        </p>
      </div>
    </div>
  )
}
