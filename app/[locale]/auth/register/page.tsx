'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', businessName: '',
    email: '', phone: '', password: '', confirm: '', terms: false,
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  function pwStrength(pw: string) {
    if (!pw) return { score: 0, label: '—', color: 'rgba(255,255,255,.1)' }
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) s++
    return s === 1 ? { score: 1, label: 'Weak', color: '#ef4444' }
         : s === 2 ? { score: 2, label: 'Good', color: '#f59e0b' }
         : s === 3 ? { score: 3, label: 'Strong', color: '#10b981' }
         : { score: 0, label: '—', color: 'rgba(255,255,255,.1)' }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 3) { setStep(s => s + 1); return }
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (!form.terms) return toast.error('Please accept the terms')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`,
          business_name: form.businessName,
          phone: form.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Account created! Please verify your email.')
    router.push('/auth/login?verify=true')
  }

  const str = pwStrength(form.password)
  const steps = ['Account', 'Business', 'Security']

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px 12px 44px',
    background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)',
    borderRadius: 11, fontSize: 14, fontFamily: 'var(--font-inter)',
    color: '#fff', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-body)' }}>
      {/* Left panel */}
      <div style={{
        background: 'linear-gradient(145deg,#1E3A8A 0%,#1d4ed8 55%,#0a1020 100%)',
        padding: '48px 44px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .06, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        <Link href="/" style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 24, color: '#fff', position: 'relative', zIndex: 1, textDecoration: 'none' }}>
          Eco<span style={{ background: 'linear-gradient(135deg,#60a5fa,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
        </Link>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
            Start selling smarter.<br />
            <span style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>14 days free.</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 24 }}>No credit card needed. No contracts. Cancel anytime.</p>
          {['Full AI Sales Chatbot on FB, IG, WhatsApp', 'Unlimited orders & product catalog', 'COD tracking across 58 wilayas', 'AI Growth Agent finds new clients for you'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#10b981', flexShrink: 0 }}>✓</div>
              {f}
            </div>
          ))}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#10b981', position: 'relative', zIndex: 1 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />🇩🇿 Built for Algeria
        </div>
      </div>

      {/* Right — Form */}
      <div style={{ background: '#0a1628', padding: '0 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', top: 24, left: 24, fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>← Back to home</Link>

        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                height: 7, borderRadius: 4, transition: 'all .35s',
                width: step === i + 1 ? 22 : 7,
                background: step > i ? '#10b981' : step === i + 1 ? '#2563eb' : 'rgba(255,255,255,.1)',
              }} />
            ))}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginLeft: 6, alignSelf: 'center' }}>
              Step {step} of {steps.length} — {steps[step - 1]}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            Create your account ✨
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.38)', marginBottom: 24 }}>
            Start your 14-day free trial — no credit card needed
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Step 1 — Personal */}
            {step === 1 && <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>First Name</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .35 }}>👤</span>
                    <input style={inputStyle} type="text" required placeholder="Youcef" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Last Name</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .35 }}>👤</span>
                    <input style={inputStyle} type="text" required placeholder="Benmoussa" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .35 }}>✉️</span>
                  <input style={inputStyle} type="email" required placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
            </>}

            {/* Step 2 — Business */}
            {step === 2 && <>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Business / Store Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .35 }}>🏪</span>
                  <input style={inputStyle} type="text" required placeholder="My Store DZ" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Phone Number (Algeria)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .35 }}>📱</span>
                  <input style={inputStyle} type="tel" placeholder="+213 555 00 00 00" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
            </>}

            {/* Step 3 — Security */}
            {step === 3 && <>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .35 }}>🔒</span>
                  <input style={{ ...inputStyle, paddingRight: 44 }} type={showPw ? 'text' : 'password'} required placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,.3)' }}>{showPw ? '🙈' : '👁'}</button>
                </div>
                {form.password && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: str.score >= i ? str.color : 'rgba(255,255,255,.07)', transition: 'background .3s' }} />
                    ))}
                    <span style={{ fontSize: 11, fontWeight: 600, color: str.color, marginLeft: 4, minWidth: 40 }}>{str.label}</span>
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .35 }}>🔒</span>
                  <input style={inputStyle} type="password" required placeholder="Re-enter password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div onClick={() => set('terms', !form.terms)} style={{
                  width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  border: `1.5px solid ${form.terms ? '#2563eb' : 'rgba(255,255,255,.14)'}`,
                  background: form.terms ? '#2563eb' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: '#fff', fontWeight: 800,
                }}>
                  {form.terms ? '✓' : ''}
                </div>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)', lineHeight: 1.55 }}>
                  I agree to the <a style={{ color: '#2563eb', fontWeight: 600 }}>Terms of Service</a> and <a style={{ color: '#2563eb', fontWeight: 600 }}>Privacy Policy</a>
                </span>
              </div>
            </>}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary" style={{ padding: '13px 20px' }}>← Back</button>
              )}
              <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15 }}>
                {loading ? 'Creating account...' : step < 3 ? 'Continue →' : 'Create Account — Free →'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'rgba(255,255,255,.3)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
