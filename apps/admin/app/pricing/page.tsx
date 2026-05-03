'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  Star,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
  GripVertical,
  Check,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────────────── */

type PricingPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FormData = {
  name: string;
  price: string;
  currency: string;
  period: string;
  description: string;
  features: string;
  is_popular: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  price: '',
  currency: 'DA',
  period: 'month',
  description: '',
  features: '',
  is_popular: false,
  sort_order: '0',
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function formatPrice(price: number, currency: string, period: string) {
  const formatted = price.toLocaleString();
  return `${formatted} ${currency}/${period}`;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function PricingManagementPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<PricingPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch ───────────────────────────────────────────────────────────── */

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pricing', { credentials: 'include' });
      const json = await res.json();
      if (res.ok) {
        setPlans(json.data ?? []);
      } else {
        console.error('Failed to fetch plans:', json.error);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  /* ── Create / Update ─────────────────────────────────────────────────── */

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      price: String(plan.price),
      currency: plan.currency,
      period: plan.period,
      description: plan.description ?? '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      is_popular: plan.is_popular,
      sort_order: String(plan.sort_order),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) return;
    setSaving(true);

    const featuresArray = form.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      const payload: Record<string, unknown> = {
        action: editingPlan ? 'update' : 'create',
        name: form.name.trim(),
        price: parseFloat(form.price),
        currency: form.currency,
        period: form.period,
        description: form.description.trim() || null,
        features: featuresArray,
        is_popular: form.is_popular,
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (editingPlan) {
        payload.id = editingPlan.id;
      }

      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      setShowModal(false);
      setEditingPlan(null);
      setForm(EMPTY_FORM);
      await fetchPlans();
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving plan: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ──────────────────────────────────────────────────────────── */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'delete', id: deleteTarget.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete');

      setDeleteTarget(null);
      await fetchPlans();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting plan: ' + (err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Toggle Active ───────────────────────────────────────────────────── */

  const handleToggle = async (plan: PricingPlan) => {
    const newActive = !plan.is_active;

    // Optimistic update
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, is_active: newActive } : p)),
    );

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'toggle_active',
          id: plan.id,
          is_active: newActive,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to toggle');
    } catch (err) {
      console.error('Toggle error:', err);
      // Rollback
      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, is_active: plan.is_active } : p,
        ),
      );
    }
  };

  /* ── Derived stats ───────────────────────────────────────────────────── */

  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.is_active).length;
  const popularPlan = plans.find((p) => p.is_popular)?.name ?? '—';

  /* ── Loading state ───────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <DollarSign className="text-blue-400 w-9 h-9" />
            Pricing Plans
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            Manage your subscription tiers and pricing.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-2xl">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">
            Total Plans
          </p>
          <p className="text-2xl font-black text-white">{totalPlans}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">
            Active Plans
          </p>
          <p className="text-2xl font-black text-white">{activePlans}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-0.5">
            Popular Plan
          </p>
          <p className="text-2xl font-black text-white truncate max-w-[160px]">
            {popularPlan}
          </p>
        </div>
      </div>

      {/* ── Plans Grid ─────────────────────────────────────────────────── */}
      {plans.length === 0 ? (
        <div className="col-span-full py-20 bg-[#0A1628] border border-dashed border-slate-800 rounded-3xl text-center">
          <DollarSign className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            No pricing plans yet. Create your first plan to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[#0A1628] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all relative ${
                !plan.is_active ? 'opacity-50' : ''
              }`}
            >
              {/* Popular badge */}
              {plan.is_popular && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-xl">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-black text-white">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400 ml-1.5">
                    {plan.currency}/{plan.period}
                  </span>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {plan.description}
                  </p>
                )}

                {/* Features */}
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Features
                    </p>
                    <ul className="space-y-1.5">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-300"
                        >
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-auto">
                <button
                  onClick={() => handleToggle(plan)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                    plan.is_active
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {plan.is_active ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                  {plan.is_active ? 'Active' : 'Inactive'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(plan)}
                    className="p-2 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-colors"
                    title="Edit plan"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(plan)}
                    className="p-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!saving) {
                setShowModal(false);
                setEditingPlan(null);
              }
            }}
          />

          {/* Modal */}
          <div className="relative bg-[#0D1B2A] border border-slate-800 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => {
                if (!saving) {
                  setShowModal(false);
                  setEditingPlan(null);
                }
              }}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-6">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h3>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Starter, Professional, Enterprise"
                  className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* Price + Currency row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Price
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="any"
                    className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    placeholder="DA"
                    className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Period + Sort Order row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Billing Period
                  </label>
                  <select
                    value={form.period}
                    onChange={(e) =>
                      setForm({ ...form, period: e.target.value })
                    }
                    className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({ ...form, sort_order: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Brief description of this plan..."
                  rows={2}
                  className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Features (one per line)
                </label>
                <textarea
                  value={form.features}
                  onChange={(e) =>
                    setForm({ ...form, features: e.target.value })
                  }
                  placeholder={"Dashboard access\nEmail support\nAPI access"}
                  rows={4}
                  className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Popular toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, is_popular: !form.is_popular })
                  }
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    form.is_popular
                      ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${
                      form.is_popular ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Mark as Popular
                </span>
                {form.is_popular && (
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.price.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingPlan ? (
                    'Update Plan'
                  ) : (
                    'Create Plan'
                  )}
                </button>
                <button
                  onClick={() => {
                    if (!saving) {
                      setShowModal(false);
                      setEditingPlan(null);
                    }
                  }}
                  disabled={saving}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!deleting) setDeleteTarget(null);
            }}
          />

          {/* Modal */}
          <div className="relative bg-[#0D1B2A] border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                Delete Plan
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to delete{' '}
                <span className="text-white font-bold">
                  {deleteTarget.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!deleting) setDeleteTarget(null);
                  }}
                  disabled={deleting}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Plan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
