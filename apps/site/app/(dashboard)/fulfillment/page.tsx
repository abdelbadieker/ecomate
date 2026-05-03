'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Truck, Package, CheckCircle, Clock, Plus, X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/lib/storage-utils';

type Order = { id: string; customer_name: string; status: string; total: number; city: string; address: string; tracking_code: string; created_at: string };
type FulfillmentProduct = { id: string; name: string; price: number; stock: number; image_url: string | null; description: string | null; category: string; created_at: string };

const stages = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

export default function FulfillmentPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fulfillmentProducts, setFulfillmentProducts] = useState<FulfillmentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '', description: '', category: 'General' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'pipeline' | 'products'>('pipeline');
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const [ordersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('is_fulfillment', true).order('created_at', { ascending: false }),
    ]);
    setOrders(ordersRes.data || []);
    setFulfillmentProducts(productsRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { 
    fetchData(); 
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        supabase.from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(!!profile?.is_admin);
          });
      }
    });
  }, [fetchData, supabase]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (!isAdmin) {
      alert('Unauthorized: Only admins can manage fulfillment products.');
      return;
    }
    setSubmitting(true);
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const { url, error } = await uploadFile(supabase, imageFile, {
          bucket: 'product-images',
          path: 'fulfillment',
          maxSizeMB: 50,
          allowedTypes: ['image/'],
          signal: controller.signal,
        });

        if (error) {
          if (error !== 'Upload cancelled') alert('Image upload failed: ' + error);
          return;
        }

        imageUrl = url;
      }

      const { error: insertError } = await supabase.from('products').insert({
        name: productForm.name,
        price: parseFloat(productForm.price) || 0,
        stock: parseInt(productForm.stock) || 0,
        description: productForm.description || null,
        category: productForm.category,
        image_url: imageUrl,
        is_fulfillment: true,
        merchant_id: userId,
      });

      if (insertError) {
        console.error('Error adding product:', insertError);
        alert('Failed to add product: ' + insertError.message);
        return;
      }

      setProductForm({ name: '', price: '', stock: '', description: '', category: 'General' });
      setImageFile(null);
      setImagePreview(null);
      setShowAddProduct(false);
      fetchData();
    } finally {
      uploadAbortRef.current = null;
      setSubmitting(false);
    }
  };

  const cancelUpload = () => {
    uploadAbortRef.current?.abort();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAdmin) {
      alert('Unauthorized: Only admins can delete fulfillment products.');
      return;
    }
    if (confirm('Remove this product from fulfillment?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  const s = { card: { background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 16, padding: 20 } as React.CSSProperties };
  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(7,16,31,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 10, color: '#e2e8f0', fontSize: 13, outline: 'none' } as React.CSSProperties;
  const btnStyle = { padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div style={{ width: 32, height: 32, border: '3px solid #1e293b', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Fulfillment</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Manage your shipping pipeline & fulfillment products</p>
        </div>
        {tab === 'products' && isAdmin && (
          <button onClick={() => setShowAddProduct(true)} style={{ ...btnStyle, background: 'linear-gradient(135deg, #34d399, #059669)', color: '#fff' }}>
            <Plus style={{ width: 16, height: 16 }} /> Add Fulfillment Product
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setTab('pipeline')} style={{ ...btnStyle, padding: '8px 18px', background: tab === 'pipeline' ? 'rgba(52,211,153,0.15)' : 'rgba(51,65,85,0.2)', color: tab === 'pipeline' ? '#34d399' : '#64748b', border: tab === 'pipeline' ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent' }}>
          <Truck style={{ width: 14, height: 14 }} /> Pipeline ({orders.length})
        </button>
        <button onClick={() => setTab('products')} style={{ ...btnStyle, padding: '8px 18px', background: tab === 'products' ? 'rgba(52,211,153,0.15)' : 'rgba(51,65,85,0.2)', color: tab === 'products' ? '#34d399' : '#64748b', border: tab === 'products' ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent' }}>
          <Package style={{ width: 14, height: 14 }} /> Products ({fulfillmentProducts.length})
        </button>
      </div>


      {/* Pipeline Tab */}
      {tab === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stages.map(stage => {
            const stageOrders = orders.filter(o => o.status === stage);
            const icons = { Processing: Clock, Confirmed: CheckCircle, Shipped: Truck, Delivered: Package };
            const colors = { Processing: '#fbbf24', Confirmed: '#60a5fa', Shipped: '#a78bfa', Delivered: '#34d399' };
            const Icon = icons[stage as keyof typeof icons];
            const color = colors[stage as keyof typeof colors];
            return (
              <div key={stage} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Icon style={{ width: 18, height: 18, color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{stage}</span>
                  <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 999, background: `${color}15`, color, fontSize: 11, fontWeight: 700 }}>{stageOrders.length}</span>
                </div>
                {stageOrders.map(o => (
                  <div key={o.id} style={{ ...s.card, padding: 14, borderLeftWidth: 3, borderLeftColor: color }}>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 4 }}>{o.tracking_code}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{o.city}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginTop: 8 }}>DA {o.total?.toLocaleString()}</div>
                  </div>
                ))}
                {stageOrders.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#334155', fontSize: 12 }}>No orders</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <>
          {showAddProduct && (
            <div style={{ ...s.card, position: 'relative' }}>
              <button onClick={() => { setShowAddProduct(false); setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Add Fulfillment Product</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Product Name</label><input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={inputStyle} placeholder="e.g. Shipping Box" /></div>
                <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label><input value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={inputStyle} placeholder="e.g. Packaging" /></div>
                <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Price (DA)</label><input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={inputStyle} placeholder="0" /></div>
                <div><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Stock</label><input type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} style={inputStyle} placeholder="0" /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label><input value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} style={inputStyle} placeholder="Product description..." /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Product Image</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed rgba(51,65,85,0.5)', borderRadius: 12, padding: imagePreview ? 0 : 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(7,16,31,0.4)', minHeight: 80, overflow: 'hidden' }}>
                    {imagePreview ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Image src={imagePreview} alt="Preview" width={400} height={150} style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 10 }} />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                        >
                          <X style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload style={{ width: 22, height: 22, color: '#475569', marginBottom: 6 }} />
                        <span style={{ fontSize: 12, color: '#64748b' }}>Click to upload image</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button onClick={handleAddProduct} disabled={submitting || !productForm.name} style={{ ...btnStyle, background: submitting || !productForm.name ? '#1e293b' : 'linear-gradient(135deg, #34d399, #059669)', color: submitting || !productForm.name ? '#475569' : '#fff' }}>
                  {submitting ? 'Adding...' : 'Add Product'}
                </button>
                {submitting && (
                  <button onClick={cancelUpload} style={{ ...btnStyle, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <X style={{ width: 14, height: 14 }} /> Cancel Upload
                  </button>
                )}
                <button onClick={() => { setShowAddProduct(false); setImageFile(null); setImagePreview(null); }} style={{ ...btnStyle, background: 'rgba(51,65,85,0.3)', color: '#94a3b8' }}>Cancel</button>
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
                {fulfillmentProducts.map(p => (
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
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.description?.slice(0, 50)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}><span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: 11, fontWeight: 600 }}>{p.category}</span></td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>DA {p.price.toLocaleString()}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}><span style={{ color: p.stock < 10 ? '#f87171' : '#e2e8f0', fontWeight: 600 }}>{p.stock}</span></td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: 6, color: '#f87171', cursor: 'pointer' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fulfillmentProducts.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No fulfillment products yet. Add your first product above.</div>}
          </div>
        </>
      )}
    </div>
  );
}
