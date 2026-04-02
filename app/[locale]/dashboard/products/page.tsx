'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clientId, setClientId] = useState('')
  const [form, setForm] = useState({ name: '', description: '', price_dzd: '', stock_quantity: '', category: '', is_active: true })
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setClientId(data.user.id)
      const { data: p } = await supabase.from('products').select('*').eq('client_id', data.user.id).order('created_at', { ascending: false })
      setProducts(p || [])
      setLoading(false)
    })
  }, [])

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = { 
      client_id: clientId, 
      name: form.name, 
      description: form.description, 
      price_dzd: parseFloat(form.price_dzd) || 0, 
      stock_quantity: parseInt(form.stock_quantity) || 0, 
      category: form.category,
      is_active: form.is_active
    }
    
    if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId)
      if (error) { toast.error(error.message); setSaving(false); return }
      setProducts(p => p.map(x => x.id === editId ? { ...x, ...payload } : x))
      toast.success('Product updated!')
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      setProducts(p => [data, ...p])
      toast.success('Product added!')
    }
    setShowAdd(false); setEditId(null)
    setForm({ name: '', description: '', price_dzd: '', stock_quantity: '', category: '', is_active: true })
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id)
    if (error) return toast.error(error.message)
    setProducts(p => p.map(x => x.id === id ? { ...x, is_active: !current } : x))
    toast.success(`Product ${!current ? 'activated' : 'deactivated'}`)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure? This will hide the product from your AI bot catalog immediately.')) return
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return toast.error(error.message)
    setProducts(p => p.filter(x => x.id !== id))
    toast.success('Product removed')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, fontSize: 14, color: '#fff', outline: 'none', transition: 'border-color .2s' }

  return (
    <div className="p-2 lg:p-6 min-h-screen bg-[#030711]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="font-poppins text-3xl font-black text-white mb-1">Catalog Manager 🛍️</h1>
          <p className="text-sm text-white/40 font-medium">Control the inventory your AI bot sells across platforms.</p>
        </div>
        <button 
          onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', description: '', price_dzd: '', stock_quantity: '', category: '', is_active: true }) }} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-white/20 font-black uppercase tracking-widest animate-pulse">Loading Catalog...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="group relative bg-[#0a1628] border border-white/5 rounded-2xl p-6 transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => { setEditId(p.id); setForm({ name: p.name, description: p.description || '', price_dzd: p.price_dzd.toString(), stock_quantity: p.stock_quantity.toString(), category: p.category || '', is_active: p.is_active }); setShowAdd(true) }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"><XCircle className="w-4 h-4" /></button>
              </div>

              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🛍️</div>
              
              <div className="mb-4">
                <h3 className="font-poppins text-lg font-black text-white line-clamp-1 mb-1">{p.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">{p.category || 'Standard'}</span>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-white/5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Price</div>
                  <div className="font-poppins text-xl font-bold text-emerald-500">{Number(p.price_dzd).toLocaleString()} <span className="text-xs">DZD</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Stock</div>
                  <div className={`font-poppins text-lg font-bold ${p.stock_quantity > 0 ? 'text-white' : 'text-red-500'}`}>{p.stock_quantity}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-white/20'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{p.is_active ? 'Active' : 'Hidden'}</span>
                </div>
                <button onClick={() => toggleActive(p.id, p.is_active)} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
                  {p.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-[#0a1628] border border-dashed border-white/10 rounded-3xl p-20 text-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-4xl mb-6">📦</div>
          <h2 className="font-poppins text-2xl font-black text-white mb-2">Your Catalog is Empty</h2>
          <p className="text-white/40 max-w-sm mx-auto mb-8 text-sm">Add products here so your ManyChat AI bot can pull them into conversation automatically.</p>
          <button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20">
            Create First Product
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#030711]/95 backdrop-blur-xl z-[1000] flex items-center justify-center p-4 lg:p-0" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0a1628] border border-white/10 rounded-3xl p-8 w-full max-w-xl shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
              <h3 className="font-poppins text-xl font-black text-white mb-8">{editId ? 'Modify Product' : 'Add New Product'} 🛍️</h3>
              
              <form onSubmit={saveProduct} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Product Name *</label>
                  <input style={inputStyle} required placeholder="E.g. Premium Cotton T-Shirt" value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Category</label>
                  <input style={inputStyle} placeholder="Clothing" value={form.category} onChange={e => setForm(x => ({ ...x, category: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Price (DZD) *</label>
                  <input style={inputStyle} type="number" required placeholder="3500" value={form.price_dzd} onChange={e => setForm(x => ({ ...x, price_dzd: e.target.value }))} className="font-bold text-emerald-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Stock Quantity *</label>
                  <input style={inputStyle} type="number" required placeholder="100" value={form.stock_quantity} onChange={e => setForm(x => ({ ...x, stock_quantity: e.target.value }))} />
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 h-[46px]">
                    <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(x => ({ ...x, is_active: e.target.checked }))} className="w-4 h-4 rounded border-white/10" />
                    <label htmlFor="is_active" className="text-[11px] font-black uppercase tracking-widest text-white/60 cursor-pointer">Show in Chatbot</label>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Product Description</label>
                  <textarea style={{ ...inputStyle, resize: 'none' } as any} rows={3} placeholder="Tell your customers about this product..." value={form.description} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} />
                </div>

                <div className="col-span-2 flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white/40 text-sm font-bold hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                    {saving ? 'Processing...' : editId ? 'Save Changes' : 'Launch Product →'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Plus({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg> }
function Edit2({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> }
function XCircle({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
