'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '0 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 24, textDecoration: 'none' }}>
          <span style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eco</span>
          <span style={{ background: 'linear-gradient(135deg,#2563eb,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
        </Link>

        <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '40px 36px' }}>
          {!sent ? <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
              <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Reset your password</h1>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.38)', lineHeight: 1.6 }}>
                Enter your email and we'll send you a secure reset link instantly.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Your Email Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: .35 }}>✉️</span>
                  <input
                    className="auth-input" type="email" required
                    placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.22)', marginTop: 6 }}>
                  We'll send a secure reset link to this email.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
          </> : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Check your inbox!</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, marginBottom: 24 }}>
                We sent a secure password reset link to <br />
                <strong style={{ color: '#2563eb' }}>{email}</strong>.<br />
                Click the link in the email to create a new password.
              </p>
              <div style={{ background: 'rgba(37,99,235,.08)', border: '1px solid rgba(37,99,235,.2)', borderRadius: 10, padding: '12px 16px', fontSize: 12.5, color: 'rgba(255,255,255,.45)', textAlign: 'left' }}>
                ℹ️ Didn't get it? Check your spam folder. The link expires in 1 hour.
              </div>
              <button onClick={() => { setSent(false); setEmail('') }} style={{ marginTop: 20, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Try a different email
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
