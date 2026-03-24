'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const PLANS = [
  {
    slug: 'growth', name: 'Growth', price: 4900, period: '/month',
    desc: 'Full AI system for serious sellers',
    features: ['Full AI Sales System', 'Unlimited orders & products', 'All social platforms (FB, IG, WA)', 'Delivery auto-tracking (58 wilayas)', 'CRM & customer database', 'AI Growth Agent (lead outreach)', 'Analytics dashboard', 'Priority support'],
    color: '#10B981',
  },
  {
    slug: 'business', name: 'Business', price: 0, period: 'Custom',
    desc: 'For large operations — contact us',
    features: ['Everything in Growth', 'Advanced AI Growth Agent', 'Custom lead targeting rules', 'Priority email deliverability', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    color: '#2563eb',
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan')
  const [loading, setLoading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ name: '', phone: '', ref: '', method: 'ccp' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(p)
      setPaymentForm(f => ({ ...f, name: p?.full_name || '' }))
    })
  }, [])

  async function completePurchase(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const plan = PLANS.find(p => p.slug === selectedPlan)!

    // Create subscription record
    const { error: subErr } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan_slug: selectedPlan,
      status: 'active',
      payment_method: paymentForm.method,
      payment_ref: paymentForm.ref,
      amount_da: plan.price,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      checkout_completed: true,
    })

    if (subErr) { toast.error('Error processing. Please contact support.'); setLoading(false); return }

    // Update profile plan
    await supabase.from('profiles').update({
      plan: selectedPlan,
      plan_status: 'active',
    }).eq('id', user.id)

    setStep('success')
    setLoading(false)
  }

  const selectedPlanData = PLANS.find(p => p.slug === selectedPlan)!

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)', padding: '80px 5%' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Back */}
        <Link href="/dashboard" style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          ← Back to Dashboard
        </Link>

        {step === 'success' ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,.12)', border: '2px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>✅</div>
            <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 12 }}>You're on Growth! 🎉</h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 32px' }}>
              Your {selectedPlanData.name} plan is now active. All features are unlocked. Let's grow your business!
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <Link href="/dashboard" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15, textDecoration: 'none' }}>
                Go to Dashboard →
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
            {/* Left */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
                {step === 'plan' ? 'Choose your plan' : 'Complete your order'}
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 28 }}>
                {step === 'plan' ? 'Select the plan that fits your business' : 'Tell us how you\'ll pay — we\'ll activate your plan manually within 2 hours'}
              </p>

              {step === 'plan' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {PLANS.map(plan => (
                    <div key={plan.slug}
                      onClick={() => plan.slug === 'business' ? null : setSelectedPlan(plan.slug)}
                      style={{
                        background: selectedPlan === plan.slug ? 'linear-gradient(145deg,rgba(30,58,138,.4),rgba(10,20,38,.8))' : 'var(--bg-card)',
                        border: `1.5px solid ${selectedPlan === plan.slug ? plan.color : 'var(--border-c)'}`,
                        borderRadius: 16, padding: '22px', cursor: plan.slug === 'business' ? 'default' : 'pointer',
                        transition: 'all .2s', position: 'relative',
                      }}>
                      {selectedPlan === plan.slug && (
                        <div style={{ position: 'absolute', top: -1, right: 16, transform: 'translateY(-50%)', background: plan.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 100, letterSpacing: '.06em' }}>SELECTED</div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{plan.name}</div>
                          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)' }}>{plan.desc}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 26, fontWeight: 900, color: plan.color }}>
                            {plan.price > 0 ? `${plan.price.toLocaleString()} DA` : 'Custom'}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{plan.period}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {plan.features.map(f => (
                          <div key={f} style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', display: 'flex', gap: 6 }}>
                            <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>{f}
                          </div>
                        ))}
                      </div>
                      {plan.slug === 'business' && (
                        <a href="mailto:contact@ecomate.dz" className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex', padding: '10px 22px', fontSize: 13, textDecoration: 'none' }}>
                          Contact Sales →
                        </a>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setStep('payment')} className="btn-primary" style={{ padding: '15px', justifyContent: 'center', fontSize: 15 }}>
                    Continue to Payment →
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 16, padding: '28px' }}>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Payment Method</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[{ key: 'ccp', label: '🏦 CCP Transfer' }, { key: 'baridimob', label: '📱 BaridiMob' }, { key: 'cash', label: '💵 Cash on Meeting' }].map(m => (
                        <button key={m.key} onClick={() => setPaymentForm(f => ({ ...f, method: m.key }))} style={{
                          padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${paymentForm.method === m.key ? '#2563eb' : 'rgba(255,255,255,.1)'}`,
                          background: paymentForm.method === m.key ? 'rgba(37,99,235,.12)' : 'transparent',
                          color: paymentForm.method === m.key ? '#2563eb' : 'rgba(255,255,255,.45)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                        }}>{m.label}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(37,99,235,.08)', border: '1px solid rgba(37,99,235,.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
                    ℹ️ <strong style={{ color: '#fff' }}>How it works:</strong> Transfer <strong style={{ color: '#10B981' }}>4,900 DA</strong> to our CCP account, then fill in your reference number below. Our team activates your plan within 2 hours.
                    <br /><br />CCP: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>0024855742 / Clé 78</strong>
                  </div>

                  <form onSubmit={completePurchase} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'Full Name', key: 'name', placeholder: 'As on your account', type: 'text' },
                      { label: 'Phone Number', key: 'phone', placeholder: '+213 555 00 00 00', type: 'tel' },
                      { label: 'Transfer Reference / Reçu Number', key: 'ref', placeholder: 'e.g. 2024-03-15-1234', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{f.label}</label>
                        <input
                          style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'var(--font-inter)' }}
                          type={f.type} required
                          placeholder={f.placeholder}
                          value={paymentForm[f.key as keyof typeof paymentForm]}
                          onChange={e => setPaymentForm(x => ({ ...x, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button type="button" onClick={() => setStep('plan')} className="btn-secondary" style={{ flex: 1 }}>← Back</button>
                      <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px' }}>
                        {loading ? 'Confirming...' : 'Confirm Order — 4,900 DA →'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 16, padding: '24px', position: 'sticky', top: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>Order Summary</h3>
              <div style={{ borderBottom: '1px solid var(--border-c)', paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-sub)' }}>EcoMate {selectedPlanData.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{selectedPlanData.price > 0 ? `${selectedPlanData.price.toLocaleString()} DA` : 'Custom'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly subscription</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-poppins)' }}>{selectedPlanData.price > 0 ? `${selectedPlanData.price.toLocaleString()} DA` : 'Custom'}</span>
              </div>
              <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
                ✅ Plan activated within 2 hours after payment confirmation<br />
                ✅ Cancel anytime — no long-term contract<br />
                ✅ 🇩🇿 Made in Algeria — support in Arabic/French
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
