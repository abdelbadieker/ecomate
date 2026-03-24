export default function DashboardLoading() {
  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 240, height: 32, borderRadius: 8, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 360, height: 16, borderRadius: 4 }} />
      </div>

      {/* Stats Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 14, padding: '20px', height: 130 }} className="skeleton" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 16, height: 300 }} className="skeleton" />

      <style>{`
        .skeleton {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-section) 50%, var(--bg-card) 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
