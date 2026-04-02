import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Fetch high-level stats
  const { count: partnersCount } = await supabase.from('partners').select('*', { count: 'exact', head: true })
  const { count: reviewsCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true })
  const { count: clientsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  
  const stats = [
    { label: 'Total Clients', value: clientsCount || 0, icon: '👥', color: '#3b82f6' },
    { label: 'Partners', value: partnersCount || 0, icon: '🤝', color: '#10b981' },
    { label: 'Pending Reviews', value: reviewsCount || 0, icon: '⭐', color: '#f59e0b' },
    { label: 'Active Services', value: 6, icon: '🛠️', color: '#6366f1' },
  ]

  const quickActions = [
    { name: 'Update Pricing', icon: '💎', path: '/admin/plans', desc: 'Modify pricing tiers & features' },
    { name: 'Review Approvals', icon: '⭐', path: '/admin/reviews', desc: 'Approve client testimonials' },
    { name: 'Partner Logos', icon: '🖼️', path: '/admin/partners', desc: 'Add or remove scrolling logos' },
    { name: 'Client Security', icon: '🛡️', path: '/admin/clients', desc: 'Manage access and subscriptions' },
  ]

  return (
    <div>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 800, 
          color: '#fff', 
          letterSpacing: '-1px',
          marginBottom: 8,
          fontFamily: 'var(--font-poppins)'
        }}>
          EcoMate <span style={{ color: '#10b981' }}>Console</span>
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 15 }}>
          Welcome back to your master control center. Everything is running smoothly.
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 24,
        marginBottom: 48 
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 20,
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '20px',
              fontSize: 40,
              opacity: 0.1,
              filter: 'grayscale(1)'
            }}>{stat.icon}</div>
            
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{stat.value}</div>
            
            <div style={{ 
              width: 40, 
              height: 4, 
              background: stat.color, 
              borderRadius: 100,
              marginTop: 16,
              boxShadow: `0 0 10px ${stat.color}44`
            }} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 style={{ 
          fontSize: 18, 
          fontWeight: 700, 
          color: '#fff', 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          🚀 Quick Management
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 20 
        }}>
          {quickActions.map((action, i) => (
            <Link 
              key={i} 
              href={action.path}
              className="admin-quick-action"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                padding: '20px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              <style>{`
                .admin-quick-action:hover {
                  background: rgba(255, 255, 255, 0.05) !important;
                  transform: translateY(-2px);
                  border-color: rgba(16, 185, 129, 0.3) !important;
                }
              `}</style>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 12, 
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}>{action.icon}</div>
              
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{action.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>{action.desc}</div>
              </div>
              
              <div style={{ marginLeft: 'auto', fontSize: 18, opacity: 0.2 }}>→</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
