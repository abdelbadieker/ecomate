import Link from 'next/link'

export function Integrations() {
  const cols = [
    { badge: 'All Social Platforms', title: 'Where your customers message you', pills: [['blue','Facebook'],['pink','Instagram'],['green','WhatsApp'],['tg','Telegram'],['snap','Snapchat']] },
    { badge: 'Algerian Delivery Network', title: 'Shipping partners across all wilayas', pills: [['dz','Home Delivery'],['dz','Office Pickup'],['dz','Express Delivery'],['dz','COD Ready'],['dz','58 Wilayas']] },
    { badge: 'Business Tools', title: 'Keep using the tools you love', pills: [['sheets','Google Sheets'],['sheets','Google Drive'],['gray','Excel Export'],['gray','PDF Reports']] },
  ]
  const dotColors: Record<string,string> = { blue:'#1877f2', pink:'#e1306c', green:'#25d366', tg:'#229ED9', snap:'#FFBD00', dz:'#006233', sheets:'#34a853', gray:'#94a3b8' }

  return (
    <div style={{ padding: '64px 5%', background: 'var(--bg-section)', transition: 'var(--theme-transition)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 32, display: 'block' }}>
          Connects seamlessly with the platforms your customers already use
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', alignItems: 'start' }}>
          {cols.map((col, i) => (
            <>
              {i > 0 && <div key={`div-${i}`} style={{ background: 'var(--border-c)', height: '100%', minHeight: 80 }} />}
              <div key={i} style={{ padding: '0 40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: '#10B981', marginBottom: 16 }}>✓ {col.badge}</div>
                <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {col.pills.map(([color, label]) => (
                    <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 100, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColors[color], flexShrink: 0 }} />{label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Features({ services }: { services?: any[] }) {
  const bentosFallback = [
    { id:'b1', cls:'1/6', icon:'🤖', iconBg:'rgba(37,99,235,.1)', title:'AI Sales Chatbot', desc:'Deployed across all your social platforms. Responds 24/7 in Arabic, French and English — handles questions, takes orders, confirms deliveries.', tag:'✓ Arabic · French · English' },
    { id:'b2', cls:'6/9', icon:'📦', iconBg:'rgba(16,185,129,.1)', title:'Order & COD Management', desc:'All orders in one dashboard. Cash-on-delivery tracking and delivery sync — fully automatic.' },
    { id:'b3', cls:'9/13', icon:'🛍️', iconBg:'rgba(96,165,250,.08)', title:'Product Catalog', desc:'Add products once — sync automatically across your chatbot and dashboard. Always up to date.' },
    { id:'b5', cls:'1/7', icon:'👥', iconBg:'rgba(16,185,129,.1)', title:'CRM — Customer Relations', desc:'Every interaction, purchase history, and preference tracked automatically. Build loyalty without extra effort.' },
    { id:'b6', cls:'7/13', icon:'🎯', iconBg:'rgba(245,158,11,.1)', title:'AI Growth Agent', desc:'Your 24/7 business development AI. Discovers potential clients, scores their fit, sends personalized outreach — all on autopilot.', tag:'✓ Runs while you sleep', tagColor:'#f59e0b' },
    { id:'b7', cls:'1/7', icon:'📊', iconBg:'rgba(16,185,129,.1)', title:'Analytics & Sales Dashboard', desc:'Real-time revenue, top products, conversion rates — visualized clearly for better decisions every day.' },
    { id:'b8', cls:'7/13', icon:'🚚', iconBg:'rgba(96,165,250,.08)', title:'Delivery Partner Integration', desc:'Integrated with all Algerian delivery companies. Tracking codes sync automatically, customers get live status updates across all 58 wilayas.' },
  ]
  const bentosClasses = ['1/6', '6/9', '9/13', '1/7', '7/13', '1/7', '7/13']
  const bgColors = ['rgba(37,99,235,.1)', 'rgba(16,185,129,.1)', 'rgba(96,165,250,.08)', 'rgba(245,158,11,.1)']
  
  const bentos: any[] = services && services.length > 0 
    ? services.map((s, i) => ({
        id: s.id, cls: bentosClasses[i % bentosClasses.length],
        icon: s.image_url ? <img src={s.image_url} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} /> : (s.icon || '⚡'),
        iconBg: bgColors[i % bgColors.length],
        title: s.title, desc: s.description,
        tag: undefined, tagColor: undefined
      }))
    : bentosFallback

  return (
    <section id="features" style={{ padding: '100px 5%', background: 'var(--bg-section)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 18 }}>
        <span style={{ width: 16, height: 1.5, background: '#2563eb' }} />Everything You Need
      </div>
      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(30px,3.8vw,52px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.1 }}>
        Seven tools. <span style={{ background: 'linear-gradient(135deg,#2563eb,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One platform.</span><br />
        <span style={{ background: 'linear-gradient(135deg,#10B981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zero fragmentation.</span>
      </h2>
      <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.75, maxWidth: 520, marginBottom: 60 }}>
        Stop juggling a dozen different tools. EcoMate brings every capability into one seamless, affordable system — powered by real AI, built for real results.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 16 }}>
        {bentos.map(b => (
          <div key={b.id} style={{
            gridColumn: b.cls,
            background: 'var(--bg-card)', border: '1px solid var(--border-c)',
            borderRadius: 20, padding: 30, position: 'relative', overflow: 'hidden',
            transition: 'border-color .3s, transform .3s, box-shadow .3s',
            cursor: 'default',
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 18, background: b.iconBg, border: '1px solid rgba(255,255,255,.08)' }}>{b.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 9 }}>{b.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.65 }}>{b.desc}</p>
            {b.tag && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${b.tagColor ? `${b.tagColor}18` : 'rgba(16,185,129,.1)'}`, border: `1px solid ${b.tagColor ? `${b.tagColor}30` : 'rgba(16,185,129,.18)'}`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: b.tagColor || '#10B981', marginTop: 14 }}>{b.tag}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    { n:1, icon:'📋', title:'Tell Us Your Business', desc:'Sign up and describe your activity, products, and goals. A quick onboarding call takes under 30 minutes.' },
    { n:2, icon:'⚙️', title:'We Set Everything Up', desc:'Our team configures your AI chatbot, product catalog, and dashboard — fully customized. No tech skills needed.' },
    { n:3, icon:'🔗', title:'Connect Your Channels', desc:'Link your social pages and delivery partner. Simple one-step connections — we guide you through every click.' },
    { n:4, icon:'🚀', title:'Launch & Scale', desc:'Go live. Your AI handles orders 24/7, tracks every delivery, and the AI Growth Agent acquires new clients.' },
  ]

  return (
    <section id="how" style={{ padding: '100px 5%' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 18 }}>
          <span style={{ width: 16, height: 1.5, background: '#2563eb' }} />Simple Process
        </div>
        <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(30px,3.8vw,52px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.1 }}>
          From zero to selling <span style={{ background: 'linear-gradient(135deg,#2563eb,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in 4 steps.</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 60px' }}>
          We handle the complexity so you can focus on what matters — growing your business.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 52, left: '12%', right: '12%', height: 1, background: 'linear-gradient(90deg,transparent,var(--border-c),#2563eb,#10B981,var(--border-c),transparent)' }} />
        {steps.map(s => (
          <div key={s.n} style={{ padding: '0 22px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 104, height: 104, borderRadius: '50%', margin: '0 auto 26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, position: 'relative', background: 'var(--bg-card)', border: '1.5px solid var(--border-c)' }}>
              <div style={{ position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1E3A8A)', fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-body)' }}>{s.n}</div>
              {s.icon}
            </div>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 9 }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.65 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function DashboardPreview() {
  const stats = [
    { label:'Revenue Today', value:'127,400 DA', color:'#10B981', change:'↑ 23.4% vs yesterday' },
    { label:'Orders Today', value:'84', color:'#2563eb', change:'↑ 12 new orders' },
    { label:'AI Handled', value:'3,421', color:'var(--text-main)', change:'↑ 98.7% response rate' },
    { label:'Pending COD', value:'32', color:'#f59e0b', change:'→ Awaiting delivery' },
  ]
  const bars = [40,58,72,55,87,78,100]

  return (
    <section id="dashboard" style={{ padding: '100px 5%', background: 'var(--bg-section)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 18 }}>
        <span style={{ width: 16, height: 1.5, background: '#2563eb' }} />Live Dashboard
      </div>
      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(30px,3.8vw,52px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.1 }}>
        Your entire business. <span style={{ background: 'linear-gradient(135deg,#2563eb,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One screen.</span>
      </h2>
      <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.75, maxWidth: 500, marginBottom: 40 }}>Real-time order tracking, revenue monitoring, and customer insights — clean and intuitive.</p>

      <div style={{ background: 'rgba(10,20,38,.92)', border: '1px solid var(--border-c)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,.15)' }}>
        {/* Browser bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-c)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {['#ff5f57','#ffbd2e','#28c840'].map((c,i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
          <div style={{ marginLeft: 14, background: 'var(--bg-card)', borderRadius: 6, padding: '3px 14px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>app.ecomate.dz/dashboard</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', minHeight: 380 }}>
          {/* Sidebar */}
          <div style={{ borderRight: '1px solid var(--border-c)', padding: '16px 0' }}>
            {[['📊','Dashboard',true],['📦','Orders',false],['🛍️','Products',false],['👥','Customers',false],['🤖','AI Chatbot',false],['📈','Analytics',false],['🚚','Delivery',false]].map(([icon,label,active],i) => (
              <div key={i} style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, fontWeight: 500, color: active ? 'var(--text-main)' : 'var(--text-muted)', background: active ? 'rgba(37,99,235,.08)' : 'transparent', borderRight: active ? '2px solid #2563eb' : 'none' }}>
                <span style={{ fontSize: 15 }}>{icon as string}</span>{label as string}
              </div>
            ))}
          </div>
          {/* Main */}
          <div style={{ padding: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
              {stats.map((s,i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 7 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#10B981' }}>{s.change}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 12, padding: 18 }}>
              <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Weekly Revenue — دج</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 90 }}>
                {bars.map((h,i) => (
                  <div key={i} style={{ flex: 1, borderRadius: '4px 4px 0 0', height: `${h}%`, background: i === 4 || i === 6 ? 'linear-gradient(180deg,#10B981,rgba(16,185,129,.2))' : i === 2 || i === 5 ? 'linear-gradient(180deg,#2563eb,rgba(37,99,235,.2))' : 'rgba(37,99,235,.12)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AISection() {
  return (
    <section id="ai-section" style={{ padding: '100px 5%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        {/* Chat mockup */}
        <div style={{ background: 'rgba(10,20,38,.9)', border: '1px solid var(--border-c)', borderRadius: 26, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,.12)', transform: 'perspective(1000px) rotateY(-8deg) rotateX(3deg)', transition: 'transform .5s' }}>
          <div style={{ padding: '15px 18px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-c)', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🤖</div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>EcoMate AI Assistant</h4>
              <p style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />Online · Replies instantly</p>
            </div>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: '13px 13px 3px 13px', padding: '10px 13px', fontSize: 12.5, maxWidth: '83%' }}>أبغي أشوف السراويل الجديدة 👖</div>
            <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.06)', color: 'var(--text-main)', borderRadius: '13px 13px 13px 3px', padding: '10px 13px', fontSize: 12.5, border: '1px solid var(--border-c)', maxWidth: '83%' }}>
              أهلاً! / Hello! / Bonjour! 🔥 Here are today&apos;s Baggy Jeans:
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginTop: 8 }}>
                {[['👖','Black Baggy','3,500 DA'],['👖','Blue Wash','3,200 DA'],['👖','Cargo Grey','3,800 DA']].map(([e,n,p]) => (
                  <div key={n} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 9, padding: 9, textAlign: 'center' }}>
                    <span style={{ fontSize: 19, display: 'block', marginBottom: 3 }}>{e as string}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-sub)', display: 'block' }}>{n as string}</span>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 800, color: '#10B981', display: 'block', marginTop: 2 }}>{p as string}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: '13px 13px 3px 13px', padding: '10px 13px', fontSize: 12.5, maxWidth: '83%' }}>Black Baggy — مقاس 32</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 9, padding: 10, fontSize: 12, fontWeight: 700, color: '#10B981' }}>
              <span>✅</span>Order #2847 confirmed! Delivery in 2-3 days via your local carrier
            </div>
          </div>
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-c)', display: 'flex', gap: 9 }}>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 9, padding: '9px 13px', fontSize: 12, color: 'var(--text-muted)' }}>Type in Arabic, French or English...</div>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff' }}>➤</div>
          </div>
        </div>

        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 18 }}>
            <span style={{ width: 16, height: 1.5, background: '#2563eb' }} />AI-Powered Core
          </div>
          <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(30px,3.8vw,52px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.1 }}>
            Your store sells <span style={{ background: 'linear-gradient(135deg,#2563eb,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>while you sleep.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.75, marginBottom: 32 }}>Our AI handles the full customer journey — product discovery, order confirmation, and delivery tracking — automatically in Arabic, French, and English.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
            {[
              { icon:'💬', iconBg:'rgba(37,99,235,.1)', title:'All Social Platforms', desc:'Deployed on Facebook Messenger, Instagram DM, WhatsApp, and more — wherever your customers are.' },
              { icon:'🛒', iconBg:'rgba(37,99,235,.1)', title:'Interactive Shopping Inside the Chat', desc:'Customers browse products, pick size and color, add to cart, and order — all within the conversation.' },
              { icon:'📋', iconBg:'rgba(16,185,129,.1)', title:'Auto Order Management', desc:'Every order logged instantly to your dashboard and Google Sheets with all customer details.' },
              { icon:'🚚', iconBg:'rgba(16,185,129,.1)', title:'Delivery Auto-Tracking', desc:'Integrates with all Algerian delivery companies. Customers receive live status updates automatically.' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 13, transition: 'all .25s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 3 }}>{f.title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/auth/register" className="btn-primary" style={{ fontSize: 15, padding: '15px 32px', textDecoration: 'none', display: 'inline-flex' }}>
            See AI in Action
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: 8 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export function Pricing({ plans }: { plans?: any[] }) {
  const fallbackPlans = [
    { slug:'starter', name:'Starter', price:'Free', period:'14-day trial · no card needed', features:['AI Chatbot (basic)','Up to 50 orders/month','1 social channel','Product catalog (20 items)','Google Sheets export'], cta:'Get Started Free', href:'/auth/register' },
    { slug:'growth', name:'Growth', price:'4,900', period:'per month · billed monthly', features:['Full AI Sales System','Unlimited orders & products','All social platforms','Delivery auto-tracking','CRM & customer database','AI Growth Agent (lead outreach)','Analytics dashboard'], cta:'Start Growing →', href:'/auth/register', popular:true },
    { slug:'business', name:'Business', price:'Custom', period:'tailored to your scale', features:['Everything in Growth','Advanced AI Growth Agent','Custom lead targeting','Priority deliverability','Dedicated account manager','Custom integrations'], cta:'Contact Sales', href:'mailto:contact@ecomate.dz' },
  ]
  const activePlans = plans && plans.length > 0 
    ? plans.map(p => ({
        slug: p.id, name: p.name, price: p.price, period: p.description || '',
        features: p.features || [], cta: 'Get Started', href: '/auth/register', popular: p.is_popular
      }))
    : fallbackPlans

  return (
    <section id="pricing" style={{ padding: '100px 5%', background: 'var(--bg-section)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 18 }}>
          <span style={{ width: 16, height: 1.5, background: '#2563eb' }} />Transparent Pricing
        </div>
        <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(30px,3.8vw,52px)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.1 }}>
          Plans that <span style={{ background: 'linear-gradient(135deg,#2563eb,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>scale with you.</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.75, margin: '0 auto 56px', maxWidth: 400 }}>No hidden fees. No contracts. Start free for 14 days.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, maxWidth: 960, margin: '0 auto' }}>
        {activePlans.map((p: any) => (
          <div key={p.slug} style={{ position: 'relative', border: `1px solid ${p.popular ? 'rgba(37,99,235,.35)' : 'var(--border-c)'}`, borderRadius: 22, padding: '34px 28px', background: p.popular ? 'linear-gradient(145deg,rgba(30,58,138,.85),rgba(10,20,38,.95))' : 'var(--bg-card)', transition: 'transform .25s, box-shadow .25s' }}>
            {p.popular && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#10B981,#0d9488)', color: '#fff', fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 100, letterSpacing: '.06em', textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(16,185,129,.35)' }}>Most Popular</span>}
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 9 }}>{p.name}</div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 44, fontWeight: 900, letterSpacing: '-.04em', color: 'var(--text-main)', lineHeight: 1, marginBottom: 4 }}>
              {p.price !== 'Free' && p.price !== 'Custom' && <sup style={{ fontSize: 18, fontWeight: 700, verticalAlign: 'top', marginTop: 8, display: 'inline-block' }}>DA</sup>}
              {p.price}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 26, display: 'block' }}>{p.period}</span>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, listStyle: 'none', padding: 0 }}>
              {p.features.map((f: string) => (
                <li key={f} style={{ fontSize: 13, color: p.popular ? 'rgba(255,255,255,.8)' : 'var(--text-sub)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: '#10B981', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href={p.href} style={{
              display: 'block', width: '100%', padding: 12, borderRadius: 11,
              fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none',
              background: p.popular ? 'linear-gradient(135deg,#10B981,#0d9488)' : 'transparent',
              border: p.popular ? 'none' : '1.5px solid var(--border-c)',
              color: p.popular ? '#fff' : 'var(--text-sub)',
              boxShadow: p.popular ? '0 4px 18px rgba(16,185,129,.3)' : 'none',
              transition: 'all .2s',
            }}>{p.cta}</Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CTA() {
  return (
    <section id="cta" style={{ background: 'linear-gradient(135deg,#1E3A8A,#1e3a8a 45%,#07101f 100%)', padding: '120px 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%,rgba(37,99,235,.25),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 280, background: 'radial-gradient(ellipse,rgba(16,185,129,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, letterSpacing: '-.03em', color: '#fff', lineHeight: 1.1, marginBottom: 20, position: 'relative' }}>
        Ready to build your<br />
        <span style={{ background: 'linear-gradient(135deg,#10B981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>digital business?</span>
      </h2>
      <p style={{ fontSize: 17, color: 'rgba(255,255,255,.5)', maxWidth: 480, margin: '0 auto 46px', lineHeight: 1.7, position: 'relative' }}>
        Join Algerian merchants already automating their sales. Seven powerful tools. One platform. Zero complexity.
      </p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
        <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: '#07101f', background: 'linear-gradient(135deg,#fff,#e2e8f0)', borderRadius: 12, padding: '15px 34px', boxShadow: '0 4px 24px rgba(0,0,0,.3)', transition: 'all .25s', textDecoration: 'none' }}>
          Start Free — No Card Needed ↗
        </Link>
        <a href="mailto:contact@ecomate.dz" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.8)', background: 'rgba(255,255,255,.07)', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '15px 30px', transition: 'all .25s', textDecoration: 'none' }}>
          📞 Talk to Our Team
        </a>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', marginTop: 20, position: 'relative' }}>
        Built at University of Bouira Startup Incubator · 🇩🇿 Made in Algeria
      </p>
    </section>
  )
}

export function Footer() {
  return (
    <footer style={{ background: 'rgba(5,10,20,1)', padding: '60px 5% 30px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 52 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: 22, marginBottom: 15 }}>
            <span style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eco</span>
            <span style={{ background: 'linear-gradient(135deg,#2563eb,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', lineHeight: 1.7, maxWidth: 250 }}>The all-in-one SaaS platform helping Algerian SMEs build automated, scalable digital businesses.</p>
          <div style={{ display: 'flex', gap: 9, marginTop: 22 }}>
            {['📘','📸','💬','💼'].map((s,i) => (
              <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'all .2s', textDecoration: 'none' }}>{s}</a>
            ))}
          </div>
        </div>
        {[
          { title:'Platform', links:['AI Chatbot','Order Management','Product Catalog','CRM','AI Growth Agent','Analytics'] },
          { title:'Company', links:['About EcoMate','Our Team'] },
          { title:'Support', links:['Contact Us','FAQs'] },
        ].map(col => (
          <div key={col.title}>
            <h5 style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 18 }}>{col.title}</h5>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0 }}>
              {col.links.map(l => <li key={l}><a href="#" style={{ fontSize: 12.5, color: 'rgba(255,255,255,.28)', transition: 'color .2s', textDecoration: 'none' }}>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>© 2025 <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>EcoMate</span>. All rights reserved.</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.2)' }}>🇩🇿 Made in Algeria</p>
      </div>
    </footer>
  )
}
