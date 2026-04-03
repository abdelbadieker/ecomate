'use client'
import Image from 'next/image'
import { Link } from '@/navigation'
import { useTranslations, useLocale } from 'next-intl'
import ThreeNetwork from './ThreeNetwork'
import { ArrowRight, Play, TrendingUp, Package, MessageSquare } from 'lucide-react'

export default function Hero() {
  const t = useTranslations('Landing.Hero')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <section className="min-h-screen flex items-center pt-[110px] pb-20 px-[5%] relative overflow-hidden bg-[#01050a]">
      {/* Three.js Background */}
      <div className={`absolute top-0 w-[56%] h-full z-0 pointer-events-none hidden md:block ${isRtl ? 'left-0 scale-x-[-1]' : 'right-0'}`}>
        <ThreeNetwork />
      </div>

      {/* Glow Blobs */}
      <div className={`absolute top-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse ${isRtl ? 'left-[6%]' : 'right-[6%]'}`} />
      <div className={`absolute bottom-[5%] w-[420px] h-[420px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none animate-pulse delay-700 ${isRtl ? 'right-0' : 'left-0'}`} />

      <div className={`relative z-10 max-w-[720px] ${isRtl ? 'mr-auto text-right' : 'ml-0 text-left'}`}>
        {/* Badge */}
        <div className="hbadge mb-9 font-poppins flex items-center gap-2.5">
          <span className="hbdot bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          <span className="tracking-wide uppercase text-[11px] font-extrabold text-blue-400/80">{t('badge')}</span>
        </div>

        <h1 className="hhline font-poppins mb-7">
          <span className="hh1 block leading-[1.1] mb-2">{t('title1')}</span>
          <span className="hh2 block leading-[0.9] italic mb-2 py-2">
            {t('title2')}
          </span>
          <span className="hh3 block leading-[1.1]">
            {t('title3')}{' '}
            <span className="text-emerald-500 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">{t('title4')}</span>
          </span>
        </h1>

        <p className="hsub mb-12 max-w-[540px] text-lg leading-relaxed text-white/50 font-light">
          {t('desc')}
        </p>

        <div className="hact flex items-center gap-5 flex-wrap">
          <Link href="/?auth=register" className="bh1 group">
            <span>{t('ctaStart')}</span>
            <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
          </Link>
          
          <button className="bh2 group flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
              <Play className="w-4 h-4 text-blue-500 fill-blue-500" />
            </div>
            <span className="font-bold text-sm tracking-tight">{t('ctaPreview')}</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="hstats mt-16 flex items-center">
          {[
            { num: '7', suf: '', label: t('stat1') },
            { num: '98', suf: '%', label: t('stat2') },
            { num: '24', suf: '/7', label: t('stat3') },
            { num: '0', suf: '', label: t('stat4') },
          ].map((s, i) => (
            <div key={i} className={`flex flex-col gap-1 px-8 border-white/10 ${i === 0 ? 'pl-0' : i === 3 ? 'pr-0 border-none' : 'border-r'}`}>
              <span className="text-3xl font-black font-poppins tracking-tighter">
                {s.num}<span className="text-emerald-500">{s.suf}</span>
              </span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cards (Desktop only) */}
      <div className="hidden xl:block">
        {/* Revenue Card */}
        <div className={`fc fc1 w-[220px] ${isRtl ? 'left-[6%]' : 'right-[6%]'}`}>
          <div className="flex justify-between items-start mb-3">
            <span className="fct tracking-widest">{t('floatRevenue')}</span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=100" alt="stat" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="fcm text-emerald-500">127,400 DA</div>
          <div className="flex items-center gap-1.5 mt-2">
             <TrendingUp size={14} className="text-emerald-500" />
             <span className="text-[11px] font-bold text-emerald-500/80">{t('floatRevenueChange')}</span>
          </div>
          <div className="fcspark flex items-end gap-1.5 mt-4">
             {[30, 45, 35, 60, 50, 80, 70].map((h, i) => (
               <div key={i} className={`w-full rounded-t-sm transition-all duration-500 ${i === 6 ? 'bg-emerald-500' : 'bg-white/10'}`} style={{ height: `${h}%` }} />
             ))}
          </div>
        </div>

        {/* Order Card */}
        <div className={`fc fc2 w-[240px] ${isRtl ? 'left-[3%]' : 'right-[3%]'}`}>
          <span className="fct mb-3 block">{t('floatOrder')}</span>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=100" alt="package" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-poppins">Order #2847</div>
              <div className="text-[11px] text-white/40 font-medium">{t('floatOrderConfirmed')}</div>
            </div>
          </div>
        </div>

        {/* AI Rate Card */}
        <div className={`fc fc3 w-[200px] ${isRtl ? 'left-[31%]' : 'right-[31%]'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
              <MessageSquare size={16} />
            </div>
            <span className="fct">{t('floatAIRate')}</span>
          </div>
          <div className="text-4xl font-black font-poppins tracking-tighter">98<span className="text-lg text-white/30">.7%</span></div>
          <div className="fctag mt-3 bg-blue-500/10 border-blue-500/20 text-blue-400">
            {t('floatAIMessages')}
          </div>
        </div>
      </div>
    </section>
  )
}
