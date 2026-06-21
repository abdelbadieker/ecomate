'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { adminDb } from '@/lib/admin-db';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

type Product = { id: string; name: string; price: number; stock: number; description: string | null; category: string; is_active: boolean; created_at: string };

export default function LandingCMS() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', category: 'General' });

  const fetch_ = async () => { const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); setProducts(data || []); setLoading(false); };
  useEffect(() => { fetch_(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock), description: form.description || null, category: form.category };
    try {
      if (editing) {
        await adminDb.update('products', payload, { id: editing.id });
        adminDb.log(`Updated product: ${form.name}`, { entity_type: 'product', entity_id: editing.id });
      } else {
        await adminDb.insert('products', payload);
        adminDb.log(`Created product: ${form.name}`, { entity_type: 'product' });
      }
      setForm({ name: '', price: '', stock: '', description: '', category: 'General' }); setShowForm(false); setEditing(null); fetch_();
    } catch (err) { alert('Error saving product: ' + (err as Error).message); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminDb.delete('products', { id });
      adminDb.log(`Deleted product: ${name}`, { entity_type: 'product', entity_id: id });
      fetch_();
    } catch (err) { alert('Error: ' + (err as Error).message); }
  };

  const startEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, price: String(p.price), stock: String(p.stock), description: p.description || '', category: p.category }); setShowForm(true); };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-[3px] border-slate-700 border-t-emerald-400 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold">Product Catalog (CMS)</h2><p className="text-slate-400 text-sm mt-1">{products.length} products</p></div>
        <button onClick={() => { setEditing(null); setForm({ name: '', price: '', stock: '', description: '', category: 'General' }); setShowForm(!showForm); }} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors">+ Add Product</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0A1628] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'New'} Product</h3>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" required className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price (DA)" required className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="Stock" required className="bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
          </div>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" />
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">{editing ? 'Update' : 'Create'} Product</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-[#0A1628] rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-800 text-slate-400 text-xs">
            <th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium text-right">Price</th><th className="px-5 py-3 font-medium text-right">Stock</th><th className="px-5 py-3 font-medium text-center">Status</th><th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800/50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/30">
                <td className="px-5 py-3"><div className="text-white font-medium">{p.name}</div><div className="text-xs text-slate-500">{p.description?.slice(0, 50)}</div></td>
                <td className="px-5 py-3"><span className="px-2 py-0.5 bg-blue-400/10 text-blue-400 rounded-full text-xs">{p.category}</span></td>
                <td className="px-5 py-3 text-right text-emerald-400 font-bold">DA {p.price?.toLocaleString()}</td>
                <td className="px-5 py-3 text-right"><span className={p.stock < 10 ? 'text-red-400' : 'text-white'}>{p.stock}</span></td>
                <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.is_active ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{p.is_active ? 'Active' : 'Hidden'}</span></td>
                <td className="px-5 py-3 text-right"><div className="flex gap-2 justify-end">
                  <button onClick={() => startEdit(p)} className="text-blue-400 text-xs font-medium px-3 py-1 bg-blue-400/10 rounded-md">Edit</button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="text-red-400 text-xs font-medium px-3 py-1 bg-red-400/10 rounded-md">Delete</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
