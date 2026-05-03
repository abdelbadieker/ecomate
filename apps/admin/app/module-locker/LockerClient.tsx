'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Lock, Unlock, Loader2, ShieldCheck, User,
  LayoutDashboard, ShoppingBag, Package, Users as UsersIcon, MapPin,
  Mail, Sparkles, Paintbrush, Globe, Store, PieChart, CreditCard,
  HelpCircle, Zap, AlertTriangle, MessageSquare,
} from 'lucide-react';

type Merchant = {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  locked_sections: string[] | null;
};

// The full list of lockable dashboard sections — every nav item in the
// merchant dashboard layout appears here. Adding a new section to
// apps/site/app/(dashboard)/layout.tsx → just add its feature key here.
const SECTIONS: { id: string; name: string; icon: typeof Lock; description: string }[] = [
  { id: 'overview',    name: 'Overview',        icon: LayoutDashboard, description: 'Main dashboard landing & KPI cards' },
  { id: 'orders',      name: 'Orders',          icon: ShoppingBag,     description: 'Revenue & order processing' },
  { id: 'products',    name: 'Products',        icon: Package,         description: 'Catalog and inventory' },
  { id: 'crm',         name: 'CRM',             icon: UsersIcon,       description: 'Customer records & bulk import' },
  { id: 'ecotrack',    name: 'Ecotrack',        icon: MapPin,          description: 'Logistics & delivery monitoring' },
  { id: 'fulfillment', name: 'Fulfillment',     icon: Mail,            description: 'Shipping engine' },
  { id: 'chatbot',     name: 'AI Chatbot',      icon: Sparkles,        description: 'Automated lead handling' },
  { id: 'creative',    name: 'Creative Studio', icon: Paintbrush,      description: 'Content requests & delivery' },
  { id: 'web',         name: 'Web Creation',    icon: Globe,           description: 'Storefront & landing page builder' },
  { id: 'estore',      name: 'E-Store',         icon: Store,           description: 'Hosted storefront' },
  { id: 'analytics',   name: 'Analytics',       icon: PieChart,        description: 'Performance metrics & reports' },
  { id: 'billing',     name: 'Billing',         icon: CreditCard,      description: 'Subscription & invoices' },
  { id: 'messages',    name: 'Messages',        icon: MessageSquare,   description: 'Admin/client messaging center' },
  { id: 'support',     name: 'Support',         icon: HelpCircle,      description: 'Tickets & contact' },
];

