import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: client }, { data: orders }, { data: products }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', user!.id).single(),
    supabase.from('orders')
      .select('*, customer:customers_crm(full_name, phone_number)')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('products').select('id').eq('client_id', user!.id),
  ])

  // Get total revenue (sum of total_price_dzd for delivered orders)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_price_dzd')
    .eq('client_id', user!.id)
    .eq('status', 'Delivered')

  const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_price_dzd), 0) || 0
  const todayOrders = orders?.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length || 0
  const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0

  const stats = [
    { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()} DZD`, change: 'Delivered', icon: '💰', color: '#10B981' },
    { label: 'Orders Today', value: todayOrders.toString(), change: 'New bookings', icon: '📦', color: '#2563eb' },
    { label: 'Products', value: (products?.length || 0).toString(), change: 'In catalog', icon: '🛍️', color: '#2563eb' },
    { label: 'Pending COD', value: pendingOrders.toString(), change: 'Awaiting action', icon: '🕐', color: '#f59e0b' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-poppins text-2xl lg:text-3xl font-black text-[var(--text-main)] mb-1 leading-tight">
          Good morning, {client?.agency_name?.split(' ')[0] || 'Client'} 👋
        </h1>
        <p className="text-sm text-[var(--text-sub)] opacity-60">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-c)] rounded-2xl p-6 transition-all hover:border-blue-500/20">
            <div className="text-2xl mb-4">{s.icon}</div>
            <div className="text-[10px] text-[var(--text-sub)] font-black uppercase tracking-widest opacity-40 mb-2">{s.label}</div>
            <div className="font-poppins text-xl lg:text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-[var(--text-sub)] opacity-50">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-c)] rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="px-6 py-5 border-b border-[var(--border-c)] flex justify-between items-center bg-black/5">
          <h3 className="font-poppins text-sm font-black text-[var(--text-main)] uppercase tracking-widest opacity-80">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">View all →</Link>
        </div>
        
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-100 min-w-[600px] border-collapse admin-table">
              <thead>
                <tr className="bg-black/10 text-[10px] font-black uppercase tracking-widest text-[var(--text-sub)]">
                  <th className="text-start px-6 py-4">Order</th>
                  <th className="text-start px-6 py-4">Customer</th>
                  <th className="text-start px-6 py-4">Total</th>
                  <th className="text-start px-6 py-4">Status</th>
                  <th className="text-start px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-c)]">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-black text-[var(--text-main)] text-sm">{o.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-main)] text-sm">{(o.customer as any)?.full_name || 'Anonymous'}</div>
                      <div className="text-xs text-[var(--text-sub)] opacity-50">{(o.customer as any)?.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-500 text-sm">{Number(o.total_price_dzd).toLocaleString()} DZD</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                        ${o.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          o.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                          'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-sub)] opacity-70 text-sm">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-[var(--text-sub)] opacity-50">
            <div className="text-5xl mb-6 opacity-30">📦</div>
            <p className="text-sm font-black uppercase tracking-widest">No orders yet.</p>
            <p className="text-xs mt-2">Connect your ManyChat bot to start receiving orders.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/products', icon: '🛍️', title: 'Catalog Manager', desc: 'Manage your product inventory', color: 'text-blue-500' },
          { href: '/dashboard/ai-chatbot', icon: '🤖', title: 'AI Assistant', desc: 'Configure your growth flows', color: 'text-emerald-500' },
          { href: '/dashboard/settings', icon: '⚙️', title: 'Settings', desc: 'Profile & API integrations', color: 'text-amber-500' },
        ].map((a, i) => (
          <Link key={i} href={a.href} className="bg-[var(--bg-card)] border border-[var(--border-c)] rounded-2xl p-6 transition-all hover:border-blue-500/20 hover:-translate-y-1">
            <div className="text-2xl mb-4">{a.icon}</div>
            <div className={`font-poppins text-sm font-black uppercase tracking-widest mb-1 ${a.color}`}>{a.title}</div>
            <div className="text-[13px] text-[var(--text-sub)] opacity-50">{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
