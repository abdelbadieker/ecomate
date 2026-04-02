import { createClient } from '@/lib/supabase/server'
import QueueClient from './QueueClient'

export default async function QueuePage() {
  const supabase = await createClient()

  // Fetch all orders where status is 'Confirmed'
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      clients:client_id (
        agency_name,
        email
      )
    `)
    .eq('status', 'Confirmed')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching order queue:', error)
  }

  return (
    <div style={{ color: '#fff' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>🚚 EcoTrack™ Fulfillment Queue</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Scan confirmed orders and mark them as shipped. 
          Inventory will be updated accordingly.
        </p>
      </header>

      <QueueClient initialOrders={orders || []} />
    </div>
  )
}
