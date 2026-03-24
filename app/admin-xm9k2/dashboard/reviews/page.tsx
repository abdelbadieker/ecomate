'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    const supabase = createClient()
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function approve(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
    if (error) return toast.error(error.message)
    setReviews(r => r.map(x => x.id === id ? { ...x, is_approved: true } : x))
    toast.success('Review approved — now visible on landing page!')
  }

  async function reject(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) return toast.error(error.message)
    setReviews(r => r.filter(x => x.id !== id))
    toast.success('Review deleted')
  }

  async function toggleFeatured(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('reviews').update({ is_featured: !current }).eq('id', id)
    setReviews(r => r.map(x => x.id === id ? { ...x, is_featured: !current } : x))
    toast.success(`Review ${!current ? 'featured' : 'unfeatured'}`)
  }

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.is_approved
    if (filter === 'approved') return r.is_approved
    return true
  })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Reviews Management ⭐</h1>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>Approve reviews to display them on the landing page. Reject spam.</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['pending', 'approved', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 20px', borderRadius: 100, border: '1.5px solid',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
            background: filter === f ? (f === 'pending' ? '#f59e0b' : f === 'approved' ? '#10B981' : '#2563eb') : 'transparent',
            borderColor: filter === f ? 'transparent' : 'rgba(255,255,255,.1)',
            color: filter === f ? '#fff' : 'rgba(255,255,255,.4)',
          }}>
            {f === 'pending' ? `⏳ Pending (${reviews.filter(r => !r.is_approved).length})` :
             f === 'approved' ? `✅ Approved (${reviews.filter(r => r.is_approved).length})` : 
             `📋 All (${reviews.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,.3)' }}>Loading reviews...</div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} style={{
              background: r.is_approved ? 'rgba(16,185,129,.03)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${r.is_approved ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.06)'}`,
              borderRadius: 14, padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {r.reviewer_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{r.reviewer_name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{r.business_name || '—'} · {r.plan_used || 'Unknown plan'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#f59e0b', fontSize: 16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.65, marginBottom: 14, fontStyle: 'italic' }}>
                &ldquo;{r.content}&rdquo;
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!r.is_approved ? (
                  <>
                    <button onClick={() => approve(r.id)} style={{ padding: '7px 16px', borderRadius: 9, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', color: '#10B981', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                      ✅ Approve & Publish
                    </button>
                    <button onClick={() => reject(r.id)} style={{ padding: '7px 16px', borderRadius: 9, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#ef4444', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                      🗑️ Delete
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: '#10B981', fontSize: 12, fontWeight: 700 }}>
                      ✅ Published on landing page
                    </span>
                    <button onClick={() => toggleFeatured(r.id, r.is_featured)} style={{ padding: '7px 14px', borderRadius: 9, background: r.is_featured ? 'rgba(245,158,11,.12)' : 'rgba(255,255,255,.05)', border: `1px solid ${r.is_featured ? 'rgba(245,158,11,.25)' : 'rgba(255,255,255,.08)'}`, color: r.is_featured ? '#f59e0b' : 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {r.is_featured ? '⭐ Featured' : '☆ Feature'}
                    </button>
                    <button onClick={() => reject(r.id)} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.1)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,.25)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <div style={{ fontSize: 15 }}>No {filter === 'all' ? '' : filter} reviews</div>
        </div>
      )}
    </div>
  )
}
