'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  
  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [tab])

  async function fetchReviews() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', tab === 'approved')
      .order('created_at', { ascending: false })
    
    console.log(`Fetched reviews for tab [${tab}]:`, data)
    if (error) {
      console.error('Fetch Reviews Error:', error)
      toast.error(error.message)
    }
    if (data) setReviews(data)
    setLoading(false)
  }

  async function approveReview(id: string) {
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Review approved for landing page')
      fetchReviews()
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Permanently delete this review?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Review deleted')
      fetchReviews()
    }
  }

  async function toggleFeatured(review: any) {
    const { error } = await supabase.from('reviews').update({ is_featured: !review.is_featured }).eq('id', review.id)
    if (error) toast.error(error.message)
    else fetchReviews()
  }

  return (
    <div>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>⭐ Client Reviews</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>Moderate the testimonials that appear on your landing page.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button 
          onClick={() => setTab('pending')}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            background: tab === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
            border: '1px solid ' + (tab === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
            color: tab === 'pending' ? '#f59e0b' : 'rgba(255, 255, 255, 0.4)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ⏳ Pending Moderation
        </button>
        <button 
          onClick={() => setTab('approved')}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            background: tab === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            border: '1px solid ' + (tab === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
            color: tab === 'approved' ? '#10b981' : 'rgba(255, 255, 255, 0.4)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Approved & Live
        </button>
        <button 
          onClick={fetchReviews}
          style={{
            marginLeft: 'auto',
            padding: '10px 16px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.2)' }}>Syncing reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center', 
          background: 'rgba(255,255,255,0.01)', 
          border: '2px dashed rgba(255,255,255,0.05)', 
          borderRadius: 24,
          color: 'rgba(255,255,255,0.2)'
        }}>
          No {tab} reviews found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {reviews.map(review => (
            <div key={review.id} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 20,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ fontSize: 14, color: i < review.rating ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}>★</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {tab === 'pending' && (
                    <button 
                      onClick={() => approveReview(review.id)}
                      style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Approve →
                    </button>
                  )}
                  {tab === 'approved' && (
                    <button 
                      onClick={() => toggleFeatured(review)}
                      style={{ 
                        background: review.is_featured ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                        border: '1px solid ' + (review.is_featured ? '#2563eb' : 'rgba(255,255,255,0.1)'),
                        color: review.is_featured ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                        borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {review.is_featured ? 'FEATURED' : '🔥 Feature'}
                    </button>
                  )}
                  <button onClick={() => deleteReview(review.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                </div>
              </div>

              <blockquote style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.6 }}>
                &quot;{review.content}&quot;
              </blockquote>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: 8, 
                  background: 'linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                }}>👤</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{review.reviewer_name || review.author_name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.3)' }}>{review.business_name} • {review.plan_used || review.plan_slug || 'Starter'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
