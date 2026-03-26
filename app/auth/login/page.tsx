'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function LoginContent() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')
  const needsVerify = searchParams.get('verify')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email address first. Check your inbox!')
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const isAdmin = profile?.role === 'admin'
      
      if (isAdmin) {
        toast.success('Welcome back, Admin!')
        router.push('/admin')
        router.refresh()
        return
      }
    }

    toast.success('Welcome back!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="login-layout" style={{
      minHeight: '100vh', display: 'grid',
      background: 'var(--bg-body)',
    }}>
      {/* Left — Brand */}
      <div className="login-brand-side" style={{
        background: 'linear-gradient(145deg,#1E3A8A 0%,#1d4ed8 55%,#0a1020 100%)',
        padding: '48px 44px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: .06,
          backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.9) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <Link href="/" style={{
          fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 24, color: '#fff',
          letterSpacing: '-.5px', position: 'relative', zIndex: 1, textDecoration: 'none',
        }}>
          Eco<span style={{
            background: 'linear-gradient(135deg,#60a5fa,#10b981)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Mate</span>
        </Link>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'var(--font-poppins)', fontSize: 28, fontWeight: 800,
            color: '#fff', lineHeight: 1.2, marginBottom: 14,
          }}>
            Welcome back.<br />
            <span style={{
              background: 'linear-gradient(135deg,#10b981,#34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Your store is waiting.</span>
          </h2>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 260, marginBottom: 26 }}>
            Sign back in to manage your orders, customers and AI chatbot — all from one dashboard.
          </p>
          {['AI chatbot live on all social platforms', 'Orders managed automatically 24/7', 'Real-time analytics dashboard'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#10b981', flexShrink: 0,
              }}>✓</div>
              {f}
            </div>
          ))}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.2)',
          borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#10b981',
          position: 'relative', zIndex: 1,
        }}>
          <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          🇩🇿 Built for Algeria
        </div>
      </div>

      {/* Right — Form */}
      <div style={{
        background: 'var(--dms,#0a1628)', padding: '0 48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative',
      }}>
        <Link href="/" style={{
          position: 'absolute', top: 24, left: 24, fontSize: 12,
          color: 'rgba(255,255,255,.3)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← Back to home</Link>

        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <h1 style={{
            fontFamily: 'var(--font-poppins)', fontSize: 26, fontWeight: 800,
            color: '#fff', letterSpacing: '-.02em', marginBottom: 6,
          }}>Welcome back 👋</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.38)', marginBottom: authError ? 16 : 32 }}>
            Sign in to your EcoMate dashboard
          </p>

          {authError && (
            <div style={{
              background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13,
              color: '#f87171', marginBottom: 20,
            }}>
              ⚠️ {decodeURIComponent(authError)}
            </div>
          )}

          {needsVerify && (
            <div style={{
              background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)',
              borderRadius: 10, padding: '12px 16px', fontSize: 13.5,
              color: '#10b981', marginBottom: 24, lineHeight: 1.5,
            }}>
              ✉️ <strong>Verify your email!</strong><br />
              We sent a confirmation link to your inbox. Please click it to activate your EcoMate account (check your spam folder if you don&apos;t see it).
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: .35 }}>✉️</span>
                <input
                  className="auth-input" type="email" required
                  placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: .35 }}>🔒</span>
                <input
                  className="auth-input" type={showPw ? 'text' : 'password'} required
                  placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                  color: 'rgba(255,255,255,.3)',
                }}>{showPw ? '🙈' : '👁'}</button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '14px', fontSize: 15 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                    animation: 'spin .6s linear infinite', display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'rgba(255,255,255,.3)', marginTop: 28 }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-layout { grid-template-columns: 1fr 1fr; }
        @media(max-width:700px) {
          .login-layout { grid-template-columns: 1fr; }
          .login-brand-side { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050a14' }} />}>
      <LoginContent />
    </Suspense>
  )
}
