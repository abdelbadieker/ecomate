'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Search, 
  Plus, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Phone, 
  MapPin, 
  MoreVertical,
  ClipboardList,
  Edit2
} from 'lucide-react'

const COLUMNS = [
  { id: 'Pending', title: 'Pending', icon: ClipboardList, color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
  { id: 'Confirmed', title: 'Confirmed', icon: CheckCircle2, color: '#3b82f6', bg: 'rgba(59,130,246,.1)' },
  { id: 'Shipped', title: 'Shipped', icon: Truck, color: '#8b5cf6', bg: 'rgba(139,92,246,.1)' },
  { id: 'Delivered', title: 'Delivered', icon: Package, color: '#10b981', bg: 'rgba(16,185,129,.1)' },
  { id: 'Returned', title: 'Returned', icon: RotateCcw, color: '#ef4444', bg: 'rgba(239,68,68,.1)' },
]

export default function OrdersClient({ initialOrders, userId }: { initialOrders: any[], userId: string }) {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer_name: '', customer_phone: '', wilaya: '', address: '',
    total_price: '', notes: '',
  })

  // Group orders by status
  const columnsData = useMemo(() => {
    const filtered = orders.filter(o => {
      const shopperName = (o.customer as any)?.full_name || ''
      const shopperPhone = (o.customer as any)?.phone_number || ''
      return shopperName.toLowerCase().includes(search.toLowerCase()) || 
             shopperPhone.includes(search) || 
             o.order_number.includes(search)
    })

    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = filtered.filter(o => o.status === col.id)
      return acc
    }, {} as Record<string, any[]>)
  }, [orders, search])

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) return toast.error(error.message)
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
    toast.success(`Order moved to ${status}`)
  }

  async function updateTracking(id: string, tracking_code: string) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ tracking_code }).eq('id', id)
    if (error) return toast.error(error.message)
    setOrders(o => o.map(x => x.id === id ? { ...x, tracking_code } : x))
    toast.success('Tracking code updated')
  }

  async function addOrder(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    const supabase = createClient()

    // 1. Upsert Shopper
    const { data: shopper, error: sErr } = await supabase
      .from('customers_crm')
      .upsert({
        client_id: userId,
        phone_number: newOrder.customer_phone,
        full_name: newOrder.customer_name,
        wilaya_name: newOrder.wilaya,
        address: newOrder.address
      }, { onConflict: 'client_id,phone_number' })
      .select()
      .single()

    if (sErr) { toast.error('Error saving customer'); setAdding(false); return }

    // 2. Create Order
    const orderNumber = `ECO-${Date.now().toString().slice(-6)}`
    const { data, error } = await supabase.from('orders').insert({
      client_id: userId,
      customer_id: shopper.id,
      order_number: orderNumber,
      total_price_dzd: parseInt(newOrder.total_price) || 0,
      notes: newOrder.notes,
      status: 'Pending',
    }).select('*, customer:customers_crm(*)').single()

    if (error) { toast.error(error.message); setAdding(false); return }

    setOrders(o => [data, ...o])
    setShowAdd(false)
    setNewOrder({ customer_name: '', customer_phone: '', wilaya: '', address: '', total_price: '', notes: '' })
    toast.success('Order created!')
    setAdding(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#030711]">
      {/* Search & Actions Header */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#030711]/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            placeholder="Search shopper, phone or order #..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all font-inter"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Create Manual Order
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto p-6 scrollbar-hide">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="w-[320px] flex flex-col h-full bg-white/[0.02] border border-white/[0.05] rounded-2xl">
              {/* Column Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg" style={{ background: col.bg, color: col.color }}>
                    <col.icon className="w-4 h-4" />
                  </div>
                  <span className="font-poppins font-black text-xs uppercase tracking-widest text-white/80">{col.title}</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded-md text-[10px] font-black text-white/40">{columnsData[col.id]?.length || 0}</span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)] custom-scrollbar">
                <AnimatePresence initial={false}>
                  {columnsData[col.id].map(order => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#0a1628] border border-white/10 rounded-xl p-4 shadow-sm hover:border-white/20 transition-all group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black font-poppins text-blue-500/80 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">#{order.order_number}</span>
                        <div className="relative">
                          <select 
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="bg-transparent text-[10px] font-black text-white/40 uppercase tracking-widest outline-none cursor-pointer hover:text-white transition-all appearance-none text-right px-2"
                          >
                            {COLUMNS.map(c => <option key={c.id} value={c.id} className="bg-[#0a1628]">{c.title}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="font-inter font-bold text-sm text-[var(--text-main)] mb-0.5 leading-none">{(order.customer as any)?.full_name || 'Anonymous'}</p>
                          <div className="flex items-center gap-1.5 text-white/30 text-[11px]">
                            <Phone className="w-3 h-3" /> {(order.customer as any)?.phone_number}
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 text-white/30 text-[11px]">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{(order.customer as any)?.wilaya_name || 'Alger'} • {(order.customer as any)?.address || '—'}</span>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                          <div className="font-black text-emerald-500 text-sm">
                            {Number(order.total_price_dzd).toLocaleString()} DZD
                          </div>
                          <div className="text-[10px] text-white/20 italic">
                            {new Date(order.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>

                        {/* Tracking Input */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2 block">EcoTrack™ Code</label>
                          <div className="relative group/input">
                            <Truck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within/input:text-blue-500 transition-colors" />
                            <input 
                              placeholder="E.g. YAL-10293"
                              defaultValue={order.tracking_code || ''}
                              onBlur={(e) => updateTracking(order.id, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-blue-500/50 transition-all font-inter text-white/80"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {columnsData[col.id].length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">Empty</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Order Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#030711]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-0"
            onClick={e => e.target === e.currentTarget && setShowAdd(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0a1628] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />
              
              <h3 className="font-poppins text-xl font-black text-white mb-6">Create Manual Order 📦</h3>
              
              <form onSubmit={addOrder} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Shopper Name *</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500/50 transition-all" required value={newOrder.customer_name} onChange={e => setNewOrder(n => ({ ...n, customer_name: e.target.value }))} placeholder="Mohamed Brahimi" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Phone Number *</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500/50 transition-all" required value={newOrder.customer_phone} onChange={e => setNewOrder(n => ({ ...n, customer_phone: e.target.value }))} placeholder="0555 00 11 22" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Wilaya</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500/50 transition-all" value={newOrder.wilaya} onChange={e => setNewOrder(n => ({ ...n, wilaya: e.target.value }))} placeholder="Alger" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Total (DZD) *</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/50 transition-all text-emerald-500 font-bold" type="number" required value={newOrder.total_price} onChange={e => setNewOrder(n => ({ ...n, total_price: e.target.value }))} placeholder="4500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Full Address</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500/50 transition-all font-inter" value={newOrder.address} onChange={e => setNewOrder(n => ({ ...n, address: e.target.value }))} placeholder="Cité 500 logts Brachmane..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Operational Notes</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500/50 transition-all resize-none font-inter" rows={2} value={newOrder.notes} onChange={e => setNewOrder(n => ({ ...n, notes: e.target.value }))} placeholder="E.g. Delivery after 4 PM only." />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white/60 text-sm font-bold hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit" disabled={adding} className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                    {adding ? 'Processing...' : 'Create Order →'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
