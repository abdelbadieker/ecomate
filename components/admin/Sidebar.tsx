'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const menuItems = [
  { name: 'Overview', icon: '📊', path: '/admin' },
  { name: 'Warehouse', icon: '📦', path: '/admin/warehouse' },
  { name: 'EcoTrack Queue', icon: '🚚', path: '/admin/queue' },
  { name: 'Agency CRM', icon: '👥', path: '/admin/clients' },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    window.location.href = '/'
  }

  return (
    <aside style={{
      width: 280,
      background: 'rgba(5, 10, 20, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 20px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 100
    }}>
      {/* Brand */}
      <div style={{ marginBottom: 48, padding: '0 12px' }}>
        <Link href="/admin" style={{ 
          fontSize: 22, 
          fontWeight: 800, 
          color: '#fff', 
          textDecoration: 'none',
          fontFamily: 'var(--font-poppins)',
          letterSpacing: '-0.5px'
        }}>
          Eco<span style={{ 
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Mate</span>
          <span style={{ 
            fontSize: 10, 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            padding: '2px 8px', 
            borderRadius: 100,
            marginLeft: 8,
            verticalAlign: 'middle',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: 700
          }}>ADMIN MODE</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link 
              key={item.path} 
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 12,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Profile & Logout */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: 24, 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px' }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14
          }}>
            {adminName[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{adminName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.3)' }}>Super Admin</div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.1)'
          }}
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
