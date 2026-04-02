'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function QueueClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  const handleShipOrder = async (orderId: string, trackingCode: string) => {
    if (!trackingCode) {
      toast.error('Please enter a tracking code first')
      return
    }

    setUpdating(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Shipped', 
        tracking_code: trackingCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update order')
      console.error(error)
    } else {
      toast.success('Order marked as Shipped!')
      setOrders(orders.filter(o => o.id !== orderId))
    }
    setUpdating(null)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {orders.length === 0 ? (
        <div style={{ 
          padding: '48px', 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.02)', 
          borderRadius: 20,
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.3)'
        }}>
          No confirmed orders in the fulfillment queue.
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 20,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10b981', 
                  fontSize: 10, 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: 100,
                  textTransform: 'uppercase'
                }}>
                  {order.clients?.agency_name}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>#{order.order_number}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                {order.customer_name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.4)', display: 'flex', gap: 12 }}>
                <span>📞 {order.customer_phone}</span>
                <span>📍 {order.wilaya_name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input 
                type="text" 
                placeholder="Tracking Code (e.g. YAL-123)"
                defaultValue={order.tracking_code || ''}
                id={`tracking-${order.id}`}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '10px 16px',
                  color: '#fff',
                  fontSize: 13,
                  width: 220,
                  outline: 'none'
                }}
              />
              <button 
                disabled={updating === order.id}
                onClick={() => {
                  const input = document.getElementById(`tracking-${order.id}`) as HTMLInputElement
                  handleShipOrder(order.id, input.value)
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: updating === order.id ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {updating === order.id ? 'Shipping...' : 'Mark as Shipped'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
