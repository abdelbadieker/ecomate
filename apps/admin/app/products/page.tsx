'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Package, Plus, Trash2, Tag, Layers, Loader, DollarSign } from 'lucide-react';
import { adminDb } from '@/lib/admin-db';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

type Product = { id: string; name: string; price: number; stock: number; category: string; created_at: string };

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: 'General' });

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name) return;
    try {
      await adminDb.insert('products', newProduct);
      adminDb.log(`Added product: ${newProduct.name}`, { entity_type: 'product' });
      setNewProduct({ name: '', price: 0, stock: 0, category: 'General' });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) { alert('Error adding product: ' + (err as Error).message); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await adminDb.delete('products', { id }); fetchProducts(); }
    catch (err) { alert((err as Error).message); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader className="w-8 h-8 animate-spin text-emerald-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Products Management</h2>
          <p className="text-slate-400 text-sm mt-1">{products.length} products listed in the store</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[#0A1628] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-lg font-semibold">New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Product Name</label>
              <input 
                value={newProduct.name} 
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                placeholder="e.g. Eco Bag"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Price (DA)</label>
              <input 
                type="number"
                value={newProduct.price} 
                onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
              <input 
                type="number"
                value={newProduct.stock} 
                onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select 
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
              >
                <option>General</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home & Living</option>
                <option>Services</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold">Save Product</button>
            <button onClick={() => setShowAddForm(false)} className="bg-slate-800 text-slate-400 px-6 py-2 rounded-lg text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-[#0A1628] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <button 
                  onClick={() => handleDeleteProduct(p.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-800 text-slate-400 tracking-wider flex items-center gap-1">
                  <Tag className="w-2 h-2" /> {p.category}
                </span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider flex items-center gap-1 ${p.stock > 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                  <Layers className="w-2 h-2" /> {p.stock} in stock
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500 font-medium">DA</span>
                <span className="text-2xl font-black text-white">{p.price?.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium italic">
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-20 bg-[#0A1628]/50 border border-dashed border-slate-800 rounded-2xl text-center">
            <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No products found. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
