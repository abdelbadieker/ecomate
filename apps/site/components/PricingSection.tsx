import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Plan = { id: string; name: string; price: number; currency: string; period: string; description: string | null; features: string[]; is_popular: boolean };
type Pack = { id: string; name: string; video_count: number; content_price: number; ads_price: number | null; currency: string; period: string; description: string | null; features: string[]; is_popular: boolean };
type Tier = { id: string; name: string; rate_percent: number; description: string | null; features: string[]; is_popular: boolean };

const num = (n: number) => Number(n || 0).toLocaleString();

export async function PricingSection() {
  const [{ data: plans }, { data: packs }, { data: tiers }] = await Promise.all([
    supabase.from('pricing_plans').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('content_packs').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('fulfillment_tiers').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
  ]);

  const planList = (plans || []) as Plan[];
  const packList = (packs || []) as Pack[];
  const tierList = (tiers || []) as Tier[];

  return (
    <section id="pricing" className="py-32 px-5 relative bg-[var(--bg-body)]">
      <div className="max-w-7xl mx-auto text-center mb-6">
        <p className="text-[var(--s)] font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-2">
          <span className="w-4 h-[2px] bg-[var(--s)]" /> Pricing
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight font-poppins">
          Three ways to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-200">grow</span> with EcoMate.
        </h2>
        <p className="text-[var(--text-sub)] text-lg max-w-2xl mx-auto leading-relaxed">
          Land with automation, add marketing content packs, and scale into full performance-based fulfillment — pay only for what moves your business.
        </p>
      </div>

      {/* Flow strip */}
      <div className="max-w-3xl mx-auto mb-16 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[var(--text-muted)]">
        <span className="px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-c)] text-[var(--s)]">1 · Automation</span>
        <ArrowRight className="w-4 h-4" />
        <span className="px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-c)] text-[var(--g)]">2 · Marketing Packs</span>
        <ArrowRight className="w-4 h-4" />
        <span className="px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-c)] text-[var(--cyan)]">3 · Fulfillment</span>
      </div>

      {/* ── Line 1: Automation (recurring SaaS) ───────────────────────── */}
      {planList.length > 0 && (
        <div className="max-w-7xl mx-auto mb-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--s)] bg-[var(--s)]/10 border border-[var(--s)]/20 px-3 py-1.5 rounded-full">Automation · SaaS</span>
            <span className="text-sm text-[var(--text-muted)]">Monthly subscription · save with annual</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planList.map((p) => (
              <div key={p.id} className={`relative rounded-3xl p-8 flex flex-col border transition-all duration-300 ${p.is_popular ? 'border-[var(--s)]/60 bg-[var(--s)]/[0.06] shadow-2xl shadow-[var(--s)]/10 md:-translate-y-3' : 'border-[var(--border-c)] bg-[var(--bg-card)] hover:border-[var(--s)]/30'}`}>
                {p.is_popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--s)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>}
                <h3 className="text-xl font-black text-white font-poppins">{p.name}</h3>
                {p.description && <p className="text-[var(--text-sub)] text-sm mt-2 leading-relaxed min-h-[40px]">{p.description}</p>}
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">{num(p.price)}</span>
                  <span className="text-[var(--text-muted)] font-medium ml-2">{p.currency}/{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(p.features || []).map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-sub)]"><Check className="w-4 h-4 text-[var(--g)] shrink-0 mt-0.5" /><span>{f}</span></li>
                  ))}
                </ul>
                <Link href="/register" className={`w-full text-center py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${p.is_popular ? 'bg-[var(--s)] text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]' : 'bg-[var(--bg-card-hover)] text-white border border-[var(--border-c)] hover:border-[var(--s)]/50'}`}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Line 2: Marketing Content Packs ───────────────────────────── */}
      {packList.length > 0 && (
        <div className="max-w-7xl mx-auto mb-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--g)] bg-[var(--g)]/10 border border-[var(--g)]/20 px-3 py-1.5 rounded-full">Marketing · Content Packs</span>
            <span className="text-sm text-[var(--text-muted)]">Scripting + filming · with or without ads management</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packList.map((p) => (
              <div key={p.id} className={`relative rounded-3xl p-8 flex flex-col border transition-all duration-300 ${p.is_popular ? 'border-[var(--g)]/60 bg-[var(--g)]/[0.06] shadow-2xl shadow-[var(--g)]/10' : 'border-[var(--border-c)] bg-[var(--bg-card)] hover:border-[var(--g)]/30'}`}>
                {p.is_popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--g)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Best Value</div>}
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-black text-white font-poppins">{p.name}</h3>
                  <span className="text-[var(--g)] font-black text-sm">{p.video_count} videos</span>
                </div>
                {p.description && <p className="text-[var(--text-sub)] text-sm mt-2 leading-relaxed min-h-[40px]">{p.description}</p>}
                <div className="mt-6 mb-6">
                  <span className="text-3xl font-black text-white">{num(p.content_price)}</span>
                  <span className="text-[var(--text-muted)] font-medium ml-2">{p.currency}/{p.period}</span>
                  {p.ads_price ? <div className="text-xs text-[var(--text-muted)] mt-1">or <span className="text-white font-bold">{num(p.ads_price)} {p.currency}</span> with ads management</div> : null}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(p.features || []).map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-sub)]"><Check className="w-4 h-4 text-[var(--g)] shrink-0 mt-0.5" /><span>{f}</span></li>
                  ))}
                </ul>
                <Link href="/register" className="w-full text-center py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all bg-[var(--bg-card-hover)] text-white border border-[var(--border-c)] hover:border-[var(--g)]/50">Request a Pack</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Line 3: Fulfillment (performance) ──────────────────────────── */}
      {tierList.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--cyan)] bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 px-3 py-1.5 rounded-full">Fulfillment · Performance</span>
            <span className="text-sm text-[var(--text-muted)]">We earn when you earn — % of delivered orders only</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tierList.map((t) => (
              <div key={t.id} className={`relative rounded-3xl p-8 flex flex-col border transition-all duration-300 ${t.is_popular ? 'border-[var(--cyan)]/60 bg-[var(--cyan)]/[0.06] shadow-2xl shadow-[var(--cyan)]/10' : 'border-[var(--border-c)] bg-[var(--bg-card)] hover:border-[var(--cyan)]/30'}`}>
                {t.is_popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--cyan)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Recommended</div>}
                <h3 className="text-xl font-black text-white font-poppins">{t.name}</h3>
                <div className="mt-4 mb-4">
                  <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--cyan)] to-[var(--s)]">{t.rate_percent}%</span>
                  <span className="text-[var(--text-muted)] font-medium ml-2">of delivered revenue</span>
                </div>
                {t.description && <p className="text-[var(--text-sub)] text-sm leading-relaxed mb-6">{t.description}</p>}
                <ul className="space-y-3 mb-8 flex-1">
                  {(t.features || []).map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-sub)]"><Check className="w-4 h-4 text-[var(--cyan)] shrink-0 mt-0.5" /><span>{f}</span></li>
                  ))}
                </ul>
                <Link href="/register" className="w-full text-center py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all bg-[var(--bg-card-hover)] text-white border border-[var(--border-c)] hover:border-[var(--cyan)]/50">Talk to Us</Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-8 max-w-2xl mx-auto">
            Example figures — the % is set against your COD/delivery economics and applies to delivered (paid) orders only. Ad spend, when applicable, is billed separately.
          </p>
        </div>
      )}
    </section>
  );
}
