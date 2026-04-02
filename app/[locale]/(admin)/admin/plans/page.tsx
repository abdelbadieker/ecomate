'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  cta_text: string
  color: string
  is_popular: boolean
  active: boolean
  sort_order: number
}

export default function PlansAdmin() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error: any) {
      toast.error('Error fetching plans: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPlan) return

    try {
      setIsSaving(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('plans')
        .upsert(editingPlan)

      if (error) throw error
      
      toast.success('Plan saved successfully!')
      setEditingPlan(null)
      fetchPlans()
    } catch (error: any) {
      toast.error('Error saving plan: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const supabase = createClient()
      await supabase.from('plans').update({ active: !current }).eq('id', id)
      fetchPlans()
    } catch (error: any) {
      toast.error('Error toggling status')
    }
  }

  if (loading) return <div style={{ padding: 40, color: '#fff' }}>Loading configuration...</div>

  return (
    <div style={{ maxWidth: 1200 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>💎 Plan Management</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>Customize pricing tiers, features, and call-to-action text.</p>
        </div>
        <button 
          onClick={() => setEditingPlan({ id: '', name: '', price: 0, period: '/month', description: '', features: [], cta_text: 'Get Started →', color: '#10B981', is_popular: false, active: true, sort_order: plans.length + 1 })}
          className="btn-primary" 
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          + Create New Plan
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1.5px solid ${plan.is_popular ? plan.color + '44' : 'rgba(255, 255, 255, 0.05)'}`,
            borderRadius: 20,
            padding: 24,
            position: 'relative'
          }}>
            {plan.is_popular && (
              <div style={{ position: 'absolute', top: -12, right: 20, background: plan.color, color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 100 }}>POPULAR</div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>ID: {plan.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: plan.color }}>{plan.price.toLocaleString()} DA</div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.3)' }}>{plan.period}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>CTA Text</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: '#fff' }}>{plan.cta_text}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => setEditingPlan(plan)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '10px', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
              >
                Edit Details
              </button>
              <button 
                onClick={() => toggleActive(plan.id, plan.active)}
                style={{ background: plan.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: 10, padding: '10px 15px', color: plan.active ? '#10b981' : '#ef4444', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
              >
                {plan.active ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }}>
          <form onSubmit={savePlan} style={{
            background: '#0a0a0b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: 32,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Edit Pricing Plan</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>Plan ID (Unique)</label>
                <input 
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff' }}
                  value={editingPlan.id}
                  onChange={e => setEditingPlan({...editingPlan, id: e.target.value.toLowerCase()})}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>Display Name</label>
                <input 
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff' }}
                  value={editingPlan.name}
                  onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>Price (DA)</label>
                <input 
                  type="number"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff' }}
                  value={editingPlan.price}
                  onChange={e => setEditingPlan({...editingPlan, price: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>Period Text</label>
                <input 
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff' }}
                  value={editingPlan.period}
                  onChange={e => setEditingPlan({...editingPlan, period: e.target.value})}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>CTA Button Text</label>
              <input 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff' }}
                value={editingPlan.cta_text}
                onChange={e => setEditingPlan({...editingPlan, cta_text: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>Sort Order (Priority in list)</label>
              <input 
                type="number"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff' }}
                value={editingPlan.sort_order}
                onChange={e => setEditingPlan({...editingPlan, sort_order: parseInt(e.target.value)})}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>Description</label>
              <textarea 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff', height: 80 }}
                value={editingPlan.description}
                onChange={e => setEditingPlan({...editingPlan, description: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>Features (One per line)</label>
              <textarea 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: '#fff', height: 120 }}
                value={editingPlan.features.join('\n')}
                onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split('\n').filter(Boolean)})}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="button" 
                onClick={() => setEditingPlan(null)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn-primary"
                style={{ flex: 2, padding: '14px' }}
              >
                {isSaving ? 'Saving...' : 'Save Plan Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
