export default function AIChatbotPage() {
  const platforms = [
    { icon: '📘', name: 'Facebook Messenger', status: 'Connect', color: '#1877f2' },
    { icon: '📸', name: 'Instagram DM', status: 'Connect', color: '#e1306c' },
    { icon: '💬', name: 'WhatsApp Business', status: 'Connect', color: '#25d366' },
    { icon: '✈️', name: 'Telegram', status: 'Connect', color: '#229ED9' },
  ]

  const features = [
    { icon: '🌐', title: 'Trilingual Support', desc: 'Arabic, French, English — auto-detected per customer' },
    { icon: '🛒', title: 'Order Taking', desc: 'Full checkout flow inside the conversation' },
    { icon: '📦', title: 'Order Tracking', desc: 'Customers check delivery status via chat' },
    { icon: '📋', title: 'Product Catalog', desc: 'Shows products from your catalog automatically' },
    { icon: '⏰', title: '24/7 Active', desc: 'Never misses a customer message' },
    { icon: '🎯', title: 'Smart Routing', desc: 'Complex queries escalated to you' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>AI Chatbot 🤖</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Configure and manage your AI sales assistant</p>
      </div>

      {/* Status */}
      <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', animation: 'blink 2s infinite' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: '#10B981' }}>AI System Ready</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Connect your social platforms below to activate the chatbot</div>
        </div>
      </div>

      {/* Platform Connections */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '24px', marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 18 }}>Connect Your Platforms</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {platforms.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-section)', border: '1px solid var(--border-c)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${p.color}20`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Not connected</div>
                </div>
              </div>
              <button style={{ padding: '7px 16px', borderRadius: 9, background: `${p.color}15`, border: `1px solid ${p.color}40`, color: p.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
                + Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 18 }}>What the AI Does</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {features.map(f => (
            <div key={f.title} style={{ padding: '14px', background: 'var(--bg-section)', borderRadius: 10, border: '1px solid var(--border-c)' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
