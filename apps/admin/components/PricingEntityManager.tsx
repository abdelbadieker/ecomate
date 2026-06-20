'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Plus, Edit3, Trash2, Loader2, X, Check, ToggleLeft, ToggleRight, Star } from 'lucide-react';

export type Field = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'features' | 'toggle';
  placeholder?: string;
  half?: boolean;
};

export type EntityConfig = {
  endpoint: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  createLabel: string;
  fields: Field[];
  /** Headline meta line rendered on each card (e.g. the price). */
  cardMeta: (item: Record<string, any>) => ReactNode;
};

const inputCls =
  'w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600';
const labelCls = 'block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5';

export function PricingEntityManager({ config }: { config: EntityConfig }) {
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [deleteTarget, setDeleteTarget] = useState<Record<string, any> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const blankForm = useCallback(() => {
    const f: Record<string, any> = {};
    for (const fl of config.fields) f[fl.key] = fl.type === 'toggle' ? false : '';
    return f;
  }, [config.fields]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(config.endpoint, { credentials: 'include' });
      const json = await res.json();
      if (res.ok) setItems(json.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(blankForm()); setShowModal(true); };

  const openEdit = (item: Record<string, any>) => {
    const f: Record<string, any> = {};
    for (const fl of config.fields) {
      if (fl.type === 'features') f[fl.key] = Array.isArray(item[fl.key]) ? item[fl.key].join('\n') : '';
      else if (fl.type === 'toggle') f[fl.key] = !!item[fl.key];
      else f[fl.key] = item[fl.key] ?? '';
    }
    setEditing(item); setForm(f); setShowModal(true);
  };

  const handleSave = async () => {
    if (!String(form.name || '').trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = { action: editing ? 'update' : 'create' };
      for (const fl of config.fields) {
        const v = form[fl.key];
        if (fl.type === 'number') payload[fl.key] = v === '' || v === null || v === undefined ? null : Number(v);
        else if (fl.type === 'features') payload[fl.key] = String(v || '').split('\n').map((s) => s.trim()).filter(Boolean);
        else if (fl.type === 'toggle') payload[fl.key] = !!v;
        else payload[fl.key] = v;
      }
      if (editing) payload.id = editing.id;
      const res = await fetch(config.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setShowModal(false); setEditing(null); await fetchItems();
    } catch (e) {
      alert('Error saving: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item: Record<string, any>) => {
    const newActive = !item.is_active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: newActive } : i)));
    try {
      const res = await fetch(config.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'toggle_active', id: item.id, is_active: newActive }),
      });
      if (!res.ok) throw new Error('toggle failed');
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: item.is_active } : i)));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(config.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'delete', id: deleteTarget.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      setDeleteTarget(null); await fetchItems();
    } catch (e) {
      alert('Error deleting: ' + (e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>;
  }

  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            {config.icon}
            {config.title}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">{config.subtitle}</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> {config.createLabel}
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-2xl">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Total</p>
          <p className="text-2xl font-black text-white">{items.length}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Active (public)</p>
          <p className="text-2xl font-black text-white">{activeCount}</p>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="py-20 bg-[#0A1628] border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 font-medium">
          Nothing here yet. Click “{config.createLabel}” to add your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className={`bg-[#0A1628] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all relative ${!item.is_active ? 'opacity-50' : ''}`}>
              {item.is_popular && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-xl">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Popular</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-black text-white mb-1">{item.name}</h3>
                <div className="text-lg font-black text-blue-400 mb-4">{config.cardMeta(item)}</div>
                {item.description && <p className="text-sm text-slate-400 mb-4 leading-relaxed">{item.description}</p>}
                {Array.isArray(item.features) && item.features.length > 0 && (
                  <ul className="space-y-1.5 mb-6">
                    {item.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-auto">
                <button onClick={() => handleToggle(item)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${item.is_active ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                  {item.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {item.is_active ? 'Public' : 'Hidden'}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-[#0D1B2A] border border-slate-800 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
            <button onClick={() => !saving && setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-black text-white mb-6">{editing ? `Edit ${config.title.replace(/s$/, '')}` : config.createLabel}</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {config.fields.filter((f) => f.type !== 'textarea' && f.type !== 'features' && f.type !== 'toggle').map((fl) => (
                  <div key={fl.key} className={fl.half ? '' : 'col-span-2'}>
                    <label className={labelCls}>{fl.label}</label>
                    <input type={fl.type === 'number' ? 'number' : 'text'} value={form[fl.key] ?? ''} placeholder={fl.placeholder}
                      onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })} className={inputCls} />
                  </div>
                ))}
              </div>
              {config.fields.filter((f) => f.type === 'textarea').map((fl) => (
                <div key={fl.key}>
                  <label className={labelCls}>{fl.label}</label>
                  <textarea rows={2} value={form[fl.key] ?? ''} placeholder={fl.placeholder}
                    onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })} className={`${inputCls} resize-none`} />
                </div>
              ))}
              {config.fields.filter((f) => f.type === 'features').map((fl) => (
                <div key={fl.key}>
                  <label className={labelCls}>{fl.label}</label>
                  <textarea rows={5} value={form[fl.key] ?? ''} placeholder={'One feature per line'}
                    onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })} className={`${inputCls} resize-none`} />
                </div>
              ))}
              {config.fields.filter((f) => f.type === 'toggle').map((fl) => (
                <div key={fl.key} className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm({ ...form, [fl.key]: !form[fl.key] })}
                    className={`w-10 h-5 rounded-full relative transition-colors ${form[fl.key] ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-slate-700'}`}>
                    <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${form[fl.key] ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{fl.label}</span>
                  {form[fl.key] && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || !String(form.name || '').trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? 'Update' : 'Create'}
                </button>
                <button onClick={() => !saving && setShowModal(false)} disabled={saving} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-[#0D1B2A] border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-400" /></div>
            <h3 className="text-xl font-black text-white mb-2">Delete “{deleteTarget.name}”?</h3>
            <p className="text-sm text-slate-400 mb-6">This removes it from the public pricing page. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => !deleting && setDeleteTarget(null)} disabled={deleting} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
