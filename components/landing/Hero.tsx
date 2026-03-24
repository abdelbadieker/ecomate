import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '110px 5% 80px', position: 'relative', overflow: 'hidden',
      background: 'var(--bg-body)',
    }}>
      {/* Three.js canvas — right 56% */}
      <canvas id="hcanvas" style={{
        position: 'absolute', top: 0, right: 0,
        width: '56%', height: '100%', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Glow blobs */}
      <div style={{
        position: 'absolute', top: '10%', right: '6%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(37,99,235,.13) 0%,transparent 70%)',
        animation: 'glow-pulse 4s ease-in-out infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: 0,
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 70%)',
        animation: 'glow-pulse 6s ease-in-out infinite reverse', pointerEvents: 'none',
      }} />

      {/* Hero text content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 680 }}>
        {/* Badge */}
        <div className="hero-badge" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.25)',
          borderRadius: 100, padding: '6px 16px',
          fontSize: 12, fontWeight: 600, color: 'var(--text-sub)',
          marginBottom: 36,
        }}>
          <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          All-in-One SaaS Platform for Algerian Business
        </div>

        <h1 style={{ fontFamily: 'var(--font-poppins)', lineHeight: 1.06, letterSpacing: '-.03em', marginBottom: 28 }}>
          <span className="hero-h1" style={{ display: 'block', fontSize: 'clamp(44px,5vw,68px)', fontWeight: 700, color: 'var(--text-main)' }}>
            Build your
          </span>
          <span className="hero-h2" style={{
            display: 'block', fontSize: 'clamp(78px,11vw,140px)', fontWeight: 900,
            fontStyle: 'italic', lineHeight: .92,
            background: 'linear-gradient(135deg,#2563eb 0%,#93c5fd 55%,#1e3a8a 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px rgba(37,99,235,.3))',
          }}>
            Business
          </span>
          <span className="hero-h3" style={{ display: 'block', fontSize: 'clamp(44px,5vw,68px)', fontWeight: 700, color: 'var(--text-main)' }}>
            without the{' '}
            <span style={{ color: '#10B981', textShadow: '0 0 40px rgba(16,185,129,.5)' }}>complexity.</span>
          </span>
        </h1>

        <p className="hero-sub" style={{
          fontSize: 'clamp(15px,1.6vw,18px)', color: 'var(--text-sub)',
          lineHeight: 1.75, maxWidth: 520, marginBottom: 48,
        }}>
          EcoMate centralizes every tool Algerian SMEs need into one platform — AI chatbot automation,
          order management, CRM, and AI-powered client acquisition. No technical knowledge required.
        </p>

        <div className="hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/auth/register" className="btn-primary" style={{ fontSize: 15, padding: '15px 32px' }}>
            Start Free Trial
            <svg className="arri" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a href="#ai-section" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600,
            color: 'var(--text-sub)', background: 'var(--bg-card)',
            border: '1px solid var(--border-c)', borderRadius: 12, padding: '15px 28px',
            transition: 'all .25s', backdropFilter: 'blur(8px)', cursor: 'pointer',
            textDecoration: 'none',
          }}>
            <span className="blink" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', flexShrink: 0 }} />
            Live AI Preview
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Stats row */}
        <div className="hero-stats" style={{ display: 'flex', gap: 0, marginTop: 50 }}>
          {[
            { num: '7', suf: '', label: 'Tools in one platform' },
            { num: '98', suf: '%', label: 'AI response rate' },
            { num: '24', suf: '/7', label: 'Always-on automation' },
            { num: '0', suf: '', label: 'Missed orders' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: i === 0 ? '0 26px 0 0' : i === 3 ? '0 0 0 26px' : '0 26px',
              borderRight: i < 3 ? '1px solid var(--border-c)' : 'none',
            }}>
              <span style={{
                fontFamily: 'var(--font-poppins)', fontSize: 26, fontWeight: 800,
                letterSpacing: '-.03em', display: 'block', color: 'var(--text-main)',
              }}>
                {s.num}<span style={{ color: '#10B981' }}>{s.suf}</span>
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', display: 'block', marginTop: 2 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating card 1 — Revenue */}
      <div style={{
        position: 'absolute', top: '22%', right: '6%', zIndex: 3,
        background: 'var(--float-bg, rgba(8,18,38,.9))', border: '1px solid var(--border-c)',
        borderRadius: 14, padding: '14px 18px', backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        animation: 'float1 5s ease-in-out infinite',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7 }}>Revenue Today</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>💰</span>
          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 18, fontWeight: 800, color: '#10B981' }}>127,400 DA</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#10B981', marginTop: 8 }}>
          ↑ +23.4% vs yesterday
        </div>
        {/* Spark bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28, marginTop: 10 }}>
          {[40, 55, 70, 60, 90, 80, 100].map((h, i) => (
            <div key={i} style={{
              width: 7, borderRadius: '3px 3px 0 0',
              height: `${h}%`,
              background: i >= 4 ? '#10B981' : i >= 2 ? '#2563EB' : 'rgba(37,99,235,.2)',
            }} />
          ))}
        </div>
      </div>

      {/* Floating card 2 — Order */}
      <div style={{
        position: 'absolute', bottom: '26%', right: '3%', zIndex: 3,
        background: 'var(--float-bg, rgba(8,18,38,.9))', border: '1px solid var(--border-c)',
        borderRadius: 14, padding: '14px 18px', backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        animation: 'float2 6.5s ease-in-out infinite',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7 }}>New Order ✅</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📦</span>
          <div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Order #2847</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Confirmed by AI · 2 min ago</div>
          </div>
        </div>
      </div>

      {/* Floating card 3 — AI Response Rate */}
      <div style={{
        position: 'absolute', top: '44%', right: '31%', zIndex: 3,
        background: 'var(--float-bg, rgba(8,18,38,.9))', border: '1px solid var(--border-c)',
        borderRadius: 14, padding: '14px 18px', backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        animation: 'float3 7s ease-in-out infinite',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7 }}>AI Response Rate</div>
        <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 26, fontWeight: 800, color: 'var(--text-main)' }}>
          98.7<span style={{ fontSize: 15, color: 'var(--text-muted)' }}>%</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#10B981', marginTop: 6 }}>
          ← 3.4k messages handled
        </div>
      </div>
    </section>
  )
}
