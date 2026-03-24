import { createClient } from '@/lib/supabase/server'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return <OrdersClient initialOrders={orders || []} userId={user!.id} />
}
