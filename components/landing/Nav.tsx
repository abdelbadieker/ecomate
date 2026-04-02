'use client'
import { useState, useEffect, useTransition } from 'react'
import { Link, usePathname, useRouter } from '@/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale, useTranslations } from 'next-intl'
import { Menu, X, Globe, Moon, Sun, LayoutDashboard, LogIn, Rocket } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const isRtl = locale === 'ar'

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

  const toggleLocale = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar'
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  const t = useTranslations('Landing.Nav')

  const navLinks = [
    { name: t('features'), href: '#features' },
    { name: t('ai'), href: '#ai-section' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('howItWorks'), href: '#how' },
  ]

  return (
    <nav className={`
      fixed top-0 inset-x-0 z-[100] h-14 lg:h-16 px-6 lg:px-[8%]
      flex items-center justify-between
      border-b transition-all duration-300
      ${scrolled 
        ? 'bg-[var(--bg-section)]/80 backdrop-blur-xl border-[var(--border-c)]' 
        : 'bg-transparent border-transparent'}
    `}>
      {/* Logo */}
      <Link href="/" className="font-black text-xl lg:text-2xl font-poppins tracking-tighter z-[110]">
        <span className="bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">Eco</span>
        <span className="bg-gradient-to-br from-blue-500 to-emerald-500 bg-clip-text text-transparent">Mate</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-10">
        <ul className="flex items-center gap-8 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a 
                href={link.href} 
                className="text-sm font-medium text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="h-4 w-[1px] bg-[var(--border-c)] mx-2" />

        <div className="flex items-center gap-4">
          <button onClick={toggleLocale} className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all">
            <Globe className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            <span className="uppercase">{locale === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          
          <button onClick={toggleTheme} className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)]">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-105 transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-bold text-[var(--text-sub)] hover:text-[var(--text-main)]">
                {t('login')}
              </Link>
              <Link href="/auth/register" className="px-6 py-2.5 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                {t('register')} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toggle */}
      <div className="lg:hidden flex items-center gap-4 z-[110]">
        <button onClick={toggleLocale} className="text-xs font-black text-[var(--text-sub)] uppercase">
          {locale === 'ar' ? 'English' : 'العربية'}
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[var(--text-main)]"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-0 pt-20 px-6 bg-[var(--bg-body)] z-[100] lg:hidden flex flex-col gap-8"
          >
            <ul className="flex flex-col gap-6 list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-bold text-[var(--text-main)]"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="h-[1px] bg-[var(--border-c)] w-full" />

            <div className="flex flex-col gap-4">
              {user ? (
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-bold"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-[var(--border-c)] text-[var(--text-main)] font-bold"
                  >
                    <LogIn className="w-5 h-5" />
                    {t('login')}
                  </Link>
                  <Link 
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white font-black"
                  >
                    <Rocket className="w-5 h-5" />
                    {t('register')} →
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
