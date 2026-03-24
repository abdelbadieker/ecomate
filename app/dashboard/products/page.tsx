'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({ name: '', description: '', price_da: '', stock: '', category: '' })
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUserId(data.user!.id)
      const { data: p } = await supabase.from('products').select('*').eq('user_id', data.user!.id).order('created_at', { ascending: false })
      setProducts(p || [])
      setLoading(false)
    })
  }, [])

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = { user_id: userId, name: form.name, description: form.description, price_da: parseInt(form.price_da) || 0, stock: parseInt(form.stock) || 0, category: form.category }
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
    setForm({ name: '', description: '', price_da: '', stock: '', category: '' })
    setSaving(false)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(p => p.filter(x => x.id !== id))
    toast.success('Product deleted')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 9, fontSize: 13.5, color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font-inter)' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Products 🛍️</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{products.length} products in your catalog</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', description: '', price_da: '', stock: '', category: '' }) }} className="btn-primary" style={{ padding: '11px 22px' }}>+ Add Product</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading products...</div>
      ) : products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '20px', transition: 'border-color .2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛍️</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditId(p.id); setForm({ name: p.name, description: p.description || '', price_da: p.price_da.toString(), stock: p.stock.toString(), category: p.category || '' }); setShowAdd(true) }} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.2)', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{p.name}</div>
              {p.category && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{p.category}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#10B981' }}>{p.price_da.toLocaleString()} DA</div>
                <div style={{ fontSize: 12, color: p.stock > 0 ? '#10B981' : '#ef4444', fontWeight: 600 }}>Stock: {p.stock}</div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.is_active ? '#10B981' : '#94a3b8' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>No products yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Add your first product to start selling</div>
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add First Product</button>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,16,31,.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 460 }}>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 20 }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Product Name *', key: 'name', placeholder: 'Black Hoodie', type: 'text', required: true },
                { label: 'Category', key: 'category', placeholder: 'Clothing', type: 'text', required: false },
                { label: 'Price (DA) *', key: 'price_da', placeholder: '3500', type: 'number', required: true },
                { label: 'Stock Quantity', key: 'stock', placeholder: '100', type: 'number', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input style={inputStyle} type={f.type} required={f.required} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea style={{ ...inputStyle, resize: 'none' } as any} rows={2} placeholder="Product description..." value={form.description} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
