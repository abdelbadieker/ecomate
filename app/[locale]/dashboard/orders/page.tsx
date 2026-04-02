import { createClient } from '@/lib/supabase/server'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*, customer:customers_crm(*)')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <OrdersClient initialOrders={orders || []} userId={user!.id} />
    </div>
  )
}
