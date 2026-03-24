'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', fontSize: 22, padding: 0, color: (hover || value) >= s ? '#f59e0b' : 'rgba(255,255,255,.2)', transition: 'color .15s' }}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function Reviews({ reviews: initialReviews }: { reviews: any[] }) {
  const [reviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ rating: 5, content: '', plan_used: '' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(p)
      setForm(f => ({ ...f, plan_used: p?.plan || '' }))
    })
  }, [])

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { toast.error('Please sign in to leave a review'); return }
    if (form.content.length < 20) { toast.error('Review must be at least 20 characters'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      reviewer_name: profile?.full_name || 'Anonymous',
      business_name: profile?.business_name || '',
      rating: form.rating,
      content: form.content,
      plan_used: form.plan_used,
      is_approved: false,
    })
    if (error) { toast.error(error.message); setSubmitting(false); return }
    setSubmitted(true)
    setShowForm(false)
    setSubmitting(false)
    toast.success('Review submitted! It will appear after admin approval.')
  }

  return (
    <section id="reviews" style={{ padding: '100px 5%', background: 'var(--bg-section)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--s)', marginBottom: 18 }}>
            <span style={{ width: 16, height: 1.5, background: 'var(--s)', display: 'block' }} />
            Real Results
            <span style={{ width: 16, height: 1.5, background: 'var(--s)', display: 'block' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(30px,3.8vw,52px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.1 }}>
            Trusted by Algerian{' '}
            <span style={{ background: 'linear-gradient(135deg,#10B981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>merchants.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 32px' }}>
            Real feedback from real business owners across Algeria.
          </p>

          {!submitted ? (
            <button
              onClick={() => user ? setShowForm(true) : toast.error('Sign in first to leave a review')}
              className="btn-secondary"
              style={{ fontSize: 14, padding: '11px 26px' }}
            >
              ⭐ Leave Your Review
            </button>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 100, padding: '8px 18px', fontSize: 13, color: '#10B981', fontWeight: 600 }}>
              ✅ Review submitted — pending approval
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20, marginBottom: 40 }}>
            {reviews.map((r: any) => (
              <div key={r.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-c)',
                borderRadius: 18, padding: '24px',
                transition: 'border-color .3s, transform .3s',
              }}>
                {r.is_featured && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>
                    ⭐ Featured
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: 16, color: r.rating >= s ? '#f59e0b' : 'rgba(255,255,255,.15)' }}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' }}>
                  &ldquo;{r.content}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border-c)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {r.reviewer_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>{r.reviewer_name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {r.business_name || 'EcoMate User'}
                      {r.plan_used && ` · ${r.plan_used.charAt(0).toUpperCase() + r.plan_used.slice(1)} Plan`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
            Be the first to share your experience with EcoMate!
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,16,31,.85)', backdropFilter: 'blur(16px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.1)', borderRadius: 22, padding: '36px', width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Share your experience ⭐</h3>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.38)', marginBottom: 24 }}>Your review will appear on our landing page after approval.</p>

            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Your Rating *</label>
                <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Your Review *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience with EcoMate — what changed for your business?"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 11, fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'var(--font-inter)', resize: 'none', lineHeight: 1.6 }}
                />
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.2)', marginTop: 4 }}>{form.content.length}/500 characters (min. 20)</div>
              </div>

              <div style={{ background: 'rgba(37,99,235,.06)', border: '1px solid rgba(37,99,235,.15)', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: 'rgba(255,255,255,.45)' }}>
                <div style={{ fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 4 }}>Submitting as:</div>
                <div>{profile?.full_name} · {profile?.business_name || 'EcoMate User'} · {profile?.plan?.charAt(0).toUpperCase() + profile?.plan?.slice(1)} Plan</div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Submitting...' : 'Submit Review →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
