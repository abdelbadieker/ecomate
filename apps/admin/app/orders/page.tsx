'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ShoppingBag, Plus, Trash2, CheckCircle, Clock, Truck, XCircle, Loader } from 'lucide-react';
import { adminDb } from '@/lib/admin-db';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

type Order = { id: string; customer_name: string; total: number; status: string; tracking_code: string; created_at: string };

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrder, setNewOrder] = useState({ customer_name: '', total: 0, status: 'Processing', tracking_code: '' });

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleAddOrder = async () => {
    if (!newOrder.customer_name) return;
    const tracking = 'ECM' + Math.random().toString(36).substring(2, 7).toUpperCase();
    try {
      await adminDb.insert('orders', { ...newOrder, tracking_code: tracking });
      adminDb.log(`Created order for ${newOrder.customer_name}`, { entity_type: 'order' });
      setNewOrder({ customer_name: '', total: 0, status: 'Processing', tracking_code: '' });
      setShowAddForm(false);
      fetchOrders();
    } catch (err) { alert('Error creating order: ' + (err as Error).message); }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    try { await adminDb.delete('orders', { id }); fetchOrders(); }
    catch (err) { alert((err as Error).message); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try { await adminDb.update('orders', { status: newStatus }, { id }); fetchOrders(); }
    catch (err) { alert((err as Error).message); }
  };

  const statusIcons: Record<string, any> = {
    Processing: <Clock className="w-4 h-4" />,
    Confirmed: <CheckCircle className="w-4 h-4" />,
    Shipped: <Truck className="w-4 h-4" />,
    Delivered: <CheckCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
  };

  const statusColors: Record<string, string> = {
    Processing: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    Delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  if (loading) return <div className="flex justify-center p-20"><Loader className="w-8 h-8 animate-spin text-emerald-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <p className="text-slate-400 text-sm mt-1">{orders.length} total orders across the platform</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Demo Order
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[#0A1628] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-lg font-semibold">New Demo Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name</label>
              <input 
                value={newOrder.customer_name} 
                onChange={e => setNewOrder({...newOrder, customer_name: e.target.value})}
                className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Total (DA)</label>
              <input 
                type="number"
                value={newOrder.total} 
                onChange={e => setNewOrder({...newOrder, total: Number(e.target.value)})}
                className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select 
                value={newOrder.status}
                onChange={e => setNewOrder({...newOrder, status: e.target.value})}
                className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
              >
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAddOrder} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold">Save Order</button>
            <button onClick={() => setShowAddForm(false)} className="bg-slate-800 text-slate-400 px-6 py-2 rounded-lg text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#0A1628] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Tracking</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-mono text-blue-400 font-bold">{o.tracking_code}</div>
                    <div className="text-[10px] text-slate-600 mt-1">{new Date(o.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">{o.customer_name}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none ${statusColors[o.status]}`}
                    >
                      {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-400">DA {o.total?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteOrder(o.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                    No orders found. Use "Add Demo Order" to populate some data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
