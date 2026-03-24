export default function Partners({ partners }: { partners: any[] }) {
  const row1 = partners.filter(p => p.row_num === 1)
  const row2 = partners.filter(p => p.row_num === 2)

  function card(p: any) {
    return (
      <div key={p.id} style={{
        display: 'inline-flex', alignItems: 'center', gap: 12,
        padding: '13px 20px',
        background: 'var(--bg-card)', border: '1px solid var(--border-c)',
        borderRadius: 14, whiteSpace: 'nowrap', flexShrink: 0,
        opacity: p.is_live ? 1 : 0.55,
        position: 'relative', overflow: 'hidden',
        transition: 'border-color .3s, transform .25s',
        cursor: 'default',
      }}>
        {!p.is_live && (
          <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 8, fontWeight: 800, letterSpacing: '.1em', color: 'rgba(245,158,11,.7)' }}>SOON</span>
        )}
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.06)', border: '1px solid var(--border-c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {p.logo?.startsWith('http') ? (
            <img src={p.logo} alt={p.name} style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'contain' }} />
          ) : p.logo}
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', display: 'block', lineHeight: 1.25 }}>{p.name}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>{p.category}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '56px 0 52px', borderTop: '1px solid var(--border-c)', borderBottom: '1px solid var(--border-c)', background: 'var(--bg-body)', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '0 5% 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--s)', marginBottom: 12 }}>
          <span style={{ width: 18, height: 1.5, background: 'var(--s)', display: 'block' }} />
          Our Ecosystem
          <span style={{ width: 18, height: 1.5, background: 'var(--s)', display: 'block' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 'clamp(22px,2.6vw,30px)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.15 }}>
          Growing together with{' '}
          <span style={{ background: 'linear-gradient(135deg,#2563eb,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>trusted partners.</span>
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Strategic alliances across logistics, technology, finance and beyond — 🇩🇿 Algeria</p>
      </div>

      {/* Scroll tracks */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Fade edges */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 160, background: 'linear-gradient(90deg,var(--bg-body),transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 160, background: 'linear-gradient(-90deg,var(--bg-body),transparent)', zIndex: 2, pointerEvents: 'none' }} />

        {/* Row 1 */}
        <div className="ptn-row" style={{ display: 'flex', gap: 16, width: 'max-content', padding: '8px 0', animation: 'pscroll-l 36s linear infinite' }}>
          {row1.map(p => card(p))}
          {row1.map(p => ({ ...p, id: p.id + '_dup' })).map(p => card(p))}
        </div>

        {/* Row 2 */}
        <div className="ptn-row" style={{ display: 'flex', gap: 16, width: 'max-content', padding: '8px 0', marginTop: 8, animation: 'pscroll-r 42s linear infinite' }}>
          {row2.map(p => card(p))}
          {row2.map(p => ({ ...p, id: p.id + '_dup' })).map(p => card(p))}
        </div>
      </div>
    </div>
  )
}