export default function LockerClient({ initialMerchants }: { initialMerchants: Merchant[] }) {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>(initialMerchants);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState<null | 'unlock' | 'lock'>(null);
  const [globalProcessing, setGlobalProcessing] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const selected = useMemo(
    () => merchants.find(m => m.id === selectedId) ?? null,
    [merchants, selectedId],
  );

  const filtered = merchants.filter(m =>
    m?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const flash = (tone: 'ok' | 'err', msg: string) => {
    setBanner({ tone, msg });
    setTimeout(() => setBanner(null), 3500);
  };

  const applyUpdate = async (payload: Record<string, unknown>, optimistic: Partial<Merchant>) => {
    if (!selected) return;
    const res = await fetch('/api/admin/module-locker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, ...payload }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(j.error || 'Update failed');
    }
    const merged = { ...selected, ...optimistic };
    setMerchants(prev => prev.map(m => (m.id === selected.id ? merged : m)));
    router.refresh();
  };

  const toggleSection = async (sectionId: string) => {
    if (!selected) return;
    const current = selected.locked_sections || [];
    const isLocked = current.includes(sectionId);
    const next = isLocked ? current.filter(id => id !== sectionId) : [...current, sectionId];

    setProcessingId(sectionId);
    try {
      await applyUpdate({ action: 'set', locked_sections: next }, { locked_sections: next });
      flash('ok', isLocked ? `Unlocked ${sectionId}` : `Locked ${sectionId}`);
    } catch (e) {
      flash('err', (e as Error).message);
    } finally {
      setProcessingId(null);
    }
  };

  const unlockAllForSelected = async () => {
    if (!selected) return;
    setBulkProcessing('unlock');
    try {
      await applyUpdate({ action: 'unlock_all' }, { locked_sections: [] });
      flash('ok', `All sections unlocked for ${selected.full_name || selected.email}`);
    } catch (e) {
      flash('err', (e as Error).message);
    } finally {
      setBulkProcessing(null);
    }
  };

  const lockAllForSelected = async () => {
    if (!selected) return;
    if (!confirm(`Lock every section for ${selected.full_name || selected.email}? They won't be able to access anything in the dashboard.`)) return;
    setBulkProcessing('lock');
    try {
      const all = SECTIONS.map(s => s.id);
      await applyUpdate({ action: 'lock_all_for', sections: all }, { locked_sections: all });
      flash('ok', `All sections locked for ${selected.full_name || selected.email}`);
    } catch (e) {
      flash('err', (e as Error).message);
    } finally {
      setBulkProcessing(null);
    }
  };

  const unlockEveryone = async () => {
    if (!confirm('Clear every merchant\'s locked sections? This unlocks the entire platform in one shot.')) return;
    setGlobalProcessing(true);
    try {
      const res = await fetch('/api/admin/module-locker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock_everyone' }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setMerchants(prev => prev.map(m => ({ ...m, locked_sections: [] })));
      router.refresh();
      flash('ok', `Unlocked ${j.cleared ?? merchants.length} merchant account(s).`);
    } catch (e) {
      flash('err', (e as Error).message);
    } finally {
      setGlobalProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className={`px-5 py-3 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
          banner.tone === 'ok'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-red-500/10 border-red-500/20 text-red-300'
        }`}>
          {banner.tone === 'ok' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
          {banner.msg}
        </div>
      )}

      {/* Global controls */}
      <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Platform-wide</div>
          <div className="text-white font-black text-lg">Access Control Center</div>
          <div className="text-xs text-slate-400 mt-1">
            Client permissions are persisted in the database and mirrored to legacy profile locks during rollout.
          </div>
        </div>
        <button
          onClick={unlockEveryone}
          disabled={globalProcessing}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-60"
        >
          {globalProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          Unlock Everything For Everyone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Merchant selector */}
        <div className="lg:col-span-4">
          <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                placeholder="Search merchant..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#07101F] border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {filtered.map(m => {
                const lockedCount = m.locked_sections?.length || 0;
                const isActive = selectedId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                      isActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-blue-400">
                      {m.full_name?.charAt(0) || <User size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-white truncate">{m.full_name || 'Incognito'}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase truncate">{m.email}</div>
                    </div>
                    {lockedCount > 0 ? (
                      <div className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        {lockedCount}/{SECTIONS.length}
                      </div>
                    ) : (
                      <div className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        OPEN
                      </div>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">No merchants found</div>
              )}
            </div>
          </div>
        </div>

        {/* Section toggles */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="h-[400px] bg-slate-900/20 border border-slate-800/50 border-dashed rounded-[40px] flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-600">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-xl font-black text-white">Select a Merchant</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-xs">Pick a merchant from the list to toggle individual sections or bulk-lock/unlock their dashboard.</p>
            </div>
          ) : (
            <div className="bg-[#0A1628] border border-slate-800 rounded-[40px] p-8 shadow-2xl">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-blue-600/10 text-blue-400 flex items-center justify-center font-black text-xl">
                    {selected.full_name?.charAt(0) || <User size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selected.full_name || 'Incognito'}</h3>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{selected.plan} Plan</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest break-all">{selected.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={unlockAllForSelected}
                    disabled={bulkProcessing !== null}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60"
                  >
                    {bulkProcessing === 'unlock' ? <Loader2 size={12} className="animate-spin" /> : <Unlock size={12} />}
                    Unlock All
                  </button>
                  <button
                    onClick={lockAllForSelected}
                    disabled={bulkProcessing !== null}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60"
                  >
                    {bulkProcessing === 'lock' ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                    Lock All
                  </button>
                </div>
              </div>

              {/* Grid of sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTIONS.map(section => {
                  const isLocked = selected.locked_sections?.includes(section.id) || false;
                  const isProcessing = processingId === section.id;
                  const Icon = section.icon;

                  return (
                    <div
                      key={section.id}
                      className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                        isLocked
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-emerald-500/5 border-emerald-500/20'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} className={isLocked ? 'text-red-400' : 'text-emerald-400'} />
                          <h4 className="font-black text-sm text-white">{section.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{section.description}</p>
                        <div className={`mt-2 text-[9px] font-black uppercase tracking-widest ${isLocked ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isLocked ? 'Locked' : 'Accessible'}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSection(section.id)}
                        disabled={isProcessing || bulkProcessing !== null}
                        aria-label={isLocked ? `Unlock ${section.name}` : `Lock ${section.name}`}
                        className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          isLocked
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-400'
                            : 'bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40'
                        } disabled:opacity-60`}
                      >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLocked ? <Lock size={18} /> : <Unlock size={18} />)}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white uppercase tracking-widest mb-1">Live enforcement</h5>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    Locks apply from the client permissions table. Realtime updates refresh the dashboard, with tab-focus refetch as a backup.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
