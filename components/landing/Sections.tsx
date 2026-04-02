import { Fragment } from 'react'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'

export function Integrations() {
  const t = useTranslations('Landing.Integrations')
  
  const cols = [
    { badge: 'All Social Platforms', title: 'Where your customers message you', pills: [['blue','Facebook'],['pink','Instagram'],['green','WhatsApp'],['tg','Telegram'],['snap','Snapchat']] },
    { badge: 'Algerian Delivery Network', title: 'Shipping partners across all wilayas', pills: [['dz','Home Delivery'],['dz','Office Pickup'],['dz','Express Delivery'],['dz','COD Ready'],['dz','58 Wilayas']] },
    { badge: 'Business Tools', title: 'Keep using the tools you love', pills: [['sheets','Google Sheets'],['sheets','Google Drive'],['gray','Excel Export'],['gray','PDF Reports']] },
  ]
  
  const dotColors: Record<string,string> = { blue:'#1877f2', pink:'#e1306c', green:'#25d366', tg:'#229ED9', snap:'#FFBD00', dz:'#006233', sheets:'#34a853', gray:'#94a3b8' }

  return (
    <div className="py-16 lg:py-24 px-6 lg:px-[8%] bg-[var(--bg-section)] transition-all">
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-[var(--text-sub)] opacity-40 mb-12 block">
          Connects seamlessly with the platforms your customers already use
        </span>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-0 lg:divide-x lg:divide-[var(--border-c)] rtl:lg:divide-x-reverse items-start">
          {cols.map((col, i) => (
            <div key={i} className="px-4 lg:px-10 text-center">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-[11px] font-black text-emerald-500 mb-5 uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {col.badge}
              </div>
              <h3 className="font-poppins text-xs lg:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 px-4">
                {col.title}
              </h3>
              <div className="flex justify-center items-center gap-2.5 flex-wrap">
                {col.pills.map(([color, label]) => (
                  <span key={label} className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-c)] rounded-full px-4 py-2 text-xs font-semibold text-[var(--text-muted)] shadow-sm hover:border-blue-500/30 transition-all cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColors[color] }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Features({ services }: { services?: any[] }) {
  const t = useTranslations('Landing.Features')
  
  const bentosFallback = [
    { id:'b1', desktopCols:'col-span-12 lg:col-span-12', icon:'🤖', iconBg:'rgba(37,99,235,.15)', title: t('chatbot'), desc: t('chatbotDesc'), tag: '' },
    { id:'b2', desktopCols:'col-span-12 lg:col-span-6', icon:'📦', iconBg:'rgba(16,185,129,.15)', title: t('order'), desc: t('orderDesc'), tag: '' },
    { id:'b3', desktopCols:'col-span-12 lg:col-span-6', icon:'🛍️', iconBg:'rgba(96,165,250,.1)', title: t('catalog'), desc: t('catalogDesc'), tag: '' },
    { id:'b5', desktopCols:'col-span-12 lg:col-span-6', icon:'👥', iconBg:'rgba(16,185,129,.15)', title: t('crm'), desc: t('crmDesc'), tag: '' },
    { id:'b6', desktopCols:'col-span-12 lg:col-span-6', icon:'🎯', iconBg:'rgba(245,158,11,.15)', title: t('automation'), desc: t('automationDesc'), tag: '', tagColor:'#f59e0b' },
  ]

  const bentos = services && services.length > 0 
    ? services.map((s, i) => ({
        id: s.id,
        desktopCols: 'col-span-12 lg:col-span-6',
        icon: s.icon && (s.icon.startsWith('http') || s.icon.startsWith('/')) 
          ? <img src={s.icon} alt="" className="w-6 h-6 object-contain" /> 
          : (s.icon || '⚡'),
        iconBg: 'rgba(37,99,235,.1)',
        title: s.name, 
        desc: s.description,
        tag: s.tag, 
        tagColor: s.tag_color
      }))
    : bentosFallback

  return (
    <section id="features" className="py-20 lg:py-32 px-6 lg:px-[8%] bg-[var(--bg-section)]">
      <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-500 mb-6 px-1">
        <span className="w-4 h-[1.5px] bg-blue-600" />
        {t('subtitle')}
      </div>
      
      <h2 className="font-poppins text-3xl lg:text-5xl font-black tracking-tight text-[var(--text-main)] mb-6 leading-[1.1]">
        {t('title')}
      </h2>
      
      <p className="text-base lg:text-lg text-[var(--text-sub)] leading-relaxed max-w-xl mb-16 opacity-80">
        {t('desc')}
      </p>
      
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        {bentos.map(b => (
          <div key={b.id} className={`${b.desktopCols} group bg-[var(--bg-card)] border border-[var(--border-c)] rounded-3xl p-8 lg:p-10 relative overflow-hidden transition-all hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-white/5 shadow-inner" style={{ background: b.iconBg }}>
              {b.icon}
            </div>
            <h3 className="font-poppins text-lg lg:text-xl font-bold text-[var(--text-main)] mb-3">{b.title}</h3>
            <p className="text-sm lg:text-base text-[var(--text-sub)] leading-relaxed opacity-70">{b.desc}</p>
            {b.tag && (
              <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-wider mt-6 border" style={{ 
                background: b.tagColor ? `${b.tagColor}15` : 'rgba(16,185,129,.1)',
                borderColor: b.tagColor ? `${b.tagColor}30` : 'rgba(16,185,129,.2)',
                color: b.tagColor || '#10B981' 
              }}>
                {b.tag}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export function HowItWorks() {
  const t = useTranslations('Landing.HowItWorks')
  
  const steps = [
    { n:1, icon:'📋', title: t('steps.one.title'), desc: t('steps.one.desc') },
    { n:2, icon:'⚙️', title: t('steps.two.title'), desc: t('steps.two.desc') },
    { n:3, icon:'🔗', title: t('steps.three.title'), desc: t('steps.three.desc') },
    { n:4, icon:'🚀', title: t('steps.four.title'), desc: t('steps.four.desc') },
  ]

  return (
    <section id="how" className="py-20 lg:py-32 px-6 lg:px-[8%]">
      <div className="text-center mb-16 lg:mb-24">
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-500 mb-6">
          <span className="w-4 h-[1.5px] bg-blue-600" />
          {t('subtitle')}
        </div>
        <h2 className="font-poppins text-3xl lg:text-5xl font-black tracking-tight text-[var(--text-main)] mb-6 leading-[1.1]">
          {t('title')}
        </h2>
        <p className="text-base text-[var(--text-sub)] leading-relaxed max-w-lg mx-auto opacity-70">
          {t('registerDesc')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative">
        {/* Connection Line (Desktop) */}
        <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[var(--border-c)] to-transparent opacity-50 transition-all duration-1000" />
        
        {steps.map((s, idx) => (
          <div key={s.n} className="text-center relative z-10 group">
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full mx-auto mb-8 flex items-center justify-center text-3xl lg:text-4xl relative bg-[var(--bg-card)] border-2 border-[var(--border-c)] group-hover:border-blue-500/50 group-hover:shadow-xl group-hover:shadow-blue-500/10 transition-all duration-500">
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 font-poppins text-[10px] font-black text-white flex items-center justify-center border-2 border-[var(--bg-body)]">
                {s.n}
              </div>
              {s.icon}
            </div>
            <h3 className="font-poppins text-lg font-bold text-[var(--text-main)] mb-3">{s.title}</h3>
            <p className="text-sm text-[var(--text-sub)] leading-relaxed opacity-60 px-4">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function DashboardPreview() {
  const t = useTranslations('Landing.DashboardPreview')
  
  const stats = [
    { label: t('stats.revenue'), value:'127,400 DA', color:'text-emerald-500', change: t('stats.revenueChange') },
    { label: t('stats.orders'), value:'84', color:'text-blue-500', change: t('stats.ordersChange') },
    { label: t('stats.ai'), value:'3,421', color:'text-[var(--text-main)]', change: t('stats.aiChange') },
    { label: t('stats.cod'), value:'32', color:'text-amber-500', change: t('stats.codChange') },
  ]
  const bars = [40,58,72,55,87,78,100]

  return (
    <section id="dashboard" className="py-20 lg:py-32 px-6 lg:px-[8%] bg-[var(--bg-section)] overflow-hidden">
      <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-500 mb-6 px-1">
        <span className="w-4 h-[1.5px] bg-blue-600" />
        {t('subtitle')}
      </div>
      <h2 className="font-poppins text-3xl lg:text-5xl font-black tracking-tight text-[var(--text-main)] mb-6 leading-[1.1]">
        {t('title')}
      </h2>
      <p className="text-base lg:text-lg text-[var(--text-sub)] leading-relaxed max-w-xl mb-12 opacity-70">
        {t('desc')}
      </p>

      {/* Browser Mockup */}
      <div className="relative group mx-auto max-w-5xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-emerald-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-[#0a1426ec] border border-[var(--border-c)] rounded-[2rem] overflow-hidden shadow-2xl">
          {/* Browser bar */}
          <div className="px-6 py-4 border-b border-[var(--border-c)] flex items-center justify-between bg-black/20">
            <div className="flex gap-2">
              {['#ff5f57','#ffbd2e','#28c840'].map((c,i) => <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg px-4 py-1 text-[10px] lg:text-[11px] text-[var(--text-muted)] font-mono opacity-60">
              app.ecomate.dz/dashboard
            </div>
            <div className="w-12" /> {/* Spacer */}
          </div>
          
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            {/* Mock Sidebar - Hidden on mobile */}
            <div className="hidden lg:block w-48 border-r border-[var(--border-c)] py-6">
              {[['📊','Dashboard',true],['📦','Orders',false],['🛍️','Products',false],['👥','Customers',false],['🤖','AI Chatbot',false],['📈','Analytics',false],['🚚','Delivery',false]].map(([icon,label,active],i) => (
                <div key={i} className={`px-5 py-2.5 flex items-center gap-3 text-[12px] font-semibold transition-all ${active ? 'text-[var(--text-main)] bg-blue-500/10 border-r-2 border-blue-500' : 'text-[var(--text-muted)] opacity-50'}`}>
                  <span className="text-base">{icon as string}</span>{label as string}
                </div>
              ))}
            </div>
            
            {/* Mock Main Content */}
            <div className="flex-1 p-6 lg:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s,i) => (
                  <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-c)] rounded-xl p-4 transition-all hover:border-blue-500/20">
                    <div className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-50 mb-2 truncate">
                      {s.label}
                    </div>
                    <div className={`font-poppins text-lg lg:text-xl font-black ${s.color} mb-1 truncate`}>
                      {s.value}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-bold">
                      {s.change}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-[var(--bg-card)] border border-[var(--border-c)] rounded-2xl p-6">
                <div className="font-poppins text-xs font-black text-[var(--text-main)] mb-6 uppercase tracking-widest opacity-80">
                  Weekly Revenue — دج
                </div>
                <div className="flex items-end gap-2 lg:gap-4 h-32 lg:h-40">
                  {bars.map((h,i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-lg transition-all duration-1000`} 
                      style={{ 
                        height: `${h}%`,
                        background: i === 4 || i === 6 
                          ? 'linear-gradient(180deg,#10B981,rgba(16,185,129,.1))' 
                          : i === 2 || i === 5 
                          ? 'linear-gradient(180deg,#2563eb,rgba(37,99,235,.1))' 
                          : 'rgba(37,99,235,0.05)' 
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AISection() {
  const t = useTranslations('Landing.AI')
  
  return (
    <section id="ai-section" className="py-20 lg:py-32 px-6 lg:px-[8%]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Chat mockup */}
        <div className="order-2 lg:order-1 relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-emerald-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-[#0a1426e6] border border-[var(--border-c)] rounded-[2.5rem] overflow-hidden shadow-2xl lg:transform lg:perspective-[1000px] lg:-rotate-y-6 lg:rotate-x-2 hover:rotate-0 transition-transform duration-700">
            <div className="px-5 py-4 bg-[var(--bg-card)] border-b border-[var(--border-c)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-lg shadow-lg">🤖</div>
              <div>
                <h4 className="font-poppins text-xs lg:text-sm font-bold text-[var(--text-main)]">EcoMate AI Assistant</h4>
                <p className="text-[10px] text-emerald-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online · Replies instantly
                </p>
              </div>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="self-end bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs lg:text-sm max-w-[85%] shadow-md">
                {t('chat.userMsg1')}
              </div>
              
              <div className="self-start bg-[var(--bg-card)] text-[var(--text-main)] rounded-2xl rounded-tl-none px-4 py-3 text-xs lg:text-sm border border-[var(--border-c)] max-w-[90%] shadow-sm">
                {t('chat.aiMsg1')}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[['👖','Black','3,500'],['👖','Blue','3,200'],['👖','Grey','3,800']].map(([e,n,p]) => (
                    <div key={n} className="bg-black/20 border border-[var(--border-c)] rounded-xl p-2 text-center transition-all hover:bg-black/40">
                      <span className="text-xl block mb-1">{e as string}</span>
                      <span className="text-[9px] font-black uppercase text-[var(--text-sub)] block truncate">{n as string}</span>
                      <span className="font-poppins text-[10px] font-black text-emerald-500 block mt-1">{p as string} <span className="text-[8px]">DA</span></span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="self-end bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs lg:text-sm max-w-[85%] shadow-md">
                {t('chat.userMsg2')}
              </div>
              
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs lg:text-sm font-bold text-emerald-500">
                <span className="text-lg">✅</span>
                {t('chat.orderConfirm')}
              </div>
            </div>
            
            <div className="p-4 border-t border-[var(--border-c)] flex gap-3 bg-black/10">
              <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-c)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-muted)] opacity-50">
                Type in Arabic, French or English...
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all">➤</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-500 mb-6 px-1">
            <span className="w-4 h-[1.5px] bg-blue-600" />
            {t('subtitle')}
          </div>
          <h2 className="font-poppins text-3xl lg:text-5xl font-black tracking-tight text-[var(--text-main)] mb-6 leading-[1.1]">
            {t('title')}
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-sub)] leading-relaxed mb-10 opacity-70">
            {t('desc')}
          </p>
          
          <div className="grid grid-cols-1 gap-4 mb-10">
            {[
              { icon:'💬', iconBg:'rgba(37,99,235,0.15)', title: t('platformsTitle'), desc: t('platformsDesc') },
              { icon:'🛒', iconBg:'rgba(37,99,235,0.15)', title: t('shoppingTitle'), desc: t('shoppingDesc') },
              { icon:'📋', iconBg:'rgba(16,185,129,0.15)', title: t('orderTitle'), desc: t('orderDesc') },
              { icon:'🚚', iconBg:'rgba(16,185,129,0.15)', title: t('trackingTitle'), desc: t('trackingDesc') },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-c)] rounded-2xl hover:border-blue-500/30 transition-all group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/5 group-hover:scale-110 transition-transform" style={{ background: f.iconBg }}>
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-poppins text-sm lg:text-base font-bold text-[var(--text-main)] mb-1">{f.title}</h4>
                  <p className="text-[13px] text-[var(--text-sub)] leading-relaxed opacity-60">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/auth/register" className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/10 active:scale-95 transition-all">
            {t('cta')}
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export function Pricing({ plans }: { plans?: any[] }) {
  const t = useTranslations('Landing.Pricing')
  
  const fallbackPlans = [
    { slug:'starter', name: t('starter'), price: t('priceFree'), period: t('periodStarter'), features:[t('featureChatbot'), t('featureOrders50'), t('feature1Channel'), t('feature20Items'), t('featureSheets')], cta: t('Nav.register'), href:'/auth/register' },
    { slug:'growth', name: t('growth'), price:'4,900', period: t('periodMonthly'), features:[t('featureFullAI'), t('featureUnlimited'), t('featureAllPlatforms'), t('featureTracking'), t('featureCRM'), t('featureGrowthAgent'), t('featureAnalytics')], cta: t('Nav.register'), href:'/auth/register', popular:true },
    { slug:'business', name: t('business'), price: t('priceCustom'), period: t('periodTailored'), features:[t('featureFullAI'), t('featureGrowthAgent'), 'Custom lead targeting', 'Priority deliverability', 'Dedicated account manager', 'Custom integrations'], cta: t('Nav.login'), href:'mailto:contact@ecomate.dz' },
  ]
  const activePlans = plans && plans.length > 0 
    ? plans.map(p => ({
        slug: p.id, 
        name: p.name, 
        price: p.price === 0 ? (p.id === 'starter' ? 'Free' : 'Custom') : p.price.toLocaleString(), 
        period: p.period || '',
        features: Array.isArray(p.features) ? p.features : [], 
        cta: p.cta_text || (p.id === 'business' ? 'Contact Sales' : 'Get Started →'), 
        href: p.id === 'business' ? 'mailto:contact@ecomate.dz' : '/auth/register', 
        popular: p.is_popular
      }))
    : fallbackPlans

  return (
    <section id="pricing" className="py-20 lg:py-32 px-6 lg:px-[8%] bg-[var(--bg-section)]">
      <div className="text-center mb-16 lg:mb-20">
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-500 mb-6">
          <span className="w-4 h-[1.5px] bg-blue-600" />
          {t('subtitle')}
        </div>
        <h2 className="font-poppins text-3xl lg:text-5xl font-black tracking-tight text-[var(--text-main)] mb-6 leading-[1.1]">
          {t('title')}
        </h2>
        <p className="text-base text-[var(--text-sub)] opacity-70 max-w-sm mx-auto">{t('desc')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {activePlans.map((p: any) => (
          <div key={p.slug} className={`relative flex flex-col border rounded-[2rem] p-8 lg:p-10 transition-all duration-300 hover:-translate-y-2 ${p.popular ? 'border-blue-500/50 bg-gradient-to-b from-blue-900/40 to-[var(--bg-card)] shadow-2xl shadow-blue-500/10' : 'border-[var(--border-c)] bg-[var(--bg-card)]'}`}>
            {p.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-poppins text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                Most Popular
              </span>
            )}
            
            <div className="font-poppins text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 opacity-60">
              {p.name}
            </div>
            
            <div className="font-poppins text-4xl lg:text-5xl font-black tracking-tighter text-[var(--text-main)] mb-2 flex items-start">
              {p.price !== 'Free' && p.price !== 'Custom' && <span className="text-xl mt-2 mr-1">DA</span>}
              {p.price}
            </div>
            <div className="text-[11px] lg:text-xs text-[var(--text-muted)] mb-10 opacity-50">
              {p.period}
            </div>
            
            <ul className="flex-1 space-y-4 mb-10">
              {p.features.map((f: string) => (
                <li key={f} className="text-[13px] lg:text-sm text-[var(--text-sub)] flex items-start gap-3">
                  <span className="text-emerald-500 font-bold block shrink-0 mt-0.5">✓</span>
                  <span className="opacity-80">{f}</span>
                </li>
              ))}
            </ul>
            
            <Link href={p.href} className={`block w-full py-4 rounded-2xl font-poppins text-sm font-black text-center uppercase tracking-widest transition-all ${p.popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500' : 'bg-white/5 border border-white/10 text-[var(--text-sub)] hover:bg-white/10'}`}>
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CTA() {
  const t = useTranslations('Landing.CTA')
  
  return (
    <section id="cta" className="bg-gradient-to-br from-blue-900 via-[#07101f] to-black py-24 lg:py-40 px-6 lg:px-[8%] text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(37,99,235,0.25),transparent_65%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="font-poppins text-4xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
          {t('title')}
        </h2>
        <p className="text-base lg:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('desc')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/register" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#07101f] font-poppins text-base font-black px-10 py-5 rounded-2xl shadow-2xl shadow-black/50 hover:bg-blue-50 active:scale-95 transition-all">
            Start Free — No Card Needed
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="mailto:contact@ecomate.dz" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white/80 font-poppins text-base font-bold px-10 py-5 rounded-2xl hover:bg-white/10 active:scale-95 transition-all">
            Talk to Our Team 📞
          </a>
        </div>
        
        <p className="mt-12 text-[10px] lg:text-xs font-black uppercase tracking-[0.25em] text-white/20">
          Built at University of Bouira Startup Incubator · 🇩🇿 Made in Algeria
        </p>
      </div>
    </section>
  )
}

export function Footer() {
  const t = useTranslations('Landing.Footer')
  
  return (
    <footer className="bg-[#050a14] py-20 lg:py-24 px-6 lg:px-[8%] border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-center lg:text-start">
        <div className="flex flex-col items-center lg:items-start">
          <div className="font-poppins font-black text-3xl mb-6">
            <span className="bg-gradient-to-br from-blue-500 to-blue-600 bg-clip-text text-transparent">Eco</span>
            <span className="bg-gradient-to-br from-emerald-400 to-emerald-500 bg-clip-text text-transparent">Mate</span>
          </div>
          <p className="text-sm text-white/30 leading-relaxed max-w-xs mb-8">
            {t('slogan')}
          </p>
          <div className="flex gap-3">
            {['📘','📸','💬','💼'].map((s,i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-blue-600 hover:border-blue-500 hover:scale-110 transition-all duration-300">
                {s}
              </a>
            ))}
          </div>
        </div>

        {[
          { title: t('colPlatform'), links:[t('about'), t('team')] },
          { title: t('colCompany'), links:[t('contact'), t('faqs')] },
          { title: t('colSupport'), links:['Privacy Policy', 'Terms of Service'] },
        ].map(col => (
          <div key={col.title}>
            <h5 className="font-poppins text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8">
              {col.title}
            </h5>
            <ul className="space-y-4">
              {col.links.map(l => (
                <li key={l}>
                  <a href="#" className="text-[13px] text-white/25 hover:text-blue-400 transition-colors duration-300">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40">
        <p className="text-[11px] font-medium text-white/60">
          © 2025 <span className="text-white font-black">EcoMate</span>. All rights reserved.
        </p>
        <p className="text-[11px] font-black uppercase tracking-widest text-white/60">
          🇩🇿 Made in Algeria
        </p>
      </div>
    </footer>
  )
}
