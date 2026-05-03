'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, X, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/lib/storage-utils';

type Product = { id: string; name: string; price: number; stock: number; image_url: string | null; description: string | null; category: string; is_active: boolean; created_at: string; is_fulfillment: boolean };

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', category: 'General' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts(); }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, signal: AbortSignal): Promise<string | null> => {
    const { url, error } = await uploadFile(supabase, file, {
      bucket: 'product-images',
      path: 'products',
      maxSizeMB: 50,
      allowedTypes: ['image/'],
      signal,
    });

    if (error) {
      if (error !== 'Upload cancelled') alert(`Upload failed: ${error}`);
      return null;
    }

    return url;
  };

  const handleSubmit = async () => {
    setUploading(true);
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    try {
      let imageUrl: string | null = editing?.image_url || null;

      if (imageFile) {
        const url = await uploadImage(imageFile, controller.signal);
        if (!url) return;
        imageUrl = url;
      }

      const payload = { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock), description: form.description || null, category: form.category, image_url: imageUrl, is_fulfillment: false };
      const { error } = editing
        ? await supabase.from('products').update(payload).eq('id', editing.id)
        : await supabase.from('products').insert(payload);

      if (error) throw error;

      setForm({ name: '', price: '', stock: '', description: '', category: 'General' });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name !== 'AbortError') alert(`Product save failed: ${error.message}`);
    } finally {
      uploadAbortRef.current = null;
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    uploadAbortRef.current?.abort();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock), description: p.description || '', category: p.category });
    setImagePreview(p.image_url || null);
    setImageFile(null);
    setShowForm(true);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const s = {
    card: { background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 16, padding: 20 } as React.CSSProperties,
    input: { width: '100%', padding: '10px 14px', background: 'rgba(7,16,31,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 10, color: '#e2e8f0', fontSize: 13, outline: 'none' } as React.CSSProperties,
    btn: { padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div style={{ width: 32, height: 32, border: '3px solid #1e293b', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Products</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{products.length} products in catalog</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', price: '', stock: '', description: '', category: 'General' }); setImageFile(null); setImagePreview(null); setShowForm(true); }} style={{ ...s.btn, background: 'linear-gradient(135deg, #34d399, #059669)', color: '#fff' }}>
          <Plus style={{ width: 16, height: 16 }} /> Add Product
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', ...s.card, padding: '10px 16px', gap: 10 }}>
        <Search style={{ width: 16, height: 16, color: '#64748b' }} />
        <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...s.input, border: 'none', background: 'transparent', padding: 0 }} />
      </div>

      {showForm && (
        <div style={{ ...s.card, position: 'relative' }}>
          <button onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X style={{ width: 18, height: 18 }} /></button>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Product Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={s.input} placeholder="e.g. Wireless Earbuds" /></div>
            <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={s.input} placeholder="e.g. Electronics" /></div>
            <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Price (DA)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={s.input} placeholder="0" /></div>
            <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Stock</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={s.input} placeholder="0" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={s.input} placeholder="Product description..." /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Product Image</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#34d399'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)'; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)'; const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) { setImageFile(f); const r = new FileReader(); r.onload = ev => setImagePreview(ev.target?.result as string); r.readAsDataURL(f); } }}
                style={{
                  border: '2px dashed rgba(51,65,85,0.5)', borderRadius: 12, padding: imagePreview ? 0 : 32,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'border-color 0.2s', background: 'rgba(7,16,31,0.4)',
                  minHeight: 120, overflow: 'hidden', position: 'relative',
                }}
              >
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Image src={imagePreview} alt="Preview" width={400} height={200} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                    <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: 6, fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                      Click to change
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload style={{ width: 28, height: 28, color: '#475569', marginBottom: 8 }} />
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Click or drag & drop an image</span>
                    <span style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>PNG, JPG, WEBP up to 5MB</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button onClick={handleSubmit} disabled={uploading} style={{ ...s.btn, background: uploading ? '#1e293b' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: uploading ? '#475569' : '#fff' }}>
              {uploading ? 'Uploading...' : (editing ? 'Update' : 'Create')} Product
            </button>
            {uploading && (
              <button onClick={cancelUpload} style={{ ...s.btn, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                <X style={{ width: 14, height: 14 }} /> Cancel Upload
              </button>
            )}
            <button onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null); }} style={{ ...s.btn, background: 'rgba(51,65,85,0.3)', color: '#94a3b8' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ borderBottom: '1px solid rgba(51,65,85,0.5)', color: '#64748b', fontSize: 12 }}>
            <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600 }}>Product</th>
            <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600 }}>Category</th>
            <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600 }}>Price</th>
            <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600 }}>Stock</th>
            <th style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} width={40} height={40} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(51,65,85,0.5)' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(51,65,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon style={{ width: 18, height: 18, color: '#475569' }} />
                      </div>
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{p.name}</div>
                        {p.is_fulfillment && (
                          <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(52,211,153,0.1)', color: '#34d399', padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(52,211,153,0.2)' }}>Fulfillment</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.description?.slice(0, 50)}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}><span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 11, fontWeight: 600 }}>{p.category}</span></td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>DA {p.price.toLocaleString()}</td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}><span style={{ color: p.stock < 10 ? '#f87171' : '#e2e8f0', fontWeight: 600 }}>{p.stock}</span></td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button onClick={() => startEdit(p)} style={{ background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 8, padding: 6, color: '#60a5fa', cursor: 'pointer' }}><Pencil style={{ width: 14, height: 14 }} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: 6, color: '#f87171', cursor: 'pointer' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No products found</div>}
      </div>
    </div>
  );
}
