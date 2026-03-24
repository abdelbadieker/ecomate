'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const t = localStorage.getItem('em-theme') || 'dark'
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)

    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('em-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        height: 68, padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'var(--nav-scroll, rgba(7,16,31,.96))' : 'var(--nav-bg)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-c)',
        boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,.12)' : 'none',
        transition: 'background .3s, box-shadow .3s',
      }}
    >
      <Link href="/" style={{
        fontFamily: 'var(--font-poppins)',
        fontWeight: 800, fontSize: 22,
        background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Eco<span style={{
          background: 'linear-gradient(135deg,#2563eb,#10B981)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Mate</span>
      </Link>

      <ul style={{ display: 'flex', gap: 30, listStyle: 'none' }} className="nav-links">
        {['#features', '#ai-section', '#pricing', '#how', '#reviews'].map((href, i) => (
          <li key={i}>
            <a href={href} style={{
              fontSize: 14, fontWeight: 500,
              color: 'var(--text-sub)', transition: 'color .2s',
              textDecoration: 'none',
            }}>
              {['Features', 'AI System', 'Pricing', 'How It Works', 'Reviews'][i]}
            </a>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={toggleTheme} style={{
          width: 44, height: 24, borderRadius: 100, border: 'none',
          background: theme === 'dark' ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : 'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
          position: 'relative', cursor: 'pointer', flexShrink: 0,
        }}>
          <span style={{
            position: 'absolute', top: 3, left: theme === 'dark' ? 3 : 23,
            width: 18, height: 18, borderRadius: '50%',
            background: theme === 'dark' ? '#fff' : '#0F172A',
            transition: 'left .3s',
          }} />
        </button>

        {user ? (
          <Link href="/dashboard" className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
            Dashboard →
          </Link>
        ) : (
          <>
            <Link href="/auth/login" style={{
              fontSize: 13, fontWeight: 500, color: 'var(--text-sub)',
              background: 'var(--bg-card)', border: '1px solid var(--border-c)',
              borderRadius: 8, padding: '8px 18px', transition: 'all .2s', textDecoration: 'none',
            }}>
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
              Try It Now →
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
