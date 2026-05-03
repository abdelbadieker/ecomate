'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LayoutList, Plus, Trash2, Edit2, Check, X, Loader2, GripVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string | null;
  order_index: number;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: '',
    image_url: '',
    order_index: 0,
    is_active: true
  });
  
  const [showForm, setShowForm] = useState(false);

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
    try {
      if (isEditing) {
        await fetch(`/api/admin/services/${isEditing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      
      resetForm();
      fetchServices();
    } catch (err) {
      alert('Error saving service');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
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

  const resetForm = () => {
    setForm({ title: '', description: '', icon: '', image_url: '', order_index: services.length, is_active: true });
    setIsEditing(null);
    setShowForm(false);
  };

  const editService = (s: Service) => {
    setForm({
      title: s.title,
      description: s.description,
      icon: s.icon || '',
      image_url: s.image_url || '',
      order_index: s.order_index,
      is_active: s.is_active
    });
    setIsEditing(s.id);
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <LayoutList className="text-blue-500 w-8 h-8" />
            Services Management
          </h2>
          <p className="text-slate-400 mt-1 font-medium text-sm">
            Manage the features/services displayed on the public website.
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }} 
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Service
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0A1628] border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Service' : 'New Service'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-[#07101F] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. AI Sales Chatbot" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Icon Name or Emoji</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {(() => {
                    if (!form.icon) return <LayoutList className="w-4 h-4" />;
                    const hasValidIcon = !!(LucideIcons as any)[form.icon];
                    const IconPreview = hasValidIcon ? (LucideIcons as any)[form.icon] : null;
                    if (IconPreview) return <IconPreview className="w-4 h-4" />;
                    return <span className="text-lg leading-none">{form.icon}</span>;
                  })()}
                </div>
                <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full bg-[#07101F] border border-slate-700 rounded-xl pl-14 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Bot, 🔥, Package" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-[#07101F] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors min-h-[100px]" placeholder="Briefly describe the feature..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image URL (Optional)</label>
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-[#07101F] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Index</label>
              <input type="number" value={form.order_index} onChange={e => setForm({...form, order_index: parseInt(e.target.value) || 0})} className="w-full bg-[#07101F] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button onClick={resetForm} className="px-6 py-2.5 bg-transparent border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl transition-all">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2">
              <Check className="w-4 h-4" /> Save Service
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-[#0A1628] rounded-2xl border border-dashed border-slate-700">
            <p className="text-slate-500">No services created yet.</p>
          </div>
        ) : (
          services.map((s) => (
            <div key={s.id} className="bg-[#0A1628] border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-colors">
              <div className="text-slate-600 cursor-grab px-2"><GripVertical className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 font-bold">
                {(() => {
                  if (s.image_url) return <img src={s.image_url} alt="img" className="w-full h-full object-cover rounded-lg" />;
                  if (!s.icon) return s.order_index;
                  const hasValidIcon = !!(LucideIcons as any)[s.icon];
                  const IconComp = hasValidIcon ? (LucideIcons as any)[s.icon] : null;
                  if (IconComp) return <IconComp className="w-5 h-5" />;
                  return <span className="text-xl leading-none">{s.icon}</span>;
                })()}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">{s.title}</h4>
                <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{s.description}</p>
              </div>
              <div className="flex items-center gap-3 pr-2">
                <span className="text-xs text-slate-500 font-bold w-12 text-center">Ord: {s.order_index}</span>
                <button 
                  onClick={() => handleToggleActive(s.id, s.is_active)}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors ${s.is_active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                  {s.is_active ? 'Active' : 'Hidden'}
                </button>
                <div className="w-px h-6 bg-slate-800 mx-1"></div>
                <button onClick={() => editService(s)} className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
