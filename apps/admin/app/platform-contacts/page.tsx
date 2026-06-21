'use client';
import { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Plus, Trash2, CheckCircle2, Loader2, Edit3 } from 'lucide-react';

type Contact = {
  id: string;
  type: string;
  value: string;
  is_active: boolean;
};

// All writes go through the service-role API (admin uses a cookie session, not
// Supabase Auth, so direct browser writes are correctly blocked by RLS).
async function api(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/platform-contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export default function ContactsManagement() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newContact, setNewContact] = useState({ type: 'phone', value: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/platform-contacts');
      const json = await res.json();
      setContacts(json.data || []);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api({ action: 'create', type: newContact.type, value: newContact.value });
      setNewContact({ type: 'phone', value: '' });
      await fetchContacts();
    } catch (err) {
      alert('Error saving contact: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api({ action: 'update', id, is_active: !currentStatus });
      await fetchContacts();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api({ action: 'delete', id });
      await fetchContacts();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleEditSave = async (id: string) => {
    setSaving(true);
    try {
      await api({ action: 'update', id, value: editValue });
      setEditingId(null);
      await fetchContacts();
    } catch (err) {
      alert('Error updating contact: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-[3px] border-slate-700 border-t-emerald-400 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white">Platform Contact Info</h2>
        <p className="text-slate-400 mt-2">Manage what users see when they click "Contact Us" on the landing page.</p>
      </div>

      <div className="bg-[#0A1628] border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <Plus className="text-blue-500 w-5 h-5" />
          Add New Contact Point
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-500 uppercase font-black mb-2">Type</label>
            <select
              value={newContact.type}
              onChange={e => setNewContact({ ...newContact, type: e.target.value })}
              className="w-full bg-[#07101F] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 appearance-none"
            >
              <option value="phone">Phone Number</option>
              <option value="email">Email Address</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="address">Physical Address</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 uppercase font-black mb-2">Value</label>
            <input
              required
              placeholder="+213..."
              value={newContact.value}
              onChange={e => setNewContact({ ...newContact, value: e.target.value })}
              className="w-full bg-[#07101F] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-[48px] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            Save Information
          </button>
        </form>
      </div>

      <div className="bg-[#0A1628] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/20 font-bold text-sm">Active Contacts</div>
        <div className="divide-y divide-slate-800">
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">No contact info added yet.</div>
          ) : contacts.map(c => (
            <div key={c.id} className="p-6 flex items-center justify-between hover:bg-slate-800/10 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {c.type === 'phone' && <Phone size={18} />}
                  {c.type === 'email' && <Mail size={18} />}
                  {c.type === 'whatsapp' && <MessageSquare size={18} />}
                  {c.type === 'address' && <MapPin size={18} />}
                </div>
                <div className="flex-1">
                  {editingId === c.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="bg-[#07101F] border border-slate-700 rounded-lg px-3 py-1 text-white text-sm outline-none focus:border-blue-500 w-full"
                      />
                      <button onClick={() => handleEditSave(c.id)} className="text-emerald-400 hover:text-emerald-300"><CheckCircle2 size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-400 font-bold text-xs uppercase">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="text-white font-bold">{c.value}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{c.type}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editingId !== c.id && (
                  <button
                    onClick={() => { setEditingId(c.id); setEditValue(c.value); }}
                    className="p-2 text-slate-500 hover:text-blue-400 transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                )}
                <button
                  onClick={() => toggleActive(c.id, c.is_active)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${c.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                >
                  {c.is_active ? 'Visible' : 'Hidden'}
                </button>
                <button
                  onClick={() => deleteContact(c.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
