'use client';
import { useRef, useState, useEffect } from 'react';
import { Search, User, Package, Plus, Trash2, ArrowLeft, Truck, X, CheckCircle2, Loader2, Camera, Mail } from 'lucide-react';

type Profile = { id: string; full_name: string; email: string; plan: string };
type Product = { id: string; name: string; price: number; stock: number; merchant_id: string; image_url?: string };

export default function FulfillmentEngine() {
  const [merchants, setMerchants] = useState<Profile[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
  const [merchantProducts, setMerchantProducts] = useState<Product[]>([]);
  const [merchantOrders, setMerchantOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  const fetchMerchants = async () => {
    const res = await fetch('/api/admin/fulfillment?action=merchants');
    const json = await res.json();
    setMerchants(json.data || []);
    setLoading(false);
  };

  const fetchMerchantProducts = async (merchantId: string) => {
    const res = await fetch(`/api/admin/fulfillment?action=products&merchantId=${merchantId}`);
    const json = await res.json();
    setMerchantProducts(json.data || []);
  };

  const fetchMerchantOrders = async (merchantId: string) => {
    const res = await fetch(`/api/admin/fulfillment?action=orders&merchantId=${merchantId}`);
    const json = await res.json();
    setMerchantOrders(json.data || []);
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleSelectMerchant = async (merchant: Profile) => {
    setSelectedMerchant(merchant);
    setLoading(true);
    await Promise.all([
      fetchMerchantProducts(merchant.id),
      fetchMerchantOrders(merchant.id),
    ]);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch('/api/admin/fulfillment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', orderId, status }),
    });
    if (selectedMerchant) fetchMerchantOrders(selectedMerchant.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;
    setUploading(true);

    try {
      let image_url = '';

      if (selectedFile) {
        const controller = new AbortController();
        uploadAbortRef.current = controller;
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('/api/admin/fulfillment/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || 'Upload failed');
        image_url = uploadJson.publicUrl;
      }

      const res = await fetch('/api/admin/fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          merchantId: selectedMerchant.id,
          ...newProduct,
          image_url,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add product');

      setNewProduct({ name: '', price: 0, stock: 0 });
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowAddProduct(false);
      fetchMerchantProducts(selectedMerchant.id);
    } catch (err: any) {
      alert(err.name === 'AbortError' ? 'Upload cancelled' : err.message || 'Error adding product');
    } finally {
      uploadAbortRef.current = null;
      setUploading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product from fulfillment?')) return;
    await fetch('/api/admin/fulfillment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_product', productId: id }),
    });
    if (selectedMerchant) fetchMerchantProducts(selectedMerchant.id);
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-[3px] border-slate-800 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <Truck className="text-blue-500 w-10 h-10" />
            Fulfillment Logistics
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Synchronized merchant inventory and supply chain management</p>
        </div>
        {selectedMerchant && (
          <button
            onClick={() => setSelectedMerchant(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={14} /> Global Merchant Fleet
          </button>
        )}
      </div>

      {!selectedMerchant ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map(m => (
            <div
              key={m.id}
              onClick={() => handleSelectMerchant(m)}
              className="bg-[#0A1628] border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Truck size={80} />
              </div>
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-black text-3xl mb-6 border-4 border-slate-900 group-hover:bg-blue-500/10 transition-colors">
                {m.full_name?.charAt(0) || <User />}
              </div>
              <div className="font-black text-xl text-white mb-1 group-hover:text-blue-400 transition-colors">{m.full_name || 'Anonymous Merchant'}</div>
              <div className="text-xs text-slate-500 font-bold mb-6">{m.email}</div>
              <div className="w-full pt-6 border-t border-slate-800 flex justify-between items-center mt-auto">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">{m.plan} Tier</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-400 transition-colors">Access Hub →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-8 z-10">
              <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-4xl shadow-inner">
                {selectedMerchant.full_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{selectedMerchant.full_name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-slate-400 text-sm font-medium">{selectedMerchant.email}</p>
                  <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedMerchant.plan} Subscription</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-900/40 relative z-10"
            >
              <Plus size={20} /> Deploy New SKU
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 ${activeTab === 'catalog' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Inventory Catalog
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 ${activeTab === 'orders' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Order Pipeline
            </button>
          </div>

          {activeTab === 'catalog' ? (
            <div className="bg-[#0A1628] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                <h4 className="font-black text-white text-lg uppercase tracking-widest flex items-center gap-2">
                  <Package className="text-blue-400" /> Merchant Product Catalog
                </h4>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{merchantProducts.length} Items Indexed</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-800/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                      <th className="px-8 py-5">Product Details</th>
                      <th className="px-8 py-5 text-center">Logistics Status</th>
                      <th className="px-8 py-5 text-right">Unit Price</th>
                      <th className="px-8 py-5 text-center">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {merchantProducts.length === 0 ? (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-600 italic font-medium">No logistical SKUs found for this organization.</td></tr>
                    ) : merchantProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group/row">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center shrink-0">
                              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="text-slate-600" size={24} />}
                            </div>
                            <div>
                              <div className="font-black text-white group-hover/row:text-blue-400 transition-colors leading-tight">{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">ID: {p.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${p.stock > 10 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {p.stock} Units Primary
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-white">DA {p.price?.toLocaleString()}</td>
                        <td className="px-8 py-5 text-center">
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="w-10 h-10 bg-slate-800 text-slate-600 hover:text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/10 transition-all border border-slate-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    placeholder="Search by Tracking Code or Customer..."
                    value={orderFilter}
                    onChange={e => setOrderFilter(e.target.value)}
                    className="w-full bg-[#07101F] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div className="flex gap-4">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pipeline Health: {merchantOrders.filter(o => o.status === 'Pending').length} Pending</span>
                </div>
              </div>

              <div className="bg-[#0A1628] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-800/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                      <th className="px-8 py-5">Shipment Target</th>
                      <th className="px-8 py-5">Carrier Code</th>
                      <th className="px-8 py-5 text-center">Fulfillment State</th>
                      <th className="px-8 py-5 text-right">Merchant Payout</th>
                      <th className="px-8 py-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {merchantOrders.filter(o =>
                      o.tracking_code?.toLowerCase().includes(orderFilter.toLowerCase()) ||
                      o.customer_name?.toLowerCase().includes(orderFilter.toLowerCase())
                    ).length === 0 ? (
                      <tr><td colSpan={5} className="p-20 text-center text-slate-600 italic font-medium">No active shipments matching your search profile.</td></tr>
                    ) : merchantOrders.filter(o =>
                      o.tracking_code?.toLowerCase().includes(orderFilter.toLowerCase()) ||
                      o.customer_name?.toLowerCase().includes(orderFilter.toLowerCase())
                    ).map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-black text-white">{o.customer_name}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">{o.city}</div>
                        </td>
                        <td className="px-8 py-5 font-mono text-xs font-bold text-blue-400">
                          {o.tracking_code}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className={`bg-[#07101F] border rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none transition-all ${
                              o.status === 'Pending' ? 'border-amber-500/50 text-amber-500' :
                              o.status === 'Confirmed' ? 'border-blue-500/50 text-blue-500' :
                              o.status === 'On Delivery' ? 'border-indigo-500/50 text-indigo-400' :
                              o.status === 'Delivered' ? 'border-emerald-500/50 text-emerald-400' :
                              'border-red-500/50 text-red-400'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="On Delivery">On Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Returned">Returned</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-white">DA {o.total?.toLocaleString()}</td>
                        <td className="px-8 py-5 text-center">
                          <a href={`mailto:${o.customer_email}`} className="text-slate-500 hover:text-white transition-colors">
                            <Mail size={16} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0A1628] border border-slate-700 rounded-[2.5rem] p-10 max-w-xl w-full shadow-[0_0_100px_rgba(37,99,235,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <Package className="text-blue-500" /> Deploy New SKU
              </h3>
              <button onClick={() => setShowAddProduct(false)} className="w-10 h-10 rounded-full bg-slate-800 text-slate-500 hover:text-white transition-all flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-6">
              {/* Media Hub */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Product Visual Assets</label>
                <div className={`relative border-2 border-dashed rounded-3xl transition-all h-48 flex flex-col items-center justify-center overflow-hidden ${previewUrl ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-[#07101F]'}`}>
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button type="button" onClick={removeFile} className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                          <X size={24} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all mb-4">
                        <Camera size={28} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Capture or Upload Product Image</span>
                      <span className="text-[10px] text-slate-700 mt-2 font-bold uppercase tracking-widest">PNG, JPG, WEBP prioritized</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Global Product Name</label>
                  <input
                    required
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. UltraFit Wireless Headphones"
                    className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Market Price (DA)</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: parseInt(e.target.value) })}
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Initial Stock Inject</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
                >
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {uploading ? 'Processing Data Pipeline...' : 'Commit Product to Hub'}
                </button>
                {uploading && (
                  <button
                    type="button"
                    onClick={() => uploadAbortRef.current?.abort()}
                    className="px-5 py-5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/25 font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
