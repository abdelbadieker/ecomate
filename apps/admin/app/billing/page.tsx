'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  MessageSquare, 
  Phone, 
  Mail, 
  ExternalLink, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Globe,
  Instagram,
  Facebook,
  Send
} from 'lucide-react';

type BillingSetting = {
  id?: string;
  platform: 'whatsapp' | 'telegram' | 'facebook' | 'instagram';
  contact_value: string;
  custom_url: string;
  is_active: boolean;
  support_email: string;
  support_phone: string;
  support_whatsapp: string;
  notes: string;
  updated_at?: string;
};

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<BillingSetting>({
    platform: 'whatsapp',
    contact_value: '',
    custom_url: '',
    is_active: false,
    support_email: '',
    support_phone: '',
    support_whatsapp: '',
    notes: ''
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/billing-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
      setSettings(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/billing-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      
      setSuccess('Settings saved successfully!');
      setShowForm(false);
      fetchSettings();
      setForm({
        platform: 'whatsapp',
        contact_value: '',
        custom_url: '',
        is_active: false,
        support_email: '',
        support_phone: '',
        support_whatsapp: '',
        notes: ''
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (setting: BillingSetting) => {
    try {
      const res = await fetch('/api/admin/billing-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...setting, is_active: !setting.is_active })
      });
      if (!res.ok) throw new Error('Toggle failed');
      fetchSettings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      const res = await fetch(`/api/admin/billing-settings?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchSettings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return <MessageSquare className="text-emerald-400" size={18} />;
      case 'telegram': return <Send className="text-blue-400" size={18} />;
      case 'facebook': return <Facebook className="text-blue-600" size={18} />;
      case 'instagram': return <Instagram className="text-pink-500" size={18} />;
      default: return <Globe size={18} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <CreditCard className="text-blue-500 w-10 h-10" />
            Billing & Redirect Control
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Manage how clients upgrade and who they contact for billing.</p>
        </div>
        <button 
          onClick={() => {
            setForm({ platform: 'whatsapp', contact_value: '', custom_url: '', is_active: false, support_email: '', support_phone: '', support_whatsapp: '', notes: '' });
            setShowForm(!showForm);
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm uppercase tracking-widest"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> New Configuration</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {showForm && (
        <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Redirect Settings */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ExternalLink size={14} /> Upgrade Redirect
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Platform</label>
                    <select 
                      value={form.platform}
                      onChange={e => setForm({...form, platform: e.target.value as any})}
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                      {form.platform === 'whatsapp' ? 'Phone Number (intl format)' : form.platform === 'telegram' ? 'Username' : 'Profile URL'}
                    </label>
                    <input 
                      value={form.contact_value}
                      onChange={e => setForm({...form, contact_value: e.target.value})}
                      placeholder={form.platform === 'whatsapp' ? '+213...' : form.platform === 'telegram' ? 'username' : 'https://...'}
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Custom URL Override (Optional)</label>
                    <input 
                      value={form.custom_url}
                      onChange={e => setForm({...form, custom_url: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Settings */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Smartphone size={14} /> Support Contact Info
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Support Email</label>
                      <input 
                        value={form.support_email}
                        onChange={e => setForm({...form, support_email: e.target.value})}
                        placeholder="billing@ecomate.dz"
                        className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Support Phone</label>
                      <input 
                        value={form.support_phone}
                        onChange={e => setForm({...form, support_phone: e.target.value})}
                        placeholder="+213..."
                        className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Support WhatsApp (Direct)</label>
                    <input 
                      value={form.support_whatsapp}
                      onChange={e => setForm({...form, support_whatsapp: e.target.value})}
                      placeholder="+213..."
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Client Dashboard Note</label>
                    <textarea 
                      value={form.notes}
                      onChange={e => setForm({...form, notes: e.target.value})}
                      placeholder="Message to show on the billing page..."
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold text-xs min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={form.is_active}
                    onChange={e => setForm({...form, is_active: e.target.checked})}
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-emerald-600' : 'bg-slate-700'}`} />
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-6' : ''}`} />
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Set as Active Configuration</span>
              </label>

              <button 
                type="submit"
                disabled={saving}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-[#0A1628] border border-slate-800 rounded-3xl animate-pulse" />
          ))
        ) : settings.length === 0 ? (
          <div className="col-span-full py-20 bg-[#0A1628] border border-slate-800 border-dashed rounded-3xl text-center">
            <CreditCard size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-black text-slate-500 uppercase">No configurations found</h3>
            <p className="text-slate-600 text-sm mt-1">Create your first billing redirect and support profile.</p>
          </div>
        ) : (
          settings.map(s => (
            <div key={s.id} className={`group relative bg-[#0A1628] border rounded-3xl p-6 transition-all hover:shadow-2xl ${s.is_active ? 'border-emerald-500/50 shadow-emerald-500/5' : 'border-slate-800 hover:border-slate-600'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.is_active ? 'bg-emerald-500/10' : 'bg-slate-900'}`}>
                  {getPlatformIcon(s.platform)}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setForm(s); setShowForm(true); }}
                    className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id!)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Redirect Platform</h4>
                  <p className="text-white font-bold capitalize flex items-center gap-2">
                    {s.platform} 
                    <span className="text-[10px] text-slate-500 font-medium">({s.contact_value || s.custom_url})</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Support Email</h4>
                    <p className="text-slate-300 text-xs font-bold truncate">{s.support_email || 'None'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Support Phone</h4>
                    <p className="text-slate-300 text-xs font-bold">{s.support_phone || 'None'}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleToggleActive(s)}
                  className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    s.is_active 
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' 
                      : 'bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {s.is_active ? 'Active Configuration' : 'Set as Active'}
                </button>
              </div>

              {s.is_active && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/50 border-4 border-[#07101F]">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
