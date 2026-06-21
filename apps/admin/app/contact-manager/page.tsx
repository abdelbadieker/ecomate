'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { adminDb } from '@/lib/admin-db';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

type Customer = { id: string; name: string; email: string; phone: string; city: string; notes: string; total_orders: number; total_spent: number; created_at: string };

export default function ContactManager() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', notes: '' });

  const fetch_ = async () => { const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false }); setCustomers(data || []); setLoading(false); };
  useEffect(() => { fetch_(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminDb.insert('customers', form);
      adminDb.log(`Added customer: ${form.name}`, { entity_type: 'customer' });
      setForm({ name: '', email: '', phone: '', city: '', notes: '' }); setShowForm(false); fetch_();
    } catch (err) { alert('Error saving customer: ' + (err as Error).message); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await adminDb.delete('customers', { id });
      adminDb.log(`Deleted customer: ${name}`, { entity_type: 'customer', entity_id: id });
      fetch_();
    } catch (err) { alert('Error: ' + (err as Error).message); }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-[3px] border-slate-700 border-t-emerald-400 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold">Contact Manager</h2><p className="text-slate-400 text-sm mt-1">{customers.length} customers in database</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors">+ Add Customer</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#0A1628] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">New Customer</h3>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
          </div>
          <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">Add Customer</button>
        </form>
      )}

      <div className="bg-[#0A1628] rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-800 text-slate-400 text-xs">
            <th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Phone</th><th className="px-5 py-3 font-medium">City</th><th className="px-5 py-3 font-medium text-right">Orders</th><th className="px-5 py-3 font-medium text-right">Spent</th><th className="px-5 py-3 font-medium text-right">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800/50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-800/30">
                <td className="px-5 py-3 text-white font-medium">{c.name}</td>
                <td className="px-5 py-3 text-slate-300">{c.email}</td>
                <td className="px-5 py-3 text-slate-300">{c.phone}</td>
                <td className="px-5 py-3 text-slate-300">{c.city}</td>
                <td className="px-5 py-3 text-right text-white font-bold">{c.total_orders}</td>
                <td className="px-5 py-3 text-right text-emerald-400 font-bold">DA {c.total_spent?.toLocaleString()}</td>
                <td className="px-5 py-3 text-right"><button onClick={() => handleDelete(c.id, c.name)} className="text-red-400 hover:text-red-300 text-xs font-medium px-3 py-1 bg-red-400/10 rounded-md">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
