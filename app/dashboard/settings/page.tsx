'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [tab, setTab] = useState<'profile' | 'security' | 'plan'>('profile')
  const [form, setForm] = useState({ full_name: '', business_name: '', phone: '', email: '' })
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })

  useEffect(() => {
    const supabase = createClient()
    setLoading(true)
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (p) {
        setProfile(p)
        setForm({
          full_name: p.full_name || '',
          business_name: p.business_name || '',
          phone: p.phone || '',
          email: data.user.email || ''
        })
      }
      setLoading(false)
    })
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Update profiles table
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      business_name: form.business_name,
      phone: form.phone
    }).eq('id', user!.id)

    // Handle email change explicitly
    if (form.email && form.email !== user?.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: form.email })
      if (emailError) {
        toast.error('Email update failed: ' + emailError.message)
        setLoading(false)
        return
      }
      toast.success('Confirmation links sent to both old and new emails!')
    }

    if (error) toast.error(error.message)
    else {
      toast.success('Profile updated!')
      router.refresh()
    }
    setLoading(false)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pw.newPw.length < 8) return toast.error('Password must be at least 8 characters')
    if (pw.newPw !== pw.confirm) return toast.error('Passwords do not match')
    setPwLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pw.newPw })
    if (error) toast.error(error.message)
    else { toast.success('Password updated!'); setPw({ current: '', newPw: '', confirm: '' }) }
    setPwLoading(false)
  }

  // 0. Fetch Plans for the Plan Tab
  const [plans, setPlans] = useState<any[]>([])
  useEffect(() => {
    const supabase = createClient()
    supabase.from('plans').select('*').eq('active', true).order('sort_order', { ascending: true })
      .then(({ data }) => { if (data) setPlans(data) })
  }, [])

  async function deleteAccount() {
    if (!confirm('Are you absolutely sure? This will delete all your data and cannot be undone.')) return
    const supabase = createClient()
    const { error } = await supabase.rpc('delete_user_self')
    
    if (error) {
      console.error('Delete Error:', error)
      toast.error('Error: ' + error.message)
    } else {
      toast.success('Account permanently deleted.')
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,.05)',
    border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 10,
    fontSize: 14, color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font-inter)',
    transition: 'border-color .2s',
  }

  if (loading && !profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="loading-spinner" style={{ marginBottom: 16 }}>🌀</div>
        Loading your settings...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>Settings ⚙️</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Manage your account, security and subscription.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 12, padding: 4 }}>
        {(['profile', 'security', 'plan'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === t ? 'rgba(37,99,235,.2)' : 'transparent',
            color: tab === t ? '#2563eb' : 'var(--text-muted)',
            fontFamily: 'var(--font-poppins)', fontWeight: 600, fontSize: 13,
            textTransform: 'capitalize', transition: 'all .2s',
          }}>{t}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 16, padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 20 }}>Profile Information</h3>
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input style={inputStyle} type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Business / Store Name</label>
                <input style={inputStyle} type="text" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="My Store DZ" />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Phone Number</label>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+213 555 00 00 00" />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Current Plan</label>
                <div style={{ padding: '11px 16px', background: 'rgba(37,99,235,.08)', border: '1px solid rgba(37,99,235,.2)', borderRadius: 10, fontSize: 14, color: '#2563eb', fontWeight: 600 }}>
                  {profile?.plan?.toLowerCase() === 'starter' ? '⏱ Starter (Trial)' : profile?.plan?.toLowerCase() === 'growth' ? '⚡ Growth' : '💎 Business'}
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div style={{ background: 'rgba(239,68,68,.03)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 16, padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>This action will permanently delete your account and all your data. This cannot be undone.</p>
            <button onClick={deleteAccount} style={{
              background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'filter .2s',
            }} onMouseOver={e => (e.currentTarget.style.filter = 'brightness(1.1)')} onMouseOut={e => (e.currentTarget.style.filter = 'none')}>
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 16, padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 20 }}>Change Password</h3>
          <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'New Password', key: 'newPw', placeholder: 'Min. 8 characters' },
              { label: 'Confirm New Password', key: 'confirm', placeholder: 'Re-enter password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input style={inputStyle} type="password" value={pw[f.key as keyof typeof pw]} onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}
            <button type="submit" disabled={pwLoading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Plan Tab */}
      {tab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: plan.is_popular ? 'linear-gradient(145deg,rgba(30,58,138,.5),rgba(10,20,38,.8))' : 'var(--bg-card)',
              border: `1px solid ${profile?.plan === plan.id ? '#10B981' : plan.is_popular ? 'rgba(37,99,235,.3)' : 'var(--border-c)'}`,
              borderRadius: 14, padding: '20px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                  {plan.name} {profile?.plan === plan.id && '✓ Current Plan'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{plan.period}</div>
                <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 800, color: plan.is_popular ? '#10B981' : 'var(--text-main)' }}>
                  {plan.price === 0 ? (plan.id === 'starter' ? 'Free' : 'Custom') : `${plan.price.toLocaleString()} DA/mo`}
                </div>
              </div>
              <div style={{ maxWidth: 200 }}>
                {(Array.isArray(plan.features) ? plan.features.slice(0, 3) : []).map((f: string) => <div key={f} style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 4 }}>✓ {f}</div>)}
              </div>
              {profile?.plan !== plan.id && !profile?.plan_status?.includes('pending') && (
                <Link href={plan.id === 'business' ? 'mailto:contact@ecomate.dz' : '/checkout'} className="btn-primary" style={{ padding: '10px 22px', fontSize: 13, textDecoration: 'none' }}>
                  {plan.id === 'business' ? 'Contact Sales' : 'Upgrade →'}
                </Link>
              )}
              {profile?.plan_status?.includes('pending') && profile?.plan === plan.id && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,.1)', padding: '6px 12px', borderRadius: 8 }}>PENDING APPROVAL</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
