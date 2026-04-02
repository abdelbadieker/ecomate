'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase will handle the session from the URL hash automatically
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery mode — form is ready
      }
    })
  }, [])

  function strength(pw: string) {
    if (!pw) return { score: 0, label: '—', color: 'rgba(255,255,255,.1)' }
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) s++
    return s === 1 ? { score: 1, label: 'Weak', color: '#ef4444' }
         : s === 2 ? { score: 2, label: 'Good', color: '#f59e0b' }
         : s >= 3  ? { score: 3, label: 'Strong', color: '#10b981' }
         : { score: 0, label: '—', color: 'rgba(255,255,255,.1)' }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const str = strength(password)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '0 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 24, textDecoration: 'none' }}>
          <span style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eco</span>
          <span style={{ background: 'linear-gradient(135deg,#2563eb,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
        </Link>

        <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '40px 36px' }}>
          {!done ? <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
              <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>New password</h1>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.38)' }}>Choose a strong password for your account</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: .35 }}>🔒</span>
                  <input
                    className="auth-input" type={showPw ? 'text' : 'password'} required
                    placeholder="Min. 8 characters" value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,.3)' }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                {password && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: str.score >= i ? str.color : 'rgba(255,255,255,.07)', transition: 'background .3s' }} />
                    ))}
                    <span style={{ fontSize: 11, fontWeight: 600, color: str.color, marginLeft: 4 }}>{str.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: .35 }}>🔒</span>
                  <input
                    className="auth-input" type="password" required
                    placeholder="Re-enter new password" value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    style={{ borderColor: confirm && confirm !== password ? '#ef4444' : '' }}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
                {loading ? 'Saving...' : 'Save New Password →'}
              </button>
            </form>
          </> : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,.12)', border: '2px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>✅</div>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Password updated! 🔐</h2>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)' }}>Redirecting you to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
