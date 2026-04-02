'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function CheckoutApprovals() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        profiles (
          full_name,
          business_name,
          email
        )
      `)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch Requests Error:', error)
      toast.error(`Sync failed: ${error.message}. Try reloading the schema cache.`)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  async function handleAction(requestId: string, userId: string, action: 'approve' | 'reject') {
    try {
      const supabase = createClient()
      const status = action === 'approve' ? 'active' : 'rejected'
      
      // 1. Update subscription status
      const { error: subErr } = await supabase
        .from('subscriptions')
        .update({ 
          status,
          payment_confirmed: action === 'approve',
          expires_at: action === 'approve' ? new Date(Date.now() + 30 * 86400000).toISOString() : null
        })
        .eq('id', requestId)

      if (subErr) throw subErr

      // 2. If approved, update profile status
      if (action === 'approve') {
        const { data: sub } = await supabase.from('subscriptions').select('plan').eq('id', requestId).single()
        // Ensure plan is lowercase for consistency in dashboard checks
        const planSlug = sub?.plan?.toLowerCase() || 'starter'
        await supabase.from('profiles').update({
          plan: planSlug,
          plan_status: 'active'
        }).eq('id', userId)
      } else {
        // If rejected, mark profile as trialing/inactive so they can checkout again
        await supabase.from('profiles').update({
          plan_status: 'rejected'
        }).eq('id', userId)
      }

      toast.success(`Request ${action}d successfully`)
      fetchRequests()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    }
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>💳 Checkout Approvals</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>Review and activate pending subscription payments.</p>
      </header>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', padding: 40 }}>Syncing pending requests...</div>
      ) : requests.length === 0 ? (
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', 
          borderRadius: 16, padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.2)' 
        }}>
          ☕ No pending checkout requests found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {requests.map((req) => (
            <div key={req.id} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 20,
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ 
                    background: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6', 
                    fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 100,
                    textTransform: 'uppercase'
                  }}>
                    {req.plan}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Requested {new Date(req.created_at).toLocaleString()}</span>
                </div>
                
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  {req.profiles?.full_name || 'Unnamed Client'}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                  {req.profiles?.business_name} • {req.profiles?.email}
                </div>

                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>Method</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{req.payment_method?.toUpperCase()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>Reference</div>
                    <div style={{ fontSize: 14, color: '#10b981', fontWeight: 800, fontFamily: 'monospace' }}>{req.payment_reference || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>Amount</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{req.amount_da?.toLocaleString()} DA</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => handleAction(req.id, req.user_id, 'reject')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444', padding: '12px 24px', borderRadius: 12, fontSize: 14, 
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(req.id, req.user_id, 'approve')}
                  style={{
                    background: '#10b981', color: '#fff', padding: '12px 32px', 
                    borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Approve & Activate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
