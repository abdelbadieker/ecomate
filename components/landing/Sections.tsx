'use client'
import { Link } from '@/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { 
  CheckCircle2, 
  MessageSquare, 
  Package, 
  ShoppingCart, 
  Users, 
  Zap, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Globe,
  HeadphonesIcon
} from 'lucide-react'
import Image from 'next/image'

/* ── INTEGRATIONS ── */
export function Integrations() {
  const t = useTranslations('Landing.Integrations')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  
  const cols = [
    { badge: t('socialBadge'), title: t('socialTitle'), pills: [['blue', t('pills.facebook')],['pink', t('pills.instagram')],['green', t('pills.whatsapp')],['tg', t('pills.telegram')],['snap', t('pills.snapchat')]] },
    { badge: t('deliveryBadge'), title: t('deliveryTitle'), pills: [['dz', t('pills.homeDelivery')],['dz', t('pills.officePickup')],['dz', t('pills.expressDelivery')],['dz', t('pills.codReady')],['dz', t('pills.wilayas58')]] },
    { badge: t('toolsBadge'), title: t('toolsTitle'), pills: [['sheets', t('pills.googleSheets')],['sheets', t('pills.googleDrive')],['gray', t('pills.excelExport')],['gray', t('pills.pdfReports')]] },
  ]
  
  const dotColors: Record<string,string> = { blue:'#1877f2', pink:'#e1306c', green:'#25d366', tg:'#229ED9', snap:'#FFBD00', dz:'#10b981', sheets:'#34a853', gray:'#94a3b8' }

  return (
    <section className="py-24 px-[5%] bg-[#050a14] border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
           <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/20 mb-4 block">
            {t('subtitle')}
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-0 lg:divide-x lg:divide-white/5 rtl:lg:divide-x-reverse">
          {cols.map((col, i) => (
            <div key={i} className="px-6 lg:px-12">
              <div className="flex flex-col items-center text-center">
                <div className="hbadge bg-emerald-500/10 border-emerald-500/20 text-emerald-500 mb-6 scale-90">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{col.badge}</span>
                </div>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.15em] mb-8 font-poppins h-8">
                  {col.title}
                </h3>
                <div className="flex justify-center items-center gap-2.5 flex-wrap">
                  {col.pills.map(([color, label]) => (
                    <div key={label} className="inline-flex items-center gap-2.5 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white/60 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all cursor-default">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ color: dotColors[color], background: dotColors[color] }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── FEATURES ── */
export function Features() {
  const t = useTranslations('Landing.Features')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  
  const fb = [
    { 
      id:'b1', 
      span:'lg:col-span-8', 
      title: t('chatbot'), 
      desc: t('chatbotDesc'), 
      img: 'https://images.unsplash.com/photo-1531746790731-6c087fdec65a?auto=format&fit=crop&q=80&w=800',
      tag: 'AI Powered',
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />
    },
    { 
      id:'b2', 
      span:'lg:col-span-4', 
      title: t('order'), 
      desc: t('orderDesc'), 
      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
      tag: 'Smart Sync',
      icon: <Package className="w-5 h-5 text-emerald-500" />
    },
    { 
      id:'b3', 
      span:'lg:col-span-4', 
      title: t('catalog'), 
      desc: t('catalogDesc'), 
      img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=600',
      tag: 'Visual Shop',
      icon: <ShoppingCart className="w-5 h-5 text-amber-500" />
    },
    { 
      id:'b4', 
      span:'lg:col-span-8', 
      title: t('crm'), 
      desc: t('crmDesc'), 
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
      tag: 'Customer Obsessed',
      icon: <Users className="w-5 h-5 text-blue-400" />
    }
  ]

  return (
    <section id="features" className="py-24 px-[5%] bg-[#01050a]">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-16 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="hbadge bg-blue-500/10 border-blue-500/20 text-blue-500 mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('subtitle')}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-poppins tracking-tighter text-white mb-6 leading-tight max-w-3xl">
            {t('title')}
          </h2>
          <p className="text-white/40 text-lg font-medium max-w-2xl leading-relaxed">
            {t('desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {fb.map(f => (
            <div key={f.id} className={`${f.span} group relative h-[480px] rounded-[32px] overflow-hidden border border-white/5 bg-[#050a14] hover:border-blue-500/30 transition-all duration-500`}>
              <img src={f.img} alt={f.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#01050a] via-[#01050a]/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md mb-4">
                  {f.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{f.tag}</span>
                </div>
                <h3 className="text-2xl font-black font-poppins text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── HOW IT WORKS ── */
export function HowItWorks() {
  const t = useTranslations('Landing.HowItWorks')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  
  const steps = [
    { n:1, icon: <Package className="w-8 h-8" />, title: t('steps.one.title'), desc: t('steps.one.desc') },
    { n:2, icon: <Zap className="w-8 h-8" />, title: t('steps.two.title'), desc: t('steps.two.desc') },
    { n:3, icon: <Globe className="w-8 h-8" />, title: t('steps.three.title'), desc: t('steps.three.desc') },
    { n:4, icon: <TrendingUp className="w-8 h-8" />, title: t('steps.four.title'), desc: t('steps.four.desc') },
  ]

  return (
    <section id="how" className="py-24 px-[5%] bg-[#050a14] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="hbadge bg-emerald-500/10 border-emerald-500/20 text-emerald-500 mb-6 mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest">{t('subtitle')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-poppins tracking-tighter text-white mb-6">
            {t('title')}
          </h2>
          <p className="text-white/40 text-base font-medium max-w-xl mx-auto leading-relaxed">
            {t('registerDesc')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative items-start">
          {/* Animated Line */}
          <div className="hidden lg:block absolute top-14 left-[15%] right-[15%] h-[1.5px] bg-white/[0.03] overflow-hidden">
             <div className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent w-40 animate-marquee" style={{ animationDuration: '3s' }} />
          </div>

          {steps.map((s, idx) => (
            <div key={s.n} className="group relative text-center">
              <div className="w-28 h-28 mx-auto mb-8 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-blue-500 group-hover:border-blue-500/40 group-hover:bg-blue-500/5 transition-all duration-500 relative z-10">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-blue-600 font-poppins text-[12px] font-black text-white flex items-center justify-center shadow-lg border-2 border-[#050a14]">
                  0{s.n}
                </div>
                {s.icon}
              </div>
              <h3 className="text-[17px] font-black font-poppins text-white mb-4 tracking-tight">{s.title}</h3>
              <p className="text-white/30 text-[13.5px] font-medium leading-relaxed px-4">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── DASHBOARD PREVIEW ── */
export function DashboardPreview() {
  const t = useTranslations('Landing.DashboardPreview')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  
  return (
    <section id="dashboard" className="py-24 px-[5%] bg-[#01050a] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <div className="hbadge bg-blue-500/10 border-blue-500/20 text-blue-500 mb-6">
               <span className="text-[10px] font-black uppercase tracking-widest">{t('subtitle')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-poppins tracking-tighter text-white mb-6 leading-tight">
              {t('title')}
            </h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed">
              {t('desc')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {[
               { icon: <BarChart3 className="text-emerald-500" />, label: t('stats.revenue'), val: '127.4K', change: '+14%' },
               { icon: <Package className="text-blue-500" />, label: t('stats.orders'), val: '840+', change: '+22%' },
               { icon: <ShieldCheck className="text-amber-500" />, label: t('stats.ai'), val: '98.2%', change: 'Stable' },
               { icon: <TrendingUp className="text-purple-500" />, label: t('stats.cod'), val: '0', change: 'Fail Rate' },
             ].map((s, i) => (
               <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">{s.icon}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{s.label}</div>
                  <div className="text-2xl font-black font-poppins text-white tracking-tighter">{s.val}</div>
                  <div className="text-[10px] font-bold text-emerald-500 mt-2">{s.change}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Mega Mockup */}
        <div className="relative group">
          <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500/50 to-emerald-500/50 rounded-[40px] opacity-20 blur-xl group-hover:opacity-40 transition-all duration-1000" />
          <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-[#050a14]">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="px-5 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[11px] font-mono text-white/30 tracking-tight">
                 app.ecomate.dz/analytics
              </div>
              <div className="w-12 h-4" />
            </div>
            <div className="relative h-[400px] md:h-[600px] overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600" 
                 alt="Dashboard" 
                 className="w-full h-full object-cover object-top opacity-90 group-hover:scale-[1.02] transition-transform duration-[20s] ease-linear" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── AI SECTION ── */
export function AISection() {
  const t = useTranslations('Landing.AI')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  
  return (
    <section id="ai-section" className="py-24 px-[5%] bg-[#050a14]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Chat Mockup */}
          <div className="relative order-2 lg:order-1">
             <div className="absolute -inset-10 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
             <div className="relative bg-[#01050a] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl lg:transform lg:perspective-[1500px] lg:-rotate-y-12 lg:rotate-x-6 hover:rotate-0 transition-transform duration-1000 group">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-black font-poppins text-sm tracking-tight">EcoBot AI</div>
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('chat.onlineStatus')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col gap-6 h-[460px] overflow-hidden">
                  <div className={`max-w-[85%] p-4 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 text-white/80 text-[14px] leading-relaxed self-start`}>
                    {t('chat.aiMsg1')}
                  </div>
                  <div className={`max-w-[85%] self-end p-4 rounded-2xl rounded-br-sm bg-blue-600 text-white text-[14px] font-medium shadow-xl shadow-blue-600/10`}>
                    {t('chat.userMsg1')}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                     {[
                       { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300', name: 'Nike Air Max', price: '12,500 DA' },
                       { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300', name: 'Apple Watch S8', price: '68,000 DA' }
                     ].map((p, i) => (
                       <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-3 group/item cursor-pointer hover:border-blue-500/30 transition-all">
                          <img src={p.img} alt={p.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                          <div className="text-[11px] font-black text-white/90 truncate">{p.name}</div>
                          <div className="text-[12px] font-black text-blue-400 mt-1">{p.price}</div>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex gap-4">
                  <div className="flex-1 px-5 py-3.5 bg-white/5 rounded-2xl border border-white/10 text-[13px] text-white/30 font-medium">
                    {t('chat.userInputPlaceholder')}
                  </div>
                  <button className="w-14 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all">
                    <ArrowRight className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </div>
             </div>
          </div>

          {/* Content */}
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <div className="hbadge bg-emerald-500/10 border-emerald-500/20 text-emerald-500 mb-8">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('subtitle')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-poppins tracking-tighter text-white mb-8 leading-tight">
              {t('title')}
            </h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed mb-12">
              {t('desc')}
            </p>
            
            <div className="space-y-6 mb-12">
               {[
                 { icon: <MessageSquare className="w-5 h-5" />, title: t('platformsTitle'), desc: t('platformsDesc') },
                 { icon: <ShoppingCart className="w-5 h-5" />, title: t('shoppingTitle'), desc: t('shoppingDesc') },
                 { icon: <ShieldCheck className="w-5 h-5" />, title: t('orderTitle'), desc: t('orderDesc') },
               ].map((f, i) => (
                 <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-blue-500 group-hover:border-blue-500/40 group-hover:bg-blue-500/5 transition-all">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="text-[17px] font-black font-poppins text-white mb-1 tracking-tight">{f.title}</h4>
                      <p className="text-white/30 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <Link href="/?auth=register" className="bh1 group">
               <span>{t('cta')}</span>
               <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── PRICING ── */
export function Pricing() {
  const t = useTranslations('Landing.Pricing')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  
  const plans = [
    { slug:'starter', name: t('starter'), price: '0', period: t('periodStarter'), feat: [t('featureChatbot'), t('featureOrders50'), t('feature1Channel'), t('feature20Items')], popular: false },
    { slug:'growth', name: t('growth'), price: '4,900', period: t('periodMonthly'), feat: [t('featureFullAI'), t('featureUnlimited'), t('featureAllPlatforms'), t('featureTracking'), t('featureCRM')], popular: true },
    { slug:'business', name: t('business'), price: 'Custom', period: t('periodTailored'), feat: ['All Growth Features', 'Dedicated Manager', 'Custom Integrations', 'Priority Support'], popular: false },
  ]

  return (
    <section id="pricing" className="py-24 px-[5%] bg-[#01050a]">
       <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="hbadge bg-blue-500/10 border-blue-500/20 text-blue-500 mb-6 mx-auto">
               <span className="text-[10px] font-black uppercase tracking-widest">{t('subtitle')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-poppins tracking-tighter text-white mb-6">
              {t('title')}
            </h2>
            <p className="text-white/40 text-lg font-medium max-w-xl mx-auto">
               {t('desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(p => (
              <div key={p.slug} className={`relative p-10 rounded-[40px] border transition-all duration-500 hover:-translate-y-4 ${p.popular ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/10' : 'bg-white/[0.03] border-white/10 hover:border-white/20'}`}>
                 {p.popular && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg shadow-blue-600/30">
                     {t('mostPopular')}
                   </div>
                 )}
                 <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 mb-8">{p.name}</div>
                 <div className="flex items-end gap-2 mb-2">
                   <span className="text-5xl md:text-6xl font-black font-poppins text-white tracking-tighter">
                     {p.price !== '0' && p.price !== 'Custom' && <span className="text-2xl mr-1">DA</span>}
                     {p.price}
                   </span>
                 </div>
                 <div className="text-sm font-bold text-white/30 mb-10">{p.period}</div>
                 
                 <div className="space-y-5 flex-1 mb-12">
                   {p.feat.map((f, i) => (
                     <div key={i} className="flex items-center gap-3 text-sm font-bold text-white/50">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        {f}
                     </div>
                   ))}
                 </div>

                 <Link href="/?auth=register" className={`block w-full py-5 rounded-2xl font-black font-poppins text-center text-[13px] uppercase tracking-widest transition-all ${p.popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500' : 'bg-white/[0.05] border border-white/10 text-white/60 hover:bg-white/10'}`}>
                    {p.slug === 'business' ? 'Contact Sales' : 'Get Started'}
                 </Link>
              </div>
            ))}
          </div>
       </div>
    </section>
  )
}

/* ── CTA ── */
export function CTA() {
  const t = useTranslations('Landing.CTA')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <section id="cta" className="py-32 px-[5%] relative overflow-hidden bg-[#050a14]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.15),transparent_70%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto text-center relative z-10">
         <h2 className="text-5xl md:text-8xl font-black font-poppins tracking-tighter text-white mb-10 leading-[1] max-w-4xl mx-auto">
            {t('title')}
         </h2>
         <p className="text-white/40 text-lg md:text-xl font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
            {t('desc')}
         </p>
         <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/?auth=register" className="bh1 !px-12 !py-6 !text-base scale-110 active:scale-105">
               <span>{t('startFree')}</span>
               <ArrowRight className={isRtl ? 'rotate-180' : ''} />
            </Link>
            <button className="bh2 !px-12 !py-6 !text-base !font-black !text-white/60 hover:!text-white transition-all">
               {t('talkTeam')}
            </button>
         </div>
         <div className="mt-20 flex flex-col items-center gap-4 opacity-20">
            <div className="text-[10px] font-black uppercase tracking-[0.4em]">{t('builtAt')}</div>
            <div className="text-xs font-black tracking-widest">ECOMARE 2.0 ─ PRODUCTION READY</div>
         </div>
      </div>
    </section>
  )
}

/* ── FOOTER ── */
export function Footer() {
  const t = useTranslations('Landing.Footer')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <footer className="py-24 px-[5%] bg-[#01050a] border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        <div className={`flex flex-col ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
           <div className="font-poppins font-black text-3xl mb-8 flex items-center gap-1">
             <span className="text-white">Eco</span>
             <span className="text-blue-500">Mate</span>
           </div>
           <p className="text-white/30 text-sm font-medium leading-relaxed max-w-xs mb-10">
             {t('slogan')}
           </p>
           <div className="flex gap-4">
             {['Facebook', 'Instagram', 'LinkedIn'].map(s => (
               <div key={s} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-black text-white/30 hover:bg-blue-600 hover:text-white hover:border-blue-500 cursor-pointer transition-all">
                 {s[0]}
               </div>
             ))}
           </div>
        </div>

        {[
          { title: t('colPlatform'), links: [t('about'), t('team'), 'Carrers'] },
          { title: t('colCompany'), links: [t('contact'), t('faqs'), 'Blog'] },
          { title: t('colSupport'), links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
        ].map(col => (
          <div key={col.title} className={isRtl ? 'text-right' : 'text-left'}>
             <h5 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/20 mb-10">{col.title}</h5>
             <ul className="space-y-5">
               {col.links.map(l => (
                 <li key={l}>
                   <a href="#" className="text-[14px] font-bold text-white/40 hover:text-blue-500 transition-colors">{l}</a>
                 </li>
               ))}
             </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="text-[12px] font-medium text-white/20">
            © 2025 <span className="text-white/40 font-black">ECOMATE</span>. {isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
         </div>
         <div className="flex items-center gap-3">
            <span className="w-8 h-[1.5px] bg-white/5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Made in Algeria 🇩🇿</span>
            <span className="w-8 h-[1.5px] bg-white/5" />
         </div>
      </div>
    </footer>
  )
}
