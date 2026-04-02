import { createClient } from '@/lib/supabase/server'

export default async function DeliveryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user!.id)
    .in('status', ['confirmed', 'processing', 'shipped'])
    .order('created_at', { ascending: false })

  const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered']
  const statusColor: Record<string, string> = { confirmed: '#2563eb', processing: '#8b5cf6', shipped: '#06b6d4', delivered: '#10B981' }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Delivery Tracking 🚚</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{orders?.length || 0} orders in transit across 58 wilayas</p>
      </div>

      {/* Wilayas info */}
      <div style={{ background: 'linear-gradient(135deg,rgba(37,99,235,.08),rgba(16,185,129,.05))', border: '1px solid rgba(37,99,235,.15)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 40 }}>
        <div><div style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 900, color: '#2563eb' }}>58</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Wilayas covered</div></div>
        <div><div style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 900, color: '#10B981' }}>{orders?.filter(o => o.status === 'shipped').length || 0}</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>In transit now</div></div>
        <div><div style={{ fontFamily: 'var(--font-poppins)', fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>{orders?.filter(o => o.status === 'confirmed').length || 0}</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Awaiting pickup</div></div>
      </div>

      {/* Active shipments */}
      {orders && orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(o => {
            const stepIdx = STATUS_STEPS.indexOf(o.status)
            return (
              <div key={o.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>Order #{o.order_number}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{o.customer_name} · {o.wilaya || 'Wilaya not set'}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 16, fontWeight: 800, color: '#10B981' }}>{o.total_da.toLocaleString()} DA</div>
                </div>
                {/* Progress bar */}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                    {STATUS_STEPS.map((s, i) => (
                      <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: i <= stepIdx ? statusColor[s] || '#2563eb' : 'var(--bg-section)', border: `2px solid ${i <= stepIdx ? statusColor[s] || '#2563eb' : 'var(--border-c)'}`, color: i <= stepIdx ? '#fff' : 'var(--text-muted)', transition: 'all .3s' }}>
                          {i <= stepIdx ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: i <= stepIdx ? 'var(--text-main)' : 'var(--text-muted)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ position: 'absolute', top: 14, left: '7%', right: '7%', height: 2, background: 'var(--border-c)', zIndex: 0 }}>
                    <div style={{ height: '100%', background: statusColor[o.status] || '#2563eb', width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%`, transition: 'width .5s' }} />
                  </div>
                </div>
                {o.tracking_code && (
                  <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(37,99,235,.06)', border: '1px solid rgba(37,99,235,.12)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Tracking: {o.tracking_code}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚚</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>No active deliveries</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Orders in transit will appear here automatically with live tracking</div>
        </div>
      )}
    </div>
  )
}
