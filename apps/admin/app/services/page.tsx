'use client';

import { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/storage-utils';
import { 
  LayoutList, Plus, Trash2, Edit2, Check, X, Loader2, GripVertical, 
  Image as ImageIcon, Type, Eye, EyeOff, ArrowUp, ArrowDown, Search, AlertTriangle
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon_type: 'emoji' | 'icon' | 'image';
  icon_value: string;
  order_index: number;
  is_active: boolean;
}

const COMMON_ICONS = [
  'Bot', 'BarChart3', 'Package', 'ShoppingBag', 'Users', 'Truck', 'Zap', 'Shield',
  'Star', 'Heart', 'Globe', 'Smartphone', 'Laptop', 'CreditCard', 'TrendingUp', 'MessageSquare'
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<{
    title: string;
    description: string;
    icon_type: 'emoji' | 'icon' | 'image';
    icon_value: string;
    order_index: number;
    is_active: boolean;
  }>({
    title: '',
    description: '',
    icon_type: 'icon',
    icon_value: 'Star',
    order_index: 0,
    is_active: true
  });

  const [iconSearch, setIconSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      setServices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.description || !form.icon_value) {
      alert('Please fill out all required fields.');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/admin/services/${isEditing}` : '/api/admin/services', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error saving service');
      
      closeModal();
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeletingId(null);
      fetchServices();
    } catch (err) {
      alert('Error deleting service');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchServices();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = services.findIndex(s => s.id === id);
    if (currentIndex < 0) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === services.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetService = services[targetIndex];
    const currentService = services[currentIndex];

    // Swap order_indexes conceptually and update via API
    try {
      await Promise.all([
        fetch(`/api/admin/services/${currentService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: targetService.order_index })
        }),
        fetch(`/api/admin/services/${targetService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: currentService.order_index })
        })
      ]);
      fetchServices();
    } catch (err) {
      alert('Error reordering');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadFile(supabase, file, {
        bucket: 'platform-assets',
        path: `services/${Date.now()}_${file.name}`
      });

      if (result.error || !result.url) throw new Error(result.error || 'Upload failed');
      
      setForm(prev => ({ ...prev, icon_value: result.url! }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openModalForNew = () => {
    setForm({
      title: '',
      description: '',
      icon_type: 'icon',
      icon_value: 'Star',
      order_index: services.length > 0 ? Math.max(...services.map(s => s.order_index)) + 1 : 1,
      is_active: true
    });
    setIsEditing(null);
    setShowModal(true);
  };

  const openModalForEdit = (s: Service) => {
    setForm({
      title: s.title,
      description: s.description,
      icon_type: s.icon_type,
      icon_value: s.icon_value,
      order_index: s.order_index,
      is_active: s.is_active
    });
    setIsEditing(s.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
  };

  const renderIconPreview = (type: string, value: string, sizeClass = "w-6 h-6") => {
    if (!value) return null;
    
    if (type === 'image') {
      return <img src={value} alt="Preview" className={`object-cover rounded ${sizeClass}`} style={{ width: '100%', height: '100%' }} />;
    }
    
    if (type === 'icon') {
      const IconComp = (LucideIcons as any)[value] || LucideIcons.HelpCircle;
      return <IconComp className={sizeClass} />;
    }
    
    if (type === 'emoji') {
      return <span style={{ fontSize: '1.5rem', lineHeight: 1 }} className="flex items-center justify-center">{value}</span>;
    }
    
    return null;
  };

  const filteredIcons = COMMON_ICONS.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()));

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center bg-[#0A1628] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <LayoutList className="text-blue-500 w-8 h-8" />
            Services Manager
          </h2>
          <p className="text-slate-400 mt-2 font-medium">
            Manage your main website's service features. Changes reflect instantly.
          </p>
        </div>
        <button 
          onClick={openModalForNew} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0A1628] rounded-3xl border border-dashed border-slate-700 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <LayoutList className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No services yet</h3>
          <p className="text-slate-400 mb-6">Start by creating your first service to display on the public website.</p>
          <button 
            onClick={openModalForNew}
            className="px-6 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl transition-colors"
          >
            Create First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <div key={s.id} className={`group bg-[#0A1628] border ${!s.is_active ? 'border-slate-800/50 opacity-75' : 'border-slate-800'} rounded-3xl p-6 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden shadow-xl flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 overflow-hidden">
                  {renderIconPreview(s.icon_type, s.icon_value, "w-7 h-7")}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${s.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {s.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-white mb-2">{s.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{s.description}</p>
              
              <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <button 
                    disabled={idx === 0}
                    onClick={() => handleReorder(s.id, 'up')} 
                    className="p-1.5 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded transition-colors disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={idx === services.length - 1}
                    onClick={() => handleReorder(s.id, 'down')} 
                    className="p-1.5 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded transition-colors disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleActive(s.id, s.is_active)}
                    className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800/50 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    title={s.is_active ? "Hide Service" : "Show Service"}
                  >
                    {s.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => openModalForEdit(s)}
                    className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => confirmDelete(s.id)}
                    className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0A1628] w-full max-w-5xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Form Section */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">{isEditing ? 'Edit Service' : 'Create New Service'}</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Title</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    className="w-full bg-[#0f1c33] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" 
                    placeholder="e.g. AI Sales Chatbot" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    className="w-full bg-[#0f1c33] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-none" 
                    placeholder="Briefly describe the feature..." 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Icon Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setForm({...form, icon_type: 'icon', icon_value: 'Star'})}
                      className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border transition-all ${form.icon_type === 'icon' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0f1c33] border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <LayoutList className="w-4 h-4" /> Icon
                    </button>
                    <button 
                      onClick={() => setForm({...form, icon_type: 'emoji', icon_value: '🚀'})}
                      className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border transition-all ${form.icon_type === 'emoji' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0f1c33] border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <Type className="w-4 h-4" /> Emoji
                    </button>
                    <button 
                      onClick={() => setForm({...form, icon_type: 'image', icon_value: ''})}
                      className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border transition-all ${form.icon_type === 'image' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0f1c33] border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <ImageIcon className="w-4 h-4" /> Image
                    </button>
                  </div>
                </div>

                {/* Dynamic Icon Input based on Type */}
                <div className="bg-[#0f1c33] p-5 rounded-2xl border border-slate-700">
                  {form.icon_type === 'emoji' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Emoji Character</label>
                      <input 
                        value={form.icon_value} 
                        onChange={e => setForm({...form, icon_value: e.target.value})} 
                        className="w-full bg-[#0A1628] border border-slate-600 rounded-xl px-4 py-3 text-white text-xl outline-none focus:border-blue-500 transition-colors" 
                        placeholder="🔥" 
                      />
                    </div>
                  )}

                  {form.icon_type === 'icon' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Lucide Icon</label>
                      <div className="relative mb-4">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          value={iconSearch} 
                          onChange={e => setIconSearch(e.target.value)} 
                          className="w-full bg-[#0A1628] border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" 
                          placeholder="Search common icons..." 
                        />
                      </div>
                      <div className="grid grid-cols-8 gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredIcons.map(iconName => {
                          const IconComp = (LucideIcons as any)[iconName];
                          return (
                            <button
                              key={iconName}
                              onClick={() => setForm({...form, icon_value: iconName})}
                              className={`aspect-square rounded-lg flex items-center justify-center transition-all ${form.icon_value === iconName ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                              title={iconName}
                            >
                              <IconComp className="w-5 h-5" />
                            </button>
                          )
                        })}
                      </div>
                      <div className="mt-3 text-xs text-slate-500 text-center">Or type any valid Lucide icon name:</div>
                      <input 
                        value={form.icon_value} 
                        onChange={e => setForm({...form, icon_value: e.target.value})} 
                        className="w-full mt-1 bg-[#0A1628] border border-slate-600 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  )}

                  {form.icon_type === 'image' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload Image</label>
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <div className="flex gap-4 items-center">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                          Upload File
                        </button>
                        <input 
                          value={form.icon_value} 
                          onChange={e => setForm({...form, icon_value: e.target.value})} 
                          className="flex-1 bg-[#0A1628] border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors text-sm" 
                          placeholder="Or paste image URL..." 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="md:w-[400px] bg-[#07101F] p-8 border-l border-slate-800 flex flex-col items-center justify-center relative">
              <div className="absolute top-4 left-4 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
                <Eye className="w-3 h-3" /> Live Preview
              </div>
              
              <div className="w-full bg-[#0f1c33] border border-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative z-10 text-blue-400">
                  {renderIconPreview(form.icon_type, form.icon_value, "w-7 h-7")}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-poppins relative z-10">
                  {form.title || 'Service Title'}
                </h3>
                <p className="text-slate-400 leading-relaxed relative z-10 text-sm">
                  {form.description || 'Description of your service will appear here...'}
                </p>
              </div>

              <div className="w-full mt-10 space-y-4">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Save Service
                </button>
                <button 
                  onClick={closeModal} 
                  className="w-full py-3 bg-transparent text-slate-400 hover:text-white font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A1628] w-full max-w-md rounded-3xl border border-red-500/30 p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Delete Service?</h3>
            <p className="text-slate-400 mb-8">This action cannot be undone. This service will be permanently removed from the website.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingId(null)} 
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeDelete(deletingId)} 
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
